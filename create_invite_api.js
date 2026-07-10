const fs = require('fs');
let content = fs.readFileSync('apps/api/src/crm/contacts.router.ts', 'utf-8');

const inviteRoute = `

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
      // Generate temporary password
      tempPassword = Math.random().toString(36).slice(-8) + 'A1!'; // Basic password rules
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
`;

// Insert the new route right before the CSV import route
content = content.replace(
  `  // POST /api/v1/crm/contacts/import`,
  inviteRoute + `\n  // POST /api/v1/crm/contacts/import`
);

fs.writeFileSync('apps/api/src/crm/contacts.router.ts', content);
