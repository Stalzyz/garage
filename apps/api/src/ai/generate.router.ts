import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import OpenAI from 'openai';

const GenerateSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  format: z.enum(["text", "html"]).default("text")
});

export default async function aiGenerateRouter(app: FastifyInstance) {
  app.post('/generate', async (req, reply) => {
    const { prompt, systemPrompt, format } = GenerateSchema.parse(req.body);

    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || '',
      });

      const messages: any[] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      
      let finalPrompt = prompt;
      if (format === 'html') {
        finalPrompt = `${prompt}\n\nFormat the response in basic HTML. Use tags like <h2>, <p>, <ul>, <li>, and <strong>. Do not include any introductory conversation, just the raw HTML content itself (no markdown code blocks, no \`\`\`html).`;
      }

      messages.push({ role: "user", content: finalPrompt });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
      });

      const content = response.choices[0].message.content || '';

      return { content: content.trim() };
    } catch (error) {
      console.error("AI Generation Error:", error);
      return reply.code(500).send({ 
        error: "Failed to generate AI content",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
