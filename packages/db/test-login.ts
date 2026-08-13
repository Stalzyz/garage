import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@grekam.in' } });
  console.log("Admin user:", user ? "Found" : "Not Found");
  if (user) {
    console.log("Role:", user.role);
    console.log("Status:", user.status);
    console.log("PasswordHash (starts with):", user.passwordHash.substring(0, 10));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
