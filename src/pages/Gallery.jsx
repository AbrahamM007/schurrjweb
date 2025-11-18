import React, { useEffect, useState } from "react";
// Mock Firebase imports/dependencies since external file imports often fail in this environment.
// In a real project, replace these with your actual imports.
const mockDb = { collection: () => {}, orderBy: () => {}, limit: () => {} }; 
const db = typeof window !== 'undefined' && window.db ? window.db : mockDb;
const collection = (database, path) => ({});
const query = (colRef, ...constraints) => ({});
const orderBy = (field, direction) => ({});
const onSnapshot = (q, callback) => {
    // Mock onSnapshot logic with placeholder data
    setTimeout(() => {
        const mockData = [
            {
                id: "placeholder1",
                title: "Friday Night Lights",
                credit: "JOHN DOE", // Using uppercase to match the screenshot
                // Using a different, simpler image placeholder that is more likely to load.
                // If you want the original football field image, please replace this URL.
                imageUrl:
                    "https://placehold.co/800x1200/222/FFF?text=GALLERY+IMAGE+1"
            },
            {
                id: "placeholder2",
                title: "Spartan Mascot",
                credit: "JANE SMITH",
                imageUrl: "https://placehold.co/800x1200/4CAF50/FFF?text=GALLERY+IMAGE+2"
            }
        ];
        callback({ docs: mockData.map(d => ({ id: d.id, data: () => d })) });
    }, 100);
    return () => {}; // Return an unsubscribe function
};


export default function Gallery() {
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const userId = 'mock-user-id'; // Use real userId from auth context if available

  // Mock font style definitions (assuming global Milker font is available)
  const fontStyle = { 
    fontFamily: 'Milker, sans-serif', // Assuming "Milker" is globally available
    brandColor: '#96c7bf', 
  };

  useEffect(() => {
    setIsAuthReady(true);
    
    const defaultPlaceholder = {
        id: "placeholder",
        title: "Friday Night Lights",
        credit: "JOHN DOE", // Default credit
        imageUrl: "https://placehold.co/800x1200/4CAF50/FFF?text=GALLERY+IMAGE+FALLBACK"
    };

    // Fallback/Mock initialization if Firestore is not globally available
    if (db === mockDb) {
        // Use a mock onSnapshot
        onSnapshot(null, (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setItems(list.length > 0 ? list : [defaultPlaceholder]);
        });
        return;
    }

    try {
        const q = query(collection(db, "galleryItems"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setItems(list.length > 0 ? list : [defaultPlaceholder]);
        }, (error) => {
             setItems([defaultPlaceholder]);
             console.error("Firestore error:", error);
        });
        return () => unsub();
    } catch (e) {
        console.error("Gallery component initialization error:", e);
        // Ensure a fallback state even if Firebase setup completely fails
        setItems([defaultPlaceholder]);
    }
  }, [isAuthReady]);


  const current = items[index] ?? items[0];

  const go = (dir) => {
    if (!items.length) return;
    setIndex((prev) => {
      const next = (prev + dir + items.length) % items.length;
      return next;
    });
  };

  return (
    // Full screen container with black background
    <section className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Gallery Slider/Image Container (Tall, constrained aspect ratio) */}
      <div className="relative w-[90vw] h-[85vh] max-w-[400px] md:max-w-[450px] lg:max-w-[500px]">
        <div 
            className="absolute inset-0 bg-neutral-900 rounded-md shadow-2xl overflow-hidden"
            // The image in the screenshot has very sharp, hard edges.
            // Using a fixed aspect ratio for the inner content.
            style={{ 
                aspectRatio: '9 / 16', 
                margin: 'auto', // Centers the content within its flexible parent
                backgroundColor: '#222',
            }}
        >
            {/* The actual image slide with the background image */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                // FIX: Added a strong default background color in case the image fails to load 
                // but the image container is still visible.
                style={{ 
                    backgroundImage: `url(${current?.imageUrl})`,
                    backgroundColor: '#444' // A gray fallback color
                }}
            />

            {/* Photo Credit Text (Rotated and positioned exactly like the image) */}
            <div 
                className="absolute top-[calc(50%-50px)] right-[-50px] transform rotate-90 text-white text-xs tracking-widest uppercase py-2 px-4 bg-black bg-opacity-70 flex items-center justify-center z-10"
                style={{ ...fontStyle, width: '150px', height: '30px' }} // Precise size to match screenshot
            >
                {current?.credit || "JOHN DOE"}
            </div>
            
            {/* Navigation Buttons (Precisely styled to match the image) */}
            <button
                type="button"
                className="absolute top-1/2 left-[-60px] transform -translate-y-1/2 w-16 h-24 bg-white flex items-center justify-center text-black text-3xl font-bold opacity-80 hover:opacity-100 transition-opacity duration-200 z-10"
                onClick={() => go(-1)}
                aria-label="Previous image"
                style={{ clipPath: 'polygon(0% 0%, 75% 0%, 100% 50%, 75% 100%, 0% 100%)' }} // Angled edge
            >
                &lt;
            </button>
            <button
                type="button"
                className="absolute top-1/2 right-[-60px] transform -translate-y-1/2 w-16 h-24 bg-white flex items-center justify-center text-black text-3xl font-bold opacity-80 hover:opacity-100 transition-opacity duration-200 z-10"
                onClick={() => go(1)}
                aria-label="Next image"
                style={{ clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 25% 100%, 0% 50%)' }} // Angled edge
            >
                &gt;
            </button>
        </div>
      </div>

      {/* GALLERY Title (Large, white, and positioned to overlap the bottom) */}
      <div 
        className="absolute bottom-10 md:bottom-16 lg:bottom-20 text-white font-black leading-none tracking-widest select-none"
        style={{ 
            ...fontStyle, 
            fontSize: 'clamp(80px, 18vw, 200px)', // Larger font to match
            zIndex: 5,
            textAlign: 'center', // Ensure text stays centered
            width: '90%', // Allow it to span more width
            pointerEvents: 'none' // Prevent interaction with title
        }}
      >
        GALLERY
      </div>
    </section>
  );
}