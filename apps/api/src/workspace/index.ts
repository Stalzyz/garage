import { FastifyInstance } from 'fastify';

export default async function workspaceRouter(app: FastifyInstance) {
  
  // GET /api/v1/workspace/dashboard
  // Aggregates data for the Mission Control dashboard
  app.get('/dashboard', async (req, reply) => {
    
    // In a real scenario with auth, we'd use req.user.clientProfile.companyId
    // For now, we fetch the most recent active project and pending invoice
    
    const project = await app.prisma.project.findFirst({
      where: { status: { notIn: ['CLOSED', 'ON_HOLD'] } },
      include: {
        phases: {
          orderBy: { sortOrder: 'asc' }
        },
        company: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    const pendingInvoice = await app.prisma.invoice.findFirst({
      where: { status: 'SENT' },
      orderBy: { dueDate: 'asc' }
    });

    // We'd typically fetch recent AuditLogs or ChatMessages filtered by companyId
    // We'll mock the activity feed for the demo since it requires complex joins across modules
    const recentActivity = [
      { title: "Designer uploaded Homepage V5", time: "2 hours ago", type: "file" },
      { title: "You approved Branding Phase", time: "Yesterday", type: "approval" },
      { title: "Invoice INV-2026-041 Paid", time: "Oct 12", type: "payment" },
      { title: "Developer joined project", time: "Oct 10", type: "team" },
    ];

    let progress = 0;
    let activePhase: any = null;
    let nextPhase: any = null;

    if (project && (project as any).phases && (project as any).phases.length > 0) {
      const phases = (project as any).phases;
      const completedPhases = phases.filter((p: any) => p.completedAt !== null).length;
      progress = Math.round((completedPhases / phases.length) * 100);
      
      const activeIndex = phases.findIndex((p: any) => p.completedAt === null);
      if (activeIndex !== -1) {
        activePhase = phases[activeIndex];
        if (activeIndex + 1 < phases.length) {
          nextPhase = phases[activeIndex + 1];
        }
      }
    }

    return {
      data: {
        project: project ? {
          id: project.id,
          name: project.name,
          progress,
          activePhase: activePhase ? activePhase.name : 'All Phases Complete',
          nextPhase: nextPhase ? nextPhase.name : null,
          phases: (project as any).phases ? (project as any).phases.map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.completedAt ? 'completed' : (p.id === activePhase?.id ? 'active' : 'pending'),
            progress: p.completedAt ? 100 : (p.id === activePhase?.id ? 50 : 0)
          })) : []
        } : null,
        financials: {
          pendingAmount: pendingInvoice ? pendingInvoice.totalAmount : 0,
          pendingInvoiceId: pendingInvoice ? pendingInvoice.invoiceNumber : null,
          dueDate: pendingInvoice ? pendingInvoice.dueDate : null,
          totalPaid: 180000 // Mock value for total paid
        },
        activity: recentActivity,
        upcomingMeeting: {
          title: "Website Review Sync",
          time: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        }
      }
    };
  });
  // GET /api/v1/workspace/assets
  // Fetches project files
  app.get('/assets', async (req, reply) => {
    const files = await app.prisma.projectFile.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    return { data: files };
  });

  // POST /api/v1/workspace/assets/:id/approve
  // Approves a deliverable
  app.post('/assets/:id/approve', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const file = await app.prisma.projectFile.update({
      where: { id },
      data: {
        approvedAt: new Date(),
        approvedBy: 'Client Admin', // Mock auth
      }
    });

    return { success: true, data: file };
  });
}
