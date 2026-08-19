import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sendTemplatedEmail } from '../services/emailRenderer';
import { sendEmail, EmailTemplates } from '../integrations/email.service';

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['BRAND_IDENTITY', 'WEBSITE', 'CAMPAIGN', 'MOTION', 'FULL_PACKAGE', 'CUSTOM']).default('WEBSITE'),
  customTypeName: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  contactId: z.string().optional().nullable(),
  newCompanyName: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  budget: z.union([z.number(), z.string().transform(v => parseFloat(v))]).optional().nullable(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  status: z.enum(['BRIEFING', 'DISCOVERY', 'CONCEPT', 'PRODUCTION', 'REVIEW', 'DELIVERY', 'CLOSED', 'ON_HOLD']).optional(),
  completedAt: z.string().optional().nullable(),
});

export default async function projectsRouter(app: FastifyInstance) {
  // GET /api/v1/projects
  app.get('/', async (req, reply) => {
    const { status, managerId, companyId, includeFiles } = req.query as { status?: string; managerId?: string; companyId?: string; includeFiles?: string };
    const user = req.user;
    let enforcedCompanyId = companyId;

    if (user.role === 'CLIENT') {
      const clientProfile = await app.prisma.clientProfile.findUnique({
        where: { userId: user.id },
        include: { contact: { include: { company: true } } }
      });
      if (!clientProfile || !clientProfile.contact || !clientProfile.contact.companyId) {
        return { data: [], total: 0 };
      }
      enforcedCompanyId = clientProfile.contact.companyId;
    }

    const projects = await app.prisma.project.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(managerId && { managerId }),
        ...(enforcedCompanyId && { companyId: enforcedCompanyId }),
      },
      include: {
        company: { select: { name: true } },
        _count: { select: { tasks: true, phases: true } },
        ...(includeFiles === 'true' && { files: { orderBy: { createdAt: 'desc' } } })
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { data: projects, total: projects.length };
  });

  // GET /api/v1/projects/:id
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = req.user;
    let companyIdLimit: string | null = null;

    if (user.role === 'CLIENT') {
      const clientProfile = await app.prisma.clientProfile.findUnique({
        where: { userId: user.id },
        include: { contact: true }
      });
      if (!clientProfile || !clientProfile.contact?.companyId) {
        return reply.forbidden('Access denied');
      }
      companyIdLimit = clientProfile.contact.companyId;
    }

    const project = await app.prisma.project.findUnique({
      where: { id },
      include: {
        company: true,
        phases: { orderBy: { sortOrder: 'asc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
        files: { orderBy: { createdAt: 'desc' } },
        _count: { select: { timeLogs: true, files: true } },
      },
    });
    if (!project) return reply.notFound('Project not found');

    if (companyIdLimit && project.companyId !== companyIdLimit) {
      return reply.forbidden('Access denied');
    }

    return project;
  });

  // POST /api/v1/projects
  app.post('/', async (req, reply) => {
    const body = CreateProjectSchema.parse(req.body);
    let targetCompanyId = body.companyId || null;

    if (body.contactId) {
      const contact = await app.prisma.contact.findUnique({
        where: { id: body.contactId },
        include: { company: true }
      });

      if (contact) {
        if (contact.companyId) {
          targetCompanyId = contact.companyId;
        } else {
          const companyName = body.newCompanyName?.trim() || `${contact.firstName} ${contact.lastName}`.trim() || 'Independent Client';
          const newComp = await app.prisma.company.create({
            data: { name: companyName }
          });
          await app.prisma.contact.update({
            where: { id: contact.id },
            data: { companyId: newComp.id }
          });
          targetCompanyId = newComp.id;
        }
      }
    } else if (body.newCompanyName && body.newCompanyName.trim()) {
      const newComp = await app.prisma.company.create({
        data: { name: body.newCompanyName.trim() }
      });
      targetCompanyId = newComp.id;
    }

    const { contactId, newCompanyName, ...projectData } = body;

    const project = await app.prisma.project.create({
      data: {
        name: body.name,
        type: body.type || 'WEBSITE',
        customTypeName: body.customTypeName || null,
        managerId: body.managerId || 'usr_1',
        companyId: targetCompanyId || null,
        description: body.description || null,
        budget: body.budget || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });

    // Auto-trigger WELCOME_CLIENT email notification to client contact
    (async () => {
      try {
        app.log.info(`[PROJECT_EMAIL] Project created: ${project.id} | contactId: ${body.contactId || 'none'} | companyId: ${targetCompanyId || 'none'}`);
        
        let contact: any = null;
        if (body.contactId) {
          contact = await app.prisma.contact.findUnique({
            where: { id: body.contactId },
            include: { company: true }
          });
          app.log.info(`[PROJECT_EMAIL] Contact lookup by ID: ${JSON.stringify({ id: contact?.id, email: contact?.email })}`);
        } else if (targetCompanyId) {
          contact = await app.prisma.contact.findFirst({
            where: { companyId: targetCompanyId },
            include: { company: true }
          });
          app.log.info(`[PROJECT_EMAIL] Contact lookup by companyId: ${JSON.stringify({ id: contact?.id, email: contact?.email })}`);
        }

        if (!contact || !contact.email) {
          app.log.warn(`[PROJECT_EMAIL] No contact/email found — skipping welcome email for project ${project.id}`);
          return;
        }

        const clientName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Client';
        const companyName = contact.company?.name || project.name;

        // Try DB template first
        const sent = await sendTemplatedEmail(app, {
          code: 'WELCOME_CLIENT',
          to: contact.email,
          data: {
            clientName,
            companyName,
            portalLink: 'https://garage.grekam.in/portal/dashboard',
            accountManager: 'Grekam Project Manager'
          }
        });

        if (!sent) {
          // Fallback: send direct using hardcoded EmailTemplates
          app.log.warn(`[PROJECT_EMAIL] DB template send failed, trying direct EmailTemplates fallback`);
          const { sendEmail, EmailTemplates } = await import('../integrations/email.service');
          const tmpl = EmailTemplates.dripWelcome(clientName);
          const result = await sendEmail(contact.email, tmpl);
          app.log.info(`[PROJECT_EMAIL] Fallback email sent: ${result.messageId} | Preview: ${result.previewUrl}`);
        }
      } catch (err: any) {
        app.log.error(`[PROJECT_EMAIL] Failed to send welcome email for project ${project.id}: ${err.message}`);
      }
    })();

    reply.code(201);
    return project;
  });

  // PATCH /api/v1/projects/:id
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateProjectSchema.parse(req.body);
    let targetCompanyId = body.companyId;

    if (body.contactId) {
      const contact = await app.prisma.contact.findUnique({
        where: { id: body.contactId },
        include: { company: true }
      });

      if (contact) {
        if (contact.companyId) {
          targetCompanyId = contact.companyId;
        } else {
          const companyName = body.newCompanyName?.trim() || `${contact.firstName} ${contact.lastName}`.trim() || 'Independent Client';
          const newComp = await app.prisma.company.create({
            data: { name: companyName }
          });
          await app.prisma.contact.update({
            where: { id: contact.id },
            data: { companyId: newComp.id }
          });
          targetCompanyId = newComp.id;
        }
      }
    } else if (body.newCompanyName && body.newCompanyName.trim()) {
      const newComp = await app.prisma.company.create({
        data: { name: body.newCompanyName.trim() }
      });
      targetCompanyId = newComp.id;
    }

    const { contactId, newCompanyName, ...updateData } = body;

    const oldProject = await app.prisma.project.findUnique({
      where: { id },
      include: { company: { include: { contacts: true } } }
    });

    const project = await app.prisma.project.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.type && { type: updateData.type }),
        ...(updateData.customTypeName !== undefined && { customTypeName: updateData.customTypeName }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.managerId && { managerId: updateData.managerId }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.budget !== undefined && { budget: updateData.budget }),
        ...(targetCompanyId !== undefined && { companyId: targetCompanyId }),
        ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
        ...(body.completedAt !== undefined && { completedAt: body.completedAt ? new Date(body.completedAt) : null }),
      },
      include: { company: { include: { contacts: true } } }
    });

    // Auto-trigger Client Notification on Stage / Detail Change
    (async () => {
      try {
        let contact: any = null;
        if (body.contactId) {
          contact = await app.prisma.contact.findUnique({ where: { id: body.contactId } });
        } else {
          contact = project.company?.contacts?.[0];
        }

        if (contact) {
          const statusChanged = oldProject && oldProject.status !== project.status;
          const templateCode = statusChanged ? 'PROJECT_STAGE_CHANGED' : 'PROJECT_UPDATED';

          if (contact.email) {
            await sendTemplatedEmail(app, {
              code: templateCode,
              to: contact.email,
              data: {
                clientName: `${contact.firstName} ${contact.lastName}`.trim(),
                projectName: project.name,
                oldStatus: oldProject?.status || 'PLANNING',
                newStatus: project.status,
                projectType: project.type,
                dueDate: project.dueDate ? project.dueDate.toLocaleDateString() : 'TBD',
                updateDate: new Date().toLocaleDateString(),
                portalLink: `https://garage.grekam.in/portal/projects/${project.id}`
              }
            });
          }

          // In-app notification for client user
          const clientUser = await app.prisma.user.findFirst({
            where: { email: contact.email }
          });

          if (clientUser) {
            await app.prisma.notification.create({
              data: {
                userId: clientUser.id,
                title: statusChanged
                  ? `Project "${project.name}" stage updated to ${project.status}`
                  : `Project "${project.name}" details updated`,
                body: `Status: ${project.status}. Click to view updated project milestones.`,
                type: 'SYSTEM',
              }
            });
          }
        }
      } catch (err: any) {
        app.log.warn(`Client update notification warning: ${err.message}`);
      }
    })();

    return project;
  });

  // DELETE /api/v1/projects/:id
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.project.delete({ where: { id } });
    reply.code(204);
  });

  // POST /api/v1/projects/:id/phases/:phaseId/approve
  app.post('/:id/phases/:phaseId/approve', async (req, reply) => {
    const { id, phaseId } = req.params as { id: string; phaseId: string };
    const user = req.user;

    const bodySchema = z.object({
      approvedBy: z.string().min(1),
      clientNotes: z.string().optional()
    });
    const { approvedBy, clientNotes } = bodySchema.parse(req.body);

    if (user.role === 'CLIENT') {
      const clientProfile = await app.prisma.clientProfile.findUnique({
        where: { userId: user.id },
        include: { contact: true }
      });
      if (!clientProfile || !clientProfile.contact?.companyId) {
        return reply.forbidden('Access denied');
      }
      const project = await app.prisma.project.findUnique({
        where: { id }
      });
      if (!project || project.companyId !== clientProfile.contact.companyId) {
        return reply.forbidden('Access denied');
      }
    }

    const phase = await app.prisma.projectPhase.update({
      where: { id: phaseId },
      data: {
        completedAt: new Date(),
        approvedAt: new Date(),
        approvedBy,
        clientNotes
      }
    });

    try {
      (app as any).broadcast('telemetry-event', {
        event: 'Phase Approved',
        data: {
          id: phase.id,
          name: phase.name,
          approvedBy,
          clientNotes
        }
      });
    } catch {}

    return { success: true, phase };
  });

  // POST /api/v1/projects/:id/files/:fileId/approve
  app.post('/:id/files/:fileId/approve', async (req, reply) => {
    const { id, fileId } = req.params as { id: string; fileId: string };
    const user = req.user;

    const bodySchema = z.object({
      approvedBy: z.string().min(1),
      clientNotes: z.string().optional()
    });
    const { approvedBy, clientNotes } = bodySchema.parse(req.body);

    if (user.role === 'CLIENT') {
      const clientProfile = await app.prisma.clientProfile.findUnique({
        where: { userId: user.id },
        include: { contact: true }
      });
      if (!clientProfile || !clientProfile.contact?.companyId) {
        return reply.forbidden('Access denied');
      }
      const project = await app.prisma.project.findUnique({
        where: { id }
      });
      if (!project || project.companyId !== clientProfile.contact.companyId) {
        return reply.forbidden('Access denied');
      }
    }

    const file = await app.prisma.projectFile.update({
      where: { id: fileId },
      data: {
        approvedAt: new Date(),
        approvedBy,
        clientNotes
      }
    });

    try {
      (app as any).broadcast('telemetry-event', {
        event: 'Deliverable Approved',
        data: {
          id: file.id,
          name: file.name,
          approvedBy,
          clientNotes
        }
      });
    } catch {}

    return { success: true, file };
  });

  // ==========================================
  // BILLING SCHEDULES
  // ==========================================

  // Get Billing Schedule for a project
  app.get('/:id/billing-schedule', async (request, reply) => {
    const { id } = request.params as { id: string };
    const schedule = await app.prisma.billingSchedule.findUnique({
      where: { projectId: id },
      include: { milestones: { orderBy: { createdAt: 'asc' } } }
    });
    return { success: true, schedule };
  });

  // Upsert Billing Schedule
  app.put('/:id/billing-schedule', {
    schema: {
      body: z.object({
        type: z.enum(['ONE_TIME', 'INSTALLMENTS']),
        milestones: z.array(z.object({
          id: z.string().optional(),
          name: z.string(),
          amount: z.number(),
          dueDate: z.string().optional().nullable()
        }))
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { type, milestones } = request.body as any;

    const project = await app.prisma.project.findUnique({ where: { id } });
    if (!project) return reply.notFound('Project not found');

    const schedule = await app.prisma.$transaction(async (tx) => {
      // Upsert the schedule
      const sched = await tx.billingSchedule.upsert({
        where: { projectId: id },
        update: { type },
        create: { projectId: id, type }
      });

      const existingMilestones = await tx.billingMilestone.findMany({
        where: { scheduleId: sched.id }
      });

      const payloadMilestonesWithId = milestones.filter((m: any) => m.id);
      const payloadMilestoneIds = new Set(payloadMilestonesWithId.map((m: any) => m.id));

      // Milestones to delete: in DB, NOT in payload, and NOT invoiced/paid
      const milestonesToDelete = existingMilestones.filter(
        m => !payloadMilestoneIds.has(m.id) && m.status === 'PENDING'
      );
      const deleteIds = milestonesToDelete.map(m => m.id);

      if (deleteIds.length > 0) {
        await tx.billingMilestone.deleteMany({
          where: { id: { in: deleteIds } }
        });
      }

      // Update existing milestones
      for (const m of payloadMilestonesWithId) {
        const existing = existingMilestones.find(em => em.id === m.id);
        if (existing) {
          const isPending = existing.status === 'PENDING';
          await tx.billingMilestone.update({
            where: { id: m.id },
            data: {
              name: m.name,
              dueDate: m.dueDate ? new Date(m.dueDate) : null,
              ...(isPending && { amount: m.amount }) // only update amount if pending
            }
          });
        }
      }

      // Milestones to create: in payload, have no ID
      const milestonesToCreate = milestones.filter((m: any) => !m.id);
      if (milestonesToCreate.length > 0) {
        await tx.billingMilestone.createMany({
          data: milestonesToCreate.map((m: any) => ({
            scheduleId: sched.id,
            name: m.name,
            amount: m.amount,
            dueDate: m.dueDate ? new Date(m.dueDate) : null,
            status: 'PENDING'
          }))
        });
      }

      return await tx.billingSchedule.findUnique({
        where: { id: sched.id },
        include: { milestones: { orderBy: { createdAt: 'asc' } } }
      });
    });

    return { success: true, schedule };
  });

  // Generate Invoice for a Milestone
  app.post('/:id/billing-milestones/:milestoneId/generate-invoice', async (request, reply) => {
    const { id, milestoneId } = request.params as { id: string, milestoneId: string };
    
    const milestone = await app.prisma.billingMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        schedule: {
          include: {
            project: {
              include: {
                company: {
                  include: {
                    contacts: { take: 1, orderBy: { createdAt: 'asc' } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!milestone || milestone.schedule.projectId !== id) {
      return reply.notFound('Milestone not found');
    }

    if (milestone.invoiceId) {
      // Return the existing invoice id so portal can proceed to payment
      return { success: true, invoice: { id: milestone.invoiceId } };
    }

    const project = milestone.schedule.project;
    const clientEmail = project.company?.contacts?.[0]?.email || undefined;
    const clientName = project.company?.name || 'Client';
    
    // Create the invoice
    const invoice = await app.prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          projectId: project.id,
          clientName,
          clientEmail: clientEmail || null,
          businessUnit: 'AGENCY',
          subtotal: milestone.amount,
          totalAmount: milestone.amount,
          dueDate: milestone.dueDate || new Date(),
          status: 'SENT',
          billingMilestone: {
            connect: { id: milestone.id }
          },
          items: {
            create: [{
              description: `${project.name} - ${milestone.name}`,
              quantity: 1,
              unitPrice: milestone.amount,
              total: milestone.amount
            }]
          }
        }
      });

      // Link invoice to milestone
      await tx.billingMilestone.update({
        where: { id: milestone.id },
        data: { invoiceId: inv.id, status: 'INVOICED' }
      });

      return inv;
    });

    // Send email notification to client if we have their email
    if (clientEmail) {
      try {
        const template = EmailTemplates.invoiceDue(
          clientName,
          invoice.invoiceNumber,
          invoice.totalAmount,
          invoice.dueDate.toLocaleDateString()
        );
        await sendEmail(clientEmail, template);
      } catch (emailErr) {
        app.log.warn({ emailErr }, 'Failed to send invoice email to client');
      }
    }

    return { success: true, invoice };
  });
}
