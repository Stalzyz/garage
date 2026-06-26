import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This script simulates a cron job that runs nightly to detect churned students
async function runChurnPrevention() {
  console.log("=========================================");
  console.log(" CRON: Running Churn Prevention Job...   ");
  console.log("=========================================");

  try {
    // 1. Find all active students who haven't logged in/progressed in 7 days
    // In a real app we would check `lastLoginAt` or `lastProgressAt`.
    // For this mock, we'll find students with 0 XP or those stuck on specific criteria.
    const atRiskStudents = await prisma.student.findMany({
      where: { xp: { lt: 20 }, isAlumni: false },
      include: {
        user: { select: { email: true, firstName: true } }
      }
    });

    console.log(`Found ${atRiskStudents.length} "At-Risk" students.`);

    // 2. Trigger re-engagement emails (mocking API call to Resend/SendGrid)
    for (const student of atRiskStudents) {
      console.log(`[EMAIL DISPATCHED] To: ${student.user.email}`);
      console.log(`   Subject: Hey ${student.user.firstName}, we miss you at Grekam Academy!`);
      console.log(`   Body: You haven't completed a lesson in a while. Here is a quick tip to help you pass the next quiz...`);
      console.log(`   Action: Automatically awarded +5 'Welcome Back' XP to incentivize login.\n`);

      // Give them 5 XP as an incentive
      await prisma.student.update({
        where: { id: student.id },
        data: { xp: { increment: 5 } }
      });
    }

    console.log("Cron job completed successfully.");
  } catch (error) {
    console.error("Cron job failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly via node
if (require.main === module) {
  runChurnPrevention();
}
