"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Water ───────────────────────────────────────────────────────────────────
export async function submitWater(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const consumed = parseFloat(formData.get("consumed")) || 0;
  const wastewater = parseFloat(formData.get("wastewater")) || 0;
  const rainwaterHarvested = parseFloat(formData.get("rainwaterHarvested")) || 0;
  const month = parseInt(formData.get("month"));
  const year = parseInt(formData.get("year"));
  const location = formData.get("location") || "";
  const notes = formData.get("notes") || "";

  if (!consumed || !month || !year) return { error: "Fill all required fields." };

  try {
    await prisma.waterRecord.create({
      data: { consumed, wastewater, rainwaterHarvested, month, year, location, notes, recordedById: session.user.id }
    });
    revalidatePath("/tracking");
    return { success: true };
  } catch (e) { return { error: e.message }; }
}

// ─── Waste ───────────────────────────────────────────────────────────────────
export async function submitWaste(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const ewaste = parseFloat(formData.get("ewaste")) || 0;
  const organic = parseFloat(formData.get("organic")) || 0;
  const recyclable = parseFloat(formData.get("recyclable")) || 0;
  const paper = parseFloat(formData.get("paper")) || 0;
  const month = parseInt(formData.get("month"));
  const year = parseInt(formData.get("year"));
  const department = formData.get("department") || "";
  const notes = formData.get("notes") || "";

  if (!month || !year) return { error: "Fill all required fields." };

  try {
    await prisma.wasteRecord.create({
      data: { ewaste, organic, recyclable, paper, month, year, department, notes, recordedById: session.user.id }
    });
    revalidatePath("/tracking");
    return { success: true };
  } catch (e) { return { error: e.message }; }
}

// ─── Transport ───────────────────────────────────────────────────────────────
const TRANSPORT_FACTORS = { diesel: 2.68, petrol: 2.31, electric: 0.0 };

export async function submitTransport(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const vehicleType = formData.get("vehicleType");
  const fuelType = formData.get("fuelType") || "diesel";
  const fuelLiters = parseFloat(formData.get("fuelLiters")) || 0;
  const totalKm = parseFloat(formData.get("totalKm")) || 0;
  const passengerCount = parseInt(formData.get("passengerCount")) || 0;
  const month = parseInt(formData.get("month"));
  const year = parseInt(formData.get("year"));
  const notes = formData.get("notes") || "";

  const calculatedCo2 = fuelLiters * (TRANSPORT_FACTORS[fuelType] || 2.68);

  try {
    await prisma.transportRecord.create({
      data: { vehicleType, fuelType, fuelLiters, totalKm, passengerCount, calculatedCo2, month, year, notes, recordedById: session.user.id }
    });
    revalidatePath("/tracking");
    return { success: true, calculatedCo2 };
  } catch (e) { return { error: e.message }; }
}

// ─── Paper ───────────────────────────────────────────────────────────────────
export async function submitPaper(formData) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  const department = formData.get("department");
  const reams = parseFloat(formData.get("reams")) || 0;
  const month = parseInt(formData.get("month"));
  const year = parseInt(formData.get("year"));
  const notes = formData.get("notes") || "";
  const calculatedCo2 = reams * 2; // 1 ream ≈ 2 kg CO2e

  if (!department || !reams || !month || !year) return { error: "Fill all required fields." };

  try {
    await prisma.paperRecord.create({
      data: { department, reams, calculatedCo2, month, year, notes, recordedById: session.user.id }
    });
    revalidatePath("/tracking");
    return { success: true, calculatedCo2 };
  } catch (e) { return { error: e.message }; }
}
