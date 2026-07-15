const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const page = await prisma.landingPage.findUnique({
    where: { slug: 'agency' },
    include: { sections: { where: { sectionId: 'agency-main-data' } } }
  });
  console.log(JSON.stringify(page, null, 2));
}
main();
