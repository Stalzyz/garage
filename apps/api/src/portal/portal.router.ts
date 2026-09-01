import { FastifyInstance } from 'fastify';

export default async function portalRouter(app: FastifyInstance) {
  // Middleware to ensure user is authenticated and has a client profile/contact
  app.addHook('preHandler', async (req, reply) => {
    if (!req.user) {
      return reply.forbidden('Authentication required');
    }
    
    // Find client profile
    let profile = await app.prisma.clientProfile.findUnique({
      where: { userId: req.user.id },
      include: { contact: { include: { company: true } } }
    });
    
    if (!profile || !profile.contact) {
      let contact = await app.prisma.contact.findFirst({
        where: { email: req.user.email }
      });

      if (!contact) {
        contact = await app.prisma.contact.create({
          data: {
            email: req.user.email,
            firstName: (req.user as any).firstName || req.user.name?.split(' ')[0] || 'Client',
            lastName: (req.user as any).lastName || req.user.name?.split(' ').slice(1).join(' ') || '',
            tier: 'BRONZE'
          },
          include: { company: true }
        });
      }

      if (!profile) {
        profile = await app.prisma.clientProfile.create({
          data: {
            userId: req.user.id,
            contactId: contact.id
          },
          include: { contact: { include: { company: true } } }
        });
      } else if (!profile.contactId) {
        profile = await app.prisma.clientProfile.update({
          where: { id: profile.id },
          data: { contactId: contact.id },
          include: { contact: { include: { company: true } } }
        });
      }
    }
    
    // Ensure Student record exists safely
    let studentId: string | null = null;
    try {
      let student = await app.prisma.student.findUnique({
        where: { userId: req.user.id }
      });
      if (!student) {
        const studentCode = `GRA-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        student = await app.prisma.student.create({
          data: {
            userId: req.user.id,
            studentCode,
            deliveryMode: 'ONLINE'
          }
        });
      }
      studentId = student?.id || null;
    } catch (e) {
      app.log.warn({ err: e }, "Safe student creation skipped in portal preHandler");
    }

    // Attach companyId, contactId, and studentId to request for easy access in handlers
    (req as any).companyId = profile?.contact?.companyId || null;
    (req as any).contactId = profile?.contact?.id || null;
    (req as any).contactEmail = profile?.contact?.email || req.user?.email || "";
    (req as any).studentId = studentId;
  });

  // GET /api/v1/portal/me — get authenticated client profile info
  app.get('/me', async (req, reply) => {
    const contactId = (req as any).contactId;
    const contact = await app.prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        company: true
      }
    });

    if (!contact) return reply.notFound('Client contact profile not found');

    return {
      id: req.user.id,
      contactId: contact.id,
      studentId: (req as any).studentId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      name: `${contact.firstName} ${contact.lastName}`,
      email: contact.email || req.user.email,
      phone: contact.phone,
      tier: contact.tier || 'BRONZE',
      companyId: contact.companyId,
      companyName: contact.company?.name || 'Independent Client',
      company: contact.company
    };
  });

  // GET /api/v1/portal/dashboard
  app.get('/dashboard', async (req, reply) => {
    const companyId = (req as any).companyId;
    const contactEmail = (req as any).contactEmail;
    
    // Get projects matching companyId for this client
    let projects: any[] = [];
    if (companyId) {
      projects = await app.prisma.project.findMany({
        where: { companyId },
        include: {
          phases: true,
          tasks: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    
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
    
    // Get active subscription for the company
    const activeSubscription = companyId ? await app.prisma.subscription.findFirst({
      where: { companyId, status: 'active' }
    }) : null;

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
        budget: activeProject.budget,
        phases: activeProject.phases.map(p => ({
          name: p.name,
          done: !!p.completedAt
        }))
      } : null,
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        status: activeSubscription.status,
        plan: {
          name: activeSubscription.planName,
          product: activeSubscription.productName,
          amount: activeSubscription.mrr,
          nextBilling: activeSubscription.nextBilling
        }
      } : null
    };
  });

  // GET /api/v1/portal/projects
  app.get('/projects', async (req, reply) => {
    const companyId = (req as any).companyId;
    const contactEmail = (req as any).contactEmail;

    let projects: any[] = [];
    if (companyId) {
      projects = await app.prisma.project.findMany({
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
    }
    
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
        budget: p.budget,
        phases: p.phases.map(phase => ({
          name: phase.name,
          done: !!phase.completedAt
        })),
        deliverables: p.files.map(f => ({
          id: f.id,
          name: f.name,
          ready: !!f.approvedAt,
          url: f.fileUrl,
          mimeType: f.mimeType
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

  // GET /api/v1/portal/invoices/:id
  app.get('/invoices/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const companyId = (req as any).companyId;
    const projects = await app.prisma.project.findMany({ where: { companyId }, select: { id: true }});
    const projectIds = projects.map(p => p.id);
    
    const invoice = await app.prisma.invoice.findFirst({
      where: { 
        id,
        projectId: { in: projectIds }
      },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
      }
    });
    
    if (!invoice) return reply.notFound('Invoice not found or access denied');
    return invoice;
  });

  // GET /api/v1/portal/proposals
  app.get('/proposals', async (req, reply) => {
    const contactId = (req as any).contactId;
    const contactEmail = (req as any).contactEmail || req.user?.email || '';
    const companyId = (req as any).companyId;
    
    // Find all leads associated with this client's email, contactId, or company
    const matchingLeads = await app.prisma.lead.findMany({
      where: {
        OR: [
          ...(contactEmail ? [{ email: { equals: contactEmail, mode: 'insensitive' as const } }] : []),
          ...(contactId ? [{ contactId }] : []),
          ...(companyId ? [{ companyId }] : []),
        ]
      },
      select: { id: true }
    });
    const leadIds = matchingLeads.map(l => l.id);

    // Find all contacts associated with this client's email, contactId, or company
    const matchingContacts = await app.prisma.contact.findMany({
      where: {
        OR: [
          ...(contactEmail ? [{ email: { equals: contactEmail, mode: 'insensitive' as const } }] : []),
          ...(contactId ? [{ id: contactId }] : []),
          ...(companyId ? [{ companyId }] : []),
        ]
      },
      select: { id: true }
    });
    const contactIds = matchingContacts.map(c => c.id);

    // Find all proposals matching leadId, contactId, matching lead/contact email, or companyId
    const proposals = await app.prisma.proposal.findMany({
      where: {
        OR: [
          ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : []),
          ...(contactIds.length > 0 ? [{ contactId: { in: contactIds } }] : []),
          ...(contactEmail ? [{ lead: { email: { equals: contactEmail, mode: 'insensitive' as const } } }] : []),
          ...(contactEmail ? [{ contact: { email: { equals: contactEmail, mode: 'insensitive' as const } } }] : []),
          ...(companyId ? [{ contact: { companyId } }] : []),
          ...(companyId ? [{ lead: { companyId } }] : []),
        ],
        status: { not: 'REJECTED' as const }
      },
      include: {
        items: true,
        comments: { orderBy: { createdAt: 'desc' } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        lead: { select: { id: true, name: true, email: true, company: true } },
      },
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

  // POST /api/v1/portal/bookings
  app.post('/bookings', async (req, reply) => {
    const contactId = (req as any).contactId;
    const { dateTime, topic } = req.body as { dateTime: string; topic: string };
    
    if (!dateTime || !topic) {
      return reply.badRequest('Missing dateTime or topic');
    }

    const coordinator = await app.prisma.user.findFirst({
      where: { role: { in: ['SUPER_ADMIN', 'MANAGER'] } }
    });

    if (!coordinator) {
      return reply.internalServerError('No staff available for booking');
    }

    const log = await app.prisma.communicationLog.create({
      data: {
        contactId,
        type: 'MEETING',
        direction: 'INBOUND',
        summary: `Client booked a call on ${new Date(dateTime).toLocaleString()} about: "${topic}"`,
        userId: coordinator.id,
      }
    });

    return { success: true, log };
  });

  // POST /api/v1/portal/projects/:projectId/files
  app.post('/projects/:projectId/files', async (req, reply) => {
    const { projectId } = req.params as { projectId: string };
    const { name, fileUrl, fileSize, mimeType } = req.body as { name: string; fileUrl: string; fileSize: number; mimeType: string };
    const companyId = (req as any).companyId;

    if (!name || !fileUrl || !fileSize || !mimeType) {
      return reply.badRequest('Missing required fields');
    }

    const project = await app.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.companyId !== companyId) {
      return reply.forbidden('Access denied');
    }

    const file = await app.prisma.projectFile.create({
      data: {
        projectId,
        name,
        fileUrl,
        fileSize,
        mimeType,
        uploadedBy: req.user?.id || 'client',
        isDelivery: false
      }
    });

    return file;
  });

  // POST /api/v1/portal/projects/:projectId/milestones/:milestoneId/pay
  app.post('/projects/:projectId/milestones/:milestoneId/pay', async (req, reply) => {
    const { projectId, milestoneId } = req.params as { projectId: string; milestoneId: string };
    const companyId = (req as any).companyId;

    const project = await app.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        company: {
          include: {
            contacts: { take: 1, orderBy: { createdAt: 'asc' } }
          }
        }
      }
    });

    if (!project || project.companyId !== companyId) {
      return reply.forbidden('Access denied');
    }

    const milestone = await app.prisma.billingMilestone.findUnique({
      where: { id: milestoneId },
      include: { invoice: true }
    });

    if (!milestone) {
      return reply.notFound('Milestone not found');
    }

    let invoice = milestone.invoice;

    if (!invoice) {
      const clientEmail = project.company?.contacts?.[0]?.email || undefined;
      const clientName = project.company?.name || 'Client';

      invoice = await app.prisma.$transaction(async (tx) => {
        const inv = await tx.invoice.create({
          data: {
            invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            projectId: project.id,
            clientName,
            clientEmail: clientEmail || null,
            businessUnit: 'AGENCY',
            subtotal: milestone.amount,
            totalAmount: milestone.amount,
            paidAmount: 0,
            status: 'SENT',
            currency: 'INR',
            dueDate: milestone.dueDate || new Date(Date.now() + 7 * 86400000),
            items: {
              create: [
                {
                  description: milestone.name,
                  quantity: 1,
                  unitPrice: milestone.amount,
                  total: milestone.amount
                }
              ]
            }
          }
        });

        await tx.billingMilestone.update({
          where: { id: milestoneId },
          data: { invoiceId: inv.id }
        });

        return inv;
      });
    }

    const integrationKeys = await app.prisma.integrationKey.findMany({
      where: { service: 'RAZORPAY', isActive: true }
    });

    let keyId = process.env.RAZORPAY_KEY_ID;
    let keySecret = process.env.RAZORPAY_KEY_SECRET;

    const { decrypt } = await import('../settings/integrations.router');

    for (const k of integrationKeys) {
      if (k.keyName === 'RAZORPAY_KEY_ID') {
        const val = decrypt(k.encryptedValue);
        if (val && !val.includes('***')) keyId = val;
      }
      if (k.keyName === 'RAZORPAY_KEY_SECRET') {
        const val = decrypt(k.encryptedValue);
        if (val && !val.includes('***')) keySecret = val;
      }
    }

    const isLive = !!keyId && keyId.startsWith('rzp_') && keyId !== 'rzp_test_mock';

    if (isLive) {
      const { paymentsService } = await import('../integrations/payments.service');
      const res = await paymentsService.createRazorpayOrder(
        invoice.totalAmount,
        invoice.currency,
        invoice.invoiceNumber,
        keyId && keySecret ? { keyId, keySecret } : undefined
      );
      if (res.success && res.order) {
        return {
          isLive: true,
          keyId: keyId,
          orderId: res.order.id,
          amount: res.order.amount,
          currency: res.order.currency,
          clientName: invoice.clientName,
          clientEmail: invoice.clientEmail
        };
      } else {
        return reply.badRequest(`Payment initialization failed: ${res.error || 'Unknown error'}`);
      }
    }

    return { isLive: false, sandboxMode: true };
  });

  // POST /api/v1/portal/proposals/:proposalId/comments
  app.post('/proposals/:proposalId/comments', async (req, reply) => {
    const { proposalId } = req.params as { proposalId: string };
    const { comment } = req.body as { comment: string };

    if (!comment) {
      return reply.badRequest('Missing comment text');
    }

    const contactId = (req as any).contactId;
    const contact = await app.prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact || !contact.email) {
      return reply.forbidden('Access denied');
    }

    const proposal = await app.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { lead: true }
    });

    if (!proposal || proposal.lead?.email !== contact.email) {
      return reply.forbidden('Access denied');
    }

    const newComment = await app.prisma.proposalComment.create({
      data: {
        proposalId,
        comment,
        userId: req.user?.id || 'client',
        userName: (req.user as any)?.firstName ? `${(req.user as any).firstName} ${(req.user as any).lastName || ''}`.trim() : 'Client'
      }
    });

    // Notify the agency that a client left a comment
    const org = await app.prisma.organization.findFirst();
    if (org?.supportEmail) {
      const { sendEmail, EmailTemplates } = await import('../integrations/email.service');
      const adminUrl = process.env.AUTH_URL || 'https://garage.grekam.in';
      const link = `${adminUrl}/dashboard/crm/proposals/${proposalId}`;
      
      await sendEmail(
        org.supportEmail,
        EmailTemplates.newComment('Team Grekam', newComment.userName, proposal.title, comment, link)
      );
    }
    return newComment;
  });
}
