import React from "react";
import { Heart } from "lucide-react";

const P   = "#7818DD";
const PBG = "rgba(120,24,221,0.07)";
const PBR = "rgba(120,24,221,0.18)";

const card = {
  background: "#fff",
  border: "1px solid #EDE8F7",
  borderRadius: 20,
  overflow: "hidden",
  boxShadow: "0 4px 24px rgba(120,24,221,0.08), 0 1px 4px rgba(120,24,221,0.04)",
};

function timeAgo(ds) {
  if (!ds) return "just now";
  const d = Date.now() - new Date(ds), m = Math.floor(d / 6e4), h = Math.floor(m / 60), dy = Math.floor(h / 24);
  if (m < 1) return "just now"; if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`; if (dy < 7) return `${dy}d`;
  return new Date(ds).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Single liked post card ───────────────────────────────────────────
function LikedPostCard({ post }) {
  const initials = (post.user_name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const handle   = (post.user_name || "user").toLowerCase().replace(/\s+/g, "");

  return (
    <div
      style={{ ...card, padding: 24, transition: "transform 0.2s, box-shadow 0.2s", borderLeft: "3px solid rgba(225,29,72,0.3)" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(120,24,221,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = card.boxShadow; }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        {/* Initials avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: PBG, border: `2px solid ${PBR}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700, color: P,
        }}>
          {initials}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1A0533" }}>{post.user_name || "Unknown"}</div>
              <div style={{ fontSize: 12, color: "#B8A8D0", marginTop: 2 }}>@{handle}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 500, color: "#9E8CB0",
                background: PBG, padding: "3px 9px", borderRadius: 6,
                border: `1px solid ${PBR}`, whiteSpace: "nowrap",
              }}>
                {timeAgo(post.created_at)}
              </span>
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

          {/* Read-only stats */}
          <div style={{
            display: "flex", gap: 16, marginTop: 14, paddingTop: 12,
            borderTop: "1px solid #F0EAF9",
            fontSize: 12, color: "#B8A8D0", fontWeight: 500,
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Heart size={12} fill="#E11D48" color="#E11D48" /> {post.likes || 0}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              💬 {post.comments || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────
function EmptyState() {
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
        <Heart size={26} color="#C084FC" />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#5B4A72" }}>No liked posts yet</div>
      <div style={{ fontSize: 14, color: "#B8A8D0", maxWidth: 240, lineHeight: 1.6 }}>
        Posts you heart will appear here.
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────
export default function ProfileLikesTab({ likedPosts }) {
  if (likedPosts.length === 0) return <EmptyState />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fontSize: 12, color: "#9E8CB0", fontWeight: 500 }}>
        <Heart size={13} color={P} fill={P} />
        {likedPosts.length} post{likedPosts.length !== 1 ? "s" : ""} you've liked
      </div>
      {likedPosts.map(post => (
        <LikedPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}