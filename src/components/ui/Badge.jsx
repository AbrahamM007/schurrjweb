import React from 'react';
import { cn } from '../../lib/utils';

const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: 'bg-schurr-black text-white',
        green: 'bg-schurr-green text-white',
        gold: 'bg-schurr-gold text-schurr-black',
        outline: 'bg-transparent text-schurr-black border-2 border-schurr-black',
    };

    return (
        <span className={cn(
            'inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};

export { Badge };
