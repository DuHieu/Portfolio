const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function refineTextWithAI(text: string, type: 'bio' | 'experience' | 'project') {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API Key is not configured in .env");
  }

  const prompts = {
    bio: "Refine this personal portfolio bio to be professional, engaging, and concise. Keep it under 200 characters if possible. Output ONLY the refined text.",
    experience: "Refine this work experience description to be impact-oriented and professional. Use strong action verbs. Output ONLY the refined text.",
    project: "Refine this project description to highlight technical innovation and problem-solving. Output ONLY the refined text."
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a professional career coach and copywriter specializing in tech portfolios. You provide concise, high-impact text in the same language as the input (Vietnamese or English)."
          },
          {
            role: "user",
            content: `${prompts[type]}\n\nInput Text: ${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to call Groq API");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw error;
  }
}
