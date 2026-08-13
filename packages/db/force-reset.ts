import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  await prisma.user.update({
    where: { email: 'admin@grekam.in' },
    data: { passwordHash }
  });
  
  console.log('Password for admin@grekam.in has been forcibly reset to admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
