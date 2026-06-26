const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mentor = await prisma.user.findFirst();
  if (!mentor) return console.log("No mentor found.");

  // Schedule for tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0); // 2:00 PM

  await prisma.officeHour.create({
    data: {
      title: "Portfolio Review & Career Advice",
      mentorId: mentor.id,
      meetLink: "https://meet.google.com/abc-defg-hij",
      scheduledFor: tomorrow
    }
  });

  console.log("Seeded Office Hours!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
