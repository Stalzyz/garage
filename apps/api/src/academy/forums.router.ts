import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function forumsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/forums/categories
  app.get('/categories', async (req, reply) => {
    const categories = await app.prisma.forumCategory.findMany({
      include: {
        _count: { select: { posts: true } }
      }
    });
    return { data: categories };
  });

  // GET /api/v1/academy/forums/posts
  app.get('/posts', async (req, reply) => {
    const { categoryId } = req.query as { categoryId?: string };
    
    const posts = await app.prisma.forumPost.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
        category: true,
        _count: { select: { replies: true } }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return { data: posts };
  });

  // POST /api/v1/academy/forums/posts
  app.post('/posts', async (req, reply) => {
    const { categoryId, authorId, title, content } = req.body as { categoryId: string; authorId: string; title: string; content: string };
    
    const post = await app.prisma.forumPost.create({
      data: {
        categoryId,
        authorId,
        title,
        content
      }
    });

    // Award 5 XP for creating a post! (Gamification)
    const student = await app.prisma.student.findUnique({ where: { userId: authorId } });
    if (student) {
      await app.prisma.student.update({
        where: { id: student.id },
        data: { xp: { increment: 5 } }
      });
    }
    
    return reply.status(201).send({ success: true, post });
  });

  // GET /api/v1/academy/forums/posts/:id
  app.get('/posts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const post = await app.prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
        replies: {
          include: { author: { select: { firstName: true, lastName: true, role: true } } },
          orderBy: [{ isAccepted: 'desc' }, { createdAt: 'asc' }]
        }
      }
    });

    if (!post) return reply.notFound('Post not found');
    return { data: post };
  });

  // POST /api/v1/academy/forums/posts/:id/replies
  app.post('/posts/:id/replies', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { authorId, content } = req.body as { authorId: string; content: string };

    const forumReply = await app.prisma.forumReply.create({
      data: {
        postId: id,
        authorId,
        content
      }
    });

    // Award 2 XP for replying
    const student = await app.prisma.student.findUnique({ where: { userId: authorId } });
    if (student) {
      await app.prisma.student.update({
        where: { id: student.id },
        data: { xp: { increment: 2 } }
      });
    }

    return reply.status(201).send({ success: true, reply: forumReply });
  });
}
