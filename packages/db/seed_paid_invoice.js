const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-TEST-002',
      clientName: 'Test Client 2',
      clientEmail: 'test2@example.com',
      businessUnit: 'AGENCY',
      subtotal: 1000,
      totalAmount: 1000,
      paidAmount: 1000,
      status: 'PAID',
      dueDate: new Date(),
    }
  });
  console.log('Created invoice:', invoice.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
