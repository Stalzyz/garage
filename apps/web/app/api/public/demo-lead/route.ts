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

    // 2. Dispatch Automated Email Acknowledgment with Credentials
    try {
      const isBoth = roleInterest === "BOTH"
      const emailSubject = isReseller || roleInterest === "WHITELABEL_PARTNER"
        ? "Your Garage CRM Whitelabel Reseller Partner Demo Access 🚀"
        : isBoth
        ? "Your Garage CRM & Reseller All-Access Demo Credentials 🚀"
        : "Your Garage CRM Live Demo Credentials 🚀"

      const garageCredsHtml = `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin:16px 0;color:#f8fafc;">
          <h3 style="color:#10b981;margin-top:0;">🔧 Direct Garage & Agency Portal</h3>
          <p style="margin:4px 0;"><strong>URL:</strong> <a href="https://garage.grekam.in/auth/login?demo=garage" style="color:#38bdf8;">https://garage.grekam.in/auth/login?demo=garage</a></p>
          <p style="margin:4px 0;"><strong>Email:</strong> <code style="background:#1e293b;padding:2px 6px;border-radius:4px;">demo@garage.in</code></p>
          <p style="margin:4px 0;"><strong>Password:</strong> <code style="background:#1e293b;padding:2px 6px;border-radius:4px;">Demo2023</code></p>
        </div>
      `

      const resellerCredsHtml = `
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px;margin:16px 0;color:#f8fafc;">
          <h3 style="color:#a855f7;margin-top:0;">💼 Whitelabel Reseller Partner Portal</h3>
          <p style="margin:4px 0;"><strong>URL:</strong> <a href="https://garage.grekam.in/partner/login?demo=partner" style="color:#38bdf8;">https://garage.grekam.in/partner/login?demo=partner</a></p>
          <p style="margin:4px 0;"><strong>Email:</strong> <code style="background:#1e293b;padding:2px 6px;border-radius:4px;">reseller@grekam.com</code></p>
          <p style="margin:4px 0;"><strong>Password:</strong> <code style="background:#1e293b;padding:2px 6px;border-radius:4px;">reseller123</code></p>
        </div>
      `

      const htmlContent = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#030712;color:#ffffff;border-radius:16px;">
          <h2 style="color:#60a5fa;margin-top:0;">Welcome to Garage CRM, ${customerName}!</h2>
          <p style="color:#94a3b8;font-size:14px;line-height:1.6;">
            Thank you for requesting live demo access. Below are your instant credentials to test our high-velocity CRM, proposal generator, sprint delivery boards, and GST invoicing engines.
          </p>

          ${(isBoth || (!isReseller && roleInterest !== "WHITELABEL_PARTNER")) ? garageCredsHtml : ""}
          ${(isBoth || isReseller || roleInterest === "WHITELABEL_PARTNER") ? resellerCredsHtml : ""}

          <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid #1e293b;padding-top:16px;">
            Need a guided walkthrough or custom onboarding for your team? Reply to this email or reach us on WhatsApp: +91 97893 59407.
          </p>
        </div>
      `

      try {
        const { sendEmail } = await import("@/lib/email")
        await sendEmail({
          to: email.toLowerCase().trim(),
          subject: emailSubject,
          html: htmlContent,
        })
      } catch (mailErr: any) {
        console.warn("[DEMO LEAD EMAIL DISPATCH NON-FATAL]:", mailErr.message)
      }

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
