import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from "../hooks/useAuth";

export default function ScriptManager() {
  const [scripts, setScripts] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ title: "", script_content: "", gemini_prompt: "" });
  const [generating, setGenerating] = useState(null);
  const { supabaseUser } = useAuth();

  useEffect(() => {
    loadScripts();
    loadUsers();
  }, []);

  const loadScripts = async () => {
    const { data } = await supabase
      .from("scripts")
      .select("*, task:team_tasks(id, title, status, assigned_to, profiles!team_tasks_assigned_to_fkey(full_name))")
      .order("created_at", { ascending: false });
    setScripts(data || []);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });
    setUsers(data || []);
  };

  const handleCreateScript = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("scripts").insert({
      title: form.title,
      script_content: form.script_content,
      content: form.script_content || "",
      gemini_prompt: form.gemini_prompt,
      video_status: "draft",
      created_by: supabaseUser?.id
    });

    if (error) {
      console.error("Create error:", error);
      alert(`Failed to create script: ${error.message}`);
      return;
    }

    setForm({ title: "", script_content: "", gemini_prompt: "" });
    loadScripts();
  };

  const handleGenerateScript = async (scriptId) => {
    setGenerating(scriptId);
    try {
      const script = scripts.find(s => s.id === scriptId);

      if (!script.gemini_prompt) {
        alert("Please add a prompt before generating");
        setGenerating(null);
        return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        alert("Gemini API key not found. Please check your .env file.");
        setGenerating(null);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

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

      const { error: updateError } = await supabase
        .from("scripts")
        .update({
          script_content: generatedScript,
          content: generatedScript,
          updated_at: new Date().toISOString()
        })
        .eq("id", scriptId);

      if (updateError) {
        console.error("Update error:", updateError);
        alert(`Failed to save script: ${updateError.message}`);
      } else {
        loadScripts();
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert(`Failed to generate script: ${error.message || 'Unknown error'}`);
    } finally {
      setGenerating(null);
    }
  };

  const handleCreateTask = async (scriptId) => {
    const script = scripts.find(s => s.id === scriptId);

    const { data: taskData } = await supabase
      .from("team_tasks")
      .insert({
        title: `Produce: ${script.title}`,
        description: `Complete video production for "${script.title}"`,
        status: "pending"
      })
      .select()
      .single();

    if (taskData) {
      await supabase
        .from("scripts")
        .update({
          task_id: taskData.id,
          video_status: "in_production"
        })
        .eq("id", scriptId);

      loadScripts();
    }
  };

  const handleDeleteScript = async (scriptId) => {
    if (confirm("Delete this script?")) {
      await supabase.from("scripts").delete().eq("id", scriptId);
      loadScripts();
    }
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.5rem" }}>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {script.title}
                </div>
                <span
                  style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: script.video_status === "completed" ? "#27ae60" : script.video_status === "in_production" ? "#f39c12" : "#95a5a6",
                    color: "white"
                  }}
                >
                  {script.video_status}
                </span>
              </div>

              {script.task && (
                <div style={{
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  background: "rgba(150, 199, 191, 0.1)",
                  borderRadius: "4px",
                  fontSize: "0.85rem"
                }}>
                  <strong>Linked Task:</strong> {script.task.title} ({script.task.status})
                  {script.task.profiles && ` - Assigned to ${script.task.profiles.full_name}`}
                </div>
              )}

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
                      background: "rgba(255, 255, 255, 0.05)",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      maxHeight: "200px",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}
                  >
                    {script.script_content}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-card-actions" style={{ flexDirection: "column", gap: "0.5rem" }}>
              <button
                className="primary-btn"
                onClick={() => handleGenerateScript(script.id)}
                disabled={generating === script.id}
                style={{ width: "100%" }}
              >
                {generating === script.id ? "Generating..." : "Generate with AI"}
              </button>
              {!script.task && script.script_content && (
                <button
                  className="secondary-btn"
                  onClick={() => handleCreateTask(script.id)}
                  style={{ width: "100%" }}
                >
                  Create Production Task
                </button>
              )}
              <button
                className="secondary-btn"
                onClick={() => handleDeleteScript(script.id)}
                style={{ width: "100%" }}
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
