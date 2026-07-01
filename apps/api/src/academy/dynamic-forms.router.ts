import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function dynamicFormsRouter(app: FastifyInstance) {
  
  // ── GET /api/v1/academy/forms ──────────────────────────────────────────────
  // List all forms for Admin
  app.get('/forms', async (req, reply) => {
    const forms = await app.prisma.enquiryForm.findMany({
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return forms;
  });

  // ── POST /api/v1/academy/forms ─────────────────────────────────────────────
  // Admin creates a new dynamic form
  app.post('/forms', async (req, reply) => {
    const schema = z.object({
      title: z.string(),
      description: z.string().optional(),
      fields: z.array(z.any()), // Array of { id, label, type, required, options }
      createLead: z.boolean().default(true),
    });
    const body = schema.parse(req.body);

    const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const form = await app.prisma.enquiryForm.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        fields: body.fields,
        createLead: body.createLead
      }
    });
    return form;
  });

  // ── GET /api/v1/academy/forms/:slug ────────────────────────────────────────
  // Public endpoint to fetch form schema
  app.get('/forms/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const form = await app.prisma.enquiryForm.findUnique({ where: { slug } });
    if (!form || !form.isActive) return reply.notFound('Form not found or inactive');
    return form;
  });

  // ── GET /api/v1/academy/forms/id/:id ───────────────────────────────────────
  // Admin fetch by ID
  app.get('/forms/id/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const form = await app.prisma.enquiryForm.findUnique({
      where: { id },
      include: { submissions: { orderBy: { createdAt: 'desc' } } }
    });
    if (!form) return reply.notFound('Form not found');
    return form;
  });

  // ── POST /api/v1/academy/forms/:slug/submit ────────────────────────────────
  // Public endpoint to submit form data
  app.post('/forms/:slug/submit', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const body = req.body as { data: Record<string, any> };

    const form = await app.prisma.enquiryForm.findUnique({ where: { slug } });
    if (!form) return reply.notFound('Form not found');

    let leadId: string | null = null;

    // Check if we should create a CRM Lead
    if (form.createLead) {
      // Try to extract name, phone, email heuristically from dynamic data keys
      const dataStr = JSON.stringify(body.data).toLowerCase();
      
      let phoneKey = Object.keys(body.data).find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('mobile'));
      let nameKey = Object.keys(body.data).find(k => k.toLowerCase().includes('name'));
      let emailKey = Object.keys(body.data).find(k => k.toLowerCase().includes('email'));

      if (phoneKey || nameKey) {
        const phone = phoneKey ? String(body.data[phoneKey]) : `no-phone-${Date.now()}`;
        const name = nameKey ? String(body.data[nameKey]) : 'Unknown Form Lead';
        const email = emailKey ? String(body.data[emailKey]) : undefined;

        const lead = await app.prisma.lead.create({
          data: {
            name,
            phone,
            email,
            source: 'OTHER',
            status: 'NEW',
            notes: `Auto-generated from form: ${form.title}`
          }
        });
        leadId = lead.id;
      }
    }

    const submission = await app.prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: body.data,
        leadId
      }
    });

    reply.code(201);
    return { success: true, submissionId: submission.id };
  });

  // ── PATCH /api/v1/academy/forms/:id/toggle ───────────────────────────────
  app.patch('/forms/:id/toggle', async (req, reply) => {
    const { id } = req.params as { id: string };
    const form = await app.prisma.enquiryForm.findUnique({ where: { id } });
    if (!form) return reply.notFound();
    
    const updated = await app.prisma.enquiryForm.update({
      where: { id },
      data: { isActive: !form.isActive }
    });
    return updated;
  });
}
