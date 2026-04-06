"use client";

import { useState } from "react";
import { MapPin, Zap, X, Info } from "lucide-react";

const BUILDINGS = [
  { id:"main",    label:"Main Block",      x:38, y:10, w:24, h:12, dept:"Admin",      type:"admin" },
  { id:"cse",     label:"CSE / IT Block",  x:10, y:28, w:18, h:12, dept:"CSE",        type:"academic" },
  { id:"ece",     label:"ECE Block",        x:33, y:28, w:18, h:12, dept:"ECE",        type:"academic" },
  { id:"eee",     label:"EEE Block",        x:56, y:28, w:18, h:12, dept:"EEE",        type:"academic" },
  { id:"mech",    label:"Mechanical Block", x:10, y:48, w:18, h:12, dept:"Mechanical", type:"academic" },
  { id:"civil",   label:"Civil Block",      x:33, y:48, w:18, h:12, dept:"Civil",      type:"academic" },
  { id:"ai",      label:"AI & DS Block",    x:56, y:48, w:18, h:12, dept:"AI & DS",   type:"academic" },
  { id:"mba",     label:"MBA Block",        x:79, y:28, w:14, h:12, dept:"MBA",        type:"academic" },
  { id:"library", label:"Library",          x:79, y:48, w:14, h:9,  dept:"Library",    type:"facility" },
  { id:"canteen", label:"Canteen",          x:38, y:68, w:12, h:9,  dept:"Canteen",    type:"facility" },
  { id:"hostel",  label:"Hostel Block",     x:56, y:68, w:14, h:9,  dept:"Hostel",     type:"hostel" },
  { id:"solar",   label:"Solar Farm",       x:10, y:68, w:14, h:9,  dept:"Renewable",  type:"renewable" },
];

const MARKERS = [
  { id:"m1", label:"E-Waste Bin",        x:22, y:34, icon:"♻️", color:"#ef4444" },
  { id:"m2", label:"Recycling Bin",      x:45, y:34, icon:"🗑",  color:"#16a34a" },
  { id:"m3", label:"Recycling Bin",      x:68, y:34, icon:"🗑",  color:"#16a34a" },
  { id:"m4", label:"Solar Panels",       x:17, y:74, icon:"☀️", color:"#f59e0b" },
  { id:"m5", label:"Rainwater Tank",     x:50, y:80, icon:"💧", color:"#0891b2" },
  { id:"m6", label:"E-Waste Collection", x:89, y:54, icon:"♻️", color:"#ef4444" },
];

const ENERGY_LEVELS = {
  main:"medium", cse:"high", ece:"medium", eee:"high",
  mech:"low", civil:"low", ai:"medium", mba:"low",
  library:"low", canteen:"medium", hostel:"high", solar:"low",
};

const HEAT_COLORS = {
  low:      { fill:"rgba(22,163,74,0.2)",   stroke:"#16a34a", label:"Low Usage" },
  medium:   { fill:"rgba(245,158,11,0.2)",  stroke:"#f59e0b", label:"Medium Usage" },
  high:     { fill:"rgba(239,68,68,0.18)",  stroke:"#ef4444", label:"High Usage" },
  renewable:{ fill:"rgba(14,165,233,0.2)",  stroke:"#0ea5e9", label:"Renewable" },
};

const TYPE_STYLE = {
  admin:    { fill:"rgba(124,58,237,0.1)", stroke:"#7c3aed" },
  academic: { fill:"rgba(22,163,74,0.1)",  stroke:"#16a34a" },
  facility: { fill:"rgba(245,158,11,0.1)", stroke:"#f59e0b" },
  hostel:   { fill:"rgba(8,145,178,0.1)",  stroke:"#0891b2" },
  renewable:{ fill:"rgba(14,165,233,0.1)", stroke:"#0ea5e9" },
};

export default function CampusMapClient() {
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("default");
  const [hoveredId, setHoveredId] = useState(null);

  const getStyle = (b) => {
    if (mode === "heatmap") {
      const level = b.type === "renewable" ? "renewable" : ENERGY_LEVELS[b.id] || "low";
      return HEAT_COLORS[level];
    }
    return TYPE_STYLE[b.type] || TYPE_STYLE.academic;
  };

  return (
    <main className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Interactive Campus Map</h1>
        <p className="page-subtitle">Visual layout of Mepco campus — energy heatmap, recycling bins, and solar installations</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"1.5rem", alignItems:"start" }}>
        {/* SVG Map */}
        <div className="card delay-1 animate-fade-in" style={{ padding:"1.5rem" }}>
          <div style={{ display:"flex", gap:"0.8rem", marginBottom:"1rem", flexWrap:"wrap" }}>
            <button onClick={() => setMode("default")} className={mode==="default"?"btn-primary":"btn-secondary"} style={{ fontSize:"0.85rem", padding:"0.5rem 1rem" }}>
              <MapPin size={14} /> Default View
            </button>
            <button onClick={() => setMode("heatmap")} className={mode==="heatmap"?"btn-primary":"btn-secondary"} style={{ fontSize:"0.85rem", padding:"0.5rem 1rem" }}>
              <Zap size={14} /> Energy Heatmap
            </button>
          </div>

          <svg viewBox="0 0 100 90" style={{ width:"100%", height:"auto", border:"1px solid var(--border-color)", borderRadius:"12px", background:"#f8fafc", cursor:"default" }}>
            <line x1="0" y1="22" x2="100" y2="22" stroke="#d1d5db" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="0" y1="42" x2="100" y2="42" stroke="#d1d5db" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="0" y1="62" x2="100" y2="62" stroke="#d1d5db" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="31" y1="0" x2="31" y2="90" stroke="#d1d5db" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="54" y1="0" x2="54" y2="90" stroke="#d1d5db" strokeWidth="0.3" strokeDasharray="1,1" />
            <line x1="77" y1="0" x2="77" y2="90" stroke="#d1d5db" strokeWidth="0.3" strokeDasharray="1,1" />
            <rect x="1" y="1" width="98" height="88" rx="2" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,1" />

            {BUILDINGS.map(b => {
              const s = getStyle(b);
              const isHovered = hoveredId === b.id;
              const isSelected = selected?.id === b.id;
              return (
                <g key={b.id} style={{ cursor:"pointer" }} onClick={() => setSelected(b)} onMouseEnter={() => setHoveredId(b.id)} onMouseLeave={() => setHoveredId(null)}>
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="1"
                    fill={s.fill} stroke={isSelected ? "#000" : s.stroke}
                    strokeWidth={isSelected ? "0.8" : isHovered ? "0.7" : "0.4"}
                    style={{ transition:"all 0.15s" }} opacity={isHovered||isSelected ? 1 : 0.85} />
                  <text x={b.x+b.w/2} y={b.y+b.h/2} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize:"1.8px", fontFamily:"Outfit,sans-serif", fontWeight:600, fill:"#374151", pointerEvents:"none" }}>
                    {b.label.split(" ").slice(0,2).join(" ")}
                  </text>
                  <text x={b.x+b.w/2} y={b.y+b.h/2+2.2} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize:"1.5px", fontFamily:"Outfit,sans-serif", fill:"#6b7280", pointerEvents:"none" }}>
                    {b.dept}
                  </text>
                </g>
              );
            })}

            {MARKERS.map(m => (
              <g key={m.id}>
                <circle cx={m.x} cy={m.y} r="2" fill={m.color} opacity="0.2" />
                <text x={m.x} y={m.y} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:"2.5px", pointerEvents:"none" }}>{m.icon}</text>
              </g>
            ))}

            <text x="50" y="87" textAnchor="middle" style={{ fontSize:"2px", fill:"#9ca3af", fontFamily:"Outfit,sans-serif" }}>Main Gate — Mepco Schlenk Engineering College</text>
          </svg>
        </div>

        {/* Right Panel */}
        <div style={{ width:"260px", display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div className="card delay-2 animate-fade-in">
            <h3 style={{ fontSize:"0.9rem", marginBottom:"0.8rem" }}>Legend</h3>
            {mode === "heatmap" ? (
              Object.entries(HEAT_COLORS).map(([k,v]) => (
                <div key={k} style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px",fontSize:"0.8rem" }}>
                  <div style={{ width:14,height:14,borderRadius:3,background:v.fill,border:`1.5px solid ${v.stroke}` }} />{v.label}
                </div>
              ))
            ) : (
              Object.entries(TYPE_STYLE).map(([k,v]) => (
                <div key={k} style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px",fontSize:"0.8rem" }}>
                  <div style={{ width:14,height:14,borderRadius:3,background:v.fill,border:`1.5px solid ${v.stroke}` }} />{k.charAt(0).toUpperCase()+k.slice(1)}
                </div>
              ))
            )}
            <div style={{ borderTop:"1px solid var(--border-color)", marginTop:"0.8rem", paddingTop:"0.8rem" }}>
              <p style={{ fontSize:"0.75rem", color:"var(--text-secondary)", marginBottom:"6px", fontWeight:600 }}>Markers:</p>
              {[{icon:"♻️",label:"E-Waste Bin"},{icon:"🗑",label:"Recycling Bin"},{icon:"☀️",label:"Solar Panels"},{icon:"💧",label:"Rainwater Tank"}].map(m => (
                <div key={m.label} style={{ display:"flex",alignItems:"center",gap:"6px",marginBottom:"4px",fontSize:"0.78rem" }}>
                  <span>{m.icon}</span> {m.label}
                </div>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="card delay-3 animate-fade-in" style={{ borderLeft:`4px solid ${getStyle(selected).stroke}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.8rem" }}>
                <h3 style={{ fontSize:"0.95rem" }}>{selected.label}</h3>
                <button onClick={() => setSelected(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--text-secondary)" }}><X size={16} /></button>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:"0.5rem",fontSize:"0.82rem" }}>
                <div><span style={{ color:"var(--text-secondary)" }}>Department:</span> <strong>{selected.dept}</strong></div>
                <div><span style={{ color:"var(--text-secondary)" }}>Type:</span> <strong style={{ textTransform:"capitalize" }}>{selected.type}</strong></div>
                {mode === "heatmap" && (
                  <div><span style={{ color:"var(--text-secondary)" }}>Energy Level:</span>
                    <span style={{ marginLeft:"4px", padding:"1px 8px", borderRadius:"20px",
                      background:HEAT_COLORS[selected.type==="renewable"?"renewable":ENERGY_LEVELS[selected.id]||"low"].fill,
                      color:HEAT_COLORS[selected.type==="renewable"?"renewable":ENERGY_LEVELS[selected.id]||"low"].stroke,
                      fontWeight:700, fontSize:"0.78rem" }}>
                      {HEAT_COLORS[selected.type==="renewable"?"renewable":ENERGY_LEVELS[selected.id]||"low"].label}
                    </span>
                  </div>
                )}
                <div style={{ background:"#f8fafc",padding:"0.6rem",borderRadius:"8px",marginTop:"0.3rem",color:"var(--text-secondary)",fontSize:"0.78rem" }}>
                  <Info size={12} style={{ display:"inline",marginRight:"4px" }} />
                  Log data in Carbon Emission to populate real-time usage data for this building.
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign:"center",padding:"1.5rem",color:"var(--text-secondary)",fontSize:"0.85rem" }}>
              <MapPin size={24} style={{ margin:"0 auto 0.5rem" }} />
              Click any building to see details
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
