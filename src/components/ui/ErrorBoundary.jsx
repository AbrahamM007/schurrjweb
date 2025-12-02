import React from 'react';
import { AlertTriangle, Terminal } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-red-500 font-mono flex flex-col items-center justify-center p-8 text-center selection:bg-red-500 selection:text-black">
                    <div className="border border-red-500/50 bg-red-950/20 p-8 rounded-2xl max-w-2xl w-full backdrop-blur-lg shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-500/10 rounded-full animate-pulse">
                                <AlertTriangle size={48} />
                            </div>
                        </div>

                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">
                            System Failure
                        </h1>

                        <p className="text-red-400 mb-8 text-lg">
                            Critical runtime error detected. The application has been terminated to prevent data corruption.
                        </p>

                        <div className="bg-black/50 border border-red-500/30 rounded-xl p-4 text-left overflow-x-auto mb-8">
                            <div className="flex items-center gap-2 text-red-500/50 mb-2 border-b border-red-500/20 pb-2">
                                <Terminal size={14} />
                                <span className="text-xs uppercase">Error Log</span>
                            </div>
                            <code className="text-sm text-red-300 whitespace-pre-wrap">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>

                        <div className="text-white/40 text-sm">
                            <p className="mb-2">POSSIBLE CAUSES:</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Missing Environment Variables (Vercel)</li>
                                <li>Firebase Configuration Error</li>
                                <li>Network Connectivity Loss</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
                        >
                            Reboot System
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
