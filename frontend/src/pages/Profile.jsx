import React, { useState, useEffect } from "react";
import axios from "axios";
import { Feather, Heart, Image as ImageIcon, Bookmark } from "lucide-react";

import ProfileHeader    from "../components/Profile/Profileheader";
import ProfilePostsTab  from "../components/Profile/Profilepoststab";
import ProfileLikesTab  from "../components/Profile/Profilelikestab";

const API_URL = "http://localhost:8000";

const P   = "#7818DD";
const PBG = "rgba(120,24,221,0.07)";
const PBR = "rgba(120,24,221,0.18)";

const TABS = [
  { id: "posts", label: "Posts", icon: <Feather    size={14} /> },
  { id: "likes", label: "Likes", icon: <Heart      size={14} /> },
  { id: "media", label: "Media", icon: <ImageIcon  size={14} /> },
  { id: "saved", label: "Saved", icon: <Bookmark   size={14} /> },
];

function EmptyPlaceholder({ icon, title, sub }) {
  return (
    <div style={{
      padding: "60px 40px", borderRadius: 20,
      background: "white", border: "1.5px dashed #E2D8F5",
      textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 60, height: 60, borderRadius: 16,
        background: "rgba(120,24,221,0.06)", border: "1px solid #E2D8F5",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#5B4A72" }}>{title}</div>
      <div style={{ fontSize: 14, color: "#B8A8D0", maxWidth: 240, lineHeight: 1.6 }}>{sub}</div>
    </div>
  );
}

export default function Profile({ onBackToDashboard }) {
  const [activeTab,  setActiveTab]  = useState("posts");
  const [user,       setUser]       = useState(null);
  const [posts,      setPosts]      = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(false);
  const [form, setForm] = useState({
    name: "", bio: "", location: "", website: "", email: "", avatar: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    fetchLikedPosts();
  }, []);

  const auth  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
  const avUrl = n  => `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=7818DD&color=fff&size=200&bold=true`;
  const getAv = () => form.avatar || avUrl(form.name || "User");
  const username = user?.username || localStorage.getItem("user_email")?.split("@")[0] || "user";

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/profile`, auth());
      setUser(data);
      setForm({
        name:     data.name     || localStorage.getItem("user_name")  || "",
        bio:      data.bio      || "",
        location: data.location || "",
        website:  data.website  || "",
        email:    data.email    || localStorage.getItem("user_email") || "",
        avatar:   data.avatar   || avUrl(data.name || "User"),
      });
    } catch (e) { console.error(e); }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/posts/user`, auth());
      setPosts(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchLikedPosts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/posts/liked`, auth());
      setLikedPosts(data);
    } catch {
      try {
        const { data: all } = await axios.get(`${API_URL}/posts/`, auth());
        setLikedPosts(all.filter(p => p.is_liked));
      } catch (err) { console.error(err); }
    }
  };

  const saveProfile = async () => {
    try {
      const { data } = await axios.put(`${API_URL}/profile`, form, auth());
      setUser(data);
      localStorage.setItem("user_name",  form.name);
      localStorage.setItem("user_email", form.email);
      setEditing(false);
    } catch (e) { console.error(e); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("avatar", file);
    try {
      const { data } = await axios.post(`${API_URL}/profile/avatar`, fd, {
        headers: { ...auth().headers, "Content-Type": "multipart/form-data" },
      });
      setForm(f => ({ ...f, avatar: data.avatarUrl }));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${API_URL}/posts/${postId}`, auth());
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (e) {
      alert(e.response?.status === 403 ? "You can only delete your own posts" : "Failed to delete post");
    }
  };

  const handleBack = () => {
    if (onBackToDashboard) onBackToDashboard();
    else window.location.href = "/dashboard";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F7FE" }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "3px solid rgba(120,24,221,0.18)", borderTopColor: "#7818DD",
        animation: "spin 0.75s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F4F0FC",
      backgroundImage: `
        radial-gradient(ellipse 70% 50% at 15% 0%, rgba(120,24,221,0.09) 0%, transparent 55%),
        radial-gradient(ellipse 50% 60% at 90% 100%, rgba(120,24,221,0.06) 0%, transparent 55%)
      `,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#1A0533",
    }}>

      <div style={{
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        maxWidth: 1160, width: "100%",
        margin: "0 auto",
        padding: "32px 32px 80px",
        gap: 28,
        alignItems: "start",
      }}>

        {/* ── Left: cover + avatar + bio + meta ── */}
        <ProfileHeader
          form={form}
          setForm={setForm}
          editing={editing}
          setEditing={setEditing}
          posts={posts}
          username={username}
          getAv={getAv}
          onSave={saveProfile}
          onBack={handleBack}
          onAvatarUpload={uploadAvatar}
        />

        {/* ── Right: tab bar + tab content ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Section label */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#B8A8D0", letterSpacing: "2px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Activity
            </span>
            <div style={{ flex: 1, height: 1, background: "#EDE8F7" }} />
          </div>

          {/* Tab bar */}
          <div style={{
            display: "flex", gap: 2,
            background: "white", border: "1px solid #EDE8F7",
            borderRadius: 14, padding: 5,
            boxShadow: "0 2px 8px rgba(120,24,221,0.04)",
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: activeTab === t.id ? 600 : 500,
                  background: activeTab === t.id ? PBG : "transparent",
                  color: activeTab === t.id ? P : "#9E8CB0",
                  boxShadow: activeTab === t.id ? `inset 0 0 0 1.5px ${PBR}` : "none",
                  transition: "all 0.18s",
                }}
                onMouseEnter={e => { if (activeTab !== t.id) e.currentTarget.style.color = P; }}
                onMouseLeave={e => { if (activeTab !== t.id) e.currentTarget.style.color = "#9E8CB0"; }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "posts" && (
            <ProfilePostsTab
              posts={posts}
              getAv={getAv}
              name={form.name}
              username={username}
              onDelete={handleDelete}
            />
          )}

          {activeTab === "likes" && (
            <ProfileLikesTab likedPosts={likedPosts} />
          )}

          {activeTab === "media" && (
            <EmptyPlaceholder
              icon={<ImageIcon size={26} color="#C084FC" />}
              title="No media yet"
              sub="Photos and videos you post will appear here."
            />
          )}

          {activeTab === "saved" && (
            <EmptyPlaceholder
              icon={<Bookmark size={26} color="#C084FC" />}
              title="Nothing saved yet"
              sub="Bookmark posts to find them easily later."
            />
          )}
        </div>
      </div>

      <style>{`* { box-sizing: border-box; }`}</style>
    </div>
  );
}