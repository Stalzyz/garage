const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({ take: 3 });
  if (students.length === 0) return console.log("No students found.");

  for (let s of students) {
    await prisma.student.update({
      where: { id: s.id },
      data: { isAlumni: true, graduatedAt: new Date(), portfolio: "https://dribbble.com/mock-portfolio" }
    });
  }

  console.log("Seeded Alumni!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
