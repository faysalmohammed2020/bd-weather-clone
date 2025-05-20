import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    const entry = await prisma.dailySummary.create({
      data: {
        dataType: body.dataType,
        avStationPressure: body.measurements?.[0] || null,
        avSeaLevelPressure: body.measurements?.[1] || null,
        avDryBulbTemperature: body.measurements?.[2] || null,
        avWetBulbTemperature: body.measurements?.[3] || null,
        maxTemperature: body.measurements?.[4] || null,
        minTemperature: body.measurements?.[5] || null,
        totalPrecipitation: body.measurements?.[6] || null,
        avDewPointTemperature: body.measurements?.[7] || null,
        avRelativeHumidity: body.measurements?.[8] || null,
        windSpeed: body.measurements?.[9] || null,
        windDirectionCode: body.windDirection || null,
        maxWindSpeed: body.measurements?.[11] || null,
        maxWindDirection: body.measurements?.[12] || null,
        avTotalCloud: body.measurements?.[13] || null,
        lowestVisibility: body.measurements?.[14] || null,
        totalRainDuration: body.measurements?.[15] || null,
        ObservingTime: {
          connect: {
            id: observingTime?.id,
            stationId: stationRecord.id,
          }
        }
      },
    });

    return NextResponse.json(entry);
  } catch (err) {
    console.error("❌ DB save error:", err);
    return new NextResponse("Failed to save data", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stationNo = searchParams.get("stationNo");
    const date = searchParams.get("date");

    if (!stationNo) {
      return new NextResponse("Station number is required", { status: 400 });
    }

    // Parse the date (format: "DD-MMM")
    let day: number | undefined,
      month: number | undefined,
      year: number | undefined;

    if (date) {
      const dateParts = date.split("-");
      if (dateParts.length === 2) {
        day = parseInt(dateParts[0]);
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        month = monthNames.indexOf(dateParts[1]) + 1;
        year = new Date().getFullYear(); // default to current year
      }
    }

    // First try exact match
    let summary = await prisma.dailySummary.findFirst({
      where: { stationNo, day, month, year },
      orderBy: { createdAt: "desc" },
      select: {
        maxTemperature: true,
        minTemperature: true,
        totalPrecipitation: true,
        windSpeed: true,
        avTotalCloud: true,
        totalRainDuration: true,
        avRelativeHumidity: true,
        lowestVisibility: true,
      },
    });

    // Try without year if not found
    if (!summary) {
      summary = await prisma.dailySummary.findFirst({
        where: { stationNo, day, month },
        orderBy: { createdAt: "desc" },
        select: {
          maxTemperature: true,
          minTemperature: true,
          totalPrecipitation: true,
          windSpeed: true,
          avTotalCloud: true,
          totalRainDuration: true,
          avRelativeHumidity: true,
          lowestVisibility: true,
        },
      });
    }

    // Try partial match on stationNo
    if (!summary) {
      summary = await prisma.dailySummary.findFirst({
        where: {
          stationNo: { contains: stationNo },
          day,
          month,
        },
        orderBy: { createdAt: "desc" },
        select: {
          maxTemperature: true,
          minTemperature: true,
          totalPrecipitation: true,
          windSpeed: true,
          avTotalCloud: true,
          totalRainDuration: true,
          avRelativeHumidity: true,
          lowestVisibility: true,
        },
      });
    }

    // Final fallback by station only
    if (!summary) {
      console.log(
        "Final fallback - searching for any record with this station"
      );
      summary = await prisma.dailySummary.findFirst({
        where: { stationNo },
        orderBy: { createdAt: "desc" },
        select: {
          maxTemperature: true,
          minTemperature: true,
          totalPrecipitation: true,
          windSpeed: true,
          avTotalCloud: true,
          totalRainDuration: true,
          avRelativeHumidity: true,
          lowestVisibility: true,
        },
      });
    }

    if (!summary) {
      return new NextResponse("No data found", { status: 404 });
    }

    // Transform data: divide maxTemperature and lowestVisibility by 10
    const adjustedSummary = {
      ...summary,
      maxTemperature: summary.maxTemperature
        ? (parseFloat(summary.maxTemperature as any) / 10).toFixed(1)
        : summary.maxTemperature,
      minTemperature: summary.minTemperature
        ? (parseFloat(summary.minTemperature as any) / 10).toFixed(1)
        : summary.minTemperature,
      lowestVisibility: summary.lowestVisibility
        ? (parseFloat(summary.lowestVisibility as any) / 10).toFixed(1)
        : summary.lowestVisibility,
    };

    return NextResponse.json(adjustedSummary);
  } catch (err) {
    console.error("Error:", err);
    return new NextResponse("Failed to fetch data", { status: 500 });
  }
}
