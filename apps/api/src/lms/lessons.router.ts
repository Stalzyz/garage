import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function lessonsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/v1/lms/lessons/:id
  server.get('/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req) => {
    const lesson = await server.prisma.lMSLesson.findUnique({
      where: { id: req.params.id },
      include: { module: { include: { lmsCourse: true } } }
    });
    return { lesson };
  });

  // POST /api/v1/lms/lessons — Create a new lesson inside a module
  server.post('/', {
    schema: {
      body: z.object({
        moduleId:    z.string(),
        title:       z.string(),
        type:        z.enum(['VIDEO', 'PDF', 'SLIDE', 'LIVE_SESSION', 'ASSIGNMENT', 'QUIZ', 'LINK', 'TEXT', 'CODE', 'DESIGN', 'RICH_TEXT']),
        contentUrl:  z.string().optional(),
        videoId:     z.string().optional(),
        duration:    z.number().optional(),
        description: z.string().optional(),
        richText:    z.string().optional(),
        isPreview:   z.boolean().optional().default(false),
        sortOrder:   z.number().optional(),
      })
    }
  }, async (req, reply) => {
    const { sortOrder, ...data } = req.body;
    // Auto-set sortOrder to end of list if not provided
    const maxOrder = await server.prisma.lMSLesson.count({ where: { moduleId: data.moduleId } });
    const lesson = await server.prisma.lMSLesson.create({
      data: { ...data, sortOrder: sortOrder ?? maxOrder }
    });
    return reply.status(201).send(lesson);
  });

  // PATCH /api/v1/lms/lessons/:id — Update lesson metadata / video URL
  server.patch('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        title:       z.string().optional(),
        contentUrl:  z.string().optional(),
        videoId:     z.string().optional(),
        duration:    z.number().optional(),
        description: z.string().optional(),
        richText:    z.string().optional(),
        isPreview:   z.boolean().optional(),
        sortOrder:   z.number().optional(),
      })
    }
  }, async (req) => {
    const lesson = await server.prisma.lMSLesson.update({
      where: { id: req.params.id },
      data: req.body
    });
    return lesson;
  });

  // DELETE /api/v1/lms/lessons/:id
  server.delete('/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    await server.prisma.lMSLesson.delete({ where: { id: req.params.id } });
    return reply.code(204).send();
  });

  // POST /api/v1/lms/lessons/modules — Create a new module in an LMS course
  server.post('/modules', {
    schema: {
      body: z.object({
        lmsCourseId: z.string(),
        title:       z.string(),
        sortOrder:   z.number().optional(),
      })
    }
  }, async (req, reply) => {
    const { sortOrder, ...data } = req.body;
    const maxOrder = await server.prisma.lMSModule.count({ where: { lmsCourseId: data.lmsCourseId } });
    const module = await server.prisma.lMSModule.create({
      data: { ...data, sortOrder: sortOrder ?? maxOrder }
    });
    return reply.status(201).send(module);
  });

  // PATCH /api/v1/lms/lessons/modules/:id — Rename or reorder a module
  server.patch('/modules/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        title:     z.string().optional(),
        sortOrder: z.number().optional(),
      })
    }
  }, async (req) => {
    const module = await server.prisma.lMSModule.update({
      where: { id: req.params.id },
      data: req.body
    });
    return module;
  });

  // DELETE /api/v1/lms/lessons/modules/:id
  server.delete('/modules/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    await server.prisma.lMSModule.delete({ where: { id: req.params.id } });
    return reply.code(204).send();
  });
}

