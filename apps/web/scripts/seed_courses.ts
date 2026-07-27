import { PrismaClient } from "@grekam/db";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Course Curriculum test data...");

  // Create a Course
  const course = await prisma.course.upsert({
    where: { code: "UX-01" },
    update: {},
    create: {
      name: "UX/UI Design Masterclass",
      code: "UX-01",
      description: "Learn UX/UI from scratch to advanced.",
      duration: "3 months",
      fee: 29999,
      isPublished: true,
    }
  });

  // Create LMS Course
  const lmsCourse = await prisma.lMSCourse.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
      outcomes: ["Design Systems", "Prototyping", "User Research"],
      prerequisites: ["None"],
      isPublished: true,
      pricing: 29999,
      seoTitle: "UX/UI Design Masterclass",
      draftStatus: "PUBLISHED",
    }
  });

  // Create initial Modules and Lessons
  const module1 = await prisma.lMSModule.create({
    data: {
      lmsCourseId: lmsCourse.id,
      title: "Module 1: Introduction to UX",
      sortOrder: 0,
      lessons: {
        create: [
          { title: "What is UX Design?", type: "VIDEO", sortOrder: 0 },
          { title: "Design Thinking Process", type: "VIDEO", sortOrder: 1 },
          { title: "Intro Quiz", type: "QUIZ", sortOrder: 2 },
        ]
      }
    }
  });

  console.log(`✅ Seeded Course: ${course.name}`);
  console.log(`✅ Seeded LMSCourse with ID: ${lmsCourse.id}`);
  console.log(`✅ Seeded Module: ${module1.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
