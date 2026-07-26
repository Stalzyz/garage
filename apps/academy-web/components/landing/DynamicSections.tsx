import { prisma } from "../../src/lib/prisma";

export async function DynamicSections() {
  let landingPage: any = null;

  try {
    landingPage = await prisma.landingPage.findUnique({
      where: {
        slug: "academy-home",
        isActive: true,
      },
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  } catch (error) {
    console.warn("Could not fetch landing page dynamic content during build.");
  }

  if (!landingPage || !landingPage.sections || landingPage.sections.length === 0) {
    return null;
  }

  return (
    <>
      {landingPage.customCss && (
        <style dangerouslySetInnerHTML={{ __html: landingPage.customCss }} />
      )}
      
      {landingPage.sections.map((section: any) => {
        const content = section.content as any;
        return (
          <section key={section.id} className="relative">
            {content?.customCss && (
              <style dangerouslySetInnerHTML={{ __html: content.customCss }} />
            )}
            
            {content?.customHtml ? (
              <div dangerouslySetInnerHTML={{ __html: content.customHtml }} />
            ) : content?.html ? (
              <div className="container mx-auto px-4 py-16 text-center">
                {content.title && <h2 className="text-3xl font-bold mb-4">{content.title}</h2>}
                <div className="prose prose-lg mx-auto" dangerouslySetInnerHTML={{ __html: content.html }} />
              </div>
            ) : null}
          </section>
        );
      })}
    </>
  );
}
