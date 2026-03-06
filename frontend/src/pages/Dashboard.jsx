import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, Hash, MessageSquare, Bookmark, User, 
  Settings, Bell, Heart, MessageCircle, Share2, 
  Plus, Search, Image as ImageIcon, Smile, TrendingUp,
  LogOut
} from "lucide-react";
import axios from "axios";

// ── Default Avatar Component ──────────────────────────────────────────────
const DefaultAvatar = ({ className = "w-10 h-10" }) => (
  <div className={`${className} bg-indigo-100 flex items-center justify-center rounded-full text-indigo-500 border border-indigo-200 shrink-0`}>
    <User size={20} fill="currentColor" fillOpacity={0.2} />
  </div>
);

// ── Get user data from localStorage ───────────────────────────────────────
const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('user_email');
  const userName = localStorage.getItem('user_name');
  
  if (token && userEmail) {
    // Format the name properly (capitalize each word)
    const formatName = (name) => {
      if (!name) return "User";
      return name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    };

    // Get the formatted full name
    const fullName = formatName(userName || userEmail.split('@')[0]);

    return {
      name: fullName,
      username: `@${userEmail.split('@')[0].toLowerCase()}`,
      followers: 1240,
      following: 380,
      email: userEmail
    };
  }
  return {
    name: "Alex Rivera",
    username: "@alexrivera",
    followers: 1240,
    following: 380,
  };
};

const STORIES = [
  { id: 1, name: "Your Story", isOwn: true },
  { id: 2, name: "Jamie" },
  { id: 3, name: "Priya" },
  { id: 4, name: "Marcus" },
  { id: 5, name: "Sofia" },
  { id: 6, name: "Lena" },
];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [feedMode, setFeedMode] = useState("latest");
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();

  // Check if user is logged in, redirect to login if not
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/auth';
    }
  }, []);

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/posts/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("Fetched posts:", response.data); // Debug log
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts();
  }, []);

  const toggleLike = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:8000/posts/${id}/like`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, likes: response.data.likes } : p
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handlePost = async () => {
    if (!postText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/posts/',
        { content: postText, tag: "General" },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setPosts([response.data, ...posts]);
      setPostText("");
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.response?.data?.detail || 'Failed to create post');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    window.location.href = '/';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "just now";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
            S
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Socialite
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "explore", label: "Explore", icon: Hash },
            { id: "messages", label: "Messages", icon: MessageSquare, badge: 3 },
            { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
            { id: "profile", label: "Profile", icon: User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeNav === item.id 
                ? "bg-indigo-50 text-indigo-600" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <item.icon size={22} strokeWidth={activeNav === item.id ? 2.5 : 2} />
              <span className="font-semibold flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => navigate("/new-post")}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:opacity-90 transition-all mb-8"
        >
          <Plus size={20} />
          <span>New Post</span>
        </button>

        <div className="space-y-2">
          {/* User Profile Section */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <DefaultAvatar className="w-10 h-10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.username}</p>
            </div>
            <Settings size={18} className="text-slate-400 cursor-pointer hover:text-indigo-500" />
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN FEED ── */}
      <main className="flex-1 max-w-2xl border-r border-slate-200 bg-white min-h-screen">
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-slate-200 px-6 py-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-extrabold text-slate-800">Home</h1>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setFeedMode("latest")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${feedMode === "latest" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
                Latest
              </button>
              <button 
                onClick={() => setFeedMode("trending")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${feedMode === "trending" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"}`}>
                <TrendingUp size={14} />
                Trending
              </button>
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Stories */}
        <div className="flex gap-5 px-6 py-6 overflow-x-auto no-scrollbar border-b border-slate-100">
          {STORIES.map(s => (
            <div key={s.id} className="flex flex-col items-center gap-2 group cursor-pointer shrink-0">
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-400 to-fuchsia-600 group-hover:scale-105 transition-transform">
                <div className="bg-white p-0.5 rounded-full">
                  <DefaultAvatar className="w-14 h-14" />
                </div>
                {s.isOwn && (
                  <div className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-1 border-2 border-white text-white">
                    <Plus size={10} strokeWidth={4} />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 tracking-tight">{s.name}</span>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex gap-4">
            <DefaultAvatar className="w-11 h-11" />
            <div className="flex-1">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                className="w-full border-none focus:ring-0 text-lg resize-none placeholder:text-slate-400 text-slate-700 min-h-[60px]"
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <div className="flex gap-1">
                  <button className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"><ImageIcon size={19} /></button>
                  <button className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"><Smile size={19} /></button>
                </div>
                <button 
                  onClick={handlePost}
                  disabled={!postText.trim()}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    postText.trim() 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-slate-500">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-4">
                  <DefaultAvatar className="w-11 h-11" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{post.user_name}</span>
                        <span className="text-sm text-slate-400 font-medium">
                          @{post.user_name?.toLowerCase().replace(/\s+/g, '')} · {formatDate(post.created_at)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">
                        {post.tag || "General"}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-4">{post.content}</p>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Heart size={18} />
                        <span className="font-semibold">{post.likes || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-500 transition-colors">
                        <MessageCircle size={18} />
                        <span className="font-semibold">{post.comments || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-green-500 transition-colors">
                        <Share2 size={18} />
                        <span className="font-semibold">{post.shares || 0}</span>
                      </button>
                      <button className="ml-auto text-slate-300 hover:text-indigo-500">
                        <Bookmark size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-80 p-6 gap-6 h-screen sticky top-0">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all shadow-sm"
            placeholder="Search Socialite..."
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <h3 className="text-base font-extrabold mb-4 flex items-center gap-2 text-slate-800">
            <TrendingUp size={18} className="text-indigo-500" />
            Trending Now
          </h3>
          <div className="space-y-4">
            {["#WebDev", "#AIart", "#Socialite", "#Design"].map((tag, i) => (
              <div key={tag} className="flex justify-between items-center group cursor-pointer">
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{tag}</p>
                  <p className="text-[11px] text-slate-400 font-medium">24.5K posts</p>
                </div>
                <span className="text-lg font-black text-slate-100 group-hover:text-indigo-50">#{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <h3 className="text-base font-extrabold mb-4 text-slate-800">Your Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl text-center">
              <p className="text-xl font-black text-indigo-600">{currentUser.followers.toLocaleString()}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Followers</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl text-center">
              <p className="text-xl font-black text-indigo-600">{currentUser.following}</p>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Following</p>
            </div>
          </div>
        </div>

        <footer className="mt-auto text-center">
          <p className="text-xs text-slate-300 font-medium tracking-tight">
            © 2026 Socialite Inc. • Privacy • Terms
          </p>
        </footer>
      </aside>
    </div>
  );
}