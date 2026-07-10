const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@grekam.com' },
    update: { passwordHash: hash, role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@grekam.com',
      passwordHash: hash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN'
    }
  });
  console.log("User admin@grekam.com created successfully.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
