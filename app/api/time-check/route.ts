import prisma from "@/lib/prisma";
import {
  getTodayUtcRange,
  getYesterdayRange,
  hasHoursPassed,
  hourToUtc,
} from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

// Check if observing time exist or not and return each data count
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { hour } = body;

  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get yesterday time & data as well.
    const { startYesterday, endYesterday } = getYesterdayRange();
    const yesterdayObservingTime = await prisma.observingTime.findMany({
      where: {
        AND: [
          {
            utcTime: {
              gte: startYesterday,
              lte: endYesterday,
            },
          },
          {
            stationId: session.user.station?.id,
          },
        ],
      },
      orderBy: {
        utcTime: "desc",
      },
      include: {
        MeteorologicalEntry: true,
      },
    });

    const utcTime = hourToUtc(hour);
    const time = await prisma.observingTime.findFirst({
      where: {
        AND: [
          {
            utcTime,
          },
          {
            stationId: session.user.station?.id,
          },
        ],
      },
      // need to count to see if meteorologicalData is already exists
      include: {
        _count: {
          select: {
            MeteorologicalEntry: true,
            WeatherObservation: true,
            SynopticCode: true,
            DailySummary: true,
          },
        },
      },
    });

    if (!time) {
      return NextResponse.json(
        { time: null, error: "No time found", yesterday: yesterdayObservingTime.length > 0 ? yesterdayObservingTime[0] : null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      time: time.utcTime,
      yesterday: {
        utcTime: yesterdayObservingTime[0]?.utcTime,
        meteorologicalEntry: yesterdayObservingTime[0]?.MeteorologicalEntry,
      },
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
  const session = await getSession();

  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { startToday, endToday } = getTodayUtcRange();

    const time = await prisma.observingTime.findFirst({
      where: {
        AND: [
          {
            utcTime: {
              gte: startToday,
              lte: endToday,
            },
          },
          {
            stationId: session.user.station?.id,
          },
        ],
      },
      include: {
        _count: {
          select: {
            MeteorologicalEntry: true,
            WeatherObservation: true,
            SynopticCode: true,
            DailySummary: true,
          },
        },
      },
      orderBy: {
        utcTime: "desc",
      },
    });

    if (!time) {
      return NextResponse.json(
        { time: null, isPassed: false },
        { status: 404 }
      );
    }

    const utcTime = time.utcTime.toISOString();

    // Check if 3 hours have passed since the last time
    const isPassed = hasHoursPassed(utcTime, 3);

    return NextResponse.json({
      hasMeteorologicalData: time._count.MeteorologicalEntry > 0,
      hasWeatherObservation: time._count.WeatherObservation > 0,
      hasSynopticCode: time._count.SynopticCode > 0,
      hasDailySummary: time._count.DailySummary > 0,
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
