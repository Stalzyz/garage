import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { filename = "file.png", contentType = "image/png", prefix = "uploads" } = body

    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
    const key = `${prefix}/${randomUUID()}-${safeFilename}`.replace(/\//g, "_")

    const uploadUrl = `/api/v1/storage/mock-upload/${encodeURIComponent(key)}`
    const downloadUrl = `/uploads/${key}`

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      downloadUrl,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate upload URL" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  })
}
