import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.updateMany({
    where: { email: 'admin@grekam.com' },
    data: { passwordHash }
  });
  console.log('Password for admin@grekam.com has been forcibly reset to admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
