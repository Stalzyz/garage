import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function cleanProduction() {
  console.log(" Starting Production Database Purge...")

  try {
    // 1. Fetch Super Admin IDs to keep
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      select: { id: true, email: true }
    })
    const superAdminIds = superAdmins.map(u => u.id)
    console.log(` Found ${superAdmins.length} Super Admin(s) to keep:`, superAdmins.map(u => u.email).join(", "))

    // 2. Delete Partner & Whitelabel related tables
    console.log(" Clearing Partner data...")
    if ((prisma as any).partnerCommission) await (prisma as any).partnerCommission.deleteMany({})
    if ((prisma as any).partnerDeposit) await (prisma as any).partnerDeposit.deleteMany({})
    if ((prisma as any).partnerKyc) await (prisma as any).partnerKyc.deleteMany({})
    if ((prisma as any).partnerWhiteLabel) await (prisma as any).partnerWhiteLabel.deleteMany({})
    if ((prisma as any).partnerWallet) await (prisma as any).partnerWallet.deleteMany({})
    await prisma.partner.deleteMany({})

    // 3. Delete Tenant & Organization related tables
    console.log(" Clearing Tenant & Garage data...")
    await prisma.tenantMember.deleteMany({})
    await prisma.tenantBranding.deleteMany({})
    await prisma.tenantFeatures.deleteMany({})
    if ((prisma as any).tenantSubscription) await (prisma as any).tenantSubscription.deleteMany({})
    await prisma.tenant.deleteMany({})
    await prisma.organization.deleteMany({})

    // 4. Delete CRM & ERP data (Leads, Invoices, Deals, Expenses, Transactions, Projects, Tasks, etc.)
    console.log(" Clearing CRM, Finance, Garage & Operational dummy data...")
    if ((prisma as any).invoiceItem) await (prisma as any).invoiceItem.deleteMany({})
    if ((prisma as any).invoice) await (prisma as any).invoice.deleteMany({})
    if ((prisma as any).proposal) await (prisma as any).proposal.deleteMany({})
    if ((prisma as any).deal) await (prisma as any).deal.deleteMany({})
    if ((prisma as any).contact) await (prisma as any).contact.deleteMany({})
    if ((prisma as any).lead) await (prisma as any).lead.deleteMany({})

    if ((prisma as any).expense) await (prisma as any).expense.deleteMany({})
    if ((prisma as any).transaction) await (prisma as any).transaction.deleteMany({})
    if ((prisma as any).payment) await (prisma as any).payment.deleteMany({})

    if ((prisma as any).task) await (prisma as any).task.deleteMany({})
    if ((prisma as any).project) await (prisma as any).project.deleteMany({})

    if ((prisma as any).workshopBooking) await (prisma as any).workshopBooking.deleteMany({})
    if ((prisma as any).serviceTicket) await (prisma as any).serviceTicket.deleteMany({})
    if ((prisma as any).workOrder) await (prisma as any).workOrder.deleteMany({})
    if ((prisma as any).estimate) await (prisma as any).estimate.deleteMany({})
    if ((prisma as any).vehicle) await (prisma as any).vehicle.deleteMany({})
    if ((prisma as any).customer) await (prisma as any).customer.deleteMany({})
    if ((prisma as any).inventoryItem) await (prisma as any).inventoryItem.deleteMany({})

    if ((prisma as any).employee) await (prisma as any).employee.deleteMany({})
    if ((prisma as any).payroll) await (prisma as any).payroll.deleteMany({})
    if ((prisma as any).attendance) await (prisma as any).attendance.deleteMany({})

    if ((prisma as any).activityLog) await (prisma as any).activityLog.deleteMany({})
    if ((prisma as any).auditLog) await (prisma as any).auditLog.deleteMany({})
    if ((prisma as any).notification) await (prisma as any).notification.deleteMany({})
    if ((prisma as any).session) await (prisma as any).session.deleteMany({})

    // 5. Delete non-Super-Admin Users
    console.log(" Clearing non-super-admin users...")
    const deleteUsersResult = await prisma.user.deleteMany({
      where: {
        id: { notIn: superAdminIds }
      }
    })
    console.log(` Deleted ${deleteUsersResult.count} dummy user account(s).`)

    // 6. Verify SystemPlans remain intact
    const planCount = await prisma.systemPlan.count()
    console.log(` System Plans intact: ${planCount} plans available.`)

    console.log(" Production Database Purge Complete! System is clean and ready.")
  } catch (error) {
    console.error(" Error purging production database:", error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanProduction()
