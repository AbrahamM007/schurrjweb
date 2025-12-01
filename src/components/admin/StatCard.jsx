import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const StatCard = ({ title, value, change, icon: Icon, className }) => {
    const isPositive = change >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-white border-3 border-schurr-black p-6 shadow-brutal hover:shadow-brutal-lg transition-all duration-300",
                className
            )}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="bg-schurr-black text-white p-3">
                    <Icon size={24} />
                </div>
                {change !== undefined && (
                    <span className={cn(
                        "text-sm font-bold font-mono",
                        isPositive ? "text-green-600" : "text-red-600"
                    )}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                )}
            </div>

            <h3 className="text-4xl font-black mb-2">{value}</h3>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-600">{title}</p>
        </motion.div>
    );
};

export default StatCard;
