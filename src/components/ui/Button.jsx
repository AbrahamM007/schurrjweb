import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const variants = {
        primary: 'bg-schurr-black text-schurr-white hover:bg-schurr-green',
        secondary: 'bg-schurr-white text-schurr-black hover:bg-schurr-gold',
        outline: 'bg-transparent text-schurr-black hover:bg-schurr-black hover:text-schurr-white',
        ghost: 'bg-transparent text-schurr-black hover:bg-gray-200 shadow-none border-transparent',
    };

    const sizes = {
        default: 'h-12 px-6 py-2',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-12 w-12 p-0 flex items-center justify-center',
    };

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-schurr-black disabled:pointer-events-none disabled:opacity-50 border-3 border-schurr-black shadow-brutal hover:shadow-brutal-lg active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';

export { Button };
