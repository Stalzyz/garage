import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const leads = await prisma.lead.findMany();
  console.log(`Total leads: ${leads.length}`);
  const withPhone = leads.filter(l => !!l.phone);
  console.log(`Leads with phone: ${withPhone.length}`);
  console.log("Sample leads with phone:", withPhone.slice(0, 5));
}
run();
