import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding Phase 3 Data...");

  // Employees
  const employeeCount = await prisma.employee.count();
  if (employeeCount === 0) {
    // Need a user first
    let hrUser = await prisma.user.findUnique({ where: { email: "hr@visualspro.com" } });
    if (!hrUser) {
      hrUser = await prisma.user.create({
        data: {
          email: "hr@visualspro.com",
          role: "SUPER_ADMIN",
          passwordHash: "dummyhash",
          firstName: "HR",
          lastName: "Admin"
        }
      });
    }

    let devUser = await prisma.user.findUnique({ where: { email: "dev@visualspro.com" } });
    if (!devUser) {
      devUser = await prisma.user.create({
        data: {
          email: "dev@visualspro.com",
          role: "STAFF",
          passwordHash: "dummyhash",
          firstName: "Senior",
          lastName: "Dev"
        }
      });
    }

    await prisma.employee.create({
      data: {
        userId: hrUser.id,
        employeeCode: "EMP-001",
        jobTitle: "HR Manager",
        joiningDate: new Date("2024-01-01"),
        salary: 80000
      }
    });

    await prisma.employee.create({
      data: {
        userId: devUser.id,
        employeeCode: "EMP-002",
        jobTitle: "Senior Developer",
        joiningDate: new Date("2024-03-15"),
        salary: 120000
      }
    });

    console.log("Employees seeded.");
  }

  // Applications
  const appsCount = await prisma.application.count();
  if (appsCount === 0) {
    // Need a student user
    let applicantUser = await prisma.user.findUnique({ where: { email: "applicant@test.com" } });
    if (!applicantUser) {
      applicantUser = await prisma.user.create({
        data: {
          email: "applicant@test.com",
          role: "STUDENT",
          passwordHash: "dummyhash",
          firstName: "John",
          lastName: "Applicant"
        }
      });
    }

    let student = await prisma.student.findUnique({ where: { userId: applicantUser.id } });
    if (!student) {
      student = await prisma.student.create({
        data: {
          userId: applicantUser.id,
          studentCode: "STU-100"
        }
      });
    }

    await prisma.application.create({
      data: {
        studentId: student.id,
        courseId: "UIUX-101",
        status: "SUBMITTED",
        portfolioUrl: "https://dribbble.com/johnapplicant",
        appliedAt: new Date()
      }
    });

    console.log("Applications seeded.");
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
