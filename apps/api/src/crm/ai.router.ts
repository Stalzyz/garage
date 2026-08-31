import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getGeminiApiKey, generateJsonFromGemini, generateTextFromGemini } from '../utils/gemini';

export default async function aiRouter(app: FastifyInstance) {

  // 1. Generate Proposal Endpoint
  app.post('/generate-proposal', async (request, reply) => {
    try {
      const schema = z.object({
        clientName: z.string(),
        brief: z.string()
      });

      const { clientName, brief } = schema.parse(request.body);

      const systemPrompt = `You are an expert creative agency producer at Grekam Visuals.
Generate a professional, compelling proposal based on the client's brief.
Return ONLY valid JSON matching this exact schema:
{
  "title": "A catchy, specific title for the proposal",
  "summary": "2-3 sentence overview that hooks the client",
  "deliverables": ["Specific deliverable 1", "Specific deliverable 2", "Specific deliverable 3", "Specific deliverable 4"],
  "budget": 50000,
  "timelineWeeks": 4
}
Make the summary and deliverables specific to the client's industry and goals. Use INR for budget.`;

      const apiKey = await getGeminiApiKey(app);

      if (!apiKey) {
        app.log.warn("Gemini API Key is not set. Returning mock AI proposal.");
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          success: true,
          data: {
            title: `${clientName} — Custom Digital Growth Proposal`,
            summary: `Based on your brief: "${brief}". We propose a comprehensive digital strategy designed to elevate your brand presence, drive qualified leads, and deliver measurable ROI within 60 days.`,
            deliverables: [
              "Brand Identity Audit & Competitor Analysis",
              "1x Hero Video Production (60 seconds, 4K)",
              "3x Social Media Cutdowns (15s Reels/Shorts)",
              "Performance Ad Creatives (Meta + Google)",
              "Raw Project Files & Revision-Ready Assets"
            ],
            budget: 55000,
            timelineWeeks: 5
          }
        };
      }

      const data = await generateJsonFromGemini(
        app,
        systemPrompt,
        `Generate a proposal for:\nClient: ${clientName}\nBrief: ${brief}`
      );

      return { success: true, data };
    } catch (error: any) {
      app.log.error({ err: error }, "Error generating proposal via Gemini AI");
      return reply.code(500).send({
        success: false,
        error: "Failed to generate AI proposal",
        details: error.message
      });
    }
  });

  // 2. Executive Assistant / Copilot Chat Endpoint
  app.post('/assistant', async (request, reply) => {
    try {
      const schema = z.object({
        message: z.string(),
        role: z.string().optional().default("Employee"),
        email: z.string().optional()
      });

      const { message, role } = schema.parse(request.body);

      // Fetch dynamic telemetry context from database
      const [totalLeads, totalInvoices, totalRev, totalStudents, totalProjects] = await Promise.all([
        app.prisma.lead.count(),
        app.prisma.invoice.count(),
        app.prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
        app.prisma.student.count(),
        app.prisma.project.count(),
      ]);
      const totalRevVal = totalRev._sum.totalAmount || 0;

      const systemPrompt = `You are the executive AI copilot for Grekam OS (Visuals Pro Agency & Academy).
You have access to live database metrics:
- Total CRM Leads: ${totalLeads}
- Total Generated Invoices: ${totalInvoices}
- Total Enrolled Students: ${totalStudents}
- Total Active Projects: ${totalProjects}
- Total Invoiced Revenue: INR ${totalRevVal.toLocaleString('en-IN')}
Answer queries concisely, use data where relevant, and guide users to the right dashboard sections.
User Role: ${role}. Be professional but friendly.`;

      const apiKey = await getGeminiApiKey(app);

      if (!apiKey) {
        await new Promise(r => setTimeout(r, 500));
        const mockReply = `I'm running in offline mode (Gemini API key not configured). Here's a live snapshot from the database:\n\n📊 **Current Metrics:**\n- Revenue: ₹${totalRevVal.toLocaleString('en-IN')}\n- Active Projects: ${totalProjects}\n- Total Leads: ${totalLeads}\n- Students Enrolled: ${totalStudents}\n\nTo enable full AI responses, add your free Gemini key under **Settings → Integrations**.`;
        return { success: true, reply: mockReply };
      }

      const responseText = await generateTextFromGemini(app, systemPrompt, message);
      return { success: true, reply: responseText };

    } catch (err: any) {
      app.log.error({ err }, "Error in Gemini assistant router");
      return reply.code(500).send({ success: false, error: err.message });
    }
  });

  // 3. Curriculum Generator Endpoint
  app.post('/generate-curriculum', async (request, reply) => {
    try {
      const schema = z.object({
        subject: z.string().min(1)
      });

      const { subject } = schema.parse(request.body);

      const systemPrompt = `You are a senior LMS Curriculum Architect specializing in creative, design, and digital marketing education.
Given a subject/course topic, generate a structured 2-module curriculum with practical lessons.
Return ONLY valid JSON matching this exact schema:
{
  "modules": [
    {
      "id": "m-1",
      "title": "Module 1 Title",
      "lessons": [
        { "id": "l-1", "title": "Lesson Title 1", "type": "video", "duration": "10:00" },
        { "id": "l-2", "title": "Lesson Title 2", "type": "pdf", "duration": "Read" }
      ]
    },
    {
      "id": "m-2",
      "title": "Module 2 Title",
      "lessons": [
        { "id": "l-3", "title": "Lesson Title 3", "type": "video", "duration": "15:00" },
        { "id": "l-4", "title": "Lesson Title 4", "type": "assignment", "duration": "AI Graded" }
      ]
    }
  ]
}
Make lesson titles specific, practical, and industry-relevant for the subject.`;

      const apiKey = await getGeminiApiKey(app);

      if (!apiKey) {
        app.log.warn("Gemini API Key is not set. Returning mock curriculum.");
        await new Promise(r => setTimeout(r, 600));
        return {
          success: true,
          data: [
            {
              id: "m-ai-1",
              title: `Module 1: Foundations of ${subject}`,
              lessons: [
                { id: "l-ai-1", title: `1. Introduction to ${subject} — Core Concepts`, type: "video", duration: "12:00" },
                { id: "l-ai-2", title: "2. Tools, Software & Professional Workflow", type: "video", duration: "18:00" },
                { id: "l-ai-3", title: "3. Reference Guide & Resource Library", type: "pdf", duration: "Read" }
              ]
            },
            {
              id: "m-ai-2",
              title: `Module 2: Advanced ${subject} — Real Projects`,
              lessons: [
                { id: "l-ai-4", title: "1. Industry Case Studies & Execution Techniques", type: "video", duration: "22:00" },
                { id: "l-ai-5", title: "2. Hands-on Project Workshop", type: "video", duration: "30:00" },
                { id: "l-ai-6", title: "3. Final Assessment — Portfolio Submission", type: "assignment", duration: "AI Graded" }
              ]
            }
          ]
        };
      }

      const parsed = await generateJsonFromGemini(
        app,
        systemPrompt,
        `Generate a 2-module curriculum for the subject: ${subject}`
      );

      return {
        success: true,
        data: parsed.modules || parsed
      };
    } catch (err: any) {
      app.log.error({ err }, "Error generating curriculum via Gemini AI");
      return reply.code(500).send({ success: false, error: err.message });
    }
  });
}
