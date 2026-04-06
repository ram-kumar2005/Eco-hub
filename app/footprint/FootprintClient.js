"use client";

import { useState } from "react";
import { User, Leaf, Car, Utensils, Monitor, Plane, Award, CheckCircle } from "lucide-react";

const DIET_FACTORS = { vegan: 1500, veg: 2000, nonveg: 3300 };
const COMMUTE_FACTOR = 0.21;
const DEVICE_FACTOR = 55;
const FLIGHT_FACTOR = 255;
const INDIA_AVERAGE = 1900;

function calcFootprint({ commuteKm, diet, deviceHrs, flights }) {
  return (commuteKm * 250 * COMMUTE_FACTOR) + (DIET_FACTORS[diet] || 2000) + (deviceHrs * DEVICE_FACTOR) + (flights * FLIGHT_FACTOR);
}

function GaugeBar({ value, max, color, label }) {
  const pct = Math.min(100, (value / (max || 1)) * 100);
  return (
    <div style={{ marginBottom:"0.8rem" }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.8rem", marginBottom:"4px" }}>
        <span style={{ color:"var(--text-secondary)" }}>{label}</span>
        <span style={{ fontWeight:700, color }}>{value.toFixed(0)} kg/yr</span>
      </div>
      <div style={{ background:"#e2e8f0", borderRadius:"999px", height:"8px", overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:"999px", transition:"width 0.5s ease" }} />
      </div>
    </div>
  );
}

export default function FootprintClient() {
  const [commuteKm, setCommuteKm] = useState(10);
  const [diet, setDiet] = useState("veg");
  const [deviceHrs, setDeviceHrs] = useState(4);
  const [flights, setFlights] = useState(0);
  const [pledgePercent, setPledgePercent] = useState(10);
  const [pledgeSubmitted, setPledgeSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const footprint = calcFootprint({ commuteKm, diet, deviceHrs, flights });
  const commuteCo2 = commuteKm * 250 * COMMUTE_FACTOR;
  const dietCo2 = DIET_FACTORS[diet] || 2000;
  const deviceCo2 = deviceHrs * DEVICE_FACTOR;
  const flightCo2 = flights * FLIGHT_FACTOR;
  const vsIndia = footprint - INDIA_AVERAGE;
  const pledgeSave = footprint * (pledgePercent / 100);
  const treeEquiv = Math.ceil(footprint / 21);

  async function handlePledge(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/pledge", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ footprintKg: footprint, pledgePercent, commuteKmDay: commuteKm, dietType: diet, deviceHrsDay: deviceHrs, flightsPerYear: flights })
      });
      setPledgeSubmitted(true);
    } catch {}
    setSubmitting(false);
  }

  if (pledgeSubmitted) {
    return (
      <main className="main-content">
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh", gap:"1.5rem", textAlign:"center" }}>
          <CheckCircle size={64} color="#16a34a" />
          <h2 style={{ fontSize:"2rem" }}>Pledge Submitted! 🌱</h2>
          <div className="card" style={{ padding:"2rem", maxWidth:"400px" }}>
            <p className="text-secondary" style={{ marginBottom:"0.5rem" }}>You pledged to reduce by</p>
            <p style={{ fontSize:"3rem", fontWeight:800, fontFamily:"Space Grotesk" }} className="text-gradient">{pledgePercent}%</p>
            <p style={{ color:"var(--text-secondary)", fontSize:"0.85rem", marginTop:"0.5rem" }}>
              That's <strong>{pledgeSave.toFixed(0)} kg CO₂e/year saved</strong> — like planting {Math.ceil(pledgeSave/21)} trees! 🌳
            </p>
          </div>
          <button className="btn-primary" onClick={() => setPledgeSubmitted(false)}>Calculate Again</button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Personal Footprint Tracker</h1>
        <p className="page-subtitle">Calculate your individual carbon footprint and make a sustainability pledge</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:"1.5rem", alignItems:"start" }}>
        <div>
          <div className="card delay-1 animate-fade-in" style={{ marginBottom:"1.5rem" }}>
            <div className="card-header">
              <h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><User size={16} color="#16a34a" /> Your Lifestyle</h3>
            </div>

            {/* Commute */}
            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"0.5rem" }}>
                <Car size={16} color="#ea580c" />
                <label style={{ fontWeight:600, fontSize:"0.9rem" }}>Daily Commute Distance</label>
                <span style={{ marginLeft:"auto", fontWeight:700, color:"#ea580c" }}>{commuteKm} km/day</span>
              </div>
              <input type="range" min={0} max={100} step={1} value={commuteKm} onChange={e => setCommuteKm(Number(e.target.value))} style={{ width:"100%", accentColor:"#ea580c" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.72rem", color:"var(--text-secondary)" }}><span>0 km (On-campus)</span><span>100 km</span></div>
            </div>

            {/* Diet */}
            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"0.8rem" }}>
                <Utensils size={16} color="#16a34a" />
                <label style={{ fontWeight:600, fontSize:"0.9rem" }}>Diet Type</label>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"0.8rem" }}>
                {[{v:"vegan",l:"Vegan",e:"🥦",c:"Lowest"},{v:"veg",l:"Vegetarian",e:"🥗",c:"Medium"},{v:"nonveg",l:"Non-Veg",e:"🍖",c:"Higher"}].map(d => (
                  <button key={d.v} onClick={() => setDiet(d.v)} type="button"
                    style={{ padding:"0.8rem", borderRadius:"10px", border:`2px solid ${diet===d.v?"#16a34a":"var(--border-color)"}`, background:diet===d.v?"rgba(22,163,74,0.08)":"#fff", cursor:"pointer", textAlign:"center" }}>
                    <div style={{ fontSize:"1.5rem" }}>{d.e}</div>
                    <div style={{ fontSize:"0.8rem", fontWeight:600, marginTop:"2px" }}>{d.l}</div>
                    <div style={{ fontSize:"0.7rem", color:"var(--text-secondary)" }}>{d.c}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Devices */}
            <div style={{ marginBottom:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"0.5rem" }}>
                <Monitor size={16} color="#7c3aed" />
                <label style={{ fontWeight:600, fontSize:"0.9rem" }}>Device Usage per Day</label>
                <span style={{ marginLeft:"auto", fontWeight:700, color:"#7c3aed" }}>{deviceHrs} hrs/day</span>
              </div>
              <input type="range" min={1} max={16} step={1} value={deviceHrs} onChange={e => setDeviceHrs(Number(e.target.value))} style={{ width:"100%", accentColor:"#7c3aed" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.72rem", color:"var(--text-secondary)" }}><span>1 hr</span><span>16 hrs</span></div>
            </div>

            {/* Flights */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"0.5rem" }}>
                <Plane size={16} color="#0891b2" />
                <label style={{ fontWeight:600, fontSize:"0.9rem" }}>Flights per Year</label>
                <span style={{ marginLeft:"auto", fontWeight:700, color:"#0891b2" }}>{flights} flights</span>
              </div>
              <input type="range" min={0} max={20} step={1} value={flights} onChange={e => setFlights(Number(e.target.value))} style={{ width:"100%", accentColor:"#0891b2" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.72rem", color:"var(--text-secondary)" }}><span>None</span><span>20 flights</span></div>
            </div>
          </div>

          <div className="card delay-2 animate-fade-in">
            <h3 style={{ marginBottom:"1rem", fontSize:"0.95rem", display:"flex", alignItems:"center", gap:"8px" }}><Leaf size={16} color="#16a34a" /> Emission Breakdown</h3>
            <GaugeBar value={commuteCo2} max={footprint} color="#ea580c" label="🚗 Commute" />
            <GaugeBar value={dietCo2}   max={footprint} color="#16a34a"  label="🥗 Diet" />
            <GaugeBar value={deviceCo2} max={footprint} color="#7c3aed"  label="💻 Devices" />
            <GaugeBar value={flightCo2} max={footprint} color="#0891b2"  label="✈️ Flights" />
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div className="card delay-1 animate-fade-in" style={{ textAlign:"center", borderTop:`4px solid ${footprint > INDIA_AVERAGE ? "#ef4444" : "#16a34a"}` }}>
            <p style={{ color:"var(--text-secondary)", fontSize:"0.85rem", marginBottom:"0.5rem" }}>Your Annual Footprint</p>
            <p style={{ fontSize:"3rem", fontWeight:800, fontFamily:"Space Grotesk" }} className="text-gradient">{(footprint/1000).toFixed(2)} t</p>
            <p style={{ fontSize:"0.8rem", color:"var(--text-secondary)" }}>CO₂e / year</p>
            <div style={{ marginTop:"1rem", padding:"0.8rem", borderRadius:"10px", background: vsIndia > 0 ? "rgba(239,68,68,0.05)" : "rgba(22,163,74,0.05)", border:`1px solid ${vsIndia>0?"rgba(239,68,68,0.2)":"rgba(22,163,74,0.2)"}` }}>
              {vsIndia > 0
                ? <p style={{ fontSize:"0.82rem", color:"#ef4444" }}>⚠️ {vsIndia.toFixed(0)} kg above India avg (1.9 t/yr)</p>
                : <p style={{ fontSize:"0.82rem", color:"#16a34a" }}>✅ {Math.abs(vsIndia).toFixed(0)} kg below India avg (1.9 t/yr)</p>}
            </div>
            <div style={{ marginTop:"0.8rem", fontSize:"0.8rem", color:"var(--text-secondary)" }}>
              🌳 Needs <strong>{treeEquiv} trees</strong> to offset annually
            </div>
          </div>

          <div className="card delay-2 animate-fade-in">
            <p style={{ fontSize:"0.8rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:"8px" }}>vs. Benchmarks (kg CO₂/yr)</p>
            {[{label:"India Average",value:1900,color:"#f59e0b"},{label:"Global Average",value:4700,color:"#ea580c"},{label:"Your Footprint",value:footprint,color:"#7c3aed"}].map(b => (
              <div key={b.label} style={{ marginBottom:"8px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.78rem", marginBottom:"2px" }}>
                  <span style={{ color:"var(--text-secondary)" }}>{b.label}</span>
                  <span style={{ fontWeight:700, color:b.color }}>{b.value.toFixed(0)}</span>
                </div>
                <div style={{ background:"#e2e8f0", borderRadius:"999px", height:"6px" }}>
                  <div style={{ width:`${Math.min(100,(b.value/6000)*100)}%`, height:"100%", background:b.color, borderRadius:"999px", transition:"width 0.5s" }} />
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handlePledge}>
            <div className="card delay-3 animate-fade-in" style={{ borderLeft:"4px solid #16a34a", background:"rgba(22,163,74,0.02)" }}>
              <h3 style={{ marginBottom:"0.8rem", display:"flex", alignItems:"center", gap:"8px", fontSize:"0.95rem" }}><Award size={16} color="#16a34a" /> Make a Pledge</h3>
              <label style={{ fontSize:"0.82rem", fontWeight:600, color:"var(--text-secondary)", display:"block", marginBottom:"4px" }}>
                I pledge to reduce by <strong style={{ color:"#16a34a" }}>{pledgePercent}%</strong>
              </label>
              <input type="range" min={5} max={50} step={5} value={pledgePercent} onChange={e => setPledgePercent(Number(e.target.value))} style={{ width:"100%", accentColor:"#16a34a", marginBottom:"0.8rem" }} />
              <div style={{ background:"#f0fdf4", borderRadius:"8px", padding:"0.7rem", marginBottom:"1rem", fontSize:"0.8rem", color:"#15803d" }}>
                Saves <strong>{pledgeSave.toFixed(0)} kg CO₂e/year</strong> = planting <strong>{Math.ceil(pledgeSave/21)} trees!</strong>
              </div>
              <button type="submit" className="btn-primary" style={{ width:"100%", justifyContent:"center" }} disabled={submitting}>
                <CheckCircle size={16} /> {submitting ? "Submitting..." : "Submit My Pledge 🌱"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
