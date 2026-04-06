import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import ReportClient from "./ReportClient";

export const dynamic = "force-dynamic";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function generateInsights(categoryData, monthlyData) {
  const elec = categoryData.find(c=>c.type==="electricity")?._sum.calculatedCo2 || 0;
  const diesel = categoryData.find(c=>c.type==="diesel")?._sum.calculatedCo2 || 0;
  const canteen = categoryData.find(c=>c.type==="canteen")?._sum.calculatedCo2 || 0;
  const total = elec + diesel + canteen;
  
  const insights = [];
  const recommendations = [];

  if (total === 0) {
    return { insights: [], recommendations: [], total: 0, elec, diesel, canteen };
  }

  // Analysis
  const elecPct = ((elec/total)*100).toFixed(1);
  const dieselPct = ((diesel/total)*100).toFixed(1);
  const canteenPct = ((canteen/total)*100).toFixed(1);

  insights.push({ icon: "⚡", title: "Electricity Usage", value: `${(elec/1000).toFixed(3)} tonnes CO₂e`, detail: `Constitutes ${elecPct}% of total campus emissions. Equivalent to ${Math.round(elec/0.82)} kWh consumed.` });
  insights.push({ icon: "🔥", title: "Diesel Generator Usage", value: `${(diesel/1000).toFixed(3)} tonnes CO₂e`, detail: `${dieselPct}% of footprint. Approx ${Math.round(diesel/2.68)} liters burned in DG sets.` });
  insights.push({ icon: "🗑️", title: "Canteen Waste Emissions", value: `${(canteen/1000).toFixed(3)} tonnes CO₂e`, detail: `${canteenPct}% from waste. Equivalent to ${Math.round(canteen/2.5)} kg of organic waste decomposing.` });
  insights.push({ icon: "🌳", title: "Trees Required to Offset", value: `${Math.ceil(total/21)} trees/year`, detail: `At 21 kg CO₂ absorbed per tree per year, you need ${Math.ceil(total/21)} trees to fully neutralize current emissions.` });

  // Recommendations
  if (parseFloat(elecPct) > 60) recommendations.push({ priority: "HIGH", text: "Electricity dominates emissions. Install solar panels on Main Block and CSE/IT Block rooftops to reduce grid reliance by 30–40%." });
  if (parseFloat(dieselPct) > 25) recommendations.push({ priority: "HIGH", text: "Diesel usage is above safe threshold. Schedule generator usage strictly during TANGEDCO outages only. Consider battery backup systems." });
  if (parseFloat(canteenPct) > 20) recommendations.push({ priority: "MEDIUM", text: "Canteen waste needs intervention. Fast-track biodigester installation in hostel blocks to convert organic waste to biogas." });
  if (parseFloat(dieselPct) < 15 && parseFloat(elecPct) < 65) recommendations.push({ priority: "LOW", text: "Emission ratios are relatively balanced. Continue monitoring and aim to reduce total footprint by 10% this semester." });
  recommendations.push({ priority: "MEDIUM", text: "Implement smart metering across all blocks to enable granular monitoring and identify energy waste hotspots." });
  recommendations.push({ priority: "MEDIUM", text: "Organize bi-monthly sustainability audits with AI & DS department to validate emission factors and logging accuracy." });

  const peakMonth = monthlyData.reduce((a, b) => ((a._sum.calculatedCo2||0) > (b._sum.calculatedCo2||0) ? a : b), {_sum:{calculatedCo2:0}, month:0});
  if (peakMonth.month > 0) {
    insights.push({ icon: "📅", title: "Peak Emission Month", value: MONTHS[peakMonth.month - 1], detail: `${(peakMonth._sum.calculatedCo2/1000).toFixed(3)} tonnes recorded. Could correlate with exam season power usage or festival season.` });
  }

  return { insights, recommendations, total, elec, diesel, canteen };
}

export default async function ReportPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentYear = new Date().getFullYear();

  const [categoryData, monthlyData, totalRecords, waterData, wasteData, transportData, paperData, eventCount, pledgeCount] = await Promise.all([
    prisma.emissionRecord.groupBy({ by: ["type"], _sum: { calculatedCo2: true }, _count: true }),
    prisma.emissionRecord.groupBy({ by: ["month"], _sum: { calculatedCo2: true }, orderBy: { month: "asc" } }),
    prisma.emissionRecord.count(),
    prisma.waterRecord.aggregate({ _sum: { consumed: true, wastewater: true, rainwaterHarvested: true }, where: { year: currentYear } }),
    prisma.wasteRecord.aggregate({ _sum: { ewaste: true, organic: true, recyclable: true, paper: true }, where: { year: currentYear } }),
    prisma.transportRecord.aggregate({ _sum: { calculatedCo2: true, fuelLiters: true }, where: { year: currentYear } }),
    prisma.paperRecord.aggregate({ _sum: { reams: true, calculatedCo2: true }, where: { year: currentYear } }),
    prisma.ecoEvent.count(),
    prisma.personalPledge.count(),
  ]);

  const { insights, recommendations, total, elec, diesel, canteen } = generateInsights(categoryData, monthlyData);

  const extendedData = {
    water: { consumed: waterData._sum.consumed || 0, wastewater: waterData._sum.wastewater || 0, rainwater: waterData._sum.rainwaterHarvested || 0 },
    waste: { ewaste: wasteData._sum.ewaste || 0, organic: wasteData._sum.organic || 0, recyclable: wasteData._sum.recyclable || 0, paper: wasteData._sum.paper || 0 },
    transport: { co2: transportData._sum.calculatedCo2 || 0, fuel: transportData._sum.fuelLiters || 0 },
    paper: { reams: paperData._sum.reams || 0, co2: paperData._sum.calculatedCo2 || 0 },
    eventCount,
    pledgeCount,
    currentYear,
  };

  return (
    <ReportClient
      session={session}
      insights={insights}
      recommendations={recommendations}
      total={total}
      elec={elec}
      diesel={diesel}
      canteen={canteen}
      totalRecords={totalRecords}
      extendedData={extendedData}
      generatedAt={new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
    />
  );
}
