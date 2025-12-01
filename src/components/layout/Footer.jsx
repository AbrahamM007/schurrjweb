import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-schurr-black text-schurr-white border-t-3 border-schurr-black mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-6xl font-black uppercase tracking-tighter mb-6 leading-none">
                            Schurr<br />Chronicles
                        </h2>
                        <p className="font-body text-gray-400 max-w-md mb-8">
                            The official student-run publication of Schurr High School.
                            Amplifying student voices through bold journalism and creative storytelling.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <div className="w-10 h-10 bg-schurr-white text-schurr-black flex items-center justify-center font-bold hover:bg-schurr-green transition-colors cursor-pointer">IG</div>
                            <div className="w-10 h-10 bg-schurr-white text-schurr-black flex items-center justify-center font-bold hover:bg-schurr-green transition-colors cursor-pointer">TW</div>
                            <div className="w-10 h-10 bg-schurr-white text-schurr-black flex items-center justify-center font-bold hover:bg-schurr-green transition-colors cursor-pointer">YT</div>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div>
                        <h3 className="text-xl font-bold uppercase mb-6 border-b-2 border-schurr-white pb-2 inline-block">Sections</h3>
                        <ul className="space-y-3 font-body">
                            <li><Link to="/" className="hover:text-schurr-green transition-colors">News</Link></li>
                            <li><Link to="/chronicles" className="hover:text-schurr-green transition-colors">Chronicles</Link></li>
                            <li><Link to="/gallery" className="hover:text-schurr-green transition-colors">Gallery</Link></li>
                            <li><Link to="/about" className="hover:text-schurr-green transition-colors">About Us</Link></li>
                            <li><Link to="/submit" className="hover:text-schurr-green transition-colors">Submit a Story</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="text-xl font-bold uppercase mb-6 border-b-2 border-schurr-white pb-2 inline-block">Contact</h3>
                        <address className="not-italic font-body text-gray-400 space-y-2">
                            <p>820 N Wilcox Ave</p>
                            <p>Montebello, CA 90640</p>
                            <br />
                            <p>room a-12</p>
                            <p>journalism@schurrhigh.org</p>
                        </address>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-mono">
                    <p>&copy; {new Date().getFullYear()} Schurr Chronicles. All rights reserved.</p>
                    <p>Designed with <span className="text-schurr-green">♥</span> by Antigravity</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
