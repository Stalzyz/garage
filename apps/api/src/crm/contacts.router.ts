import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EmailService } from '../automations/email.service';
import bcrypt from 'bcryptjs';
import Papa from 'papaparse';

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
  // Helper to create client portal user and send onboarding email
  async function createPortalUserAndSendInvite(contact: any) {
    if (!contact.email) return null;

    let user = await app.prisma.user.findUnique({ where: { email: contact.email } });
    let tempPassword = '';
    
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8) + "!";
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      
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

    if (tempPassword) {
      const loginUrl = process.env.AUTH_URL || 'https://garage.grekam.in/auth/login';
      const emailHtml = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background-color: #1e3a8a; padding: 32px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em;">Welcome to Grekam OS</h2>
            </div>
            <div style="padding: 40px 32px;">
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-top: 0;">Hi ${user.firstName},</p>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">Your client portal access is ready. You can log in using the credentials below to view your proposals, projects, files, and pay invoices.</p>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 28px 0; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600; width: 100px;">Portal Link</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e3a8a;"><a href="${loginUrl}" style="color: #1e3a8a; text-decoration: underline;">${loginUrl}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Email</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${user.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Passcode</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #b91c1c; font-family: monospace; letter-spacing: 1px;">${tempPassword}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">Log In to Portal</a>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center; margin-top: 36px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                This is an automated system invitation. Please change your passcode after your first login.
              </p>
            </div>
          </div>
        </div>
      `;

      await EmailService.sendEmail(
        user.email,
        'Welcome to the Client Portal',
        emailHtml
      );
    } else {
      const loginUrl = process.env.AUTH_URL || 'https://garage.grekam.in/auth/login';
      const emailHtml = `
        <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="background-color: #1e3a8a; padding: 32px; text-align: center;">
              <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em;">Welcome to Grekam OS</h2>
            </div>
            <div style="padding: 40px 32px;">
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-top: 0;">Hi ${user.firstName},</p>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">Your client portal access is ready. Since you already have an account, you can log in using your existing credentials:</p>
              
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 28px 0; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600; width: 100px;">Portal Link</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e3a8a;"><a href="${loginUrl}" style="color: #1e3a8a; text-decoration: underline;">${loginUrl}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Email</td>
                    <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${user.email}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">Log In to Portal</a>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center; margin-top: 36px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                If you forgot your password, please use the passcode reset option on the login screen.
              </p>
            </div>
          </div>
        </div>
      `;

      await EmailService.sendEmail(
        user.email,
        'Welcome to the Client Portal',
        emailHtml
      );
    }

    return { user, tempPassword };
  }
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
    if (contact.email) {
      await createPortalUserAndSendInvite(contact);
    }
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
    
    // Dissociate related proposals
    await app.prisma.proposal.updateMany({
      where: { contactId: id },
      data: { contactId: null },
    });

    // Dissociate client profiles
    await app.prisma.clientProfile.updateMany({
      where: { contactId: id },
      data: { contactId: null },
    });

    // Delete communication logs
    await app.prisma.communicationLog.deleteMany({
      where: { contactId: id },
    });

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

    const res = await createPortalUserAndSendInvite(contact);

    return { 
      success: true, 
      message: 'Portal credentials generated.',
      credentials: res?.tempPassword ? { email: res.user.email, password: res.tempPassword } : null,
      alreadyExists: !res?.tempPassword
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

    let tempPassword = Math.random().toString(36).slice(-8) + "!";
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    await app.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    const loginUrl = process.env.AUTH_URL || 'https://garage.grekam.in/auth/login';
    const emailHtml = `
      <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #1e3a8a; padding: 32px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em;">Portal Passcode Reset</h2>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-top: 0;">Hi ${user.firstName},</p>
            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">Your client portal passcode has been reset. You can log in using the new temporary passcode below:</p>
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 28px 0; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600; width: 100px;">Portal Link</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e3a8a;"><a href="${loginUrl}" style="color: #1e3a8a; text-decoration: underline;">${loginUrl}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Email</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Temporary Passcode</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #b91c1c; font-family: monospace; letter-spacing: 1px;">${tempPassword}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">Log In to Portal</a>
            </div>

            <p style="font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center; margin-top: 36px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
              Please change this passcode immediately after logging in.
            </p>
          </div>
        </div>
      </div>
    `;

    await EmailService.sendEmail(
      user.email,
      'Your Client Portal PIN has been reset',
      emailHtml
    );

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

    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    if (parsed.errors && parsed.errors.length > 0) {
      return reply.badRequest(`CSV Parse Error: ${parsed.errors[0].message}`);
    }

    const rows = parsed.data as any[];
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
