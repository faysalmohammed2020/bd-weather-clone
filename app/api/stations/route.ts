import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all stations
export async function GET() {
  try {
    const stations = await prisma.station.findMany();
    return NextResponse.json(stations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stations" },
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
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 500 }
    );
  }
}
