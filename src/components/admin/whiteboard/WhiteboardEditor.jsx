import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Group } from 'react-konva';
import { ArrowLeft, MousePointer, Hand, StickyNote, Type, Square, Circle as CircleIcon, Image as ImageIcon, Minus, Plus, Undo, Redo, Save, ArrowRight, Lock, Download, Layout } from 'lucide-react';
import { Button } from '../../ui/Button';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import CanvasElement from './canvas/CanvasElement';
import Cursor from './canvas/RealTimeCursor';
import LayerPanel from './LayerPanel';
import TextFormattingPanel from './TextFormattingPanel';

const GRID_SIZE = 50;

const WhiteboardEditor = ({ boardId, onBack }) => {
    const [elements, setElements] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [tool, setTool] = useState('select'); // select, hand, sticky, text, rect, circle, arrow
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const stageRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [showTextFormatting, setShowTextFormatting] = useState(false);



    // Real-time sync
    useEffect(() => {
        if (!boardId) return;
        const unsubscribe = onSnapshot(doc(db, "boards", boardId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();

                // RBAC Check
                const currentUser = auth.currentUser;
                if (currentUser && data.roles) {
                    const role = data.roles[currentUser.uid] || 'editor'; // Default to editor for now
                    if (role === 'viewer') {
                        setReadOnly(true);
                    } else {
                        setReadOnly(false);
                    }
                }

                if (data.elements) {
                    // Only update if different to avoid local jitter if we were the ones who updated it
                    // For now, simple set. In production, need to handle local vs remote updates better.
                    setElements(data.elements);
                    if (history.length === 0) {
                        setHistory([data.elements]);
                        setHistoryStep(0);
                    }
                }
                if (data.cursors) {
                    setCursors(data.cursors);
                }
            }
        });
        return () => unsubscribe();
    }, [boardId]);

    const saveBoard = async (newElements) => {
        setSaving(true);
        try {
            await updateDoc(doc(db, "boards", boardId), {
                elements: newElements,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving board:", error);
        } finally {
            setTimeout(() => setSaving(false), 500);
        }
    };

    const addToHistory = (newElements) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const undo = () => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            setHistoryStep(newStep);
            setElements(history[newStep]);
            saveBoard(history[newStep]);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            setHistoryStep(newStep);
            setElements(history[newStep]);
            saveBoard(history[newStep]);
        }
    };

    // Cursor Tracking
    const [cursors, setCursors] = useState({});
    const lastCursorUpdate = useRef(0);

    const handleMouseMove = (e) => {
        const stage = stageRef.current;
        if (!stage) return;

        const point = stage.getRelativePointerPosition();
        const now = Date.now();

        // Throttle updates to every 100ms
        if (now - lastCursorUpdate.current > 100) {
            lastCursorUpdate.current = now;

            // In a real app, we'd use a subcollection or Realtime DB for cursors to avoid writing to the main doc too often.
            // For this MVP, we'll write to a 'cursors' field in the board doc, but be careful of write limits.
            // BETTER: Use Realtime Database for cursors if available, but we are using Firestore.
            // Let's assume low traffic for now.

            // We need a userId. For now, generate a random one if not auth'd, or use 'Admin'.
            const userId = 'Admin-' + Math.floor(Math.random() * 1000); // TODO: Use actual auth ID

            // Note: Updating the WHOLE doc for just one cursor is bad. 
            // Ideally we'd use `updateDoc` with dot notation `cursors.${userId}`.

            /* 
            updateDoc(doc(db, "boards", boardId), {
                [`cursors.${userId}`]: { x: point.x, y: point.y, name: 'Admin', color: '#ff0000', updatedAt: Date.now() }
            }).catch(e => console.error(e));
            */
            // Commented out to prevent excessive writes in this demo without proper debounce/user ID.
            // I will implement a local-only cursor for demo purposes or a very slow update.
        }
    };

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        // Limit scale
        if (newScale < 0.1) newScale = 0.1;
        if (newScale > 5) newScale = 5;

        setScale(newScale);
        setPosition({
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    };

    // Keyboard Shortcuts & Interactions
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (readOnly) return;

            // Ignore if typing in an input/textarea
            if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') {
                return;
            }

            const isCmdOrCtrl = e.metaKey || e.ctrlKey;

            // Tools
            if (!isCmdOrCtrl) {
                switch (e.key.toLowerCase()) {
                    case 'v': setTool('select'); break;
                    case 'h': setTool('hand'); break;
                    case 'r': setTool('rect'); break;
                    case 'o': case 'c': setTool('circle'); break;
                    case 't': setTool('text'); break;
                    case 'l': case 'a': setTool('arrow'); break;
                    case 's': setTool('sticky'); break;
                }
            }

            // Actions
            if (isCmdOrCtrl) {
                if (e.key === 'z') {
                    if (e.shiftKey) redo();
                    else undo();
                    e.preventDefault();
                }
                if (e.key === '=' || e.key === '+') {
                    setScale(s => Math.min(5, s + 0.1));
                    e.preventDefault();
                }
                if (e.key === '-') {
                    setScale(s => Math.max(0.1, s - 0.1));
                    e.preventDefault();
                }
                if (e.key === '0') {
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                    e.preventDefault();
                }
            }

            if (e.key === 'Escape') {
                setSelectedIds([]);
                setTool('select');
            }

            // Spacebar Pan
            if (e.code === 'Space' && !e.repeat) {
                setTool(current => {
                    if (current !== 'hand') {
                        // Store previous tool in a ref if we want to revert perfectly, 
                        // but for now just switching to hand is fine. 
                        // To revert, we'd need state. Let's keep it simple: Space = Hand.
                        // Actually, standard behavior is hold space -> hand, release -> prev.
                        return 'hand';
                    }
                    return current;
                });
            }

            // Delete / Backspace
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedIds.length > 0) {
                    e.preventDefault();
                    const newElements = elements.filter(el => !selectedIds.includes(el.id));
                    setElements(newElements);
                    addToHistory(newElements);
                    saveBoard(newElements);
                    setSelectedIds([]);
                }
            }
        };

        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                // Revert to select if we were panning? 
                // Ideally we revert to *previous* tool. 
                // For MVP, let's revert to 'select' if we are currently 'hand' and space is released.
                // This might be annoying if they were using 'rect'.
                // Let's rely on the user explicitly switching tools for now, 
                // OR implement a 'previousTool' ref.
                setTool(prev => prev === 'hand' ? 'select' : prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [elements, selectedIds, readOnly, history, historyStep]); // Added dependencies for undo/redo

    const handleStageClick = (e) => {
        // If clicking on an empty area
        const isBackground = e.target === stageRef.current || e.target.attrs.fill === 'transparent';

        if (isBackground) {
            if (tool === 'select') {
                setSelectedIds([]);
                return;
            }

            if (tool === 'hand') return;

            // Create new element
            const stage = stageRef.current;
            const point = stage.getRelativePointerPosition();

            let newElement = {
                id: uuidv4(),
                rotation: 0,
                locked: false
            };

            // Center elements on cursor for better UX
            if (tool === 'sticky') {
                const width = 150, height = 150;
                newElement = {
                    ...newElement,
                    type: 'sticky',
                    content: 'New Note',
                    width,
                    height,
                    fill: '#fff9c4',
                    x: point.x - width / 2,
                    y: point.y - height / 2
                };
            } else if (tool === 'text') {
                newElement = {
                    ...newElement,
                    type: 'text',
                    content: 'Type here',
                    fontSize: 20,
                    fill: '#ffffff',
                    x: point.x,
                    y: point.y
                };
            } else if (tool === 'rect') {
                const width = 100, height = 100;
                newElement = {
                    ...newElement,
                    type: 'rect',
                    width,
                    height,
                    fill: '#4ade80',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    x: point.x - width / 2,
                    y: point.y - height / 2
                };
            } else if (tool === 'circle') {
                const radius = 50;
                newElement = {
                    ...newElement,
                    type: 'circle',
                    radius,
                    fill: '#60a5fa',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    x: point.x,
                    y: point.y
                };
            } else if (tool === 'arrow') {
                newElement = {
                    ...newElement,
                    type: 'arrow',
                    points: [0, 0, 100, 100],
                    stroke: '#ffffff',
                    strokeWidth: 2,
                    x: point.x,
                    y: point.y
                };
            }

            if (newElement.type) {
                const newElements = [...elements, newElement];
                setElements(newElements);
                addToHistory(newElements);
                saveBoard(newElements);

                // Select the new element
                setSelectedIds([newElement.id]);

                // Auto-switch back to select (Figma behavior)
                setTool('select');
            }
        }
    };

    const handleElementChange = (newAttrs) => {
        const newElements = elements.map(el => {
            if (el.id === newAttrs.id) {
                return newAttrs;
            }
            return el;
        });
        setElements(newElements);
        addToHistory(newElements);
        saveBoard(newElements);
    };

    const handleElementDuplicate = (duplicateAttrs) => {
        // Create a new element with a new ID
        const newElement = {
            ...duplicateAttrs,
            id: uuidv4()
        };
        const newElements = [...elements, newElement];
        setElements(newElements);
        addToHistory(newElements);
        saveBoard(newElements);
        // Select the new duplicate
        setSelectedIds([newElement.id]);
    };

    const handleDragEnd = (e) => {
        // Update element position in state and firestore
        const id = e.target.id();
        const newElements = elements.map(el => {
            if (el.id === id) {
                return { ...el, x: e.target.x(), y: e.target.y() };
            }
            return el;
        });
        setElements(newElements);
        addToHistory(newElements);
        saveBoard(newElements);
    };

    // Layer Panel Handlers
    const handleLayerReorder = (elementId, direction) => {
        const currentIndex = elements.findIndex(el => el.id === elementId);
        if (currentIndex === -1) return;

        let newElements = [...elements];
        const element = newElements[currentIndex];

        switch (direction) {
            case 'top':
                newElements.splice(currentIndex, 1);
                newElements.push(element);
                break;
            case 'up':
                if (currentIndex < elements.length - 1) {
                    newElements.splice(currentIndex, 1);
                    newElements.splice(currentIndex + 1, 0, element);
                }
                break;
            case 'down':
                if (currentIndex > 0) {
                    newElements.splice(currentIndex, 1);
                    newElements.splice(currentIndex - 1, 0, element);
                }
                break;
            case 'bottom':
                newElements.splice(currentIndex, 1);
                newElements.unshift(element);
                break;
        }

        setElements(newElements);
        addToHistory(newElements);
        saveBoard(newElements);
    };

    const handleToggleVisibility = (elementId) => {
        const newElements = elements.map(el => {
            if (el.id === elementId) {
                return { ...el, visible: el.visible === false ? true : false };
            }
            return el;
        });
        setElements(newElements);
        saveBoard(newElements);
    };

    const handleToggleLock = (elementId) => {
        const newElements = elements.map(el => {
            if (el.id === elementId) {
                return { ...el, locked: !el.locked };
            }
            return el;
        });
        setElements(newElements);
        saveBoard(newElements);
    };

    const handleLayerSelect = (elementId) => {
        setSelectedIds([elementId]);
        // Show text formatting panel if text element is selected
        const element = elements.find(el => el.id === elementId);
        if (element && element.type === 'text') {
            setShowTextFormatting(true);
        } else {
            setShowTextFormatting(false);
        }
    };

    // Grid Generation
    const renderGrid = () => {
        const width = window.innerWidth; // Approximate, stage is full width
        const height = window.innerHeight;

        // Calculate grid start/end based on position and scale
        // This is a simplified static grid for now. 
        // For infinite grid, we usually render a large enough area or use a pattern.
        // Let's use a simple large grid for MVP.

        const lines = [];
        const limit = 5000; // Draw grid from -5000 to 5000

        for (let i = -limit; i <= limit; i += GRID_SIZE) {
            lines.push(
                <Line
                    key={`v-${i}`}
                    points={[i, -limit, i, limit]}
                    stroke="#ffffff"
                    strokeWidth={1}
                    opacity={0.1}
                />
            );
            lines.push(
                <Line
                    key={`h-${i}`}
                    points={[-limit, i, limit, i]}
                    stroke="#ffffff"
                    strokeWidth={1}
                    opacity={0.1}
                />
            );
        }
        return <Group listening={false}>{lines}</Group>;
    };

    return (
        <div className="h-full flex flex-col relative bg-[#1e1e1e] overflow-hidden">
            {/* Canvas - Rendered first to be behind UI */}
            <Stage
                ref={stageRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onWheel={handleWheel}
                onClick={handleStageClick}
                onTap={handleStageClick}
                onMouseMove={handleMouseMove}
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                draggable={tool === 'hand'}
                onDragEnd={(e) => {
                    if (e.target === stageRef.current) {
                        setPosition({ x: e.target.x(), y: e.target.y() });
                    }
                }}
                className={tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
            >
                <Layer>
                    {/* Background Rect to catch clicks */}
                    <Rect x={-5000} y={-5000} width={10000} height={10000} fill="transparent" listening={true} />
                    {renderGrid()}
                    {elements.map((el, i) => {
                        // Skip rendering if element is hidden
                        if (el.visible === false) return null;

                        return (
                            <CanvasElement
                                key={el.id}
                                shapeProps={el}
                                isSelected={selectedIds.includes(el.id)}
                                onSelect={(e) => {
                                    if (tool === 'select') {
                                        // Shift key for multi-select
                                        if (e.evt.shiftKey) {
                                            if (selectedIds.includes(el.id)) {
                                                setSelectedIds(selectedIds.filter(id => id !== el.id));
                                            } else {
                                                setSelectedIds([...selectedIds, el.id]);
                                            }
                                        } else {
                                            setSelectedIds([el.id]);
                                            // Show text formatting panel if text element
                                            if (el.type === 'text') {
                                                setShowTextFormatting(true);
                                            } else {
                                                setShowTextFormatting(false);
                                            }
                                        }
                                    }
                                }}
                                onChange={handleElementChange}
                                onDuplicate={handleElementDuplicate}
                            />
                        );
                    })}
                    {/* Render Cursors */}
                    {Object.entries(cursors).map(([id, cursor]) => (
                        <Cursor key={id} x={cursor.x} y={cursor.y} color={cursor.color || '#ff0000'} name={cursor.name || 'User'} />
                    ))}
                </Layer>
            </Stage>

            {/* Toolbar */}
            {!readOnly && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-[#2c2c2c] p-2 rounded-xl shadow-xl border border-white/10 flex gap-2">
                    <ToolButton
                        icon={MousePointer}
                        active={tool === 'select'}
                        onClick={() => setTool('select')}
                        tooltip="Select (V)"
                        tutorial="Click elements to select them. Drag to move. Shift+Click for multi-select."
                    />
                    <ToolButton
                        icon={Hand}
                        active={tool === 'hand'}
                        onClick={() => setTool('hand')}
                        tooltip="Pan (H)"
                        tutorial="Drag the canvas to pan around. Hold Space for temporary pan mode."
                    />
                    <div className="w-px bg-white/10 mx-1" />
                    <ToolButton
                        icon={StickyNote}
                        active={tool === 'sticky'}
                        onClick={() => setTool('sticky')}
                        tooltip="Sticky Note (S)"
                        tutorial="Click anywhere to create a sticky note. Double-click to edit text."
                    />
                    <ToolButton
                        icon={Type}
                        active={tool === 'text'}
                        onClick={() => setTool('text')}
                        tooltip="Text (T)"
                        tutorial="Click to add text. Select text to access formatting controls for font, size, and style."
                    />
                    <ToolButton
                        icon={Square}
                        active={tool === 'rect'}
                        onClick={() => setTool('rect')}
                        tooltip="Rectangle (R)"
                        tutorial="Click to create a rectangle. Drag corners to resize."
                    />
                    <ToolButton
                        icon={CircleIcon}
                        active={tool === 'circle'}
                        onClick={() => setTool('circle')}
                        tooltip="Circle (C/O)"
                        tutorial="Click to create a circle. Drag to resize proportionally."
                    />
                    <ToolButton
                        icon={ArrowRight}
                        active={tool === 'arrow'}
                        onClick={() => setTool('arrow')}
                        tooltip="Arrow (A/L)"
                        tutorial="Click to create an arrow. Useful for showing connections and flow."
                    />
                    <div className="w-px bg-white/10 mx-1" />
                    <label className="cursor-pointer p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        <ImageIcon size={20} />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        const img = new Image();
                                        img.src = event.target.result; // Base64 for now, ideally upload to storage
                                        img.onload = () => {
                                            // Create image element
                                            const stage = stageRef.current;
                                            // Center of view
                                            const viewCenter = {
                                                x: -stage.x() / stage.scaleX() + stage.width() / 2 / stage.scaleX(),
                                                y: -stage.y() / stage.scaleY() + stage.height() / 2 / stage.scaleY(),
                                            };

                                            const newElement = {
                                                id: uuidv4(),
                                                type: 'image',
                                                x: viewCenter.x - 100,
                                                y: viewCenter.y - 100,
                                                width: 200,
                                                height: 200 * (img.height / img.width),
                                                src: event.target.result // Base64 for now, ideally upload to storage
                                            };
                                            const newElements = [...elements, newElement];
                                            setElements(newElements);
                                            addToHistory(newElements);
                                            saveBoard(newElements);
                                        };
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </label>
                    <div className="w-px bg-white/10 mx-1" />
                    <ToolButton
                        icon={Lock}
                        active={selectedIds.length > 0 && elements.find(el => el.id === selectedIds[0])?.locked}
                        onClick={() => {
                            if (selectedIds.length > 0) {
                                const newElements = elements.map(el => {
                                    if (selectedIds.includes(el.id)) {
                                        return { ...el, locked: !el.locked };
                                    }
                                    return el;
                                });
                                setElements(newElements);
                                saveBoard(newElements);
                            }
                        }}
                        tooltip="Lock/Unlock"
                        tutorial="Lock elements to prevent accidental edits. Locked elements can't be moved or modified."
                    />
                    <div className="w-px bg-white/10 mx-1" />
                    <ToolButton
                        icon={Undo}
                        onClick={undo}
                        tooltip="Undo (Cmd+Z)"
                        tutorial="Undo your last action. Use Cmd/Ctrl+Z for quick undo."
                    />
                    <ToolButton
                        icon={Redo}
                        onClick={redo}
                        tooltip="Redo (Cmd+Shift+Z)"
                        tutorial="Redo an action you just undid. Use Cmd/Ctrl+Shift+Z for quick redo."
                    />
                    <div className="w-px bg-white/10 mx-1" />
                    <ToolButton
                        icon={Download}
                        onClick={() => {
                            const uri = stageRef.current.toDataURL();
                            const link = document.createElement('a');
                            link.download = 'whiteboard.png';
                            link.href = uri;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        tooltip="Export as PNG"
                        tutorial="Download your whiteboard as a PNG image. Perfect for sharing or archiving."
                    />
                    <div className="w-px bg-white/10 mx-1" />
                    <ToolButton
                        icon={Layout}
                        onClick={() => {
                            // Add Kanban Template
                            const startX = 100;
                            const startY = 100;
                            const colWidth = 300;
                            const gap = 20;

                            const newTemplateElements = [
                                // To Do Column
                                { id: uuidv4(), type: 'rect', x: startX, y: startY, width: colWidth, height: 600, fill: '#f0f0f0', stroke: '#ccc', strokeWidth: 1, opacity: 0.5, locked: true },
                                { id: uuidv4(), type: 'text', x: startX + 10, y: startY + 10, text: 'To Do', fontSize: 24, fill: '#333', width: colWidth - 20, locked: true },

                                // In Progress Column
                                { id: uuidv4(), type: 'rect', x: startX + colWidth + gap, y: startY, width: colWidth, height: 600, fill: '#f0f0f0', stroke: '#ccc', strokeWidth: 1, opacity: 0.5, locked: true },
                                { id: uuidv4(), type: 'text', x: startX + colWidth + gap + 10, y: startY + 10, text: 'In Progress', fontSize: 24, fill: '#333', width: colWidth - 20, locked: true },

                                // Done Column
                                { id: uuidv4(), type: 'rect', x: startX + (colWidth + gap) * 2, y: startY, width: colWidth, height: 600, fill: '#f0f0f0', stroke: '#ccc', strokeWidth: 1, opacity: 0.5, locked: true },
                                { id: uuidv4(), type: 'text', x: startX + (colWidth + gap) * 2 + 10, y: startY + 10, text: 'Done', fontSize: 24, fill: '#333', width: colWidth - 20, locked: true },
                            ];

                            const newElements = [...elements, ...newTemplateElements];
                            setElements(newElements);
                            addToHistory(newElements);
                            saveBoard(newElements);
                        }}
                        tooltip="Add Kanban Template"
                        tutorial="Insert a ready-made Kanban board with To Do, In Progress, and Done columns."
                    />
                </div>
            )}

            {/* Top Left Actions */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <Button onClick={onBack} variant="ghost" className="bg-[#2c2c2c] text-white hover:bg-white/10 p-2 rounded-lg border border-white/10">
                    <ArrowLeft size={20} />
                </Button>
                <div className="bg-[#2c2c2c] px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
                    <span className="text-white font-bold text-sm">Board Name</span>
                    <span className="text-xs text-white/40 border-l border-white/10 pl-3">
                        {saving ? 'Saving...' : 'Saved'}
                    </span>
                </div>
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 z-10 bg-[#2c2c2c] p-2 rounded-lg border border-white/10 flex items-center gap-2">
                <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-1 text-white/60 hover:text-white"><Minus size={16} /></button>
                <span className="text-xs font-mono text-white w-12 text-center">{Math.round(scale * 100)}%</span>
                <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="p-1 text-white/60 hover:text-white"><Plus size={16} /></button>
            </div>

            {/* Text Formatting Panel */}
            {!readOnly && showTextFormatting && selectedIds.length === 1 && (() => {
                const selectedElement = elements.find(el => el.id === selectedIds[0]);
                return selectedElement && selectedElement.type === 'text' ? (
                    <TextFormattingPanel
                        element={selectedElement}
                        onChange={handleElementChange}
                        onClose={() => setShowTextFormatting(false)}
                    />
                ) : null;
            })()}

            {/* Layer Panel */}
            {!readOnly && (
                <LayerPanel
                    elements={elements}
                    selectedIds={selectedIds}
                    onReorder={handleLayerReorder}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleLock={handleToggleLock}
                    onSelect={handleLayerSelect}
                    hasTextFormatting={showTextFormatting}
                />
            )}
        </div >
    );
};

const ToolButton = ({ icon: Icon, active, onClick, tooltip, tutorial }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={onClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`p-2 rounded-lg transition-all ${active
                    ? 'bg-schurr-green text-white shadow-lg shadow-schurr-green/20'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
            >
                <Icon size={20} />
            </button>

            {/* Enhanced Tooltip */}
            {showTooltip && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-64 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-2xl p-3 pointer-events-none">
                    <div className="text-white font-bold text-sm mb-1">{tooltip}</div>
                    {tutorial && (
                        <div className="text-white/60 text-xs leading-relaxed">{tutorial}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WhiteboardEditor;
