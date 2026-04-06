import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Sidebar from "../../components/Sidebar";
import TrackingClient from "./TrackingClient";

export const dynamic = "force-dynamic";

export default async function TrackingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [waterRecords, wasteRecords, transportRecords, paperRecords] = await Promise.all([
    prisma.waterRecord.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.wasteRecord.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.transportRecord.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.paperRecord.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  // Totals for this month
  const thisMonthWater = waterRecords.filter(r => r.month === currentMonth && r.year === currentYear);
  const thisMonthWaste = wasteRecords.filter(r => r.month === currentMonth && r.year === currentYear);
  const thisMonthTransport = transportRecords.filter(r => r.month === currentMonth && r.year === currentYear);
  const thisMonthPaper = paperRecords.filter(r => r.month === currentMonth && r.year === currentYear);

  const stats = {
    totalWater: thisMonthWater.reduce((a, r) => a + r.consumed, 0),
    totalWastewater: thisMonthWater.reduce((a, r) => a + r.wastewater, 0),
    totalRainwater: thisMonthWater.reduce((a, r) => a + r.rainwaterHarvested, 0),
    totalEwaste: thisMonthWaste.reduce((a, r) => a + r.ewaste, 0),
    totalOrganic: thisMonthWaste.reduce((a, r) => a + r.organic, 0),
    totalRecyclable: thisMonthWaste.reduce((a, r) => a + r.recyclable, 0),
    totalTransportCo2: thisMonthTransport.reduce((a, r) => a + r.calculatedCo2, 0),
    totalPaperCo2: thisMonthPaper.reduce((a, r) => a + r.calculatedCo2, 0),
    totalPaperReams: thisMonthPaper.reduce((a, r) => a + r.reams, 0),
  };

  return (
    <div className="app-shell">
      <Sidebar user={session.user} />
      <TrackingClient session={session} stats={stats} />
    </div>
  );
}
