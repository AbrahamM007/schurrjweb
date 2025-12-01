import React from 'react';
import { Button } from '../components/ui/Button';

const About = () => {
    const team = [
        { name: "Sarah Chen", role: "Editor-in-Chief", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" },
        { name: "Marcus Johnson", role: "Sports Editor", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" },
        { name: "Emily Rodriguez", role: "Photo Editor", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop" },
        { name: "David Kim", role: "Staff Writer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" },
    ];

    return (
        <div className="min-h-screen bg-schurr-white">
            {/* Hero */}
            <div className="bg-schurr-black text-schurr-white py-24 border-b-3 border-schurr-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-8 leading-none">
                        We Are<br /><span className="text-schurr-green">Schurr</span>
                    </h1>
                    <p className="text-2xl font-serif max-w-3xl leading-relaxed text-gray-300">
                        The student voice of Schurr High School. Dedicated to truth, creativity, and the relentless pursuit of the story.
                    </p>
                </div>
            </div>

            {/* Mission */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-b-3 border-schurr-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Our Mission</h2>
                        <p className="text-lg font-serif text-gray-700 mb-6">
                            Schurr Chronicles serves as an open forum for student expression and a source of information for the school community. We strive to maintain high ethical standards while providing relevant, engaging, and thought-provoking content.
                        </p>
                        <p className="text-lg font-serif text-gray-700">
                            Founded in 1972, we have been documenting the history of our campus for over 50 years.
                        </p>
                    </div>
                    <div className="bg-schurr-green p-8 border-3 border-schurr-black shadow-brutal rotate-2">
                        <h3 className="text-2xl font-black uppercase text-white mb-4">Contact Us</h3>
                        <form className="space-y-4">
                            <input type="text" placeholder="NAME" className="w-full bg-white p-3 border-2 border-schurr-black font-bold placeholder:text-gray-400" />
                            <input type="email" placeholder="EMAIL" className="w-full bg-white p-3 border-2 border-schurr-black font-bold placeholder:text-gray-400" />
                            <textarea placeholder="MESSAGE" rows="4" className="w-full bg-white p-3 border-2 border-schurr-black font-bold placeholder:text-gray-400"></textarea>
                            <Button variant="secondary" className="w-full">Send Message</Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Team */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-12 text-center">Editorial Board</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {team.map((member) => (
                        <div key={member.name} className="group text-center">
                            <div className="aspect-square mb-6 overflow-hidden border-3 border-schurr-black rounded-full mx-auto w-48 h-48 relative">
                                <img
                                    src={member.img}
                                    alt={member.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                            <h3 className="text-xl font-black uppercase mb-1">{member.name}</h3>
                            <p className="font-mono text-schurr-green text-sm font-bold uppercase tracking-widest">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default About;
