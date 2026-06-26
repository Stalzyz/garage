import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function analyticsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/v1/lms/analytics/educator
  server.get('/educator', async (req, reply) => {
    // In a real app we'd filter by req.user.id
    // But for now, we aggregate across all LMS Courses

    const courses = await server.prisma.lMSCourse.findMany({
      include: {
        course: { include: { batches: { include: { enrollments: { include: { student: { include: { user: true } } } } } } } },
        modules: { include: { lessons: true } }
      }
    });

    let totalStudents = 0;
    let completedLessons = 0;
    let totalLessonsCount = 0;

    const enrollmentsList: any[] = [];

    // Count metrics
    for (const lmsCourse of courses) {
      const totalCourseLessons = lmsCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      
      for (const batch of lmsCourse.course.batches) {
        for (const enrollment of batch.enrollments) {
          totalStudents++;
          
          // Get progress for this student
          const progress = await server.prisma.lessonProgress.findMany({
            where: { studentId: enrollment.studentId }
          });

          // Only count progress for lessons in THIS course
          const lessonIds = lmsCourse.modules.flatMap(m => m.lessons.map(l => l.id));
          const completedInCourse = progress.filter(p => p.isCompleted && lessonIds.includes(p.lessonId)).length;
          
          completedLessons += completedInCourse;
          totalLessonsCount += totalCourseLessons;

          enrollmentsList.push({
            id: enrollment.id,
            studentName: `${enrollment.student.user.firstName} ${enrollment.student.user.lastName}`,
            courseName: lmsCourse.course.name,
            enrolledAt: enrollment.enrolledAt,
            progressPct: totalCourseLessons > 0 ? Math.round((completedInCourse / totalCourseLessons) * 100) : 0
          });
        }
      }
    }

    const avgCompletionPct = totalLessonsCount > 0 ? Math.round((completedLessons / totalLessonsCount) * 100) : 0;

    return {
      metrics: {
        totalStudents,
        totalCourses: courses.length,
        avgCompletionPct
      },
      recentEnrollments: enrollmentsList.sort((a, b) => b.enrolledAt.getTime() - a.enrolledAt.getTime()).slice(0, 10)
    };
  });
}
