import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, Share2, Bookmark, Feather, Flame, Clock } from "lucide-react";
import axios from "axios";
import CommentModal from "./Commentmodal";

const API_URL = "http://localhost:8000";
const BRAND_COLOR = "#762EF8";

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

const Avatar = ({ className = "w-10 h-10", initials = "?" }) => (
  <div className={`${className} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border-2 border-white shadow-sm shrink-0`}>
    {initials}
  </div>
);

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

export default function Feed({ activeNav, posts, setPosts, isLoading, onPostCreated }) {
  const [postText, setPostText]     = useState("");
  const [feedMode, setFeedMode]     = useState("latest");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);

  const navigate = useNavigate();
  const token           = localStorage.getItem("token");
  const currentUserName = localStorage.getItem("user_name") || "User";
  const initials        = getInitials(currentUserName);

  const handleAuthError = () => {
    ["token", "token_type", "user_email", "user_name"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  const handleLike = async (postId) => {
    try {
      const res = await axios.post(
        `${API_URL}/posts/${postId}/like`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, likes: res.data.likes, is_liked: res.data.liked } : p)
      );
    } catch (e) { if (e.response?.status === 401) handleAuthError(); }
  };

  const handlePost = async () => {
    if (!postText.trim()) return;
    try {
      const res = await axios.post(
        `${API_URL}/posts/`,
        { content: postText, tag: "General" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prev => [res.data, ...prev]);
      setPostText("");
      onPostCreated?.();
    } catch (e) { if (e.response?.status === 401) handleAuthError(); }
  };

  const handleShare = async (postId) => {
    try {
      const res = await axios.post(
        `${API_URL}/posts/${postId}/share`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, shares: res.data.shares } : p)
      );
    } catch (e) { if (e.response?.status === 401) handleAuthError(); }
  };

  return (
    <main
      className="flex-1 min-h-screen bg-white border-r border-indigo-50"
      style={{ maxWidth: "680px" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-indigo-50 px-7 py-4 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight capitalize">{activeNav}</h1>
        <div className="flex items-center gap-3">
          {activeNav === "home" && (
            <div className="flex bg-indigo-50 border border-indigo-100 rounded-xl p-0.5">
              <button
                onClick={() => setFeedMode("latest")}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  feedMode === "latest" ? "bg-white shadow-sm" : "text-slate-400 hover:text-indigo-500"
                }`}
                style={feedMode === "latest" ? { color: BRAND_COLOR } : {}}
              >
                <Clock size={11} /> Latest
              </button>
              <button
                onClick={() => setFeedMode("trending")}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  feedMode === "trending" ? "bg-white shadow-sm" : "text-slate-400 hover:text-indigo-500"
                }`}
                style={feedMode === "trending" ? { color: BRAND_COLOR } : {}}
              >
                <Flame size={11} /> Hot
              </button>
            </div>
          )}
          <button className="relative p-2.5 text-slate-400 hover:bg-indigo-50 rounded-xl transition-colors">
            <Bell size={18} />
            <span
              className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full ring-2 ring-white"
              style={{ backgroundColor: BRAND_COLOR }}
            />
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
                className="composer-input w-full bg-transparent text-slate-700 text-base leading-relaxed resize-none outline-none min-h-16"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-indigo-50">
                <span className="text-xs font-medium text-indigo-300">
                  {postText.length > 0 ? `${postText.length} / 280` : ""}
                </span>
                <button
                  onClick={handlePost}
                  disabled={!postText.trim()}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    postText.trim() ? "text-white shadow-md" : "bg-indigo-50 text-indigo-300 cursor-not-allowed"
                  }`}
                  style={postText.trim() ? { backgroundColor: BRAND_COLOR } : {}}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {activeNav === "home" && (
        <>
          {isLoading ? (
            <div className="py-20 text-center">
              <div
                className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-t-transparent"
                style={{ borderColor: `${BRAND_COLOR}33`, borderTopColor: BRAND_COLOR }}
              />
              <p className="mt-4 text-sm font-medium text-indigo-300">Loading feed…</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Feather size={28} className="text-indigo-400" />
              </div>
              <p className="text-slate-500 font-medium">No posts yet. Be the first!</p>
            </div>
          ) : (
            posts.map(post => (
              <article
                key={post.id}
                className="px-7 py-6 border-b border-indigo-50 hover:bg-indigo-50/20 transition-colors group"
              >
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10 mt-0.5" initials={getInitials(post.user_name)} />
                  <div className="flex-1 min-w-0">

                    {/* Meta row */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{post.user_name}</span>
                        <span className="text-indigo-300 text-xs">·</span>
                        <span className="text-slate-400 text-xs font-medium">
                          @{post.user_name?.toLowerCase().replace(/\s+/g, "")}
                        </span>
                        <span className="text-indigo-300 text-xs">·</span>
                        <span className="text-slate-400 text-xs">{formatDate(post.created_at)}</span>
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full shrink-0"
                        style={{ color: BRAND_COLOR }}
                      >
                        {post.tag || "General"}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-slate-700 text-[15px] leading-relaxed mb-4">{post.content}</p>

                    {/* Action row */}
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`post-action-btn flex items-center gap-2 text-xs font-semibold transition-colors ${
                          post.is_liked ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
                        }`}
                      >
                        <Heart size={16} fill={post.is_liked ? "currentColor" : "none"} className={post.is_liked ? "liked-heart" : ""} />
                        {post.likes || 0}
                      </button>
                      <button
                        onClick={() => { setSelectedPost(post); setShowComments(true); }}
                        className="post-action-btn flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <MessageCircle size={16} />
                        {post.comments || 0}
                      </button>
                      <button
                        onClick={() => handleShare(post.id)}
                        className="post-action-btn flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors"
                      >
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
            ))
          )}
        </>
      )}

      {/* Other nav placeholder states */}
      {activeNav === "explore" && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-slate-500 font-medium">Explore trending topics and posts</p>
        </div>
      )}
      {activeNav === "messages" && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-slate-500 font-medium">Your messages will appear here</p>
        </div>
      )}
      {activeNav === "bookmarks" && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔖</span>
          </div>
          <p className="text-slate-500 font-medium">Your saved posts will appear here</p>
        </div>
      )}

      {/* Comment modal */}
      {showComments && (
        <CommentModal
          post={selectedPost}
          onClose={() => { setShowComments(false); setSelectedPost(null); }}
          onCommentAdded={() => {/* parent can refetch if needed */}}
        />
      )}
    </main>
  );
}