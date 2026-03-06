import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, Hash, MessageSquare, Bookmark, User,
  Settings, Bell, Heart, MessageCircle, Share2,
  Plus, Search, TrendingUp, LogOut, X, Send, Trash2,
  Feather, Flame, Clock
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000";

// ── Avatar ────────────────────────────────────────────────────────────────
const Avatar = ({ className = "w-10 h-10", initials = "?" }) => (
  <div className={`${className} rounded-full bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-semibold text-xs border-2 border-white shadow-sm shrink-0`}>
    {initials}
  </div>
);

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

// ── Delete Modal ──────────────────────────────────────────────────────────
const DeleteConfirmModal = ({ post, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(post.id);
    setIsDeleting(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-7 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Delete this post?</h3>
        <p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p>
        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
          <p className="text-slate-600 text-sm line-clamp-2">{post.content}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50">
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <span className="font-bold text-slate-800 tracking-tight">Comments</span>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        {/* Post preview */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9" initials={getInitials(post.user_name)} />
            <div>
              <span className="text-sm font-semibold text-slate-800">{post.user_name}</span>
              <p className="text-sm text-slate-600 mt-0.5">{post.content}</p>
            </div>
          </div>
        </div>
        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm text-slate-400">No comments yet.</p>
            </div>
          ) : comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="w-8 h-8" initials={getInitials(c.user_name)} />
              <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-slate-800">{c.user_name}</span>
                  <span className="text-[10px] text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
            disabled={isSubmitting}
          />
          <button type="submit" disabled={!newComment.trim() || isSubmitting}
            className={`p-2.5 rounded-full transition-all ${newComment.trim() && !isSubmitting ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
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
  const [postToDelete, setPostToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (e) {
      if (e.response?.status === 401) handleAuthError();
      else alert(e.response?.status === 403 ? "You can only delete your own posts" : "Failed to delete post");
    }
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

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">

      {showDeleteConfirm && postToDelete && (
        <DeleteConfirmModal post={postToDelete} onClose={() => { setShowDeleteConfirm(false); setPostToDelete(null); }} onDelete={handleDelete} />
      )}
      {showComments && (
        <CommentsModal post={selectedPost} onClose={() => { setShowComments(false); setSelectedPost(null); }} onCommentAdded={fetchPosts} />
      )}

      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col p-5">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2 pt-1">
          <div className="w-8 h-8 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Feather size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Socialite
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                activeNav === item.id
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}>
              <item.icon size={19} strokeWidth={activeNav === item.id ? 2.5 : 1.8} />
              <span className="font-semibold text-sm flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* New Post */}
        <button onClick={() => navigate("/new-post")}
          className="flex items-center justify-center gap-2 w-full py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all mb-5 shadow-md shadow-indigo-200">
          <Plus size={17} strokeWidth={2.5} />
          New Post
        </button>

        {/* User Box - Separate Box */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9" initials={initials} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{currentUserName}</p>
              <p className="text-xs text-slate-500 truncate">@{(currentUserEmail || "user").split("@")[0]}</p>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Logout Button - Separate Box */}
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* ── MAIN FEED ── */}
      <main className="flex-1 max-w-xl border-r border-slate-200 min-h-screen bg-white">

        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Home</h1>
          <div className="flex items-center gap-3">
            {/* Feed toggle */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button onClick={() => setFeedMode("latest")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${feedMode === "latest" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Clock size={11} />
                Latest
              </button>
              <button onClick={() => setFeedMode("trending")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${feedMode === "trending" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <Flame size={11} />
                Hot
              </button>
            </div>
            <button className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
            </button>
          </div>
        </header>

        {/* Composer */}
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9 mt-0.5" initials={initials} />
            <div className="flex-1">
              <textarea
                value={postText}
                onChange={e => setPostText(e.target.value)}
                placeholder={`What's happening, ${currentUserName.split(" ")[0]}?`}
                className="w-full bg-transparent text-slate-700 placeholder:text-slate-400 text-[15px] leading-relaxed resize-none outline-none min-h-15"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">{postText.length > 0 ? `${postText.length} chars` : ""}</span>
                <button onClick={handlePost} disabled={!postText.trim()}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${postText.trim() ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div>
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-3 text-sm text-slate-500">Loading feed…</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center">
              <Feather size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No posts yet. Be the first!</p>
            </div>
          ) : posts.map((post) => (
            <article key={post.id}
              className="px-6 py-5 border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
              <div className="flex gap-3">
                <Avatar className="w-9 h-9 mt-0.5" initials={getInitials(post.user_name)} />
                <div className="flex-1 min-w-0">
                  {/* Meta row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-semibold text-slate-800 text-sm">{post.user_name}</span>
                      <span className="text-slate-500 text-xs ml-2">@{post.user_name?.toLowerCase().replace(/\s+/g, "")} · {formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                        {post.tag || "General"}
                      </span>
                      {post.user_email === currentUserEmail && (
                        <button onClick={() => { setPostToDelete(post); setShowDeleteConfirm(true); }}
                          className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-slate-700 text-[15px] leading-relaxed mb-4">{post.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-5">
                    <button onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${post.is_liked ? "text-rose-500" : "text-slate-500 hover:text-rose-500"}`}>
                      <Heart size={15} fill={post.is_liked ? "currentColor" : "none"} />
                      {post.likes || 0}
                    </button>
                    <button onClick={() => { setSelectedPost(post); setShowComments(true); }}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                      <MessageCircle size={15} />
                      {post.comments || 0}
                    </button>
                    <button onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-green-600 transition-colors">
                      <Share2 size={15} />
                      {post.shares || 0}
                    </button>
                    <button className="ml-auto text-slate-400 hover:text-indigo-600 transition-colors">
                      <Bookmark size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-80 p-6 gap-6 h-screen sticky top-0 bg-white">

        {/* Search - Larger */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-base text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
            placeholder="Search Socialite…"
          />
        </div>

        {/* Trending - Larger without numbers */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            Trending
          </h3>
          <div className="space-y-4">
            {TRENDING.map((tag) => (
              <div key={tag} className="group cursor-pointer">
                <p className="text-base font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{tag}</p>
                <p className="text-xs text-slate-500 mt-1">24.5K posts</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats - Larger */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-5">Your Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            {[["1,240", "Followers"], ["380", "Following"], [String(posts.filter(p => p.user_email === currentUserEmail).length), "Posts"], ["4.2K", "Impressions"]].map(([val, label]) => (
              <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 text-center">
                <p className="text-xl font-bold text-indigo-600">{val}</p>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="mt-auto text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 Socialite · Privacy · Terms</p>
        </footer>
      </aside>
    </div>
  );
}