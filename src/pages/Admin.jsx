import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import ScriptManager from "../components/ScriptManager";
import TeamManager from "../components/TeamManager";
import { useAuth } from "../hooks/useAuth";

const tabs = ["submissions", "gallery", "opinions", "weekly", "scripts", "team"];

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

  useEffect(() => {
    const unsub1 = onSnapshot(
      query(collection(db, "submissions"), orderBy("createdAt", "desc")),
      (snap) => setSubmissions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsub2 = onSnapshot(
      query(collection(db, "galleryItems"), orderBy("createdAt", "desc")),
      (snap) => setGallery(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsub3 = onSnapshot(
      query(collection(db, "opinions"), orderBy("createdAt", "desc")),
      (snap) => setOpinions(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsub4 = onSnapshot(
      query(collection(db, "weeklyVideos"), orderBy("createdAt", "desc")),
      (snap) => setWeekly(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const approveSubmissionToCollection = async (sub) => {
    if (sub.category === "gallery") {
      await addDoc(collection(db, "galleryItems"), {
        title: sub.title || sub.suggestedHeadline || "Untitled",
        credit: sub.name || sub.email,
        imageUrl: sub.imageUrl || "",
        createdAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, "opinions"), {
        text: sub.body,
        author: sub.name || "Student",
        createdAt: serverTimestamp()
      });
    }
    await updateDoc(doc(db, "submissions", sub.id), { status: "approved" });
  };

  const deleteSubmission = async (id) => {
    await deleteDoc(doc(db, "submissions", id));
  };

  const createGallery = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "galleryItems"), {
      ...galleryForm,
      createdAt: serverTimestamp()
    });
    setGalleryForm({ title: "", credit: "", imageUrl: "" });
  };

  const createOpinion = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "opinions"), {
      ...opinionForm,
      createdAt: serverTimestamp()
    });
    setOpinionForm({ text: "", author: "" });
  };

  const saveWeekly = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "weeklyVideos"), {
      ...weeklyForm,
      createdAt: serverTimestamp()
    });
    setWeeklyForm({ youtubeId: "" });
  };

  return (
    <section className="panel-shell">
      <h1 className="panel-title">Admin dashboard</h1>
      <p className="text-muted" style={{ marginBottom: "1.2rem" }}>
        Manage content, create video scripts with AI, and assign team tasks.
      </p>
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              "admin-tab" + (tab === activeTab ? " active" : "")
            }
            onClick={() => setActiveTab(tab)}
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
                {sub.title || sub.suggestedHeadline || "(no headline)"}
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
                    {g.credit} • {g.imageUrl?.slice(0, 50)}
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => deleteDoc(doc(db, "galleryItems", g.id))}
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
                    onClick={() => deleteDoc(doc(db, "opinions", op.id))}
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
                  <div style={{ fontWeight: 600 }}>{v.youtubeId}</div>
                  <div className="text-muted">{v.id}</div>
                </div>
                <div className="admin-card-actions">
                  <button
                    className="secondary-btn"
                    onClick={() => deleteDoc(doc(db, "weeklyVideos", v.id))}
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
    </section>
  );
}
