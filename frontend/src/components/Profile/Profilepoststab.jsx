import React, { useState } from "react";
import { Feather, Trash2 } from "lucide-react";

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

// ── Delete confirm modal ─────────────────────────────────────────────
function DeleteModal({ post, onClose, onDelete }) {
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    await onDelete(post.id);
    setBusy(false);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(26,5,51,0.45)", backdropFilter: "blur(6px)",
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
          <p style={{
            fontSize: 13, color: "#5B4A72", lineHeight: 1.6, margin: 0,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {post.content}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={busy}
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
            disabled={busy}
            style={{
              flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: busy ? "#FCA5A5" : "#EF4444",
              color: "white", border: "none",
              cursor: busy ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Single post card ─────────────────────────────────────────────────
function PostCard({ post, getAv, name, username, onDeleteClick }) {
  return (
    <div
      style={{ ...card, padding: 24, transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(120,24,221,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = card.boxShadow; }}
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <img src={getAv()} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0, border: `2px solid ${PBR}` }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#1A0533" }}>{name || "You"}</div>
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
              <button
                onClick={() => onDeleteClick(post)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  background: "rgba(239,68,68,0.06)", color: "#EF4444",
                  cursor: "pointer", transition: "all 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.14)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#3D2561", marginTop: 14 }}>{post.content}</p>
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
        <Feather size={26} color="#C084FC" />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#5B4A72" }}>No posts yet</div>
      <div style={{ fontSize: 14, color: "#B8A8D0", maxWidth: 240, lineHeight: 1.6 }}>
        When you write something, it'll show up here.
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────
export default function ProfilePostsTab({ posts, getAv, name, username, onDelete }) {
  const [postToDelete, setPostToDelete] = useState(null);

  if (posts.length === 0) return <EmptyState />;

  return (
    <>
      {postToDelete && (
        <DeleteModal
          post={postToDelete}
          onClose={() => setPostToDelete(null)}
          onDelete={onDelete}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            getAv={getAv}
            name={name}
            username={username}
            onDeleteClick={setPostToDelete}
          />
        ))}
      </div>
    </>
  );
}