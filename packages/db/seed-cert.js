const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst();
  const course = await prisma.course.findFirst();
  
  if (!student || !course) return console.log("Missing student or course.");

  const certId = `GRK-26-` + Math.random().toString(36).substring(2, 7).toUpperCase();

  const cert = await prisma.certificate.create({
    data: {
      certificateId: certId,
      studentId: student.id,
      courseId: course.id,
      grade: "Distinction"
    }
  });

  console.log("CERTIFICATE_ID=" + cert.certificateId);
}
main().catch(console.error).finally(() => prisma.$disconnect());
