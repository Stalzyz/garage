import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function enrollmentsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/v1/lms/enrollments/my — All enrollments for the authenticated student
  server.get('/my', {
    preHandler: [server.requireAuth]
  }, async (req, reply) => {
    const userId = req.user.id;

    // Find the student record for this user
    const student = await server.prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      return { enrollments: [], totalCourses: 0, certificatesEarned: 0, totalWatchedSecs: 0 };
    }

    const enrollments = await server.prisma.enrollment.findMany({
      where: { studentId: student.id, status: 'ACTIVE' },
      include: {
        batch: {
          include: {
            course: {
              include: {
                lmsCourse: {
                  include: {
                    modules: {
                      include: { lessons: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    // For each enrollment, calculate completion %
    const withProgress = await Promise.all(
      enrollments.map(async (enr: any) => {
        const lmsCourse = enr.batch.course.lmsCourse;
        if (!lmsCourse) {
          return { ...enr, completionPct: 0, completedLessons: 0, totalLessons: 0 };
        }

        const allLessonIds = lmsCourse.modules.flatMap((m: any) => m.lessons.map((l: any) => l.id));
        const completedCount = allLessonIds.length > 0
          ? await server.prisma.lessonProgress.count({
              where: { studentId: student.id, isCompleted: true, lessonId: { in: allLessonIds } }
            })
          : 0;

        // Total watched seconds across all lessons
        const watchData = await server.prisma.lessonProgress.aggregate({
          where: { studentId: student.id, lessonId: { in: allLessonIds } },
          _sum: { watchedSecs: true }
        });

        return {
          id: enr.id,
          batchId: enr.batchId,
          status: enr.status,
          feePaid: enr.feePaid,
          totalFee: enr.totalFee,
          enrolledAt: enr.enrolledAt,
          course: {
            id: lmsCourse.id,
            name: enr.batch.course.name,
            thumbnail: enr.batch.course.description,
          },
          completionPct: allLessonIds.length > 0 ? Math.round((completedCount / allLessonIds.length) * 100) : 0,
          completedLessons: completedCount,
          totalLessons: allLessonIds.length,
          watchedSecs: watchData._sum.watchedSecs || 0,
        };
      })
    );

    // Certificates earned
    const certificatesEarned = await server.prisma.certificate.count({
      where: { studentId: student.id }
    });

    const totalWatchedSecs = withProgress.reduce((sum, e) => sum + (e.watchedSecs || 0), 0);

    return {
      enrollments: withProgress,
      totalCourses: withProgress.length,
      certificatesEarned,
      totalWatchedSecs,
      studentId: student.id,
    };
  });

  // GET /api/v1/lms/enrollments/check — Query param version
  server.get('/check', async (req, reply) => {
    const { studentId, courseId } = req.query as { studentId: string; courseId: string };
    if (!studentId || !courseId) return { enrolled: false };

    const lmsCourse = await server.prisma.lMSCourse.findUnique({
      where: { id: courseId },
      select: { courseId: true }
    });
    if (!lmsCourse) return { enrolled: false };

    const enrollment = await server.prisma.enrollment.findFirst({
      where: { studentId, batch: { courseId: lmsCourse.courseId }, status: 'ACTIVE' }
    });
    return { enrolled: !!enrollment, enrollment };
  });
  server.get('/check/:courseId/:studentId', {
    schema: {
      params: z.object({
        courseId: z.string(),
        studentId: z.string()
      })
    }
  }, async (req, reply) => {
    const { courseId, studentId } = req.params;

    // A student is enrolled if they have an Enrollment for any Batch associated with this Course
    // We need to look up the base course ID from the lmsCourse ID
    const lmsCourse = await server.prisma.lMSCourse.findUnique({
      where: { id: courseId },
      select: { courseId: true }
    });

    if (!lmsCourse) {
      return reply.code(404).send({ error: "LMS Course not found" });
    }

    const enrollment = await server.prisma.enrollment.findFirst({
      where: {
        studentId,
        batch: { courseId: lmsCourse.courseId },
        status: "ACTIVE"
      }
    });

    return { enrolled: !!enrollment, enrollment };
  });

  // POST /api/v1/lms/enrollments
  server.post('/', {
    schema: {
      body: z.object({
        courseId: z.string(),
        studentId: z.string()
      })
    }
  }, async (req, reply) => {
    const { courseId, studentId } = req.body;

    const lmsCourse = await server.prisma.lMSCourse.findUnique({
      where: { id: courseId },
      include: { course: { include: { batches: true } } }
    });

    if (!lmsCourse) {
      return reply.code(404).send({ error: "LMS Course not found" });
    }

    // For the LMS self-paced experience, if they don't have a batch, we can enroll them in a default "Online" batch or create one
    let batch = lmsCourse.course.batches.find(b => b.type === "ONLINE");
    if (!batch) {
      batch = await server.prisma.batch.create({
        data: {
          courseId: lmsCourse.courseId,
          name: `${lmsCourse.course.name} - Online Cohort`,
          type: "ONLINE",
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year access
        }
      });
    }

    // Check existing
    const existing = await server.prisma.enrollment.findFirst({
      where: { studentId, batchId: batch.id }
    });

    if (existing) {
      return reply.send({ enrollment: existing });
    }

    const fee = lmsCourse.course.fee || 0;

    // If Free course, grant immediate access
    if (fee === 0) {
      const enrollment = await server.prisma.enrollment.create({
        data: {
          studentId,
          batchId: batch.id,
          totalFee: 0,
          feePaid: 0
        }
      });
      return reply.status(201).send({ enrollment, requiresPayment: false });
    }

    // Paid Course: Initiate Razorpay Checkout
    try {
      // Dynamic import to avoid issues if module isn't strictly required everywhere
      const Razorpay = (await import('razorpay')).default;
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
      });

      const order = await rzp.orders.create({
        amount: Math.round(fee * 100), // Razorpay expects paise (amount * 100)
        currency: 'INR',
        notes: {
          course_id: courseId,   // LMSCourse ID
          student_id: studentId,
          batch_id: batch.id     // Important for webhook fulfillment
        }
      });

      return reply.send({
        requiresPayment: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key'
      });
    } catch (err) {
      server.log.error(err, "Failed to create Razorpay Order");
      return reply.code(500).send({ error: "Failed to initiate payment." });
    }
  });
}
