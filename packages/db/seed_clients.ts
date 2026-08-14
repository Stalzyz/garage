import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo clients...');

  const passwordHash = await bcrypt.hash('demo1234', 10);

  const clients = [
    { email: "redbrick@client.com", firstName: "RedBrick", lastName: "Realty" },
    { email: "techflow@client.com", firstName: "Techflow", lastName: "SaaS" },
    { email: "fitburst@client.com", firstName: "Fitburst", lastName: "Gym" },
  ];

  for (const c of clients) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: { passwordHash, role: 'CLIENT', status: 'ACTIVE' },
      create: {
        email: c.email,
        passwordHash,
        role: 'CLIENT',
        status: 'ACTIVE',
        firstName: c.firstName,
        lastName: c.lastName,
      },
    });
    console.log(`✅ Created/Updated client: ${c.email}`);
  }

  console.log('🎉 Client seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
