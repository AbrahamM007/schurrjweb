import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import weeklyImage from "../assets/images/weekly.png";

export default function Weekly() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    fetchLatestVideo();

    const channel = supabase
      .channel('weekly_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_videos' }, () => {
        fetchLatestVideo();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLatestVideo = async () => {
    const apiKey = import.meta.env.VITE_YT_API_KEY;
    const channelId = import.meta.env.VITE_YT_CHANNEL_ID;

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
          setLatest({ id: videoId, youtube_id: videoId });
          return;
        }
      } catch { }
    }

    const { data } = await supabase
      .from('weekly_videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) setLatest(data);
  };

  const youtubeId = latest?.youtube_id;

  return (
    <section className="weekly-shell">
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

      <div
        style={{
          borderRadius: "0.5rem",
          overflow: "hidden",
          backgroundImage: `url(${weeklyImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
    </section>
  );
}
