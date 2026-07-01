"use server";

import OpenAI from "openai";

const FALLBACK_QUOTES = [
  "The only way out is through the impossible.",
  "Reality is negotiable. Code your own.",
  "Everything is broken until you fix it.",
  "The void isn't empty; it's waiting for instruction.",
  "Design the future, or someone else will design it for you.",
  "Your comfort zone is a beautifully crafted prison."
];

export async function generateVoidQuote() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OPENAI_API_KEY is not set. Falling back to local quotes.");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }

  try {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // or gpt-3.5-turbo if you prefer
      messages: [
        {
          role: "system",
          content: "You are a rogue, cyberpunk AI inside a system called 'Grekam OS'. The user has accessed 'THE VOID', a restricted sector. Generate a single, short (max 2 sentences), high-impact, slightly dark but motivational quote about design, engineering, or breaking boundaries. Do not use quotes around the response."
        }
      ],
      temperature: 0.9,
      max_tokens: 60,
    });

    return response.choices[0]?.message?.content?.trim() || FALLBACK_QUOTES[0];
  } catch (error) {
    console.error("OpenAI Generation Error:", error);
    return FALLBACK_QUOTES[0];
  }
}
