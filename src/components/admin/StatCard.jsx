import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, change, icon: Icon, className, loading }) => {
    const isPositive = change >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group",
                className
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-white group-hover:scale-110 transition-transform duration-300 border border-white/10">
                    <Icon size={20} />
                </div>
                {change !== undefined && (
                    <span className={cn(
                        "text-xs font-bold font-mono px-2 py-1 rounded-full border",
                        isPositive
                            ? "text-schurr-green border-schurr-green/20 bg-schurr-green/10"
                            : "text-red-400 border-red-400/20 bg-red-400/10"
                    )}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                )}
            </div>

            {loading ? (
                <div className="h-8 w-24 bg-white/10 rounded animate-pulse mb-2" />
            ) : (
                <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{value}</h3>
            )}

            <p className="text-xs font-bold uppercase tracking-wider text-white/40">{title}</p>
        </motion.div>
    );
};

export default StatCard;
