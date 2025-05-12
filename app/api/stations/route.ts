import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";

// GET stations based on role
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "super_admin") {
      if (session.user.stationName) {
        return NextResponse.json([{ name: session.user.stationName }]);
      }
      return NextResponse.json([]);
    }

    // Return stations from `station` table for super_admin
    const stations = await prisma.station.findMany();
    return NextResponse.json(stations);
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { message: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}

// POST create new station
export async function POST(request: Request) {
  try {
    const { name, id, securityCode } = await request.json();

    const station = await prisma.station.create({
      data: {
        name,
        id,
        securityCode,
      },
    });

    return NextResponse.json(station);
  } catch (error) {
    console.error("Error creating station:", error);
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 500 }
    );
  }
}
