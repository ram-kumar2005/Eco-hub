"use client";

import { useState } from "react";
import { Crown, Medal, Award, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";

const RANK_COLORS = ["#f59e0b","#64748b","#ea580c"];

function RankIcon({ rank }) {
  if (rank === 1) return <Crown size={20} color="#f59e0b" />;
  if (rank === 2) return <Medal size={20} color="#94a3b8" />;
  if (rank === 3) return <Medal size={20} color="#cd7c4f" />;
  return <span style={{ fontWeight:700, color:"var(--text-secondary)", fontSize:"0.9rem" }}>#{rank}</span>;
}

export default function LeaderboardClient({ session, deptScores, badges, userBadges }) {
  const [view, setView] = useState("leaderboard"); // "leaderboard" | "badges"

  return (
    <main className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Gamification & Leaderboard</h1>
        <p className="page-subtitle">Department rankings and sustainability achievement badges</p>
      </div>

      {/* Top 3 podium */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.2fr 1fr", gap:"1rem", marginBottom:"2rem", alignItems:"flex-end" }} className="delay-1 animate-fade-in">
        {/* 2nd */}
        <div style={{ background:"linear-gradient(135deg,#f1f5f9,#e2e8f0)", borderRadius:"16px", padding:"1.5rem", textAlign:"center", border:"2px solid #94a3b8" }}>
          <Medal size={32} color="#94a3b8" style={{ marginBottom:"0.5rem" }} />
          <div style={{ fontWeight:800, fontSize:"1.1rem", fontFamily:"Space Grotesk" }}>{deptScores[1]?.dept || "—"}</div>
          <div style={{ color:"var(--text-secondary)", fontSize:"0.8rem" }}>2nd Place</div>
          <div style={{ fontSize:"1.5rem", fontWeight:800, color:"#64748b", marginTop:"0.3rem" }}>{deptScores[1]?.score.toFixed(0) || 0} pts</div>
        </div>
        {/* 1st */}
        <div style={{ background:"linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius:"16px", padding:"2rem", textAlign:"center", border:"3px solid #f59e0b", boxShadow:"0 8px 32px rgba(245,158,11,0.2)" }}>
          <Crown size={40} color="#f59e0b" style={{ marginBottom:"0.5rem" }} />
          <div style={{ fontWeight:800, fontSize:"1.3rem", fontFamily:"Space Grotesk" }}>{deptScores[0]?.dept || "—"}</div>
          <div style={{ color:"#92400e", fontSize:"0.8rem" }}>🏆 Champion Department</div>
          <div style={{ fontSize:"2rem", fontWeight:800, color:"#b45309", marginTop:"0.3rem" }}>{deptScores[0]?.score.toFixed(0) || 0} pts</div>
          <div style={{ fontSize:"0.75rem", color:"#92400e", marginTop:"0.2rem" }}>
            {deptScores[0]?.reduction > 0 ? `↓ ${deptScores[0].reduction}% CO₂ reduced` : "Tracking started"}
          </div>
        </div>
        {/* 3rd */}
        <div style={{ background:"linear-gradient(135deg,#fef6f0,#fed7aa)", borderRadius:"16px", padding:"1.5rem", textAlign:"center", border:"2px solid #cd7c4f" }}>
          <Medal size={32} color="#cd7c4f" style={{ marginBottom:"0.5rem" }} />
          <div style={{ fontWeight:800, fontSize:"1.1rem", fontFamily:"Space Grotesk" }}>{deptScores[2]?.dept || "—"}</div>
          <div style={{ color:"var(--text-secondary)", fontSize:"0.8rem" }}>3rd Place</div>
          <div style={{ fontSize:"1.5rem", fontWeight:800, color:"#cd7c4f", marginTop:"0.3rem" }}>{deptScores[2]?.score.toFixed(0) || 0} pts</div>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display:"flex", gap:"0.8rem", marginBottom:"1.5rem" }} className="delay-2 animate-fade-in">
        <button onClick={() => setView("leaderboard")} className={view==="leaderboard"?"btn-primary":"btn-secondary"}>
          <Crown size={16} /> Full Rankings
        </button>
        <button onClick={() => setView("badges")} className={view==="badges"?"btn-primary":"btn-secondary"}>
          <Award size={16} /> Achievement Badges
        </button>
      </div>

      {/* LEADERBOARD TABLE */}
      {view === "leaderboard" && (
        <div className="card delay-3 animate-fade-in">
          <div className="card-header">
            <h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><Star size={16} color="#f59e0b" /> Department Rankings — Current Month</h3>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.9rem" }}>
              <thead>
                <tr style={{ borderBottom:"2px solid var(--border-color)" }}>
                  {["Rank","Department","Score","CO₂ This Month","CO₂ Last Month","Trend"].map(h => (
                    <th key={h} style={{ padding:"0.8rem 1rem", textAlign:"left", color:"var(--text-secondary)", fontWeight:600, fontSize:"0.8rem", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {deptScores.map((dept, i) => (
                  <tr key={dept.dept} style={{ borderBottom:"1px solid var(--border-color)", background: i<3?"rgba(245,158,11,0.02)":"transparent", transition:"background 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(22,163,74,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background=i<3?"rgba(245,158,11,0.02)":"transparent"}>
                    <td style={{ padding:"0.9rem 1rem" }}><RankIcon rank={dept.rank} /></td>
                    <td style={{ padding:"0.9rem 1rem", fontWeight:600 }}>{dept.dept}</td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      <span style={{ background:`${RANK_COLORS[i]||"#16a34a"}15`, color:RANK_COLORS[i]||"#16a34a", padding:"3px 10px", borderRadius:"20px", fontWeight:700, fontSize:"0.85rem" }}>
                        {dept.score} pts
                      </span>
                    </td>
                    <td style={{ padding:"0.9rem 1rem", color:"var(--text-secondary)" }}>{dept.thisMonthCo2 > 0 ? `${(dept.thisMonthCo2/1000).toFixed(3)} t` : "No data"}</td>
                    <td style={{ padding:"0.9rem 1rem", color:"var(--text-secondary)" }}>{dept.lastMonthCo2 > 0 ? `${(dept.lastMonthCo2/1000).toFixed(3)} t` : "No data"}</td>
                    <td style={{ padding:"0.9rem 1rem" }}>
                      {dept.reduction > 5 ? <span style={{ color:"#16a34a", display:"flex", alignItems:"center", gap:"4px" }}><TrendingDown size={14} /> {dept.reduction}% ↓</span>
                      : dept.reduction < -5 ? <span style={{ color:"#ef4444", display:"flex", alignItems:"center", gap:"4px" }}><TrendingUp size={14} /> {Math.abs(dept.reduction)}% ↑</span>
                      : <span style={{ color:"var(--text-secondary)", display:"flex", alignItems:"center", gap:"4px" }}><Minus size={14} /> Stable</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop:"1rem", fontSize:"0.78rem", color:"var(--text-secondary)", borderTop:"1px solid var(--border-color)", paddingTop:"0.8rem" }}>
            Score formula: 100 base + (CO₂ reduction % × 2). Ranking resets monthly.
          </p>
        </div>
      )}

      {/* BADGES VIEW */}
      {view === "badges" && (
        <div className="delay-3 animate-fade-in">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:"1rem" }}>
            {badges.map(badge => {
              const awarded = userBadges.filter(ub => ub.badgeId === badge.id);
              const isUnlocked = awarded.length > 0;
              return (
                <div key={badge.id} style={{
                  background: isUnlocked ? badge.bg : "#f8fafc",
                  border:`2px solid ${isUnlocked ? badge.color : "var(--border-color)"}`,
                  borderRadius:"14px", padding:"1.2rem", textAlign:"center",
                  opacity: isUnlocked ? 1 : 0.6, transition:"all 0.2s",
                  filter: isUnlocked ? "none" : "grayscale(60%)",
                }}>
                  <div style={{ fontSize:"2rem", marginBottom:"0.5rem" }}>
                    {isUnlocked ? "🏅" : "🔒"}
                  </div>
                  <div style={{ fontWeight:700, fontSize:"0.9rem", color: isUnlocked ? badge.color : "var(--text-secondary)", marginBottom:"0.3rem" }}>
                    {badge.label}
                  </div>
                  <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)", lineHeight:"1.4" }}>
                    {badge.desc}
                  </div>
                  {isUnlocked && (
                    <div style={{ marginTop:"0.5rem", fontSize:"0.7rem", color:badge.color, fontWeight:600 }}>
                      ✓ Awarded to {awarded.length} user{awarded.length>1?"s":""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ marginTop:"1.5rem", fontSize:"0.8rem", color:"var(--text-secondary)", textAlign:"center" }}>
            Badges are awarded by admins or auto-triggered by data milestones.
          </p>
        </div>
      )}
    </main>
  );
}
