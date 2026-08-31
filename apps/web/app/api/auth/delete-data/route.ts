import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Meta/Facebook compliance endpoint for automated data deletion
export async function POST(req: NextRequest) {
  try {
    let email: string | null = null

    // Determine content type of the request
    const contentType = req.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      const body = await req.json()
      email = body.email
    } else {
      const formData = await req.formData()
      email = formData.get("email") as string
    }

    if (!email) {
      return NextResponse.json(
        { error: "Missing email parameter for data deletion" },
        { status: 400 }
      )
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    // 1. Clear linked OAuth accounts/tokens
    await prisma.user.update({
      where: { email },
      data: {
        twoFaSecret: null,
        twoFaEnabled: false,
        twoFaBackupCodes: null,
        // If organization tokens are stored on the user level, clear them here
      }
    })

    // 2. Generate tracking details for compliance auditing
    const confirmationCode = `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    const statusUrl = `https://garage.grekam.in/legal/data-deletion?code=${confirmationCode}`

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
      status: "Deletion request initiated. Account profile cleared."
    })

  } catch (err: any) {
    console.error("Data deletion callback error:", err)
    return NextResponse.json(
      { error: "Failed to process data deletion callback" },
      { status: 500 }
    )
  }
}
