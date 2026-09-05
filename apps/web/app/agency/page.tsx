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
  let initialCards = INITIAL_CARDS;

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
      const dbCards = page.sections[0].content as any[];
      initialCards = dbCards.map((card: any) => {
        const defaultCard = INITIAL_CARDS.find(ic => ic.id === card.id);
        return {
          ...defaultCard,
          ...card,
          features: (card.features && card.features.length > 0) ? card.features : defaultCard?.features,
          deliverables: (card.deliverables && card.deliverables.length > 0) ? card.deliverables : defaultCard?.deliverables,
          techStack: (card.techStack && card.techStack.length > 0) ? card.techStack : defaultCard?.techStack,
          idealFor: card.idealFor || defaultCard?.idealFor,
          turnaround: card.turnaround || defaultCard?.turnaround,
        };
      });
    }
  } catch (err) {
    console.error("Failed to fetch agency page from database:", err);
  }

  return (
    <AgencyClient initialCards={initialCards} />
  )
}
