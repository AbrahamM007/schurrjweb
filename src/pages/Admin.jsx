import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatCard from '../components/admin/StatCard';
import AITextTool from '../components/admin/AITextTool';
import { FileText, Image, BookOpen, TrendingUp, Upload, Trash2, Edit } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'articles':
        return <ArticlesView />;
      case 'chronicles':
        return <ChroniclesView />;
      case 'gallery':
        return <GalleryView />;
      case 'ai-copilot':
        return <AICopilotView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-schurr-white">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-8">
        {renderContent()}
      </main>
    </div>
  );
};

const DashboardView = () => {
  return (
    <div>
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Published Articles" value="47" change={12} icon={FileText} />
        <StatCard title="Gallery Photos" value="234" change={8} icon={Image} />
        <StatCard title="Chronicle Issues" value="12" change={0} icon={BookOpen} />
        <StatCard title="Monthly Views" value="8.2K" change={23} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border-3 border-schurr-black p-6 shadow-brutal">
          <h2 className="text-2xl font-black uppercase mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'Published', item: 'Student Council Interview', time: '2 hours ago' },
              { action: 'Uploaded', item: '12 new gallery photos', time: '5 hours ago' },
              { action: 'Updated', item: 'Winter Chronicle Edition', time: '1 day ago' },
            ].map((activity, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200">
                <div>
                  <span className="font-bold">{activity.action}</span> {activity.item}
                </div>
                <span className="text-sm text-gray-500 font-mono">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-schurr-black text-white border-3 border-schurr-black p-6">
          <h2 className="text-2xl font-black uppercase mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              <FileText className="mr-2" size={20} /> New Article
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <Upload className="mr-2" size={20} /> Upload Photos
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              <BookOpen className="mr-2" size={20} /> Add Chronicle Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArticlesView = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(collection(db, "articles"), orderBy("date", "desc"));
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
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Articles</h1>
        <Button>+ New Article</Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading articles...</div>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="bg-white border-3 border-schurr-black p-6 flex justify-between items-center shadow-brutal hover:shadow-brutal-lg transition-all">
              <div className="flex gap-6 items-center flex-1">
                {article.image && (
                  <img src={article.image} alt={article.title} className="w-24 h-24 object-cover border-2 border-schurr-black" />
                )}
                <div>
                  <h3 className="text-xl font-bold mb-1">{article.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-600 font-mono">
                    <span>{article.category}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 transition-colors">
                  <Edit size={20} />
                </button>
                <button className="p-2 hover:bg-red-50 text-red-600 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            No articles found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
};

const ChroniclesView = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Chronicles</h1>
        <Button>+ Upload Issue</Button>
      </div>

      <div className="bg-white border-3 border-schurr-black p-8 shadow-brutal">
        <div className="border-4 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">Upload PDF Chronicle</h3>
          <p className="text-gray-600 mb-4">Drag and drop or click to browse</p>
          <Button variant="outline">Choose File</Button>
        </div>
      </div>
    </div>
  );
};

const GalleryView = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Gallery Manager</h1>
        <Button>+ Upload Photos</Button>
      </div>

      <div className="bg-white border-3 border-schurr-black p-8 shadow-brutal">
        <div className="border-4 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Image size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">Upload Photos</h3>
          <p className="text-gray-600 mb-4">AI will auto-tag your images</p>
          <Button variant="outline">Choose Files</Button>
        </div>
      </div>
    </div>
  );
};

const AICopilotView = () => {
  return (
    <div>
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-8">AI Co-Pilot</h1>
      <AITextTool />
    </div>
  );
};

export default Admin;
