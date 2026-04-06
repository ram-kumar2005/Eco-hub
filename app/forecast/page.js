import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Sidebar from "../../components/Sidebar";
import ForecastClient from "./ForecastClient";

export const dynamic = "force-dynamic";

// Simple linear regression
function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0 };
  const sumX = data.reduce((a, _, i) => a + i, 0);
  const sumY = data.reduce((a, v) => a + v, 0);
  const sumXY = data.reduce((a, v, i) => a + i * v, 0);
  const sumX2 = data.reduce((a, _, i) => a + i * i, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export default async function ForecastPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [monthlyRaw, categoryData, buildingData] = await Promise.all([
    prisma.emissionRecord.groupBy({ by:["month","year"], _sum:{ calculatedCo2:true }, orderBy:{ year:"asc" } }),
    prisma.emissionRecord.groupBy({ by:["type"], _sum:{ calculatedCo2:true }, _count:true }),
    prisma.emissionRecord.groupBy({ by:["building","type"], _sum:{ calculatedCo2:true }, where:{ month:currentMonth, year:currentYear } }),
  ]);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Last 6 months of data
  const last6 = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m <= 0) { m += 12; y -= 1; }
    const found = monthlyRaw.find(r => r.month === m && r.year === y);
    last6.push({ name: MONTHS[m - 1], month: m, year: y, co2: parseFloat((found?._sum.calculatedCo2 || 0).toFixed(2)) });
  }

  // Predict next 3 months
  const vals = last6.map(d => d.co2);
  const { slope, intercept } = linearRegression(vals);
  const forecast = [1, 2, 3].map(step => {
    let m = currentMonth + step;
    let y = currentYear;
    if (m > 12) { m -= 12; y += 1; }
    const predicted = Math.max(0, intercept + slope * (vals.length - 1 + step));
    return { name: MONTHS[m - 1] + " (Forecast)", month: m, year: y, co2: 0, predicted: parseFloat(predicted.toFixed(2)) };
  });

  const chartData = [
    ...last6.map(d => ({ ...d, predicted: null })),
    ...forecast,
  ];

  // Generate alerts
  const alerts = [];
  const avgMonthly = vals.length > 0 ? vals.reduce((a,v)=>a+v,0)/vals.filter(v=>v>0).length : 0;
  const thisMonth = last6[5]?.co2 || 0;
  const lastMonthVal = last6[4]?.co2 || 0;

  if (thisMonth > lastMonthVal * 1.2 && lastMonthVal > 0) {
    alerts.push({ type:"warning", msg:`Overall emissions this month are ${(((thisMonth-lastMonthVal)/lastMonthVal)*100).toFixed(0)}% above last month. Check for equipment issues.` });
  }
  if (slope > 0 && avgMonthly > 0) {
    alerts.push({ type:"danger", msg:`Trend analysis shows emissions are rising by ~${Math.abs(slope).toFixed(0)} kg CO₂e per month. Intervention needed.` });
  }
  if (slope < -100) {
    alerts.push({ type:"success", msg:`Great work! Emissions are trending DOWN by ${Math.abs(slope).toFixed(0)} kg CO₂e per month.` });
  }
  buildingData.forEach(b => {
    if ((b._sum.calculatedCo2 || 0) > avgMonthly * 0.4 && b.building) {
      alerts.push({ type:"info", msg:`${b.building} — ${b.type} usage accounts for ${((b._sum.calculatedCo2||0)/1000).toFixed(2)} tonnes CO₂e this month.` });
    }
  });

  const totalCo2 = categoryData.reduce((a,c)=>a+(c._sum.calculatedCo2||0),0);

  return (
    <div className="app-shell">
      <Sidebar user={session.user} />
      <ForecastClient session={session} chartData={chartData} alerts={alerts} totalCo2={totalCo2} slope={slope} forecastNext={forecast[0]?.predicted || 0} />
    </div>
  );
}
