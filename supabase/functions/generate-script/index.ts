import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.73.1";

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
    const { prompt } = await req.json();

    if (!prompt || prompt.length < 10) {
      return new Response(
        JSON.stringify({ error: "Prompt is too short" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    const fullPrompt = `You are helping high school journalism students create video scripts for their weekly news show.

Based on this description, write a complete video script:
${prompt}

The script should:
- Be engaging and appropriate for high school students
- Include clear sections (intro, main content, outro)
- Be 2-3 minutes when read aloud
- Use conversational, energetic language
- Include suggestions for B-roll or visuals in [brackets]

Write the complete script now:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a creative video script writer for high school journalism programs."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const script = completion.choices[0].message.content || "";

    return new Response(
      JSON.stringify({ script }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Script generation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
