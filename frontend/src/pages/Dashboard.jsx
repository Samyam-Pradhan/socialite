import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Hash, MessageSquare, Bookmark, User,
  Bell, Heart, MessageCircle, Share2,
  Plus, Search, TrendingUp, LogOut, X, Send,
  Feather, Flame, Clock
} from "lucide-react";
import axios from "axios";
import Profile from "./Profile";

const API_URL = "http://localhost:8000";
const BRAND_COLOR = "#762EF8";

const Avatar = ({ className = "w-10 h-10", initials = "?" }) => (
  <div className={`${className} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border-2 border-white shadow-sm shrink-0`}>
    {initials}
  </div>
);

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

// ── Comments Modal ────────────────────────────────────────────────────────
const CommentsModal = ({ post, onClose, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => { if (post) loadComments(); }, [post]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${API_URL}/posts/${post.id}/comments`,
        { content: newComment, post_id: post.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([res.data, ...comments]);
      setNewComment("");
      onCommentAdded?.();
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-indigo-100 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl shadow-indigo-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-50">
          <span className="font-bold text-slate-900 tracking-tight">Comments</span>
          <button onClick={onClose} className="p-1.5 hover:bg-indigo-50 rounded-full transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="px-6 py-4 border-b border-indigo-50 bg-indigo-50/30">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9" initials={getInitials(post.user_name)} />
            <div>
              <span className="text-sm font-semibold text-slate-900">{post.user_name}</span>
              <p className="text-sm text-slate-600 mt-0.5">{post.content}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-t-transparent" style={{ borderColor: `${BRAND_COLOR}33`, borderTopColor: BRAND_COLOR }} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle size={32} className="mx-auto text-indigo-200 mb-2" />
              <p className="text-sm text-slate-400">No comments yet.</p>
            </div>
          ) : comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="w-8 h-8" initials={getInitials(c.user_name)} />
              <div className="flex-1 bg-indigo-50/40 rounded-xl px-4 py-3 border border-indigo-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-900">{c.user_name}</span>
                  <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-indigo-50 flex gap-3">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 bg-indigo-50/40 border border-indigo-100 rounded-full px-4 py-2.5 text-sm text-slate-700 placeholder:text-indigo-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
            disabled={isSubmitting}
          />
          <button type="submit" disabled={!newComment.trim() || isSubmitting}
            className={`p-2.5 rounded-full transition-all ${newComment.trim() && !isSubmitting ? "text-white shadow-md shadow-indigo-200" : "bg-indigo-50 text-indigo-300 cursor-not-allowed"}`}
            style={newComment.trim() && !isSubmitting ? { backgroundColor: BRAND_COLOR } : {}}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");
  const [feedMode, setFeedMode] = useState("latest");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("user_email");
  const currentUserName = localStorage.getItem("user_name") || "User";
  const initials = getInitials(currentUserName);

  const handleAuthError = () => {
    ["token", "token_type", "user_email", "user_name"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  useEffect(() => { if (!token) navigate("/"); }, [token]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(res.data);
    } catch (e) { if (e.response?.status === 401) handleAuthError(); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`${API_URL}/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: res.data.likes, is_liked: res.data.liked } : p));
    } catch (e) { if (e.response?.status === 401) handleAuthError(); }
  };

  const handlePost = async () => {
    if (!postText.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/posts/`, { content: postText, tag: "General" }, { headers: { Authorization: `Bearer ${token}` } });
      setPosts([res.data, ...posts]);
      setPostText("");
    } catch (e) { if (e.response?.status === 401) handleAuthError(); }
  };

  const handleShare = async (postId) => {
    try {
      const res = await axios.post(`${API_URL}/posts/${postId}/share`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: res.data.shares } : p));
    } catch (e) { if (e.response?.status === 401) handleAuthError(); }
  };

  const handleLogout = () => {
    ["token", "token_type", "user_email", "user_name"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  const formatDate = (ds) => {
    if (!ds) return "just now";
    const diff = Date.now() - new Date(ds);
    const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m`;
    if (h < 24) return `${h}h`;
    if (d === 1) return "yesterday";
    if (d < 7) return `${d}d`;
    return new Date(ds).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const NAV = [
    { id: "home", label: "Home", icon: Home },
    { id: "explore", label: "Explore", icon: Hash },
    { id: "messages", label: "Messages", icon: MessageSquare, badge: 3 },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "profile", label: "Profile", icon: User },
  ];

  const TRENDING = ["#WebDev", "#AIart", "#Socialite", "#Design"];

  const userPosts = posts.filter(p => p.user_email === currentUserEmail);
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

  if (activeNav === "profile") {
    return <Profile onBackToDashboard={() => setActiveNav("home")} />;
  }

  return (
    <div className="flex min-h-screen bg-white text-slate-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .feed-scroll::-webkit-scrollbar { width: 3px; }
        .feed-scroll::-webkit-scrollbar-track { background: transparent; }
        .feed-scroll::-webkit-scrollbar-thumb { background: #c7d2fe; border-radius: 10px; }
        .post-action-btn { transition: transform 0.15s ease, color 0.15s ease; }
        .post-action-btn:hover { transform: scale(1.15); }
        .nav-item { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
        .liked-heart { animation: heartPop 0.3s ease; }
        @keyframes heartPop { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 100%{transform:scale(1)} }
        .composer-input::placeholder { color: #a5b4fc; }
        .brand-glow { box-shadow: 0 4px 24px rgba(118, 46, 248, 0.18); }
      `}</style>

      {showComments && (
        <CommentsModal post={selectedPost} onClose={() => { setShowComments(false); setSelectedPost(null); }} onCommentAdded={fetchPosts} />
      )}

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-72 h-screen sticky top-0 bg-white border-r border-indigo-50 flex flex-col" style={{ minWidth: '18rem' }}>
        <div className="flex-1 px-5 pt-7 flex flex-col">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: BRAND_COLOR, boxShadow: `0 10px 15px -3px ${BRAND_COLOR}44` }}>
              <Feather size={18} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: BRAND_COLOR }}>Socialite</span>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV.map(item => {
              const isActive = activeNav === item.id;
              return (
                <button key={item.id} onClick={() => setActiveNav(item.id)}
                  className={`nav-item w-full flex items-center gap-4 px-4 py-3 rounded-2xl ${
                    isActive
                      ? "text-white shadow-md"
                      : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                  style={isActive ? { backgroundColor: BRAND_COLOR, boxShadow: `0 4px 6px -1px ${BRAND_COLOR}33` } : {}}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className={`font-${isActive ? "bold" : "semibold"} text-sm flex-1 text-left`}>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-6 mb-2 flex flex-col gap-2">
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-indigo-50 transition-colors">
              <LogOut size={15} />
              Sign out
            </button>
            <button onClick={() => navigate("/new-post")}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 text-white rounded-2xl font-bold text-sm transition-all shadow-lg brand-glow"
              style={{ backgroundColor: BRAND_COLOR }}>
              <Plus size={18} strokeWidth={2.5} />
              New Post
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN FEED ── */}
      <main className="flex-1 min-h-screen bg-white border-r border-indigo-50" style={{ maxWidth: '680px' }}>
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-indigo-50 px-7 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight capitalize">{activeNav}</h1>
          <div className="flex items-center gap-3">
            {activeNav === "home" && (
              <div className="flex bg-indigo-50 border border-indigo-100 rounded-xl p-0.5">
                <button onClick={() => setFeedMode("latest")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${feedMode === "latest" ? "bg-white shadow-sm" : "text-slate-400 hover:text-indigo-500"}`}
                  style={feedMode === "latest" ? { color: BRAND_COLOR } : {}}>
                  <Clock size={11} />
                  Latest
                </button>
                <button onClick={() => setFeedMode("trending")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${feedMode === "trending" ? "bg-white shadow-sm" : "text-slate-400 hover:text-indigo-500"}`}
                  style={feedMode === "trending" ? { color: BRAND_COLOR } : {}}>
                  <Flame size={11} />
                  Hot
                </button>
              </div>
            )}
            <button className="relative p-2.5 text-slate-400 hover:bg-indigo-50 rounded-xl transition-colors" style={{ hover: { color: BRAND_COLOR } }}>
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full ring-2 ring-white" style={{ backgroundColor: BRAND_COLOR }} />
            </button>
          </div>
        </header>

        {/* Composer */}
        {activeNav === "home" && (
          <div className="px-7 py-6 border-b border-indigo-50">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10 mt-0.5" initials={initials} />
              <div className="flex-1">
                <textarea
                  value={postText}
                  onChange={e => setPostText(e.target.value)}
                  placeholder={`What's on your mind, ${currentUserName.split(" ")[0]}?`}
                  className="composer-input w-full bg-transparent text-slate-700 text-base leading-relaxed resize-none outline-none min-h-[4rem]"
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-indigo-50">
                  <span className="text-xs font-medium text-indigo-300">
                    {postText.length > 0 ? `${postText.length} / 280` : ""}
                  </span>
                  <button onClick={handlePost} disabled={!postText.trim()}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${postText.trim() ? "text-white shadow-md shadow-indigo-200" : "bg-indigo-50 text-indigo-300 cursor-not-allowed"}`}
                    style={postText.trim() ? { backgroundColor: BRAND_COLOR } : {}}>
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feed content */}
        <div>
          {activeNav === "home" && (
            <>
              {isLoading ? (
                <div className="py-20 text-center">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-t-transparent" style={{ borderColor: `${BRAND_COLOR}33`, borderTopColor: BRAND_COLOR }} />
                  <p className="mt-4 text-sm font-medium text-indigo-300">Loading feed…</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Feather size={28} className="text-indigo-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No posts yet. Be the first!</p>
                </div>
              ) : posts.map((post) => (
                <article key={post.id}
                  className="px-7 py-6 border-b border-indigo-50 hover:bg-indigo-50/20 transition-colors group">
                  <div className="flex gap-4">
                    <Avatar className="w-10 h-10 mt-0.5" initials={getInitials(post.user_name)} />
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">{post.user_name}</span>
                          <span className="text-indigo-300 text-xs">·</span>
                          <span className="text-slate-400 text-xs font-medium">@{post.user_name?.toLowerCase().replace(/\s+/g, "")}</span>
                          <span className="text-indigo-300 text-xs">·</span>
                          <span className="text-slate-400 text-xs">{formatDate(post.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full" style={{ color: BRAND_COLOR }}>
                            {post.tag || "General"}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-slate-700 text-[15px] leading-relaxed mb-4">{post.content}</p>

                      {/* Actions */}
                      <div className="flex items-center gap-6">
                        <button onClick={() => handleLike(post.id)}
                          className={`post-action-btn flex items-center gap-2 text-xs font-semibold transition-colors ${post.is_liked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"}`}>
                          <Heart size={16} fill={post.is_liked ? "currentColor" : "none"} className={post.is_liked ? "liked-heart" : ""} />
                          {post.likes || 0}
                        </button>
                        <button onClick={() => { setSelectedPost(post); setShowComments(true); }}
                          className="post-action-btn flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors">
                          <MessageCircle size={16} />
                          {post.comments || 0}
                        </button>
                        <button onClick={() => handleShare(post.id)}
                          className="post-action-btn flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors">
                          <Share2 size={16} />
                          {post.shares || 0}
                        </button>
                        <button className="post-action-btn ml-auto text-slate-400 hover:text-indigo-600 transition-colors">
                          <Bookmark size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </>
          )}
          {/* ... other nav states ... */}
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col flex-1 px-7 py-7 gap-6 h-screen sticky top-0 bg-white min-w-[280px]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={17} />
          <input
            className="w-full bg-indigo-50/60 border border-indigo-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-indigo-300 outline-none focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 transition-all font-medium"
            placeholder="Search Socialite…"
          />
        </div>

        <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
            <TrendingUp size={14} style={{ color: BRAND_COLOR }} />
            Trending
          </h3>
          <div className="space-y-3">
            {TRENDING.map((tag, i) => (
              <div key={tag} className="group cursor-pointer flex items-center justify-between py-1.5">
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{tag}</p>
                  <p className="text-[11px] text-indigo-300 font-medium mt-0.5">24.5K posts</p>
                </div>
                <span className="text-xs font-bold text-indigo-200">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-4">Your Stats</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              ["1,240", "Followers"],
              ["380", "Following"],
              [String(userPosts.length), "Posts"],
              [String(totalLikes), "Likes"]
            ].map(([val, label]) => (
              <div key={label} className="bg-white border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-xl font-extrabold" style={{ color: BRAND_COLOR }}>{val}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-auto">
          <p className="text-[11px] text-indigo-300 font-medium">© 2026 Socialite · Privacy · Terms</p>
        </footer>
      </aside>
    </div>
  );
}