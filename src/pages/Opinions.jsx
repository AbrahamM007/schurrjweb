import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Opinions() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchOpinions();

    const channel = supabase
      .channel('opinions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opinions' }, () => {
        fetchOpinions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOpinions = async () => {
    const { data } = await supabase
      .from('opinions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      setItems([
        {
          id: "placeholder1",
          text: "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
          author: "John Doe"
        },
        {
          id: "placeholder2",
          text: "Student voices matter. Lorem ipsum dolor sit amet.",
          author: "Jane Spartan"
        }
      ]);
    } else {
      setItems(data);
    }
  };

  return (
    <section className="opinions-shell">
      <div className="opinions-grid">
        {items.map((op) => (
          <div key={op.id} className="opinion-item">
            <div>{op.text}</div>
            <div className="opinion-author">{op.author}</div>
          </div>
        ))}
      </div>
      <aside className="opinions-rail">
        <div className="opinions-rail-label">OPINIONS</div>
      </aside>
    </section>
  );
}
