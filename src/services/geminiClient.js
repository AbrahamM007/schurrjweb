import { GoogleGenerativeAI } from "@google/generative-ai";

let client = null;

function getClient() {
  if (!client) {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) return null;
    client = new GoogleGenerativeAI(key);
  }
  return client;
}

export async function generateHeadlineSuggestion(bodyText) {
  try {
    const genAI = getClient();
    if (!genAI) return "";
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt =
      "You are helping high school journalism students. " +
      "Read their story and suggest a punchy newspaper-style headline (max 12 words).\n\n" +
      bodyText.slice(0, 2000);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text.replace(/^"|"$/g, "");
  } catch (e) {
    console.error(e);
    return "";
  }
}
