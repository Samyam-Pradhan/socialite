import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Hash, Feather, X, Sparkles, HelpCircle } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8000";
const TAGS = ["General", "Tech", "Photography", "Travel", "Design", "Life", "Art", "Music", "Food"];
const MAX_CHARS = 500;

const P    = "#6322D9";
const PL   = "#8A4DFF";
const PD   = "#4A1AA8";
const PBG  = "rgba(99,34,217,0.07)";
const PBR  = "rgba(99,34,217,0.18)";
const PGL  = "rgba(99,34,217,0.22)";

const TAG_COLORS = [
  { bg: "rgba(99,34,217,0.08)",  border: "rgba(99,34,217,0.2)",  color: "#6322D9" },
  { bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.2)",  color: "#8B5CF6" },
  { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.25)", color: "#A855F7" },
  { bg: "rgba(192,132,252,0.08)",  border: "rgba(192,132,252,0.2)",  color: "#C084FC" },
  { bg: "rgba(109,40,217,0.08)",  border: "rgba(109,40,217,0.2)",  color: "#6D28D9" },
  { bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.25)", color: "#7C3AED" },
];

export default function NewPost() {
  const [content,   setContent]   = useState("");
  const [tag,       setTag]       = useState("General");
  const [customTag, setCustomTag] = useState("");
  const [loading,   setLoading]   = useState(false);
  const [focused,   setFocused]   = useState(false);
  const navigate = useNavigate();

  const token           = localStorage.getItem("token");
  const currentUserName = localStorage.getItem("user_name") || "User";
  const firstName       = currentUserName.split(" ")[0];
  const initials        = currentUserName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const activeTag       = customTag || tag;
  const remaining       = MAX_CHARS - content.length;
  const pct             = (content.length / MAX_CHARS) * 100;
  const canPost         = content.trim().length > 0 && !loading;

  useEffect(() => { if (!token) navigate("/"); }, [token, navigate]);

  const handleSubmit = async () => {
    if (!canPost) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/posts/`, { content, tag: activeTag },
        { headers: { Authorization: `Bearer ${token}` } });
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  /* ring color for char counter */
  const ringColor = remaining < 50 ? "#EF4444" : remaining < 150 ? "#F59E0B" : P;

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="group flex items-center gap-2 bg-white border border-purple-100 rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#6322D9] hover:border-[#6322D9] hover:bg-purple-50/50 transition-all shadow-sm hover:shadow mb-6"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#6322D9] to-[#8A4DFF] flex items-center justify-center shadow-md shadow-purple-200">
            <Feather size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Post</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          
          {/* User header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-purple-50/30 to-transparent flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#6322D9] to-[#8A4DFF] flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-purple-200">
              {initials}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{currentUserName}</div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-US", { 
                  weekday: "long", 
                  month: "long", 
                  day: "numeric",
                  year: "numeric"
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200">
              <Hash size={12} className="text-[#6322D9]" />
              <span className="text-xs font-semibold text-[#6322D9]">{activeTag}</span>
            </div>
          </div>

          {/* Compose area */}
          <div className="p-6">
            <textarea
              autoFocus
              value={content}
              maxLength={MAX_CHARS}
              onChange={e => setContent(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={`What's on your mind, ${firstName}?`}
              className={`w-full min-h-50 p-4 text-gray-700 placeholder-gray-400 bg-gray-50 rounded-xl border transition-all resize-none outline-none ${
                focused 
                  ? 'border-[#6322D9] ring-2 ring-purple-100' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ fontSize: '16px', lineHeight: '1.6' }}
            />

            {/* Bottom bar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              {/* Character counter with progress */}
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <svg width={32} height={32} viewBox="0 0 32 32">
                    <circle cx={16} cy={16} r={13} fill="none" stroke="#E5E7EB" strokeWidth={2.5} />
                    <circle
                      cx={16} cy={16} r={13}
                      fill="none"
                      stroke={ringColor}
                      strokeWidth={2.5}
                      strokeDasharray={`${2 * Math.PI * 13}`}
                      strokeDashoffset={`${2 * Math.PI * 13 * (1 - pct / 100)}`}
                      strokeLinecap="round"
                      transform="rotate(-90 16 16)"
                      style={{ transition: "stroke-dashoffset 0.2s, stroke 0.3s" }}
                    />
                  </svg>
                </div>
                <span className={`text-xs font-medium ${
                  remaining < 50 ? 'text-red-500' : remaining < 150 ? 'text-amber-500' : 'text-gray-400'
                }`}>
                  {remaining} characters left
                </span>
              </div>

              {/* Post button */}
              <button
                onClick={handleSubmit}
                disabled={!canPost}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  canPost
                    ? 'bg-linear-to-r from-[#6322D9] to-[#8A4DFF] text-white shadow-md shadow-purple-200 hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width={16} height={16} viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 20" />
                    </svg>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tag Selection Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl mt-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-purple-50/30 to-transparent flex items-center gap-2">
            <Hash size={18} className="text-[#6322D9]" />
            <h2 className="font-semibold text-gray-800">Choose a topic</h2>
          </div>
          
          <div className="p-6">
            {/* Preset tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {TAGS.map((t, i) => {
                const tc = TAG_COLORS[i % TAG_COLORS.length];
                const isActive = tag === t && !customTag;
                return (
                  <button
                    key={t}
                    onClick={() => { setTag(t); setCustomTag(""); }}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#6322D9] text-white shadow-md shadow-purple-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-[#6322D9] hover:border-purple-200'
                    }`}
                    style={{
                      backgroundColor: isActive ? undefined : tc.bg,
                      color: isActive ? undefined : tc.color,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            {/* Custom tag input */}
            <div className="relative mt-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Hash size={16} />
              </div>
              <input
                value={customTag}
                onChange={e => setCustomTag(e.target.value.replace(/\s/g, ""))}
                placeholder="Or create a custom tag..."
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#6322D9] focus:ring-2 focus:ring-purple-100 transition-all"
              />
              {customTag && (
                <button
                  onClick={() => setCustomTag("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Helper text */}
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
              <HelpCircle size={12} className="text-gray-400" />
              Tags help others discover your posts. Choose one that fits your content.
            </p>
          </div>
        </div>

        {/* Quick tips (minimal) */}
        <div className="mt-4 text-xs text-gray-400 text-center flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Sparkles size={12} className="text-[#6322D9]" /> Be authentic
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="flex items-center gap-1">
            <Sparkles size={12} className="text-[#6322D9]" /> Stay focused
          </span>
        </div>
      </div>
    </div>
  );
}