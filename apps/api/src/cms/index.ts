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

  // GET /api/v1/cms/pages/:slug — Get specific page with sections
  app.get('/pages/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    
    const page = await app.prisma.landingPage.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!page) {
      return reply.status(404).send({ error: 'Page not found' });
    }

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
}
