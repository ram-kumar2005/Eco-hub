"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";
import { CloudRain, Wind, ThermometerSun, Leaf, AlertCircle, BrainCircuit, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function DashboardClient({ session, chartCategoryData, chartMonthlyData, thisMonthTotal, lastMonthTotal, aiInsights }) {
  const router = useRouter();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        }
      } catch(e) {
        console.error("Failed to fetch weather", e);
      }
    }
    fetchWeather();
  }, []);

  const diffStr = lastMonthTotal > 0 
    ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1) + "%"
    : "Data processing...";

  return (
    <div className="dashboard-layout animate-fade-in delay-100">
      {/* Sidebar / Topnav */}
      <nav className="glass-panel dash-nav">
        <div className="logo cursor-pointer" onClick={() => router.push("/")}>
          <Leaf className="logo-icon" size={24} />
          <span className="logo-text text-gradient">Eco-Hub Dashboard</span>
        </div>
        <div className="user-profile">
          <div className="avatar">
            {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="user-info">
            <span className="name">{session?.user?.name || "Student User"}</span>
            <span className="email">{session?.user?.email}</span>
            <span className="role-badge">{session?.user?.role || "STUDENT"}</span>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="logout-btn flex-center">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <div className="dash-content">
        <div className="widgets-grid">
          {/* Weather Widget */}
          <div className="glass-panel widget weather-widget">
            <div className="widget-header">
              <h3>Live Climate (Sivakasi)</h3>
              <CloudRain size={20} className="text-gradient" />
            </div>
            {weather ? (
              <div className="weather-stats">
                <div className="temp flex-center">
                  <ThermometerSun size={32} className="text-gradient" />
                  <span>{weather.main?.temp || "--"}°C</span>
                </div>
                <div className="humidity flex-center">
                  <Wind size={20} className="text-gradient-purple" />
                  <span>Humidity: {weather.main?.humidity || "--"}%</span>
                </div>
                <p className="weather-desc">{weather.weather?.[0]?.description || "Clear"}</p>
              </div>
            ) : (
              <div className="flex-center h-full text-secondary">Syncing Atmosphere...</div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="glass-panel widget stats-widget">
            <div className="widget-header">
              <h3>This Month's CO2e</h3>
              <AlertCircle size={20} style={{color: "var(--accent-color)"}} />
            </div>
            <div className="main-stat text-gradient">{(thisMonthTotal / 1000).toFixed(2)} Tons</div>
            <p className="stat-subtitle">{diffStr} from last month</p>
          </div>

          {/* XAI Insights Panel */}
          <div className="glass-panel widget action-widget">
             <div className="widget-header">
               <h3>Mepco Explainable AI</h3>
               <BrainCircuit size={20} style={{color: "var(--accent-purple)"}} />
             </div>
             <div className="ai-insights-scroll mt-2">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="ai-card" style={{borderLeft: `4px solid ${insight.color}`}}>
                    <h4>{insight.title}</h4>
                    <p>{insight.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid mt-4">
          <div className="glass-panel chart-container">
            <h3>Emission Trends (YTD)</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartMonthlyData}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="co2" stroke="#2563eb" fillOpacity={1} fill="url(#colorCo2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

           <div className="glass-panel chart-container">
            <h3>Emissions Breakdown (Total kg)</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartCategoryData}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px' }}
                    cursor={{fill: 'var(--glass-bg)'}}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-layout {
          min-height: 100vh;
          padding: 1rem;
        }

        .dash-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          margin-bottom: 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.2rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }

        .logo-icon { color: var(--accent-green); }
        .cursor-pointer { cursor: pointer; }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-purple));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 1.2rem;
        }

        .user-info { display: flex; flex-direction: column; }
        .name { font-weight: 600; font-size: 0.95rem; }
        .email { font-size: 0.8rem; color: var(--text-secondary); }
        
        .role-badge {
           font-size: 0.65rem;
           background: rgba(37,99,235,0.1);
           color: var(--accent-color);
           padding: 2px 6px;
           border-radius: 4px;
           width: max-content;
           margin-top: 4px;
           font-weight: 700;
        }

        .logout-btn {
           background: rgba(239, 68, 68, 0.05);
           color: #ef4444;
           border: 1px solid rgba(239, 68, 68, 0.2);
           border-radius: 50%;
           width: 36px;
           height: 36px;
           cursor: pointer;
           margin-left: 10px;
           transition: all 0.2s;
        }
        .logout-btn:hover {
           background: rgba(239, 68, 68, 0.15);
           transform: scale(1.05);
        }

        .dash-content { max-width: 1400px; margin: 0 auto; }

        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .widget { padding: 1.5rem; display: flex; flex-direction: column; }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .widget-header h3 { font-size: 1.1rem; color: var(--text-secondary); }

        .weather-stats {
          display: flex; flex-direction: column; gap: 10px; height: 100%; justify-content: center;
        }

        .temp {
          font-size: 2.5rem; font-weight: 700; font-family: 'Space Grotesk', sans-serif;
          gap: 10px; justify-content: flex-start;
        }

        .flex-center { display: flex; align-items: center; justify-content: center; }
        .h-full { height: 100%; }
        .humidity { font-size: 1.1rem; color: var(--text-secondary); gap: 8px; justify-content: flex-start; }
        .weather-desc { margin-top: auto; text-transform: capitalize; font-weight: 500; color: var(--accent-green); }

        .main-stat {
          font-size: 3.5rem; font-weight: 800; font-family: 'Space Grotesk', sans-serif; margin: auto 0;
        }
        .stat-subtitle { color: var(--accent-green); font-weight: 500; margin-top: auto; }
        
        .ai-insights-scroll {
           display: flex;
           flex-direction: column;
           gap: 10px;
           max-height: 200px;
           overflow-y: auto;
           padding-right: 5px;
        }
        
        .ai-card {
           background: rgba(0,0,0,0.02);
           padding: 12px;
           border-radius: 8px;
        }
        .ai-card h4 { font-size: 0.9rem; margin-bottom: 4px; }
        .ai-card p { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; }

        .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        @media (max-width: 1024px) { .charts-grid { grid-template-columns: 1fr; } }

        .chart-container { padding: 1.5rem; }
        .chart-container h3 { font-size: 1.2rem; margin-bottom: 1.5rem; }
        .chart-wrapper { width: 100%; border-radius: 12px; overflow: hidden; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1.5rem; }
      `}</style>
    </div>
  );
}
