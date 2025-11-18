import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.24.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { content, title, analysisType } = await req.json();

    if (!content || content.length < 10) {
      return new Response(
        JSON.stringify({ error: "Content is too short for analysis" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiKey = Deno.env.get("VITE_GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt = "";

    if (analysisType === "chronicle") {
      prompt = `You are an AI assistant helping high school journalism students improve their writing.

Analyze this chronicle and provide:
1. An improved, more engaging title (max 80 chars)
2. A brief summary (2-3 sentences)
3. 3-5 relevant tags/keywords
4. An engagement score from 0-100 (higher is better)
5. 3 specific improvements the writer could make

Title: ${title || "Untitled"}
Content: ${content.slice(0, 3000)}

Respond in JSON format:
{
  "improvedTitle": "...",
  "summary": "...",
  "tags": ["tag1", "tag2", ...],
  "engagementScore": 75,
  "improvements": ["...", "...", "..."]
}`;
    } else if (analysisType === "categorize") {
      prompt = `Analyze this journalism submission and categorize it.

Content: ${content.slice(0, 2000)}

Provide:
1. Primary category (news, sports, opinion, feature, or photo)
2. 3-5 relevant topics
3. Target audience (students, faculty, community, or all)
4. Tone (formal, casual, critical, celebratory, informative)

Respond in JSON:
{
  "category": "...",
  "topics": [...],
  "audience": "...",
  "tone": "..."
}`;
    } else if (analysisType === "trending") {
      prompt = `Analyze this content and determine trending potential.

Content: ${content.slice(0, 2000)}

Provide:
1. Trending score 0-100 (relevance to current student interests)
2. Similar trending topics
3. Why this might be trending
4. Suggested angles to increase appeal

Respond in JSON:
{
  "trendingScore": 65,
  "similarTopics": [...],
  "reason": "...",
  "suggestedAngles": [...]
}`;
    } else if (analysisType === "engagement") {
      prompt = `Predict audience engagement for this content.

Title: ${title || "Untitled"}
Content: ${content.slice(0, 2000)}

Provide:
1. Predicted engagement score 0-100
2. Strengths that will drive engagement
3. Weaknesses that may limit engagement
4. Specific tips to increase engagement

Respond in JSON:
{
  "engagementScore": 70,
  "strengths": [...],
  "weaknesses": [...],
  "tips": [...]
}`;
    } else if (analysisType === "schedule") {
      const now = new Date();
      prompt = `Suggest the optimal time to publish this content.

Content type: ${title || "article"}
Current date: ${now.toISOString()}
Content: ${content.slice(0, 1000)}

Consider:
- When students are most active online
- Content type and urgency
- Best days/times for school news

Provide:
1. Optimal day of week
2. Optimal time of day (24hr format)
3. Reasoning
4. Alternative time slots

Respond in JSON:
{
  "dayOfWeek": "Monday",
  "timeOfDay": "15:00",
  "reasoning": "...",
  "alternatives": [{"day": "...", "time": "..."}]
}`;
    } else if (analysisType === "duplicate") {
      prompt = `Analyze if this content is similar to common school journalism topics.

Content: ${content.slice(0, 2000)}

Provide:
1. Uniqueness score 0-100 (100 = completely unique)
2. Common themes found
3. How to make it more unique

Respond in JSON:
{
  "uniquenessScore": 85,
  "commonThemes": [...],
  "uniquenessAdvice": "..."
}`;
    } else {
      prompt = `Analyze this content comprehensively.

Content: ${content.slice(0, 2000)}

Provide a general analysis with insights.

Respond in JSON format with your analysis.`;
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let jsonStart = text.indexOf("{");
    let jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      return new Response(
        JSON.stringify({ error: "AI response format error", rawResponse: text }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const jsonStr = text.slice(jsonStart, jsonEnd + 1);
    const analysis = JSON.parse(jsonStr);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Analysis failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
