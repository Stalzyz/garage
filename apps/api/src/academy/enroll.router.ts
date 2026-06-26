import { FastifyInstance } from 'fastify';

export default async function enrollRouter(app: FastifyInstance) {
  // POST /api/v1/academy/enroll
  app.post('/enroll', async (req, reply) => {
    const { lmsCourseId } = req.body as { lmsCourseId: string };

    // 1. Fetch the LMS Course and its core Course to get the first Batch
    const lmsCourse = await app.prisma.lMSCourse.findUnique({
      where: { id: lmsCourseId },
      include: {
        course: {
          include: { batches: true }
        }
      }
    });

    if (!lmsCourse) {
      return reply.status(404).send({ error: 'Course not found' });
    }

    // 2. Find or Create a Dummy Student
    // For this prototype, we'll auto-create a user and student profile
    const email = `student_${Date.now()}@test.com`;
    let user = await app.prisma.user.findFirst({ where: { role: 'STUDENT' } });
    
    if (!user) {
      user = await app.prisma.user.create({
        data: {
          email,
          passwordHash: 'dummy',
          role: 'STUDENT',
          firstName: 'Demo',
          lastName: 'Student',
          status: 'ACTIVE'
        }
      });
    }

    let student = await app.prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) {
      student = await app.prisma.student.create({
        data: {
          userId: user.id,
          studentCode: `STU-${Date.now()}`
        }
      });
    }

    // 3. Find or Create a Batch for the Course
    let batch = lmsCourse.course.batches[0];
    if (!batch) {
      batch = await app.prisma.batch.create({
        data: {
          courseId: lmsCourse.course.id,
          name: `Cohort - ${new Date().getFullYear()}`,
          type: 'ONLINE',
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + lmsCourse.course.duration ? parseInt(lmsCourse.course.duration) : 3))
        }
      });
    }

    // 4. Create the Enrollment
    // Use upsert to prevent unique constraint violations if the student clicks twice
    const enrollment = await app.prisma.enrollment.upsert({
      where: {
        studentId_batchId: {
          studentId: student.id,
          batchId: batch.id
        }
      },
      update: {},
      create: {
        studentId: student.id,
        batchId: batch.id,
        totalFee: lmsCourse.course.fee,
        feePaid: lmsCourse.course.fee,
        status: 'ACTIVE'
      }
    });

    return { success: true, enrollment };
  });

  // GET /api/v1/academy/enrollments/me
  app.get('/enrollments/me', async (req, reply) => {
    // Mock getting the current student's enrollments
    const user = await app.prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!user) return { data: [] };

    const student = await app.prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) return { data: [] };

    const enrollments = await app.prisma.enrollment.findMany({
      where: { studentId: student.id },
      include: {
        batch: {
          include: {
            course: {
              include: {
                lmsCourse: true
              }
            }
          }
        }
      }
    });

    return { data: enrollments };
  });
}
