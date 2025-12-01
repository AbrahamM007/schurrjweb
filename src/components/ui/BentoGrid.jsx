import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const BentoGrid = ({ children, className }) => {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]", className)}>
            {children}
        </div>
    );
};

const BentoItem = ({ className, children, title, category, image, size = "normal" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ scale: 0.98 }}
            className={cn(
                "group relative rounded-3xl overflow-hidden bg-schurr-dark border border-white/5",
                size === "large" && "md:col-span-2 md:row-span-2",
                size === "tall" && "md:row-span-2",
                size === "wide" && "md:col-span-2",
                className
            )}
        >
            {/* Background Image */}
            {image && (
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    {category && (
                        <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white/90 border border-white/10">
                            {category}
                        </span>
                    )}
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/10">
                        <ArrowUpRight className="text-white" size={20} />
                    </div>
                </div>

                <div>
                    <h3 className={cn(
                        "font-sans font-bold text-white leading-tight mb-2 group-hover:text-schurr-gold transition-colors",
                        size === "large" ? "text-4xl" : "text-xl"
                    )}>
                        {title}
                    </h3>
                    {children}
                </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-schurr-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
        </motion.div>
    );
};

export { BentoGrid, BentoItem };
