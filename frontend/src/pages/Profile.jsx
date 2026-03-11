import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Mail, Calendar, MapPin, Link as LinkIcon,
  Heart, Image as ImageIcon,
  Edit2, Camera, Bookmark, Check, X, ArrowLeft,
  Feather, Sparkles, Trash2,
} from "lucide-react";

const P   = "#7818DD";
const PL  = "#9B4EE8";
const PD  = "#5A0FAD";
const PBG = "rgba(120,24,221,0.07)";
const PBR = "rgba(120,24,221,0.18)";
const PGL = "rgba(120,24,221,0.25)";
const card = {
  background: "#fff",
  border: "1px solid #EDE8F7",
  borderRadius: 20,
  overflow: "hidden",
  boxShadow: `0 4px 24px rgba(120,24,221,0.08), 0 1px 4px rgba(120,24,221,0.04)`,
};

const inputBase = {
  fontFamily: "inherit",
  background: PBG,
  border: `1.5px solid ${PBR}`,
  borderRadius: 10,
  color: "#1A0533",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const DeleteConfirmModal = ({ post, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(post.id);
    setIsDeleting(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(26,5,51,0.45)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 20, maxWidth: 420, width: "100%",
          padding: 28, border: "1px solid #EDE8F7",
          boxShadow: "0 20px 60px rgba(120,24,221,0.15)",
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14, background: "rgba(239,68,68,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
        }}>
          <Trash2 size={20} color="#EF4444" />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#1A0533", marginBottom: 6 }}>Delete this post?</div>
        <div style={{ fontSize: 13, color: "#9E8CB0", marginBottom: 16 }}>This action cannot be undone.</div>
        <div style={{
          background: PBG, border: `1px solid ${PBR}`, borderRadius: 12,
          padding: "12px 16px", marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, color: "#5B4A72", lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>{post.content}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "white", border: "1.5px solid #E2D8F5", color: "#6B21A8",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: isDeleting ? "#FCA5A5" : "#EF4444",
              color: "white", border: "none", cursor: isDeleting ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Profile({ onBackToDashboard }) {
  const [activeTab, setActiveTab] = useState("posts");
  const [user,      setUser]      = useState(null);
  const [posts,     setPosts]     = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [form,      setForm]      = useState({
    name: "", bio: "", location: "", website: "", email: "", avatar: "",
  });

  useEffect(() => { fetchProfile(); fetchPosts(); fetchLikedPosts(); }, []);

  const auth     = ()  => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
  const avUrl    = (n) => `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=7818DD&color=fff&size=200&bold=true`;
  const getAv    = ()  => form.avatar || avUrl(form.name || "User");
  const username = user?.username || localStorage.getItem("user_email")?.split("@")[0] || "user";

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/profile", auth());
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
      const { data } = await axios.get("http://localhost:8000/posts/user", auth());
      setPosts(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchLikedPosts = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/posts/liked", auth());
      setLikedPosts(data);
    } catch (e) {
      try {
        const { data: allPosts } = await axios.get("http://localhost:8000/posts/", auth());
        setLikedPosts(allPosts.filter(p => p.is_liked));
      } catch (err) { console.error(err); }
    }
  };

  const saveProfile = async () => {
    try {
      const { data } = await axios.put("http://localhost:8000/profile", form, auth());
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
      const { data } = await axios.post("http://localhost:8000/profile/avatar", fd, {
        headers: { ...auth().headers, "Content-Type": "multipart/form-data" },
      });
      setForm(f => ({ ...f, avatar: data.avatarUrl }));
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:8000/posts/${postId}`, auth());
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (e) {
      if (e.response?.status === 403) alert("You can only delete your own posts");
      else alert("Failed to delete post");
    }
  };

  const handleBack = () => {
    if (onBackToDashboard) onBackToDashboard();
    else window.location.href = "/dashboard";
  };

  const timeAgo = (ds) => {
    if (!ds) return "just now";
    const d = Date.now() - new Date(ds), m = Math.floor(d / 6e4), h = Math.floor(m / 60), dy = Math.floor(h / 24);
    if (m < 1) return "just now"; if (m < 60) return `${m}m`;
    if (h < 24) return `${h}h`; if (dy < 7) return `${dy}d`;
    return new Date(ds).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const tabs = [
    { id: "posts", label: "Posts",  icon: <Feather    size={14} /> },
    { id: "likes", label: "Likes",  icon: <Heart      size={14} /> },
    { id: "media", label: "Media",  icon: <ImageIcon  size={14} /> },
    { id: "saved", label: "Saved",  icon: <Bookmark   size={14} /> },
  ];

  const meta = [
    { key: "location", label: "Location", type: "text",  ph: "City, Country",
      icon: <MapPin    size={15} color={P} /> },
    { key: "website",  label: "Website",  type: "url",   ph: "https://",
      icon: <LinkIcon  size={15} color={P} />,
      render: v => v
        ? <a href={v} target="_blank" rel="noopener noreferrer"
             style={{ fontSize: 13, fontWeight: 500, color: P, textDecoration: "none" }}>
            {v.replace(/^https?:\/\//, "")}
          </a>
        : null },
    { key: "email",    label: "Email",    type: "email", ph: "you@example.com",
      icon: <Mail      size={15} color={P} /> },
    { key: null,       label: "Joined",
      icon: <Calendar  size={15} color={P} />,
      render: () =>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1A0533" }}>
          {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span> },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F9F7FE" }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `3px solid ${PBR}`, borderTopColor: P,
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
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Delete modal */}
      {postToDelete && (
        <DeleteConfirmModal
          post={postToDelete}
          onClose={() => setPostToDelete(null)}
          onDelete={handleDelete}
        />
      )}

      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        maxWidth: 1160,
        width: "100%",
        margin: "0 auto",
        padding: "32px 32px 80px",
        gap: 28,
        alignItems: "start",
      }}>

        {/* ══ LEFT PANEL ══ */}
        <div style={{ position: "sticky", top: 32, display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={card}>
            {/* Banner */}
            <div style={{
              height: 128,
              background: `linear-gradient(135deg, ${P}, ${PL}, #C084FC)`,
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)`,
                backgroundSize: "22px 22px",
              }} />
              <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.12)", filter: "blur(30px)", top: -40, right: -30 }} />
              <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(20px)", bottom: -30, left: 40 }} />

              <button
                onClick={handleBack}
                style={{
                  position: "absolute", top: 14, left: 14, zIndex: 10,
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.22)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  color: "white",
                  fontSize: 12, fontWeight: 600, letterSpacing: "0.2px",
                  padding: "5px 13px", borderRadius: 20, cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
              >
                <ArrowLeft size={13} /> Dashboard
              </button>
            </div>

            <div style={{ padding: "0 24px 28px" }}>
              {/* Avatar row */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -44, marginBottom: 16 }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    padding: 3,
                    background: `linear-gradient(135deg, ${P}, #C084FC)`,
                    borderRadius: "50%",
                    boxShadow: `0 0 0 3px #fff, 0 6px 24px ${PGL}`,
                  }}>
                    <img src={getAv()} alt="avatar" style={{
                      width: 84, height: 84, borderRadius: "50%",
                      objectFit: "cover", display: "block", background: PBG,
                    }} />
                  </div>
                  {editing && (
                    <label style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      background: "rgba(26,5,51,0.55)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}>
                      <Camera size={22} color="white" />
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={uploadAvatar} />
                    </label>
                  )}
                </div>

                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 20,
                  background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)",
                  fontSize: 11, fontWeight: 600, color: "#16A34A", letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#16A34A",
                    animation: "pulse 2s infinite",
                  }} />
                  Active
                </div>
              </div>

              {/* Edit / Save / Cancel */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: "white", border: `1.5px solid #E2D8F5`, color: "#6B21A8",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = PBG; e.currentTarget.style.borderColor = P; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#E2D8F5"; }}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        background: `linear-gradient(135deg, #059669, #0D9488)`,
                        color: "white", border: "none", cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <Check size={14} /> Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: `linear-gradient(135deg, ${P}, ${PL})`,
                      color: "white", border: "none", cursor: "pointer",
                      boxShadow: `0 4px 16px ${PGL}`,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 22px ${PGL}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 4px 16px ${PGL}`; }}
                  >
                    <Edit2 size={14} /> Edit Profile
                  </button>
                )}
              </div>

              <div style={{ height: 1, background: "#EDE8F7", marginBottom: 20 }} />

              {/* Name + handle */}
              {editing ? (
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  style={{ ...inputBase, fontSize: 20, fontWeight: 700, padding: "10px 14px", marginBottom: 12 }}
                />
              ) : (
                <>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1A0533", letterSpacing: "-0.4px" }}>
                    {form.name || "Your Name"}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#9E8CB0", marginTop: 4 }}>
                    @{username}
                  </div>
                </>
              )}

              {/* Bio */}
              <div style={{ marginTop: 14, marginBottom: 20 }}>
                {editing ? (
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Write something about yourself…"
                    style={{ ...inputBase, fontSize: 14, padding: "10px 14px", resize: "none", lineHeight: 1.65 }}
                  />
                ) : form.bio ? (
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "#5B4A72" }}>{form.bio}</p>
                ) : (
                  <p style={{ fontSize: 13, color: "#B8A8D0", fontStyle: "italic" }}>No bio yet.</p>
                )}
              </div>

              {/* Stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 1, background: "#EDE8F7",
                borderRadius: 14, overflow: "hidden", marginBottom: 20,
              }}>
                {[["Posts", posts.length], ["Following", 0], ["Followers", 0]].map(([l, v]) => (
                  <div key={l} style={{
                    background: "white", padding: "13px 8px", textAlign: "center",
                    transition: "background 0.15s", cursor: "default",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = PBG}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <div style={{ fontSize: 20, fontWeight: 800, color: P, lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#B8A8D0", letterSpacing: "0.8px", textTransform: "uppercase", marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "#EDE8F7", marginBottom: 20 }} />

              {/* Meta fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {meta.map(f => (
                  <div key={f.label} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 14px", borderRadius: 12,
                    background: "#FAF8FF", border: "1px solid #EDE8F7",
                    transition: "border-color 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = PBR}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#EDE8F7"}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: PBG, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {f.icon}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#B8A8D0", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                        {f.label}
                      </span>
                      {f.key === null
                        ? f.render()
                        : editing
                          ? <input
                              type={f.type}
                              value={form[f.key]}
                              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                              placeholder={f.ph}
                              style={{ ...inputBase, fontSize: 13, padding: "6px 10px" }}
                            />
                          : f.render
                            ? (f.render(form[f.key]) || <span style={{ fontSize: 13, color: "#B8A8D0", fontStyle: "italic" }}>Not set</span>)
                            : <span style={{ fontSize: 13, fontWeight: 500, color: form[f.key] ? "#1A0533" : "#B8A8D0", fontStyle: form[f.key] ? "normal" : "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {form[f.key] || "Not set"}
                              </span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Promo card */}
          <div style={{
            borderRadius: 18, padding: "18px 20px",
            background: `linear-gradient(135deg, rgba(120,24,221,0.06), rgba(192,132,252,0.06))`,
            border: `1px solid ${PBR}`,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, ${P}, #C084FC)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 6px 18px ${PGL}`,
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1A0533" }}>Complete your profile</div>
              <div style={{ fontSize: 12, color: "#9E8CB0", marginTop: 3, lineHeight: 1.5 }}>Add a bio and website so people can find you.</div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#B8A8D0", letterSpacing: "2px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Activity
            </span>
            <div style={{ flex: 1, height: 1, background: "#EDE8F7" }} />
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 2,
            background: "white",
            border: "1px solid #EDE8F7",
            borderRadius: 14, padding: 5,
            boxShadow: "0 2px 8px rgba(120,24,221,0.04)",
          }}>
            {tabs.map(t => (
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

          {/* ── Posts tab — with delete, no like/comment/share ── */}
          {activeTab === "posts" && (
            posts.length === 0 ? (
              <EmptyState icon={<Feather size={26} color="#C084FC" />} title="No posts yet" sub="When you write something, it'll show up here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {posts.map((post, i) => (
                  <div
                    key={post.id}
                    style={{
                      ...card,
                      padding: 24,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      position: "relative",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(120,24,221,0.12)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = card.boxShadow; }}
                  >
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <img src={getAv()} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: `2px solid ${PBR}` }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "#1A0533" }}>{form.name || "You"}</div>
                            <div style={{ fontSize: 12, color: "#B8A8D0", marginTop: 2 }}>@{username}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 500, color: "#9E8CB0",
                              background: PBG, padding: "3px 9px", borderRadius: 6,
                              border: `1px solid ${PBR}`, whiteSpace: "nowrap",
                            }}>
                              {timeAgo(post.created_at)}
                            </span>
                            {/* Delete button — only shown on user's own posts */}
                            <button
                              onClick={() => setPostToDelete(post)}
                              title="Delete post"
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: 30, height: 30, borderRadius: 8, border: "none",
                                background: "rgba(239,68,68,0.06)",
                                color: "#EF4444", cursor: "pointer",
                                transition: "all 0.18s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.14)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.transform = "scale(1)"; }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.75, color: "#3D2561", marginTop: 14 }}>{post.content}</p>
                        {/* No like/comment/share actions */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Likes tab — posts liked by user ── */}
          {activeTab === "likes" && (
            likedPosts.length === 0 ? (
              <EmptyState icon={<Heart size={26} color="#C084FC" />} title="No liked posts yet" sub="Posts you heart will appear here." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
                  fontSize: 12, color: "#9E8CB0", fontWeight: 500,
                }}>
                  <Heart size={13} color={P} fill={P} />
                  {likedPosts.length} post{likedPosts.length !== 1 ? "s" : ""} you've liked
                </div>
                {likedPosts.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      ...card,
                      padding: 24,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      borderLeft: `3px solid rgba(225,29,72,0.3)`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px rgba(120,24,221,0.12)`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = card.boxShadow; }}
                  >
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {/* Author avatar — use ui-avatars for other users */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: PBG, border: `2px solid ${PBR}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontWeight: 700, color: P,
                      }}>
                        {(post.user_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "#1A0533" }}>{post.user_name || "Unknown"}</div>
                            <div style={{ fontSize: 12, color: "#B8A8D0", marginTop: 2 }}>
                              @{(post.user_name || "user").toLowerCase().replace(/\s+/g, "")}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 500, color: "#9E8CB0",
                              background: PBG, padding: "3px 9px", borderRadius: 6,
                              border: `1px solid ${PBR}`, whiteSpace: "nowrap",
                            }}>
                              {timeAgo(post.created_at)}
                            </span>
                            {/* Liked indicator */}
                            <span style={{
                              display: "flex", alignItems: "center", gap: 4,
                              fontSize: 11, fontWeight: 600, color: "#E11D48",
                              background: "rgba(225,29,72,0.06)", padding: "3px 9px",
                              borderRadius: 6, border: "1px solid rgba(225,29,72,0.15)",
                            }}>
                              <Heart size={10} fill="#E11D48" color="#E11D48" /> Liked
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.75, color: "#3D2561", marginTop: 14 }}>{post.content}</p>
                        {/* Stats row — read-only, no actions */}
                        <div style={{
                          display: "flex", gap: 16, marginTop: 14, paddingTop: 12,
                          borderTop: "1px solid #F0EAF9",
                          fontSize: 12, color: "#B8A8D0", fontWeight: 500,
                        }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Heart size={12} fill="#E11D48" color="#E11D48" /> {post.likes || 0}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: 11 }}>💬</span> {post.comments || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "media" && <EmptyState icon={<ImageIcon size={26} color="#C084FC" />} title="No media yet" sub="Photos and videos you post will appear here." />}
          {activeTab === "saved" && <EmptyState icon={<Bookmark size={26} color="#C084FC" />} title="Nothing saved yet" sub="Bookmark posts to find them easily later." />}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

