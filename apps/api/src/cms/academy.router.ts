import { FastifyInstance } from 'fastify';

export default async function academyRouter(app: FastifyInstance) {
  // ==========================================
  // PLACEMENT COMPANIES (Hiring Partners)
  // ==========================================
  
  app.get('/placements', async (req, reply) => {
    const companies = await app.prisma.placementCompany.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { data: companies };
  });

  app.post('/placements', async (req, reply) => {
    const data = req.body as { name: string, website?: string, industry?: string, logoUrl?: string, contactName?: string, contactEmail?: string, contactPhone?: string };
    const company = await app.prisma.placementCompany.create({ data });
    return { data: company };
  });

  app.delete('/placements/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.placementCompany.delete({ where: { id } });
    return { success: true };
  });

  // ==========================================
  // PORTFOLIO PROJECTS (Student Showcase)
  // ==========================================

  app.get('/portfolio', async (req, reply) => {
    const projects = await app.prisma.portfolioProject.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { data: projects };
  });

  app.post('/portfolio', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const data = req.body as { title: string, description: string, imageUrl?: string, linkUrl?: string, technologies?: string[], studentId?: string };
    
    let targetStudentId = '';

    if (req.user.role === 'STUDENT') {
      const student = await app.prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) return reply.code(400).send({ error: 'Active user does not have a student profile.' });
      targetStudentId = student.id;
    } else {
      if (data.studentId) {
        targetStudentId = data.studentId;
      } else {
        const firstStudent = await app.prisma.student.findFirst();
        if (!firstStudent) return reply.code(400).send({ error: 'No students found in the database.' });
        targetStudentId = firstStudent.id;
      }
    }

    let studentPortfolio = await app.prisma.studentPortfolio.findUnique({
      where: { studentId: targetStudentId }
    });

    if (!studentPortfolio) {
      studentPortfolio = await app.prisma.studentPortfolio.create({
        data: { studentId: targetStudentId }
      });
    }

    const project = await app.prisma.portfolioProject.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        portfolioId: studentPortfolio.id
      }
    });
    return { data: project };
  });

  app.delete('/portfolio/:id', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };

    if (req.user.role === 'STUDENT') {
      const student = await app.prisma.student.findUnique({ where: { userId: req.user.id } });
      const project = await app.prisma.portfolioProject.findUnique({
        where: { id },
        include: { portfolio: true }
      });
      if (project && student && project.portfolio.studentId !== student.id) {
        return reply.code(403).send({ error: 'You are not authorized to delete this project.' });
      }
    }

    await app.prisma.portfolioProject.delete({ where: { id } });
    return { success: true };
  });

  // ==========================================
  // EVENTS (CampusEvent & DemoSession)
  // ==========================================

  app.get('/events', async (req, reply) => {
    const events = await app.prisma.campusEvent.findMany({
      orderBy: { date: 'desc' }
    });
    return { data: events };
  });

  app.post('/events', async (req, reply) => {
    const data = req.body as { title: string, description: string, eventType: any, locationType: any, startDate: string, endDate: string, locationDetails?: string, maxAttendees?: number };
    const event = await app.prisma.campusEvent.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.eventType || 'WORKSHOP',
        date: new Date(data.startDate),
        location: data.locationDetails,
        maxCapacity: data.maxAttendees ? Number(data.maxAttendees) : null,
        isActive: true,
      }
    });
    return { data: event };
  });

  app.delete('/events/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.campusEvent.delete({ where: { id } });
    return { success: true };
  });

  // ==========================================
  // ANNOUNCEMENTS
  // ==========================================

  app.get('/announcements', async (req, reply) => {
    const announcements = await app.prisma.announcement.findMany({
      orderBy: { publishedAt: 'desc' }
    });
    return { data: announcements };
  });

  app.post('/announcements', async (req, reply) => {
    const data = req.body as { title: string, content: string, type: any, priority: any, isPublished?: boolean, validUntil?: string };
    
    // Fallback to first user for createdBy
    const user = await app.prisma.user.findFirst();

    const announcement = await app.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        isPinned: data.isPublished ?? true,
        expiresAt: data.validUntil ? new Date(data.validUntil) : null,
        createdBy: user?.id || "system"
      }
    });
    return { data: announcement };
  });

  app.delete('/announcements/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.announcement.delete({ where: { id } });
    return { success: true };
  });

  // ==========================================
  // EDUCATORS
  // ==========================================

  app.get('/educators', async (req, reply) => {
    const educators = await app.prisma.educator.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: educators };
  });

  app.patch('/educators/:id/verify', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { verificationStatus } = req.body as { verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" };
    const educator = await app.prisma.educator.update({
      where: { id },
      data: { verificationStatus }
    });
    return { data: educator };
  });
}
