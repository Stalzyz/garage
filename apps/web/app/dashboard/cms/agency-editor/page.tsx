import { prisma } from "@/lib/prisma"
import ClientEditor from "./ClientEditor"

export const dynamic = 'force-dynamic'

export default async function AgencyDataEditorPage() {
  const page = await prisma.landingPage.findUnique({
    where: { slug: 'agency' },
    include: { sections: { where: { sectionId: 'agency-main-data' } } }
  })

  let initialJson = "[\n  // No data found\n]"
  
  if (page && page.sections && page.sections.length > 0) {
    initialJson = JSON.stringify(page.sections[0].content, null, 2)
  }

  return (
    <div className="h-full">
      <ClientEditor initialJson={initialJson} />
    </div>
  )
}
