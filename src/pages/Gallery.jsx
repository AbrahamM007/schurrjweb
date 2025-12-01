import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const images = [
        { id: 1, src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop", category: "Sports", caption: "Varsity Football vs. Montebello" },
        { id: 2, src: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop", category: "Events", caption: "Homecoming Dance 2025" },
        { id: 3, src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop", category: "Academics", caption: "Science Fair Winners" },
        { id: 4, src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop", category: "Campus", caption: "New Library Opening" },
        { id: 5, src: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?q=80&w=2071&auto=format&fit=crop", category: "Arts", caption: "Spring Concert Rehearsal" },
        { id: 6, src: "https://images.unsplash.com/photo-1544928147-79a2e746b50d?q=80&w=2054&auto=format&fit=crop", category: "Clubs", caption: "Debate Team Finals" },
    ];

    return (
        <div className="min-h-screen bg-schurr-black text-schurr-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-gray-800 pb-8">
                    <div>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">
                            Visuals
                        </h1>
                        <p className="text-xl font-serif text-gray-400 max-w-xl">
                            Capturing the moments that define us.
                        </p>
                    </div>
                    <div className="flex gap-4 mt-8 md:mt-0">
                        {['All', 'Sports', 'Events', 'Arts'].map((tag) => (
                            <button key={tag} className="text-sm font-bold uppercase tracking-widest hover:text-schurr-green transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((img) => (
                        <motion.div
                            key={img.id}
                            layoutId={`img-${img.id}`}
                            onClick={() => setSelectedImage(img)}
                            className="relative aspect-square group cursor-pointer overflow-hidden border border-gray-800"
                            whileHover={{ scale: 0.98 }}
                        >
                            <img
                                src={img.src}
                                alt={img.caption}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                <span className="text-schurr-green text-xs font-bold uppercase tracking-widest mb-2">{img.category}</span>
                                <p className="font-bold text-lg leading-tight">{img.caption}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-8 right-8 text-white hover:text-schurr-green transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={48} />
                        </button>

                        <motion.div
                            layoutId={`img-${selectedImage.id}`}
                            className="relative max-w-5xl w-full max-h-[90vh] aspect-video"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.src}
                                alt={selectedImage.caption}
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                                <h3 className="text-3xl font-bold uppercase mb-2">{selectedImage.caption}</h3>
                                <span className="text-schurr-green font-mono">{selectedImage.category}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;