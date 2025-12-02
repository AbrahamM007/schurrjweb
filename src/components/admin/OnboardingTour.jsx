import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { ChevronRight, Zap, LayoutDashboard, Users, BookOpen, Image, Sparkles, Settings, FileText, Trophy, Activity, Flame } from 'lucide-react';

const TOUR_STEPS = [
    // DASHBOARD
    {
        id: 'welcome',
        targetTab: 'dashboard',
        title: 'Welcome to Command Center',
        description: "You've been granted access to the Schurr Chronicles OS. This is your mission control for the entire publication.",
        icon: Zap,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10 border-yellow-400/20'
    },
    {
        id: 'dashboard-stats',
        targetTab: 'dashboard',
        title: 'Real-Time Intel',
        description: "The top row shows your vital stats: Total Articles, Gallery Photos, Chronicle Issues, and Monthly Views. Keep these numbers green.",
        icon: LayoutDashboard,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10 border-blue-400/20'
    },
    {
        id: 'dashboard-actions',
        targetTab: 'dashboard',
        title: 'Quick Actions',
        description: "Need to move fast? Use the 'Quick Actions' panel to deploy new articles, upload photos, or start a new issue instantly.",
        icon: Zap,
        color: 'text-green-400',
        bg: 'bg-green-400/10 border-green-400/20'
    },

    // TEAM
    {
        id: 'team-intro',
        targetTab: 'team',
        title: 'Team Command Center',
        description: "This isn't just a task list. It's a gamified war room. Here you manage your team's assignments and track their performance.",
        icon: Users,
        color: 'text-red-400',
        bg: 'bg-red-400/10 border-red-400/20'
    },
    {
        id: 'team-kanban',
        targetTab: 'team',
        title: 'Directive Board',
        description: "Tasks move from 'To Do' to 'Done'. Drag and drop to update status. Assign tasks to specific agents (members) to keep them accountable.",
        icon: LayoutDashboard,
        color: 'text-orange-400',
        bg: 'bg-orange-400/10 border-orange-400/20'
    },
    {
        id: 'team-ai',
        targetTab: 'team',
        title: 'AI Overlord',
        description: "Meet your new boss. The 'AI Overlord' (Tiger Mom persona) analyzes your board and generates ruthless directives to improve efficiency.",
        icon: Flame,
        color: 'text-red-500',
        bg: 'bg-red-500/10 border-red-500/20'
    },
    {
        id: 'team-leaderboard',
        targetTab: 'team',
        title: 'Gamification & The Eye',
        description: "Every completed task earns XP. The Leaderboard ranks your top agents. 'The Eye' records every action in real-time. Big Brother is watching.",
        icon: Trophy,
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10 border-yellow-400/20'
    },

    // ARTICLES
    {
        id: 'articles-intro',
        targetTab: 'articles',
        title: 'Article Database',
        description: "Manage your news feed here. Create, edit, and delete articles. We use URL-based image hosting for speed and efficiency.",
        icon: FileText,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10 border-blue-400/20'
    },

    // CHRONICLES
    {
        id: 'chronicles-intro',
        targetTab: 'chronicles',
        title: 'The Chronicles',
        description: "This is the heart of the publication. Create rich, immersive issues using our advanced editor.",
        icon: BookOpen,
        color: 'text-purple-400',
        bg: 'bg-purple-400/10 border-purple-400/20'
    },
    {
        id: 'chronicles-ai',
        targetTab: 'chronicles',
        title: 'AI Editor Tools',
        description: "Inside the editor, you have 'Wow' features: Tone Shift, Interview Simulator, and Headline Hunter. Use AI to enhance your writing, not replace it.",
        icon: Sparkles,
        color: 'text-purple-300',
        bg: 'bg-purple-400/10 border-purple-400/20'
    },

    // GALLERY
    {
        id: 'gallery-intro',
        targetTab: 'gallery',
        title: 'Visual Assets',
        description: "A picture is worth a thousand words. Manage your photo grid here. Simply paste image URLs to add them to the gallery.",
        icon: Image,
        color: 'text-pink-400',
        bg: 'bg-pink-400/10 border-pink-400/20'
    },

    // AI CO-PILOT
    {
        id: 'ai-intro',
        targetTab: 'ai-copilot',
        title: 'Global AI Co-Pilot',
        description: "Your personal assistant. Use this for general queries, brainstorming, or drafting content. It's connected to the Gemini neural network.",
        icon: Sparkles,
        color: 'text-cyan-400',
        bg: 'bg-cyan-400/10 border-cyan-400/20'
    },

    // SETTINGS
    {
        id: 'settings-intro',
        targetTab: 'settings',
        title: 'System Settings',
        description: "Configure your admin profile here. Keep your credentials secure.",
        icon: Settings,
        color: 'text-gray-400',
        bg: 'bg-white/10 border-white/20'
    },

    // FINISH
    {
        id: 'finish',
        targetTab: 'dashboard',
        title: 'System Initialized',
        description: "You are now fully briefed. The tour is complete. Good luck, Admin.",
        icon: Zap,
        color: 'text-green-400',
        bg: 'bg-green-400/10 border-green-400/20'
    }
];

const OnboardingTour = ({ onComplete, setActiveTab }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if tour has been completed
        const hasCompletedTour = localStorage.getItem('schurr_admin_onboarding_complete');
        if (!hasCompletedTour) {
            setIsVisible(true);
        }
    }, []);

    // Auto-navigate when step changes
    useEffect(() => {
        if (isVisible && setActiveTab) {
            const target = TOUR_STEPS[currentStep].targetTab;
            if (target) {
                setActiveTab(target);
            }
        }
    }, [currentStep, isVisible, setActiveTab]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            completeTour();
        }
    };

    const completeTour = () => {
        localStorage.setItem('schurr_admin_onboarding_complete', 'true');
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];
    const Icon = step.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
                <motion.div
                    key={step.id}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: -20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className={`max-w-md w-full bg-schurr-black border ${step.bg.split(' ')[1]} rounded-3xl p-8 shadow-2xl relative overflow-hidden`}
                >
                    {/* Background Gradient */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${step.color.split('-')[1]}-500 to-transparent opacity-50`} />
                    <div className={`absolute -top-20 -right-20 w-40 h-40 ${step.bg.split(' ')[0]} rounded-full blur-3xl opacity-20`} />

                    <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mb-6 mx-auto shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
                            <Icon size={32} className={step.color} />
                        </div>

                        <h2 className="text-2xl font-black text-center text-white mb-3 uppercase tracking-tight">
                            {step.title}
                        </h2>

                        <p className="text-white/60 text-center font-mono text-sm leading-relaxed mb-8">
                            {step.description}
                        </p>

                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                            <div className="flex gap-1">
                                {TOUR_STEPS.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? step.color.replace('text', 'bg') : 'bg-white/10'}`}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-3">
                                {/* No Skip Button */}
                                <Button
                                    onClick={handleNext}
                                    className={`${step.bg.replace('/10', '/20')} ${step.color} hover:bg-white/10 border-0`}
                                >
                                    {currentStep === TOUR_STEPS.length - 1 ? 'Initialize' : 'Next'}
                                    {currentStep !== TOUR_STEPS.length - 1 && <ChevronRight size={16} className="ml-2" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingTour;
