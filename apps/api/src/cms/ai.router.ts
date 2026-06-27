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
            content: `You are an expert Frontend Web Developer and UI/UX Designer. You specialize in creating stunning, modern, and high-converting web pages using raw HTML and Tailwind CSS.

CRITICAL RULES:
1. ONLY output valid HTML. Do NOT output markdown code blocks (no \`\`\`html), explanations, or conversational text. 
2. Use Tailwind CSS for ALL styling. You can use arbitrary values like w-[500px] or bg-[#1a1a1a].
3. DO NOT output full document structures like <html>, <head>, or <body>. Only output the actual components (e.g., <section>, <div>, <header>).
4. If the user asks for a full page or a complex design, combine multiple <section> elements into a beautiful, cohesive layout. Use lots of white space, modern typography, gradients, glassmorphism, and hover states.
5. Use Lucide icons via SVG where appropriate. Include realistic placeholder text, not just "Lorem Ipsum".
6. Ensure designs are fully responsive using md: and lg: prefixes.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7, // slightly more creative
        max_tokens: 3000, // allow longer pages
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

