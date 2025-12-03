import React from 'react';
import {
    StickyNote,
    Type,
    Square,
    Circle as CircleIcon,
    Image as ImageIcon,
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    ChevronsUp,
    ChevronUp,
    ChevronDown,
    ChevronsDown
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const LayerPanel = ({
    elements,
    selectedIds,
    onReorder,
    onToggleVisibility,
    onToggleLock,
    onSelect,
    hasTextFormatting = false
}) => {
    // Get icon for element type
    const getElementIcon = (type) => {
        const iconProps = { size: 16, className: "text-white/60" };
        switch (type) {
            case 'sticky': return <StickyNote {...iconProps} />;
            case 'text': return <Type {...iconProps} />;
            case 'rect': return <Square {...iconProps} />;
            case 'circle': return <CircleIcon {...iconProps} />;
            case 'arrow': return <ArrowRight {...iconProps} />;
            case 'image': return <ImageIcon {...iconProps} />;
            default: return <Square {...iconProps} />;
        }
    };

    // Get display name for element
    const getElementName = (element) => {
        if (element.content) {
            return element.content.substring(0, 20) + (element.content.length > 20 ? '...' : '');
        }
        if (element.text) {
            return element.text.substring(0, 20) + (element.text.length > 20 ? '...' : '');
        }
        return `${element.type.charAt(0).toUpperCase() + element.type.slice(1)}`;
    };

    // Handle reordering
    const handleMoveToTop = (elementId) => {
        const currentIndex = elements.findIndex(el => el.id === elementId);
        if (currentIndex === elements.length - 1) return; // Already at top
        onReorder(elementId, 'top');
    };

    const handleMoveUp = (elementId) => {
        const currentIndex = elements.findIndex(el => el.id === elementId);
        if (currentIndex === elements.length - 1) return; // Already at top
        onReorder(elementId, 'up');
    };

    const handleMoveDown = (elementId) => {
        const currentIndex = elements.findIndex(el => el.id === elementId);
        if (currentIndex === 0) return; // Already at bottom
        onReorder(elementId, 'down');
    };

    const handleMoveToBottom = (elementId) => {
        const currentIndex = elements.findIndex(el => el.id === elementId);
        if (currentIndex === 0) return; // Already at bottom
        onReorder(elementId, 'bottom');
    };

    // Reverse elements to show top layers first
    const displayElements = [...elements].reverse();

    return (
        <div
            className="absolute right-4 w-64 bg-[#2c2c2c] border border-white/10 rounded-xl shadow-xl z-10 max-h-[calc(100vh-120px)] flex flex-col transition-all duration-300"
            style={{ top: hasTextFormatting ? '440px' : '64px' }}
        >
            {/* Header */}
            <div className="p-3 border-b border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">Layers</h3>
                <p className="text-xs text-white/40 font-mono mt-0.5">{elements.length} elements</p>
            </div>

            {/* Layer List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {displayElements.length === 0 ? (
                    <div className="p-8 text-center text-white/40 text-xs font-mono">
                        No elements yet
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {displayElements.map((element, index) => {
                            const isSelected = selectedIds.includes(element.id);
                            const isVisible = element.visible !== false;
                            const isLocked = element.locked === true;
                            const actualIndex = elements.length - 1 - index;
                            const isTop = actualIndex === elements.length - 1;
                            const isBottom = actualIndex === 0;

                            return (
                                <div
                                    key={element.id}
                                    onClick={() => onSelect(element.id)}
                                    className={cn(
                                        "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all",
                                        isSelected
                                            ? "bg-schurr-green/20 border border-schurr-green/40"
                                            : "bg-white/5 hover:bg-white/10 border border-transparent"
                                    )}
                                >
                                    {/* Element Icon & Name */}
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {getElementIcon(element.type)}
                                        <span className={cn(
                                            "text-xs truncate font-medium",
                                            isSelected ? "text-schurr-green" : "text-white/80"
                                        )}>
                                            {getElementName(element)}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {/* Visibility Toggle */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleVisibility(element.id);
                                            }}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                            title={isVisible ? "Hide" : "Show"}
                                        >
                                            {isVisible ? (
                                                <Eye size={14} className="text-white/60" />
                                            ) : (
                                                <EyeOff size={14} className="text-white/40" />
                                            )}
                                        </button>

                                        {/* Lock Toggle */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleLock(element.id);
                                            }}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                            title={isLocked ? "Unlock" : "Lock"}
                                        >
                                            {isLocked ? (
                                                <Lock size={14} className="text-white/60" />
                                            ) : (
                                                <Unlock size={14} className="text-white/40" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Reorder Buttons - Show on hover or when selected */}
                                    <div className={cn(
                                        "flex flex-col gap-0.5 transition-opacity",
                                        isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}>
                                        <div className="flex gap-0.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveToTop(element.id);
                                                }}
                                                disabled={isTop}
                                                className={cn(
                                                    "p-0.5 rounded transition-colors",
                                                    isTop
                                                        ? "text-white/20 cursor-not-allowed"
                                                        : "text-white/60 hover:bg-white/10 hover:text-white"
                                                )}
                                                title="Move to Top"
                                            >
                                                <ChevronsUp size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveUp(element.id);
                                                }}
                                                disabled={isTop}
                                                className={cn(
                                                    "p-0.5 rounded transition-colors",
                                                    isTop
                                                        ? "text-white/20 cursor-not-allowed"
                                                        : "text-white/60 hover:bg-white/10 hover:text-white"
                                                )}
                                                title="Move Up"
                                            >
                                                <ChevronUp size={12} />
                                            </button>
                                        </div>
                                        <div className="flex gap-0.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveDown(element.id);
                                                }}
                                                disabled={isBottom}
                                                className={cn(
                                                    "p-0.5 rounded transition-colors",
                                                    isBottom
                                                        ? "text-white/20 cursor-not-allowed"
                                                        : "text-white/60 hover:bg-white/10 hover:text-white"
                                                )}
                                                title="Move Down"
                                            >
                                                <ChevronDown size={12} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMoveToBottom(element.id);
                                                }}
                                                disabled={isBottom}
                                                className={cn(
                                                    "p-0.5 rounded transition-colors",
                                                    isBottom
                                                        ? "text-white/20 cursor-not-allowed"
                                                        : "text-white/60 hover:bg-white/10 hover:text-white"
                                                )}
                                                title="Move to Bottom"
                                            >
                                                <ChevronsDown size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LayerPanel;
