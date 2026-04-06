import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, password, name, adminSecret } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!email.endsWith("@mepcoeng.ac.in")) {
      return NextResponse.json({ error: "Must use a valid @mepcoeng.ac.in email address" }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists. Please login." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if registering as admin
    const role = (adminSecret === "MEPCO_ADMIN_2026") ? "ADMIN" : "STUDENT";

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: hashedPassword,
        role
      }
    });

    return NextResponse.json({ success: true, message: "Account created", role: user.role });
  } catch (error) {
    console.error("Registration Error", error);
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
  }
}
