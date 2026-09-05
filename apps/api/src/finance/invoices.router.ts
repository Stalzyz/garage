import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EventBus, SystemEvents } from '../automations/event-bus';

// Helper to evaluate multi-role commission plan:
// 1. Referral Partner (5%)
// 2. Sales & Closing (7% - 10% based on deal size)
// 3. Project Manager (2% - 3% based on project size)
// Net Base Amount = invoice.subtotal (ex-GST)
// Single Person Cap = Max 15% combined if the same person holds all 3 roles
async function processCommission(app: FastifyInstance, invoice: any) {
  if (!invoice.clientEmail) return;

  // Find lead associated with client email
  const lead = await app.prisma.lead.findFirst({
    where: { email: invoice.clientEmail },
    orderBy: { createdAt: 'desc' }
  });

  if (!lead) return;

  // Check if commissions have already been processed for this invoice
  const existingCommissions = await app.prisma.commission.findMany({
    where: { invoiceId: invoice.id }
  });

  if (existingCommissions.length > 0) {
    // If invoice turned to PAID, update status of pending Referral/Sales commissions to APPROVED
    if (invoice.status === 'PAID') {
      await app.prisma.commission.updateMany({
        where: { invoiceId: invoice.id, status: 'PENDING', role: { in: ['REFERRAL', 'SALES'] } },
        data: { status: 'APPROVED' }
      });
    }
    return;
  }

  // Calculate Net Service Value (ex-GST invoice subtotal)
  const netBaseAmount = invoice.subtotal || (invoice.totalAmount - (invoice.cgst + invoice.sgst + invoice.igst)) || invoice.totalAmount;

  // Role Assignments
  const referralPartnerId = lead.referredById;
  const salesRepId = lead.assignedToId;
  const projectManagerId = lead.projectManagerId;

  // Calculate Rates
  let referralRate = referralPartnerId ? 5.0 : 0;

  let salesRate = 0;
  if (salesRepId) {
    if (netBaseAmount >= 250000) salesRate = 10.0;
    else if (netBaseAmount >= 100000) salesRate = 9.0;
    else if (netBaseAmount >= 50000) salesRate = 8.0;
    else if (netBaseAmount >= 10000) salesRate = 7.0;
    else salesRate = 5.0; // fallback micro deal rate
  }

  let pmRate = 0;
  if (projectManagerId) {
    if (netBaseAmount >= 250000) pmRate = 3.0;
    else if (netBaseAmount >= 50000) pmRate = 2.5;
    else pmRate = 2.0;
  }

  // Single-Person Cap Rule (Max 15% if 1 person holds all 3 roles)
  const isSoloOperator = referralPartnerId && salesRepId && projectManagerId &&
    (referralPartnerId === salesRepId && salesRepId === projectManagerId);

  if (isSoloOperator) {
    const rawTotal = referralRate + salesRate + pmRate;
    if (rawTotal > 15.0) {
      const scale = 15.0 / rawTotal;
      referralRate = Math.round(referralRate * scale * 10) / 10;
      salesRate = Math.round(salesRate * scale * 10) / 10;
      pmRate = Math.round(pmRate * scale * 10) / 10;
    }
  }

  // Create Commission Records
  const newCommissions: any[] = [];

  if (referralPartnerId && referralRate > 0) {
    const amount = Math.round(netBaseAmount * (referralRate / 100));
    newCommissions.push({
      employeeId: referralPartnerId,
      leadId: lead.id,
      invoiceId: invoice.id,
      role: 'REFERRAL',
      ratePercentage: referralRate,
      netBaseAmount,
      amount,
      status: invoice.status === 'PAID' ? 'APPROVED' : 'PENDING',
      notes: `Referral Partner (${referralRate}%) for Invoice #${invoice.invoiceNumber}`
    });
  }

  if (salesRepId && salesRate > 0) {
    const amount = Math.round(netBaseAmount * (salesRate / 100));
    newCommissions.push({
      employeeId: salesRepId,
      leadId: lead.id,
      invoiceId: invoice.id,
      role: 'SALES',
      ratePercentage: salesRate,
      netBaseAmount,
      amount,
      status: invoice.status === 'PAID' ? 'APPROVED' : 'PENDING',
      notes: `Sales & Closing (${salesRate}%) for Invoice #${invoice.invoiceNumber}`
    });
  }

  if (projectManagerId && pmRate > 0) {
    const amount = Math.round(netBaseAmount * (pmRate / 100));
    newCommissions.push({
      employeeId: projectManagerId,
      leadId: lead.id,
      invoiceId: invoice.id,
      role: 'PROJECT_MANAGER',
      ratePercentage: pmRate,
      netBaseAmount,
      amount,
      status: 'PENDING', // PM commission approved after project completion
      notes: `Project Management (${pmRate}%) for Invoice #${invoice.invoiceNumber}`
    });
  }

  for (const c of newCommissions) {
    await app.prisma.commission.create({ data: c });
  }

  if (newCommissions.length > 0) {
    app.log.info(`[Commissions] Created ${newCommissions.length} commission entries for Invoice #${invoice.invoiceNumber}`);
  }
}
import { generateInvoicePDF } from './pdf.service';
import { paymentsService } from '../integrations/payments.service';
import { auditLog } from '../utils/audit';
import { sendEmail, EmailTemplates } from '../integrations/email.service';
import { decrypt } from '../settings/integrations.router';

// ─── CSV helpers ──────────────────────────────────────────────────────────────
function toCsv(rows: Record<string, any>[], headers: string[]): string {
  const headerRow = headers.join(',');
  const dataRows = rows.map(r =>
    headers.map(h => {
      const val = r[h] ?? '';
      return typeof val === 'string' && (val.includes(',') || val.includes('"'))
        ? `"${val.replace(/"/g, '""')}"` : String(val);
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

const InvoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100).default(18),
  discountRate: z.number().min(0).max(100).default(0),
  hsnCode: z.string().optional().nullable(),
});

const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  projectId: z.string().optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional().or(z.literal('')),
  clientGst: z.string().optional().or(z.literal('')),
  businessUnit: z.enum(['AGENCY', 'ACADEMY']),
  dueDate: z.string().datetime(),
  currency: z.string().default('INR'),
  notes: z.string().optional(),
  discountRate: z.number().min(0).max(100).default(0),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1),
});

const UpdateInvoiceSchema = CreateInvoiceSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  paidAmount: z.number().nonnegative().optional(),
});

function calculateTaxesAndTotals(items: z.infer<typeof InvoiceItemSchema>[], clientGst?: string, orgGst?: string, overallDiscountRate: number = 0) {
  let subtotal = 0, cgst = 0, sgst = 0, igst = 0;
  
  const cleanClient = clientGst?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
  const cleanOrg = orgGst?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
  
  const clientStateCode = cleanClient.substring(0, 2);
  const orgStateCode = cleanOrg.substring(0, 2);
  
  const isInterstate = cleanClient.length >= 2 && cleanOrg.length >= 2 && clientStateCode !== orgStateCode;

  for (const item of items) {
    const baseSubtotal = item.quantity * item.unitPrice;
    const itemDiscount = baseSubtotal * ((item.discountRate || 0) / 100);
    const itemSubtotal = baseSubtotal - itemDiscount;
    subtotal += itemSubtotal;
    
    // Proportional overall discount on this item
    const finalItemTaxable = itemSubtotal * (1 - overallDiscountRate / 100);
    const taxAmount = finalItemTaxable * ((item.taxRate || 0) / 100);
    
    if (isInterstate) {
      igst += taxAmount;
    } else {
      cgst += taxAmount / 2;
      sgst += taxAmount / 2;
    }
  }
  
  const taxableAmount = subtotal * (1 - overallDiscountRate / 100);
  return { subtotal, cgst, sgst, igst, totalAmount: taxableAmount + cgst + sgst + igst, discountRate: overallDiscountRate };
}

export default async function invoicesRouter(app: FastifyInstance) {
  // GET /api/v1/finance/invoices
  app.get('/invoices', async (req, reply) => {
    const { status, businessUnit } = req.query as { status?: string; businessUnit?: string };
    const invoices = await app.prisma.invoice.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(businessUnit && { businessUnit: businessUnit as any }),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return { data: invoices, total: invoices.length };
  });

  // GET /api/v1/finance/invoices/:id
  app.get('/invoices/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const invoice = await app.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });
    if (!invoice) return reply.notFound('Invoice not found');
    return invoice;
  });

  // GET /api/v1/finance/invoices/:id/pdf  — Download as PDF
  app.get('/invoices/:id/pdf', async (req, reply) => {
    const { id } = req.params as { id: string };
    const [invoice, financeSettings] = await Promise.all([
      app.prisma.invoice.findUnique({
        where: { id },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      }),
      app.prisma.financeSettings.findFirst(),
    ]);

    if (!invoice) return reply.notFound('Invoice not found');
    
    // Dynamically import to avoid circular issues or top-level await issues
    const { getBrandConfig } = await import('../utils/brand');
    const brandType = invoice.businessUnit === 'ACADEMY' ? 'ACADEMY' : 'AGENCY';
    const brand = await getBrandConfig(app, brandType);

    const pdfBuffer = await generateInvoicePDF({
      brand,
      invoice: { 
        ...invoice, 
        businessUnit: invoice.businessUnit,
        createdAt: invoice.createdAt.toISOString(), 
        dueDate: invoice.dueDate.toISOString(), 
        paidAmount: invoice.paidAmount,
        currency: financeSettings?.currencySymbol || invoice.currency 
      }
    });

    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
    return reply.send(pdfBuffer);
  });

  // GET /api/v1/finance/invoices/export.csv
  app.get('/invoices/export.csv', async (req, reply) => {
    const invoices = await app.prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } });
    const headers = ['invoiceNumber', 'clientName', 'clientEmail', 'status', 'totalAmount', 'currency', 'dueDate', 'createdAt'];
    const csv = toCsv(invoices.map(i => ({
      ...i,
      totalAmount: i.totalAmount,
      dueDate: i.dueDate.toISOString().split('T')[0],
      createdAt: i.createdAt.toISOString().split('T')[0],
    })), headers);
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', 'attachment; filename="invoices.csv"');
    return reply.send(csv);
  });

  // POST /api/v1/finance/invoices
  app.post('/invoices', async (req, reply) => {
    const body = CreateInvoiceSchema.parse(req.body);
    const orgSettings = await app.prisma.financeSettings.findFirst();
    const orgGst = orgSettings?.gstNumber;
    const totals = calculateTaxesAndTotals(body.items, body.clientGst, orgGst || undefined, body.discountRate);
    const invoice = await app.prisma.invoice.create({
      data: {
        invoiceNumber: body.invoiceNumber,
        projectId: body.projectId,
        clientName: body.clientName,
        clientEmail: body.clientEmail || null,
        clientGst: body.clientGst || null,
        businessUnit: body.businessUnit,
        dueDate: new Date(body.dueDate),
        currency: body.currency,
        notes: body.notes,
        isRecurring: body.isRecurring,
        recurringPeriod: body.recurringPeriod,
        ...totals,
        items: {
          create: body.items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discountRate: item.discountRate || 0,
            hsnCode: item.hsnCode,
            total: (item.quantity * item.unitPrice * (1 - (item.discountRate || 0) / 100)) * (1 - body.discountRate / 100) * (1 + item.taxRate / 100),
            sortOrder: index,
          })),
        },
      },
      include: { items: true },
    });
    reply.code(201);

    // Emit event & audit log
    EventBus.emit(SystemEvents.INVOICE_CREATED, {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientEmail: invoice.clientEmail,
      clientName: invoice.clientName,
      amount: `${invoice.currency} ${invoice.totalAmount}`,
    });
    await auditLog(app.prisma as any, req, 'CREATE', 'Invoice', invoice.id, { invoiceNumber: invoice.invoiceNumber });
    try {
      await processCommission(app, invoice);
    } catch (err) {
      app.log.error(err, 'Failed to process commission on invoice creation');
    }

    return invoice;
  });

  // PATCH /api/v1/finance/invoices/:id
  app.patch('/invoices/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const originalInvoice = await app.prisma.invoice.findUnique({ where: { id } });
    if (!originalInvoice) return reply.notFound('Invoice not found');

    const body = UpdateInvoiceSchema.parse(req.body);
    const { items, ...rest } = body;
    let totals: any;
    if (items) {
      const orgSettings = await app.prisma.financeSettings.findFirst();
      const orgGst = orgSettings?.gstNumber;
      totals = calculateTaxesAndTotals(
        items,
        body.clientGst ?? originalInvoice.clientGst ?? undefined,
        orgGst || undefined,
        body.discountRate !== undefined ? body.discountRate : originalInvoice.discountRate
      );
    }

    const invoice = await app.prisma.$transaction(async (tx) => {
      if (items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
        await tx.invoiceItem.createMany({
          data: items.map((item, index) => {
            const overallDiscount = body.discountRate !== undefined ? body.discountRate : originalInvoice.discountRate;
            return {
              invoiceId: id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              discountRate: item.discountRate || 0,
              hsnCode: item.hsnCode,
              total: (item.quantity * item.unitPrice * (1 - (item.discountRate || 0) / 100)) * (1 - overallDiscount / 100) * (1 + item.taxRate / 100),
              sortOrder: index,
            };
          }),
        });
      }
      return tx.invoice.update({
        where: { id },
        data: { ...rest, ...totals, ...(rest.dueDate && { dueDate: new Date(rest.dueDate) }) },
        include: { items: true },
      });
    });

    if (rest.status === 'PAID') {
      let clientPhone: string | undefined = undefined;
      if (invoice.clientEmail) {
        const contact = await app.prisma.contact.findFirst({
          where: { email: invoice.clientEmail }
        });
        clientPhone = contact?.whatsapp || contact?.phone || undefined;
      }
      EventBus.emit(SystemEvents.INVOICE_PAID, {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientEmail: invoice.clientEmail,
        clientName: invoice.clientName,
        clientPhone,
        amount: `${invoice.currency} ${invoice.totalAmount}`,
      });
    }

    await auditLog(app.prisma as any, req, 'UPDATE', 'Invoice', invoice.id, { status: invoice.status });

    return invoice;
  });

  // DELETE /api/v1/finance/invoices/:id
  app.delete('/invoices/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const invoice = await app.prisma.invoice.findUnique({ where: { id }, select: { invoiceNumber: true } });
    if (!invoice) return reply.notFound('Invoice not found');

    await app.prisma.$transaction([
      app.prisma.payment.deleteMany({ where: { invoiceId: id } }),
      app.prisma.commission.deleteMany({ where: { invoiceId: id } }),
      app.prisma.invoice.delete({ where: { id } })
    ]);

    await auditLog(app.prisma as any, req, 'DELETE', 'Invoice', id, { invoiceNumber: invoice?.invoiceNumber });
    reply.code(204);
  });

  // POST /api/v1/finance/invoices/:id/send
  app.post('/invoices/:id/send', async (req, reply) => {
    const { id } = req.params as { id: string };
    const invoice = await app.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return reply.notFound('Invoice not found');
    
    if (!invoice.clientEmail) {
      return reply.badRequest('Client email is missing');
    }

    const template = EmailTemplates.invoiceDue(
      invoice.clientName, 
      invoice.invoiceNumber, 
      invoice.totalAmount, 
      invoice.dueDate.toLocaleDateString()
    );

    const result = await sendEmail(invoice.clientEmail, template);
    
    const updatedInvoice = await app.prisma.invoice.update({
      where: { id },
      data: { status: 'SENT' },
      include: { items: true }
    });

    await auditLog(app.prisma as any, req, 'UPDATE', 'Invoice', id, { status: 'SENT', emailSent: true });

    return { success: true, invoice: updatedInvoice, previewUrl: result.previewUrl };
  });

  // POST /api/v1/finance/invoices/:id/pay
  app.post('/invoices/:id/pay', async (req, reply) => {
    const { id } = req.params as { id: string };
    const invoice = await app.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return reply.notFound('Invoice not found');
    if (invoice.status === 'PAID') return reply.badRequest('Invoice is already paid');

    // Get Razorpay keys from IntegrationKey database store or environment variables
    const integrationKeys = await app.prisma.integrationKey.findMany({
      where: { service: 'RAZORPAY', isActive: true }
    });

    let keyId = process.env.RAZORPAY_KEY_ID;
    let keySecret = process.env.RAZORPAY_KEY_SECRET;

    for (const k of integrationKeys) {
      if (k.keyName === 'RAZORPAY_KEY_ID') {
        const val = decrypt(k.encryptedValue);
        if (val && !val.includes('***')) keyId = val;
      }
      if (k.keyName === 'RAZORPAY_KEY_SECRET') {
        const val = decrypt(k.encryptedValue);
        if (val && !val.includes('***')) keySecret = val;
      }
    }

    const isLive = !!keyId && keyId.startsWith('rzp_') && keyId !== 'rzp_test_mock';

    if (invoice.status === 'DRAFT') {
      await app.prisma.invoice.update({ where: { id }, data: { status: 'SENT' } });
    }

    if (isLive) {
      const remainingAmount = invoice.totalAmount - (invoice.paidAmount || 0);
      const res = await paymentsService.createRazorpayOrder(
        remainingAmount, 
        invoice.currency, 
        invoice.invoiceNumber,
        keyId && keySecret ? { keyId, keySecret } : undefined
      );
      if (res.success && res.order) {
        return {
          isLive: true,
          orderId: res.order.id,
          amount: res.order.amount,
          currency: res.order.currency,
          keyId: keyId,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail
        };
      } else {
        app.log.error({ error: res.error }, 'Razorpay order creation failed');
        return reply.badRequest(`Razorpay payment initiation failed: ${res.error || 'Unknown error'}`);
      }
    }

    const mockPaymentUrl = `https://rzp.io/i/mock_${id.slice(0, 6)}`;
    return { isLive: false, paymentUrl: mockPaymentUrl };
  });

  // POST /api/v1/finance/invoices/:id/payments
  app.post('/invoices/:id/payments', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { amount, method, transactionId, notes } = req.body as { amount: number, method: string, transactionId?: string, notes?: string };
    
    const invoice = await app.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return reply.notFound('Invoice not found');
    
    if (amount <= 0) return reply.badRequest('Amount must be positive');
    
    const newPaidAmount = invoice.paidAmount + amount;
    const isFullyPaid = newPaidAmount >= invoice.totalAmount;

    const [payment, updatedInvoice] = await app.prisma.$transaction(async (tx) => {
      const pm = await tx.payment.create({
        data: {
          invoiceId: id,
          amount,
          method,
          transactionId,
          notes,
          paidAt: new Date(),
        }
      });

      const inv = await tx.invoice.update({
        where: { id },
        data: {
          paidAmount: newPaidAmount,
          status: isFullyPaid ? 'PAID' : 'PARTIALLY_PAID'
        }
      });

      // Update milestone status if applicable
      const milestone = await tx.billingMilestone.findFirst({
        where: { invoiceId: id }
      });
      if (milestone) {
        await tx.billingMilestone.update({
          where: { id: milestone.id },
          data: { status: isFullyPaid ? 'PAID' : 'INVOICED' }
        });
      }

      return [pm, inv] as const;
    });

    // Send email notification to client
    if (updatedInvoice.clientEmail) {
      try {
        const receiptTemplate = EmailTemplates.invoiceDue(
          updatedInvoice.clientName,
          updatedInvoice.invoiceNumber,
          amount,
          new Date().toLocaleDateString()
        );
        await sendEmail(updatedInvoice.clientEmail, {
          ...receiptTemplate,
          subject: `Payment Receipt: ${updatedInvoice.invoiceNumber} — Thank you!`,
          html: receiptTemplate.html?.replace('Payment Due', 'Payment Received — Thank You!') || receiptTemplate.html,
        } as any);
      } catch (emailErr) {
        app.log.warn({ emailErr }, 'Failed to send manual payment receipt email');
      }
    }

    if (updatedInvoice.status === 'PAID') {
      try {
        await processCommission(app, updatedInvoice);
      } catch (err) {
        app.log.error(err, 'Failed to process commission');
      }
    }

    return { success: true, payment, invoice: updatedInvoice };
  });

  // POST /api/v1/finance/invoices/:id/mock-pay
  app.post('/invoices/:id/mock-pay', async (req, reply) => {
    const { id } = req.params as { id: string };
    const invoice = await app.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return reply.notFound('Invoice not found');
    if (invoice.status === 'PAID') return reply.badRequest('Invoice is already paid');

    const remainingAmount = invoice.totalAmount - (invoice.paidAmount || 0);
    const paymentId = 'pay_mock_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const [updatedInvoice] = await app.prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAmount: invoice.totalAmount
        }
      });

      await tx.payment.create({
        data: {
          invoiceId: id,
          amount: remainingAmount,
          method: 'CREDIT_CARD',
          transactionId: paymentId,
          notes: 'Mock payment',
          paidAt: new Date(),
        }
      });

      const milestone = await tx.billingMilestone.findFirst({
        where: { invoiceId: id }
      });
      if (milestone) {
        await tx.billingMilestone.update({
          where: { id: milestone.id },
          data: { status: 'PAID' }
        });
      }

      return [inv] as const;
    });

    try {
      (app as any).broadcast('telemetry-event', {
        event: 'Payment Received',
        data: {
          id: updatedInvoice.id,
          invoiceNumber: updatedInvoice.invoiceNumber,
          amount: updatedInvoice.totalAmount,
          clientName: updatedInvoice.clientName
        }
      });
    } catch {}

    try {
      await processCommission(app, updatedInvoice);
    } catch (err) {
      app.log.error(err, 'Failed to process commission on mock-pay');
    }

    return { success: true, invoice: updatedInvoice };
  });
}
