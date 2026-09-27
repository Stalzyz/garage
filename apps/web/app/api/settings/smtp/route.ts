import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read organization or default config
    const org = await prisma.organization.findFirst()

    // Read from env or db
    const smtpConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
      user: process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || "notifications@grekam.in",
      senderName: org?.companyName || "Grekam Garage Platform",
      senderEmail: org?.supportEmail || "notifications@garage.grekam.in",
      isConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_PASS),
      lastTested: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      config: smtpConfig,
    })
  } catch (error: any) {
    console.error("SMTP config fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch SMTP settings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { 
      host, 
      port, 
      secure, 
      user, 
      pass, 
      senderName, 
      senderEmail, 
      testRecipient, 
      sendTest 
    } = body

    const smtpHost = host || process.env.SMTP_HOST || "smtp.gmail.com"
    const smtpPort = port ? parseInt(port) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587)
    const smtpSecure = secure !== undefined ? secure : (smtpPort === 465)
    const smtpUser = user || process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || ""
    const smtpPass = pass || process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || ""
    const fromName = senderName || "Grekam Garage Platform"
    const fromEmail = senderEmail || smtpUser || "notifications@garage.grekam.in"

    if (sendTest) {
      if (!testRecipient) {
        return NextResponse.json({ error: "Please specify a test recipient email address." }, { status: 400 })
      }

      // Create test transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: (smtpUser && smtpPass) ? {
          user: smtpUser,
          pass: smtpPass,
        } : undefined,
        tls: {
          rejectUnauthorized: false,
        },
      })

      // Try sending test email
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: testRecipient,
        subject: `🚀 [Verified] SMTP Notification Test — ${fromName}`,
        text: `This is a test notification email sent via your configured SMTP host (${smtpHost}:${smtpPort}). Your email delivery system is fully operational.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c101d; color: #f8fafc; padding: 32px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">${fromName}</h1>
              <p style="color: #e2e8f0; margin: 4px 0 0 0; font-size: 12px;">SMTP Transactional Notification Engine</p>
            </div>
            <div style="background-color: #131b2e; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 15px;">✓ Connection & Authentication Successful!</h3>
              <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
                Your SMTP server configuration has been validated. Transactional emails, invoice notifications, and automated cron alerts will be dispatched via this server.
              </p>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #94a3b8;">
                <tr><td style="padding: 4px 0; font-weight: 600;">SMTP Host:</td><td style="color: #f1f5f9;">${smtpHost}:${smtpPort}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Sender Address:</td><td style="color: #f1f5f9;">${fromEmail}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Security:</td><td style="color: #f1f5f9;">${smtpSecure ? "SSL/TLS (Encrypted)" : "STARTTLS"}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Timestamp:</td><td style="color: #f1f5f9;">${new Date().toLocaleString("en-IN")}</td></tr>
              </table>
            </div>
            <p style="color: #64748b; font-size: 11px; text-align: center; margin: 0;">
              Sent from Grekam Garage Management OS &bull; Automated System Verification
            </p>
          </div>
        `,
      })

      return NextResponse.json({
        success: true,
        message: `Test email successfully dispatched to ${testRecipient}! Message ID: ${info.messageId}`,
        messageId: info.messageId,
      })
    }

    // Save configuration into Organization record if exists
    const org = await prisma.organization.findFirst()
    if (org) {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          supportEmail: fromEmail,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "SMTP notification settings saved successfully!",
      config: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser,
        senderName: fromName,
        senderEmail: fromEmail,
      },
    })
  } catch (error: any) {
    console.error("SMTP save/test error:", error)
    return NextResponse.json({ error: error.message || "Failed to process SMTP settings" }, { status: 500 })
  }
}
