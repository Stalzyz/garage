import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import crypto from "crypto"

const ALGORITHM = "aes-256-cbc"
const SECRET = (process.env.ENCRYPTION_SECRET || "grekam-os-default-secret-32bytes!").slice(0, 32)
const IV_LENGTH = 16

function encrypt(text: string): string {
  if (!text) return ""
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString("hex") + ":" + encrypted.toString("hex")
}

function decrypt(text: string): string {
  if (!text) return ""
  try {
    const [ivHex, encryptedHex] = text.split(":")
    if (!ivHex || !encryptedHex) return text
    const iv = Buffer.from(ivHex, "hex")
    const encrypted = Buffer.from(encryptedHex, "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET), iv)
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch {
    return text
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Read stored keys from IntegrationKey database table
    const keys = await prisma.integrationKey.findMany({
      where: { service: "SMTP", isActive: true },
    })

    const keyMap = new Map<string, string>()
    keys.forEach((k) => {
      keyMap.set(k.keyName, decrypt(k.encryptedValue))
    })

    const org = await prisma.organization.findFirst()

    const host = keyMap.get("SMTP_HOST") || process.env.SMTP_HOST || "smtp.gmail.com"
    const port = keyMap.get("SMTP_PORT") ? parseInt(keyMap.get("SMTP_PORT")!) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587)
    const user = keyMap.get("SMTP_USER") || process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || ""
    const pass = keyMap.get("SMTP_PASS") || process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || ""
    const secureVal = keyMap.get("SMTP_SECURE")
    const secure = secureVal !== undefined ? secureVal === "true" : (process.env.SMTP_SECURE === "true" || port === 465)
    const senderName = keyMap.get("SMTP_SENDER_NAME") || org?.companyName || org?.name || "Grekam Garage OS"
    const senderEmail = keyMap.get("SMTP_FROM") || org?.supportEmail || user || "notifications@grekam.in"
    const ccEmails = keyMap.get("SMTP_CC_EMAILS") || ""

    return NextResponse.json({
      success: true,
      config: {
        host,
        port,
        secure,
        user,
        pass: pass ? "••••••••" : "",
        hasPassword: !!pass,
        senderName,
        senderEmail,
        ccEmails,
        isConfigured: !!(host && user && pass),
        lastTested: new Date().toISOString(),
      },
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
      ccEmails,
      testRecipient, 
      sendTest 
    } = body

    // Read stored keys first to retain password if user passed masked string '••••••••'
    const existingKeys = await prisma.integrationKey.findMany({
      where: { service: "SMTP" },
    })
    const existingMap = new Map<string, string>()
    existingKeys.forEach((k) => existingMap.set(k.keyName, decrypt(k.encryptedValue)))

    const smtpHost = host !== undefined ? host : (existingMap.get("SMTP_HOST") || process.env.SMTP_HOST || "smtp.gmail.com")
    const smtpPort = port ? parseInt(port) : (existingMap.get("SMTP_PORT") ? parseInt(existingMap.get("SMTP_PORT")!) : 587)
    const smtpSecure = secure !== undefined ? Boolean(secure) : (smtpPort === 465)
    
    let smtpUser = user !== undefined ? user : (existingMap.get("SMTP_USER") || process.env.SMTP_USER || "")
    let smtpPass = pass !== undefined ? pass : (existingMap.get("SMTP_PASS") || process.env.SMTP_PASS || "")
    if (pass === "••••••••" || !pass) {
      smtpPass = existingMap.get("SMTP_PASS") || process.env.SMTP_PASS || ""
    }

    const fromName = senderName || existingMap.get("SMTP_SENDER_NAME") || "Grekam Garage OS"
    const fromEmail = senderEmail || existingMap.get("SMTP_FROM") || smtpUser || "notifications@grekam.in"
    const smtpCcEmails = ccEmails !== undefined ? ccEmails : (existingMap.get("SMTP_CC_EMAILS") || "")

    if (sendTest) {
      if (!testRecipient) {
        return NextResponse.json({ error: "Please specify a test recipient email address." }, { status: 400 })
      }

      if (!smtpHost || !smtpUser || !smtpPass) {
        return NextResponse.json({ error: "SMTP host, username, and password are required to test connection." }, { status: 400 })
      }

      // Create test transporter
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      // Send test email
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: testRecipient,
        subject: `🚀 [Verified] SMTP Notification Test — ${fromName}`,
        text: `This is a test notification email sent via your configured SMTP host (${smtpHost}:${smtpPort}) using user '${smtpUser}'. Your email delivery system is fully operational.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0c101d; color: #f8fafc; padding: 32px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">${fromName}</h1>
              <p style="color: #e2e8f0; margin: 4px 0 0 0; font-size: 12px;">SMTP Transactional Notification Engine</p>
            </div>
            <div style="background-color: #131b2e; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #10b981; margin: 0 0 10px 0; font-size: 15px;">✓ SMTP Connection & Authentication Successful!</h3>
              <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
                Your SMTP server credentials have been verified. Automated notification emails, billing alerts, and system crons will be sent cleanly from this address.
              </p>
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #94a3b8;">
                <tr><td style="padding: 4px 0; font-weight: 600;">SMTP Server:</td><td style="color: #f1f5f9;">${smtpHost}:${smtpPort}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">SMTP Username:</td><td style="color: #f1f5f9;">${smtpUser}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Sender Email:</td><td style="color: #f1f5f9;">${fromEmail}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Security:</td><td style="color: #f1f5f9;">${smtpSecure ? "SSL/TLS (Port 465)" : "STARTTLS (Port 587)"}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Timestamp:</td><td style="color: #f1f5f9;">${new Date().toLocaleString("en-IN")}</td></tr>
              </table>
            </div>
            <p style="color: #64748b; font-size: 11px; text-align: center; margin: 0;">
              Sent from Grekam Garage Management OS &bull; Automated SMTP Verification
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

    // Save into IntegrationKey table
    const keysToUpsert = [
      { keyName: "SMTP_HOST", value: smtpHost },
      { keyName: "SMTP_PORT", value: String(smtpPort) },
      { keyName: "SMTP_USER", value: smtpUser },
      { keyName: "SMTP_PASS", value: smtpPass },
      { keyName: "SMTP_FROM", value: fromEmail },
      { keyName: "SMTP_SENDER_NAME", value: fromName },
      { keyName: "SMTP_SECURE", value: String(smtpSecure) },
      { keyName: "SMTP_CC_EMAILS", value: smtpCcEmails },
    ]

    for (const item of keysToUpsert) {
      if (item.value !== undefined) {
        await prisma.integrationKey.upsert({
          where: { service_keyName: { service: "SMTP", keyName: item.keyName } },
          create: {
            service: "SMTP",
            keyName: item.keyName,
            encryptedValue: encrypt(item.value),
            isActive: true,
          },
          update: {
            encryptedValue: encrypt(item.value),
            isActive: true,
          },
        })
      }
    }

    // Update organization record support Email if available
    const org = await prisma.organization.findFirst()
    if (org) {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          supportEmail: fromEmail,
        },
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      message: "SMTP notification server configuration saved successfully!",
      config: {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser,
        hasPassword: !!smtpPass,
        senderName: fromName,
        senderEmail: fromEmail,
        isConfigured: !!(smtpHost && smtpUser && smtpPass),
      },
    })
  } catch (error: any) {
    console.error("SMTP save/test error:", error)
    return NextResponse.json({ error: error.message || "Failed to process SMTP settings" }, { status: 500 })
  }
}

