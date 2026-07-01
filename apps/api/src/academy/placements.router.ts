import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function placementsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/placements/companies
  app.get('/placements/companies', async (req, reply) => {
    const companies = await app.prisma.placementCompany.findMany({
      include: { _count: { select: { jobs: true } } },
      orderBy: { name: 'asc' }
    });
    return companies;
  });

  // POST /api/v1/academy/placements/companies
  app.post('/placements/companies', async (req, reply) => {
    const schema = z.object({
      name: z.string(),
      industry: z.string().optional(),
      website: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const company = await app.prisma.placementCompany.create({ data: body });
    reply.code(201);
    return company;
  });

  // GET /api/v1/academy/placements/jobs
  app.get('/placements/jobs', async (req, reply) => {
    const jobs = await app.prisma.placementJob.findMany({
      include: {
        company: true,
        _count: { select: { applications: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return jobs;
  });

  // POST /api/v1/academy/placements/jobs
  app.post('/placements/jobs', async (req, reply) => {
    const schema = z.object({
      companyId: z.string(),
      title: z.string(),
      location: z.string().optional(),
      minCareerScore: z.number().default(0),
    });
    const body = schema.parse(req.body);

    const job = await app.prisma.placementJob.create({ data: body });
    reply.code(201);
    return job;
  });
}
