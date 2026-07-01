const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Try to find a user/student to enroll
  let student = await prisma.student.findFirst({ include: { user: true } })
  if (!student) {
    const user = await prisma.user.create({
      data: {
        email: 'teststudent@example.com',
        firstName: 'Test',
        lastName: 'Student',
        passwordHash: 'dummy',
        role: 'STUDENT',
      }
    })
    student = await prisma.student.create({
      data: {
        userId: user.id,
        studentCode: 'TEST-001',
      }
    })
  }

  // Find or Create a Course
  let course = await prisma.course.findFirst({ where: { code: 'QR-101' } })
  if (!course) {
    course = await prisma.course.create({
      data: {
        name: 'Test Course for QR',
        code: 'QR-101',
        duration: '1 day',
        fee: 0
      }
    })
  }

  // Find or Create a Batch
  let batch = await prisma.batch.findFirst({ where: { name: 'Onsite QR Test Batch' } })
  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        courseId: course.id,
        name: 'Onsite QR Test Batch',
        type: 'MORNING',
        startDate: new Date(),
        endDate: new Date()
      }
    })
  }

  // Enroll the student
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { studentId_batchId: { studentId: student.id, batchId: batch.id } }
  })
  
  if (!existingEnrollment) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        batchId: batch.id,
        totalFee: 0,
        feePaid: 0
      }
    })
  }

  // Create the Session
  const session = await prisma.batchSession.upsert({
    where: { id: 'test-session-1' },
    update: {
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000)
    },
    create: {
      id: 'test-session-1',
      batchId: batch.id,
      title: 'QR Attendance Live Test',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000)
    }
  })

  console.log('Successfully created/upserted session with ID:', session.id)
  console.log('Enrolled Student:', student.user?.firstName || 'Test')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
