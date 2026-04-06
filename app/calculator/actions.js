"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

// Multipliers (kg CO2e per unit)
const FACTORS = {
  electricity: 0.82, // Standard grid for India approx kg CO2e per kWh
  diesel: 2.68,      // kg CO2e per Liter of diesel
  canteen: 2.5       // approx kg CO2e per kg of mixed waste
};

export async function submitEmission(formData) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return { error: "You must be logged in to record emissions." };
  }

  const type = formData.get("type");
  const amount = parseFloat(formData.get("amount"));
  const month = parseInt(formData.get("month"));
  const year = parseInt(formData.get("year"));

  if (!type || isNaN(amount) || isNaN(month) || isNaN(year)) {
    return { error: "Invalid data format." };
  }

  const calculatedCo2 = amount * (FACTORS[type] || 1);

  try {
    await prisma.emissionRecord.create({
      data: {
        type,
        amount,
        calculatedCo2,
        month,
        year,
        recordedById: session.user.id
      }
    });

    console.log(`Live DB Insert: ${type} - ${amount} units - ${calculatedCo2} kg CO2e by ${session.user.email}`);

    revalidatePath("/dashboard");
    return { success: true, calculated: calculatedCo2 };
  } catch (error) {
    console.error("DB Insert Error", error);
    return { error: "Failed to save record to the database." };
  }
}
