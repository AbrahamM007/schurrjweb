import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Image, BookOpen, Sparkles, Settings, LogOut, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'articles', label: 'Articles', icon: FileText },
        { id: 'chronicles', label: 'Chronicles', icon: BookOpen },
        { id: 'gallery', label: 'Gallery', icon: Image },
        { id: 'ai-copilot', label: 'AI Co-Pilot', icon: Sparkles },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-schurr-black/95 backdrop-blur-xl border-r border-white/10 z-40 transition-all duration-300 flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-center md:justify-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-schurr-green to-schurr-darkGreen rounded-lg flex items-center justify-center shadow-lg shadow-schurr-green/20">
                    <span className="font-serif italic font-bold text-white">S</span>
                </div>
                <div className="hidden md:block">
                    <h2 className="text-lg font-bold uppercase tracking-tight text-white leading-none">
                        Admin
                    </h2>
                    <span className="text-xs text-white/40 font-mono">Panel</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-schurr-green/10 text-schurr-green"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-schurr-green rounded-r-full" />
                            )}
                            <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-schurr-green")} />
                            <span className="hidden md:block text-sm tracking-wide">{tab.label}</span>

                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-schurr-green/10 to-transparent opacity-50" />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <Link
                    to="/"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300 group"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden md:block text-sm font-medium">Back to Site</span>
                </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;
