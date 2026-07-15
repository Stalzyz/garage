import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateCompanySchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
});

const CreateContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  companyId: z.string().optional(),
  tier: z.enum(['GOLD', 'SILVER', 'BRONZE']).optional(),
  isPrimary: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const LogCommunicationSchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'WHATSAPP', 'MEETING']),
  direction: z.enum(['INBOUND', 'OUTBOUND']),
  summary: z.string().min(1),
});

export default async function contactsRouter(app: FastifyInstance) {
  // ─── COMPANIES ─────────────────────────────────────────────────────────────

  // GET /api/v1/crm/companies
  app.get('/companies', async (req, reply) => {
    const { search } = req.query as { search?: string };
    const companies = await app.prisma.company.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined,
      include: {
        contacts: { select: { id: true, firstName: true, lastName: true, isPrimary: true } },
        _count: { select: { projects: true } },
      },
      orderBy: { name: 'asc' },
    });
    return { data: companies, total: companies.length };
  });

  // GET /api/v1/crm/companies/:id
  app.get('/companies/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const company = await app.prisma.company.findUnique({
      where: { id },
      include: {
        contacts: {
          include: { communicationLogs: { orderBy: { createdAt: 'desc' }, take: 5 } },
        },
        projects: { select: { id: true, name: true, status: true } },
      },
    });
    if (!company) return reply.notFound('Company not found');
    return company;
  });

  // POST /api/v1/crm/companies
  app.post('/companies', async (req, reply) => {
    const body = CreateCompanySchema.parse(req.body);
    const company = await app.prisma.company.create({ data: body });
    reply.code(201);
    return company;
  });

  // PATCH /api/v1/crm/companies/:id
  app.patch('/companies/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = CreateCompanySchema.partial().parse(req.body);
    const company = await app.prisma.company.update({ where: { id }, data: body });
    return company;
  });

  // DELETE /api/v1/crm/companies/:id
  app.delete('/companies/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.company.delete({ where: { id } });
    reply.code(204);
  });

  // ─── CONTACTS ──────────────────────────────────────────────────────────────

  // GET /api/v1/crm/contacts
  app.get('/contacts', async (req, reply) => {
    const { search, tier, companyId } = req.query as {
      search?: string;
      tier?: string;
      companyId?: string;
    };

    const contacts = await app.prisma.contact.findMany({
      where: {
        ...(tier && { tier: tier as any }),
        ...(companyId && { companyId }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        company: { select: { id: true, name: true } },
        communicationLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: [{ isPrimary: 'desc' }, { firstName: 'asc' }],
    });
    return { data: contacts, total: contacts.length };
  });

  // GET /api/v1/crm/contacts/:id
  app.get('/contacts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const contact = await app.prisma.contact.findUnique({
      where: { id },
      include: {
        company: true,
        communicationLogs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!contact) return reply.notFound('Contact not found');
    return contact;
  });

  // POST /api/v1/crm/contacts
  app.post('/contacts', async (req, reply) => {
    const body = CreateContactSchema.parse(req.body);
    const contact = await app.prisma.contact.create({ data: body });
    reply.code(201);
    return contact;
  });

  // PATCH /api/v1/crm/contacts/:id
  app.patch('/contacts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = CreateContactSchema.partial().parse(req.body);
    const contact = await app.prisma.contact.update({ where: { id }, data: body });
    return contact;
  });

  // DELETE /api/v1/crm/contacts/:id
  app.delete('/contacts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.contact.delete({ where: { id } });
    reply.code(204);
  });

  // POST /api/v1/crm/contacts/:id/communication — log a comm event
  app.post('/contacts/:id/communication', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = LogCommunicationSchema.parse(req.body);

    const log = await app.prisma.communicationLog.create({
      data: {
        contactId: id,
        ...body,
        userId: req.user?.id || 'system',
      },
    });
    reply.code(201);
    return log;
  });



  // POST /api/v1/crm/contacts/:id/invite — Generate Client Portal Credentials
  app.post('/contacts/:id/invite', async (req, reply) => {
    const { id } = req.params as { id: string };
    const contact = await app.prisma.contact.findUnique({ where: { id } });
    if (!contact) return reply.notFound('Contact not found');
    if (!contact.email) return reply.badRequest('Contact must have an email address to invite.');

    // Check if user already exists
    let user = await app.prisma.user.findUnique({ where: { email: contact.email } });
    let tempPassword = '';
    
    if (!user) {
      // Generate 4-digit PIN
      if (contact.phone && contact.phone.replace(/\D/g, '').length >= 4) {
        tempPassword = contact.phone.replace(/\D/g, '').slice(-4);
      } else {
        tempPassword = Math.floor(1000 + Math.random() * 9000).toString();
      }
      
      const passwordHash = await require('bcryptjs').hash(tempPassword, 10);
      
      user = await app.prisma.user.create({
        data: {
          email: contact.email,
          passwordHash,
          role: 'CLIENT',
          status: 'ACTIVE',
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
        }
      });
    }

    // Check if ClientProfile exists
    let profile = await app.prisma.clientProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      profile = await app.prisma.clientProfile.create({
        data: {
          userId: user.id,
          contactId: contact.id,
        }
      });
    }

    return { 
      success: true, 
      message: 'Portal credentials generated.',
      credentials: tempPassword ? { email: user.email, password: tempPassword } : null,
      alreadyExists: !tempPassword
    };
  });

  // POST /api/v1/crm/contacts/:id/reset-pin — Reset Client Portal PIN
  app.post('/contacts/:id/reset-pin', async (req, reply) => {
    const { id } = req.params as { id: string };
    const contact = await app.prisma.contact.findUnique({ where: { id } });
    if (!contact) return reply.notFound('Contact not found');
    if (!contact.email) return reply.badRequest('Contact must have an email address.');

    let user = await app.prisma.user.findUnique({ where: { email: contact.email } });
    if (!user) return reply.badRequest('No portal account exists for this contact.');

    // Generate 4-digit PIN
    let tempPassword = '';
    if (contact.phone && contact.phone.replace(/\D/g, '').length >= 4) {
      tempPassword = contact.phone.replace(/\D/g, '').slice(-4);
    } else {
      tempPassword = Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    const passwordHash = await require('bcryptjs').hash(tempPassword, 10);
    
    await app.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return { 
      success: true, 
      message: 'PIN has been reset.',
      credentials: { email: user.email, password: tempPassword }
    };
  });


  // POST /api/v1/crm/contacts/import — import contacts from CSV
  app.post('/contacts/import', async (req, reply) => {
    const { csvData } = req.body as { csvData: string };
    if (!csvData) return reply.badRequest('Missing CSV data');

    const Papa = require('papaparse');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    if (parsed.errors && parsed.errors.length > 0) {
      return reply.badRequest(`CSV Parse Error: ${parsed.errors[0].message}`);
    }

    const rows = parsed.data;
    let successCount = 0;

    for (const row of rows) {
      try {
        let firstName = row.firstName || row.FirstName || row.first_name;
        let lastName = row.lastName || row.LastName || row.last_name;
        const name = row.name || row.Name;
        
        if (!firstName && name) {
          const parts = name.trim().split(/\s+/);
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || 'Contact';
        }

        if (!firstName) continue;

        const email = row.email || row.Email;
        const phone = row.phone || row.Phone;
        const whatsapp = row.whatsapp || row.WhatsApp || row.phone || row.Phone;
        const tier = row.tier || row.Tier || 'BRONZE';

        await app.prisma.contact.create({
          data: {
            firstName,
            lastName: lastName || 'Contact',
            email: email || undefined,
            phone: phone || undefined,
            whatsapp: whatsapp || undefined,
            tier: tier as any,
          }
        });
        successCount++;
      } catch (err) {
        console.error('Failed to import contact row:', row, err);
      }
    }

    return { success: true, count: successCount };
  });
}
