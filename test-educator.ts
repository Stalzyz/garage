import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.educator.findMany({ include: { user: true }, orderBy: { user: { firstName: 'asc' } } }).then(console.log).catch(console.error).finally(() => prisma.$disconnect());
