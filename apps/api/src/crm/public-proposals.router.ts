import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const SignProposalSchema = z.object({
  signatureData: z.string().min(1), // Base64 image or typed name
});

export default async function publicProposalsRouter(app: FastifyInstance) {
  const getProposalHandler = async (req: any, reply: any) => {
    const { token } = req.params as { token: string };
    
    const proposal = await app.prisma.proposal.findFirst({
      where: {
        OR: [
          { publicToken: token },
          { id: token }
        ]
      },
      include: {
        items: true,
        lead: { select: { name: true, company: true, email: true, phone: true } },
        contact: { select: { firstName: true, lastName: true, email: true, company: { select: { name: true } } } },
      },
    });

    if (!proposal) {
      return reply.notFound('Proposal not found or expired.');
    }

    return proposal;
  };

  const signProposalHandler = async (req: any, reply: any) => {
    const { token } = req.params as { token: string };
    const body = SignProposalSchema.parse(req.body);

    const proposal = await app.prisma.proposal.findFirst({
      where: {
        OR: [
          { publicToken: token },
          { id: token }
        ]
      },
      include: {
        lead: true,
        contact: true
      }
    });

    if (!proposal) {
      return reply.notFound('Proposal not found.');
    }

    if (proposal.status === 'APPROVED' || proposal.status === 'REJECTED') {
      return reply.badRequest('Proposal has already been signed or rejected.');
    }

    const updated = await app.prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'APPROVED',
        signedAt: new Date(),
        signatureData: body.signatureData,
      },
      include: { items: true, lead: true, contact: true }
    });

    // Notify via email on proposal signing
    try {
      const { sendEmail, EmailTemplates } = await import('../integrations/email.service');
      const clientEmail = proposal.lead?.email || proposal.contact?.email;
      const clientName = proposal.contact ? `${proposal.contact.firstName} ${proposal.contact.lastName}` : (proposal.lead?.name || 'Client');
      if (clientEmail) {
        await sendEmail(clientEmail, EmailTemplates.proposalApproved(clientName, proposal.title));
      }
    } catch (e) {
      console.error('[PublicProposals] Failed to send approval email:', e);
    }

    return updated;
  };

  // GET /api/v1/crm/public/proposals/:token
  app.get('/proposals/:token', getProposalHandler);
  // Alias: GET /api/v1/crm/proposals/public/:token
  app.get('/proposals/public/:token', getProposalHandler);

  // POST /api/v1/crm/public/proposals/:token/sign
  app.post('/proposals/:token/sign', signProposalHandler);
  // Alias: POST /api/v1/crm/proposals/public/:token/sign
  app.post('/proposals/public/:token/sign', signProposalHandler);
}
