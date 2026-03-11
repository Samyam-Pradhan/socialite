import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp } from "lucide-react";
import axios from "axios";

import Sidebar from "../components/Dashboard/Sidebar";
import Feed    from "../components/Dashboard/Feed";
import Profile from "./Profile";

const API_URL    = "http://localhost:8000";
const BRAND_COLOR = "#762EF8";

const TRENDING = ["#WebDev", "#AIart", "#Socialite", "#Design"];

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("home");
  const [posts,     setPosts]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const token           = localStorage.getItem("token");
  const currentUserEmail = localStorage.getItem("user_email");
  useEffect(() => { if (!token) navigate("/"); }, [token]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch (e) {
      if (e.response?.status === 401) {
        ["token", "token_type", "user_email", "user_name"].forEach(k => localStorage.removeItem(k));
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);
  const userPosts  = posts.filter(p => p.user_email === currentUserEmail);
  const totalLikes = userPosts.reduce((sum, p) => sum + (p.likes || 0), 0);

  if (activeNav === "profile") {
    return <Profile onBackToDashboard={() => setActiveNav("home")} />;
  }

  return (
    <div
      className="flex min-h-screen bg-white text-slate-900"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .nav-item         { transition: all 0.18s cubic-bezier(0.4,0,0.2,1); }
        .post-action-btn  { transition: transform 0.15s ease, color 0.15s ease; }
        .post-action-btn:hover { transform: scale(1.15); }
        .liked-heart      { animation: heartPop 0.3s ease; }
        .composer-input::placeholder { color: #a5b4fc; }
        @keyframes heartPop { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 100%{transform:scale(1)} }
      `}</style>

      {/* ── Left sidebar ── */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* ── Centre feed ── */}
      <Feed
        activeNav={activeNav}
        posts={posts}
        setPosts={setPosts}
        isLoading={isLoading}
        onPostCreated={fetchPosts}
      />

      {/* ── Right sidebar ── */}
      <aside className="hidden lg:flex flex-col flex-1 px-7 py-7 gap-6 h-screen sticky top-0 bg-white min-w-70">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={17} />
          <input
            className="w-full bg-indigo-50/60 border border-indigo-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-indigo-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
            placeholder="Search Socialite…"
          />
        </div>

        {/* Trending */}
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

        {/* Stats */}
        <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-4">
            Your Stats
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              ["1,240",              "Followers"],
              ["380",                "Following"],
              [String(userPosts.length), "Posts"],
              [String(totalLikes),   "Likes"],
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