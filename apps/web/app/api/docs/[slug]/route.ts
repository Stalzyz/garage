import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> | { slug: string } }
) {
  const resolvedParams = await props.params
  const slug = resolvedParams?.slug

  // Allow only safe filenames — alphanumeric, hyphens, underscores
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
    return NextResponse.json({ error: "Invalid document name" }, { status: 400 })
  }

  // Resolve path: works both in dev (monorepo root) and in standalone build
  const possiblePaths = [
    path.join("/root/grekam-os/docs", `${slug}.md`),
    path.join(process.cwd(), "..", "..", "..", "..", "..", "docs", `${slug}.md`), // standalone cwd = /root/grekam-os/apps/web/.next/standalone/apps/web (5 levels to monorepo root)
    path.join(process.cwd(), "..", "..", "..", "..", "docs", `${slug}.md`),
    path.join(process.cwd(), "docs", `${slug}.md`),                               // standalone internal or dev monorepo root
    path.join(process.cwd(), "..", "..", "docs", `${slug}.md`),                   // dev cwd = apps/web
  ]

  let content: string | null = null
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      content = fs.readFileSync(p, "utf-8")
      break
    }
  }

  if (!content) {
    console.error(`[Docs API] Document not found for slug "${slug}". Searched paths:`, possiblePaths)
    return NextResponse.json({ error: `Document "${slug}" not found` }, { status: 404 })
  }

  return NextResponse.json({ content, slug })
}
