import { NextResponse } from "next/server"

// Store active Expo push tokens
const tokenStore = new Map<string, { token: string; platform: string; registeredAt: string }>()

export async function POST(req: Request) {
  try {
    const { token, platform } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "Push token is required" }, { status: 400 })
    }

    tokenStore.set(token, {
      token,
      platform: platform || "unknown",
      registeredAt: new Date().toISOString(),
    })

    console.log(`[PUSH TOKEN REGISTERED] Token: ${token} | Platform: ${platform}`)

    return NextResponse.json({
      success: true,
      token,
      totalRegisteredTokens: tokenStore.size,
      registeredAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Failed to register push token" }, { status: 500 })
  }
}

export async function GET() {
  const tokens = Array.from(tokenStore.values())
  return NextResponse.json({
    total: tokens.length,
    tokens,
  })
}
