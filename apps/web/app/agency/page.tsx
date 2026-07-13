import { prisma } from "@/lib/prisma"
import AgencyClient from "./AgencyClient"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic' // Ensure we always fetch the latest data from the CMS

export default async function AgencyPage() {
  // Fetch the data we seeded in Phase 1
  const page = await prisma.landingPage.findUnique({
    where: { slug: 'agency' },
    include: {
      sections: {
        where: { sectionId: 'agency-main-data' }
      }
    }
  })

  // If the page or section doesn't exist, we could return a 404 or a fallback
  if (!page || !page.sections || page.sections.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-white bg-black">
        <h1 className="text-2xl font-bold mb-4">Agency Data Not Found</h1>
        <p className="text-gray-400">Please seed the agency data in the CMS.</p>
      </div>
    )
  }

  const initialCards = page.sections[0].content as any[]

  return (
    <AgencyClient initialCards={initialCards} />
  )
}
