"use client";

import Sidebar from "../../components/Sidebar";
import { FileText, Download, BrainCircuit, AlertTriangle, CheckCircle, Info, BarChart3, Target, Droplets, Trash2, Bus, Award } from "lucide-react";
import { useState } from "react";

const PRIORITY_STYLE = {
  HIGH:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  icon: AlertTriangle },
  MEDIUM: { color: '#ea580c', bg: 'rgba(234,88,12,0.08)',  border: 'rgba(234,88,12,0.2)',  icon: Info },
  LOW:    { color: '#16a34a', bg: 'rgba(22,163,74,0.08)',  border: 'rgba(22,163,74,0.2)',  icon: CheckCircle },
};

function ExtStatCard({ icon: Icon, color, bg, label, value, unit }) {
  return (
    <div style={{ background:"#f8fafc", borderRadius:"12px", padding:"1rem", display:"flex", flexDirection:"column", gap:"4px" }}>
      <div style={{ width:32,height:32,borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"4px" }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize:"0.75rem", color:"var(--text-secondary)", fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:"1.3rem", fontWeight:800, fontFamily:"Space Grotesk", color }}>{value}</div>
      <div style={{ fontSize:"0.7rem", color:"var(--text-secondary)" }}>{unit}</div>
    </div>
  );
}

export default function ReportClient({ session, insights, recommendations, total, elec, diesel, canteen, totalRecords, extendedData, generatedAt }) {
  const hasData = total > 0;
  const [naacMode, setNaacMode] = useState(false);
  const ed = extendedData || {};

  function downloadPDF() {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pageW = doc.internal.pageSize.getWidth();
      let y = 20;

      // ── Header ──────────────────────────────────────────────────────────────
      doc.setFillColor(22, 101, 52);
      doc.rect(0, 0, pageW, 44, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Mepco Schlenk Engineering College", 14, 16);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(naacMode
        ? "NAAC / NBA Environmental Sustainability Audit Report"
        : "Annual Sustainability Audit Report — Eco-Hub", 14, 26);
      doc.setFontSize(8);
      doc.text(`Generated: ${generatedAt}  |  By: ${session?.user?.name} (${session?.user?.role})  |  Year: ${ed.currentYear || new Date().getFullYear()}`, 14, 36);

      y = 54;
      doc.setTextColor(15, 23, 42);

      // ── Section helper ───────────────────────────────────────────────────────
      const section = (title) => {
        if (y > 255) { doc.addPage(); y = 20; }
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 101, 52);
        doc.text(title, 14, y);
        doc.setDrawColor(22, 101, 52);
        doc.line(14, y + 2, pageW - 14, y + 2);
        y += 10;
        doc.setTextColor(15, 23, 42);
      };

      const para = (text, maxW) => {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const lines = doc.splitTextToSize(text, maxW || pageW - 28);
        if (y + lines.length * 5 > 275) { doc.addPage(); y = 20; }
        doc.text(lines, 14, y);
        y += lines.length * 5 + 4;
        doc.setTextColor(15, 23, 42);
      };

      // ── Executive Summary ────────────────────────────────────────────────────
      section("1. Executive Summary");
      para(
        `This report presents the environmental sustainability performance of Mepco Schlenk Engineering College, Sivakasi for ${ed.currentYear || new Date().getFullYear()}. ` +
        `A total of ${totalRecords} emission records were logged across electricity, diesel, and canteen waste sources. ` +
        `Campus total carbon footprint is ${(total/1000).toFixed(4)} tonnes CO₂ equivalent. ` +
        `Additionally, ${(ed.water?.consumed/1000 || 0).toFixed(1)} kL of water consumption and ${(ed.waste?.recyclable || 0).toFixed(1)} kg of recyclable waste were tracked. ` +
        `${ed.eventCount || 0} sustainability events were organized and ${ed.pledgeCount || 0} personal pledges were submitted by campus community members.`
      );

      // ── Emission Breakdown ───────────────────────────────────────────────────
      section("2. Carbon Emission Breakdown");

      const tableData = [
        ["Source", "CO₂e (kg)", "CO₂e (tonnes)", "Share"],
        ["Electricity (TANGEDCO)", elec.toFixed(2), (elec/1000).toFixed(4), total > 0 ? `${((elec/total)*100).toFixed(1)}%` : "—"],
        ["Diesel Generators",      diesel.toFixed(2), (diesel/1000).toFixed(4), total > 0 ? `${((diesel/total)*100).toFixed(1)}%` : "—"],
        ["Canteen Waste",          canteen.toFixed(2), (canteen/1000).toFixed(4), total > 0 ? `${((canteen/total)*100).toFixed(1)}%` : "—"],
        ["TOTAL",                  total.toFixed(2), (total/1000).toFixed(4), "100%"],
      ];
      const colW = [72, 36, 42, 28];
      tableData.forEach((row, ri) => {
        if (y > 265) { doc.addPage(); y = 20; }
        const isHeader = ri === 0, isTotal = ri === tableData.length - 1;
        doc.setFillColor(isHeader ? 22 : isTotal ? 240 : 250, isHeader ? 101 : isTotal ? 253 : 250, isHeader ? 52 : isTotal ? 244 : 250);
        doc.rect(14, y - 4, pageW - 28, 9, "F");
        doc.setTextColor(isHeader ? 255 : 15, isHeader ? 255 : 23, isHeader ? 255 : 42);
        doc.setFont("helvetica", isHeader || isTotal ? "bold" : "normal");
        doc.setFontSize(9);
        let x = 14;
        row.forEach((cell, ci) => { doc.text(cell, x + 2, y + 2); x += colW[ci]; });
        y += 10;
      });
      y += 4;

      // ── Water & Waste ────────────────────────────────────────────────────────
      section("3. Water & Waste Management");
      const waterWaste = [
        ["Metric", "Value"],
        ["Water Consumed (kL)", `${(ed.water?.consumed/1000 || 0).toFixed(2)} kL`],
        ["Wastewater Treated (kL)", `${(ed.water?.wastewater/1000 || 0).toFixed(2)} kL`],
        ["Rainwater Harvested (kL)", `${(ed.water?.rainwater/1000 || 0).toFixed(2)} kL`],
        ["E-Waste Collected (kg)", `${(ed.waste?.ewaste || 0).toFixed(1)} kg`],
        ["Organic Waste (kg)", `${(ed.waste?.organic || 0).toFixed(1)} kg`],
        ["Recyclables Diverted (kg)", `${(ed.waste?.recyclable || 0).toFixed(1)} kg`],
      ];
      waterWaste.forEach((row, ri) => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setFillColor(ri === 0 ? 8 : ri % 2 === 0 ? 248 : 255, ri === 0 ? 145 : ri % 2 === 0 ? 250 : 255, ri === 0 ? 178 : ri % 2 === 0 ? 252 : 255);
        doc.rect(14, y - 4, pageW - 28, 8, "F");
        doc.setTextColor(ri === 0 ? 255 : 15, ri === 0 ? 255 : 23, ri === 0 ? 255 : 42);
        doc.setFont("helvetica", ri === 0 ? "bold" : "normal");
        doc.setFontSize(9);
        doc.text(row[0], 16, y + 1); doc.text(row[1], 110, y + 1);
        y += 9;
      });
      y += 4;

      // ── Transport & Paper ────────────────────────────────────────────────────
      section("4. Transport Emissions & Paper Usage");
      para(`Fleet fuel consumption: ${(ed.transport?.fuel || 0).toFixed(1)} L → ${(ed.transport?.co2/1000 || 0).toFixed(3)} tonnes CO₂e. Paper usage: ${(ed.paper?.reams || 0).toFixed(0)} reams → ${(ed.paper?.co2 || 0).toFixed(1)} kg CO₂e.`);

      // ── AI Insights ──────────────────────────────────────────────────────────
      section("5. AI Insights");
      insights.forEach(ins => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`${ins.icon} ${ins.title}: ${ins.value}`, 14, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        const lines = doc.splitTextToSize(ins.detail, pageW - 28);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 5;
      });

      // ── Recommendations ──────────────────────────────────────────────────────
      section("6. Recommendations");
      recommendations.forEach((rec, i) => {
        if (y > 262) { doc.addPage(); y = 20; }
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(rec.priority === "HIGH" ? 239 : rec.priority === "MEDIUM" ? 234 : 22, rec.priority === "HIGH" ? 68 : 88, rec.priority === "HIGH" ? 68 : 12);
        doc.text(`[${rec.priority}]`, 14, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(`${i+1}. ${rec.text}`, pageW - 42);
        doc.text(lines, 40, y);
        y += lines.length * 5 + 6;
      });

      // ── Community Engagement ─────────────────────────────────────────────────
      section("7. Community Engagement");
      para(`Sustainability Events Organized: ${ed.eventCount || 0}. Personal Carbon Pledges Submitted: ${ed.pledgeCount || 0}. Trees needed to offset total campus CO₂: ${Math.ceil(total/21)}.`);

      // ── Footer ───────────────────────────────────────────────────────────────
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(`Mepco Eco-Hub Sustainability Report ${ed.currentYear || ""} — Page ${i} of ${pageCount} — Calculations use IPCC Standard Emission Factors`, 14, doc.internal.pageSize.getHeight() - 6);
      }

      doc.save(`Mepco_Sustainability_Audit_${ed.currentYear || new Date().getFullYear()}_${naacMode ? "NAAC" : "Standard"}.pdf`);
    });
  }

  return (
    <div className="app-shell">
      <Sidebar user={session?.user} />
      <main className="main-content animate-fade-in" id="report-content">
        <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h1 className="page-title">Audit Report Generator</h1>
            <p className="page-subtitle">Auto-generated sustainability audit — {generatedAt}</p>
          </div>
          <div style={{ display:"flex", gap:"0.8rem", alignItems:"center" }}>
            <button onClick={() => setNaacMode(v => !v)} className="btn-secondary" style={{ fontSize:"0.85rem" }}>
              <FileText size={15} /> {naacMode ? "Standard Mode" : "NAAC Format"}
            </button>
            <button onClick={downloadPDF} className="btn-primary" disabled={!hasData}>
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>

        {naacMode && (
          <div className="alert alert-info" style={{ marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:"8px" }}>
            <FileText size={16} /> <strong>NAAC Mode:</strong> PDF will be formatted for NAAC/NBA accreditation submissions.
          </div>
        )}

        {!hasData ? (
          <div className="alert alert-info" style={{ fontSize:"1rem", padding:"1.5rem" }}>
            🤖 No emission data yet. Log data in <strong>Carbon Emission</strong> tab to unlock the full report.
          </div>
        ) : (
          <>
            {/* Executive Summary */}
            <div className="card delay-1 animate-fade-in" style={{ marginBottom:"1.5rem", borderLeft:"4px solid #16a34a", background:"rgba(22,163,74,0.02)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"1rem" }}>
                <BrainCircuit size={26} color="#16a34a" />
                <h2 style={{ fontSize:"1.15rem" }}>Executive Summary</h2>
              </div>
              <p style={{ color:"var(--text-secondary)", lineHeight:1.8, fontSize:"0.92rem" }}>
                Mepco campus logged <strong>{totalRecords} emission records</strong> with total carbon footprint of{" "}
                <strong>{(total/1000).toFixed(4)} tonnes CO₂e</strong>. Electricity contributes{" "}
                {((elec/total)*100).toFixed(1)}%, diesel {((diesel/total)*100).toFixed(1)}%, canteen waste{" "}
                {((canteen/total)*100).toFixed(1)}%. Offsetting requires planting{" "}
                <strong>{Math.ceil(total/21)} trees/year</strong>.
              </p>
            </div>

            {/* Extended Data Cards */}
            {ed && (
              <div className="card delay-2 animate-fade-in" style={{ marginBottom:"1.5rem" }}>
                <div className="card-header">
                  <h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><BarChart3 size={16} color="#16a34a" /> Extended Sustainability Metrics ({ed.currentYear})</h3>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"1rem" }}>
                  <ExtStatCard icon={Droplets} color="#0891b2" bg="rgba(8,145,178,0.1)" label="Water Consumed" value={`${(ed.water?.consumed/1000 || 0).toFixed(1)} kL`} unit="this year" />
                  <ExtStatCard icon={Droplets} color="#0ea5e9" bg="rgba(14,165,233,0.1)" label="Rainwater Harvested" value={`${(ed.water?.rainwater/1000 || 0).toFixed(1)} kL`} unit="this year" />
                  <ExtStatCard icon={Trash2} color="#ef4444" bg="rgba(239,68,68,0.1)" label="E-Waste" value={`${(ed.waste?.ewaste || 0).toFixed(1)} kg`} unit="collected" />
                  <ExtStatCard icon={Trash2} color="#16a34a" bg="rgba(22,163,74,0.1)" label="Recyclables" value={`${(ed.waste?.recyclable || 0).toFixed(1)} kg`} unit="diverted" />
                  <ExtStatCard icon={Bus} color="#ea580c" bg="rgba(234,88,12,0.1)" label="Transport CO₂" value={`${(ed.transport?.co2/1000 || 0).toFixed(2)} t`} unit="fleet emissions" />
                  <ExtStatCard icon={FileText} color="#7c3aed" bg="rgba(124,58,237,0.1)" label="Paper Used" value={`${(ed.paper?.reams || 0).toFixed(0)} reams`} unit={`≈ ${(ed.paper?.co2 || 0).toFixed(0)} kg CO₂`} />
                  <ExtStatCard icon={Award} color="#f59e0b" bg="rgba(245,158,11,0.1)" label="Eco Events" value={ed.eventCount || 0} unit="organized" />
                  <ExtStatCard icon={CheckCircle} color="#16a34a" bg="rgba(22,163,74,0.1)" label="Pledges Made" value={ed.pledgeCount || 0} unit="by community" />
                </div>
              </div>
            )}

            {/* Insights Grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"1.2rem", marginBottom:"1.5rem" }}>
              {insights.map((ins, i) => (
                <div key={i} className="card delay-2 animate-fade-in" style={{ borderLeft:"4px solid #16a34a" }}>
                  <div style={{ fontSize:"1.6rem", marginBottom:"0.5rem" }}>{ins.icon}</div>
                  <h4 style={{ fontSize:"0.9rem", color:"var(--text-secondary)", fontWeight:600, marginBottom:"0.3rem" }}>{ins.title}</h4>
                  <p style={{ fontSize:"1.15rem", fontWeight:800, fontFamily:"Space Grotesk", marginBottom:"0.5rem" }} className="text-gradient">{ins.value}</p>
                  <p style={{ fontSize:"0.82rem", color:"var(--text-secondary)", lineHeight:1.6 }}>{ins.detail}</p>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="card delay-3 animate-fade-in" style={{ marginBottom:"1.5rem" }}>
              <div className="card-header">
                <h3 style={{ display:"flex", alignItems:"center", gap:"8px" }}><Target size={16} color="#16a34a" /> AI-Powered Recommendations</h3>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.8rem" }}>
                {recommendations.map((rec, i) => {
                  const style = PRIORITY_STYLE[rec.priority];
                  const Icon = style.icon;
                  return (
                    <div key={i} style={{ background:style.bg, border:`1px solid ${style.border}`, borderRadius:"10px", padding:"1rem", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                      <Icon size={18} color={style.color} style={{ flexShrink:0, marginTop:"2px" }} />
                      <div>
                        <span style={{ fontSize:"0.68rem", fontWeight:700, color:style.color, textTransform:"uppercase", letterSpacing:"1px" }}>{rec.priority} Priority</span>
                        <p style={{ marginTop:"0.3rem", color:"var(--text-primary)", lineHeight:1.6, fontSize:"0.88rem" }}>{rec.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card" style={{ textAlign:"center", color:"var(--text-secondary)", fontSize:"0.8rem", padding:"1rem" }}>
              📋 Auto-generated by Mepco Eco-Hub Explainable AI Engine. All factors follow IPCC / BEE standards. &nbsp;|&nbsp; Report: <strong>{generatedAt}</strong> &nbsp;|&nbsp; Author: <strong>{session?.user?.name}</strong>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
