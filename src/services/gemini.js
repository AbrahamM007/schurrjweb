import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
} else {
  console.warn("Gemini API Key is missing. AI features will not work.");
}

export const generateHeadline = async (topic) => {
  if (!model) return "AI Configuration Missing";
  try {
    const prompt = `Write a catchy, journalistic headline for a high school newspaper article about: ${topic}. Keep it under 10 words. Return ONLY the headline.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating headline";
  }
};

export const rewriteText = async (text, tone = "professional") => {
  if (!model) return "AI Configuration Missing";
  try {
    const prompt = `Rewrite the following text to have a ${tone} journalistic tone suitable for a high school newspaper: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error rewriting text";
  }
};

export const summarizeText = async (text) => {
  if (!model) return "AI Configuration Missing";
  try {
    const prompt = `Summarize the following article text into a 2-sentence blurb: "${text}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error summarizing text";
  }
};

export const generateSocialCaption = async (topic, platform = "Instagram") => {
  if (!model) return "AI Configuration Missing";
  try {
    const prompt = `Write a ${platform} caption for a post about: ${topic}. Include relevant hashtags for a high school context.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating caption";
  }
};
