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
    let company = await prisma.company.findFirst({
      where: { name: c.lastName }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: c.lastName,
          industry: 'Demo',
          website: `https://${c.lastName.toLowerCase()}.com`
        }
      });
    }

    // Create Contact
    let contact = await prisma.contact.findFirst({
      where: { email: c.email }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          companyId: company.id,
        }
      });
    } else if (contact.companyId !== company.id) {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: { companyId: company.id }
      });
    }

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
