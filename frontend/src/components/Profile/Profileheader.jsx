import React from "react";
import {
  ArrowLeft, Camera, Edit2, Check, X, Sparkles,
  MapPin, Link as LinkIcon, Mail, Calendar,
} from "lucide-react";

const P   = "#7818DD";
const PL  = "#9B4EE8";
const PBG = "rgba(120,24,221,0.07)";
const PBR = "rgba(120,24,221,0.18)";
const PGL = "rgba(120,24,221,0.25)";

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

const META_FIELDS = [
  {
    key: "location", label: "Location", type: "text", ph: "City, Country",
    icon: <MapPin size={15} color={P} />,
  },
  {
    key: "website", label: "Website", type: "url", ph: "https://",
    icon: <LinkIcon size={15} color={P} />,
    render: v => v
      ? <a href={v} target="_blank" rel="noopener noreferrer"
           style={{ fontSize: 13, fontWeight: 500, color: P, textDecoration: "none" }}>
          {v.replace(/^https?:\/\//, "")}
        </a>
      : null,
  },
  {
    key: "email", label: "Email", type: "email", ph: "you@example.com",
    icon: <Mail size={15} color={P} />,
  },
  {
    key: null, label: "Joined",
    icon: <Calendar size={15} color={P} />,
    render: () =>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#1A0533" }}>
        {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </span>,
  },
];

export default function ProfileHeader({
  form, setForm,
  editing, setEditing,
  posts,
  username,
  getAv,
  onSave,
  onBack,
  onAvatarUpload,
}) {
  return (
    <div style={{ position: "sticky", top: 32, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Identity card ── */}
      <div style={{
        background: "#fff", border: "1px solid #EDE8F7", borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(120,24,221,0.08), 0 1px 4px rgba(120,24,221,0.04)",
      }}>

        {/* Banner */}
        <div style={{
          height: 128,
          background: `linear-gradient(135deg, ${P}, ${PL}, #C084FC)`,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }} />
          <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.12)", filter: "blur(30px)", top: -40, right: -30 }} />
          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)", filter: "blur(20px)", bottom: -30, left: 40 }} />

          <button
            onClick={onBack}
            style={{
              position: "absolute", top: 14, left: 14, zIndex: 10,
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.22)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.4)", color: "white",
              fontSize: 12, fontWeight: 600, letterSpacing: "0.2px",
              padding: "5px 13px", borderRadius: 20, cursor: "pointer", transition: "background 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.35)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
          >
            <ArrowLeft size={13} /> Dashboard
          </button>
        </div>

        <div style={{ padding: "0 24px 28px" }}>

          {/* Avatar + Active badge */}
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
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  <Camera size={22} color="white" />
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={onAvatarUpload} />
                </label>
              )}
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 20,
              background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.25)",
              fontSize: 11, fontWeight: 600, color: "#16A34A",
              letterSpacing: "0.5px", textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", animation: "pulse 2s infinite" }} />
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
                    background: "white", border: "1.5px solid #E2D8F5", color: "#6B21A8",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = PBG; e.currentTarget.style.borderColor = P; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#E2D8F5"; }}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={onSave}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: "linear-gradient(135deg, #059669, #0D9488)",
                    color: "white", border: "none", cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(5,150,105,0.3)", transition: "all 0.2s",
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
                  boxShadow: `0 4px 16px ${PGL}`, transition: "all 0.2s",
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
            gap: 1, background: "#EDE8F7", borderRadius: 14, overflow: "hidden", marginBottom: 20,
          }}>
            {[["Posts", posts.length], ["Following", 0], ["Followers", 0]].map(([l, v]) => (
              <div
                key={l}
                style={{ background: "white", padding: "13px 8px", textAlign: "center", transition: "background 0.15s", cursor: "default" }}
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
            {META_FIELDS.map(f => (
              <div
                key={f.label}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 12,
                  background: "#FAF8FF", border: "1px solid #EDE8F7", transition: "border-color 0.2s",
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
                      ? (
                        <input
                          type={f.type}
                          value={form[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.ph}
                          style={{ ...inputBase, fontSize: 13, padding: "6px 10px" }}
                        />
                      )
                      : f.render
                        ? (f.render(form[f.key]) || <span style={{ fontSize: 13, color: "#B8A8D0", fontStyle: "italic" }}>Not set</span>)
                        : (
                          <span style={{
                            fontSize: 13, fontWeight: 500,
                            color: form[f.key] ? "#1A0533" : "#B8A8D0",
                            fontStyle: form[f.key] ? "normal" : "italic",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {form[f.key] || "Not set"}
                          </span>
                        )
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Promo card ── */}
      <div style={{
        borderRadius: 18, padding: "18px 20px",
        background: "linear-gradient(135deg, rgba(120,24,221,0.06), rgba(192,132,252,0.06))",
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
          <div style={{ fontSize: 12, color: "#9E8CB0", marginTop: 3, lineHeight: 1.5 }}>
            Add a bio and website so people can find you.
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
    </div>
  );
}