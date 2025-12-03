import React, { useState } from 'react';
import { Type, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Minus, Plus } from 'lucide-react';
import { cn } from '../../../lib/utils';

const TextFormattingPanel = ({ element, onChange, onClose }) => {
    const [fontSize, setFontSize] = useState(element.fontSize || 20);
    const [fontWeight, setFontWeight] = useState(element.fontWeight || 'normal');
    const [fontStyle, setFontStyle] = useState(element.fontStyle || 'normal');
    const [textAlign, setTextAlign] = useState(element.align || 'left');
    const [lineHeight, setLineHeight] = useState(element.lineHeight || 1.2);
    const [letterSpacing, setLetterSpacing] = useState(element.letterSpacing || 0);

    const handleApply = () => {
        onChange({
            ...element,
            fontSize,
            fontWeight,
            fontStyle,
            align: textAlign,
            lineHeight,
            letterSpacing
        });
    };

    // Apply changes in real-time
    React.useEffect(() => {
        handleApply();
    }, [fontSize, fontWeight, fontStyle, textAlign, lineHeight, letterSpacing]);

    return (
        <div className="absolute top-16 right-4 z-20 bg-[#2c2c2c] border border-white/10 rounded-xl shadow-2xl p-4 w-72 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Type size={18} className="text-schurr-green" />
                    <h3 className="text-sm font-bold text-white">Text Formatting</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white transition-colors text-xs"
                >
                    ✕
                </button>
            </div>

            {/* Font Size */}
            <div className="mb-4">
                <label className="text-xs text-white/60 font-bold uppercase mb-2 block">Font Size</label>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFontSize(Math.max(8, fontSize - 2))}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors"
                    >
                        <Minus size={14} className="text-white/60" />
                    </button>
                    <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-schurr-green"
                        min="8"
                        max="200"
                    />
                    <button
                        onClick={() => setFontSize(Math.min(200, fontSize + 2))}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors"
                    >
                        <Plus size={14} className="text-white/60" />
                    </button>
                </div>
            </div>

            {/* Font Weight & Style */}
            <div className="mb-4">
                <label className="text-xs text-white/60 font-bold uppercase mb-2 block">Style</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
                        className={cn(
                            "flex-1 p-2 rounded-lg transition-all flex items-center justify-center gap-2",
                            fontWeight === 'bold'
                                ? "bg-schurr-green text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <Bold size={16} />
                        <span className="text-xs font-bold">Bold</span>
                    </button>
                    <button
                        onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
                        className={cn(
                            "flex-1 p-2 rounded-lg transition-all flex items-center justify-center gap-2",
                            fontStyle === 'italic'
                                ? "bg-schurr-green text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <Italic size={16} />
                        <span className="text-xs font-bold">Italic</span>
                    </button>
                </div>
            </div>

            {/* Text Align */}
            <div className="mb-4">
                <label className="text-xs text-white/60 font-bold uppercase mb-2 block">Alignment</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTextAlign('left')}
                        className={cn(
                            "flex-1 p-2 rounded-lg transition-all",
                            textAlign === 'left'
                                ? "bg-schurr-green text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <AlignLeft size={16} className="mx-auto" />
                    </button>
                    <button
                        onClick={() => setTextAlign('center')}
                        className={cn(
                            "flex-1 p-2 rounded-lg transition-all",
                            textAlign === 'center'
                                ? "bg-schurr-green text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <AlignCenter size={16} className="mx-auto" />
                    </button>
                    <button
                        onClick={() => setTextAlign('right')}
                        className={cn(
                            "flex-1 p-2 rounded-lg transition-all",
                            textAlign === 'right'
                                ? "bg-schurr-green text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        <AlignRight size={16} className="mx-auto" />
                    </button>
                </div>
            </div>

            {/* Line Height (Leading) */}
            <div className="mb-4">
                <label className="text-xs text-white/60 font-bold uppercase mb-2 block">
                    Line Height (Leading)
                </label>
                <input
                    type="range"
                    min="0.8"
                    max="3"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="w-full accent-schurr-green"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Tight</span>
                    <span className="text-white/60 font-mono">{lineHeight.toFixed(1)}</span>
                    <span>Loose</span>
                </div>
            </div>

            {/* Letter Spacing (Tracking) */}
            <div className="mb-2">
                <label className="text-xs text-white/60 font-bold uppercase mb-2 block">
                    Letter Spacing (Tracking)
                </label>
                <input
                    type="range"
                    min="-5"
                    max="20"
                    step="0.5"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(Number(e.target.value))}
                    className="w-full accent-schurr-green"
                />
                <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Tight</span>
                    <span className="text-white/60 font-mono">{letterSpacing}px</span>
                    <span>Wide</span>
                </div>
            </div>
        </div>
    );
};

export default TextFormattingPanel;
