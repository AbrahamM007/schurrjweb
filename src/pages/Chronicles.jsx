import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { BookOpen, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const Chronicles = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [years, setYears] = useState(['All']);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const q = query(collection(db, "chronicles"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedIssues = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to Date object if it exists, else use current date
          dateObj: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000) : new Date()
        }));

        setIssues(fetchedIssues);

        // Extract unique years
        const uniqueYears = ['All', ...new Set(fetchedIssues.map(issue => issue.dateObj.getFullYear().toString()))];
        setYears(uniqueYears);
      } catch (error) {
        console.error("Error fetching chronicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const filteredIssues = selectedYear === 'All'
    ? issues
    : issues.filter(issue => issue.dateObj.getFullYear().toString() === selectedYear);

  return (
    <div className="min-h-screen bg-schurr-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-6 leading-none"
          >
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-schurr-green to-schurr-darkGreen">Archive</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl font-serif text-gray-500 max-w-3xl mx-auto"
          >
            Documenting the history of Schurr High School. Every story, every voice, preserved for eternity.
          </motion.p>
        </div>

        {/* Year Filter */}
        {years.length > 1 && (
          <div className="flex justify-center flex-wrap gap-4 mb-16">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all border",
                  selectedYear === year
                    ? "bg-schurr-black text-white border-schurr-black"
                    : "bg-white text-gray-400 border-gray-200 hover:border-schurr-black hover:text-schurr-black"
                )}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-schurr-green" size={48} />
          </div>
        ) : filteredIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group perspective-1000"
              >
                <div className="relative bg-white border border-gray-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 group-hover:rotate-1">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-schurr-green/5 rounded-bl-full -z-0" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-schurr-black text-white rounded-xl flex items-center justify-center font-black text-xl">
                        {issue.title.charAt(0)}
                      </div>
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-mono font-bold text-gray-500 uppercase">
                        {issue.type === 'rich-text' ? 'Digital' : 'PDF'}
                      </span>
                    </div>

                    <h3 className="text-3xl font-black uppercase tracking-tight mb-2 leading-none group-hover:text-schurr-green transition-colors">
                      {issue.title}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-400 font-mono text-sm mb-6">
                      <Calendar size={14} />
                      {issue.dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>

                    <div className="h-32 overflow-hidden relative mb-6">
                      <p className="text-gray-500 font-serif leading-relaxed line-clamp-4">
                        {issue.preview || "No preview available for this issue."}
                      </p>
                      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
                    </div>

                    <Button className="w-full bg-schurr-black text-white hover:bg-schurr-green border-0 group-hover:shadow-lg group-hover:shadow-schurr-green/20 transition-all">
                      Read Issue <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={32} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">The Archives are Empty</h3>
            <p className="text-gray-500">No chronicles have been published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chronicles;
