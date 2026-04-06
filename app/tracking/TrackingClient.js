"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplets, Trash2, Bus, FileText, CheckCircle, Send, ChevronRight } from "lucide-react";
import { submitWater, submitWaste, submitTransport, submitPaper } from "./actions";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DEPARTMENTS = ["CSE","IT","ECE","EEE","Mechanical","Civil","AI & DS","MBA","Admin","Library","Hostel","Canteen"];
const BUILDINGS = ["Main Block","Mechanical Block","EEE Block","ECE Block","CSE/IT Block","AI & DS Block","Civil Block","MBA Block","Library","Canteen & Hostel","Water Treatment Plant","Campus Ground"];

const TABS = [
  { id: "water",     label: "Water Management",  icon: Droplets, color: "#0891b2",  bg: "rgba(8,145,178,0.1)" },
  { id: "waste",     label: "Waste Tracking",    icon: Trash2,   color: "#16a34a",  bg: "rgba(22,163,74,0.1)" },
  { id: "transport", label: "Transport Emissions",icon: Bus,      color: "#ea580c",  bg: "rgba(234,88,12,0.1)" },
  { id: "paper",     label: "Paper Usage",        icon: FileText, color: "#7c3aed",  bg: "rgba(124,58,237,0.1)" },
];

function StatPill({ label, value, unit, color }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "0.8rem 1rem", display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "1.4rem", fontWeight: 800, color, fontFamily: "Space Grotesk" }}>{value}</span>
      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{unit}</span>
    </div>
  );
}

export default function TrackingClient({ session, stats }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("water");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Water state
  const [consumed, setConsumed] = useState("");
  const [wastewater, setWastewater] = useState("");
  const [rainwater, setRainwater] = useState("");
  const [location, setLocation] = useState("");

  // Waste state
  const [ewaste, setEwaste] = useState("");
  const [organic, setOrganic] = useState("");
  const [recyclable, setRecyclable] = useState("");
  const [wastePaper, setWastePaper] = useState("");
  const [wasteDept, setWasteDept] = useState("");

  // Transport state
  const [vehicleType, setVehicleType] = useState("bus");
  const [fuelType, setFuelType] = useState("diesel");
  const [fuelLiters, setFuelLiters] = useState("");
  const [totalKm, setTotalKm] = useState("");
  const [passengers, setPassengers] = useState("");

  // Paper state
  const [paperDept, setPaperDept] = useState("");
  const [reams, setReams] = useState("");

  const [notes, setNotes] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess(null);
    const fd = new FormData();
    fd.append("month", month); fd.append("year", year); fd.append("notes", notes);

    let res;
    if (activeTab === "water") {
      fd.append("consumed", consumed); fd.append("wastewater", wastewater);
      fd.append("rainwaterHarvested", rainwater); fd.append("location", location);
      res = await submitWater(fd);
    } else if (activeTab === "waste") {
      fd.append("ewaste", ewaste); fd.append("organic", organic);
      fd.append("recyclable", recyclable); fd.append("paper", wastePaper);
      fd.append("department", wasteDept);
      res = await submitWaste(fd);
    } else if (activeTab === "transport") {
      fd.append("vehicleType", vehicleType); fd.append("fuelType", fuelType);
      fd.append("fuelLiters", fuelLiters); fd.append("totalKm", totalKm);
      fd.append("passengerCount", passengers);
      res = await submitTransport(fd);
    } else {
      fd.append("department", paperDept); fd.append("reams", reams);
      res = await submitPaper(fd);
    }

    setLoading(false);
    if (res.success) { setSuccess(res); router.refresh(); }
    else setError(res.error || "Submission failed.");
  }

  if (success) {
    return (
      <main className="main-content">
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"70vh",gap:"1.5rem",textAlign:"center" }}>
          <CheckCircle size={64} color="var(--accent-green)" />
          <h2 style={{ fontSize: "1.8rem" }}>Record Saved Successfully!</h2>
          {success.calculatedCo2 !== undefined && (
            <div className="card" style={{ padding: "1.5rem", maxWidth: "360px" }}>
              <p className="text-secondary">Estimated CO₂e</p>
              <p style={{ fontSize: "2.5rem", fontWeight: 800, fontFamily: "Space Grotesk" }} className="text-gradient">
                {success.calculatedCo2.toFixed(2)} kg
              </p>
            </div>
          )}
          <div style={{ display:"flex",gap:"1rem" }}>
            <button className="btn-primary" onClick={() => { setSuccess(null); setConsumed(""); setWastewater(""); setRainwater(""); setEwaste(""); setOrganic(""); setRecyclable(""); setWastePaper(""); setFuelLiters(""); setReams(""); setNotes(""); }}>
              + Log Another
            </button>
            <a href="/analytics" className="btn-secondary">View Analytics</a>
          </div>
        </div>
      </main>
    );
  }

  const currentTab = TABS.find(t => t.id === activeTab);

  return (
    <main className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Expanded Tracking Hub</h1>
        <p className="page-subtitle">Monitor water, waste, transport emissions, and paper usage</p>
      </div>

      {/* This Month Snapshot */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"1rem", marginBottom:"1.5rem" }} className="delay-1 animate-fade-in">
        <StatPill label="Water Consumed" value={(stats.totalWater/1000).toFixed(1)} unit="kL this month" color="#0891b2" />
        <StatPill label="E-Waste" value={stats.totalEwaste.toFixed(1)} unit="kg this month" color="#ef4444" />
        <StatPill label="Recyclables" value={stats.totalRecyclable.toFixed(1)} unit="kg this month" color="#16a34a" />
        <StatPill label="Transport CO₂" value={stats.totalTransportCo2.toFixed(0)} unit="kg CO₂e this month" color="#ea580c" />
        <StatPill label="Paper Used" value={stats.totalPaperReams.toFixed(0)} unit="reams this month" color="#7c3aed" />
        <StatPill label="Rainwater Harvested" value={(stats.totalRainwater/1000).toFixed(1)} unit="kL this month" color="#0ea5e9" />
      </div>

      {/* Tab Selector */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.5rem" }} className="delay-2 animate-fade-in">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(""); setSuccess(null); }}
            style={{
              padding:"1rem", borderRadius:"12px", border:`2px solid ${activeTab===tab.id ? tab.color : "var(--border-color)"}`,
              background: activeTab===tab.id ? tab.bg : "#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"flex-start",
              gap:"8px", transition:"all 0.2s",
            }}>
            <tab.icon size={22} color={tab.color} />
            <span style={{ fontWeight:600, fontSize:"0.85rem", fontFamily:"Outfit, sans-serif", color: activeTab===tab.id ? "var(--text-primary)" : "var(--text-secondary)" }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom:"1rem" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Month/Year row */}
        <div className="form-section delay-3 animate-fade-in">
          <h3 style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"1rem" }}>
            <currentTab.icon size={18} color={currentTab.color} /> {currentTab.label} — Log Entry
          </h3>
          <div className="form-grid" style={{ marginBottom:"1rem" }}>
            <div className="form-group">
              <label>Month *</label>
              <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field" required>
                {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Year *</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field" required>
                {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* WATER FIELDS */}
          {activeTab === "water" && (
            <div className="form-grid">
              <div className="form-group">
                <label>Water Consumed (Liters) *</label>
                <input type="number" step="0.1" min="0" value={consumed} onChange={e => setConsumed(e.target.value)} className="input-field" placeholder="e.g. 50000" required />
              </div>
              <div className="form-group">
                <label>Wastewater Treated (Liters)</label>
                <input type="number" step="0.1" min="0" value={wastewater} onChange={e => setWastewater(e.target.value)} className="input-field" placeholder="e.g. 30000" />
              </div>
              <div className="form-group">
                <label>Rainwater Harvested (Liters)</label>
                <input type="number" step="0.1" min="0" value={rainwater} onChange={e => setRainwater(e.target.value)} className="input-field" placeholder="e.g. 5000" />
              </div>
              <div className="form-group">
                <label>Location / Source</label>
                <select value={location} onChange={e => setLocation(e.target.value)} className="input-field">
                  <option value="">-- Select Location --</option>
                  {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* WASTE FIELDS */}
          {activeTab === "waste" && (
            <div className="form-grid">
              <div className="form-group">
                <label>E-Waste (kg)</label>
                <input type="number" step="0.01" min="0" value={ewaste} onChange={e => setEwaste(e.target.value)} className="input-field" placeholder="Computers, batteries, etc." />
              </div>
              <div className="form-group">
                <label>Organic / Food Waste (kg)</label>
                <input type="number" step="0.01" min="0" value={organic} onChange={e => setOrganic(e.target.value)} className="input-field" placeholder="Canteen food waste" />
              </div>
              <div className="form-group">
                <label>Recyclable Plastics (kg)</label>
                <input type="number" step="0.01" min="0" value={recyclable} onChange={e => setRecyclable(e.target.value)} className="input-field" placeholder="Plastic bottles, packaging" />
              </div>
              <div className="form-group">
                <label>Paper Waste (kg)</label>
                <input type="number" step="0.01" min="0" value={wastePaper} onChange={e => setWastePaper(e.target.value)} className="input-field" placeholder="Discarded paper" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={wasteDept} onChange={e => setWasteDept(e.target.value)} className="input-field">
                  <option value="">-- All Campus --</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* TRANSPORT FIELDS */}
          {activeTab === "transport" && (
            <div className="form-grid">
              <div className="form-group">
                <label>Vehicle Type *</label>
                <select value={vehicleType} onChange={e => setVehicleType(e.target.value)} className="input-field" required>
                  <option value="bus">College Bus Fleet</option>
                  <option value="car">Staff Cars</option>
                  <option value="twowheeler">Two-Wheelers</option>
                  <option value="commute_estimate">Commute Estimate (Day Scholars)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fuel Type *</label>
                <select value={fuelType} onChange={e => setFuelType(e.target.value)} className="input-field">
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fuel Consumed (Liters) *</label>
                <input type="number" step="0.1" min="0" value={fuelLiters} onChange={e => setFuelLiters(e.target.value)} className="input-field" placeholder="e.g. 500" required />
                {fuelLiters && <div className="alert alert-info" style={{ marginTop:"0.5rem",fontSize:"0.85rem" }}>≈ <strong>{(parseFloat(fuelLiters||0)*(fuelType==="diesel"?2.68:fuelType==="petrol"?2.31:0)).toFixed(1)} kg CO₂e</strong></div>}
              </div>
              <div className="form-group">
                <label>Total Distance (km)</label>
                <input type="number" step="0.1" min="0" value={totalKm} onChange={e => setTotalKm(e.target.value)} className="input-field" placeholder="e.g. 2000" />
              </div>
              <div className="form-group">
                <label>Passenger Count</label>
                <input type="number" min="0" value={passengers} onChange={e => setPassengers(e.target.value)} className="input-field" placeholder="e.g. 350 daily scholars" />
              </div>
            </div>
          )}

          {/* PAPER FIELDS */}
          {activeTab === "paper" && (
            <div className="form-grid">
              <div className="form-group">
                <label>Department *</label>
                <select value={paperDept} onChange={e => setPaperDept(e.target.value)} className="input-field" required>
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Reams of Paper Used *</label>
                <input type="number" step="0.5" min="0" value={reams} onChange={e => setReams(e.target.value)} className="input-field" placeholder="1 ream = 500 sheets" required />
                {reams && <div className="alert alert-info" style={{ marginTop:"0.5rem",fontSize:"0.85rem" }}>≈ <strong>{(parseFloat(reams||0)*2).toFixed(1)} kg CO₂e</strong> (500 sheets/ream)</div>}
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop:"1rem" }}>
            <label>Notes / Remarks (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field" placeholder="Any additional context..." rows={2} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ width:"100%", justifyContent:"center", padding:"1rem" }} disabled={loading}>
          <Send size={18} />
          {loading ? "Saving..." : `Submit ${currentTab.label} Record`}
        </button>
      </form>
    </main>
  );
}
