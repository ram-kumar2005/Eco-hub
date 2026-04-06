"use client";

import { useState } from "react";
import { submitIdea, upvoteIdea, deleteIdea } from "./actions";
import Sidebar from "../../components/Sidebar";
import { Lightbulb, Send, ThumbsUp, Trash2, ShieldCheck, Users } from "lucide-react";

export default function IdeaClientBoard({ initialIdeas, session }) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const isAdmin = session?.user?.role === "ADMIN";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    const res = await submitIdea(fd);
    setLoading(false);
    if (res.success) {
      setSuccess("Idea posted! Thank you for contributing 🌱");
      setTitle("");
      setDescription("");
    } else {
      setError(res.error || "Failed to post idea.");
    }
  }

  async function handleUpvote(id) {
    if (isAdmin) return;
    const res = await upvoteIdea(id);
    if (res.success) {
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, upvotes: i.upvotes + 1 } : i));
    }
  }

  async function handleDelete(id) {
    if (!isAdmin) return;
    if (!confirm("Delete this idea?")) return;
    const res = await deleteIdea(id);
    if (res.success) {
      setIdeas(prev => prev.filter(i => i.id !== id));
    }
  }

  return (
    <div className="app-shell">
      <Sidebar user={session?.user} />
      <main className="main-content animate-fade-in">
        <div className="page-header">
          <h1 className="page-title" style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <Lightbulb size={28} color="var(--accent-color)" /> Sustainability Idea Board
          </h1>
          <p className="page-subtitle">Submit innovative ideas for campus waste management and emission reduction</p>
          {isAdmin && (
            <div className="alert alert-info" style={{ marginTop: "0.8rem", display: "inline-flex", alignItems:'center', gap:'8px', padding: "0.4rem 1rem" }}>
              <ShieldCheck size={15} /> Admin Mode — You can delete inappropriate ideas
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "2rem" }}>
          {/* Submit Form */}
          {!isAdmin && (
            <div className="form-section" style={{ height: "fit-content" }}>
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Lightbulb size={20} color="var(--accent-color)" /> Share Your Idea
              </h3>
              {success && <div className="alert alert-success" style={{ marginTop: "1rem" }}>{success}</div>}
              {error && <div className="alert alert-error" style={{ marginTop: "1rem" }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                <div className="form-group">
                  <label>Idea Title *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Install solar panels on main block" required />
                </div>
                <div className="form-group">
                  <label>Detailed Description *</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={5} placeholder="Explain how it works, estimated impact, implementation steps..." required />
                </div>
                <button type="submit" className="btn-primary" style={{ justifyContent: "center" }} disabled={loading}>
                  <Send size={16} /> {loading ? "Posting..." : "Submit Idea"}
                </button>
              </form>
            </div>
          )}

          {isAdmin && (
            <div className="card" style={{ height: "fit-content", borderLeft: "4px solid #ef4444" }}>
              <h3 style={{display:'flex', alignItems:'center', gap:'8px'}}><ShieldCheck size={20} color="#ef4444" /> Admin Panel</h3>
              <p className="text-secondary" style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                You are viewing as Administrator. You can delete ideas but cannot post or upvote. Use this panel to moderate the board.
              </p>
              <div style={{ marginTop: "1rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <p style={{display:'flex',alignItems:'center',gap:'6px'}}><Users size={13} /> Total ideas: <strong>{ideas.length}</strong></p>
                <p style={{display:'flex',alignItems:'center',gap:'6px', marginTop:'4px'}}><ThumbsUp size={13} /> Total upvotes: <strong>{ideas.reduce((a, i) => a + i.upvotes, 0)}</strong></p>
              </div>
            </div>
          )}

          {/* Ideas Feed */}
          <div>
            <h3 style={{ marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
              {ideas.length} Ideas Submitted
            </h3>
            {ideas.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                <Lightbulb size={40} style={{ marginBottom: "1rem", opacity: 0.3 }} />
                <p>No ideas yet. Be the first to share one!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {ideas.map(idea => (
                  <div key={idea.id} className="card" style={{ display: "flex", gap: "1rem", alignItems: "flex-start", transition: "transform 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>

                    {/* Upvote */}
                    <div
                      onClick={() => handleUpvote(idea.id)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                        padding: "0.6rem", background: isAdmin ? "rgba(0,0,0,0.03)" : "rgba(37,99,235,0.05)",
                        borderRadius: "10px", cursor: isAdmin ? "not-allowed" : "pointer",
                        minWidth: "52px", transition: "all 0.2s",
                        border: "1px solid var(--border-color)"
                      }}
                    >
                      <ThumbsUp size={18} color={idea.upvotes > 5 ? "var(--accent-color)" : "var(--text-secondary)"} />
                      <span style={{ fontWeight: 700, fontFamily: "Space Grotesk", fontSize: "1rem" }}>{idea.upvotes}</span>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ marginBottom: "0.4rem", fontSize: "1rem" }}>{idea.title}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>{idea.description}</p>
                      <div style={{ marginTop: "0.6rem", fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", gap: "1rem", flexWrap:'wrap' }}>
                        <span>{idea.author?.name || "Anonymous"}</span>
                        <span style={{color:'var(--text-secondary)', opacity:0.7}}>{idea.author?.email}</span>
                        <span className="alert alert-info" style={{padding:'1px 8px', borderRadius:'20px', fontSize:'0.7rem'}}>{idea.author?.role}</span>
                      </div>
                    </div>

                    {/* Admin Delete */}
                    {isAdmin && (
                      <button onClick={() => handleDelete(idea.id)} className="btn-danger" style={{ padding: "0.5rem", borderRadius: "8px", alignSelf: "flex-start" }} title="Delete idea">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
