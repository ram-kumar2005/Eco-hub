import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Sidebar from "../../components/Sidebar";
import { CloudRain, Wind, ThermometerSun, Zap, Flame, Trash2, TrendingDown, BrainCircuit, BarChart3, FileText, Lightbulb, Plus, Eye, Droplets, Trophy, Map, Calendar, User, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getWeather() {
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) return null;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Sivakasi,IN&appid=${key}&units=metric`,
      { next: { revalidate: 600 } }
    );
    return res.ok ? res.json() : null;
  } catch { return null; }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [weather, categoryData, monthlyData, totalCount, waterStats, wasteStats, eventCount, pledgeCount] = await Promise.all([
    getWeather(),
    prisma.emissionRecord.groupBy({ by: ["type"], _sum: { calculatedCo2: true } }),
    prisma.emissionRecord.groupBy({ by: ["month"], _sum: { calculatedCo2: true }, orderBy: { month: "asc" } }),
    prisma.emissionRecord.count(),
    prisma.waterRecord.aggregate({ _sum: { consumed: true }, where: { month: currentMonth, year: currentYear } }),
    prisma.wasteRecord.aggregate({ _sum: { recyclable: true }, where: { month: currentMonth, year: currentYear } }),
    prisma.ecoEvent.count(),
    prisma.personalPledge.count(),
  ]);

  const thisMonthCo2 = monthlyData.find(m => m.month === currentMonth)?._sum.calculatedCo2 || 0;
  const lastMonthCo2 = monthlyData.find(m => m.month === (currentMonth === 1 ? 12 : currentMonth - 1))?._sum.calculatedCo2 || 0;
  const totalCo2 = categoryData.reduce((a, c) => a + (c._sum.calculatedCo2 || 0), 0);
  const pct = lastMonthCo2 > 0 ? (((thisMonthCo2 - lastMonthCo2) / lastMonthCo2) * 100).toFixed(1) : null;

  const stats = [
    { label: "Total CO₂e (All Time)", value: `${(totalCo2 / 1000).toFixed(2)} t`, icon: TrendingDown, color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
    { label: "This Month", value: `${(thisMonthCo2 / 1000).toFixed(2)} t`, icon: Zap, color: "#4f46e5", bg: "rgba(79,70,229,0.1)", sub: pct ? `${pct > 0 ? "+" : ""}${pct}% vs last month` : "First month entry" },
    { label: "Electricity Share", value: `${((categoryData.find(c=>c.type==="electricity")?._sum.calculatedCo2 || 0)/1000).toFixed(2)} t`, icon: Zap, color: "#ea580c", bg: "rgba(234,88,12,0.1)" },
    { label: "Diesel Share", value: `${((categoryData.find(c=>c.type==="diesel")?._sum.calculatedCo2 || 0)/1000).toFixed(2)} t`, icon: Flame, color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
    { label: "Water This Month", value: `${((waterStats._sum.consumed || 0)/1000).toFixed(1)} kL`, icon: Droplets, color: "#0891b2", bg: "rgba(8,145,178,0.1)" },
    { label: "Recyclables This Month", value: `${(wasteStats._sum.recyclable || 0).toFixed(0)} kg`, icon: Trash2, color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    { label: "Eco Events", value: String(eventCount), icon: Calendar, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Pledges Made", value: String(pledgeCount), icon: User, color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
  ];

  const quickActions = [
    { href: "/carbonemission", label: "Log Carbon Emission", icon: Plus, style: "btn-primary" },
    { href: "/tracking",       label: "Expanded Tracking Hub", icon: Droplets, style: "btn-secondary" },
    { href: "/analytics",      label: "View Analytics & Charts", icon: BarChart3, style: "btn-secondary" },
    { href: "/forecast",       label: "Predictive Forecast", icon: TrendingUp, style: "btn-secondary" },
    { href: "/leaderboard",    label: "Dept Leaderboard", icon: Trophy, style: "btn-secondary" },
    { href: "/campusmap",      label: "Green Campus Map", icon: Map, style: "btn-secondary" },
    { href: "/events",         label: "Eco Events & RSVP", icon: Calendar, style: "btn-secondary" },
    { href: "/footprint",      label: "My Carbon Footprint", icon: User, style: "btn-secondary" },
    { href: "/report",         label: "Download Audit PDF", icon: FileText, style: "btn-secondary" },
    { href: "/complaints",     label: "Sustainability Ideas", icon: Lightbulb, style: "btn-secondary" },
  ];

  return (
    <div className="app-shell">
      <Sidebar user={session.user} />
      <main className="main-content animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Welcome back, {session.user.name?.split(" ")[0]} 🌱</h1>
          <p className="page-subtitle">Mepco Sustainability Hub — Full carbon + environmental overview</p>
        </div>

        {/* Stats Row */}
        <div className="stats-row delay-1 animate-fade-in">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <s.icon size={18} color={s.color} />
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value text-gradient">{s.value}</div>
              {s.sub && <div className={`stat-change ${parseFloat(s.sub) < 0 ? "text-green" : "text-red"}`}>{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* Weather + Quick Actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginTop:"1rem" }} className="delay-2 animate-fade-in">
          <div className="card">
            <div className="card-header">
              <h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><ThermometerSun size={16} color="var(--accent-orange)" /> Live Weather — Sivakasi</h3>
            </div>
            {weather ? (
              <div style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <ThermometerSun size={36} color="var(--accent-orange)" />
                  <span style={{ fontSize:"2.5rem", fontWeight:800, fontFamily:"Space Grotesk" }}>
                    {Math.round(weather.main?.temp)}°C
                  </span>
                </div>
                <div style={{ display:"flex", gap:"1.5rem", color:"var(--text-secondary)", fontSize:"0.9rem" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <CloudRain size={14} /> {weather.weather?.[0]?.description}
                  </span>
                  <span style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <Wind size={14} /> {weather.main?.humidity}% humidity
                  </span>
                </div>
                <div style={{ borderTop:"1px solid var(--border-color)", paddingTop:"0.8rem", display:"flex", gap:"1rem", fontSize:"0.85rem" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:"4px" }}><Wind size={13} /> Wind: {weather.wind?.speed} m/s</span>
                  <span style={{ display:"flex", alignItems:"center", gap:"4px" }}><ThermometerSun size={13} /> Feels: {Math.round(weather.main?.feels_like)}°C</span>
                  <span style={{ display:"flex", alignItems:"center", gap:"4px" }}><Eye size={13} /> Vis: {(weather.visibility/1000).toFixed(1)} km</span>
                </div>
              </div>
            ) : (
              <div style={{ color:"var(--text-secondary)", padding:"1rem 0" }}>
                Add <code>OPENWEATHER_API_KEY</code> to .env for live weather
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header"><h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><Zap size={16} color="var(--accent-color)" /> Quick Actions</h3></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.6rem" }}>
              {quickActions.map((a, i) => (
                <a key={a.href} href={a.href} className={a.style} style={{ justifyContent:"center", fontSize:"0.8rem", padding:"0.6rem 0.8rem" }}>
                  <a.icon size={14} /> {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insight Banner */}
        <div className="card delay-3 animate-fade-in" style={{ marginTop:"1.5rem", borderLeft:"4px solid var(--accent-color)", background:"rgba(22,163,74,0.03)" }}>
          <h3 style={{ marginBottom:"0.5rem", fontSize:"1rem", color:"var(--accent-color)", display:"flex", alignItems:"center", gap:"8px" }}><BrainCircuit size={18} /> AI Insight</h3>
          {totalCo2 === 0 ? (
            <p style={{ color:"var(--text-secondary)" }}>No data yet. Start by logging your first emission in <strong>Carbon Emission</strong> to unlock AI-driven insights. Then explore the new <strong>Tracking Hub</strong>, <strong>Forecast</strong>, and <strong>Leaderboard</strong> features!</p>
          ) : (
            <p style={{ color:"var(--text-secondary)" }}>
              Campus is tracking <strong>{(totalCo2/1000).toFixed(2)} tonnes CO₂e</strong> total across {totalCount} records.
              {thisMonthCo2 > lastMonthCo2 && lastMonthCo2 > 0 && " ⚠️ Emissions are up this month — check Forecast tab for AI-powered insights."}
              {thisMonthCo2 <= lastMonthCo2 && lastMonthCo2 > 0 && " ✅ Emissions are trending DOWN this month — keep it up!"}
              {lastMonthCo2 === 0 && " Use the Tracking Hub to log water, waste, and transport data for a complete environmental picture."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
