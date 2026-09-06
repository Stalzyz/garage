import { prisma } from "@/lib/prisma"
import ClientEditor from "./ClientEditor"
import { INITIAL_CARDS, CINEMATIC_POSTERS_DATA } from "../../../agency/AgencyClient"

export const dynamic = 'force-dynamic'

export default async function AgencyDataEditorPage() {
  const page = await prisma.landingPage.findUnique({
    where: { slug: 'agency' },
    include: { sections: { where: { sectionId: 'agency-main-data' } } }
  })

  let initialCards = INITIAL_CARDS

  if (page && page.sections && page.sections.length > 0 && Array.isArray(page.sections[0].content) && page.sections[0].content.length > 0) {
    initialCards = page.sections[0].content as any[]
  } else {
    // Enrich INITIAL_CARDS with poster metadata defaults
    initialCards = INITIAL_CARDS.map((card: any) => {
      const posterMatch = CINEMATIC_POSTERS_DATA.find((p: any) => p.id === card.id)
      if (posterMatch) {
        return {
          ...card,
          posterTitle1: posterMatch.title1,
          posterTitle2: posterMatch.title2,
          growth: posterMatch.growth,
          gets: posterMatch.gets,
          portalText: posterMatch.portalText,
          topTagLeft: posterMatch.topTagLeft,
          topTagRight: posterMatch.topTagRight,
          gradient: posterMatch.gradient,
          posterCards: posterMatch.cards
        }
      }
      return card
    })
  }

  const initialJson = JSON.stringify(initialCards, null, 2)

  return (
    <div className="h-full">
      <ClientEditor initialJson={initialJson} />
    </div>
  )
}
