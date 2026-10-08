import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'admin@grekam.in', mode: 'insensitive' } }
  });
  console.log(`Found ${users.length} matching users:`);
  for (const u of users) {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Role: ${u.role}, Status: ${u.status}`);
    
    // Also, let's just forcefully reset the password on ALL of them
    const plainPassword = 'Grekam@Grafty26';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    await prisma.user.update({
      where: { id: u.id },
      data: { passwordHash, status: 'ACTIVE' }
    });
    console.log(`  -> Password reset for ${u.email}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
