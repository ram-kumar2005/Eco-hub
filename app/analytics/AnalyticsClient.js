"use client";

import Sidebar from "../../components/Sidebar";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ComposedChart,
  Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { TrendingUp, PieChart as PieIcon, BarChart2, Trees } from "lucide-react";

const COLORS = { electricity: "#2563eb", diesel: "#ea580c", canteen: "#16a34a" };
const PIE_COLORS = ["#2563eb", "#ea580c", "#16a34a"];

export default function AnalyticsClient({ session, monthlyChartData, categoryChartData, stackedData, treesData, totalCo2 }) {
  const hasData = totalCo2 > 0;

  return (
    <div className="app-shell">
      <Sidebar user={session?.user} />
      <main className="main-content animate-fade-in">
        <div className="page-header">
          <h1 className="page-title">Analytics & Visualization</h1>
          <p className="page-subtitle">Detailed carbon footprint charts for Mepco campus</p>
        </div>

        {!hasData && (
          <div className="alert alert-info" style={{marginBottom:'2rem', fontSize:'1rem', padding:'1.2rem'}}>
            📊 No emission data recorded yet. Head to <strong>Carbon Emission</strong> to log your first entry — the charts will populate automatically.
          </div>
        )}

        <div className="charts-grid">
          {/* Chart 1: Monthly CO2 Trend */}
          <div className="card delay-1 animate-fade-in">
            <div className="card-header">
              <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><TrendingUp size={16} color="var(--accent-color)" /> Monthly CO₂e Trend (kg)</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyChartData} margin={{top: 5, right: 10, bottom: 5, left: 0}}>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius:'10px', border:'1px solid #e2e8f0', boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}} />
                <Area type="monotone" dataKey="co2" stroke="#2563eb" strokeWidth={2} fill="url(#grad1)" name="CO₂e (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Category Pie Chart */}
          <div className="card delay-2 animate-fade-in">
            <div className="card-header">
              <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><PieIcon size={16} color="#ea580c" /> Emission Source Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryChartData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v} kg CO₂e`} contentStyle={{borderRadius:'10px'}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Stacked Bar — Electricity vs Diesel vs Canteen */}
          <div className="card delay-3 animate-fade-in">
            <div className="card-header">
              <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><BarChart2 size={16} color="#4f46e5" /> Monthly Stacked Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stackedData} margin={{top: 5, right: 10, bottom: 5, left: 0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{fontSize:12, fill:'#64748b'}} />
                <YAxis tick={{fontSize:11, fill:'#64748b'}} />
                <Tooltip contentStyle={{borderRadius:'10px', border:'1px solid #e2e8f0'}} />
                <Legend />
                <Bar dataKey="electricity" stackId="s" fill="#2563eb" name="Electricity" radius={[0,0,0,0]} />
                <Bar dataKey="diesel" stackId="s" fill="#ea580c" name="Diesel" />
                <Bar dataKey="canteen" stackId="s" fill="#16a34a" name="Canteen" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: CO2 vs Trees Required */}
          <div className="card delay-4 animate-fade-in">
            <div className="card-header">
              <h3 style={{display:'flex',alignItems:'center',gap:'8px'}}><Trees size={16} color="#16a34a" /> CO₂ Load vs Trees Required to Offset</h3>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={treesData} margin={{top:5, right:10, bottom:5, left:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="name" tick={{fontSize:12, fill:'#64748b'}} />
                <YAxis yAxisId="left" tick={{fontSize:11, fill:'#64748b'}} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize:11, fill:'#64748b'}} />
                <Tooltip contentStyle={{borderRadius:'10px', border:'1px solid #e2e8f0'}} />
                <Legend />
                <Bar yAxisId="left" dataKey="co2" fill="#4f46e5" name="CO₂e (kg)" radius={[4,4,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="trees" stroke="#16a34a" strokeWidth={2} name="Trees needed" dot={{fill:'#16a34a'}} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Table */}
        <div className="card" style={{marginTop:'1.5rem'}}>
          <div className="card-header"><h3>Category Summary</h3></div>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.9rem'}}>
            <thead>
              <tr style={{borderBottom:'2px solid var(--border-color)'}}>
                <th style={{textAlign:'left', padding:'0.7rem', color:'var(--text-secondary)'}}>Source</th>
                <th style={{textAlign:'right', padding:'0.7rem', color:'var(--text-secondary)'}}>Total CO₂e (kg)</th>
                <th style={{textAlign:'right', padding:'0.7rem', color:'var(--text-secondary)'}}>Tonnes</th>
                <th style={{textAlign:'right', padding:'0.7rem', color:'var(--text-secondary)'}}>% Share</th>
                <th style={{textAlign:'right', padding:'0.7rem', color:'var(--text-secondary)'}}>Records</th>
              </tr>
            </thead>
            <tbody>
              {categoryChartData.map((c, i) => (
                <tr key={i} style={{borderBottom:'1px solid var(--border-color)'}}>
                  <td style={{padding:'0.7rem', fontWeight:600}}>
                    <span style={{display:'inline-block', width:'10px', height:'10px', borderRadius:'50%', background:PIE_COLORS[i], marginRight:'8px'}}></span>
                    {c.name}
                  </td>
                  <td style={{textAlign:'right', padding:'0.7rem'}}>{c.value.toLocaleString()}</td>
                  <td style={{textAlign:'right', padding:'0.7rem'}}>{(c.value/1000).toFixed(4)}</td>
                  <td style={{textAlign:'right', padding:'0.7rem'}}>{totalCo2 > 0 ? ((c.value/totalCo2)*100).toFixed(1)+'%' : '—'}</td>
                  <td style={{textAlign:'right', padding:'0.7rem'}}>{c.count}</td>
                </tr>
              ))}
              <tr style={{background:'#f8fafc', fontWeight:700}}>
                <td style={{padding:'0.7rem'}}>Total</td>
                <td style={{textAlign:'right', padding:'0.7rem'}}>{totalCo2.toFixed(2)}</td>
                <td style={{textAlign:'right', padding:'0.7rem'}}>{(totalCo2/1000).toFixed(4)}</td>
                <td style={{textAlign:'right', padding:'0.7rem'}}>100%</td>
                <td style={{textAlign:'right', padding:'0.7rem'}}>{categoryChartData.reduce((a,c)=>a+c.count,0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
