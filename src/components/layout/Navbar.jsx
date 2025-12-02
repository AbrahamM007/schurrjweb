import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { href: '/', label: 'News' },
        { href: '/chronicles', label: 'Chronicles' },
        { href: '/gallery', label: 'Gallery' },
        { href: '/about', label: 'About' },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                    scrolled ? "py-4 px-4 md:px-8" : "py-6"
                )}
            >
                <div className={cn(
                    "mx-auto max-w-7xl px-6 md:px-8 transition-all duration-500",
                    scrolled ? "bg-schurr-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-lg" : "bg-transparent"
                )}>
                    <div className="flex justify-between items-center h-14">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                <img src="/favicon.svg" alt="Schurr Logo" className="w-full h-full object-contain drop-shadow-lg" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-sans font-bold text-white leading-none tracking-tight text-lg">SCHURR</span>
                                <span className="font-serif italic text-schurr-gold leading-none text-sm">Chronicles</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden",
                                        location.pathname === link.href
                                            ? "text-schurr-black bg-schurr-gold shadow-md"
                                            : "text-white/80 hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Admin & Mobile Toggle */}
                        <div className="flex items-center gap-4">
                            <Link
                                to="/admin"
                                className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-schurr-green text-white hover:bg-schurr-darkGreen transition-all duration-300 text-sm font-bold shadow-lg shadow-schurr-green/20 hover:shadow-schurr-green/40 hover:-translate-y-0.5"
                            >
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                Admin Portal
                            </Link>

                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                {isOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-40 bg-schurr-black/90 md:hidden flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-8">
                            {links.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.1 }}
                                >
                                    <Link
                                        to={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="text-4xl font-serif italic text-white hover:text-schurr-gold transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
