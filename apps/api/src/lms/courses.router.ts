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
        thumbnail:    z.string().optional(),
        outcomes:     z.array(z.string()).optional(),
        prerequisites: z.array(z.string()).optional(),
        isPublished:  z.boolean().optional(),
      })
    }
  }, async (req, reply) => {
    const lmsCourse = await server.prisma.lMSCourse.update({
      where: { id: req.params.id },
      data: req.body,
      include: { course: true }
    });
    return lmsCourse;
  });

  // DELETE /api/v1/lms/courses/:id
  server.delete('/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    await server.prisma.lMSCourse.delete({ where: { id: req.params.id } });
    return reply.code(204).send();
  });
}

