import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';

const ArticleForm = ({ initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        content: '',
        image: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Error saving article:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {/* Image URL Input */}
                <div>
                    <label className="block text-sm font-bold uppercase text-white/60 mb-2">Cover Image URL</label>
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <p className="text-xs text-white/40 mt-2">Paste a direct link to an image (ends in .jpg, .png, etc.)</p>
                        </div>

                        {/* Preview */}
                        <div className="w-32 h-24 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
                            {formData.image ? (
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-bold uppercase text-white/60 mb-2">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all"
                        placeholder="Enter article title"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-white/60 mb-2">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all appearance-none"
                        >
                            <option value="" disabled>Select category</option>
                            <option value="News">News</option>
                            <option value="Sports">Sports</option>
                            <option value="Arts">Arts</option>
                            <option value="Opinion">Opinion</option>
                            <option value="Features">Features</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-white/60 mb-2">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all"
                        />
                    </div>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-bold uppercase text-white/60 mb-2">Content</label>
                    <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows={10}
                        className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white font-serif focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all resize-none"
                        placeholder="Write your article content here..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-schurr-green text-white hover:bg-schurr-green/80 border-0 min-w-[120px]">
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={18} /> Saving...
                        </span>
                    ) : (
                        initialData ? 'Update Article' : 'Create Article'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ArticleForm;
