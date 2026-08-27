import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import AgencyClient from "./AgencyClient"
import { notFound } from "next/navigation"

export const revalidate = 300 // Cache and revalidate once every 5 minutes or on demand

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
