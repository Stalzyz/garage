const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const companies = await prisma.placementCompany.count();
  const educators = await prisma.educator.count();
  const projects = await prisma.portfolioProject.count();
  const events = await prisma.campusEvent.count();
  const demos = await prisma.demoSession.count();
  const announcements = await prisma.announcement.count();
  const pages = await prisma.landingPage.count({ where: { slug: 'academy-home' } });

  console.log({
    companies,
    educators,
    projects,
    events,
    demos,
    announcements,
    academyHomePage: pages
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
