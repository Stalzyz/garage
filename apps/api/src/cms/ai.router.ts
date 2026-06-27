import { FastifyInstance } from 'fastify';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function aiRouter(app: FastifyInstance) {
  // POST /api/v1/cms/ai-generate
  app.post('/ai-generate', async (req, reply) => {
    const { prompt } = req.body as { prompt: string };

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using a fast/cheap model for UI generation
        messages: [
          {
            role: "system",
            content: "You are an expert web developer and UI designer. You only output raw HTML with Tailwind CSS classes. Do not include markdown formatting (like ```html), explanations, or full document structures (no <html>, <body>, or <head>). Just output the requested component directly. Use modern, beautiful design principles, dark modes, gradients, and micro-animations where appropriate."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      let generatedHtml = response.choices[0]?.message?.content || "";
      
      // Clean up markdown just in case the model ignored instructions
      generatedHtml = generatedHtml.replace(/^```html\s*/, '').replace(/\s*```$/, '').trim();

      return { 
        success: true, 
        data: { html: generatedHtml } 
      };
    } catch (error: any) {
      req.log.error(error);
      return reply.status(500).send({
        success: false,
        message: "Failed to generate HTML with AI",
        error: error.message
      });
    }
  });
}

