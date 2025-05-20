import prisma from "@/lib/prisma";
import { getTodayUtcRange, hasHoursPassed, hourToUtc } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

// Check if observing time exist or not and return each data count
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

    if (!time) {
      return NextResponse.json({ time: null, error: "No time found" }, { status: 404 });
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

// Check if observing time is passed or not
export async function GET() {
  try {

    const { startToday, endToday } = getTodayUtcRange();

    const time = await prisma.observingTime.findFirst({
      where: {
        utcTime: {
          gte: startToday,
          lte: endToday,
        },
      },
      orderBy: {
        utcTime: "desc",
      },
    });

    if (!time) {
      return NextResponse.json({ time: null, isPassed: false }, { status: 404 });
    }

    const utcTime = time.utcTime.toISOString();

    // Check if 3 hours have passed since the last time
    const isPassed = hasHoursPassed(utcTime, 3);

    return NextResponse.json({
        time: utcTime,
        isPassed,
    });
  } catch (error) {
    console.error("Error checking time:", error);
    return NextResponse.json(
      { error: "Failed to check time" },
      { status: 500 }
    );
  }
}

