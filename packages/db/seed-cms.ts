import { PrismaClient } from '@grekam/db';
const prisma = new PrismaClient();

async function main() {
  const agency = await prisma.landingPage.upsert({
    where: { slug: 'agency' },
    update: {},
    create: { slug: 'agency', title: 'Agency Website', description: 'The main Grekam Visuals agency page' }
  });

  const academy = await prisma.landingPage.upsert({
    where: { slug: 'academy' },
    update: {},
    create: { slug: 'academy', title: 'Academy Website', description: 'The Grekam Academy learning platform' }
  });

  console.log('CMS Pages Seeded:', agency.slug, academy.slug);
}
main().catch(console.error).finally(() => prisma.$disconnect());
