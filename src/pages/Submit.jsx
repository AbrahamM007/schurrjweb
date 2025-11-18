import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import { generateHeadlineSuggestion } from "../services/geminiClient";

export default function Submit() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    body: "",
    category: "opinion"
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geminiHeadline, setGeminiHeadline] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleGenerateHeadline = async () => {
    if (!form.body) return;
    try {
      setLoading(true);
      const suggestion = await generateHeadlineSuggestion(form.body);
      if (suggestion) setGeminiHeadline(suggestion);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = "";
      if (file) {
        const path = `submissions/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('submissions')
          .getPublicUrl(path);

        imageUrl = publicUrl;
      }

      const { error } = await supabase.from('submissions').insert({
        name: form.name,
        email: form.email,
        title: form.title,
        body: form.body,
        category: form.category,
        suggested_headline: geminiHeadline,
        image_url: imageUrl,
        status: "pending"
      });

      if (error) throw error;

      setForm({
        name: "",
        email: "",
        title: "",
        body: "",
        category: "opinion"
      });
      setFile(null);
      setGeminiHeadline("");
      alert("Submitted! A journalism advisor will review your story.");
    } catch (err) {
      console.error(err);
      alert("There was a problem submitting. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel-shell">
      <h1 className="panel-title">Submit your story</h1>
      <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
        Use this form to send photo stories, opinions, or news tips to the Schurr
        Journalism team.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <div className="field-label">Name</div>
            <input
              className="field-input"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="First & Last"
              required
            />
          </div>
          <div>
            <div className="field-label">Email</div>
            <input
              className="field-input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@student.schurrhs.edu"
              required
            />
          </div>
          <div>
            <div className="field-label">Category</div>
            <select
              className="field-select"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="opinion">Opinion</option>
              <option value="news">News</option>
              <option value="sports">Sports</option>
              <option value="gallery">Gallery / Photo</option>
            </select>
            <div className="chip-row">
              <span className="chip">Opinions</span>
              <span className="chip">Sports</span>
              <span className="chip">News</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.2rem" }}>
          <div className="field-label">Headline</div>
          <input
            className="field-input"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Proposed headline"
          />
          <button
            type="button"
            className="secondary-btn"
            style={{ marginTop: "0.6rem" }}
            onClick={handleGenerateHeadline}
          >
            Ask Gemini for headline
          </button>
          {geminiHeadline && (
            <div className="text-muted" style={{ marginTop: "0.4rem" }}>
              Suggested: <strong>{geminiHeadline}</strong>
            </div>
          )}
        </div>

        <div style={{ marginTop: "1.2rem" }}>
          <div className="field-label">Story / Opinion</div>
          <textarea
            className="field-textarea"
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="Write your story, opinion, or description here..."
            required
          />
        </div>

        <div style={{ marginTop: "1.2rem" }}>
          <div className="field-label">Optional image</div>
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>

        <button className="primary-btn" style={{ marginTop: "1.8rem" }} disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </section>
  );
}
