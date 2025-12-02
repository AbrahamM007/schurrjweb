import React from 'react';
import { Database, Server, AlertTriangle } from 'lucide-react';

const SetupRequired = () => {
    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center p-8 text-center selection:bg-yellow-500 selection:text-black">
            <div className="max-w-3xl w-full bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl">
                <div className="flex justify-center mb-8">
                    <div className="p-6 bg-yellow-500/20 rounded-full animate-pulse">
                        <Database size={64} className="text-yellow-500" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">
                    Database Connection <span className="text-red-500">Failed</span>
                </h1>

                <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                    The application cannot connect to Firebase. This usually means the
                    <strong className="text-white"> Environment Variables</strong> are missing in your deployment settings.
                </p>

                <div className="bg-black/50 border border-white/10 rounded-2xl p-8 text-left mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Server size={20} className="text-blue-400" />
                        Action Required: Add Vercel Environment Variables
                    </h3>
                    <p className="text-white/40 mb-4 text-sm">
                        Go to your Vercel Dashboard {'>'} Settings {'>'} Environment Variables and add the following keys (copy values from your local .env):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-green-400">
                        <div className="bg-white/5 p-3 rounded border border-white/5">VITE_FIREBASE_API_KEY</div>
                        <div className="bg-white/5 p-3 rounded border border-white/5">VITE_FIREBASE_AUTH_DOMAIN</div>
                        <div className="bg-white/5 p-3 rounded border border-white/5">VITE_FIREBASE_PROJECT_ID</div>
                        <div className="bg-white/5 p-3 rounded border border-white/5">VITE_FIREBASE_STORAGE_BUCKET</div>
                        <div className="bg-white/5 p-3 rounded border border-white/5">VITE_FIREBASE_MESSAGING_SENDER_ID</div>
                        <div className="bg-white/5 p-3 rounded border border-white/5">VITE_FIREBASE_APP_ID</div>
                        <div className="bg-white/5 p-3 rounded border border-white/5">VITE_GEMINI_API_KEY</div>
                    </div>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                        I've Added Them, Retry Connection
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupRequired;
