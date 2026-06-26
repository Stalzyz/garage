import { PrismaClient } from '@grekam/db';

// Export a singleton Prisma Client instance
export const prisma = new PrismaClient();
