const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assignment = await prisma.assignment.create({
    data: {
      title: "Build a SAAS Landing Page",
      brief: "Create a high-converting landing page for a fictional AI startup. You must use Next.js, Tailwind CSS, and Framer Motion.",
      dueDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000)
    }
  });
  console.log("ASSIGNMENT_ID=" + assignment.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
