import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getOpenAiApiKey, getOpenAiClient } from '../utils/openai';

export default async function aiRouter(app: FastifyInstance) {
  
  // 1. Generate Proposal Endpoint
  app.post('/generate-proposal', async (request, reply) => {
    try {
      const schema = z.object({
        clientName: z.string(),
        brief: z.string()
      });
      
      const { clientName, brief } = schema.parse(request.body);

      const systemPrompt = `You are an expert creative agency producer. 
Generate a professional proposal based on the user's brief.
Return ONLY valid JSON matching this schema:
{
  "title": "A catchy title for the proposal",
  "summary": "1 paragraph overview of the project",
  "deliverables": ["List of deliverable 1", "List of deliverable 2"],
  "budget": 10000,
  "timelineWeeks": 4
}`;

      const apiKey = await getOpenAiApiKey(app);

      if (!apiKey) {
        app.log.warn("OpenAI API Key is not set. Returning mock AI proposal.");
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
          success: true,
          data: {
            title: `${clientName} - Custom Creative Proposal`,
            summary: `Based on your brief: "${brief}". We propose a comprehensive creative campaign designed to elevate your brand presence.`,
            deliverables: [
              "Concept Development & Storyboarding",
              "1x Hero Video (60 seconds)",
              "3x Social Media Cutdowns (15 seconds)",
              "Raw Project Files & Assets"
            ],
            budget: 15000,
            timelineWeeks: 6
          }
        };
      }

      const openai = await getOpenAiClient(app);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Client: ${clientName}\nBrief: ${brief}` }
        ]
      });

      const content = completion.choices[0]?.message?.content || '{}';
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsedData = JSON.parse(jsonStr);

      return {
        success: true,
        data: parsedData
      };
    } catch (error: any) {
      app.log.error({ err: error }, "Error generating proposal via AI");
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

      const { message, role, email } = schema.parse(request.body);

      // Fetch dynamic telemetry context from database
      const totalLeads = await app.prisma.lead.count();
      const totalInvoices = await app.prisma.invoice.count();
      const totalRev = await app.prisma.invoice.aggregate({ _sum: { totalAmount: true } });
      const totalRevVal = totalRev._sum.totalAmount || 0;
      const totalStudents = await app.prisma.student.count();
      const totalProjects = await app.prisma.project.count();

      let contextString = `You are the executive AI copilot for Grekam OS (Visuals Pro Agency & Academy).
You have access to live database metrics:
- Total CRM Leads: ${totalLeads}
- Total Generated Invoices: ${totalInvoices}
- Total Enrolled Students: ${totalStudents}
- Total Active Projects: ${totalProjects}
- Total Invoiced Revenue: INR ${totalRevVal.toLocaleString()}
Answer queries concisely and guide users. User Role: ${role}.`;

      const apiKey = await getOpenAiApiKey(app);

      if (!apiKey) {
        await new Promise(r => setTimeout(r, 800));
        let mockReply = `I am operating in offline sandbox mode (OpenAI API key not configured). Live database snapshot:\n`;
        mockReply += `- Live Revenue: INR ${totalRevVal.toLocaleString()}\n- Active Projects: ${totalProjects}\n- Total Leads: ${totalLeads}`;
        return { success: true, reply: mockReply };
      }

      let responseText: string | null = null;
      try {
        const openai = await getOpenAiClient(app);
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: contextString },
            { role: "user", content: message }
          ]
        });
        responseText = completion.choices[0]?.message?.content || null;
      } catch (openAiError: any) {
        app.log.warn({ err: openAiError }, "OpenAI API call failed in assistant. Falling back.");
      }

      if (!responseText) {
        return {
          success: true,
          reply: `Here is a live snapshot from the database:\n- Revenue: INR ${totalRevVal.toLocaleString()}\n- Leads: ${totalLeads}\n- Projects: ${totalProjects}`
        };
      }

      return {
        success: true,
        reply: responseText
      };
    } catch (err: any) {
      app.log.error({ err }, "Error in assistant router");
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

      const systemPrompt = `You are a senior LMS Curriculum Architect.
Given a subject/course topic, generate a structured 2-module curriculum with lessons.
Return ONLY valid JSON matching this schema:
{
  "modules": [
    {
      "id": "m-1",
      "title": "Module 1 Title",
      "lessons": [
        { "id": "l-1", "title": "Lesson Title 1", "type": "video", "duration": "10:00" },
        { "id": "l-2", "title": "Lesson Title 2", "type": "pdf", "duration": "Read" }
      ]
    }
  ]
}`;

      const apiKey = await getOpenAiApiKey(app);

      if (!apiKey) {
        app.log.warn("OpenAI API Key is not set. Returning mock curriculum.");
        await new Promise(r => setTimeout(r, 1000));
        return {
          success: true,
          data: [
            {
              id: "m-ai-1",
              title: `Module 1: Fundamentals of ${subject}`,
              lessons: [
                { id: "l-ai-1", title: `1. Introduction to ${subject}`, type: "video", duration: "10:00" },
                { id: "l-ai-2", title: "2. Principles & Workflow", type: "video", duration: "15:00" },
                { id: "l-ai-3", title: "3. Reference Guide & Documentation", type: "pdf", duration: "Read" }
              ]
            },
            {
              id: "m-ai-2",
              title: `Module 2: Advanced ${subject} & Projects`,
              lessons: [
                { id: "l-ai-4", title: "1. Hands-on Execution & Best Practices", type: "video", duration: "20:00" },
                { id: "l-ai-5", title: "2. Real-world Assessment Task", type: "assignment", duration: "AI Graded" }
              ]
            }
          ]
        };
      }

      const openai = await getOpenAiClient(app);
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Subject: ${subject}` }
        ]
      });

      const content = completion.choices[0]?.message?.content || '{}';
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(jsonStr);

      return {
        success: true,
        data: parsed.modules || parsed
      };
    } catch (err: any) {
      app.log.error({ err }, "Error generating curriculum via AI");
      return reply.code(500).send({ success: false, error: err.message });
    }
  });
}
