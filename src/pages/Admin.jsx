import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatCard from '../components/admin/StatCard';
import AITextTool from '../components/admin/AITextTool';
import ArticleForm from '../components/admin/ArticleForm';
import UploadModal from '../components/admin/UploadModal';
import Modal from '../components/ui/Modal';
import { FileText, Image, BookOpen, TrendingUp, Upload, Trash2, Edit, Plus, Settings, User, LogOut, Folder, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'framer-motion';

import OnboardingTour from '../components/admin/OnboardingTour';
import TeamBoard from '../components/admin/TeamBoard';
import WhiteboardDashboard from '../components/admin/whiteboard/WhiteboardDashboard';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'team':
        return <TeamBoard />;
      case 'articles':
        return <ArticlesView />;
      case 'chronicles':
        return <ChroniclesView />;
      case 'gallery':
        return <GalleryView />;
      case 'whiteboard':
        return <WhiteboardDashboard />;
      case 'ai-copilot':
        return <AICopilotView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-schurr-black text-white font-sans selection:bg-schurr-green selection:text-schurr-black">
      <OnboardingTour setActiveTab={setActiveTab} />
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 ml-20 md:ml-64 transition-all duration-300 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const DashboardView = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    articles: 0,
    photos: 0,
    issues: 0,
    views: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const articlesQuery = query(collection(db, "articles"), orderBy("date", "desc"));
        const articlesSnapshot = await getDocs(articlesQuery);
        const articlesCount = articlesSnapshot.size;

        const gallerySnapshot = await getDocs(collection(db, "gallery"));
        const galleryCount = gallerySnapshot.size;

        const chroniclesSnapshot = await getDocs(collection(db, "chronicles"));
        const chroniclesCount = chroniclesSnapshot.size;

        const recentDocs = articlesSnapshot.docs.slice(0, 5).map(doc => ({
          id: doc.id,
          type: 'Article',
          action: 'Published',
          title: doc.data().title,
          date: doc.data().date
        }));

        setStats({
          articles: articlesCount,
          photos: galleryCount,
          issues: chroniclesCount,
          views: 0
        });
        setRecentActivity(recentDocs);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats(prev => ({ ...prev, articles: 0, photos: 0, issues: 0 }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
            Dashboard
          </h1>
          <p className="text-white/60 mt-2 font-mono text-sm">Overview of platform performance</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-schurr-green font-mono text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Articles" value={stats.articles} icon={FileText} loading={loading} />
        <StatCard title="Gallery Photos" value={stats.photos} icon={Image} loading={loading} />
        <StatCard title="Chronicle Issues" value={stats.issues} icon={BookOpen} loading={loading} />
        <StatCard title="Monthly Views" value={stats.views} icon={TrendingUp} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-schurr-green animate-pulse" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
            ) : recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-schurr-green/20 text-schurr-green">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-schurr-green transition-colors">{item.title}</p>
                      <p className="text-xs text-white/40 font-mono mt-1">
                        {item.action} • {item.date}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setActiveTab('articles')}>
                    View
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-white/40 font-mono text-sm">
                No recent activity found.
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-b from-schurr-green/20 to-schurr-black border border-schurr-green/30 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold uppercase tracking-tight mb-6 text-schurr-green">Quick Actions</h2>
          <div className="space-y-3">
            <Button onClick={() => setActiveTab('articles')} className="w-full justify-start bg-white text-schurr-black hover:bg-schurr-green hover:text-white border-0">
              <Plus className="mr-2" size={18} /> New Article
            </Button>
            <Button onClick={() => setActiveTab('gallery')} variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/40">
              <Upload className="mr-2" size={18} /> Upload Photos
            </Button>
            <Button onClick={() => setActiveTab('chronicles')} variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/40">
              <BookOpen className="mr-2" size={18} /> Add Issue
            </Button>
          </div>


        </div>
      </div>
    </motion.div>
  );
};

const ArticlesView = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleCreate = () => {
    setEditingArticle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteDoc(doc(db, "articles", id));
        fetchArticles();
      } catch (error) {
        console.error("Error deleting article:", error);
      }
    }
  };

  const handleSubmit = async (data) => {
    try {
      if (editingArticle) {
        await updateDoc(doc(db, "articles", editingArticle.id), data);
      } else {
        await addDoc(collection(db, "articles"), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Articles</h1>
        <Button onClick={handleCreate} className="bg-schurr-green text-white hover:bg-schurr-green/80 border-0 shadow-lg shadow-schurr-green/20">
          <Plus size={20} className="mr-2" /> New Article
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-white/40 text-center py-20 font-mono">Loading articles...</div>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <div key={article.id} className="group bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 transition-all duration-300">
              <div className="flex gap-6 items-center flex-1">
                {article.image ? (
                  <img src={article.image} alt={article.title} className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                ) : (
                  <div className="w-20 h-20 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-white/20">
                    <Image size={24} />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold mb-1 text-white group-hover:text-schurr-green transition-colors">{article.title}</h3>
                  <div className="flex gap-4 text-sm text-white/40 font-mono">
                    <span className="bg-white/5 px-2 py-0.5 rounded text-white/60">{article.category}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(article)} className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(article.id)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-white/40 text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
            No articles found. Create one to get started.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? "Edit Article" : "New Article"}
      >
        <ArticleForm
          initialData={editingArticle}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </motion.div>
  );
};

import ChronicleEditor from '../components/admin/ChronicleEditor';

const ChroniclesView = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "chronicles"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedIssues = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIssues(fetchedIssues);
    } catch (error) {
      console.error("Error fetching chronicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleSave = async (content) => {
    try {
      // For now, we'll just use a generic title or ask for one. 
      // In a real app, we'd add a title field to the editor or a pre-step.
      const title = editingIssue ? editingIssue.title : `Chronicle Issue ${new Date().toLocaleDateString()}`;

      const data = {
        title,
        content, // Saving HTML content
        type: 'rich-text',
        createdAt: serverTimestamp(),
        preview: content.replace(/<[^>]*>?/gm, '').slice(0, 150) + '...' // Plain text preview
      };

      if (editingIssue) {
        await updateDoc(doc(db, "chronicles", editingIssue.id), data);
      } else {
        await addDoc(collection(db, "chronicles"), data);
      }

      setIsEditorOpen(false);
      setEditingIssue(null);
      fetchIssues();
    } catch (error) {
      console.error("Error saving chronicle:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this issue?")) {
      try {
        await deleteDoc(doc(db, "chronicles", id));
        fetchIssues();
      } catch (error) {
        console.error("Error deleting chronicle:", error);
      }
    }
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setIsEditorOpen(true);
  };

  if (isEditorOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
      >
        <div className="w-full h-full max-w-5xl">
          <ChronicleEditor
            initialContent={editingIssue?.content || ''}
            onSave={handleSave}
            onCancel={() => {
              setIsEditorOpen(false);
              setEditingIssue(null);
            }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Chronicles</h1>
        <Button onClick={() => { setEditingIssue(null); setIsEditorOpen(true); }} className="bg-schurr-green text-white border-0 hover:bg-schurr-green/80">
          <Plus size={20} className="mr-2" /> New Issue
        </Button>
      </div>

      {loading ? (
        <div className="text-white/40 text-center py-20 font-mono">Loading issues...</div>
      ) : issues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <div key={issue.id} className="bg-white/5 border border-white/10 p-6 rounded-xl group hover:bg-white/10 transition-all flex flex-col h-full">
              <div className="flex items-center justify-center h-48 bg-black/20 rounded-lg mb-4 border border-white/5 overflow-hidden relative">
                {issue.type === 'rich-text' ? (
                  <div className="p-4 text-xs text-white/40 font-serif leading-relaxed w-full h-full opacity-50">
                    {issue.preview}
                  </div>
                ) : (
                  <FileText size={48} className="text-white/20 group-hover:text-schurr-green transition-colors" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-mono text-schurr-green bg-schurr-green/10 px-2 py-1 rounded">
                    {issue.type === 'rich-text' ? 'Editor' : 'PDF Upload'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 truncate">{issue.title}</h3>
              <p className="text-xs text-white/40 font-mono mb-4">
                {issue.createdAt?.seconds ? new Date(issue.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
              </p>

              <div className="mt-auto flex gap-2">
                <Button
                  onClick={() => handleEdit(issue)}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/10 text-white text-xs h-9"
                >
                  Edit
                </Button>
                <button onClick={() => handleDelete(issue.id)} className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
          <div onClick={() => setIsEditorOpen(true)} className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-schurr-green/50 hover:bg-white/5 transition-all cursor-pointer group">
            <BookOpen size={48} className="mx-auto mb-4 text-white/20 group-hover:text-schurr-green transition-colors" />
            <h3 className="text-xl font-bold mb-2 text-white">Create New Issue</h3>
            <p className="text-white/40 mb-6 font-mono text-sm">Write with AI assistance</p>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Open Editor</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};



// ... (previous imports and components remain unchanged)

const GalleryView = () => {
  const [photos, setPhotos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFolders = async () => {
    try {
      const q = query(collection(db, "gallery_folders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedFolders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFolders(fetchedFolders);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      let q;
      if (currentFolder) {
        q = query(
          collection(db, "gallery"),
          where("folderId", "==", currentFolder.id),
          orderBy("createdAt", "desc")
        );
      } else {
        // In root, show only photos with no folderId or folderId is null
        // Note: Firestore requires an index for this specific query if we mix where and orderBy
        // For simplicity in this iteration, we might fetch all and filter client side if the dataset is small,
        // or ensure we have the index. Let's try client-side filtering for root to avoid index issues immediately,
        // or better, just query for everything and filter.
        // Actually, let's try the proper query.
        q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
      }

      const querySnapshot = await getDocs(q);
      let fetchedPhotos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (currentFolder) {
        fetchedPhotos = fetchedPhotos.filter(p => p.folderId === currentFolder.id);
      } else {
        fetchedPhotos = fetchedPhotos.filter(p => !p.folderId);
      }

      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [currentFolder]);

  const handleCreateFolder = async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;

    try {
      await addDoc(collection(db, "gallery_folders"), {
        name,
        createdAt: serverTimestamp()
      });
      fetchFolders();
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };

  const handleDeleteFolder = async (folderId, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this folder? Photos inside will not be deleted but will be moved to root (or hidden depending on implementation).")) {
      try {
        await deleteDoc(doc(db, "gallery_folders", folderId));
        // Optional: Update all photos in this folder to have folderId: null
        fetchFolders();
      } catch (error) {
        console.error("Error deleting folder:", error);
      }
    }
  };

  const handleUpload = async (uploadedFiles) => {
    try {
      for (const file of uploadedFiles) {
        await addDoc(collection(db, "gallery"), {
          url: file.url,
          name: file.name,
          folderId: currentFolder ? currentFolder.id : null,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      fetchPhotos();
    } catch (error) {
      console.error("Error saving photo:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        await deleteDoc(doc(db, "gallery", id));
        fetchPhotos();
      } catch (error) {
        console.error("Error deleting photo:", error);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {currentFolder && (
            <Button onClick={() => setCurrentFolder(null)} variant="ghost" className="text-white/60 hover:text-white p-2">
              <ArrowLeft size={24} />
            </Button>
          )}
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
              {currentFolder ? currentFolder.name : 'Gallery Manager'}
            </h1>
            {currentFolder && <p className="text-white/40 font-mono text-sm">Folder</p>}
          </div>
        </div>
        <div className="flex gap-3">
          {!currentFolder && (
            <Button onClick={handleCreateFolder} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Folder size={18} className="mr-2" /> New Folder
            </Button>
          )}
          <Button onClick={() => setIsModalOpen(true)} className="bg-schurr-green text-white border-0 hover:bg-schurr-green/80">
            + Add Photos
          </Button>
        </div>
      </div>

      {/* Folders Grid (Only show in root) */}
      {!currentFolder && folders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white/60 font-bold uppercase text-sm mb-4">Folders</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {folders.map(folder => (
              <div
                key={folder.id}
                onClick={() => setCurrentFolder(folder)}
                className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer group flex flex-col items-center justify-center aspect-[4/3]"
              >
                <Folder size={48} className="text-schurr-green mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-white font-bold text-center truncate w-full">{folder.name}</span>
                <button
                  onClick={(e) => handleDeleteFolder(folder.id, e)}
                  className="mt-2 p-1 text-white/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div>
        <h2 className="text-white/60 font-bold uppercase text-sm mb-4">
          {photos.length} Photos {currentFolder ? `in ${currentFolder.name}` : ''}
        </h2>

        {loading ? (
          <div className="text-white/40 text-center py-20 font-mono">Loading photos...</div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10">
                <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDelete(photo.id)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 p-8 rounded-2xl">
            <div onClick={() => setIsModalOpen(true)} className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-schurr-green/50 hover:bg-white/5 transition-all cursor-pointer group">
              <Image size={48} className="mx-auto mb-4 text-white/20 group-hover:text-schurr-green transition-colors" />
              <h3 className="text-xl font-bold mb-2 text-white">No photos yet</h3>
              <p className="text-white/40 mb-6 font-mono text-sm">Upload photos to this {currentFolder ? 'folder' : 'gallery'}</p>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">Add Photos</Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Photos to ${currentFolder ? currentFolder.name : 'Gallery'}`}
      >
        <UploadModal
          type="gallery"
          onSubmit={handleUpload}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </motion.div>
  );
};

const AICopilotView = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-8">AI Co-Pilot</h1>
      <AITextTool />
    </motion.div>
  );
};

const SettingsView = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ProtectedRoute will handle redirect to login
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-8">Settings</h1>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-schurr-green to-schurr-darkGreen rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-schurr-green/20">
            A
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Admin User</h2>
            <p className="text-white/40 font-mono">admin@schurrchronicles.com</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Display Name</label>
            <input
              type="text"
              defaultValue="Admin User"
              className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-schurr-green focus:ring-1 focus:ring-schurr-green transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-white/60 mb-2">Email Address</label>
            <input
              type="email"
              defaultValue="admin@schurrchronicles.com"
              disabled
              className="w-full p-3 bg-black/20 border border-white/10 rounded-xl text-white/40 cursor-not-allowed"
            />
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end">
            <Button className="bg-schurr-green text-white hover:bg-schurr-green/80 border-0">
              Save Changes
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-white font-bold mb-4">Account Actions</h3>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-red-500 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/50"
          >
            <LogOut size={18} className="mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default Admin;
