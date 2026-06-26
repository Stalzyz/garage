import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function documentsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // 1. Get all templates
  server.get('/templates', async (req, reply) => {
    const templates = await server.prisma.documentTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { templates };
  });

  // 2. Create template
  server.post('/templates', {
    schema: {
      body: z.object({
        name: z.string(),
        type: z.enum(['CERTIFICATE', 'EXPERIENCE_LETTER', 'OFFER_LETTER', 'CUSTOM']),
        content: z.string(),
        variables: z.array(z.string())
      })
    }
  }, async (req, reply) => {
    const template = await server.prisma.documentTemplate.create({
      data: req.body
    });
    return reply.status(201).send({ template });
  });

  // 3. Delete template
  server.delete('/templates/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    await server.prisma.documentTemplate.delete({
      where: { id: req.params.id }
    });
    return reply.send({ success: true });
  });

  // 4. Generate Document preview/html
  server.post('/generate', {
    schema: {
      body: z.object({
        templateId: z.string(),
        userId: z.string().optional(),
        proposalId: z.string().optional()
      }).refine(data => data.userId || data.proposalId, {
        message: "Either userId or proposalId must be provided"
      })
    }
  }, async (req, reply) => {
    const { templateId, userId, proposalId } = req.body;

    const template = await server.prisma.documentTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return reply.status(404).send({ error: 'Template not found' });
    }

    let dict: Record<string, string> = {
      DATE: new Date().toLocaleDateString()
    };

    if (userId) {
      const user = await server.prisma.user.findUnique({
        where: { id: userId },
        include: { employee: true, student: true }
      });
      if (!user) return reply.status(404).send({ error: 'User not found' });
      
      dict.NAME = `${user.firstName} ${user.lastName}`;
      dict.EMAIL = user.email;
      dict.ROLE = user.role;
      
      if (user.employee) {
        dict.DESIGNATION = user.employee.jobTitle;
        dict.JOIN_DATE = new Date(user.employee.joiningDate).toLocaleDateString();
        dict.EMPLOYEE_CODE = user.employee.employeeCode;
      }
      if (user.student) {
        dict.STUDENT_CODE = user.student.studentCode;
      }
    }

    if (proposalId) {
      const proposal = await server.prisma.proposal.findUnique({
        where: { id: proposalId },
        include: { items: true, lead: true }
      });
      if (!proposal) return reply.status(404).send({ error: 'Proposal not found' });

      dict.PROPOSAL_TITLE = proposal.title;
      dict.TOTAL_AMOUNT = `${proposal.totalAmount.toLocaleString()} ${proposal.currency}`;
      dict.CURRENCY = proposal.currency;
      dict.VALID_UNTIL = proposal.validUntil ? new Date(proposal.validUntil).toLocaleDateString() : '';
      
      if (proposal.lead) {
        dict.LEAD_NAME = proposal.lead.name;
        dict.COMPANY_NAME = proposal.lead.company || '';
        dict.LEAD_EMAIL = proposal.lead.email || '';
      }

      // Generate ITEMS_TABLE
      let itemsHtml = `<table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #ccc; text-align: left;">
            <th style="padding: 10px;">Description</th>
            <th style="padding: 10px;">Quantity</th>
            <th style="padding: 10px;">Unit Price</th>
            <th style="padding: 10px;">Total</th>
          </tr>
        </thead>
        <tbody>`;
      
      proposal.items.forEach(item => {
        itemsHtml += `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${item.description}</td>
            <td style="padding: 10px;">${item.quantity} ${item.unit}</td>
            <td style="padding: 10px;">${item.unitPrice.toLocaleString()}</td>
            <td style="padding: 10px;">${item.total.toLocaleString()}</td>
          </tr>
        `;
      });
      itemsHtml += `</tbody></table>`;
      dict.ITEMS_TABLE = itemsHtml;
    }

    // Simple template string replacement
    let finalContent = template.content;
    template.variables.forEach(v => {
      const val = dict[v] || `[${v}]`;
      finalContent = finalContent.replace(new RegExp(`{{${v}}}`, 'g'), val);
    });

    // Log generation
    const generatedDoc = await server.prisma.generatedDocument.create({
      data: {
        templateId,
        userId: userId || null,
        proposalId: proposalId || null,
        generatedBy: 'SYSTEM', // or get from auth context
        metadata: dict
      }
    });

    return reply.send({
      html: finalContent,
      documentId: generatedDoc.id
    });
  });

  // 5. Get generation history
  server.get('/history', async (req, reply) => {
    const docs = await server.prisma.generatedDocument.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        template: true,
        user: true
      }
    });
    return { documents: docs };
  });
}
