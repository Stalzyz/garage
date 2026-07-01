import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Starting payment reminders cron...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const pendingMilestones = await prisma.billingMilestone.findMany({
    where: {
      status: 'INVOICED',
      dueDate: {
        not: null
      }
    },
    include: {
      invoice: true,
      schedule: {
        include: {
          project: {
            include: { company: true }
          }
        }
      }
    }
  });

  for (const m of pendingMilestones) {
    if (!m.dueDate) continue;
    
    const dueDate = new Date(m.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 3) {
      console.log(`[REMINDER] Sending 3-day reminder for company "${m.schedule.project.company?.name}" for milestone "${m.name}" (Amount: ${m.amount}). Due Date: ${dueDate.toLocaleDateString()}`);
      // Real app: Send Email logic here
    } else if (diffDays < 0) {
      console.log(`[OVERDUE] Sending overdue notice for company "${m.schedule.project.company?.name}" for milestone "${m.name}" (Amount: ${m.amount}). Was due on: ${dueDate.toLocaleDateString()}`);
      // Real app: Send Email logic here
    }
  }

  console.log('Payment reminders cron finished.');
}

run()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
