import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";

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
  console.log("User admin@grekam.com created successfully. Password: password123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
