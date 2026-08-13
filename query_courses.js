const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    select: { id: true, name: true, isPublished: true }
  });
  console.log(courses);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
