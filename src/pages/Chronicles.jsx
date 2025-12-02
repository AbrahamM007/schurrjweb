import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { BookOpen, Calendar, ArrowRight, Loader2, Filter, Zap } from 'lucide-react';

// --- Constants (Matching your Home page theme) ---
const SCHURR_COLORS = {
  black: 'bg-schurr-black',
  green: 'text-schurr-green',
  gold: 'text-schurr-gold',
};

// --- Custom Component: Year Filter Button (Clean & High Contrast) ---
const YearFilterButton = ({ year, isSelected, onClick }) => (
  <button
    key={year}
    onClick={onClick}
    className={cn(
      "px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border-2",
      isSelected
        ? "bg-schurr-gold text-schurr-black border-schurr-gold shadow-lg shadow-schurr-gold/30"
        : "bg-transparent text-white/70 border-white/10 hover:border-schurr-green hover:text-schurr-green"
    )}
  >
    {year}
  </button>
);

// --- Custom Component: Chronicle Card (Journalistic & Structured) ---
// This card will be vertically oriented and focus on clean typography.
const ChronicleCard = ({ issue, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ delay: index * 0.08, duration: 0.6 }}
    // The main container is dark, with a striking gold border on hover
    className="group bg-schurr-black border border-white/10 rounded-xl p-6 shadow-xl transition-all duration-300 transform hover:shadow-schurr-gold/30 hover:-translate-y-0.5"
  >
    {/* Inner Card Content */}
    <div className="flex flex-col h-full">
      
      {/* Date & Type Badge */}
      <div className="flex justify-between items-center mb-4">
        <span className="flex items-center gap-1 text-sm font-semibold text-white/50">
          <Calendar size={14} className="text-schurr-green" />
          {issue.dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
        </span>
        <span className={cn(
          "px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest",
          issue.type === 'rich-text'
            ? 'bg-schurr-gold/20 text-schurr-gold'
            : 'bg-white/10 text-white/70'
        )}>
          {issue.type === 'rich-text' ? 'Digital' : 'PDF'}
        </span>
      </div>

      {/* Title (The most important element) */}
      <h3 className="text-2xl font-black tracking-tight mb-3 leading-snug uppercase group-hover:text-schurr-gold transition-colors">
        {issue.title}
      </h3>

      {/* Separator Line */}
      <div className="w-10 h-0.5 bg-schurr-green mb-4 transition-all group-hover:w-full" />

      {/* Preview */}
      <div className="relative mb-6 flex-grow">
        <p className="text-white/70 font-serif leading-relaxed line-clamp-3">
          {issue.preview || "No summary available. Click to view the full chronicle."}
        </p>
        {/* Dark Fade for seamless truncation */}
        <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-schurr-black to-transparent pointer-events-none" />
      </div>

      {/* Action Button: Clean and Subdued */}
      <Button
        variant="ghost" // Use a ghost button for a cleaner look
        className="w-full mt-auto text-schurr-gold hover:text-schurr-black hover:bg-schurr-gold transition-colors py-2 text-sm font-bold justify-center"
      >
        Read Full Issue <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  </motion.div>
);


// --- Main Component ---
const Chronicles = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('All');
  const [years, setYears] = useState(['All']);

  // ... (Fetch logic remains the same)
  const fetchIssues = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "chronicles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedIssues = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const dateObj = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date();
        return {
          id: doc.id,
          ...data,
          dateObj,
        };
      });

      setIssues(fetchedIssues);

      const uniqueYears = ['All', ...new Set(fetchedIssues.map(issue => issue.dateObj.getFullYear().toString()))].sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return parseInt(b) - parseInt(a); 
      });
      setYears(uniqueYears);
    } catch (error) {
      console.error("Error fetching chronicles:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const filteredIssues = useMemo(() => {
    return selectedYear === 'All'
      ? issues
      : issues.filter(issue => issue.dateObj.getFullYear().toString() === selectedYear);
  }, [issues, selectedYear]);

  // --- Render Logic ---

  return (
    <div className="min-h-screen bg-schurr-black text-white pb-32 pt-24"> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Archive Header: Structured and Clean */}
        <section className="pb-10 mb-16 border-b border-schurr-green/50">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black uppercase tracking-tight mb-2 leading-none text-white"
          >
            The <span className={SCHURR_COLORS.gold}>Chronicles</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-serif italic text-white/60 max-w-4xl"
          >
            A definitive record of history, available for research and discovery.
          </motion.p>
        </section>

        {/* Year Filter and Count */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-16 gap-4"
        >
            <div className="flex items-center gap-3">
                <Filter size={20} className="text-schurr-green" />
                <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">
                    Browse by Year
                </h2>
            </div>
            
            <div className="flex justify-start flex-wrap gap-2 max-w-full">
                {years.map((year) => (
                    <YearFilterButton
                    key={year}
                    year={year}
                    isSelected={selectedYear === year}
                    onClick={() => setSelectedYear(year)}
                    />
                ))}
            </div>
        </motion.div>

        {/* Content Grid & States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/50">
            <Loader2 className="animate-spin text-schurr-green mb-4" size={56} />
            <p className="text-lg font-medium">Compiling historical data...</p>
          </div>
        ) : filteredIssues.length > 0 ? (
          // Use a varied grid layout: 1 column on mobile, 2 or 3 on desktop
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredIssues.map((issue, index) => (
              <ChronicleCard 
                key={issue.id}
                issue={issue}
                index={index}
              />
            ))}
          </div>
        ) : (
          /* Empty State: Clean and Informative */
          <div className="text-center py-20 border border-schurr-green/30 rounded-xl bg-schurr-black shadow-inner shadow-schurr-green/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-schurr-green/50">
              <Zap size={32} className="text-schurr-gold" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No Results Found</h3>
            <p className="text-lg text-white/70 max-w-md mx-auto">
              We couldn't find any chronicles matching the year **{selectedYear}**. Try the "All" filter or check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chronicles;