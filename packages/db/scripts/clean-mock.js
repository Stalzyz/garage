const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const delSubs = await prisma.subscription.deleteMany({
    where: {
      OR: [
        { id: { startsWith: 'SUB-00' } },
        { company: { name: { in: ['Techflow SaaS', 'Fitburst Gym', 'RedBrick Realty', 'Apex Consulting', 'Zephyr Labs'] } } }
      ]
    }
  });
  console.log('Deleted mock subscriptions:', delSubs.count);

  const delCompanies = await prisma.company.deleteMany({
    where: {
      name: { in: ['Techflow SaaS', 'Fitburst Gym', 'RedBrick Realty', 'Apex Consulting', 'Zephyr Labs'] }
    }
  });
  console.log('Deleted mock companies:', delCompanies.count);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
