import { FastifyInstance } from 'fastify';
import aiRouter from './ai.router';

export default async function cmsRouter(app: FastifyInstance) {
  await app.register(aiRouter);

  // GET /api/v1/cms/pages — List all landing pages
  app.get('/pages', async (req, reply) => {
    const pages = await app.prisma.landingPage.findMany({
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    return { data: pages };
  });

  // GET /api/v1/cms/pages/:identifier — Get specific page by slug or ID
  app.get('/pages/:identifier', async (req, reply) => {
    const { identifier } = req.params as { identifier: string };
    
    const page = await app.prisma.landingPage.findFirst({
      where: { 
        OR: [
          { slug: identifier },
          { id: identifier }
        ]
      },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!page) {
      return reply.status(404).send({ error: 'Page not found' });
    }

    // Return under both `data` (old) and `page` (new) for compatibility
    return { data: page, page };
  });

  // PATCH /api/v1/cms/pages/:identifier — Update page content by ID
  app.patch('/pages/:identifier', async (req, reply) => {
    const { identifier } = req.params as { identifier: string };
    const { customHtml, customCss, title, description } = req.body as { customHtml?: string, customCss?: string, title?: string, description?: string };
    
    const existing = await app.prisma.landingPage.findFirst({
      where: { 
        OR: [{ slug: identifier }, { id: identifier }]
      }
    });

    if (!existing) return reply.status(404).send({ error: 'Page not found' });

    const page = await app.prisma.landingPage.update({
      where: { id: existing.id },
      data: {
        customHtml,
        customCss,
        title,
        description
      }
    });

    return { data: page };
  });

  // POST /api/v1/cms/pages — Create a new page
  app.post('/pages', async (req, reply) => {
    const { slug, title, description } = req.body as { slug: string, title: string, description?: string };
    
    const page = await app.prisma.landingPage.create({
      data: { slug, title, description }
    });

    return { data: page };
  });

  // POST /api/v1/cms/pages/:slug/sections — Create a new section
  app.post('/pages/:slug/sections', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const { sectionId, content, sortOrder } = req.body as { sectionId: string, content: any, sortOrder?: number };
    
    const page = await app.prisma.landingPage.findUnique({ where: { slug } });
    if (!page) return reply.status(404).send({ error: 'Page not found' });

    const section = await app.prisma.pageSection.create({
      data: {
        landingPageId: page.id,
        sectionId,
        content,
        sortOrder: sortOrder || 0
      }
    });

    return { data: section };
  });

  // PUT /api/v1/cms/pages/:slug/sections/:sectionId — Update section content
  app.put('/pages/:slug/sections/:sectionId', async (req, reply) => {
    const { slug, sectionId } = req.params as { slug: string, sectionId: string };
    const { content } = req.body as { content: any };
    
    const page = await app.prisma.landingPage.findUnique({ where: { slug } });
    if (!page) return reply.status(404).send({ error: 'Page not found' });

    const section = await app.prisma.pageSection.upsert({
      where: {
        landingPageId_sectionId: {
          landingPageId: page.id,
          sectionId
        }
      },
      update: { content },
      create: {
        landingPageId: page.id,
        sectionId,
        content
      }
    });

    return { data: section };
  });

  // DELETE /api/v1/cms/pages/:slug/sections/:sectionId — Delete a section
  app.delete('/pages/:slug/sections/:sectionId', async (req, reply) => {
    const { slug, sectionId } = req.params as { slug: string, sectionId: string };

    const page = await app.prisma.landingPage.findUnique({
      where: { slug }
    });

    if (!page) {
      return reply.code(404).send({ error: 'Page not found' });
    }

    try {
      await app.prisma.pageSection.delete({
        where: {
          landingPageId_sectionId: {
            landingPageId: page.id,
            sectionId
          }
        }
      });
      return { success: true };
    } catch (e) {
      return reply.code(404).send({ error: 'Section not found' });
    }
  });
}
