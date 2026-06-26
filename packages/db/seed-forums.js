const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const author = await prisma.user.findFirst();
  if (!author) return console.log("No user found.");

  const cat1 = await prisma.forumCategory.create({
    data: { name: "Announcements", color: "bg-red-500", description: "Official Academy updates." }
  });

  const cat2 = await prisma.forumCategory.create({
    data: { name: "UI/UX Design", color: "bg-purple-500", description: "Design discussions." }
  });

  const cat3 = await prisma.forumCategory.create({
    data: { name: "Development Help", color: "bg-blue-500", description: "Code debugging." }
  });

  await prisma.forumPost.create({
    data: {
      categoryId: cat1.id,
      authorId: author.id,
      title: "Welcome to the new Cohort!",
      content: "Please introduce yourselves below. We are excited to have you in the Grekam Academy.",
      isPinned: true,
      upvotes: 42
    }
  });

  console.log("Seeded Forums!");
}
main().catch(console.error).finally(() => prisma.$disconnect());
