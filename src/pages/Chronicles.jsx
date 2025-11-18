import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Chronicles() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchChronicles();

    const channel = supabase
      .channel('chronicles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chronicles' }, () => {
        fetchChronicles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChronicles = async () => {
    const { data } = await supabase
      .from('chronicles')
      .select('*, profiles!chronicles_author_id_fkey(full_name)')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      setItems([
        {
          id: "placeholder1",
          title: "The First Chronicle",
          content: "Welcome to the Chronicles section. This is where admins share long-form journalism pieces, essays, and creative writing.",
          profiles: { full_name: "Editorial Team" },
          created_at: new Date().toISOString()
        }
      ]);
    } else {
      setItems(data);
    }
  };

  return (
    <section className="opinions-shell">
      <div className="opinions-grid">
        {items.map((chronicle) => (
          <div key={chronicle.id} className="opinion-item" style={{ cursor: 'default' }}>
            {chronicle.cover_image_url && (
              <img
                src={chronicle.cover_image_url}
                alt={chronicle.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}
              />
            )}
            <div style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              {chronicle.title}
            </div>
            <div style={{
              marginBottom: '0.75rem',
              lineHeight: '1.7',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '1.05rem'
            }}>
              {chronicle.content?.slice(0, 300)}...
            </div>
            <div className="opinion-author">
              {chronicle.profiles?.full_name || chronicle.author || "Editorial Team"}
            </div>
            <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
              {new Date(chronicle.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>
      <aside className="opinions-rail">
        <div className="opinions-rail-label">CHRONICLES</div>
      </aside>
    </section>
  );
}
