import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const passwordHash = await bcrypt.hash('Medusa09@', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@grekam.in' },
    update: {
      passwordHash,
    },
    create: {
      email: 'admin@grekam.in',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      firstName: 'Stalin',
      lastName: 'Kumar',
    },
  });
  console.log('✅ Created User:', user.email);

  // 2. Create some demo CRM Leads
  const lead1 = await prisma.lead.create({
    data: {
      name: 'John Doe',
      email: 'john@nexushealth.com',
      company: 'Nexus Health',
      source: 'WEBSITE',
      status: 'NEW',
      estimatedBudget: 45000,
      projectType: 'Website & Branding',
      score: 65,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      name: 'Sarah Smith',
      email: 'sarah@peakperformance.io',
      company: 'Peak Performance',
      source: 'LINKEDIN',
      status: 'PROPOSAL_SENT',
      estimatedBudget: 120000,
      projectType: 'VFX Showreel',
      score: 85,
    },
  });
  console.log('✅ Created Leads:', lead1.company, lead2.company);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
