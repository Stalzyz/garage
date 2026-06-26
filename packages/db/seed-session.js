const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const batch = await prisma.batch.findFirst();
  if (!batch) return console.log("No batch found.");

  const session = await prisma.batchSession.create({
    data: {
      batchId: batch.id,
      title: "Introduction to the Platform & Cohort Welcome",
      startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // tomorrow
      endTime: new Date(new Date().getTime() + 25 * 60 * 60 * 1000),
      meetLink: "https://zoom.us/j/1234567890"
    }
  });

  const pastSession = await prisma.batchSession.create({
    data: {
      batchId: batch.id,
      title: "Orientation Call",
      startTime: new Date(new Date().getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(new Date().getTime() - 47 * 60 * 60 * 1000),
      recordingUrl: "https://vimeo.com/123456"
    }
  });

  console.log("Seeded sessions!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
