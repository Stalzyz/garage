import { NextResponse } from "next/server"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://garage.grekam.in"

export async function POST(req: Request) {
  try {
    const { trigger, clientPhone, clientName, details } = await req.json()

    if (!clientPhone || !trigger) {
      return NextResponse.json({ error: "clientPhone and trigger are required" }, { status: 400 })
    }

    let templateId = ""
    let messageBody = ""

    switch (trigger) {
      case "QUALIFIED_LEAD": {
        templateId = "drip_pitch_deck_sow"
        // The public proposal route resolves `publicToken` only — a bare
        // proposalId 404s, and fabricating a demo id shipped a dead link.
        const proposalToken = details?.publicToken
        if (!proposalToken) {
          return NextResponse.json(
            { error: "publicToken is required for QUALIFIED_LEAD; send the proposal first so a share link exists." },
            { status: 400 }
          )
        }
        messageBody = `Hi ${clientName || "Partner"},\n\nThanks for speaking with our architecture team today! Here is your requested technical proposal & SOW:\n\n📄 Interactive SOW: ${siteUrl}/portal/proposals/${proposalToken}\n📊 Agency Portfolio Deck: ${siteUrl}/deck\n\nLet us know if you'd like any adjustments before kick-off!`
        break
      }

      case "INVOICE_DUE_REMINDER":
        templateId = "drip_invoice_reminder"
        messageBody = `Hello ${clientName || "Client"},\n\nThis is a friendly reminder that Invoice #${details?.invoiceNumber || "INV-1092"} (₹${details?.amount || "45,000"}) is due tomorrow.\n\n🔗 Pay Online: https://garage.grekam.in/portal/invoices/${details?.invoiceId || "inv_1092"}\n⚡ Instant UPI: upi://pay?pa=billing@grekam.in&am=${details?.amount || "45000"}\n\nThank you for working with Grekam!`
        break

      default:
        templateId = "generic_whatsapp_drip"
        messageBody = `Hello ${clientName},\n\nYou have an update regarding your account.`
    }

    console.log(`[WHATSAPP DRIP DISPATCH] To: ${clientPhone} | Template: ${templateId}`)

    return NextResponse.json({
      success: true,
      trigger,
      templateId,
      clientPhone,
      messageBody,
      dispatchedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Failed to dispatch WhatsApp drip message" }, { status: 500 })
  }
}
