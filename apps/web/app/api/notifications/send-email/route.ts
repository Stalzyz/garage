import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { type, recipientEmail, recipientName, details } = await req.json()

    if (!recipientEmail || !type) {
      return NextResponse.json({ error: "recipientEmail and type are required" }, { status: 400 })
    }

    let subject = ""
    let templatePreview = ""

    switch (type) {
      case "WELCOME_GARAGE":
        subject = `Welcome to Grekam Garage OS - ${details?.garageName || "Your Garage"}`
        templatePreview = `Hello ${recipientName || "Garage Owner"},\n\nYour garage workspace "${details?.garageName || "Your Garage"}" has been successfully provisioned on Grekam Garage OS.\n\nLogin URL: ${details?.loginUrl || "http://localhost:8888/auth/login"}\nPlan: ${details?.plan || "Growth Garage"}\n\nBest regards,\nGrekam Platform Team`
        break

      case "RESELLER_PAYOUT":
        subject = `Payout Notification: ₹${details?.amount || "0"} Credited to Your Account`
        templatePreview = `Hello ${recipientName || "Reseller Partner"},\n\nYour wholesale commission payout of ₹${details?.amount || "0"} for statement #${details?.statementId || "PAYOUT-101"} has been processed.\n\nBest regards,\nGrekam Finance Department`
        break

      case "SUBSCRIPTION_RENEWAL_WARNING":
        subject = `Action Required: Subscription Renewal Warning for ${details?.garageName}`
        templatePreview = `Hello ${recipientName},\n\nYour subscription for "${details?.garageName}" is set to expire on ${details?.expiryDate}.\n\nPlease renew your license to avoid service interruption.\n\nBest regards,\nGrekam Support`
        break

      default:
        subject = "Notification from Grekam SaaS Platform"
        templatePreview = `Hello ${recipientName},\n\nYou have received a new notification regarding your account.`
    }

    // Console log for demo verification
    console.log(`[EMAIL DISPATCH] To: ${recipientEmail} | Subject: ${subject}`)

    return NextResponse.json({
      success: true,
      type,
      recipientEmail,
      subject,
      templatePreview,
      dispatchedAt: new Date().toISOString(),
      message: `Email notification successfully dispatched to ${recipientEmail}`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to dispatch email notification" }, { status: 500 })
  }
}
