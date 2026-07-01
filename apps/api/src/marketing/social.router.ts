import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GeneratePostSchema = z.object({
  topic: z.string().min(5),
  platform: z.enum(['LinkedIn', 'Instagram', 'Twitter']),
  tone: z.enum(['Professional', 'Casual', 'Inspirational', 'Educational']),
});

const SchedulePostSchema = z.object({
  platform: z.enum(['LinkedIn', 'Instagram', 'Twitter']),
  content: z.string(),
  scheduledFor: z.string().datetime(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).default('SCHEDULED'),
});

export default async function socialRouter(app: FastifyInstance) {
  // GET /api/v1/marketing/social
  app.get('/social', async (req, reply) => {
    const posts = await app.prisma.socialPost.findMany({
      orderBy: { publishAt: 'asc' }
    });
    // Map publishAt back to scheduledFor for the frontend
    return { data: posts.map(p => ({...p, scheduledFor: p.publishAt})) };
  });

  // POST /api/v1/marketing/social/generate
  app.post('/social/generate', async (req, reply) => {
    const body = GeneratePostSchema.parse(req.body);
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Write a ${body.tone} social media post for ${body.platform} about: "${body.topic}". 
      Include appropriate emojis and 3-5 relevant hashtags.
      Make it engaging and optimized for the specific platform format.
      Do not include any introductory text, just the post content itself.`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      return { content: content.trim() };
    } catch (error) {
      console.error("AI Generation Error:", error);
      // Fallback if API key is missing or invalid
      return { 
        content: `🚀 Here is a great ${body.tone} post about ${body.topic} for ${body.platform}!\n\n(Note: This is a fallback mock because the Gemini API key was not configured or failed.)\n\n#Design #${body.platform}` 
      };
    }
  });

  // POST /api/v1/marketing/social/schedule
  app.post('/social/schedule', async (req, reply) => {
    const body = SchedulePostSchema.parse(req.body);
    
    const post = await app.prisma.socialPost.create({
      data: {
        platform: body.platform,
        content: body.content,
        publishAt: new Date(body.scheduledFor),
        status: body.status,
        authorId: 'system' // Placeholder for actual user ID from auth
      }
    });
    
    reply.code(201);
    return post;
  });
}
