const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst();
  if (!course) return console.log("No course found.");

  const quiz = await prisma.quiz.create({
    data: {
      courseId: course.id,
      title: "Foundations of UI Design",
      description: "Test your knowledge on color theory, typography, and spacing.",
      passingScore: 66
    }
  });

  await prisma.quizQuestion.createMany({
    data: [
      {
        quizId: quiz.id,
        questionText: "What is the primary purpose of 'whitespace' in UI design?",
        options: ["To save ink when printing", "To reduce cognitive load and organize content", "To make the file size smaller", "Because white is a primary color"],
        correctOption: 1,
        explanation: "Whitespace (or negative space) is crucial for preventing visual clutter and guiding the user's eye."
      },
      {
        quizId: quiz.id,
        questionText: "Which color model is used for digital screens?",
        options: ["CMYK", "Pantone", "RGB", "RYB"],
        correctOption: 2,
        explanation: "Digital screens emit light using Red, Green, and Blue (RGB) pixels."
      },
      {
        quizId: quiz.id,
        questionText: "What does 'accessibility' (a11y) mean in web design?",
        options: ["Making the site load fast on 3G networks", "Making the site usable by people with disabilities", "Ensuring the code is open source", "Making it easy for search engines to crawl"],
        correctOption: 1,
        explanation: "Accessibility ensures your product can be used by everyone, including those with visual, motor, or cognitive impairments."
      }
    ]
  });

  console.log("Seeded Quiz! ID: " + quiz.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
