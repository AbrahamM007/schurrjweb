import React, { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "../styles/weekly.css";
import weeklyImage from "../assets/images/weekly.png"; // Ensure this path is correct

export default function Weekly() {
  const [latest, setLatest] = useState(null);

  // Existing data fetching logic (kept as is)
  useEffect(() => {
    let unsub = null;
    (async () => {
      let apiKey = import.meta.env.VITE_YT_API_KEY;
      let channelId = import.meta.env.VITE_YT_CHANNEL_ID;
      try {
        const cfgSnap = await getDoc(doc(db, "config", "public"));
        if (cfgSnap.exists()) {
          const cfg = cfgSnap.data();
          apiKey = cfg.ytApiKey || apiKey;
          channelId = cfg.ytChannelId || channelId;
        }
      } catch {}
      if (apiKey && channelId) {
        try {
          const uploadsUrl = `https://www.googleapis.com/youtube/v3/channels?key=${apiKey}&id=${channelId}&part=contentDetails`;
          const chResp = await fetch(uploadsUrl);
          const ct1 = chResp.headers.get("content-type") || "";
          if (!chResp.ok || !ct1.includes("application/json")) throw new Error();
          const ch = await chResp.json();
          const uploads = ch.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
          if (!uploads) throw new Error();
          const latestUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploads}&part=contentDetails&maxResults=1`;
          const plResp = await fetch(latestUrl);
          const ct2 = plResp.headers.get("content-type") || "";
          if (!plResp.ok || !ct2.includes("application/json")) throw new Error();
          const pl = await plResp.json();
          const videoId = pl.items?.[0]?.contentDetails?.videoId;
          if (videoId) {
            setLatest({ id: videoId, youtubeId: videoId });
            return;
          }
        } catch {}
      }
      const q = query(
        collection(db, "weeklyVideos"),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      unsub = onSnapshot(q, (snap) => {
        const d = snap.docs[0];
        if (d) setLatest({ id: d.id, ...d.data() });
      });
    })();
    return () => unsub && unsub();
  }, []);

  const youtubeId = latest?.youtubeId;

  return (
    <section className="weekly-shell">
      {/* COLUMN 1: Text Header + Video Frame (Wider column in the image) */}
      <div>
        <div className="weekly-header">
          <span>SPARTAN</span>
          <br />
          <span>WEEKLY</span>
        </div>
        <div className="weekly-video-frame">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="Spartan Weekly"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="weekly-video-placeholder">YouTube video</div>
          )}
        </div>
      </div>
      
      {/* COLUMN 2: Mascot/Flag Image (Smaller column in the image) */}
      <div
        style={{
          borderRadius: "0.5rem",
          overflow: "hidden",
          // *** Ensure this image path is correct in your project's file structure ***
          backgroundImage: `url(${weeklyImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
    </section>
  );
}