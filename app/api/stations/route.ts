import {NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET stations based on role
export async function GET() {
  try {
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
    const { name, stationId, securityCode } = await request.json();

    const station = await prisma.station.create({
      data: {
        name,
        stationId,
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
