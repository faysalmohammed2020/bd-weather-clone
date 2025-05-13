import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, securityCode, stationId, stationName } = body;

    // Validate required fields
    if (!email || !password || !role || !securityCode || !stationId || !stationName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Check if the station exists and security code matches
    const station = await prisma.station.findFirst({
      where: { stationId: stationId }
    });

    if (!station) {
      return NextResponse.json(
        { error: "Station not found" },
        { status: 404 }
      );
    }

    if (station.securityCode !== securityCode) {
      return NextResponse.json(
        { error: "Invalid security code" },
        { status: 401 }
      );
    }

    // 2. Check if user exists with the given email and role
    // Use select to explicitly specify which fields to retrieve to avoid schema mismatch issues
    const user = await prisma.users.findFirst({
      where: { 
        email,
        role
      },
      select: {
        id: true,
        email: true,
        role: true,
        stationId: true,
        stationName: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or does not have the requested role" },
        { status: 404 }
      );
    }

    // 3. Check if the user is associated with the station
    if (user.stationId !== stationId) {
      return NextResponse.json(
        { error: "User is not associated with this station" },
        { status: 403 }
      );
    }

    // 4. Authenticate the user using better-auth

      // Use the official better-auth API as per documentation
      const response = await auth.api.signInEmail({
        asResponse: true,
        body: {
          email,
          password
        }
      });
      
      // Return a success response
      // better-auth will automatically handle setting the cookies
      return response;
    } catch {
      return NextResponse.json(
        { error: "An error occurred during sign in" },
        { status: 500 }
    );
  }
}
