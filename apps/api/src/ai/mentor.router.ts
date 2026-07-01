import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function aiMentorRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/v1/ai/mentor/chat — Interact with the AI Mentor
  server.post('/chat', {
    schema: {
      body: z.object({
        prompt: z.string(),
        context: z.object({
          lessonId: z.string().optional(),
          courseId: z.string().optional(),
          currentProgress: z.number().optional(),
        }).optional(),
      })
    }
  }, async (req, reply) => {
    const { prompt, context } = req.body;
    
    // In a real production environment, this would initialize an OpenAI/Gemini client,
    // inject the lesson context into a system prompt, and return the streamed completion.
    // For now, we return a mocked intelligent response to complete the integration interface.

    let simulatedResponse = "I'm your AI Mentor. Based on your prompt, ";
    
    if (context?.lessonId) {
      simulatedResponse += `I see you are currently studying lesson \${context.lessonId}. `;
    }

    if (prompt.toLowerCase().includes("state")) {
      simulatedResponse += "In modern web architecture, state colocation is crucial. You should keep state as close to the components that need it as possible.";
    } else if (prompt.toLowerCase().includes("quiz")) {
      simulatedResponse += "I can help you review for your upcoming quiz. What specific concepts are you struggling with?";
    } else {
      simulatedResponse += "I'm analyzing the context of your learning journey to provide the best possible answer.";
    }

    return reply.status(200).send({
      role: 'assistant',
      content: simulatedResponse,
      timestamp: new Date().toISOString()
    });
  });
}
