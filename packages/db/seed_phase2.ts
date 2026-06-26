import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding Phase 2 Data...");

  // Contacts
  const contactsCount = await prisma.contact.count();
  if (contactsCount === 0) {
    await prisma.company.create({
      data: {
        name: "TechFlow Inc.",
        contacts: {
          create: { firstName: "Sarah", lastName: "Jenkins", email: "sarah@techflow.io", tier: "GOLD" }
        }
      }
    });
    await prisma.company.create({
      data: {
        name: "NovaSpace",
        contacts: {
          create: { firstName: "Marcus", lastName: "Chen", email: "marcus.c@novaspace.net", tier: "SILVER" }
        }
      }
    });
    console.log("Contacts seeded.");
  }

  // Finance
  const invoiceCount = await prisma.invoice.count();
  if (invoiceCount === 0) {
    const dueDate1 = new Date(); dueDate1.setDate(dueDate1.getDate() + 15);
    const dueDate2 = new Date(); dueDate2.setDate(dueDate2.getDate() - 5);

    await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2025-042",
        clientName: "RedBrick Realty",
        businessUnit: "AGENCY",
        status: "PAID",
        totalAmount: 420000,
        subtotal: 355932,
        cgst: 32034,
        sgst: 32034,
        dueDate: dueDate1,
        items: {
          create: [{ description: "Brand Design", quantity: 1, unitPrice: 355932, taxRate: 18, total: 420000, sortOrder: 0 }]
        }
      }
    });
    await prisma.invoice.create({
      data: {
        invoiceNumber: "INV-2025-044",
        clientName: "Fitburst Gym",
        businessUnit: "AGENCY",
        status: "OVERDUE",
        totalAmount: 141600,
        subtotal: 120000,
        cgst: 10800,
        sgst: 10800,
        dueDate: dueDate2,
        items: {
          create: [{ description: "Social Media Retainer", quantity: 1, unitPrice: 120000, taxRate: 18, total: 141600, sortOrder: 0 }]
        }
      }
    });
    console.log("Invoices seeded.");
  }

  // Academy Courses & Batches
  const courseCount = await prisma.course.count();
  if (courseCount === 0) {
    await prisma.course.create({
      data: {
        name: "UI/UX Design",
        code: "UIUX-101",
        duration: "3 months",
        fee: 45000,
        isPublished: true,
        batches: {
          create: [
            {
              name: "UI/UX Bootcamp '25",
              type: "ONLINE",
              capacity: 25,
              startDate: new Date("2025-07-01"),
              endDate: new Date("2025-09-30"),
              isActive: true,
            }
          ]
        }
      }
    });
    console.log("Courses/Batches seeded.");
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
