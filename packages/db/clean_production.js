const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function cleanProduction() {
  console.log("🚀 Starting Production Database Purge...");

  try {
    // 1. Fetch Super Admin IDs to keep
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true, email: true }
    });
    const superAdminIds = superAdmins.map(u => u.id);
    console.log(`✅ Found ${superAdmins.length} Super Admin(s) to keep:`, superAdmins.map(u => u.email).join(", "));

    // 2. Delete Partner & Whitelabel related tables
    console.log("🧹 Clearing Partner data...");
    if (prisma.partnerCommission) await prisma.partnerCommission.deleteMany({});
    if (prisma.partnerDeposit) await prisma.partnerDeposit.deleteMany({});
    if (prisma.partnerKyc) await prisma.partnerKyc.deleteMany({});
    if (prisma.partnerWhiteLabel) await prisma.partnerWhiteLabel.deleteMany({});
    if (prisma.partnerWallet) await prisma.partnerWallet.deleteMany({});
    if (prisma.partner) await prisma.partner.deleteMany({});

    // 3. Delete Tenant & Organization related tables
    console.log("🧹 Clearing Tenant & Garage data...");
    if (prisma.tenantMember) await prisma.tenantMember.deleteMany({});
    if (prisma.tenantBranding) await prisma.tenantBranding.deleteMany({});
    if (prisma.tenantFeatures) await prisma.tenantFeatures.deleteMany({});
    if (prisma.tenantSubscription) await prisma.tenantSubscription.deleteMany({});
    if (prisma.tenant) await prisma.tenant.deleteMany({});
    if (prisma.organization) await prisma.organization.deleteMany({});

    // 4. Delete CRM & ERP data (Leads, Invoices, Deals, Expenses, Transactions, Projects, Tasks, etc.)
    console.log("🧹 Clearing CRM, Finance, Garage & Operational dummy data...");
    if (prisma.invoiceItem) await prisma.invoiceItem.deleteMany({});
    if (prisma.invoice) await prisma.invoice.deleteMany({});
    if (prisma.proposal) await prisma.proposal.deleteMany({});
    if (prisma.deal) await prisma.deal.deleteMany({});
    if (prisma.contact) await prisma.contact.deleteMany({});
    if (prisma.lead) await prisma.lead.deleteMany({});

    if (prisma.expense) await prisma.expense.deleteMany({});
    if (prisma.transaction) await prisma.transaction.deleteMany({});
    if (prisma.payment) await prisma.payment.deleteMany({});

    if (prisma.task) await prisma.task.deleteMany({});
    if (prisma.project) await prisma.project.deleteMany({});

    if (prisma.workshopBooking) await prisma.workshopBooking.deleteMany({});
    if (prisma.serviceTicket) await prisma.serviceTicket.deleteMany({});
    if (prisma.workOrder) await prisma.workOrder.deleteMany({});
    if (prisma.estimate) await prisma.estimate.deleteMany({});
    if (prisma.vehicle) await prisma.vehicle.deleteMany({});
    if (prisma.customer) await prisma.customer.deleteMany({});
    if (prisma.inventoryItem) await prisma.inventoryItem.deleteMany({});

    if (prisma.employee) await prisma.employee.deleteMany({});
    if (prisma.payroll) await prisma.payroll.deleteMany({});
    if (prisma.attendance) await prisma.attendance.deleteMany({});

    if (prisma.activityLog) await prisma.activityLog.deleteMany({});
    if (prisma.auditLog) await prisma.auditLog.deleteMany({});
    if (prisma.notification) await prisma.notification.deleteMany({});
    if (prisma.session) await prisma.session.deleteMany({});

    // 5. Delete non-Super-Admin Users
    console.log("🧹 Clearing non-super-admin users...");
    const deleteUsersResult = await prisma.user.deleteMany({
      where: {
        id: { notIn: superAdminIds }
      }
    });
    console.log(`✅ Deleted ${deleteUsersResult.count} dummy user account(s).`);

    // 6. Verify SystemPlans remain intact
    const planCount = await prisma.systemPlan.count();
    console.log(`🎉 System Plans intact: ${planCount} payment plan(s) available.`);

    console.log("✨ Production Database Purge Complete! System is clean and ready.");
  } catch (error) {
    console.error("❌ Error purging production database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanProduction();
