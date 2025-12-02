import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Plus, MoreHorizontal, User, Trash2, Edit2, ArrowLeft, ArrowRight, Check, X, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import Modal from '../ui/Modal';

const COLUMNS = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
    { id: 'inprogress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'review', title: 'Review', color: 'bg-yellow-500' },
    { id: 'done', title: 'Done', color: 'bg-green-500' }
];

const PRIORITIES = ['Low', 'Medium', 'High'];

const TeamBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    // Form States
    const [editingTask, setEditingTask] = useState(null);
    const [taskForm, setTaskForm] = useState({ title: '', priority: 'Medium', assignee: 'Unassigned', column: 'todo' });
    const [newMemberName, setNewMemberName] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);

    // Real-time listener for tasks
    useEffect(() => {
        if (!db) return;
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

    // Real-time listener for members
    useEffect(() => {
        if (!db) return;
        const q = query(collection(db, "members"), orderBy("name"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMembers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMembers(fetchedMembers);
        });
        return () => unsubscribe();
    }, []);

    // --- Task Actions ---

    const handleSaveTask = async (e) => {
        e.preventDefault();
        if (!taskForm.title.trim() || !db) return;

        try {
            if (editingTask) {
                await updateDoc(doc(db, "tasks", editingTask.id), {
                    title: taskForm.title,
                    priority: taskForm.priority,
                    assignee: taskForm.assignee
                });
            } else {
                await addDoc(collection(db, "tasks"), {
                    title: taskForm.title,
                    priority: taskForm.priority,
                    assignee: taskForm.assignee,
                    column: 'todo',
                    createdAt: serverTimestamp()
                });
            }
            setIsTaskModalOpen(false);
            setEditingTask(null);
            setTaskForm({ title: '', priority: 'Medium', assignee: 'Unassigned', column: 'todo' });
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Failed to save task.");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!db) return;
        if (window.confirm("Are you sure you want to delete this task?")) {
            try {
                await deleteDoc(doc(db, "tasks", taskId));
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    const handleMoveTask = async (taskId, currentColumnId, direction) => {
        if (!db) return;
        const currentIndex = COLUMNS.findIndex(c => c.id === currentColumnId);
        if (currentIndex === -1) return;

        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < 0 || newIndex >= COLUMNS.length) return;

        const newColumn = COLUMNS[newIndex].id;

        try {
            await updateDoc(doc(db, "tasks", taskId), {
                column: newColumn
            });
        } catch (error) {
            console.error("Error moving task:", error);
        }
    };

    const handleAssignTask = async (taskId, assignee) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, "tasks", taskId), {
                assignee: assignee
            });
        } catch (error) {
            console.error("Error assigning task:", error);
        }
    };

    // --- Member Actions ---

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberName.trim() || !db) return;

        try {
            await addDoc(collection(db, "members"), {
                name: newMemberName,
                role: 'Member',
                createdAt: serverTimestamp()
            });
            setNewMemberName('');
        } catch (error) {
            console.error("Error adding member:", error);
        }
    };

    const handleRemoveMember = async (id) => {
        if (!db) return;
        if (window.confirm("Remove this team member?")) {
            try {
                await deleteDoc(doc(db, "members", id));
            } catch (error) {
                console.error("Error removing member:", error);
            }
        }
    };

    // --- AI Actions ---

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim() || !db) return;
        setIsAiGenerating(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const memberNames = members.map(m => m.name).join(', ');
            const prompt = `
                Act as a helpful Project Manager Assistant.
                Goal: ${aiPrompt}
                Team Members: ${memberNames || "None (assign to 'Unassigned')"}
                
                Generate 3-5 specific tasks to achieve this goal.
                Return ONLY a JSON array of objects. No markdown.
                
                Format: [{"title": "Task Title", "priority": "High/Medium/Low", "assignee": "Member Name"}]
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text().replace(/```json|```/g, '').trim();
            const newTasks = JSON.parse(text);

            for (const task of newTasks) {
                await addDoc(collection(db, "tasks"), {
                    title: task.title,
                    column: 'todo',
                    priority: task.priority || 'Medium',
                    assignee: task.assignee || 'Unassigned',
                    createdAt: serverTimestamp()
                });
            }

            setAiPrompt('');
            setIsAiModalOpen(false);
        } catch (error) {
            console.error("AI Task Generation failed:", error);
            alert("AI failed to generate tasks. Please try again.");
        } finally {
            setIsAiGenerating(false);
        }
    };

    // --- Helpers ---

    const openEditModal = (task) => {
        setEditingTask(task);
        setTaskForm({ title: task.title, priority: task.priority, assignee: task.assignee, column: task.column });
        setIsTaskModalOpen(true);
    };

    const openCreateModal = (columnId = 'todo') => {
        setEditingTask(null);
        setTaskForm({ title: '', priority: 'Medium', assignee: 'Unassigned', column: columnId });
        setIsTaskModalOpen(true);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white">Project Board</h1>
                    <p className="text-white/60 text-sm mt-1">Manage tasks and track progress</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setIsMemberModalOpen(true)} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <User size={18} className="mr-2" /> Manage Team
                    </Button>
                    <Button onClick={() => setIsAiModalOpen(true)} className="bg-schurr-green text-white hover:bg-schurr-green/80 border-0">
                        <Sparkles size={18} className="mr-2" /> AI Assistant
                    </Button>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex gap-6 h-full min-w-max">
                    {COLUMNS.map(column => (
                        <div key={column.id} className="w-80 flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                            {/* Column Header */}
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                                    <h3 className="font-bold text-white">{column.title}</h3>
                                </div>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/60 font-mono">
                                    {tasks.filter(t => t.column === column.id).length}
                                </span>
                            </div>

                            {/* Tasks List */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {tasks.filter(t => t.column === column.id).map(task => (
                                    <div key={task.id} className="bg-schurr-black border border-white/10 rounded-lg p-3 shadow-sm hover:border-white/30 transition-all group">
                                        {/* Task Header */}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={cn(
                                                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                                task.priority === 'High' ? "bg-red-500/20 text-red-400" :
                                                    task.priority === 'Medium' ? "bg-yellow-500/20 text-yellow-400" :
                                                        "bg-green-500/20 text-green-400"
                                            )}>
                                                {task.priority}
                                            </span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditModal(task)} className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded">
                                                    <Edit2 size={12} />
                                                </button>
                                                <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Task Title */}
                                        <p className="text-white text-sm font-medium mb-3 leading-snug">{task.title}</p>

                                        {/* Task Footer */}
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            {/* Assignee Dropdown */}
                                            <div className="relative group/assignee">
                                                <select
                                                    value={task.assignee || 'Unassigned'}
                                                    onChange={(e) => handleAssignTask(task.id, e.target.value)}
                                                    className="bg-transparent text-xs text-white/60 hover:text-white cursor-pointer focus:outline-none appearance-none pr-4"
                                                >
                                                    <option value="Unassigned">Unassigned</option>
                                                    {members.map(m => (
                                                        <option key={m.id} value={m.name}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Move Controls */}
                                            <div className="flex gap-1">
                                                {column.id !== 'todo' && (
                                                    <button
                                                        onClick={() => handleMoveTask(task.id, column.id, 'prev')}
                                                        className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded"
                                                        title="Move Back"
                                                    >
                                                        <ArrowLeft size={14} />
                                                    </button>
                                                )}
                                                {column.id !== 'done' && (
                                                    <button
                                                        onClick={() => handleMoveTask(task.id, column.id, 'next')}
                                                        className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded"
                                                        title="Move Forward"
                                                    >
                                                        <ArrowRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Button */}
                            <div className="p-3 border-t border-white/5 bg-black/20">
                                <button
                                    onClick={() => openCreateModal(column.id)}
                                    className="w-full py-2 flex items-center justify-center gap-2 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded transition-all border border-dashed border-white/10 hover:border-white/30"
                                >
                                    <Plus size={16} /> Add Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Task Modal */}
            <Modal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                title={editingTask ? "Edit Task" : "New Task"}
            >
                <form onSubmit={handleSaveTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/60 mb-1">Task Title</label>
                        <input
                            type="text"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            className="w-full p-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-schurr-green"
                            placeholder="What needs to be done?"
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1">Priority</label>
                            <select
                                value={taskForm.priority}
                                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                className="w-full p-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-schurr-green"
                            >
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/60 mb-1">Assignee</label>
                            <select
                                value={taskForm.assignee}
                                onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                                className="w-full p-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-schurr-green"
                            >
                                <option value="Unassigned">Unassigned</option>
                                {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" type="button" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-schurr-green text-white border-0">Save Task</Button>
                    </div>
                </form>
            </Modal>

            {/* Member Modal */}
            <Modal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                title="Manage Team"
            >
                <div className="space-y-6">
                    <form onSubmit={handleAddMember} className="flex gap-2">
                        <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="flex-1 p-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-schurr-green"
                            placeholder="New member name..."
                        />
                        <Button type="submit" className="bg-white text-black border-0">Add</Button>
                    </form>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {members.map(member => (
                            <div key={member.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-white font-medium">{member.name}</span>
                                <button onClick={() => handleRemoveMember(member.id)} className="text-white/40 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {members.length === 0 && <p className="text-white/40 text-center text-sm">No team members yet.</p>}
                    </div>
                </div>
            </Modal>

            {/* AI Modal */}
            <Modal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                title="AI Task Generator"
            >
                <div className="space-y-4">
                    <p className="text-white/60 text-sm">Describe a goal, and I'll create a task list for your team.</p>
                    <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full p-3 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-schurr-green min-h-[100px]"
                        placeholder="e.g. Launch the new marketing campaign by Friday..."
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsAiModalOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleAiGenerate}
                            disabled={isAiGenerating || !aiPrompt.trim()}
                            className="bg-schurr-green text-white border-0"
                        >
                            {isAiGenerating ? <Loader2 className="animate-spin mr-2" size={18} /> : <Sparkles className="mr-2" size={18} />}
                            Generate Tasks
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeamBoard;
