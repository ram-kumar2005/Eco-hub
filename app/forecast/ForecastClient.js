"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area, AreaChart, ComposedChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Target, BrainCircuit } from "lucide-react";

const ALERT_STYLES = {
  warning: { bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.3)", color:"#b45309", icon: AlertTriangle },
  danger:  { bg:"rgba(239,68,68,0.08)",  border:"rgba(239,68,68,0.3)",  color:"#ef4444", icon: TrendingUp },
  success: { bg:"rgba(22,163,74,0.08)",  border:"rgba(22,163,74,0.3)",  color:"#16a34a", icon: CheckCircle },
  info:    { bg:"rgba(8,145,178,0.08)",  border:"rgba(8,145,178,0.3)",  color:"#0891b2", icon: Info },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:"10px",padding:"0.8rem 1rem",boxShadow:"0 4px 16px rgba(0,0,0,0.1)" }}>
      <p style={{ fontWeight:700, marginBottom:"4px", fontFamily:"Space Grotesk" }}>{label}</p>
      {payload.map(p => p.value !== null && (
        <p key={p.dataKey} style={{ color:p.color, fontSize:"0.85rem" }}>
          {p.dataKey === "predicted" ? "🔮 Forecast" : "📊 Actual"}: <strong>{p.value?.toLocaleString()} kg CO₂e</strong>
        </p>
      ))}
    </div>
  );
};

export default function ForecastClient({ session, chartData, alerts, totalCo2, slope, forecastNext }) {
  const [target, setTarget] = useState(10);

  const actualData = chartData.filter(d => d.co2 > 0);
  const currentEmission = actualData[actualData.length - 1]?.co2 || 0;
  const targetEmission = currentEmission * (1 - target / 100);

  return (
    <main className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Predictive Forecasting</h1>
        <p className="page-subtitle">AI-powered emission trend analysis and future projections</p>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1rem", marginBottom:"1.5rem" }} className="delay-1 animate-fade-in">
        <div className="stat-card">
          <div className="stat-icon" style={{ background:"rgba(22,163,74,0.1)" }}><TrendingDown size={18} color="#16a34a" /></div>
          <div className="stat-label">Total CO₂e Tracked</div>
          <div className="stat-value text-gradient">{(totalCo2/1000).toFixed(2)} t</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:`rgba(${slope>0?"239,68,68":"22,163,74"},0.1)` }}>
            {slope > 0 ? <TrendingUp size={18} color="#ef4444" /> : <TrendingDown size={18} color="#16a34a" />}
          </div>
          <div className="stat-label">Monthly Trend</div>
          <div className="stat-value" style={{ color:slope>0?"#ef4444":"#16a34a", fontSize:"1.5rem" }}>
            {slope > 0 ? "+" : ""}{slope.toFixed(0)} kg/mo
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:"rgba(124,58,237,0.1)" }}><BrainCircuit size={18} color="#7c3aed" /></div>
          <div className="stat-label">Next Month Forecast</div>
          <div className="stat-value" style={{ color:"#7c3aed", fontSize:"1.5rem" }}>{(forecastNext/1000).toFixed(2)} t</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background:"rgba(245,158,11,0.1)" }}><Target size={18} color="#f59e0b" /></div>
          <div className="stat-label">Active Alerts</div>
          <div className="stat-value" style={{ color:"#f59e0b", fontSize:"1.5rem" }}>{alerts.length}</div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:"1.5rem", alignItems:"start" }}>
        <div>
          {/* Forecast Chart */}
          <div className="card delay-2 animate-fade-in" style={{ marginBottom:"1.5rem" }}>
            <div className="card-header">
              <h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><BrainCircuit size={16} color="#7c3aed" /> 6-Month History + 3-Month Forecast</h3>
            </div>
            {chartData.some(d => d.co2 > 0 || d.predicted > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={chartData} margin={{ top:5, right:20, left:0, bottom:5 }}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                  <XAxis dataKey="name" tick={{ fontSize:11, fontFamily:"Outfit" }} />
                  <YAxis tick={{ fontSize:11, fontFamily:"Outfit" }} tickFormatter={v => `${(v/1000).toFixed(1)}t`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize:"0.82rem" }} />
                  <Area type="monotone" dataKey="co2" name="Actual" stroke="#16a34a" fill="url(#actualGrad)" strokeWidth={2.5} dot={{ r:4, fill:"#16a34a" }} connectNulls={false} />
                  <Bar dataKey="predicted" name="Forecast" fill="#7c3aed" opacity={0.7} radius={[6,6,0,0]} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height:200, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)", flexDirection:"column", gap:"0.5rem" }}>
                <BrainCircuit size={36} opacity={0.3} />
                <p>Log at least 2 months of data to generate forecasts</p>
              </div>
            )}
          </div>

          {/* Target Setter */}
          <div className="card delay-3 animate-fade-in" style={{ borderLeft:"4px solid #16a34a", background:"rgba(22,163,74,0.02)" }}>
            <div className="card-header">
              <h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><Target size={16} color="#16a34a" /> Reduction Target Setter</h3>
            </div>
            <div style={{ marginBottom:"1rem" }}>
              <label style={{ fontSize:"0.85rem", fontWeight:600, color:"var(--text-secondary)" }}>Monthly Reduction Target: <strong style={{ color:"#16a34a" }}>{target}%</strong></label>
              <input type="range" min={5} max={50} step={5} value={target} onChange={e => setTarget(Number(e.target.value))}
                style={{ width:"100%", marginTop:"0.5rem", accentColor:"#16a34a" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.75rem", color:"var(--text-secondary)" }}>
                <span>5%</span><span>50%</span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
              <div style={{ background:"#f8fafc", borderRadius:"10px", padding:"1rem", textAlign:"center" }}>
                <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)", marginBottom:"4px" }}>Current Emission</div>
                <div style={{ fontSize:"1.4rem", fontWeight:800, color:"#ef4444", fontFamily:"Space Grotesk" }}>{(currentEmission/1000).toFixed(3)} t</div>
              </div>
              <div style={{ background:"#f0fdf4", borderRadius:"10px", padding:"1rem", textAlign:"center" }}>
                <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)", marginBottom:"4px" }}>Target Emission</div>
                <div style={{ fontSize:"1.4rem", fontWeight:800, color:"#16a34a", fontFamily:"Space Grotesk" }}>{(targetEmission/1000).toFixed(3)} t</div>
              </div>
            </div>
            {currentEmission > 0 && (
              <div style={{ marginTop:"1rem" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.8rem", marginBottom:"4px" }}>
                  <span>Progress to target</span>
                  <span style={{ fontWeight:600, color:"#16a34a" }}>{target}% reduction needed</span>
                </div>
                <div style={{ background:"#e2e8f0", borderRadius:"999px", height:"8px", overflow:"hidden" }}>
                  <div style={{ width:"30%", height:"100%", background:"linear-gradient(to right, #16a34a, #15803d)", borderRadius:"999px", transition:"width 0.5s" }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="delay-2 animate-fade-in">
          <div className="card">
            <div className="card-header">
              <h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><AlertTriangle size={16} color="#f59e0b" /> Smart Alerts</h3>
            </div>
            {alerts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"2rem 0", color:"var(--text-secondary)" }}>
                <CheckCircle size={32} style={{ margin:"0 auto 0.5rem", opacity:0.3 }} />
                <p style={{ fontSize:"0.85rem" }}>No alerts. Log data to enable AI recommendations.</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
                {alerts.map((a, i) => {
                  const s = ALERT_STYLES[a.type] || ALERT_STYLES.info;
                  return (
                    <div key={i} style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:"10px", padding:"0.8rem 1rem", display:"flex", gap:"8px" }}>
                      <s.icon size={16} color={s.color} style={{ flexShrink:0, marginTop:"1px" }} />
                      <p style={{ fontSize:"0.82rem", color:s.color, lineHeight:"1.5" }}>{a.msg}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
