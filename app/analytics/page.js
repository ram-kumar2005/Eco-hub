import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import AnalyticsClient from "./AnalyticsClient";

export const dynamic = "force-dynamic";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [categoryData, allRecords, monthlyData, yearlyData] = await Promise.all([
    prisma.emissionRecord.groupBy({ by: ["type"], _sum: { calculatedCo2: true }, _count: true }),
    prisma.emissionRecord.findMany({ orderBy: { createdAt: "asc" }, take: 500 }),
    prisma.emissionRecord.groupBy({ by: ["month"], _sum: { calculatedCo2: true }, orderBy: { month: "asc" } }),
    prisma.emissionRecord.groupBy({ by: ["year","type"], _sum: { calculatedCo2: true }, orderBy: { year: "asc" } }),
  ]);

  // Monthly trend (all 12 months)
  const monthlyChartData = MONTHS.map((name, i) => {
    const found = monthlyData.find(m => m.month === i + 1);
    return { name, co2: parseFloat((found?._sum.calculatedCo2 || 0).toFixed(2)) };
  });

  // Category breakdown
  const categoryChartData = categoryData.map(c => ({
    name: c.type.charAt(0).toUpperCase() + c.type.slice(1),
    value: parseFloat((c._sum.calculatedCo2 || 0).toFixed(2)),
    count: c._count
  }));

  // Per-month stacked by type
  const stackedData = MONTHS.map((name, i) => {
    const recs = allRecords.filter(r => r.month === i + 1);
    return {
      name,
      electricity: parseFloat(recs.filter(r=>r.type==="electricity").reduce((a,c)=>a+c.calculatedCo2,0).toFixed(2)),
      diesel: parseFloat(recs.filter(r=>r.type==="diesel").reduce((a,c)=>a+c.calculatedCo2,0).toFixed(2)),
      canteen: parseFloat(recs.filter(r=>r.type==="canteen").reduce((a,c)=>a+c.calculatedCo2,0).toFixed(2)),
    };
  });

  // Trees equivalent (1 tree absorbs ~21 kg CO2/year)
  const totalCo2 = categoryData.reduce((a,c) => a + (c._sum.calculatedCo2||0), 0);
  const treesData = monthlyChartData.map(m => ({
    name: m.name,
    co2: m.co2,
    trees: parseFloat((m.co2 / 21).toFixed(1))
  }));

  return (
    <AnalyticsClient
      session={session}
      monthlyChartData={monthlyChartData}
      categoryChartData={categoryChartData}
      stackedData={stackedData}
      treesData={treesData}
      totalCo2={totalCo2}
    />
  );
}
