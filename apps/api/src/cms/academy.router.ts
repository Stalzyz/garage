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

  app.post('/portfolio', async (req, reply) => {
    const data = req.body as { title: string, description: string, imageUrl?: string, linkUrl?: string, technologies?: string[], studentId?: string };
    
    let studentPortfolio = await app.prisma.studentPortfolio.findFirst();
    if (!studentPortfolio) {
      const user = await app.prisma.user.findFirst();
      if (!user) throw new Error("No users found to attach portfolio");
      studentPortfolio = await app.prisma.studentPortfolio.create({
        data: { studentId: user.id }
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

  app.delete('/portfolio/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
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
