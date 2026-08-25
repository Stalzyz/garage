import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { getOpenAiApiKey, getOpenAiClient } from '../utils/openai';

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

    try {
      const apiKey = await getOpenAiApiKey(app);

      if (!apiKey) {
        let simulatedResponse = "I'm your AI Mentor. ";
        if (context?.lessonId) {
          simulatedResponse += `I see you are currently studying lesson ${context.lessonId}. `;
        }
        simulatedResponse += "To unlock full real-time AI mentoring, please configure your OpenAI API Key under Settings > Integrations in the dashboard.";

        return reply.status(200).send({
          role: 'assistant',
          content: simulatedResponse,
          timestamp: new Date().toISOString()
        });
      }

      const openai = await getOpenAiClient(app);

      const systemPrompt = `You are an expert 1-on-1 AI Tutor and Learning Mentor for Visuals Pro Academy.
Help the student master the course concepts with clear, encouraging, structured explanations.
Lesson Context: ${JSON.stringify(context || {})}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
      });

      const responseContent = completion.choices[0]?.message?.content || "I'm here to help you learn!";

      return reply.status(200).send({
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      app.log.error({ err }, "AI Mentor error");
      return reply.status(500).send({
        error: "Failed to generate AI mentor response",
        details: err.message
      });
    }
  });
}
