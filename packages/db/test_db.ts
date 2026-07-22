import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const latest = await prisma.attendance.findMany({
    take: 5,
    orderBy: { clockIn: 'desc' }
  });
  console.log("Latest attendance records:", latest);
}
run();
