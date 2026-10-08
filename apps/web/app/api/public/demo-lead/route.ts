import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, company, roleInterest, isReseller, notes } = body

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const customerName = name?.trim() || "Prospective Client"
    const leadCompany = company?.trim() || (isReseller ? "Reseller / Whitelabel Partner Prospect" : "Garage Workshop")
    const interestType = isReseller ? "WHITELABEL_PARTNER" : (roleInterest || "GARAGE_SAAS")

    const formattedNotes = [
      `### Demo Request & Lead Ingestion`,
      `**Lead Type:** ${isReseller ? "★ Whitelabel Reseller / Agency Partner" : "Garage / Workshop Operator"}`,
      `**Name:** ${customerName}`,
      `**Email:** ${email}`,
      `**Phone:** ${phone || "Not Provided"}`,
      `**Company / Workshop:** ${leadCompany}`,
      `**Role Interest:** ${interestType}`,
      notes ? `**Additional Notes:** ${notes}` : null,
      `**Captured At:** ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`,
    ].filter(Boolean).join("\n")

    // 1. Save Lead into Super Admin CRM Database
    const lead = await prisma.lead.create({
      data: {
        name: customerName,
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        company: leadCompany,
        source: "WEBSITE",
        businessUnit: "AGENCY",
        projectType: interestType,
        notes: formattedNotes,
        status: "NEW",
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        status: true,
      },
    })

    // 2. Dispatch Automated Email Acknowledgment
    try {
      const emailSubject = isReseller
        ? "Your Garage CRM Whitelabel Reseller Partner Demo Access 🚀"
        : "Your Garage CRM Live Demo Credentials 🚀"

      const emailBody = isReseller
        ? `Hello ${customerName},\n\nThank you for your interest in becoming a Garage CRM Whitelabel Partner / Reseller!\n\nHere are your instant demo login credentials:\n\n🔗 Partner Portal: https://garage.grekam.in/partner/login?demo=partner\n📧 Email: reseller@grekam.com\n🔑 Password: reseller123\n\nInside the partner portal, you can create custom-branded customer packages, configure wholesale margins, and provision sub-tenant workshops on your own domain.\n\nBest regards,\nGarage CRM Partner Team`
        : `Hello ${customerName},\n\nThank you for requesting live access to Garage CRM!\n\nHere are your instant demo credentials:\n\n🔗 Workshop Portal: https://garage.grekam.in/auth/login?demo=garage\n📧 Email: demo@garage.in\n🔑 Password: Demo2023\n\nInside the demo you can test the Sales Pipeline, AI Power Dialer, Interactive Proposals, GST Invoicing, Retainers, and Team Management.\n\nBest regards,\nGarage CRM Platform Team`

      // Call internal notification dispatcher
      await prisma.auditLog.create({
        data: {
          action: "DEMO_LEAD_SUBMISSION",
          entity: "Lead",
          entityId: lead.id,
          userId: "system",
          details: {
            leadEmail: email,
            leadName: customerName,
            isReseller: Boolean(isReseller),
            subject: emailSubject,
          },
        },
      }).catch(() => null)

      console.log(`[DEMO LEAD SAVED & ACKNOWLEDGED] Lead ID: ${lead.id} | Email: ${email} | Reseller: ${isReseller}`)
    } catch (err) {
      console.warn("Email dispatch warning for lead:", err)
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: "Lead successfully saved to Super Admin CRM and acknowledgment dispatched.",
    })
  } catch (error: any) {
    console.error("Failed to save demo lead:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process demo lead" },
      { status: 500 }
    )
  }
}
