import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Sidebar from "../../components/Sidebar";
import LeaderboardClient from "./LeaderboardClient";

export const dynamic = "force-dynamic";

const DEPARTMENTS = ["CSE","IT","ECE","EEE","Mechanical","Civil","AI & DS","MBA","Admin","Library"];

const BADGES = [
  { id:"green_pioneer",    label:"Green Pioneer",      desc:"First to log 10 emission records",    color:"#16a34a", bg:"rgba(22,163,74,0.1)" },
  { id:"solar_champion",   label:"Solar Champion",     desc:"Promoted solar awareness 3+ times",   color:"#ea580c", bg:"rgba(234,88,12,0.1)" },
  { id:"zero_waste_week",  label:"Zero Waste Week",    desc:"Zero waste logged for a full week",   color:"#0891b2", bg:"rgba(8,145,178,0.1)" },
  { id:"water_saver",      label:"Water Saver",        desc:"Reduced water usage by 20%+",         color:"#0ea5e9", bg:"rgba(14,165,233,0.1)" },
  { id:"idea_champion",    label:"Idea Champion",      desc:"Submitted a top-voted idea",          color:"#7c3aed", bg:"rgba(124,58,237,0.1)" },
  { id:"tree_planter",     label:"Tree Planter",       desc:"Participated in 2+ plantation drives",color:"#4ade80", bg:"rgba(74,222,128,0.1)" },
  { id:"eco_reporter",     label:"Eco Reporter",       desc:"Generated 5+ audit reports",          color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
  { id:"pledge_maker",     label:"Pledge Maker",       desc:"Submitted a personal carbon pledge",  color:"#ec4899", bg:"rgba(236,72,153,0.1)" },
  { id:"clean_commuter",   label:"Clean Commuter",     desc:"Used public transport for 30 days",   color:"#14b8a6", bg:"rgba(20,184,166,0.1)" },
  { id:"recycler",         label:"Master Recycler",    desc:"Logged 500kg+ recyclables",           color:"#84cc16", bg:"rgba(132,204,22,0.1)" },
  { id:"paper_reducer",    label:"Paper Reducer",      desc:"Reduced paper usage 15% in a month",  color:"#a78bfa", bg:"rgba(167,139,250,0.1)" },
  { id:"event_organizer",  label:"Event Organizer",    desc:"RSVPed to 5+ eco events",             color:"#fb923c", bg:"rgba(251,146,60,0.1)" },
];

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Get emission records by building for this and last month
  const [thisMonthRecs, lastMonthRecs, userBadges] = await Promise.all([
    prisma.emissionRecord.groupBy({ by:["building","type"], where:{ month:currentMonth, year:currentYear }, _sum:{ calculatedCo2:true } }),
    prisma.emissionRecord.groupBy({ by:["building","type"], where:{ month:prevMonth, year:prevYear }, _sum:{ calculatedCo2:true } }),
    prisma.userBadge.findMany({ include:{ user:{ select:{ name:true, email:true } } }, orderBy:{ awardedAt:"desc" }, take:20 }),
  ]);

  // Build leaderboard by department (simulated from buildings)
  const deptScores = DEPARTMENTS.map(dept => {
    const thisMonthCo2 = thisMonthRecs.filter(r => r.building?.includes(dept) || r.building === null).reduce((a,r)=>a+(r._sum.calculatedCo2||0),0);
    const lastMonthCo2 = lastMonthRecs.filter(r => r.building?.includes(dept) || r.building === null).reduce((a,r)=>a+(r._sum.calculatedCo2||0),0);
    const reduction = lastMonthCo2 > 0 ? ((lastMonthCo2 - thisMonthCo2) / lastMonthCo2 * 100) : 0;
    const score = Math.max(0, 100 + reduction * 2);
    return { dept, thisMonthCo2: parseFloat(thisMonthCo2.toFixed(2)), lastMonthCo2: parseFloat(lastMonthCo2.toFixed(2)), reduction: parseFloat(reduction.toFixed(1)), score: parseFloat(score.toFixed(1)) };
  }).sort((a,b) => b.score - a.score).map((d,i) => ({ ...d, rank: i+1 }));

  return (
    <div className="app-shell">
      <Sidebar user={session.user} />
      <LeaderboardClient session={session} deptScores={deptScores} badges={BADGES} userBadges={userBadges} />
    </div>
  );
}
