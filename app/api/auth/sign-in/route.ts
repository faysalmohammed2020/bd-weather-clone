import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import moment from "moment";
import bcrypt from "bcryptjs"; // ✅ এটা যোগ করতে ভুলবেন না

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, securityCode, stationId, stationName } =
      body;

    if (
      !email ||
      !password ||
      !role ||
      !securityCode ||
      !stationId ||
      !stationName
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const station = await prisma.station.findFirst({
      where: { stationId },
    });

    if (!station || station.securityCode !== securityCode) {
      return NextResponse.json(
        { error: "Invalid station or security code" },
        { status: 401 }
      );
    }

    const user = await prisma.users.findFirst({
      where: { email, role },
      select: { id: true, email: true, role: true, Station: true },
    });

    if (!user || user.Station.stationId !== stationId) {
      return NextResponse.json(
        { error: "User not valid for this station or role" },
        { status: 403 }
      );
    }

    const existingSession = await prisma.sessions.findFirst({
      where: { userId: user.id },
      orderBy: { expiresAt: "desc" },
    });

    if (existingSession && !moment(existingSession.expiresAt).isBefore()) {
      return NextResponse.json(
        { error: "Already logged in from another device" },
        { status: 403 }
      );
    }

    // ✅ Password check
    const account = await prisma.accounts.findFirst({
      where: {
        accountId: email,
        providerId: "credentials",
      },
    });

    if (!account || !account.password) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, account.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        station: station.name,
      },
    });
  } catch (error) {
    console.error("Login Error:", error); // ✅ Error details
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 }
    );
  }
}
