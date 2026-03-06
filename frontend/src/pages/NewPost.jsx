import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Feather, Send } from "lucide-react";
import axios from "axios";

const API_URL = 'http://localhost:8000';
const TAGS = ["General", "Tech", "Photography", "Travel", "Design", "Life", "Art"];

export default function NewPost() {
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("General");
  const [customTag, setCustomTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const MAX_CHARS = 500;
  const currentUserName = localStorage.getItem("user_name") || "User";
  const token = localStorage.getItem("token");
  const firstName = currentUserName.split(" ")[0];
  const initials = currentUserName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const charCount = content.length;
  const remaining = MAX_CHARS - charCount;
  const activeTag = customTag || tag;

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      await axios.post(
        `${API_URL}/posts/`,
        { content, tag: activeTag },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const remainingColor =
    remaining < 50 ? "text-rose-500" :
    remaining < 150 ? "text-amber-500" :
    "text-slate-400";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* Sticky Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          New Post
        </span>

        <div className="w-20"></div> {/* Spacer for alignment */}
      </header>

      {/* Main Body */}
      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Author Row */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-linear-to-br from-indigo-100 to-purple-100 flex items-center justify-center rounded-full text-indigo-500 border-2 border-white shadow-sm">
            <span className="text-sm font-semibold">{initials}</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{currentUserName}</p>
            <p className="text-sm text-slate-500 mt-1">
              Creating a new post · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-200" />
          <Feather size={16} className="text-indigo-400" />
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Textarea Card */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-6 focus-within:border-indigo-400 shadow-sm transition-all duration-300">
          <textarea
            className="w-full bg-transparent outline-none resize-none text-lg leading-relaxed text-slate-700 placeholder:text-slate-400 min-h-50"
            placeholder={`What's on your mind, ${firstName}?`}
            value={content}
            maxLength={MAX_CHARS}
            autoFocus
            onChange={e => setContent(e.target.value)}
          />
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
            <span className={`text-xs font-medium tabular-nums transition-colors ${remainingColor}`}>
              {remaining} / {MAX_CHARS}
            </span>
            
            {/* Post Button - Right side below text field */}
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isLoading}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm
                ${content.trim() && !isLoading
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tag Section */}
        <div className="mt-8">
          <p className="text-sm font-semibold text-slate-700 mb-4">
            Choose a topic
          </p>

          {/* Preset Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TAGS.map(t => (
              <button
                key={t}
                onClick={() => { setTag(t); setCustomTag(""); }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200
                  ${tag === t && !customTag
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Custom Tag Input - In a box */}
          <div className="relative">
            <input
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 pr-20 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Or add a custom tag..."
              value={customTag}
              onChange={e => setCustomTag(e.target.value)}
            />
            {customTag && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded-full">
                  #{customTag}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}