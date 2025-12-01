import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Play } from 'lucide-react';

const HeroSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={containerRef} className="relative h-[120vh] overflow-hidden bg-schurr-black">
            {/* Background Parallax */}
            <motion.div
                style={{ y: yBg }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-schurr-black/50 to-schurr-black z-10" />
                <div className="absolute inset-0 bg-gradient-mesh opacity-30 mix-blend-overlay z-10" />
                <img
                    src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=2070&auto=format&fit=crop"
                    alt="Schurr High School"
                    className="w-full h-full object-cover opacity-60 scale-110"
                />
            </motion.div>

            {/* Content */}
            <div className="relative z-20 h-screen flex flex-col justify-center items-center text-center px-6">
                <motion.div style={{ y: yText }} className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex items-center justify-center gap-4 mb-8"
                    >
                        <span className="px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-schurr-gold text-sm font-medium uppercase tracking-widest">
                            Est. 1972
                        </span>
                        <span className="w-12 h-[1px] bg-white/20" />
                        <span className="text-white/60 text-sm font-medium uppercase tracking-widest">
                            Montebello, CA
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-6 leading-[0.85]"
                    >
                        SPARTAN
                        <span className="block font-serif italic font-normal text-schurr-gold opacity-90">
                            Chronicles
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light leading-relaxed mb-12"
                    >
                        Uncovering the stories that define us. <br />
                        <span className="text-white font-medium">Bold. Authentic. Schurr.</span>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <button className="group relative px-8 py-4 bg-schurr-green text-white rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(0,107,63,0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span className="relative font-bold tracking-wide">Start Reading</span>
                        </button>

                        <button className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
                            <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <Play size={20} fill="currentColor" className="ml-1" />
                            </div>
                            <span className="font-medium">Watch Showreel</span>
                        </button>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                style={{ opacity }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-2"
            >
                <span className="text-xs uppercase tracking-widest">Scroll</span>
                <ArrowDown className="animate-bounce" size={20} />
            </motion.div>
        </section>
    );
};

export default HeroSection;
