import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/getSession";
import { getTodayUtcRange } from "@/lib/utils";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const session = await getSession();
    
        if (!session || !session.user?.id) {
          return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
          );
        }
    
    
        // First, find the ObservingTime record by its UTC time
        const observingTime = await prisma.observingTime.findFirst({
          select: {
            id: true,
            utcTime: true,
            _count: {
              select: {
                MeteorologicalEntry: true,
                WeatherObservation: true,
              }
            }
          },
          orderBy: {
            utcTime: "desc",
          }
        });
    
        if (!observingTime) {
          return NextResponse.json({
            message: "No observing time for today",
            status: 404,
          });
        }
    
        // Get station ID from session
        const stationId = session.user.station?.stationId;
        if (!stationId) {
          return NextResponse.json({
            message: "Station ID is required",
            status: 400,
          });
        }
    
        // Find the station by stationId to get its primary key (id)
        const stationRecord = await prisma.station.findFirst({
          where: { stationId },
        });
    
        if (!stationRecord) {
          return NextResponse.json({
            message: `No station found with ID: ${stationId}`,
            status: 404,
          });
        }

    const newEntry = await prisma.synopticCode.create({
      data: {
        dataType: body.dataType || "SYNOP",

        // Measurement fields
        C1: body.C1 || null,
        Iliii: body.Iliii || null,
        iRiXhvv: body.iRiXhvv || null,
        Nddff: body.Nddff || null,
        S1nTTT: body.S1nTTT || null,
        S2nTddTddTdd: body.S2nTddTddTdd || null,
        P3PPP4PPPP: body.P3PPP4PPPP || null,
        RRRtR6: body.RRRtR6 || null,
        wwW1W2: body.wwW1W2 || null,
        NhClCmCh: body.NhClCmCh || null,
        S2nTnTnTnInInInIn: body.S2nTnTnTnInInInIn || null,
        D56DLDMDH: body.D56DLDMDH || null,
        CD57DaEc: body.CD57DaEc || null,
        avgTotalCloud: body.avgTotalCloud || null,
        C2: body.C2 || null,
        GG: body.GG || null,
        P24Group58_59: body.P24Group58_59 || null,
        R24Group6_7: body.R24Group6_7 || null,
        NsChshs: body.NsChshs || null,
        dqqqt90: body.dqqqt90 || null,
        fqfqfq91: body.fqfqfq91 || null,

        weatherRemark: body.weatherRemark || null,

        ObservingTime: {
          connect: {
            id: observingTime?.id,
            stationId: stationRecord.id,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Synoptic entry saved", data: newEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save synoptic entry:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}



export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const stationId = session.user.station?.stationId;
    if (!stationId) {
      return NextResponse.json({ message: "Station ID is missing" }, { status: 400 });
    }

    const station = await prisma.station.findFirst({
      where: { stationId },
    });

    if (!station) {
      return NextResponse.json({ message: "Station not found" }, { status: 404 });
    }

    const { startToday, endToday } = getTodayUtcRange();

    const todayEntries = await prisma.synopticCode.findMany({
      where: {
        ObservingTime: {
          stationId: station.id,
          utcTime: {
            gte: startToday,
            lt: endToday, // Use lt to avoid 00:00 of the next day
          },
        },
      },
      include: {
        ObservingTime: true,
      },
      orderBy: {
        ObservingTime: {
          utcTime: "desc",
        },
      },
    });

    return NextResponse.json(todayEntries);
  } catch (error) {
    console.error("Error fetching today's synoptic data:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}