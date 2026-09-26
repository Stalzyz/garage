import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { planId, planName, amount, currency = "INR", garageId, gateway = "stripe" } = body

    if (!amount || !planName) {
      return NextResponse.json({ error: "planName and amount are required" }, { status: 400 })
    }

    const sessionId = `chk_${gateway}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
    
    // In production, integrate Stripe (`stripe.checkout.sessions.create`) or Razorpay (`razorpay.orders.create`).
    // For local dev / demo, generate a hosted payment gateway checkout URL:
    const hostedCheckoutUrl = `/api/billing/checkout/mock-gateway?session_id=${sessionId}&amount=${amount}&plan=${encodeURIComponent(
      planName
    )}&garage_id=${garageId || "g-direct"}`

    return NextResponse.json({
      success: true,
      gateway,
      sessionId,
      planName,
      amount,
      currency,
      checkoutUrl: hostedCheckoutUrl,
      message: `Checkout session initialized via ${gateway.toUpperCase()}`,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to initialize payment checkout session" }, { status: 500 })
  }
}
