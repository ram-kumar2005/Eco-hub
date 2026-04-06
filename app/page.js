"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Leaf, BarChart3, Zap, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh', color:'var(--text-secondary)'}}>Redirecting...</div>;
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg, #f0f4ff 0%, #eef2ff 50%, #f0fdf4 100%)'}}>
      {/* Navbar */}
      <nav style={{padding:'1.2rem 3rem', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(255,255,255,0.8)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(0,0,0,0.06)', position:'sticky', top:0, zIndex:100}}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
          <div style={{width:'36px', height:'36px', background:'linear-gradient(135deg, #16a34a, #15803d)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <Leaf size={20} color="white" />
          </div>
          <span style={{fontFamily:'Space Grotesk', fontWeight:700, fontSize:'1.1rem', color:'#0f172a'}}>Mepco Eco-Hub</span>
        </div>
        <div style={{display:'flex', gap:'1rem'}}>
          <a href="/login" className="btn-secondary" style={{padding:'0.5rem 1.2rem', fontSize:'0.9rem'}}>Login</a>
          <a href="/login" style={{padding:'0.5rem 1.2rem', fontSize:'0.9rem', background:'linear-gradient(135deg, #16a34a, #15803d)', color:'#fff', borderRadius:'10px', fontWeight:600, display:'inline-flex', alignItems:'center', border:'none', boxShadow:'0 4px 12px rgba(22,163,74,0.3)'}}>Register Free</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{maxWidth:'1100px', margin:'0 auto', padding:'6rem 2rem 4rem', textAlign:'center'}}>
        <div style={{display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(37,99,235,0.08)', border:'1px solid rgba(37,99,235,0.2)', borderRadius:'20px', padding:'5px 14px', fontSize:'0.85rem', fontWeight:600, color:'var(--accent-color)', marginBottom:'2rem'}}>
          <span style={{width:'8px', height:'8px', background:'#16a34a', borderRadius:'50%', display:'inline-block'}}></span>
          AI & DS Club — Mepco Schlenk Engineering College, Sivakasi
        </div>
        
          <h1 style={{fontSize:'clamp(2.5rem, 6vw, 4rem)', fontFamily:'Space Grotesk', fontWeight:800, lineHeight:1.1, marginBottom:'1.5rem', color:'#0f172a'}}>
          Track & Reduce <br/>
          <span style={{background:'linear-gradient(135deg, #16a34a, #15803d)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>Campus Carbon Footprint</span>
        </h1>
        
        <p style={{fontSize:'1.2rem', color:'var(--text-secondary)', maxWidth:'680px', margin:'0 auto 3rem', lineHeight:1.7}}>
          A professional sustainability intelligence platform tracking real-time carbon emissions, waste, and resource usage — powered by Explainable AI.
        </p>

        <div style={{display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
          <a href="/login" className="btn-primary" style={{fontSize:'1rem', padding:'0.9rem 2rem'}}>
            Get Started <ArrowRight size={18} style={{marginLeft:'4px'}} />
          </a>
          <a href="#features" className="btn-secondary" style={{fontSize:'1rem', padding:'0.9rem 2rem'}}>
            See Features
          </a>
        </div>

        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'1.5rem', color:'var(--text-secondary)', fontSize:'0.85rem'}}>
          <ShieldCheck size={15} color="var(--accent-green)" />
          Restricted to @mepcoeng.ac.in accounts only
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" style={{maxWidth:'1100px', margin:'0 auto 6rem', padding:'0 2rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'1.5rem'}}>
          {[
            { icon: Zap, color:'#2563eb', bg:'rgba(37,99,235,0.08)', title:'Carbon Emission Tracker', desc:'Log electricity, diesel, and canteen waste with automated CO₂e calculations using IPCC standards.' },
            { icon: BarChart3, color:'#4f46e5', bg:'rgba(79,70,229,0.08)', title:'4 Interactive Analytics Charts', desc:'Area trends, pie breakdown, stacked monthly bars, and trees-to-offset visualization.' },
            { icon: FileText, color:'#16a34a', bg:'rgba(22,163,74,0.08)', title:'AI PDF Report', desc:'Download a full explainable AI report with insights, priority recommendations, and emission tables.' },
            { icon: ShieldCheck, color:'#ea580c', bg:'rgba(234,88,12,0.08)', title:'Role-Based Access', desc:'Admin accounts can moderate the idea board. Student accounts contribute data and view insights.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{transition:'transform 0.2s', cursor:'default'}}>
              <div style={{width:'44px', height:'44px', background:f.bg, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem'}}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{marginBottom:'0.5rem', fontSize:'1rem'}}>{f.title}</h3>
              <p style={{color:'var(--text-secondary)', fontSize:'0.875rem', lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
