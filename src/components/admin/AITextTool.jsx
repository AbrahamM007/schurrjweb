import React, { useState } from 'react';
import { Sparkles, Copy, Check, Wand2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { generateHeadline, rewriteText, summarizeText, generateSocialCaption } from '../../services/gemini';

const AITextTool = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [mode, setMode] = useState('headline');

    const modes = [
        { id: 'headline', label: 'Generate Headline' },
        { id: 'rewrite', label: 'Rewrite (Journalistic)' },
        { id: 'summarize', label: 'Summarize' },
        { id: 'social', label: 'Social Caption' },
    ];

    const handleGenerate = async () => {
        setLoading(true);
        try {
            let result = '';
            switch (mode) {
                case 'headline':
                    result = await generateHeadline(input);
                    break;
                case 'rewrite':
                    result = await rewriteText(input);
                    break;
                case 'summarize':
                    result = await summarizeText(input);
                    break;
                case 'social':
                    result = await generateSocialCaption(input);
                    break;
            }
            setOutput(result);
        } catch (error) {
            console.error("AI Generation Error:", error);
            setOutput("Error generating content. Please check your API key.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-gradient-to-br from-schurr-green to-schurr-darkGreen text-white p-3 rounded-xl shadow-lg shadow-schurr-green/20">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-white">AI Co-Pilot</h2>
                    <p className="text-white/40 text-sm font-mono">Powered by Gemini</p>
                </div>
            </div>

            <div className="flex gap-2 mb-8 flex-wrap">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all rounded-lg border ${mode === m.id
                            ? 'bg-schurr-green text-white border-schurr-green shadow-lg shadow-schurr-green/20'
                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase text-white/60">Input Text</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your draft here..."
                        className="w-full h-64 p-4 bg-black/20 border border-white/10 rounded-xl text-white font-serif focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all resize-none placeholder:text-white/20"
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={!input || loading}
                        className="w-full bg-white text-schurr-black hover:bg-schurr-green hover:text-white border-0 py-6 text-lg"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Sparkles className="animate-spin" /> Generating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Wand2 size={20} /> Generate with AI
                            </span>
                        )}
                    </Button>
                </div>

                <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase text-white/60">AI Output</label>
                    <div className="h-64 p-6 bg-schurr-green/5 border border-schurr-green/20 rounded-xl relative overflow-y-auto">
                        {output ? (
                            <div className="text-white/90 font-serif text-lg leading-relaxed whitespace-pre-wrap">
                                {output}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/20 font-mono text-sm">
                                Output will appear here...
                            </div>
                        )}

                        {output && (
                            <button
                                onClick={handleCopy}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-lg text-white/60 hover:text-white transition-colors backdrop-blur-sm"
                            >
                                {copied ? <Check size={18} className="text-schurr-green" /> : <Copy size={18} />}
                            </button>
                        )}
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-xs text-white/40 font-mono text-center">
                            AI can make mistakes. Please review generated content.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITextTool;
