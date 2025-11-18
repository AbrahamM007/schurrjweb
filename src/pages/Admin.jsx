import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import ScriptManager from "../components/ScriptManager";
import TeamManager from "../components/TeamManager";
import ChroniclesManager from "../components/ChroniclesManager";
import AIAnalyticsDashboard from "../components/AIAnalyticsDashboard";
import { useAuth } from "../hooks/useAuth";

const tabs = ["submissions", "gallery", "chronicles", "weekly", "scripts", "team", "analytics"];

export default function Admin() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("submissions");
  const [submissions, setSubmissions] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [opinions, setOpinions] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [weeklyForm, setWeeklyForm] = useState({ youtubeId: "" });
  const [galleryForm, setGalleryForm] = useState({
    title: "",
    credit: "",
    imageUrl: ""
  });
  const [opinionForm, setOpinionForm] = useState({
    text: "",
    author: ""
  });
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchGallery();
    fetchOpinions();
    fetchWeekly();

    const submissionsChannel = supabase
      .channel('submissions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchSubmissions();
      })
      .subscribe();

    const galleryChannel = supabase
      .channel('gallery_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_items' }, () => {
        fetchGallery();
      })
      .subscribe();

    const opinionsChannel = supabase
      .channel('opinions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opinions' }, () => {
        fetchOpinions();
      })
      .subscribe();

    const weeklyChannel = supabase
      .channel('weekly_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_videos' }, () => {
        fetchWeekly();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(submissionsChannel);
      supabase.removeChannel(galleryChannel);
      supabase.removeChannel(opinionsChannel);
      supabase.removeChannel(weeklyChannel);
    };
  }, []);

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSubmissions(data);
  };

  const fetchGallery = async () => {
    const { data } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setGallery(data);
  };

  const fetchOpinions = async () => {
    const { data } = await supabase
      .from('opinions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOpinions(data);
  };

  const fetchWeekly = async () => {
    const { data } = await supabase
      .from('weekly_videos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setWeekly(data);
  };

  const approveSubmissionToCollection = async (sub) => {
    if (sub.category === "gallery") {
      await supabase.from('gallery_items').insert({
        title: sub.title || sub.suggested_headline || "Untitled",
        credit: sub.name || sub.email,
        image_url: sub.image_url || ""
      });
    } else {
      await supabase.from('opinions').insert({
        text: sub.body,
        author: sub.name || "Student"
      });
    }
    await supabase.from('submissions').update({ status: "approved" }).eq('id', sub.id);
  };

  const deleteSubmission = async (id) => {
    await supabase.from('submissions').delete().eq('id', id);
  };

  const createGallery = async (e) => {
    e.preventDefault();
    await supabase.from('gallery_items').insert({
      title: galleryForm.title,
      credit: galleryForm.credit,
      image_url: galleryForm.imageUrl
    });
    setGalleryForm({ title: "", credit: "", imageUrl: "" });
  };

  const createOpinion = async (e) => {
    e.preventDefault();
    await supabase.from('opinions').insert({
      text: opinionForm.text,
      author: opinionForm.author
    });
    setOpinionForm({ text: "", author: "" });
  };

  const saveWeekly = async (e) => {
    e.preventDefault();
    await supabase.from('weekly_videos').insert({
      youtube_id: weeklyForm.youtubeId
    });
    setWeeklyForm({ youtubeId: "" });
  };

  return (
    <section className="panel-shell" style={lightMode ? {
      background: "#f5f5f5",
      color: "#1a1a1a"
    } : {}}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1 className="panel-title">Admin dashboard</h1>
          <p className="text-muted" style={{ marginBottom: "1.2rem" }}>
            Manage content, create video scripts with AI, and assign team tasks.
          </p>
        </div>
        <button
          onClick={() => setLightMode(!lightMode)}
          style={{
            padding: "0.6rem 1.2rem",
            background: lightMode ? "#1a1a1a" : "#f5f5f5",
            color: lightMode ? "#f5f5f5" : "#1a1a1a",
            border: "2px solid",
            borderColor: lightMode ? "#1a1a1a" : "#f5f5f5",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.9rem",
            transition: "all 0.3s ease"
          }}
        >
          {lightMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              "admin-tab" + (tab === activeTab ? " active" : "")
            }
            onClick={() => setActiveTab(tab)}
            style={lightMode ? {
              background: tab === activeTab ? "#1a1a1a" : "transparent",
              color: tab === activeTab ? "#f5f5f5" : "#1a1a1a",
              borderColor: "#1a1a1a"
            } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "submissions" && (
        <div className="submission-list">
          {submissions.map((sub) => (
            <div key={sub.id} className="submission-item">
              <div className="submission-meta">
                {sub.category?.toUpperCase()} • {sub.name} •{" "}
                {sub.email}
              </div>
              <div style={{ marginTop: "0.4rem", fontWeight: 600 }}>
                {sub.title || sub.suggested_headline || "(no headline)"}
              </div>
              <div className="text-muted" style={{ marginTop: "0.3rem" }}>
                {sub.body?.slice(0, 200)}...
              </div>
              <div className="admin-card-actions" style={{ marginTop: "0.5rem" }}>
                <button
                  className="secondary-btn"
                  onClick={() => approveSubmissionToCollection(sub)}
                >
                  Approve & publish
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => deleteSubmission(sub.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!submissions.length && (
            <div className="text-muted">No submissions yet.</div>
          )}
        </div>
      )}

      {activeTab === "gallery" && (
        <>
          <form onSubmit={createGallery}>
            <div className="form-grid">
              <div>
                <div className="field-label">Title</div>
                <input
                  className="field-input"
                  value={galleryForm.title}
                  onChange={(e) =>
                    setGalleryForm({ ...galleryForm, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <div className="field-label">Credit</div>
                <input
                  className="field-input"
                  value={galleryForm.credit}
                  onChange={(e) =>
                    setGalleryForm({ ...galleryForm, credit: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="field-label">Image URL</div>
                <input
                  className="field-input"
                  value={galleryForm.imageUrl}
                  onChange={(e) =>
                    setGalleryForm({ ...galleryForm, imageUrl: e.target.value })
                  }
                  placeholder="https://"
                  required
                />
              </div>
            </div>
            <button className="primary-btn" style={{ marginTop: "1.4rem" }}>
              Add gallery image
            </button>
          </form>

          <div className="submission-list">
            {gallery.map((g) => (
              <div key={g.id} className="admin-card">
                <div className="admin-card-main">
                  <div style={{ fontWeight: 600 }}>{g.title}</div>
                  <div className="text-muted">
                    {g.credit} • {g.image_url?.slice(0, 50)}
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => supabase.from('gallery_items').delete().eq('id', g.id).then(fetchGallery)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "opinions" && (
        <>
          <form onSubmit={createOpinion}>
            <div className="form-grid">
              <div>
                <div className="field-label">Opinion text</div>
                <textarea
                  className="field-textarea"
                  value={opinionForm.text}
                  onChange={(e) =>
                    setOpinionForm({ ...opinionForm, text: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <div className="field-label">Author</div>
                <input
                  className="field-input"
                  value={opinionForm.author}
                  onChange={(e) =>
                    setOpinionForm({ ...opinionForm, author: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
            <button className="primary-btn" style={{ marginTop: "1.4rem" }}>
              Add opinion
            </button>
          </form>

          <div className="submission-list">
            {opinions.map((op) => (
              <div key={op.id} className="admin-card">
                <div className="admin-card-main">
                  <div>{op.text}</div>
                  <div className="text-muted">{op.author}</div>
                </div>
                <div className="admin-card-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => supabase.from('opinions').delete().eq('id', op.id).then(fetchOpinions)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "weekly" && (
        <>
          <form onSubmit={saveWeekly}>
            <div style={{ maxWidth: 420 }}>
              <div className="field-label">YouTube video ID</div>
              <input
                className="field-input"
                value={weeklyForm.youtubeId}
                onChange={(e) =>
                  setWeeklyForm({ youtubeId: e.target.value })
                }
                placeholder="Example: dQw4w9WgXcQ"
                required
              />
              <button className="primary-btn" style={{ marginTop: "1.2rem" }}>
                Save as latest Spartan Weekly
              </button>
            </div>
          </form>
          <div className="submission-list">
            {weekly.map((v) => (
              <div key={v.id} className="admin-card">
                <div className="admin-card-main">
                  <div style={{ fontWeight: 600 }}>{v.youtube_id}</div>
                  <div className="text-muted">{v.id}</div>
                </div>
                <div className="admin-card-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => supabase.from('weekly_videos').delete().eq('id', v.id).then(fetchWeekly)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "scripts" && isAdmin && <ScriptManager />}
      {activeTab === "team" && <TeamManager />}
      {activeTab === "chronicles" && <ChroniclesManager />}
      {activeTab === "analytics" && <AIAnalyticsDashboard />}
    </section>
  );
}
