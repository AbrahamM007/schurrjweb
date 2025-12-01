import React from 'react';
import { cn } from '../../lib/utils';
import { Zap } from 'lucide-react';

const NewsTicker = ({ items = [] }) => {
    const defaultItems = [
        "🏆 SPARTANS WIN: District Championship Victory!",
        "📚 FINALS WEEK: Dec 12-16 - Good Luck Spartans!",
        "🎨 ART SHOW: Student Gallery Opens Friday",
        "⚡ BREAKING: New Cafeteria Menu Launches Monday",
        "💚 SCHOOL SPIRIT: Wear Green & Gold This Friday",
        "📰 NEW ISSUE: Winter Chronicles Now Available"
    ];

    const tickerItems = items.length > 0 ? items : defaultItems;

    return (
        <div className="w-full bg-schurr-gold overflow-hidden border-y-4 border-schurr-green relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-schurr-green flex items-center justify-center z-10 border-r-4 border-schurr-green">
                <Zap className="text-schurr-gold" size={32} strokeWidth={3} />
            </div>
            <div className="py-4 pl-36">
                <div className="animate-ticker whitespace-nowrap flex gap-12">
                    {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                        <span key={i} className="text-xl font-black uppercase tracking-[0.15em] flex items-center gap-12 text-schurr-green">
                            {item}
                            <span className="w-3 h-3 bg-schurr-green inline-block rotate-45" />
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsTicker;
