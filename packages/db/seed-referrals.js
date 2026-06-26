const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({ take: 3, include: { user: true } });
  if (students.length < 2) return console.log("Not enough students to seed referrals.");

  const referrer = students[0];
  const referred1 = students[1];
  const referred2 = students[2];

  // Make sure referrer has a code
  await prisma.student.update({
    where: { id: referrer.id },
    data: { referralCode: `GREKAM-${referrer.user.firstName.toUpperCase()}-123` }
  });

  await prisma.referral.createMany({
    data: [
      {
        referrerId: referrer.id,
        referredUserId: referred1.id,
        status: "PAID",
        commissionAmt: 75.00
      },
      {
        referrerId: referrer.id,
        referredUserId: referred2.id,
        status: "CONVERTED",
        commissionAmt: 75.00
      }
    ]
  });

  console.log("Seeded Referrals!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
