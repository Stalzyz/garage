import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from '../db';
import { EventBus, SystemEvents } from '../automations/event-bus';

export default async function progressRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/v1/lms/progress — Mark a lesson as complete / update watch progress
  server.post('/', {
    schema: {
      body: z.object({
        lessonId: z.string(),
        studentId: z.string(),
        watchedSecs: z.number().optional(),
        isCompleted: z.boolean().optional(),
        lastPosition: z.number().optional()
      })
    }
  }, async (req, reply) => {
    const { lessonId, studentId, ...data } = req.body;
    
    const progress = await prisma.lessonProgress.upsert({
      where: { lessonId_studentId: { lessonId, studentId } },
      update: {
        ...data,
        completedAt: data.isCompleted ? new Date() : undefined
      },
      create: {
        lessonId,
        studentId,
        ...data,
        completedAt: data.isCompleted ? new Date() : null
      }
    });

    // After marking a lesson complete, check if the entire course is done
    if (data.isCompleted) {
      const lesson = await prisma.lMSLesson.findUnique({
        where: { id: lessonId },
        include: {
          module: {
            include: {
              lmsCourse: {
                include: {
                  modules: {
                    include: { lessons: true }
                  },
                  course: true
                }
              }
            }
          }
        }
      });

      if (lesson) {
        const lmsCourse = lesson.module.lmsCourse;
        // Collect all lesson IDs in this course
        const allLessonIds = lmsCourse.modules.flatMap(m => m.lessons.map(l => l.id));
        // Fetch all completed lessons for this student in this course
        const completedCount = await prisma.lessonProgress.count({
          where: {
            studentId,
            isCompleted: true,
            lessonId: { in: allLessonIds }
          }
        });

        const totalLessons = allLessonIds.length;
        const completionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        app.log.info(`[LMS] Student ${studentId} is ${completionPct}% complete on course ${lmsCourse.id}`);

        // Fire COURSE_COMPLETED event when 100% done
        if (completionPct === 100) {
          app.log.info(`[LMS] 🎉 Course completed by ${studentId}! Firing COURSE_COMPLETED event.`);
          // Fetch student details to pass to the event
          const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { user: true }
          });

          EventBus.emit(SystemEvents.COURSE_COMPLETED, {
            studentId,
            studentName: student ? `${student.user.firstName} ${student.user.lastName}` : 'Student',
            studentEmail: student?.user.email,
            courseName: lmsCourse.course.name,
            lmsCourseId: lmsCourse.id,
          });
        }
      }
    }

    return reply.status(200).send(progress);
  });

  // GET /api/v1/lms/progress/:studentId/:lmsCourseId — Get course progress %
  server.get('/:studentId/:lmsCourseId', {
    schema: {
      params: z.object({ studentId: z.string(), lmsCourseId: z.string() })
    }
  }, async (req, reply) => {
    const { studentId, lmsCourseId } = req.params;
    const lmsCourse = await prisma.lMSCourse.findUnique({
      where: { id: lmsCourseId },
      include: { modules: { include: { lessons: true } } }
    });
    if (!lmsCourse) return reply.code(404).send({ error: 'Course not found' });

    const allLessonIds = lmsCourse.modules.flatMap(m => m.lessons.map(l => l.id));
    const completedCount = await prisma.lessonProgress.count({
      where: { studentId, isCompleted: true, lessonId: { in: allLessonIds } }
    });

    const totalLessons = allLessonIds.length;
    const completionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return { completionPct, completedLessons: completedCount, totalLessons };
  });
}

