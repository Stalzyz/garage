const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst();
  const course = await prisma.course.findFirst();
  
  if (!student || !course) return console.log("Missing student or course.");

  await prisma.application.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      status: "SUBMITTED",
      statement: "I want to become a full stack developer.",
      portfolioUrl: "https://github.com/my-portfolio"
    }
  });

  console.log("Seeded Application!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
