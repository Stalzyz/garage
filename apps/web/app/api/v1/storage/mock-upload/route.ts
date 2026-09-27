import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"

export async function PUT(req: Request) {
  return handleUpload(req)
}

export async function POST(req: Request) {
  return handleUpload(req)
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

async function handleUpload(req: Request) {
  try {
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const contentType = req.headers.get("content-type") || "application/octet-stream"
    const extension = contentType.includes("image/png") ? ".png" : contentType.includes("image/jpeg") ? ".jpg" : contentType.includes("image/webp") ? ".webp" : ".bin"
    const fileName = `upload-${Date.now()}-${randomUUID()}${extension}`
    const filePath = path.join(uploadsDir, fileName)

    const arrayBuffer = await req.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

    const downloadUrl = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      key: fileName,
      url: downloadUrl,
      downloadUrl,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
      }
    })
  } catch (error: any) {
    console.error("Mock upload error in web API:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
