import React from 'react';
import { motion } from 'framer-motion';

const SectionDivider = ({ text }) => {
    return (
        <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-1 bg-schurr-black my-16 relative origin-left"
        >
            {text && (
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-schurr-white px-6 py-2 font-black uppercase tracking-widest text-sm border-2 border-schurr-black">
                    {text}
                </span>
            )}
        </motion.div>
    );
};

export default SectionDivider;
