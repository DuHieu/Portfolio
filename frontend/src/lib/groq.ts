const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function refineTextWithAI(text: string, type: 'bio' | 'experience' | 'project', token?: string) {
  if (!token) {
    throw new Error("Authentication required to use AI features.");
  }

  try {
    const response = await fetch(`${API_BASE}/api/ai/refine/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text, type })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to call AI API");
    }

    const data = await response.json();
    return data.refined_text;
  } catch (error) {
    console.error("AI Refine Error:", error);
    throw error;
  }
}
