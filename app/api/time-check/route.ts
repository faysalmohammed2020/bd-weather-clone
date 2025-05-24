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


    return NextResponse.json({
      time: time?.utcTime ?? null,
      yesterday: {
        utcTime: yesterdayObservingTime[0]?.utcTime ?? null,
        meteorologicalEntry: yesterdayObservingTime[0]?.MeteorologicalEntry ?? null,
      },
      hasMeteorologicalData: time?._count?.MeteorologicalEntry ? time._count.MeteorologicalEntry > 0 : false,
      hasWeatherObservation: time?._count?.WeatherObservation ? time._count.WeatherObservation > 0 : false,
      hasSynopticCode: time?._count?.SynopticCode ? time._count.SynopticCode > 0 : false,
      hasDailySummary: time?._count?.DailySummary ? time._count.DailySummary > 0 : false,
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

    const utcTime = time?.utcTime?.toISOString() ?? null;

    // Check if 3 hours have passed since the last time
    const isPassed = utcTime && hasHoursPassed(utcTime, 3) && time?.stationId == session.user.station?.id;

    return NextResponse.json({
      hasMeteorologicalData: time?._count?.MeteorologicalEntry ? time._count.MeteorologicalEntry > 0 : false,
      hasWeatherObservation: time?._count?.WeatherObservation ? time._count.WeatherObservation > 0 : false,
      hasSynopticCode: time?._count?.SynopticCode ? time._count.SynopticCode > 0 : false,
      hasDailySummary: time?._count?.DailySummary ? time._count.DailySummary > 0 : false,
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
