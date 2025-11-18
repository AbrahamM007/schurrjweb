import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export default function Opinions() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "opinions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (!list.length) {
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
      } else setItems(list);
    });
    return () => unsub();
  }, []);

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
