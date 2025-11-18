import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../hooks/useAuth";

export default function ChroniclesManager() {
  const [chronicles, setChronicles] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    coverImageUrl: "",
    published: false
  });
  const [editingId, setEditingId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const { supabaseUser } = useAuth();

  useEffect(() => {
    loadChronicles();
  }, []);

  const loadChronicles = async () => {
    const { data } = await supabase
      .from("chronicles")
      .select("*, profiles!chronicles_author_id_fkey(full_name, email)")
      .order("created_at", { ascending: false });
    setChronicles(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from("chronicles")
        .update({
          title: form.title,
          content: form.content,
          cover_image_url: form.coverImageUrl,
          published: form.published
        })
        .eq("id", editingId);
    } else {
      await supabase.from("chronicles").insert({
        title: form.title,
        content: form.content,
        cover_image_url: form.coverImageUrl,
        published: form.published,
        author_id: supabaseUser?.id
      });
    }

    setForm({ title: "", content: "", coverImageUrl: "", published: false });
    setEditingId(null);
    setAiSuggestions(null);
    loadChronicles();
  };

  const handleEdit = (chronicle) => {
    setForm({
      title: chronicle.title,
      content: chronicle.content,
      coverImageUrl: chronicle.cover_image_url || "",
      published: chronicle.published
    });
    setEditingId(chronicle.id);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this chronicle?")) {
      await supabase.from("chronicles").delete().eq("id", id);
      loadChronicles();
    }
  };

  const handleCancelEdit = () => {
    setForm({ title: "", content: "", coverImageUrl: "", published: false });
    setEditingId(null);
    setAiSuggestions(null);
  };

  const handleGetAIHelp = async () => {
    if (!form.content || form.content.length < 50) {
      alert("Please write at least 50 characters to get AI suggestions");
      return;
    }

    setAiLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("You must be logged in");
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-content`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: form.content,
          title: form.title,
          analysisType: "chronicle"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get AI suggestions");
      }

      const data = await response.json();
      setAiSuggestions(data);
    } catch (error) {
      console.error("AI analysis failed:", error);
      alert("Failed to get AI suggestions. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const applyAISuggestion = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        Chronicles
      </h2>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Create and manage long-form journalism pieces with AI assistance
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <div className="form-grid">
          <div>
            <div className="field-label">Chronicle Title</div>
            <input
              className="field-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="The Evolution of School Spirit"
              required
            />
          </div>
          <div>
            <div className="field-label">Cover Image URL</div>
            <input
              className="field-input"
              value={form.coverImageUrl}
              onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <div className="field-label">Content</div>
            <textarea
              className="field-textarea"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your chronicle here... Use the AI tools below for assistance."
              rows={12}
              required
            />
            <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleGetAIHelp}
                disabled={aiLoading}
              >
                {aiLoading ? "Analyzing..." : "Get AI Suggestions"}
              </button>
              {form.content.length > 0 && (
                <span className="text-muted" style={{ fontSize: "0.85rem", alignSelf: "center" }}>
                  {form.content.length} characters
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            <label htmlFor="published" style={{ fontWeight: 600 }}>
              Publish immediately
            </label>
          </div>
        </div>

        {aiSuggestions && (
          <div style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            background: "rgba(150, 199, 191, 0.1)",
            borderRadius: "8px",
            border: "1px solid rgba(150, 199, 191, 0.3)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              AI Suggestions
            </h3>

            {aiSuggestions.improvedTitle && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Better Title:</div>
                <div style={{
                  padding: "0.8rem",
                  background: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "4px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span>{aiSuggestions.improvedTitle}</span>
                  <button
                    type="button"
                    className="secondary-btn"
                    style={{ padding: "0.3rem 0.8rem", fontSize: "0.85rem" }}
                    onClick={() => applyAISuggestion("title", aiSuggestions.improvedTitle)}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {aiSuggestions.summary && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>AI Summary:</div>
                <div style={{
                  padding: "0.8rem",
                  background: "rgba(255, 255, 255, 0.8)",
                  borderRadius: "4px"
                }}>
                  {aiSuggestions.summary}
                </div>
              </div>
            )}

            {aiSuggestions.tags && aiSuggestions.tags.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Suggested Tags:</div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {aiSuggestions.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: "0.3rem 0.8rem",
                        background: "rgba(150, 199, 191, 0.5)",
                        borderRadius: "12px",
                        fontSize: "0.85rem",
                        fontWeight: 600
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {aiSuggestions.engagementScore !== undefined && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
                  Predicted Engagement: {aiSuggestions.engagementScore}/100
                </div>
                <div style={{
                  width: "100%",
                  height: "8px",
                  background: "rgba(0, 0, 0, 0.1)",
                  borderRadius: "4px",
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: `${aiSuggestions.engagementScore}%`,
                    height: "100%",
                    background: aiSuggestions.engagementScore > 70 ? "#27ae60" :
                               aiSuggestions.engagementScore > 40 ? "#f39c12" : "#e74c3c",
                    transition: "width 0.3s"
                  }} />
                </div>
              </div>
            )}

            {aiSuggestions.improvements && aiSuggestions.improvements.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: "0.4rem" }}>Improvements:</div>
                <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.8" }}>
                  {aiSuggestions.improvements.map((improvement, idx) => (
                    <li key={idx}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem" }}>
          <button className="primary-btn">
            {editingId ? "Update Chronicle" : "Create Chronicle"}
          </button>
          {editingId && (
            <button type="button" className="secondary-btn" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="submission-list">
        {chronicles.map((chronicle) => (
          <div key={chronicle.id} className="admin-card">
            <div className="admin-card-main">
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.5rem" }}>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {chronicle.title}
                </div>
                <span
                  style={{
                    padding: "0.2rem 0.6rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    background: chronicle.published ? "#27ae60" : "#95a5a6",
                    color: "white"
                  }}
                >
                  {chronicle.published ? "Published" : "Draft"}
                </span>
              </div>

              <div className="text-muted" style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                By {chronicle.profiles?.full_name || "Unknown"} • {new Date(chronicle.created_at).toLocaleDateString()}
              </div>

              {chronicle.cover_image_url && (
                <img
                  src={chronicle.cover_image_url}
                  alt={chronicle.title}
                  style={{
                    width: "100%",
                    maxHeight: "150px",
                    objectFit: "cover",
                    borderRadius: "4px",
                    marginBottom: "0.8rem"
                  }}
                />
              )}

              <div style={{ marginBottom: "0.8rem", lineHeight: "1.6" }}>
                {chronicle.content.slice(0, 250)}...
              </div>
            </div>
            <div className="admin-card-actions" style={{ flexDirection: "column", gap: "0.5rem" }}>
              <button
                className="secondary-btn"
                onClick={() => handleEdit(chronicle)}
                style={{ width: "100%" }}
              >
                Edit
              </button>
              <button
                className="secondary-btn"
                onClick={() => handleDelete(chronicle.id)}
                style={{ width: "100%" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {chronicles.length === 0 && (
          <div className="text-muted">No chronicles yet. Create one above!</div>
        )}
      </div>
    </div>
  );
}
