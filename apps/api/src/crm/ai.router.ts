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

  // 3. Call Intelligence Analysis Endpoint
  app.post('/analyze-call', async (request, reply) => {
    try {
      const schema = z.object({
        transcript: z.string().min(1),
        prospectName: z.string().optional().default("Prospect"),
        repName: z.string().optional().default("Rep")
      });

      const { transcript, prospectName, repName } = schema.parse(request.body);

      const systemPrompt = `You are a world-class AI sales analyst.
Analyze the following sales call transcript between sales rep "${repName}" and prospect "${prospectName}".
Return ONLY valid JSON matching this exact structure:
{
  "sentiment": "Highly Interested" | "Neutral" | "Skeptical" | "Uninterested",
  "callScore": 85,
  "objectionsHandledCount": 2,
  "totalObjectionsCount": 2,
  "buyingSignals": ["Signal 1", "Signal 2"],
  "summary": "Concise summary of key discussion points, prospect needs, and outcome.",
  "suggestedCrmActions": [
    { "type": "TASK", "text": "Task action item..." },
    { "type": "STATUS_UPDATE", "text": "Lead status update..." },
    { "type": "EVENT", "text": "Follow up meeting event..." }
  ]
}`;

      const apiKey = await getGeminiApiKey(app);

      if (!apiKey) {
        app.log.warn("Gemini API Key missing. Returning fallback call analysis.");
        await new Promise(r => setTimeout(r, 700));
        return {
          success: true,
          data: {
            sentiment: "Highly Interested",
            callScore: 92,
            objectionsHandledCount: 2,
            totalObjectionsCount: 2,
            buyingSignals: [
              "Asked about CPA reduction strategy",
              "Confirmed recent funding round and Q4 demo volume goals",
              "Agreed to 15-minute discovery call next Tuesday"
            ],
            summary: `${prospectName} confirmed recent funding and expressed high interest in demo volume scaling. ${repName} addressed CPA concerns effectively. Discovery call scheduled for next Tuesday.`,
            suggestedCrmActions: [
              { type: "STATUS_UPDATE", text: "Lead Status updated to Meeting Booked" },
              { type: "TASK", text: "Send MedTech Pro case study via email before Tuesday" },
              { type: "EVENT", text: "Discovery Call scheduled for Tue @ 2:00 PM" }
            ]
          }
        };
      }

      const analysis = await generateJsonFromGemini(
        app,
        systemPrompt,
        `Transcript:\n${transcript}`
      );

      return { success: true, data: analysis };
    } catch (err: any) {
      app.log.error({ err }, "Error analyzing call transcript via Gemini");
      return reply.code(500).send({ success: false, error: err.message });
    }
  });

  // 4. Dynamic Call Script Generator Endpoint
  app.post('/generate-call-script', async (request, reply) => {
    try {
      const schema = z.object({
        productService: z.string().min(1),
        targetAudience: z.string().min(1),
        tone: z.string().optional().default("Professional & Consultative")
      });

      const { productService, targetAudience, tone } = schema.parse(request.body);

      const systemPrompt = `You are an elite sales script writer and B2B cold calling strategist.
Generate a comprehensive, high-converting call script for selling "${productService}" to "${targetAudience}" using a "${tone}" tone.
Return ONLY valid JSON matching this exact structure:
{
  "title": "Title for the sales script",
  "openingHook": "The first 15 seconds hook...",
  "valueProposition": "Core value proposition statement...",
  "qualifyingQuestions": [
    "Question 1 to uncover pain?",
    "Question 2 to gauge budget/authority?",
    "Question 3 to create urgency?"
  ],
  "commonObjections": [
    { "objection": "We already have a vendor / no budget", "rebuttal": "How to handle..." },
    { "objection": "Send me an email", "rebuttal": "How to handle..." }
  ],
  "closingCta": "Strong closing call to action to lock in a meeting."
}`;

      const apiKey = await getGeminiApiKey(app);

      if (!apiKey) {
        app.log.warn("Gemini API Key missing. Returning fallback call script.");
        await new Promise(r => setTimeout(r, 600));
        return {
          success: true,
          data: {
            title: `${productService} Cold Outreach Script`,
            openingHook: `Hi [Prospect Name], this is [Your Name] from Grekam. I saw [Company] recently expanded your [Target Area] — congrats on the growth!`,
            valueProposition: `We specialize in helping ${targetAudience} cut customer acquisition costs by up to 40% using automated AI workflow infrastructure.`,
            qualifyingQuestions: [
              "What is your primary bottleneck right now when scaling lead acquisition?",
              "How are your reps currently managing follow-ups after initial inquiry?",
              "If we could double demo conversions in 30 days without increasing ad spend, would that fit into your Q3 goals?"
            ],
            commonObjections: [
              { objection: "Send me an email first", rebuttal: "Happy to! To make sure I send over only what's relevant to your team, are you currently focused more on lead volume or conversion rates?" },
              { objection: "We already have an in-house team", rebuttal: "That's great — we actually partner directly with in-house teams to handle the technical automation so your team can focus purely on closing." }
            ],
            closingCta: "Do you have 10 minutes next Tuesday morning for a quick live demo to see how this works in action?"
          }
        };
      }

      const scriptData = await generateJsonFromGemini(
        app,
        systemPrompt,
        `Product/Service: ${productService}\nTarget Audience: ${targetAudience}\nTone: ${tone}`
      );

      return { success: true, data: scriptData };
    } catch (err: any) {
      app.log.error({ err }, "Error generating call script via Gemini");
      return reply.code(500).send({ success: false, error: err.message });
    }
  });
}

