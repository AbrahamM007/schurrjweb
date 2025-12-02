import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { X, FileText, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';

const UploadModal = ({ type, onSubmit, onCancel }) => {
    const [urls, setUrls] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!urls.trim()) return;

        setLoading(true);
        try {
            // Split by newlines and filter empty strings
            const urlList = urls.split('\n').map(u => u.trim()).filter(u => u);

            const processedFiles = urlList.map(url => {
                // Try to extract a name from the URL, fallback to timestamp
                const name = url.split('/').pop().split('?')[0] || `Item ${Date.now()}`;
                return {
                    url,
                    name: decodeURIComponent(name),
                    type: type === 'chronicles' ? 'application/pdf' : 'image/jpeg',
                    size: 0 // Unknown size
                };
            });

            await onSubmit(processedFiles);
        } catch (error) {
            console.error("Error processing URLs:", error);
        } finally {
            setLoading(false);
        }
    };

    const isPDF = type === 'chronicles';
    const Icon = isPDF ? FileText : ImageIcon;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold uppercase text-white/60 mb-2">
                    {isPDF ? 'PDF URLs (One per line)' : 'Image URLs (One per line)'}
                </label>
                <div className="relative">
                    <textarea
                        value={urls}
                        onChange={(e) => setUrls(e.target.value)}
                        rows={6}
                        className="w-full p-4 bg-black/20 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all resize-none"
                        placeholder={isPDF ? "https://example.com/issue-1.pdf\nhttps://example.com/issue-2.pdf" : "https://example.com/photo1.jpg\nhttps://example.com/photo2.png"}
                    />
                    <div className="absolute top-3 right-3 p-2 bg-white/5 rounded-lg pointer-events-none">
                        <LinkIcon size={16} className="text-white/40" />
                    </div>
                </div>
                <p className="text-xs text-white/40 mt-2">
                    Paste direct links to your files. Each link should be on a new line.
                </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={!urls.trim() || loading}
                    className="bg-schurr-green text-white hover:bg-schurr-green/80 border-0 min-w-[120px]"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={18} /> Adding...
                        </span>
                    ) : (
                        'Add Links'
                    )}
                </Button>
            </div>
        </form>
    );
};

export default UploadModal;
