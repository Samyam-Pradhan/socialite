import React, { useState, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000";
const BRAND_COLOR = "#762EF8";

const getInitials = (name = "") =>
  name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

const Avatar = ({ className = "w-10 h-10", initials = "?" }) => (
  <div className={`${className} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border-2 border-white shadow-sm shrink-0`}>
    {initials}
  </div>
);

export default function CommentModal({ post, onClose, onCommentAdded }) {
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
        headers: { Authorization: `Bearer ${token}` },
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
    <div
      className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-indigo-100 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl shadow-indigo-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-50">
          <span className="font-bold text-slate-900 tracking-tight">Comments</span>
          <button onClick={onClose} className="p-1.5 hover:bg-indigo-50 rounded-full transition-colors">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Original post */}
        <div className="px-6 py-4 border-b border-indigo-50 bg-indigo-50/30">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9" initials={getInitials(post.user_name)} />
            <div>
              <span className="text-sm font-semibold text-slate-900">{post.user_name}</span>
              <p className="text-sm text-slate-600 mt-0.5">{post.content}</p>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div
                className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                style={{ borderColor: `${BRAND_COLOR}33`, borderTopColor: BRAND_COLOR }}
              />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle size={32} className="mx-auto text-indigo-200 mb-2" />
              <p className="text-sm text-slate-400">No comments yet.</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-8 h-8" initials={getInitials(c.user_name)} />
                <div className="flex-1 bg-indigo-50/40 rounded-xl px-4 py-3 border border-indigo-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-900">{c.user_name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-indigo-50 flex gap-3">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 bg-indigo-50/40 border border-indigo-100 rounded-full px-4 py-2.5 text-sm text-slate-700 placeholder:text-indigo-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className={`p-2.5 rounded-full transition-all ${
              newComment.trim() && !isSubmitting
                ? "text-white shadow-md"
                : "bg-indigo-50 text-indigo-300 cursor-not-allowed"
            }`}
            style={newComment.trim() && !isSubmitting ? { backgroundColor: BRAND_COLOR } : {}}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}