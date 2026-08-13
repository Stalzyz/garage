import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug = params.slug

  // Allow only safe filenames — alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid document name" }, { status: 400 })
  }

  // Resolve path: works both in dev (monorepo root) and in standalone build
  const possiblePaths = [
    path.join(process.cwd(), "..", "..", "..", "..", "docs", `${slug}.md`), // standalone: cwd = apps/web/.next/standalone/apps/web
    path.join(process.cwd(), "docs", `${slug}.md`),                         // dev: cwd = monorepo root
    path.join(process.cwd(), "..", "..", "docs", `${slug}.md`),             // dev: cwd = apps/web
  ]

  let content: string | null = null
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      content = fs.readFileSync(p, "utf-8")
      break
    }
  }

  if (!content) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  return NextResponse.json({ content, slug })
}
