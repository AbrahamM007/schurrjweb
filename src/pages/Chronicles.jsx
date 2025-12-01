import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const Chronicles = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const years = ['2025', '2024', '2023', '2022'];

  const issues = [
    { id: 1, title: "Winter Edition", date: "Dec 2025", cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop" },
    { id: 2, title: "Fall Edition", date: "Oct 2025", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1974&auto=format&fit=crop" },
    { id: 3, title: "Back to School", date: "Aug 2025", cover: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop" },
  ];

  return (
    <div className="min-h-screen bg-schurr-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8">
            The<br /><span className="text-schurr-green">Chronicles</span>
          </h1>
          <p className="text-xl font-serif max-w-2xl text-gray-600">
            Archive of Schurr High School's print journalism. Documenting history, one issue at a time.
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex flex-wrap gap-4 mb-12 border-b-3 border-schurr-black pb-8">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                "text-4xl font-black uppercase tracking-tighter transition-colors hover:text-schurr-green",
                selectedYear === year ? "text-schurr-black underline decoration-4 underline-offset-8" : "text-gray-300"
              )}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {issues.map((issue) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative aspect-[3/4] bg-gray-200 border-3 border-schurr-black mb-6 overflow-hidden shadow-brutal group-hover:shadow-brutal-xl transition-all duration-300 group-hover:-translate-y-2">
                <img
                  src={issue.cover}
                  alt={issue.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-6">
                  <Button variant="primary" className="w-full">Read Online</Button>
                  <Button variant="secondary" className="w-full">Download PDF</Button>
                </div>
              </div>
              <div className="flex justify-between items-baseline border-b-2 border-gray-200 pb-2">
                <h3 className="text-2xl font-bold uppercase tracking-tight">{issue.title}</h3>
                <span className="font-mono text-sm text-gray-500">{issue.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chronicles;
