import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Plus, MoreHorizontal, User, Sparkles, Loader2, Trophy, Activity, Zap, Flame, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, increment, limit } from 'firebase/firestore';
import { cn } from '../../lib/utils';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-red-500', borderColor: 'border-red-500/50' },
    { id: 'inprogress', title: 'In Progress', color: 'bg-yellow-500', borderColor: 'border-yellow-500/50' },
    { id: 'review', title: 'Review', color: 'bg-blue-500', borderColor: 'border-blue-500/50' },
    { id: 'done', title: 'Done', color: 'bg-green-500', borderColor: 'border-green-500/50' }
];

const XP_VALUES = {
    'High': 150,
    'Medium': 75,
    'Low': 25
};

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 5000, 10000];

const getLevel = (xp) => {
    let level = 0;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    return level;
};

const TeamBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [showAiInput, setShowAiInput] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberRole, setNewMemberRole] = useState('');

    const feedRef = useRef(null);

    // Real-time listener for tasks
    useEffect(() => {
        const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(fetchedTasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Real-time listener for members (Leaderboard)
    useEffect(() => {
        const q = query(collection(db, "members"), orderBy("xp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMembers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMembers(fetchedMembers);
        });
        return () => unsubscribe();
    }, []);

    // Real-time listener for "The Eye" (Activity Feed)
    useEffect(() => {
        const q = query(collection(db, "activity_feed"), orderBy("createdAt", "desc"), limit(20));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedActivities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActivities(fetchedActivities);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [activities]);

    const logActivity = async (message, type = 'info') => {
        await addDoc(collection(db, "activity_feed"), {
            message,
            type,
            createdAt: serverTimestamp()
        });
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        try {
            await addDoc(collection(db, "members"), {
                name: newMemberName,
                role: newMemberRole || 'Grunt',
                xp: 0,
                createdAt: serverTimestamp()
            });
            setNewMemberName('');
            setNewMemberRole('');
            setShowMemberModal(false);
            logActivity(`New challenger approaches: ${newMemberName} joined the arena.`, 'success');
        } catch (error) {
            console.error("Error adding member:", error);
        }
    };

    const handleRemoveMember = async (id, name) => {
        if (window.confirm("Terminate this member?")) {
            try {
                await deleteDoc(doc(db, "members", id));
                logActivity(`${name} was terminated.`, 'error');
            } catch (error) {
                console.error("Error removing member:", error);
            }
        }
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsAiGenerating(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const memberNames = members.map(m => m.name).join(', ');
            const prompt = `
                Act as a ruthless, high-efficiency "Tiger Mom" / Corporate Overlord AI Project Manager.
                Goal: ${aiPrompt}
                Team Members: ${memberNames || "None (assign to 'Unassigned')"}
                
                1. ROAST the current team performance if necessary.
                2. Generate 3-5 specific, actionable tasks to achieve this goal.
                3. Return ONLY a JSON array of objects. No markdown, no code blocks.
                
                Format: [{"title": "Task Title", "column": "todo", "priority": "High/Medium/Low", "assignee": "Member Name"}]
                Valid columns: "todo", "inprogress", "review", "done".
                Assign tasks intelligently. If a task is "High" priority, give it to a high-performer or someone who needs to step up.
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text().replace(/```json|```/g, '').trim();

            const newTasks = JSON.parse(text);

            // Batch add to Firestore
            for (const task of newTasks) {
                await addDoc(collection(db, "tasks"), {
                    title: task.title,
                    column: task.column || 'todo',
                    priority: task.priority || 'Medium',
                    createdAt: serverTimestamp(),
                    assignee: task.assignee || 'Unassigned'
                });
            }

            logActivity(`AI Overlord generated ${newTasks.length} new directives. Get to work.`, 'warning');
            setAiPrompt('');
            setShowAiInput(false);
        } catch (error) {
            console.error("AI Task Generation failed:", error);
            alert("AI failed to generate tasks. Please try again.");
        } finally {
            setIsAiGenerating(false);
        }
    };

    const moveTask = async (taskId, newColumn, task) => {
        try {
            await updateDoc(doc(db, "tasks", taskId), {
                column: newColumn
            });

            // XP Logic
            if (newColumn === 'done' && task.column !== 'done' && task.assignee && task.assignee !== 'Unassigned') {
                const member = members.find(m => m.name === task.assignee);
                if (member) {
                    const xpGain = XP_VALUES[task.priority] || 25;
                    await updateDoc(doc(db, "members", member.id), {
                        xp: increment(xpGain)
                    });
                    logActivity(`${task.assignee} crushed "${task.title}" (+${xpGain} XP).`, 'success');
                }
            }
        } catch (error) {
            console.error("Error moving task:", error);
        }
    };

    const assignTask = async (taskId, assignee) => {
        try {
            await updateDoc(doc(db, "tasks", taskId), {
                assignee: assignee
            });
            logActivity(`Task reassigned to ${assignee}.`, 'info');
        } catch (error) {
            console.error("Error assigning task:", error);
        }
    };

    const deleteTask = async (taskId) => {
        if (window.confirm("Delete this task?")) {
            await deleteDoc(doc(db, "tasks", taskId));
        }
    };

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 z-10">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        <Zap className="text-yellow-400 fill-yellow-400" />
                        Command Center
                    </h1>
                    <p className="text-white/40 font-mono text-sm mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        SYSTEM ONLINE // DEFCON 1
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setShowMemberModal(true)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 font-mono"
                    >
                        <User size={18} className="mr-2" />
                        RECRUIT
                    </Button>
                    <Button
                        onClick={() => setShowAiInput(!showAiInput)}
                        className={`border-0 transition-all font-mono font-bold ${showAiInput ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90'}`}
                    >
                        {showAiInput ? <Skull size={18} className="mr-2" /> : <Flame size={18} className="mr-2" />}
                        AI OVERLORD
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden z-10">
                {/* Main Board Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* AI Input */}
                    <AnimatePresence>
                        {showAiInput && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mb-6 overflow-hidden"
                            >
                                <div className="p-6 bg-red-950/30 border border-red-500/50 rounded-2xl backdrop-blur-md">
                                    <h3 className="text-lg font-bold text-red-500 mb-2 flex items-center gap-2 font-mono uppercase">
                                        <Skull size={18} />
                                        Directives Required
                                    </h3>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
                                            placeholder="Tell the Overlord what needs to be done..."
                                            className="flex-1 p-3 bg-black/60 border border-red-500/30 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono"
                                        />
                                        <Button
                                            onClick={handleAiGenerate}
                                            disabled={isAiGenerating || !aiPrompt.trim()}
                                            className="bg-red-600 hover:bg-red-700 text-white border-0 font-mono"
                                        >
                                            {isAiGenerating ? <Loader2 className="animate-spin" size={18} /> : 'EXECUTE'}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Kanban Board */}
                    <div className="flex-1 min-w-0 pb-4">
                        <div className="flex gap-4 h-full">
                            {COLUMNS.map(column => (
                                <div key={column.id} className={`flex-1 flex flex-col bg-black/20 border ${column.borderColor} rounded-xl overflow-hidden backdrop-blur-sm`}>
                                    {/* Column Header */}
                                    <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-sm ${column.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
                                            <h3 className="font-bold text-white uppercase tracking-widest text-xs font-mono">{column.title}</h3>
                                        </div>
                                        <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">
                                            {tasks.filter(t => t.column === column.id).length}
                                        </span>
                                    </div>

                                    {/* Tasks Container */}
                                    <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                                        {tasks
                                            .filter(task => task.column === column.id)
                                            .map(task => (
                                                <motion.div
                                                    layoutId={task.id}
                                                    key={task.id}
                                                    className="bg-schurr-black/80 border border-white/10 p-3 rounded-lg hover:border-white/30 transition-all group cursor-grab active:cursor-grabbing shadow-lg relative overflow-hidden"
                                                >
                                                    {/* Priority Stripe */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.priority === 'High' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                        task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`} />

                                                    <div className="pl-3">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[10px] font-mono text-white/40 uppercase">
                                                                {task.priority} Priority
                                                            </span>
                                                            <button onClick={() => deleteTask(task.id)} className="text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                                <MoreHorizontal size={14} />
                                                            </button>
                                                        </div>

                                                        <h4 className="text-white font-bold text-sm mb-3 leading-snug">{task.title}</h4>

                                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                                            <div className="relative group/assignee">
                                                                <button className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors">
                                                                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold font-mono">
                                                                        {task.assignee ? task.assignee.charAt(0) : '?'}
                                                                    </div>
                                                                    <span className="truncate max-w-[80px]">{task.assignee || 'Unassigned'}</span>
                                                                </button>

                                                                {/* Assignee Dropdown */}
                                                                <div className="absolute left-0 bottom-full mb-2 w-48 bg-black border border-white/20 rounded-lg shadow-2xl overflow-hidden hidden group-hover/assignee:block z-50 backdrop-blur-xl">
                                                                    {members.map(member => (
                                                                        <button
                                                                            key={member.id}
                                                                            onClick={() => assignTask(task.id, member.name)}
                                                                            className="w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 transition-colors flex items-center gap-2 font-mono"
                                                                        >
                                                                            <span className="text-green-400">LVL {getLevel(member.xp || 0)}</span>
                                                                            {member.name}
                                                                        </button>
                                                                    ))}
                                                                    <button
                                                                        onClick={() => assignTask(task.id, 'Unassigned')}
                                                                        className="w-full text-left px-3 py-2 text-xs text-white/40 hover:bg-white/10 transition-colors font-mono"
                                                                    >
                                                                        Unassigned
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Move Controls */}
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {column.id !== 'todo' && (
                                                                    <button onClick={() => moveTask(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === column.id) - 1].id, task)} className="p-1 hover:bg-white/10 rounded text-white/60" title="Regress">←</button>
                                                                )}
                                                                {column.id !== 'done' && (
                                                                    <button onClick={() => moveTask(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === column.id) + 1].id, task)} className="p-1 hover:bg-white/10 rounded text-white/60" title="Advance">→</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </div>

                                    {/* Add Task Button */}
                                    <div className="p-2 border-t border-white/5">
                                        <button className="w-full py-2 flex items-center justify-center gap-2 text-xs text-white/20 hover:text-white hover:bg-white/5 rounded transition-all border border-dashed border-white/10 hover:border-white/30 font-mono uppercase tracking-wider">
                                            <Plus size={14} /> New Directive
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Leaderboard & The Eye */}
                <div className="w-80 flex flex-col gap-6 min-w-0">
                    {/* Leaderboard */}
                    <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-4 backdrop-blur-md flex-1 min-h-0 flex flex-col">
                        <h3 className="text-yellow-500 font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                            <Trophy size={18} /> Leaderboard
                        </h3>
                        <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                            {members.map((member, index) => (
                                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5 relative overflow-hidden group">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-700' : 'bg-transparent'}`} />
                                    <div className="font-mono font-bold text-white/40 w-6 text-center">{index + 1}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <span className="font-bold text-white truncate">{member.name}</span>
                                            <span className="text-[10px] text-yellow-500 font-mono font-bold">{member.xp || 0} XP</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-[10px] text-white/40 uppercase">{member.role}</span>
                                            <span className="text-[10px] text-white/60 font-mono">LVL {getLevel(member.xp || 0)}</span>
                                        </div>
                                        {/* XP Bar */}
                                        <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
                                                style={{ width: `${((member.xp || 0) % 100)}%` }} // Simplified progress logic
                                            />
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveMember(member.id, member.name)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-500 transition-opacity">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* The Eye (Activity Feed) */}
                    <div className="bg-black/40 border border-green-500/30 rounded-2xl p-4 backdrop-blur-md h-1/3 flex flex-col">
                        <h3 className="text-green-500 font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                            <Activity size={18} /> The Eye
                        </h3>
                        <div className="space-y-2 overflow-y-auto flex-1 custom-scrollbar font-mono text-xs pr-2" ref={feedRef}>
                            {activities.map(activity => (
                                <div key={activity.id} className="flex gap-2 text-white/60">
                                    <span className="text-white/20">[{new Date(activity.createdAt?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]</span>
                                    <span className={cn(
                                        activity.type === 'success' && 'text-green-400',
                                        activity.type === 'warning' && 'text-yellow-400',
                                        activity.type === 'error' && 'text-red-400',
                                    )}>
                                        {activity.message}
                                    </span>
                                </div>
                            ))}
                            {activities.length === 0 && <div className="text-white/20 italic">System initializing...</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Member Management Modal */}
            <AnimatePresence>
                {showMemberModal && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-black border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />
                            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Recruit Agent</h2>

                            <form onSubmit={handleAddMember} className="space-y-4">
                                <div>
                                    <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Codename</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Maverick"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/40 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-white/40 uppercase mb-1 block">Class</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Editor, Sniper, Tank"
                                        value={newMemberRole}
                                        onChange={(e) => setNewMemberRole(e.target.value)}
                                        className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/40 font-mono"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="ghost" onClick={() => setShowMemberModal(false)}>Abort</Button>
                                    <Button type="submit" className="bg-white text-black hover:bg-white/90 border-0 font-bold">Initialize</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeamBoard;
