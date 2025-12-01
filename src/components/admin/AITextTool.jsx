import React, { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
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
        <div className="bg-white border-3 border-schurr-black p-8 shadow-brutal">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-schurr-green text-white p-2">
                    <Sparkles size={24} />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">AI Co-Pilot</h2>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap">
                {modes.map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all border-2 ${mode === m.id
                            ? 'bg-schurr-black text-white border-schurr-black'
                            : 'bg-white text-schurr-black border-schurr-black hover:bg-gray-100'
                            }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold uppercase mb-2">Input Text</label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your draft here..."
                        className="w-full h-32 p-4 border-2 border-schurr-black font-serif focus:outline-none focus:border-schurr-green"
                    />
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={!input || loading}
                    className="w-full"
                >
                    {loading ? 'Generating...' : 'Generate with AI'}
                </Button>

                {output && (
                    <div className="relative">
                        <label className="block text-sm font-bold uppercase mb-2">AI Output</label>
                        <div className="p-4 bg-gray-50 border-2 border-schurr-green font-serif relative">
                            {output}
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 p-2 hover:bg-white transition-colors"
                            >
                                {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AITextTool;
