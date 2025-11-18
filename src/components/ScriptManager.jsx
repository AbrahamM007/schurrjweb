import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from "../hooks/useAuth";

export default function ScriptManager() {
  const [scripts, setScripts] = useState([]);
  const [form, setForm] = useState({ title: "", script_content: "", gemini_prompt: "" });
  const [generating, setGenerating] = useState(null);
  const { supabaseUser } = useAuth();

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    const { data } = await supabase
      .from("video_scripts")
      .select("*")
      .order("created_at", { ascending: false });
    setScripts(data || []);
  };

  const handleCreateScript = async (e) => {
    e.preventDefault();
    await supabase.from("video_scripts").insert({
      title: form.title,
      script_content: form.script_content,
      gemini_prompt: form.gemini_prompt,
      video_status: "draft",
      created_by: supabaseUser?.id
    });
    setForm({ title: "", script_content: "", gemini_prompt: "" });
    loadScripts();
  };

  const handleGenerateScript = async (scriptId) => {
    setGenerating(scriptId);
    try {
      const script = scripts.find(s => s.id === scriptId);
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are a creative video script writer for a high school news channel.

Based on this prompt: ${script.gemini_prompt}

Write a professional, engaging video script for Spartan Weekly. Include:
- An attention-grabbing introduction
- Clear main content sections
- A strong conclusion
- Natural transitions between sections
- Keep it concise (2-3 minutes when read aloud)`;

      const result = await model.generateContent(prompt);
      const generatedScript = result.response.text();

      await supabase
        .from("video_scripts")
        .update({
          script_content: generatedScript,
          video_status: "completed",
          updated_at: new Date().toISOString()
        })
        .eq("id", scriptId);

      loadScripts();
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate script. Check console for details.");
    } finally {
      setGenerating(null);
    }
  };

  const handleDeleteScript = async (scriptId) => {
    await supabase.from("video_scripts").delete().eq("id", scriptId);
    loadScripts();
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        Video Scripts
      </h2>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Create scripts and use Gemini AI to generate video content
      </p>

      <form onSubmit={handleCreateScript} style={{ marginBottom: "2rem" }}>
        <div className="form-grid">
          <div>
            <div className="field-label">Script Title</div>
            <input
              className="field-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Spartan Weekly Episode 12"
              required
            />
          </div>
          <div>
            <div className="field-label">Gemini Prompt</div>
            <textarea
              className="field-textarea"
              value={form.gemini_prompt}
              onChange={(e) => setForm({ ...form, gemini_prompt: e.target.value })}
              placeholder="Describe what this video should be about..."
              rows={3}
              required
            />
          </div>
          <div>
            <div className="field-label">Script Content (optional - can generate with AI)</div>
            <textarea
              className="field-textarea"
              value={form.script_content}
              onChange={(e) => setForm({ ...form, script_content: e.target.value })}
              placeholder="Or write your own script here..."
              rows={5}
            />
          </div>
        </div>
        <button className="primary-btn" style={{ marginTop: "1rem" }}>
          Create Script
        </button>
      </form>

      <div className="submission-list">
        {scripts.map((script) => (
          <div key={script.id} className="admin-card">
            <div className="admin-card-main">
              <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.3rem" }}>
                {script.title}
              </div>
              <div
                className="text-muted"
                style={{
                  fontSize: "0.85rem",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  fontWeight: 600
                }}
              >
                Status: {script.video_status}
              </div>
              <div className="text-muted" style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                <strong>Prompt:</strong> {script.gemini_prompt}
              </div>
              {script.script_content && (
                <div style={{ marginTop: "0.8rem" }}>
                  <strong>Script:</strong>
                  <div
                    style={{
                      marginTop: "0.4rem",
                      padding: "0.8rem",
                      background: "#f5f5f5",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      maxHeight: "200px",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {script.script_content}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-card-actions">
              <button
                className="primary-btn"
                onClick={() => handleGenerateScript(script.id)}
                disabled={generating === script.id}
              >
                {generating === script.id ? "Generating..." : "Generate with AI"}
              </button>
              <button
                className="secondary-btn"
                onClick={() => handleDeleteScript(script.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {scripts.length === 0 && (
          <div className="text-muted">No scripts yet. Create one above!</div>
        )}
      </div>
    </div>
  );
}
