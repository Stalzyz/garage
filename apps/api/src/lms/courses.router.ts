import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function coursesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/v1/lms/courses
  server.get('/', async (req, reply) => {
    const courses = await server.prisma.lMSCourse.findMany({
      include: {
        course: true,
        modules: {
          include: { lessons: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    return { courses };
  });

  // GET /api/v1/lms/courses/:id
  server.get('/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    const course = await server.prisma.lMSCourse.findUnique({
      where: { id: req.params.id },
      include: {
        course: true,
        modules: {
          include: { lessons: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    return { course };
  });

  // POST /api/v1/lms/courses — Create a new Course + LMSCourse in one shot
  server.post('/', {
    schema: {
      body: z.object({
        name:         z.string().min(2),
        code:         z.string().min(1),
        description:  z.string().optional(),
        duration:     z.string().default('Self-paced'),
        fee:          z.number().default(0),
        thumbnail:    z.string().optional(),
        outcomes:     z.array(z.string()).optional(),
        prerequisites: z.array(z.string()).optional(),
      })
    }
  }, async (req, reply) => {
    const { name, code, description, duration, fee, thumbnail, outcomes, prerequisites } = req.body;

    // Create the base Course record
    const baseCourse = await server.prisma.course.create({
      data: { name, code, description, duration, fee }
    });

    // Then create the LMS layer on top
    const lmsCourse = await server.prisma.lMSCourse.create({
      data: {
        courseId: baseCourse.id,
        thumbnail: thumbnail || null,
        outcomes: outcomes || [],
        prerequisites: prerequisites || [],
        isPublished: false,
      },
      include: { course: true, modules: true }
    });

    return reply.status(201).send(lmsCourse);
  });

  // PATCH /api/v1/lms/courses/:id — Update course details
  server.patch('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        name:         z.string().optional(),
        code:         z.string().optional(),
        description:  z.string().optional(),
        fee:          z.number().optional(),
        thumbnail:    z.string().optional(),
        outcomes:     z.array(z.string()).optional(),
        prerequisites: z.array(z.string()).optional(),
        isPublished:  z.boolean().optional(),
      })
    }
  }, async (req, reply) => {
    // If we want to update the base course fields (name, description, fee)
    // we need to fetch the lmsCourse first to get the courseId
    const existing = await server.prisma.lMSCourse.findUnique({ where: { id: req.params.id } });
    if (!existing) return reply.status(404).send({ error: "Course not found" });

    const { name, code, description, fee, ...lmsData } = req.body;
    
    if (name !== undefined || code !== undefined || description !== undefined || fee !== undefined) {
      await server.prisma.course.update({
        where: { id: existing.courseId },
        data: { name, code, description, fee }
      });
    }

    const lmsCourse = await server.prisma.lMSCourse.update({
      where: { id: req.params.id },
      data: lmsData,
      include: { course: true }
    });
    return lmsCourse;
  });

  // PUT /api/v1/lms/courses/:id/curriculum — Bulk update curriculum
  server.put('/:id/curriculum', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        modules: z.array(z.object({
          id: z.string(),
          title: z.string(),
          lessons: z.array(z.object({
            id: z.string(),
            title: z.string(),
            type: z.enum(['VIDEO', 'PDF', 'SLIDE', 'LIVE_SESSION', 'ASSIGNMENT', 'QUIZ', 'LINK', 'TEXT', 'CODE', 'DESIGN', 'RICH_TEXT']),
            contentUrl: z.string().optional().nullable(),
            videoId: z.string().optional().nullable(),
            duration: z.number().optional().nullable(),
            description: z.string().optional().nullable(),
            richText: z.string().optional().nullable(),
            isPreview: z.boolean().optional().nullable(),
          }))
        }))
      })
    }
  }, async (req, reply) => {
    const lmsCourseId = req.params.id;
    const { modules } = req.body;

    const result = await server.prisma.$transaction(async (tx) => {
      const existingModules = await tx.lMSModule.findMany({ where: { lmsCourseId }, select: { id: true } });
      const existingModuleIds = existingModules.map(m => m.id);
      
      const existingLessons = await tx.lMSLesson.findMany({ where: { moduleId: { in: existingModuleIds } }, select: { id: true } });
      const existingLessonIds = existingLessons.map(l => l.id);

      const payloadModuleIds = modules.map(m => m.id).filter(id => !id.startsWith('new-'));
      const payloadLessonIds = modules.flatMap(m => m.lessons.map(l => l.id)).filter(id => !id.startsWith('new-'));

      const modulesToDelete = existingModuleIds.filter(id => !payloadModuleIds.includes(id));
      const lessonsToDelete = existingLessonIds.filter(id => !payloadLessonIds.includes(id));

      if (lessonsToDelete.length > 0) {
        await tx.lMSLesson.deleteMany({ where: { id: { in: lessonsToDelete } } });
      }
      if (modulesToDelete.length > 0) {
        await tx.lMSModule.deleteMany({ where: { id: { in: modulesToDelete } } });
      }

      for (let mIdx = 0; mIdx < modules.length; mIdx++) {
        const mod = modules[mIdx];
        const modId = mod.id.startsWith('new-') ? undefined : mod.id;
        
        let upsertedMod;
        if (modId) {
          upsertedMod = await tx.lMSModule.update({
            where: { id: modId },
            data: { title: mod.title, sortOrder: mIdx }
          });
        } else {
          upsertedMod = await tx.lMSModule.create({
            data: { lmsCourseId, title: mod.title, sortOrder: mIdx }
          });
        }

        for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
          const les = mod.lessons[lIdx];
          const lesId = les.id.startsWith('new-') ? undefined : les.id;

          const lessonData = {
            moduleId: upsertedMod.id,
            title: les.title,
            type: les.type,
            sortOrder: lIdx,
            contentUrl: les.contentUrl || null,
            videoId: les.videoId || null,
            duration: les.duration || null,
            description: les.description || null,
            richText: les.richText || null,
            isPreview: les.isPreview || false,
          };

          if (lesId) {
            await tx.lMSLesson.update({
              where: { id: lesId },
              data: lessonData
            });
          } else {
            await tx.lMSLesson.create({
              data: lessonData
            });
          }
        }
      }
      
      return tx.lMSCourse.findUnique({
        where: { id: lmsCourseId },
        include: { modules: { include: { lessons: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } } }
      });
    });

    return result;
  });

  // DELETE /api/v1/lms/courses/:id
  server.delete('/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    await server.prisma.lMSCourse.delete({ where: { id: req.params.id } });
    return reply.code(204).send();
  });
}

