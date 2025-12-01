import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';

const ArticleCard = ({ article, className }) => {
    const { title, category, image, date, excerpt, slug } = article;

    const categoryColors = {
        'Campus': 'bg-schurr-green',
        'Sports': 'bg-schurr-gold',
        'News': 'bg-schurr-green',
        'Arts': 'bg-purple-600',
        'Opinions': 'bg-orange-600',
        'Features': 'bg-blue-600',
    };

    return (
        <Link to={`/article/${slug}`} className={cn("block group h-full", className)}>
            <motion.article
                className="h-full border-4 border-schurr-green bg-white flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-brutal-lg hover:-translate-x-[3px] hover:-translate-y-[3px] hover:border-schurr-gold"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
            >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden border-b-4 border-schurr-green group-hover:border-schurr-gold transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-t from-schurr-green/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
                    <img
                        src={image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop"}
                        alt={title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    <span className={cn(
                        "absolute top-4 left-4 text-white px-4 py-2 text-xs font-black uppercase tracking-[0.3em] z-20 border-3 border-white",
                        categoryColors[category] || 'bg-schurr-green'
                    )}>
                        {category}
                    </span>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow bg-white">
                    <div className="flex justify-between items-center mb-3 text-xs font-mono text-gray-500 uppercase tracking-wider">
                        <span className="font-bold">{date}</span>
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-schurr-green rounded-full" />
                            <span className="w-2 h-2 bg-schurr-gold rounded-full" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black leading-tight mb-3 group-hover:text-schurr-green transition-colors line-clamp-2 uppercase tracking-tight">
                        {title}
                    </h3>
                    <p className="font-serif text-gray-700 line-clamp-3 mb-4 flex-grow text-base leading-relaxed">
                        {excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t-3 border-schurr-gray flex justify-between items-center group-hover:border-schurr-gold transition-colors">
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-schurr-green group-hover:text-schurr-gold transition-colors">
                            Read Story
                        </span>
                        <ArrowRight className="text-schurr-green group-hover:text-schurr-gold group-hover:translate-x-2 transition-all" size={24} strokeWidth={3} />
                    </div>
                </div>
            </motion.article>
        </Link>
    );
};

export default ArticleCard;
