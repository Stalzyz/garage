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
    const user = await prisma.user.upsert({
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

    // Create Company
    const company = await prisma.company.upsert({
      where: { name: c.lastName },
      update: {},
      create: {
        name: c.lastName,
        industry: 'Demo',
        website: `https://${c.lastName.toLowerCase()}.com`
      }
    });

    // Create Contact
    const contact = await prisma.contact.upsert({
      where: { email: c.email },
      update: { companyId: company.id },
      create: {
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        companyId: company.id,
      }
    });

    // Create Client Profile
    await prisma.clientProfile.upsert({
      where: { userId: user.id },
      update: { contactId: contact.id },
      create: {
        userId: user.id,
        contactId: contact.id,
      }
    });

    console.log(`✅ Created/Updated client and linked profile: ${c.email}`);
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
