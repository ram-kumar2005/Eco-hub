import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { footprintKg, pledgePercent, commuteKmDay, dietType, deviceHrsDay, flightsPerYear } = body;

  try {
    // Upsert — one pledge per user
    await prisma.personalPledge.create({
      data: {
        userId: session.user.id,
        footprintKg: parseFloat(footprintKg),
        pledgePercent: parseFloat(pledgePercent),
        commuteKmDay: parseFloat(commuteKmDay) || 0,
        dietType: dietType || "veg",
        deviceHrsDay: parseFloat(deviceHrsDay) || 4,
        flightsPerYear: parseInt(flightsPerYear) || 0,
      }
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pledges = await prisma.personalPledge.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(pledges);
}
