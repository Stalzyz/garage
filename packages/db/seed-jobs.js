const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.jobPosting.create({
    data: {
      title: "Junior UI/UX Designer",
      description: "We are looking for a talented designer to join our core product team. You will be responsible for creating wireframes, prototypes, and high-fidelity designs for our web applications.",
      requirements: ["Figma", "Design Systems", "Prototyping", "Attention to detail"],
      status: "OPEN",
      isPublicForStudents: true
    }
  });

  await prisma.jobPosting.create({
    data: {
      title: "Frontend Developer Intern",
      description: "Join us for a 3-month paid internship where you will work with React, Next.js, and Tailwind CSS to build modern user interfaces.",
      requirements: ["React", "TypeScript", "TailwindCSS"],
      status: "OPEN",
      isPublicForStudents: true
    }
  });

  console.log("Seeded Jobs!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
