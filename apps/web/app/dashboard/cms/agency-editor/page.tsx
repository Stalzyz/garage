import { prisma } from "@/lib/prisma"
import ClientEditor from "./ClientEditor"
import { INITIAL_CARDS, CINEMATIC_POSTERS_DATA } from "../../../agency/agency-data"

export const dynamic = 'force-dynamic'

export default async function AgencyDataEditorPage() {
  // Enrich INITIAL_CARDS with poster metadata defaults as base template
  const defaultEnrichedCards = INITIAL_CARDS.map((card: any) => {
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

  let initialCards = defaultEnrichedCards

  try {
    const page = await prisma.landingPage.findUnique({
      where: { slug: 'agency' },
      include: { sections: { where: { sectionId: 'agency-main-data' } } }
    })

    if (page?.sections?.[0]?.content && Array.isArray(page.sections[0].content) && page.sections[0].content.length > 0) {
      const dbCards = page.sections[0].content as any[]
      
      // Map over defaultEnrichedCards and merge DB saved values
      initialCards = defaultEnrichedCards.map((defCard: any) => {
        const match = dbCards.find((c: any) => c.id === defCard.id)
        if (!match) return defCard
        return {
          ...defCard,
          ...match,
          projects: (match.projects && match.projects.length > 0) ? match.projects : defCard.projects,
          features: (match.features && match.features.length > 0) ? match.features : defCard.features,
          deliverables: (match.deliverables && match.deliverables.length > 0) ? match.deliverables : defCard.deliverables,
          techStack: (match.techStack && match.techStack.length > 0) ? match.techStack : defCard.techStack,
        }
      })

      // Append custom cards created in CMS that aren't part of defaultEnrichedCards
      dbCards.forEach((dbC: any) => {
        if (!initialCards.some((ic: any) => ic.id === dbC.id)) {
          initialCards.push(dbC)
        }
      })
    }
  } catch (err) {
    console.error("Failed to load agency page CMS data from database:", err)
  }

  const initialJson = JSON.stringify(initialCards, null, 2)

  return (
    <div className="h-full">
      <ClientEditor initialJson={initialJson} />
    </div>
  )
}
