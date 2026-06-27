import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function CMSPublicPage({ params }: { params: { slug: string } }) {
  const page = await prisma.landingPage.findUnique({
    where: { slug: params.slug },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  })

  if (!page || !page.isActive) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col w-full overflow-x-hidden">
      {page.sections.map((section) => {
        const content = section.content as any
        
        // If it's a raw HTML section
        if (content && typeof content === 'object' && content.type === 'html' && content.html) {
          return (
            <div 
              key={section.id} 
              dangerouslySetInnerHTML={{ __html: content.html }} 
              className="w-full"
            />
          )
        }
        
        // If it's a JSON/Visual builder array, we don't have a default public renderer 
        // for it in this generic catch-all yet. For now, just render a placeholder or ignore it.
        // In a real scenario, you'd map the JSON cards to a React component here.
        return null
      })}
    </main>
  )
}
