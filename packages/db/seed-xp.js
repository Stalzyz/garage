const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany();
  if (students.length === 0) return console.log("No students found.");

  for (let i = 0; i < students.length; i++) {
    const xp = Math.floor(Math.random() * 500) + 100; // Random XP between 100 and 600
    await prisma.student.update({
      where: { id: students[i].id },
      data: { xp: i === 0 ? 850 : xp } // Give the first student a high score to guarantee 1st place
    });
  }

  console.log("Seeded XP for students!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
