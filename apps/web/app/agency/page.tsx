import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import AgencyClient, { INITIAL_CARDS } from "./AgencyClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Grekam Visuals — Creative Digital Agency',
  description: 'We build premium digital products, high-end brands, and cinematic video visual effects.',
  openGraph: {
    title: 'Grekam Visuals — Creative Agency',
    description: 'We build premium digital products, high-end brands, and cinematic video visual effects.',
    url: 'https://agency.grekam.in',
    siteName: 'Grekam Visuals',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Grekam Visuals Portfolio',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grekam Visuals',
    description: 'High-end branding & digital product architecture.',
    images: ['/og-image.png'],
  },
}

export default async function AgencyPage() {
  let initialCards = INITIAL_CARDS

  try {
    const page = await prisma.landingPage.findUnique({
      where: { slug: 'agency' },
      include: {
        sections: {
          where: { sectionId: 'agency-main-data' }
        }
      }
    })

    if (page?.sections?.[0]?.content && Array.isArray(page.sections[0].content) && page.sections[0].content.length > 0) {
      const dbCards = page.sections[0].content as any[]
      
      // Map over default INITIAL_CARDS and apply DB overrides if present
      initialCards = INITIAL_CARDS.map((defaultCard: any) => {
        const match = dbCards.find((c: any) => c.id === defaultCard.id)
        if (!match) return defaultCard
        const isOldIntro = defaultCard.id === 'intro' && (match.category === 'Manifesto' || match.title === 'The Digital Ecosystem')
        const cardOverride = isOldIntro ? {} : match
        return {
          ...defaultCard,
          ...cardOverride,
          projects: (!isOldIntro && match.projects && match.projects.length > 0) ? match.projects : defaultCard.projects,
          features: (!isOldIntro && match.features && match.features.length > 0) ? match.features : defaultCard.features,
          deliverables: (!isOldIntro && match.deliverables && match.deliverables.length > 0) ? match.deliverables : defaultCard.deliverables,
          techStack: (!isOldIntro && match.techStack && match.techStack.length > 0) ? match.techStack : defaultCard.techStack,
          idealFor: (!isOldIntro && match.idealFor) || defaultCard.idealFor,
          turnaround: (!isOldIntro && match.turnaround) || defaultCard.turnaround,
        }
      })

      // Append custom cards created in CMS that aren't part of default INITIAL_CARDS
      dbCards.forEach((dbCard: any) => {
        if (!initialCards.some((ic: any) => ic.id === dbCard.id)) {
          initialCards.push(dbCard)
        }
      })
    }
  } catch (err) {
    console.error("Failed to fetch agency page from database:", err)
  }

  return (
    <AgencyClient initialCards={initialCards} />
  )
}
