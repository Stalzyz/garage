import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy_key",
});

export default async function aiRouter(app: FastifyInstance) {
  
  // Existing proposal generator
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

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy_key") {
        app.log.warn("OPENAI_API_KEY is not set. Returning mock AI proposal.");
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

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Client: ${clientName}\nBrief: ${brief}` }
        ],
        response_format: { type: "json_object" }
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) throw new Error("No response from AI");

      const parsedData = JSON.parse(aiResponse);

      return {
        success: true,
        data: parsedData
      };
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ success: false, message: error.message || 'Failed to generate proposal' });
    }
  });

  // 1 & 5: Conversational Analytics & Client Self-Service Copilot
  app.post('/assistant', async (request, reply) => {
    try {
      const bodySchema = z.object({
        message: z.string(),
        role: z.string(),
        email: z.string()
      });

      const { message, role, email } = bodySchema.parse(request.body);

      // Fetch dynamic database context to feed the prompt
      let contextString = "";
      if (role === "Client") {
        // Retrieve client invoice counts & projects
        const invoices = await app.prisma.invoice.findMany({
          where: { clientEmail: email },
          select: { invoiceNumber: true, totalAmount: true, status: true }
        });
        
        contextString = `You are the Client Self-Service Copilot for Grekam OS. 
The current client is logged in as: ${email}.
Active client bills/invoices: ${JSON.stringify(invoices)}.
Please help the client with queries about their project progress, asset downloads, or invoice links. Keep answers brief and professional.`;
      } else {
        // Retrieve global metrics for Admins, Managers, and Staff (Conversational Analytics)
        const [totalLeads, totalStudents, totalProjects, totalRevenue] = await Promise.all([
          app.prisma.lead.count(),
          app.prisma.student.count(),
          app.prisma.project.count(),
          app.prisma.invoice.aggregate({
            _sum: { totalAmount: true }
          })
        ]);

        const totalRevVal = totalRevenue._sum.totalAmount || 0;

        contextString = `You are Grekam AI, the main operational analyst for Grekam OS. 
Here is the current live system statistics summary:
- Total Leads in CRM: ${totalLeads}
- Enrolled Academy Students: ${totalStudents}
- Active Deliverable Projects: ${totalProjects}
- Billing Revenue Invoiced: INR ${totalRevVal.toLocaleString()}
Please answer operational queries briefly and direct reps or managers to the right panels when relevant.`;
      }

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy_key") {
        // Fallback simulator response using real database metrics
        await new Promise(r => setTimeout(r, 1000));
        let mockReply = `I am currently operating in offline sandbox mode. Here is what I fetched from the database for you:\n`;
        if (role === "Client") {
          mockReply += `You have active bills registered under ${email}. Please check the Finance tab to make payments.`;
        } else {
          mockReply += `- Live Revenue: INR ${(await app.prisma.invoice.aggregate({ _sum: { totalAmount: true } }))._sum.totalAmount || 0}\n- Active Projects: ${await app.prisma.project.count()}`;
        }
        return { success: true, reply: mockReply };
      }

      let response: string | null = null;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: contextString },
            { role: "user", content: message }
          ]
        });
        response = completion.choices[0]?.message?.content;
      } catch (openAiError: any) {
        app.log.warn({ err: openAiError }, "OpenAI API call failed in assistant. Falling back.");
      }

      if (!response) {
        app.log.warn("Using mock fallback response for assistant");
        await new Promise(r => setTimeout(r, 1000));
        let mockReply = `I am currently operating in fallback mode. Here is what I fetched from the database for you:\n`;
        if (role === "Client") {
          mockReply += `You have active bills registered under ${email}. Please check the Finance tab to make payments.`;
        } else {
          mockReply += `- Live Revenue: INR ${(await app.prisma.invoice.aggregate({ _sum: { totalAmount: true } }))._sum.totalAmount || 0}\n- Active Projects: ${await app.prisma.project.count()}`;
        }
        return { success: true, reply: mockReply };
      }

      return {
        success: true,
        reply: response
      };
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ success: false, message: error.message || 'Failed to process AI assistant query' });
    }
  });

  // Course Curriculum Generator
  app.post('/generate-curriculum', async (request, reply) => {
    try {
      const bodySchema = z.object({
        subject: z.string()
      });

      const { subject } = bodySchema.parse(request.body);

      const systemPrompt = `You are an LMS curriculum builder. 
Generate a comprehensive draft syllabus of modules and lessons based on the course subject: '${subject}'.
Return ONLY a valid JSON object matching this schema:
{
  "modules": [
    {
      "id": "module_id_1",
      "title": "Module Title Here",
      "lessons": [
        { "id": "lesson_id_1", "title": "Lesson Title Here", "type": "video", "duration": "5:30" }
      ]
    }
  ]
}
Provide exactly 2 modules in the "modules" array, each containing exactly 3 lessons.
The "type" property for lessons must be one of: "video", "pdf", or "assignment".
The "duration" property should be appropriate (e.g., "5:30", "Read", or "AI Graded").
Keep titles concise and matching typical course designs.`;

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy_key") {
        app.log.warn("OPENAI_API_KEY is not set. Returning mock curriculum.");
        await new Promise(r => setTimeout(r, 1200));
        return {
          success: true,
          data: [
            {
              id: "m-ai-1",
              title: `Module 1: Introduction to ${subject}`,
              lessons: [
                { id: "l-ai-1", title: `1. Welcome to ${subject}`, type: "video", duration: "8:00" },
                { id: "l-ai-2", title: "2. Core Principles & Setup", type: "video", duration: "14:20" },
                { id: "l-ai-3", title: "3. Beginner Workspace Files", type: "pdf", duration: "Read" }
              ]
            },
            {
              id: "m-ai-2",
              title: "Module 2: Practical Exercises & Evaluation",
              lessons: [
                { id: "l-ai-4", title: "1. Advanced Execution & Implementation", type: "video", duration: "18:45" },
                { id: "l-ai-5", title: "2. Final Quiz & Sandbox Project", type: "pdf", duration: "Read" },
                { id: "l-ai-6", title: "3. Capstone Assessment Task", type: "assignment", duration: "AI Graded" }
              ]
            }
          ]
        };
      }

      let responseText: string | null = null;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Subject: ${subject}` }
          ],
          response_format: { type: "json_object" }
        });
        app.log.info({ completion }, "OpenAI raw completion object");
        responseText = completion.choices[0]?.message?.content;
      } catch (openAiError: any) {
        app.log.warn({ err: openAiError }, "OpenAI API call failed in generate-curriculum. Falling back.");
      }

      let modulesArray: any[] = [];
      if (responseText) {
        try {
          const parsedData = JSON.parse(responseText);
          app.log.info({ parsedData }, "OpenAI curriculum raw response");
          
          if (parsedData && typeof parsedData === 'object') {
            if (Array.isArray(parsedData.modules)) {
              modulesArray = parsedData.modules;
            } else if (Array.isArray(parsedData)) {
              modulesArray = parsedData;
            } else {
              const foundArray = Object.values(parsedData).find(val => 
                Array.isArray(val) && val.every(item => item && typeof item === 'object' && ('lessons' in item || 'title' in item))
              );
              if (foundArray) {
                modulesArray = foundArray as any[];
              } else {
                const anyArray = Object.values(parsedData).find(val => Array.isArray(val));
                if (anyArray) {
                  modulesArray = anyArray as any[];
                }
              }
            }
          }
          app.log.info({ modulesArray }, "OpenAI curriculum parsed modules");
        } catch (jsonErr) {
          app.log.error(jsonErr, "Failed to parse OpenAI curriculum JSON");
        }
      }

      if (modulesArray.length > 0) {
        modulesArray = modulesArray.map((m: any) => {
          if (!m || typeof m !== 'object') {
            return { id: Math.random().toString(), title: 'Untitled Module', lessons: [] };
          }
          return {
            id: m.id || Math.random().toString(),
            title: m.title || 'Untitled Module',
            lessons: Array.isArray(m.lessons) ? m.lessons.map((l: any) => ({
              id: l?.id || Math.random().toString(),
              title: l?.title || 'Untitled Lesson',
              type: l?.type || 'video',
              duration: l?.duration || '5:00'
            })) : []
          };
        });
      }

      // If OpenAI failed, or response was empty/invalid, fall back to mock data
      if (modulesArray.length === 0) {
        app.log.warn("Using mock fallback data for curriculum generator");
        await new Promise(r => setTimeout(r, 1200));
        modulesArray = [
          {
            id: "m-ai-1",
            title: `Module 1: Introduction to ${subject}`,
            lessons: [
              { id: "l-ai-1", title: `1. Welcome to ${subject}`, type: "video", duration: "8:00" },
              { id: "l-ai-2", title: "2. Core Principles & Setup", type: "video", duration: "14:20" },
              { id: "l-ai-3", title: "3. Beginner Workspace Files", type: "pdf", duration: "Read" }
            ]
          },
          {
            id: "m-ai-2",
            title: "Module 2: Practical Exercises & Evaluation",
            lessons: [
              { id: "l-ai-4", title: "1. Advanced Execution & Implementation", type: "video", duration: "18:45" },
              { id: "l-ai-5", title: "2. Final Quiz & Sandbox Project", type: "pdf", duration: "Read" },
              { id: "l-ai-6", title: "3. Capstone Assessment Task", type: "assignment", duration: "AI Graded" }
            ]
          }
        ];
      }

      return {
        success: true,
        data: modulesArray
      };
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ success: false, message: error.message || 'Failed to generate curriculum' });
    }
  });

  // 3: Smart Asset Drive & Vision Search
  app.post('/search-drive', async (request, reply) => {
    try {
      const bodySchema = z.object({
        query: z.string(),
        files: z.array(z.object({
          id: z.string(),
          name: z.string(),
          mimeType: z.string()
        }))
      });

      const { query, files } = bodySchema.parse(request.body);

      const systemPrompt = `You are a semantic search file engine. 
Given a query and a list of files, select the file objects that match the user's intent.
For example, if the query is 'ui landing design', match files like 'mockup.png' or 'homepage-v2.jpg'.
Return ONLY a valid JSON object matching this schema:
{
  "matchedIds": ["id1", "id2"]
}`;

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy_key") {
        // Offline matching simulation (simple string inclusion)
        const matched = files.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).map(f => f.id);
        return { success: true, matchedIds: matched };
      }

      let matchedIds: any[] | null = null;
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Query: ${query}\nFiles: ${JSON.stringify(files)}` }
          ],
          response_format: { type: "json_object" }
        });

        const resultText = completion.choices[0]?.message?.content;
        if (resultText) {
          const parsedMatches = JSON.parse(resultText);
          if (parsedMatches && Array.isArray(parsedMatches.matchedIds)) {
            matchedIds = parsedMatches.matchedIds;
          } else if (Array.isArray(parsedMatches)) {
            matchedIds = parsedMatches;
          } else if (parsedMatches && typeof parsedMatches === 'object') {
            matchedIds = (Object.values(parsedMatches).find(val => Array.isArray(val)) || Object.values(parsedMatches)[0] || []) as any[];
          }
        }
      } catch (openAiError: any) {
        app.log.warn({ err: openAiError }, "OpenAI API call failed in search-drive. Falling back.");
      }

      if (!matchedIds) {
        app.log.warn("Using offline fallback matching for search-drive");
        matchedIds = files.filter(f => f.name.toLowerCase().includes(query.toLowerCase())).map(f => f.id);
      }

      return {
        success: true,
        matchedIds
      };
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ success: false, message: error.message || 'Failed to execute semantic search' });
    }
  });

}
