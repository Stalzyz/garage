import { FastifyInstance } from 'fastify';

export default async function jobsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/jobs
  app.get('/', async (req, reply) => {
    // Fetch only jobs that the HR team has flagged as public for academy students
    const jobs = await app.prisma.jobPosting.findMany({
      where: {
        isPublicForStudents: true,
        status: 'OPEN'
      },
      orderBy: { createdAt: 'desc' }
    });

    return { data: jobs };
  });

  // POST /api/v1/academy/jobs/:id/apply
  app.post('/:id/apply', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { studentId } = req.body as { studentId: string };

    const job = await app.prisma.jobPosting.findUnique({ where: { id } });
    if (!job) return reply.notFound('Job not found');

    const student = await app.prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true }
    });

    if (!student) return reply.notFound('Student not found');

    // Create a Candidate record in the HR module directly!
    // This bridges the LMS and HR systems seamlessly.
    const candidate = await app.prisma.candidate.create({
      data: {
        jobPostingId: id,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        phone: student.parentPhone || '', // using available phone
        resumeUrl: student.portfolio || '', // using portfolio as resume
        status: 'APPLIED'
      }
    });

    return reply.status(201).send({ success: true, candidateId: candidate.id });
  });
}
