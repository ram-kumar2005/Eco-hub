"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

const FACTORS = { electricity: 0.82, diesel: 2.68, canteen: 2.5 };

export async function submitEmission(formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Authentication required." };

  const type = formData.get("type");
  const amount = parseFloat(formData.get("amount"));
  const month = parseInt(formData.get("month"));
  const year = parseInt(formData.get("year"));

  if (!type || isNaN(amount) || amount <= 0) return { error: "Invalid data. Amount must be positive." };

  const calculatedCo2 = amount * (FACTORS[type] || 1);

  try {
    await prisma.emissionRecord.create({
      data: { type, amount, calculatedCo2, month, year, recordedById: session.user.id }
    });
    revalidatePath("/dashboard");
    revalidatePath("/analytics");
    return { success: true, calculated: calculatedCo2 };
  } catch (e) {
    console.error(e);
    return { error: "Database error. Please try again." };
  }
}
