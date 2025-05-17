import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const entry = await prisma.dailySummary.create({
      data: {
        userId: body.userId,
        dataType: body.dataType,
        stationNo: body.stationNo,
        year: parseInt(body.year),
        month: parseInt(body.month),
        day: parseInt(body.day),

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
        year = new Date().getFullYear(); // Or use a specific year if needed
      }
    }

    // First try exact match
    let summary = await prisma.dailySummary.findFirst({
      where: {
        stationNo,
        day,
        month,
        year,
      },
      orderBy: { createdAt: "desc" },
      select: {
        maxTemperature: true,
        minTemperature: true,
        totalPrecipitation: true,
        windSpeed: true,
        avTotalCloud: true,
      },
    });

    // If not found, try without year (in case year is incorrect)
    if (!summary) {
      summary = await prisma.dailySummary.findFirst({
        where: {
          stationNo,
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
        },
      });
    }

    // If still not found, try just matching the month/day (in case stationNo format differs)
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
        },
      });
    }

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
        },
      });
    }

    if (!summary) {
      return new NextResponse("No data found", { status: 404 });
    }

    return NextResponse.json(summary);
  } catch (err) {
    console.error("Error:", err);
    return new NextResponse("Failed to fetch data", { status: 500 });
  }
}
