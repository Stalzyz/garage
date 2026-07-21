import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EventBus, SystemEvents } from '../automations/event-bus';
import { generateInvoicePDF } from './pdf.service';
import { paymentsService } from '../integrations/payments.service';
import { auditLog } from '../utils/audit';
import { sendEmail, EmailTemplates } from '../integrations/email.service';

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
  hsnCode: z.string().optional().nullable(),
});

const CreateInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1),
  projectId: z.string().optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional(),
  clientGst: z.string().optional(),
  businessUnit: z.enum(['AGENCY', 'ACADEMY']),
  dueDate: z.string().datetime(),
  currency: z.string().default('INR'),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.string().optional(),
  items: z.array(InvoiceItemSchema).min(1),
});

const UpdateInvoiceSchema = CreateInvoiceSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  paidAmount: z.number().nonnegative().optional(),
});

function calculateTaxesAndTotals(items: z.infer<typeof InvoiceItemSchema>[], clientGst?: string, orgGst?: string) {
  let subtotal = 0, cgst = 0, sgst = 0, igst = 0;
  
  const cleanClient = clientGst?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
  const cleanOrg = orgGst?.trim().toUpperCase().replace(/[^A-Z0-9]/g, '') || '';
  
  const clientStateCode = cleanClient.substring(0, 2);
  const orgStateCode = cleanOrg.substring(0, 2);
  
  const isInterstate = cleanClient.length >= 2 && cleanOrg.length >= 2 && clientStateCode !== orgStateCode;

  for (const item of items) {
    const itemSubtotal = item.quantity * item.unitPrice;
    subtotal += itemSubtotal;
    const taxAmount = itemSubtotal * (item.taxRate / 100);
    
    if (isInterstate) {
      igst += taxAmount;
    } else {
      cgst += taxAmount / 2;
      sgst += taxAmount / 2;
    }
  }
  return { subtotal, cgst, sgst, igst, totalAmount: subtotal + cgst + sgst + igst };
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
    const [invoice, org, financeSettings] = await Promise.all([
      app.prisma.invoice.findUnique({
        where: { id },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      }),
      app.prisma.organization.findFirst(),
      app.prisma.financeSettings.findFirst(),
    ]);

    if (!invoice) return reply.notFound('Invoice not found');

    const pdfBuffer = await generateInvoicePDF({
      invoice: { ...invoice, createdAt: invoice.createdAt.toISOString(), dueDate: invoice.dueDate.toISOString() },
      orgName: org?.name || 'Grekam OS',
      orgAddress: org?.billingAddress,
      orgLogoUrl: org?.logoUrl,
      gstNumber: financeSettings?.gstNumber,
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
    const totals = calculateTaxesAndTotals(body.items, body.clientGst, orgGst || undefined);
    const invoice = await app.prisma.invoice.create({
      data: {
        invoiceNumber: body.invoiceNumber,
        projectId: body.projectId,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        clientGst: body.clientGst,
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
            hsnCode: item.hsnCode,
            total: item.quantity * item.unitPrice * (1 + item.taxRate / 100),
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
        orgGst || undefined
      );
    }

    const invoice = await app.prisma.$transaction(async (tx) => {
      if (items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
        await tx.invoiceItem.createMany({
          data: items.map((item, index) => ({
            invoiceId: id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            hsnCode: item.hsnCode,
            total: item.quantity * item.unitPrice * (1 + item.taxRate / 100),
            sortOrder: index,
          })),
        });
      }
      return tx.invoice.update({
        where: { id },
        data: { ...rest, ...totals, ...(rest.dueDate && { dueDate: new Date(rest.dueDate) }) },
        include: { items: true },
      });
    });

    if (rest.status === 'PAID') {
      EventBus.emit(SystemEvents.INVOICE_PAID, {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        clientEmail: invoice.clientEmail,
        clientName: invoice.clientName,
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
    await app.prisma.invoice.delete({ where: { id } });
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

    // Get Razorpay keys
    const keyId = process.env.RAZORPAY_KEY_ID;
    const isLive = !!keyId && keyId !== 'rzp_test_mock';

    if (invoice.status === 'DRAFT') {
      await app.prisma.invoice.update({ where: { id }, data: { status: 'SENT' } });
    }

    if (isLive) {
      const res = await paymentsService.createRazorpayOrder(invoice.totalAmount, invoice.currency, invoice.invoiceNumber);
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
      }
    }

    const mockPaymentUrl = `https://rzp.io/i/mock_${id.slice(0, 6)}`;
    return { isLive: false, paymentUrl: mockPaymentUrl };
  });

  // POST /api/v1/finance/invoices/:id/mock-pay
  app.post('/invoices/:id/mock-pay', async (req, reply) => {
    const { id } = req.params as { id: string };
    const invoice = await app.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return reply.notFound('Invoice not found');
    if (invoice.status === 'PAID') return reply.badRequest('Invoice is already paid');

    const paymentId = 'pay_mock_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const [updatedInvoice] = await app.prisma.$transaction([
      app.prisma.invoice.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          paidAmount: invoice.totalAmount
        }
      }),
      app.prisma.payment.create({
        data: {
          invoiceId: id,
          amount: invoice.totalAmount,
          method: 'RAZORPAY',
          transactionId: paymentId,
          paidAt: new Date(),
          notes: 'Simulated payment via local Sandbox'
        }
      })
    ]);

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

    return { success: true, invoice: updatedInvoice };
  });
}
