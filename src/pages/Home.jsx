import React, { useEffect, useState } from 'react';
import HeroSection from '../components/features/HeroSection';
import { BentoGrid, BentoItem } from '../components/ui/BentoGrid';
import { Button } from '../components/ui/Button';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(collection(db, "articles"), orderBy("date", "desc"), limit(6));
        const querySnapshot = await getDocs(q);
        const fetchedArticles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-schurr-black text-white selection:bg-schurr-gold selection:text-black">
      <HeroSection />

      {/* Trending Marquee */}
      <div className="w-full bg-schurr-gold py-3 overflow-hidden">
        <div className="animate-ticker whitespace-nowrap flex gap-8 text-schurr-black font-bold uppercase tracking-wider text-sm">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="flex items-center gap-2">
              <TrendingUp size={16} />
              Breaking: Spartans Take District Championship
              <span className="w-1.5 h-1.5 rounded-full bg-schurr-black/50" />
            </span>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-2">Latest Stories</h2>
            <p className="text-white/60 font-serif italic text-lg">Curated journalism from the campus.</p>
          </div>
          <Button variant="outline" className="hidden md:flex border-white/20 text-white hover:bg-white hover:text-black rounded-full">
            View Archive <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>

        {loading ? (
          <div className="text-white/50 text-center py-20">Loading stories...</div>
        ) : articles.length > 0 ? (
          <BentoGrid>
            {/* Main Feature - First Article */}
            {articles[0] && (
              <BentoItem
                size="large"
                title={articles[0].title}
                category={articles[0].category}
                image={articles[0].image}
              >
                <p className="text-white/70 line-clamp-2 mt-2 font-serif">
                  {articles[0].excerpt}
                </p>
              </BentoItem>
            )}

            {/* Secondary Items */}
            {articles.slice(1).map((article, index) => (
              <BentoItem
                key={article.id}
                title={article.title}
                category={article.category}
                image={article.image}
                size={index === 2 ? "wide" : "normal"} // Make the 3rd item (index 2) wide for variety
              >
                {index === 2 && (
                  <p className="text-white/70 line-clamp-2 mt-2 font-serif">
                    {article.excerpt}
                  </p>
                )}
              </BentoItem>
            ))}
          </BentoGrid>
        ) : (
          <div className="text-white/50 text-center py-20 border border-white/10 rounded-3xl bg-white/5">
            <p>No stories found. Add some in the Admin Dashboard.</p>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-schurr-black via-schurr-green/20 to-schurr-black" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Don't Miss a <span className="text-schurr-gold italic font-serif">Beat</span>
          </h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Join 2,000+ Spartans receiving the weekly digest. No spam, just pure school spirit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-schurr-gold transition-colors"
            />
            <button className="bg-schurr-gold text-schurr-black font-bold px-8 py-4 rounded-full hover:bg-white transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;