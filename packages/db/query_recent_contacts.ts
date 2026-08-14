import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Recent contacts:", contacts);

  for (const c of contacts) {
    if (c.email) {
      const user = await prisma.user.findUnique({ where: { email: c.email } });
      console.log(`Contact ${c.firstName} ${c.lastName} (${c.email}): User exists? ${!!user}`);
    }
  }
}
run();
