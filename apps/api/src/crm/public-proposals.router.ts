import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const SignProposalSchema = z.object({
  signatureData: z.string().min(1), // Base64 image or typed name
});

export default async function publicProposalsRouter(app: FastifyInstance) {
  // GET /api/v1/crm/public/proposals/:token
  app.get('/proposals/:token', async (req, reply) => {
    const { token } = req.params as { token: string };
    
    const proposal = await app.prisma.proposal.findUnique({
      where: { publicToken: token },
      include: {
        items: true,
        lead: { select: { name: true, company: true } },
      },
    });

    if (!proposal) {
      return reply.notFound('Proposal not found or expired.');
    }

    return proposal;
  });

  // POST /api/v1/crm/public/proposals/:token/sign
  app.post('/proposals/:token/sign', async (req, reply) => {
    const { token } = req.params as { token: string };
    const body = SignProposalSchema.parse(req.body);

    const proposal = await app.prisma.proposal.findUnique({
      where: { publicToken: token },
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
    });

    return updated;
  });
}
