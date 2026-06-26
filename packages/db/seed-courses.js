const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.course.count();
  if (count === 0) {
    console.log("Seeding LMS Courses...");
    const c1 = await prisma.course.create({
      data: {
        name: "Advanced UI/UX Design",
        code: "UIUX-101",
        description: "Master interface design and user experience research.",
        duration: "3 months",
        fee: 14999,
        isPublished: true,
        lmsCourse: {
          create: {
            thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
            outcomes: ["Figma Mastery", "Prototyping", "User Testing"],
            isPublished: true
          }
        }
      }
    });

    const c2 = await prisma.course.create({
      data: {
        name: "Full Stack Web Development",
        code: "FSW-201",
        description: "Learn Next.js, Node, and PostgreSQL from scratch.",
        duration: "6 months",
        fee: 29999,
        isPublished: true,
        lmsCourse: {
          create: {
            thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
            outcomes: ["React", "APIs", "Database Design"],
            isPublished: true
          }
        }
      }
    });
    console.log("Seeded", c1.code, c2.code);
  } else {
    console.log("Courses already exist:", count);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
