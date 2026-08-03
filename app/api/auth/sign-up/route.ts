import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { issueAuthTicket } from "@/lib/auth-tickets";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, stationId } = await request.json();

    if (!name || !email || !password || !stationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (role !== "super_admin") {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (password.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters" },
        { status: 400 },
      );
    }

    const [userCount, existingUser, station] = await Promise.all([
      prisma.users.count(),
      prisma.users.findUnique({ where: { email: String(email).toLowerCase() } }),
      prisma.station.findUnique({ where: { id: stationId } }),
    ]);
    if (userCount > 0) {
      return NextResponse.json(
        { error: "Public registration is closed. Ask a super admin to create your account." },
        { status: 403 },
      );
    }
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.users.create({
        data: {
          name,
          email: String(email).toLowerCase(),
          role,
          stationId,
          emailVerified: false,
          banned: false,
          twoFactorEnabled: false,
          createdAt: now,
          updatedAt: now,
        },
      });
      await tx.accounts.create({
        data: {
          accountId: created.id,
          providerId: "credential",
          userId: created.id,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      });
      return created;
    });

    const loginTicket = await issueAuthTicket(user.id, "login");
    return NextResponse.json({ user: { id: user.id, email: user.email }, loginTicket });
  } catch (error) {
    console.error("Sign-up failed:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
