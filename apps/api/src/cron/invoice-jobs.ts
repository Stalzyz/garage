import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { EventBus, SystemEvents } from '../automations/event-bus';
import { scheduleAcademyJobs } from './academy-jobs';

const prisma = new PrismaClient();

/**
 * CRON JOB 1: Overdue Invoice Detection
 * Runs every day at 9:00 AM.
 * Finds invoices where dueDate has passed and status is still SENT or PARTIALLY_PAID.
 * Updates them to OVERDUE and fires the INVOICE_OVERDUE event (→ sends reminder email via Autopilot).
 */
function scheduleOverdueInvoiceJob() {
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running overdue invoice check...');
    try {
      const now = new Date();
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          dueDate: { lt: now },
          status: { in: ['SENT', 'VIEWED', 'PARTIALLY_PAID'] }
        }
      });

      for (const invoice of overdueInvoices) {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: 'OVERDUE' }
        });

        EventBus.emit(SystemEvents.INVOICE_OVERDUE, {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientEmail: invoice.clientEmail,
          clientName: invoice.clientName,
          amount: `${invoice.currency} ${invoice.totalAmount}`,
          dueDate: invoice.dueDate.toISOString(),
        });

        console.log(`[CRON] Marked invoice ${invoice.invoiceNumber} as OVERDUE`);
      }

      console.log(`[CRON] Overdue check complete. Processed ${overdueInvoices.length} invoices.`);
    } catch (err) {
      console.error('[CRON] Overdue invoice job failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });
}

/**
 * CRON JOB 2: Recurring Invoice Auto-Clone
 * Runs every day at 10:00 AM.
 * Finds PAID recurring invoices whose next billing cycle has arrived and auto-clones them.
 */
function scheduleRecurringInvoiceJob() {
  cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Running recurring invoice generation...');
    try {
      const paidRecurringInvoices = await prisma.invoice.findMany({
        where: { isRecurring: true, status: 'PAID' },
        include: { items: true }
      });

      for (const invoice of paidRecurringInvoices) {
        const lastPaidAt = invoice.updatedAt;
        const period = invoice.recurringPeriod || 'MONTHLY';
        const now = new Date();
        let nextDueDate = new Date(lastPaidAt);

        if (period === 'MONTHLY') nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        else if (period === 'QUARTERLY') nextDueDate.setMonth(nextDueDate.getMonth() + 3);
        else if (period === 'YEARLY') nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        else if (period === 'WEEKLY') nextDueDate.setDate(nextDueDate.getDate() + 7);

        // Only clone if the next billing date has arrived
        if (now >= nextDueDate) {
          const nextNumber = `${invoice.invoiceNumber}-R${Date.now()}`;

          const newInvoice = await prisma.invoice.create({
            data: {
              invoiceNumber: nextNumber,
              clientName: invoice.clientName,
              clientEmail: invoice.clientEmail,
              clientGst: invoice.clientGst,
              businessUnit: invoice.businessUnit,
              currency: invoice.currency,
              subtotal: invoice.subtotal,
              cgst: invoice.cgst,
              sgst: invoice.sgst,
              igst: invoice.igst,
              totalAmount: invoice.totalAmount,
              isRecurring: true,
              recurringPeriod: invoice.recurringPeriod,
              dueDate: nextDueDate,
              status: 'SENT',
              notes: `Auto-generated recurring invoice (original: ${invoice.invoiceNumber})`,
              items: {
                create: invoice.items.map((item: any, i: number) => ({
                  description: item.description,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  taxRate: item.taxRate,
                  total: item.total,
                  sortOrder: i,
                }))
              }
            }
          });

          EventBus.emit(SystemEvents.INVOICE_CREATED, {
            invoiceId: newInvoice.id,
            invoiceNumber: newInvoice.invoiceNumber,
            clientEmail: newInvoice.clientEmail,
            clientName: newInvoice.clientName,
            amount: `${newInvoice.currency} ${newInvoice.totalAmount}`,
          });

          console.log(`[CRON] Auto-created recurring invoice: ${nextNumber}`);
        }
      }
    } catch (err) {
      console.error('[CRON] Recurring invoice job failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });
}

export function startCronJobs() {
  scheduleOverdueInvoiceJob();
  scheduleRecurringInvoiceJob();
  scheduleAcademyJobs();
  console.log('[CRON] All scheduled jobs started ✓');
}
