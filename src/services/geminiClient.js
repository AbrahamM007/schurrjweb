import OpenAI from "openai";

let client = null;

function getClient() {
  if (!client) {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    if (!key) return null;
    client = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
  }
  return client;
}

export async function generateHeadlineSuggestion(bodyText) {
  try {
    const openai = getClient();
    if (!openai) return "";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are helping high school journalism students. Suggest a punchy newspaper-style headline (max 12 words). Respond with ONLY the headline, no quotes or extra text."
        },
        {
          role: "user",
          content: `Read their story and suggest a headline:\n\n${bodyText.slice(0, 2000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    const text = completion.choices[0].message.content.trim();
    return text.replace(/^"|"$/g, "");
  } catch (e) {
    console.error(e);
    return "";
  }
}
