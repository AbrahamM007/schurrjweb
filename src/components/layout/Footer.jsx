import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Mail, MapPin, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative bg-schurr-black text-white overflow-hidden border-t border-white/10">
            {/* Subtle Background Gradient - matching home page aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-schurr-green/5 to-transparent opacity-50" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-6">
                        <div className="mb-8">
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-2">
                                SPARTAN
                            </h2>
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif italic font-normal text-schurr-gold opacity-90 leading-[0.9]">
                                Chronicles
                            </h2>
                        </div>
                        <p className="text-base md:text-lg text-white/60 leading-relaxed max-w-md mb-8">
                            Uncovering the stories that define us. <br />
                            <span className="text-white/80 font-medium">Bold. Authentic. Schurr.</span>
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3 mb-8">
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-white/10 hover:border-schurr-gold transition-all duration-300"
                            >
                                <Instagram size={18} className="text-white/70 group-hover:text-schurr-gold transition-colors" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-white/10 hover:border-schurr-gold transition-all duration-300"
                            >
                                <Twitter size={18} className="text-white/70 group-hover:text-schurr-gold transition-colors" />
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center hover:bg-white/10 hover:border-schurr-gold transition-all duration-300"
                            >
                                <Youtube size={18} className="text-white/70 group-hover:text-schurr-gold transition-colors" />
                            </a>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-8 border-t border-white/10 pt-8 max-w-md">
                            <div>
                                <div className="text-2xl font-black text-schurr-gold mb-0.5">2K+</div>
                                <div className="text-xs text-white/40 uppercase tracking-wider">Readers</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-schurr-green mb-0.5">500+</div>
                                <div className="text-xs text-white/40 uppercase tracking-wider">Stories</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white mb-0.5">1972</div>
                                <div className="text-xs text-white/40 uppercase tracking-wider">Est.</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="lg:col-span-2 lg:col-start-8">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Explore</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                                    <span className="group-hover:translate-x-1 transition-transform">News</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/chronicles" className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                                    <span className="group-hover:translate-x-1 transition-transform">Chronicles</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery" className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                                    <span className="group-hover:translate-x-1 transition-transform">Gallery</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
                                    <span className="group-hover:translate-x-1 transition-transform">About</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/submit" className="group flex items-center gap-2 text-schurr-gold/80 hover:text-schurr-gold transition-colors font-medium text-sm">
                                    <span className="group-hover:translate-x-1 transition-transform">Submit Story</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div className="lg:col-span-3 lg:col-start-10">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Contact</h3>
                        <div className="space-y-6">
                            {/* Address */}
                            <div className="group">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <MapPin size={16} className="text-schurr-gold" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 font-medium mb-1 text-sm">Visit Our Newsroom</p>
                                        <p className="text-xs text-white/60 leading-relaxed">
                                            820 N Wilcox Ave, Room A-12<br />
                                            Montebello, CA 90640
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="group">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <Mail size={16} className="text-schurr-gold" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 font-medium mb-1 text-sm">Get in Touch</p>
                                        <a
                                            href="mailto:journalism@schurrhigh.org"
                                            className="text-xs text-white/60 hover:text-schurr-gold transition-colors"
                                        >
                                            journalism@schurrhigh.org
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
                        <p>
                            © {new Date().getFullYear()} Schurr Chronicles. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
                            <a href="https://moratadeo.com" target="_blank" rel="noopener noreferrer" className="hover:text-schurr-gold transition-colors font-medium">Made by Moratadeo</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
