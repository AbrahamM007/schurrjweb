import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '../ui/Button';
import {
    Bold, Italic, List, ListOrdered, Quote, Undo, Redo,
    Sparkles, Save, X, Loader2, Wand2, AlignLeft
} from 'lucide-react';

const ChronicleEditor = ({ initialContent = '', onSave, onCancel }) => {
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [showAiInput, setShowAiInput] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your chronicle... or ask AI to write it for you!',
            }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] text-white/90 leading-relaxed',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const [aiMode, setAiMode] = useState('Draft');

    const handleAiGenerate = async () => {
        if (aiMode !== 'Headlines' && !aiPrompt.trim()) return;

        setIsAiLoading(true);
        try {
            const OpenAI = (await import("openai")).default;
            const client = new OpenAI({
                apiKey: import.meta.env.VITE_OPENAI_API_KEY,
                dangerouslyAllowBrowser: true
            });

            const context = editor.getText();
            const selection = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');

            let systemPrompt = "You are an AI assistant for a high school newspaper.";
            let userPrompt = "";

            switch (aiMode) {
                case 'Remix':
                    systemPrompt += " Your task is to rewrite the provided text.";
                    userPrompt = `Original Text: "${selectedText || context.slice(-500)}"\n\nTask: Rewrite this text to be "${aiPrompt}". Keep the core meaning but change the tone/style completely.`;
                    break;
                case 'Interview':
                    systemPrompt += " Your task is to generate a realistic interview transcript.";
                    userPrompt = `Task: Generate a realistic, engaging interview transcript between a student reporter and "${aiPrompt}". \n\nTopic: The user input describes the persona and topic. Create 3-4 Q&A exchanges. Format as "Reporter: [Question]" and "[Name]: [Answer]".`;
                    break;
                case 'Headlines':
                    systemPrompt += " Your task is to generate viral headlines.";
                    userPrompt = `Article Content: "${context.slice(0, 1000)}..."\n\nTask: Generate 5 viral, catchy, and professional headlines for this school newspaper article. Return ONLY the list of headlines.`;
                    break;
                case 'Draft':
                default:
                    systemPrompt += " Your task is to write journalistic content.";
                    userPrompt = context
                        ? `Context: "${context.slice(-500)}"\n\nTask: ${aiPrompt}\n\nWrite in a journalistic, engaging style suitable for a school newspaper.`
                        : `Task: ${aiPrompt}\n\nWrite in a journalistic, engaging style suitable for a school newspaper.`;
                    break;
            }

            const completion = await client.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
            });

            const text = completion.choices[0].message.content;

            // Insert logic based on mode
            if (aiMode === 'Headlines') {
                const formattedHeadlines = `\n\n<strong>Suggested Headlines:</strong>\n${text.replace(/\n/g, '<br/>')}\n\n`;
                editor.chain().focus().insertContent(formattedHeadlines).run();
            } else if (aiMode === 'Remix' && !editor.state.selection.empty) {
                // If text was selected for remix, replace it
                editor.chain().focus().deleteSelection().insertContent(text).run();
            } else {
                editor.chain().focus().insertContent(text).run();
            }

            setAiPrompt('');
            if (aiMode !== 'Remix') setShowAiInput(false); // Keep open for remix to try again
        } catch (error) {
            console.error("AI Generation failed:", error);
            alert("AI failed to generate content. Please check your API key.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const ToolbarButton = ({ onClick, isActive, icon: Icon, title }) => (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg transition-all ${isActive
                ? 'bg-schurr-green text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            title={title}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-schurr-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        icon={Bold}
                        title="Bold"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        icon={Italic}
                        title="Italic"
                    />
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        icon={AlignLeft}
                        title="Heading"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        icon={List}
                        title="Bullet List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        icon={ListOrdered}
                        title="Ordered List"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        icon={Quote}
                        title="Quote"
                    />
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        isActive={false}
                        icon={Undo}
                        title="Undo"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        isActive={false}
                        icon={Redo}
                        title="Redo"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowAiInput(!showAiInput)}
                        className={`border-0 transition-all ${showAiInput ? 'bg-white/10 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'}`}
                        size="sm"
                    >
                        <Sparkles size={16} className="mr-2" />
                        AI Magic
                    </Button>
                </div>
            </div>

            {/* AI Input Panel */}
            {showAiInput && (
                <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-white/10 animate-in slide-in-from-top-2">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                        {['Draft', 'Remix', 'Interview', 'Headlines'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setAiMode(mode)}
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${aiMode === mode
                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                            <input
                                type="text"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                                placeholder={
                                    aiMode === 'Draft' ? "Ask AI to write something... (e.g., 'Write an intro about the game')" :
                                        aiMode === 'Remix' ? "Select text & choose tone (e.g., 'Make it dramatic', 'Fix grammar')" :
                                            aiMode === 'Interview' ? "Enter Persona & Topic (e.g., 'Coach Johnson, Season Finale')" :
                                                "Click Generate to get 5 viral headlines based on your text"
                                }
                                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-purple-500/30 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                autoFocus
                                disabled={aiMode === 'Headlines'}
                            />
                        </div>
                        <Button
                            onClick={handleAiGenerate}
                            disabled={isAiLoading || (aiMode !== 'Headlines' && !aiPrompt.trim())}
                            className="bg-purple-600 hover:bg-purple-700 text-white border-0 shadow-lg shadow-purple-600/20"
                        >
                            {isAiLoading ? <Loader2 className="animate-spin" size={18} /> : 'Generate'}
                        </Button>
                    </div>

                    {aiMode === 'Remix' && (
                        <p className="text-xs text-purple-300/60 mt-2 ml-1">
                            *Tip: Highlight text in the editor first to remix it!
                        </p>
                    )}
                </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-schurr-black">
                <EditorContent editor={editor} />
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl flex justify-between items-center">
                <span className="text-xs text-white/40 font-mono">
                    {editor.storage.characterCount?.words?.() || 0} words
                </span>
                <div className="flex gap-3">
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSave(editor.getHTML())}
                        className="bg-schurr-green text-white hover:bg-schurr-green/80 border-0"
                    >
                        <Save size={18} className="mr-2" />
                        Save Chronicle
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChronicleEditor;
