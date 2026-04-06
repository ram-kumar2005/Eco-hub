import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import Sidebar from "../../components/Sidebar";
import EventsClient from "./EventsClient";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const events = await prisma.ecoEvent.findMany({
    include: { rsvps: { select: { userId: true } } },
    orderBy: { eventDate: "asc" },
  });

  const serialized = events.map(e => ({
    ...e,
    eventDate: e.eventDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
    rsvpCount: e.rsvps.length,
    hasRSVPd: e.rsvps.some(r => r.userId === session.user.id),
    rsvps: undefined,
  }));

  return (
    <div className="app-shell">
      <Sidebar user={session.user} />
      <EventsClient session={session} events={serialized} />
    </div>
  );
}
