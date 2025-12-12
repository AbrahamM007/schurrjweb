import OpenAI from "openai";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

let client = null;

if (API_KEY) {
  client = new OpenAI({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
} else {
  console.warn("OpenAI API Key is missing. AI features will not work.");
}

export const generateHeadline = async (topic) => {
  if (!client) return "AI Configuration Missing";
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for a high school newspaper. Write a catchy, journalistic headline. Keep it under 10 words. Return ONLY the headline."
        },
        { role: "user", content: `Topic: ${topic}` }
      ],
      max_tokens: 20
    });
    return response.choices[0].message.content.replace(/^"|"$/g, '');
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Error generating headline";
  }
};

export const rewriteText = async (text, tone = "professional") => {
  if (!client) return "AI Configuration Missing";
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
            role: "system",
            content: `You are a helpful assistant for a high school newspaper. Rewrite the text to have a ${tone} journalistic tone suitable for a high school newspaper.`
        },
        { role: "user", content: text }
      ],
      max_tokens: 500
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Error rewriting text";
  }
};

export const summarizeText = async (text) => {
  if (!client) return "AI Configuration Missing";
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
            role: "system",
            content: "You are a helpful assistant. Summarize the following article text into a 2-sentence blurb."
        },
        { role: "user", content: text }
      ],
      max_tokens: 100
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Error summarizing text";
  }
};

export const generateSocialCaption = async (topic, platform = "Instagram") => {
  if (!client) return "AI Configuration Missing";
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
            role: "system",
            content: `You are a social media manager. Write a ${platform} caption. Include relevant hashtags for a high school context.`
        },
        { role: "user", content: `Topic: ${topic}` }
      ],
      max_tokens: 100
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Error generating caption";
  }
};
