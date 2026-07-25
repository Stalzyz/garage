import { PrismaClient } from '@prisma/client';
import { decrypt } from './apps/api/src/settings/integrations.router';

const prisma = new PrismaClient();
async function main() {
  const keys = await prisma.integrationKey.findMany({ where: { service: 'SMTP' } });
  for (const k of keys) {
    console.log(k.keyName, '=', decrypt(k.encryptedValue));
  }
}
main().finally(() => prisma.$disconnect());
