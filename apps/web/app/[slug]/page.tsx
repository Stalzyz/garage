import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ComponentRegistry } from "@/components/cms/registry"

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
        
        // If it's the new Pro Builder canvas
        if (section.sectionId === 'canvas' && Array.isArray(content)) {
          return (
            <div key={section.id} className="w-full flex flex-col">
              {content.map((node) => {
                const CompDef = ComponentRegistry[node.componentId]
                if (!CompDef) return null
                return <CompDef.component key={node.id} {...node.props} />
              })}
            </div>
          )
        }
        
        // If it's a legacy raw HTML section
        if (content && typeof content === 'object' && content.type === 'html' && content.html) {
          return (
            <div 
              key={section.id} 
              dangerouslySetInnerHTML={{ __html: content.html }} 
              className="w-full"
            />
          )
        }
        
        // If it's legacy cards array, ignore for now (they render in specific agency layout)
        return null
      })}
    </main>
  )
}
