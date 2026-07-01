const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const p = await prisma.proposal.create({
      data: {
        title: "Test Delete Proposal",
        totalAmount: 100,
        currency: "INR",
        items: {
          create: [{ description: "test", quantity: 1, unitPrice: 100, unit: "units", total: 100 }]
        }
      }
    });
    console.log("Created proposal", p.id);
    
    await prisma.proposal.delete({ where: { id: p.id } });
    console.log("Deleted successfully!");
  } catch (err) {
    console.error("Failed to delete", err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
