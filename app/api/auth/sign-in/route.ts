import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { issueAuthTicket } from "@/lib/auth-tickets";
import { verifyPassword } from "@/lib/password";

const PENDING_COOKIE = "jordan-weather.2fa";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role, securityCode, stationId, stationName } =
      await request.json();

    if (!email || !password || !role || !securityCode || !stationId || !stationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const station = await prisma.station.findFirst({ where: { stationId } });
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    if (station.name !== stationName || station.securityCode !== securityCode) {
      return NextResponse.json({ error: "Invalid station security code" }, { status: 401 });
    }

    const user = await prisma.users.findFirst({
      where: { email: String(email).toLowerCase(), role },
      include: {
        Station: true,
        accounts: {
          where: { providerId: "credential" },
          select: { password: true },
          take: 1,
        },
      },
    });

    if (!user || !user.accounts[0]?.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (user.banned) {
      return NextResponse.json({ error: "This account has been disabled" }, { status: 403 });
    }
    if (user.Station.stationId !== stationId) {
      return NextResponse.json(
        { error: "User is not associated with this station" },
        { status: 403 },
      );
    }
    if (!(await verifyPassword(password, user.accounts[0].password))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // A successful credential check replaces the previous single active session.
    await prisma.sessions.deleteMany({ where: { userId: user.id } });

    if (user.twoFactorEnabled) {
      const pendingTicket = await issueAuthTicket(user.id, "pending-2fa", 10 * 60);
      const response = NextResponse.json({ twoFactorRedirect: true });
      response.cookies.set(PENDING_COOKIE, pendingTicket, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 10 * 60,
        path: "/",
      });
      return response;
    }

    const loginTicket = await issueAuthTicket(user.id, "login");
    return NextResponse.json({ loginTicket });
  } catch (error) {
    console.error("Sign in failed:", error);
    return NextResponse.json({ error: "An error occurred during sign in" }, { status: 500 });
  }
}
