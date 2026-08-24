import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing financial and CRM dummy data...');

  // Delete all finance related data
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.expense.deleteMany({});
  
  // Delete all payroll data
  try {
    if ((prisma as any).payslip) await (prisma as any).payslip.deleteMany({});
    if ((prisma as any).payrollRun) await (prisma as any).payrollRun.deleteMany({});
  } catch (e) {}

  // Delete all subscription data
  if ((prisma as any).subscription) await (prisma as any).subscription.deleteMany({});
  if ((prisma as any).clientSubscription) await (prisma as any).clientSubscription.deleteMany({});

  // Delete other transactional data
  if ((prisma as any).billingMilestone) await (prisma as any).billingMilestone.deleteMany({});
  if ((prisma as any).billingSchedule) await (prisma as any).billingSchedule.deleteMany({});
  if ((prisma as any).timeLog) await (prisma as any).timeLog.deleteMany({});

  console.log('Dummy data cleared successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
