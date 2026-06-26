import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding Phase 4 Data...");

  // 1. Ensure course and student exist
  let course = await prisma.course.findFirst();
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "UI/UX Masterclass",
        description: "Learn UI/UX design from scratch.",
        instructorId: "temp-instructor",
        price: 100
      }
    });
  }

  let studentUser = await prisma.user.findFirst({ where: { email: "applicant@test.com" } });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: "applicant@test.com",
        firstName: "John",
        lastName: "Applicant",
        role: "STUDENT",
        passwordHash: "dummyhash"
      }
    });
  }

  let student = await prisma.student.findFirst({ where: { userId: studentUser.id } });
  if (!student) {
    student = await prisma.student.create({
      data: {
        userId: studentUser.id,
        studentCode: "STU-100"
      }
    });
  }

  // 2. Create LMS Assignments
  const assignmentsCount = await prisma.assignment.count();
  if (assignmentsCount === 0) {
    await prisma.assignment.create({
      data: {
        title: "Wireframing Dashboard",
        brief: "Design a high-fidelity wireframe for a SaaS analytics dashboard. Ensure you use auto-layout and components properly.",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
        maxScore: 100
      }
    });

    const gradedAssignment = await prisma.assignment.create({
      data: {
        title: "Bouncing Ball Animation",
        brief: "Create a realistic bouncing ball using squash and stretch principles in After Effects.",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Due 5 days ago
        maxScore: 100
      }
    });

    // Add a graded submission for the graded assignment
    await prisma.assignmentSubmission.create({
      data: {
        assignmentId: gradedAssignment.id,
        studentId: student.id,
        linkUrl: "https://vimeo.com/bouncing-ball",
        status: "GRADED",
        grade: 95,
        feedback: "Excellent timing and spacing. The squash and stretch feels very natural. - Instructor Protocol",
        submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      }
    });

    console.log("Assignments seeded.");
  } else {
    console.log("Assignments already seeded.");
  }

  // 3. Create Vendors
  const vendorCount = await prisma.vendor.count();
  if (vendorCount === 0) {
    // Need a few vendor users first
    const vendorUsersData = [
      { email: "santhosh@studio.in", firstName: "Santhosh", lastName: "Designs" },
      { email: "priya@motion.studio", firstName: "Priya", lastName: "Animations" },
      { email: "hello@devcraft.io", firstName: "DevCraft", lastName: "Labs" },
      { email: "orders@printhouse.in", firstName: "Print", lastName: "House Co." }
    ];

    const vendorUsers = [];
    for (const vud of vendorUsersData) {
      let vu = await prisma.user.findFirst({ where: { email: vud.email } });
      if (!vu) {
        vu = await prisma.user.create({
          data: {
            ...vud,
            role: "VENDOR",
            passwordHash: "dummyhash"
          }
        });
      }
      vendorUsers.push(vu);
    }

    await prisma.vendor.create({
      data: {
        userId: vendorUsers[0].id,
        vendorCode: "VND-001",
        type: "CREATIVE",
        company: "Santhosh Designs",
        skills: ["Logo Design", "Brand Identity", "Illustration"],
        dayRate: 5000,
        rating: 4.8
      }
    });

    await prisma.vendor.create({
      data: {
        userId: vendorUsers[1].id,
        vendorCode: "VND-002",
        type: "CREATIVE",
        company: "Priya Animations",
        skills: ["Motion Graphics", "After Effects", "3D Modeling"],
        dayRate: 6500,
        rating: 4.5
      }
    });

    await prisma.vendor.create({
      data: {
        userId: vendorUsers[2].id,
        vendorCode: "VND-003",
        type: "TECHNICAL",
        company: "DevCraft Labs",
        skills: ["Next.js", "React", "Node.js", "DevOps"],
        dayRate: 8000,
        rating: 4.7
      }
    });

    await prisma.vendor.create({
      data: {
        userId: vendorUsers[3].id,
        vendorCode: "VND-004",
        type: "SUPPLIER",
        company: "Print House Co.",
        skills: ["Offset Printing", "Large Format", "Packaging"],
        rating: 4.2
      }
    });

    console.log("Vendors seeded.");
  } else {
    console.log("Vendors already seeded.");
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
