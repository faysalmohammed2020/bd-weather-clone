import prisma from "@/lib/prisma";
import { hourToUtc } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { hour } = body;

  try {
    const utcTime = hourToUtc(hour);
    const time = await prisma.observingTime.findUnique({
      where: {
        utcTime,
      },
      // need to count to see if meteorologicalData is already exists
      include: {
        _count: {
            select: {
                MeteorologicalEntry: true,
                WeatherObservation: true,
                SynopticCode: true,
                DailySummary: true,
            }
        }
      },
    });

    console.log("Time", time);

    if (!time) {
      return NextResponse.json({ error: "No time found" }, { status: 404 });
    }

    return NextResponse.json({
        time: time.utcTime,
        hasMeteorologicalData: time._count.MeteorologicalEntry > 0,
        hasWeatherObservation: time._count.WeatherObservation > 0,
        hasSynopticCode: time._count.SynopticCode > 0,
        hasDailySummary: time._count.DailySummary > 0,
    });
  } catch (error) {
    console.error("Error checking time:", error);
    return NextResponse.json(
      { error: "Failed to check time" },
      { status: 500 }
    );
  }
}
