import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Hash, MessageSquare, Bookmark, User, LogOut, Plus, Feather } from "lucide-react";

const BRAND_COLOR = "#762EF8";

const NAV = [
  { id: "home",      label: "Home",      icon: Home },
  { id: "explore",   label: "Explore",   icon: Hash },
  { id: "messages",  label: "Messages",  icon: MessageSquare, badge: 3 },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "profile",   label: "Profile",   icon: User },
];

export default function Sidebar({ activeNav, setActiveNav }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    ["token", "token_type", "user_email", "user_name"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  return (
    <aside
      className="w-72 h-screen sticky top-0 bg-white border-r border-indigo-50 flex flex-col"
      style={{ minWidth: "18rem" }}
    >
      <div className="flex-1 px-5 pt-7 flex flex-col">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: BRAND_COLOR, boxShadow: `0 10px 15px -3px ${BRAND_COLOR}44` }}
          >
            <Feather size={18} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight" style={{ color: BRAND_COLOR }}>
            Socialite
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {NAV.map(item => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`nav-item w-full flex items-center gap-4 px-4 py-3 rounded-2xl ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
                style={isActive ? { backgroundColor: BRAND_COLOR, boxShadow: `0 4px 6px -1px ${BRAND_COLOR}33` } : {}}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`${isActive ? "font-bold" : "font-semibold"} text-sm flex-1 text-left`}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-600"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-6 mb-2 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-indigo-50 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
          <button
            onClick={() => navigate("/new-post")}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 text-white rounded-2xl font-bold text-sm transition-all shadow-lg"
            style={{ backgroundColor: BRAND_COLOR, boxShadow: `0 4px 24px ${BRAND_COLOR}30` }}
          >
            <Plus size={18} strokeWidth={2.5} />
            New Post
          </button>
        </div>

      </div>
    </aside>
  );
}