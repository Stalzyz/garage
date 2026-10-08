import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function reset() {
  const email = 'admin@grekam.in';
  const plainPassword = 'Grekam@Grafty26';
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE' },
    create: {
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      firstName: 'Stalin',
      lastName: 'Kumar',
    }
  });
  
  console.log(`✅ Password reset successfully for ${user.email}`);
  console.log(`New Password: ${plainPassword}`);
}

reset().catch(console.error).finally(() => prisma.$disconnect());
