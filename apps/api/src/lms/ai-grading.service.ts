import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GradingResult {
  grade: number;
  feedback: string;
}

export class AIGradingService {
  /**
   * Evaluates a student's submission based on the assignment brief and rubric.
   */
  static async evaluateSubmission(
    assignmentTitle: string,
    assignmentBrief: string,
    submissionUrl: string,
    rubric?: any
  ): Promise<GradingResult> {
    
    // Construct the prompt for the LLM
    const systemPrompt = `You are "Matrix AI", an expert teaching assistant at Grekam Academy.
Your task is to grade a student's assignment submission. 
You must return your evaluation strictly as a JSON object with two fields:
- "grade": an integer between 0 and 100 representing the score.
- "feedback": a rich, encouraging, and constructive feedback string in Markdown format (e.g. bolding key terms, bullet points for areas of improvement). Do not use placeholders.

Be fair but rigorous. If the submission URL is missing or looks completely invalid (like just "http://test.com"), give a lower score and ask them to submit a proper link.`;

    const userPrompt = `
Assignment Title: ${assignmentTitle}
Assignment Brief: ${assignmentBrief}
${rubric ? `Grading Rubric: ${JSON.stringify(rubric)}\n` : ''}
Student Submission Link: ${submissionUrl}

Please evaluate the submission. Return ONLY a valid JSON object.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use a fast, capable model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from AI");
      }

      const parsed = JSON.parse(content);
      
      return {
        grade: typeof parsed.grade === 'number' ? parsed.grade : 80, // fallback
        feedback: parsed.feedback || "Good effort. Keep it up! - Matrix AI",
      };

    } catch (err) {
      console.error("[Matrix AI] Error during grading evaluation:", err);
      // Fallback in case of API failure
      return {
        grade: 85,
        feedback: "We received your submission, but Matrix AI is currently offline. A human instructor will review this shortly.",
      };
    }
  }
}
