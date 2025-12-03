
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Trash2, ExternalLink, Layout, Clock, Users } from 'lucide-react';
import { Button } from '../../ui/Button';
import { db, auth } from '../../../lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import WhiteboardEditor from './WhiteboardEditor';

const WhiteboardDashboard = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchBoards = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "boards"), orderBy("updatedAt", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedBoards = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBoards(fetchedBoards);
        } catch (error) {
            console.error("Error fetching boards:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoards();
    }, []);

    const handleCreateBoard = async () => {
        const title = prompt("Enter board name:");
        if (!title) return;

        try {
            const newBoardData = {
                title,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                elements: [],
                createdBy: auth.currentUser ? auth.currentUser.uid : 'anonymous',
                roles: auth.currentUser ? { [auth.currentUser.uid]: 'admin' } : {}
            };
            const docRef = await addDoc(collection(db, "boards"), newBoardData);
            // Open the new board immediately
            setSelectedBoard({ id: docRef.id, ...newBoardData });
            fetchBoards();
        } catch (error) {
            console.error("Error creating board:", error);
        }
    };

    const handleDeleteBoard = async (e, boardId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this board?")) {
            try {
                await deleteDoc(doc(db, "boards", boardId));
                fetchBoards();
            } catch (error) {
                console.error("Error deleting board:", error);
            }
        }
    };

    if (selectedBoard) {
        return (
            <WhiteboardEditor
                boardId={selectedBoard.id}
                onBack={() => {
                    setSelectedBoard(null);
                    fetchBoards();
                }}
            />
        );
    }

    const filteredBoards = boards.filter(board =>
        board.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Whiteboard</h1>
                    <p className="text-white/40 mt-2 font-mono text-sm">Collaborate and plan issues</p>
                </div>
                <Button onClick={handleCreateBoard} className="bg-schurr-green text-white hover:bg-schurr-green/80 border-0 shadow-lg shadow-schurr-green/20">
                    <Plus size={20} className="mr-2" /> New Board
                </Button>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search boards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-schurr-green transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-white/40 text-center py-20 font-mono">Loading boards...</div>
            ) : filteredBoards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBoards.map((board) => (
                        <div
                            key={board.id}
                            onClick={() => setSelectedBoard(board)}
                            className="group bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all cursor-pointer flex flex-col h-48 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                    onClick={(e) => handleDeleteBoard(e, board.id)}
                                    className="p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex-1 flex items-center justify-center bg-black/20 rounded-lg mb-4 border border-white/5">
                                <Layout size={32} className="text-white/20 group-hover:text-schurr-green transition-colors" />
                            </div>

                            <div>
                                <h3 className="font-bold text-white truncate group-hover:text-schurr-green transition-colors">{board.title}</h3>
                                <div className="flex items-center gap-4 mt-2 text-xs text-white/40 font-mono">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} />
                                        {board.updatedAt?.seconds ? new Date(board.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users size={12} />
                                        Admin
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-12">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Layout size={32} className="text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No boards yet</h3>
                    <p className="text-white/40 mb-6 font-mono text-sm">Create a whiteboard to start planning</p>
                    <Button onClick={handleCreateBoard} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Create Board
                    </Button>
                </div>
            )}
        </motion.div>
    );
};

export default WhiteboardDashboard;
