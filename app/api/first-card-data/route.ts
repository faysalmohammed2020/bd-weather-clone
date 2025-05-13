import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/getSession";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    
    const data = await req.json();

    // Convert segmented fields (objects) to full strings
    const dataType = Object.values(data.dataType || {}).join("") || "";
    const stationNo = Object.values(data.stationNo || {}).join("") || "";
    const year = Object.values(data.year || {}).join("") || "";

    const savedEntry = await prisma.meteorologicalEntry.create({
      data: {
        userId,
        dataType,
        stationNo,
        stationName: data.stationName || "",
        year,
        subIndicator: data.subIndicator || "",
        alteredThermometer: data.alteredThermometer || "",
        barAsRead: data.barAsRead || "",
        correctedForIndex: data.correctedForIndex || "",
        heightDifference: data.heightDifference || "",
        correctionForTemp: data.correctionForTemp || "",
        stationLevelPressure: data.stationLevelPressure || "",
        seaLevelReduction: data.seaLevelReduction || "",
        correctedSeaLevelPressure: data.correctedSeaLevelPressure || "",
        afternoonReading: data.afternoonReading || "",
        pressureChange24h: data.pressureChange24h || "",

        dryBulbAsRead: data.dryBulbAsRead || "",
        wetBulbAsRead: data.wetBulbAsRead || "",
        maxMinTempAsRead: data.maxMinTempAsRead || "",

        dryBulbCorrected: data.dryBulbCorrected || "",
        wetBulbCorrected: data.wetBulbCorrected || "",
        maxMinTempCorrected: data.maxMinTempCorrected || "",

        Td: data.Td || "",
        relativeHumidity: data.relativeHumidity || "",

        squallConfirmed: String(data.squallConfirmed ?? ""),
        squallForce: data.squallForce || "",
        squallDirection: data.squallDirection || "",
        squallTime: data.squallTime || "",

        horizontalVisibility: data.horizontalVisibility || "",
        miscMeteors: data.miscMeteors || "",

        pastWeatherW1: data.pastWeatherW1 || "",
        pastWeatherW2: data.pastWeatherW2 || "",
        presentWeatherWW: data.presentWeatherWW || "",

        c2Indicator: data.c2Indicator || "",
        observationTime: data.observationTime || "",
        timestamp: data.timestamp || new Date().toISOString(),
      },
    });

    const totalCount = await prisma.meteorologicalEntry.count();

    return NextResponse.json(
      { message: "Data saved successfully", dataCount: totalCount, entry: savedEntry },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving meteorological entry:", error);
    return NextResponse.json(
      { message: "Failed to save data", error: error.message },
      { status: 500 }
    );
  }
}


export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Optionally: Add query parameter parsing for filtering
    const entries = await prisma.meteorologicalEntry.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 100, // Limit to latest 100 entries for performance
    });

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching meteorological entries:", error);
    return NextResponse.json(
      { message: "Failed to fetch data", error: error.message },
      { status: 500 }
    );
  }
}