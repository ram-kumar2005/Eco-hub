"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEvent(formData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return { error: "Only admins can create events." };

  const title = formData.get("title");
  const description = formData.get("description");
  const eventDate = new Date(formData.get("eventDate"));
  const location = formData.get("location") || "";
  const impactMetric = formData.get("impactMetric") || "";
  const category = formData.get("category") || "general";

  if (!title || !description || !eventDate) return { error: "Title, description, and date are required." };

  try {
    const event = await prisma.ecoEvent.create({
      data: { title, description, eventDate, location, impactMetric, category, createdById: session.user.id }
    });
    revalidatePath("/events");
    return { success: true, id: event.id };
  } catch (e) { return { error: e.message }; }
}

export async function rsvpEvent(eventId) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Login to RSVP." };

  try {
    await prisma.eventRSVP.create({
      data: { eventId, userId: session.user.id }
    });
    revalidatePath("/events");
    return { success: true };
  } catch (e) {
    if (e.code === "P2002") return { error: "Already RSVPed!" };
    return { error: e.message };
  }
}

export async function cancelRSVP(eventId) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.eventRSVP.deleteMany({
      where: { eventId, userId: session.user.id }
    });
    revalidatePath("/events");
    return { success: true };
  } catch (e) { return { error: e.message }; }
}
