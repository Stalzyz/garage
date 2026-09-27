import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: subpaths } = await params
  return handleUpload(req, subpaths.join("/"))
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: subpaths } = await params
  return handleUpload(req, subpaths.join("/"))
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  })
}

async function handleUpload(req: Request, customKey?: string) {
  try {
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const safeKey = (customKey || `upload-${Date.now()}-${randomUUID()}`).replace(/[^a-zA-Z0-9.\-_]/g, "_")
    const filePath = path.join(uploadsDir, safeKey)

    const arrayBuffer = await req.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

    const downloadUrl = `/uploads/${safeKey}`

    return NextResponse.json({
      success: true,
      key: safeKey,
      url: downloadUrl,
      downloadUrl,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    })
  } catch (error: any) {
    console.error("Mock upload with path error in web API:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
