import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Image as ImageIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const fetchedImages = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setImages(fetchedImages);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    // Since we don't have explicit categories in the upload yet, we'll just show 'All' for now
    // or infer from data if available. For this iteration, we'll simplify the filter.
    const filteredImages = images;

    return (
        <div className="min-h-screen bg-schurr-black text-schurr-white py-20">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 border-b border-white/10 pb-8">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-4 text-white"
                        >
                            Visuals
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl font-serif text-white/40 max-w-xl"
                        >
                            Capturing the moments that define us. A collection of life at Schurr.
                        </motion.p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-40">
                        <Loader2 className="animate-spin text-schurr-green" size={48} />
                    </div>
                ) : images.length > 0 ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {filteredImages.map((img, index) => (
                            <motion.div
                                key={img.id}
                                layoutId={`img-${img.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedImage(img)}
                                className="relative group cursor-pointer break-inside-avoid overflow-hidden rounded-lg"
                            >
                                <img
                                    src={img.url}
                                    alt={img.name || "Gallery Image"}
                                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <p className="font-bold text-white text-lg leading-tight truncate">{img.name}</p>
                                    <span className="text-schurr-green text-xs font-mono uppercase mt-1">
                                        {img.createdAt ? new Date(img.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown Date'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 border border-white/10 rounded-3xl bg-white/5">
                        <ImageIcon size={48} className="mx-auto mb-4 text-white/20" />
                        <h3 className="text-2xl font-bold text-white mb-2">Gallery Empty</h3>
                        <p className="text-white/40">No photos have been uploaded yet.</p>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors z-50"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={48} />
                        </button>

                        <motion.div
                            layoutId={`img-${selectedImage.id}`}
                            className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.name}
                                className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-sm"
                            />
                            <div className="mt-6 text-center">
                                <h3 className="text-2xl font-bold uppercase text-white mb-2">{selectedImage.name}</h3>
                                <span className="text-schurr-green font-mono text-sm">
                                    {selectedImage.createdAt ? new Date(selectedImage.createdAt.seconds * 1000).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Gallery;