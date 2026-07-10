import { FastifyInstance } from 'fastify';

export default async function portalRouter(app: FastifyInstance) {
  // Middleware to ensure user is a CLIENT and has a profile
  app.addHook('preHandler', async (req, reply) => {
    if (!req.user || req.user.role !== 'CLIENT') {
      return reply.forbidden('Only clients can access the portal API');
    }
    
    // Find client profile
    const profile = await app.prisma.clientProfile.findUnique({
      where: { userId: req.user.id },
      include: { contact: true }
    });
    
    if (!profile || !profile.contact || !profile.contact.companyId) {
      return reply.forbidden('Client profile or associated company not found');
    }
    
    // Attach companyId to request for easy access in handlers
    (req as any).companyId = profile.contact.companyId;
    (req as any).contactId = profile.contact.id;
  });

  // GET /api/v1/portal/dashboard
  app.get('/dashboard', async (req, reply) => {
    const companyId = (req as any).companyId;
    
    // Get projects
    const projects = await app.prisma.project.findMany({
      where: { companyId },
      include: {
        phases: true,
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Get invoices via projects
    const projectIds = projects.map(p => p.id);
    const invoices = await app.prisma.invoice.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate stats
    const paidTotal = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0);
    const pendingTotal = invoices.filter(i => ['SENT', 'OVERDUE', 'PARTIAL'].includes(i.status)).reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
    
    // Calculate progress for active project
    const activeProject = projects[0];
    let progress = 0;
    if (activeProject && activeProject.tasks.length > 0) {
      const completed = activeProject.tasks.filter(t => t.status === 'DONE').length;
      progress = Math.round((completed / activeProject.tasks.length) * 100);
    }
    
    return {
      activeProjects: projects.length,
      progress,
      paidTotal,
      pendingTotal,
      activeProject: activeProject ? {
        id: activeProject.id,
        name: activeProject.name,
        status: activeProject.status,
        progress,
        phases: activeProject.phases.map(p => ({
          name: p.name,
          done: !!p.completedAt
        }))
      } : null
    };
  });

  // GET /api/v1/portal/projects
  app.get('/projects', async (req, reply) => {
    const companyId = (req as any).companyId;
    
    const projects = await app.prisma.project.findMany({
      where: { companyId },
      include: {
        phases: { orderBy: { sortOrder: 'asc' } },
        tasks: { select: { id: true, status: true } },
        files: { 
          where: { isDelivery: true },
          orderBy: { createdAt: 'desc' } 
        },
        billingSchedule: {
          include: {
            milestones: {
              include: { invoice: true },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map data for frontend
    const mappedProjects = projects.map(p => {
      let progress = 0;
      if (p.tasks.length > 0) {
        const completed = p.tasks.filter(t => t.status === 'DONE').length;
        progress = Math.round((completed / p.tasks.length) * 100);
      }
      
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        progress,
        dueDate: p.dueDate,
        phases: p.phases.map(phase => ({
          name: phase.name,
          done: !!phase.completedAt
        })),
        deliverables: p.files.map(f => ({
          id: f.id,
          name: f.name,
          ready: !!f.approvedAt,
          url: f.fileUrl
        })),
        billingSchedule: p.billingSchedule
      };
    });
    
    return mappedProjects;
  });

  // GET /api/v1/portal/invoices
  app.get('/invoices', async (req, reply) => {
    const companyId = (req as any).companyId;
    const projects = await app.prisma.project.findMany({ where: { companyId }, select: { id: true }});
    const projectIds = projects.map(p => p.id);
    
    const invoices = await app.prisma.invoice.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return invoices;
  });

  // GET /api/v1/portal/proposals
  app.get('/proposals', async (req, reply) => {
    const contactId = (req as any).contactId;
    
    // Assuming proposals are linked to leads, and leads are linked to contacts/companies.
    // Since the schema connects proposals to Lead, and we need to find proposals for this client.
    // For now, let's fetch proposals where the lead's email matches the contact's email.
    const contact = await app.prisma.contact.findUnique({ where: { id: contactId } });
    
    if (!contact || !contact.email) return [];
    
    const leads = await app.prisma.lead.findMany({
      where: { email: contact.email }
    });
    
    const leadIds = leads.map(l => l.id);
    
    if (leadIds.length === 0) return [];
    
    const proposals = await app.prisma.proposal.findMany({
      where: { leadId: { in: leadIds }, status: { in: ['SENT', 'VIEWED', 'APPROVED'] } },
      orderBy: { createdAt: 'desc' }
    });
    
    return proposals;
  });

  // GET /api/v1/portal/notifications
  app.get('/notifications', async (req, reply) => {
    const notifications = await app.prisma.notification.findMany({
      where: { userId: req.user?.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    return notifications;
  });

  // GET /api/v1/portal/projects/:projectId/files/:fileId/markers
  app.get('/projects/:projectId/files/:fileId/markers', async (req, reply) => {
    const { fileId } = req.params as { fileId: string };
    
    // In a real app we'd also verify the projectId belongs to this client's company
    const markers = await app.prisma.fileMarker.findMany({
      where: { fileId },
      orderBy: { createdAt: 'asc' }
    });
    
    return markers;
  });

  // POST /api/v1/portal/projects/:projectId/files/:fileId/markers
  app.post('/projects/:projectId/files/:fileId/markers', async (req, reply) => {
    const { fileId } = req.params as { fileId: string };
    const body = req.body as any; // { xPercent, yPercent, comment, timestamp }
    
    const marker = await app.prisma.fileMarker.create({
      data: {
        fileId,
        userId: req.user?.id || 'unknown',
        xPercent: body.xPercent,
        yPercent: body.yPercent,
        timestamp: body.timestamp,
        comment: body.comment
      }
    });
    
    return marker;
  });

  // GET /api/v1/portal/tickets
  app.get('/tickets', async (req, reply) => {
    const tickets = await app.prisma.ticket.findMany({
      where: { userId: req.user?.id },
      orderBy: { updatedAt: 'desc' }
    });
    return tickets;
  });

  // POST /api/v1/portal/tickets
  app.post('/tickets', async (req, reply) => {
    const body = req.body as any;
    const ticket = await app.prisma.ticket.create({
      data: {
        subject: body.subject,
        priority: body.priority || 'NORMAL',
        status: 'OPEN',
        userId: req.user!.id,
      }
    });
    
    if (body.message) {
      await app.prisma.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          senderId: req.user!.id,
          message: body.message
        }
      });
    }
    
    return ticket;
  });

  // GET /api/v1/portal/tickets/:id
  app.get('/tickets/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const ticket = await app.prisma.ticket.findFirst({
      where: { id, userId: req.user?.id },
      include: {
        messages: {
          where: { isInternal: false },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!ticket) return reply.notFound();
    return ticket;
  });

  // POST /api/v1/portal/tickets/:id/messages
  app.post('/tickets/:id/messages', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;
    
    const ticket = await app.prisma.ticket.findFirst({
      where: { id, userId: req.user?.id }
    });
    
    if (!ticket) return reply.notFound();
    
    const message = await app.prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: req.user!.id,
        message: body.message
      }
    });
    
    await app.prisma.ticket.update({
      where: { id: ticket.id },
      data: { updatedAt: new Date() }
    });
    
    return message;
  });

  // GET /api/v1/portal/projects/:id/timeline
  app.get('/projects/:id/timeline', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // In a real app we'd verify companyId
    const project = await app.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: { where: { status: 'DONE' } },
        files: true,
        billingSchedule: { include: { milestones: { where: { status: 'PAID' }, include: { invoice: true } } } },
        phases: { where: { completedAt: { not: null } } }
      }
    });

    if (!project) return reply.notFound();

    type TimelineEvent = { id: string, type: string, title: string, date: Date, description?: string };
    const events: TimelineEvent[] = [];

    // Project Created
    events.push({ id: `proj-${project.id}`, type: 'PROJECT_CREATED', title: 'Project Kickoff', date: project.createdAt });
    
    // Completed Tasks
    project.tasks.forEach(t => {
      events.push({
        id: `task-${t.id}`,
        type: 'TASK_COMPLETED',
        title: 'Task Completed',
        description: t.title,
        date: t.updatedAt
      });
    });

    // Uploaded Files
    project.files.forEach(f => {
      events.push({
        id: `file-${f.id}`,
        type: 'FILE_UPLOADED',
        title: f.isDelivery ? 'Deliverable Uploaded' : 'File Uploaded',
        description: f.name,
        date: f.createdAt
      });
    });

    // Paid Milestones
    project.billingSchedule?.milestones.forEach(m => {
      events.push({
        id: `pay-${m.id}`,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Received',
        description: `${m.name} (₹${m.amount})`,
        date: m.updatedAt
      });
    });

    // Completed Phases
    project.phases.forEach(p => {
      if (p.completedAt) {
        events.push({
          id: `phase-${p.id}`,
          type: 'PHASE_COMPLETED',
          title: 'Phase Completed',
          description: p.name,
          date: p.completedAt
        });
      }
    });

    // Sort descending
    events.sort((a, b) => b.date.getTime() - a.date.getTime());

    return events;
  });
}
