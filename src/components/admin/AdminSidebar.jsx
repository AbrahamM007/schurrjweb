import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Image, BookOpen, Sparkles, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'articles', label: 'Articles', icon: FileText },
        { id: 'chronicles', label: 'Chronicles', icon: BookOpen },
        { id: 'gallery', label: 'Gallery', icon: Image },
        { id: 'ai-copilot', label: 'AI Co-Pilot', icon: Sparkles },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-schurr-black text-schurr-white border-r-3 border-schurr-black min-h-screen sticky top-0">
            <div className="p-6 border-b-3 border-gray-800">
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                    Admin<br />Panel
                </h2>
            </div>

            <nav className="p-4">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 mb-2 font-bold uppercase text-sm tracking-wider transition-all",
                                activeTab === tab.id
                                    ? "bg-schurr-green text-white"
                                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                            )}
                        >
                            <Icon size={20} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t-3 border-gray-800">
                <Link to="/" className="text-sm text-gray-500 hover:text-schurr-green transition-colors">
                    ← Back to Site
                </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;
