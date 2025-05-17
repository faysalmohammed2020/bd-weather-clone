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

    const dataType =
      typeof data.dataType === "string"
        ? data.dataType
        : Object.values(data.dataType || {}).join("") || "";
    const stationNo =
      typeof data.stationNo === "string"
        ? data.stationNo
        : Object.values(data.stationNo || {}).join("") || "";
     
    const year =
      typeof data.year === "string"
        ? data.year
        : Object.values(data.year || {}).join("") || "";

    const savedEntry = await prisma.meteorologicalEntry.create({
      data: {
        userId,
        dataType,
        stationNo,
        stationName: session.user.stationName || "",
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
      {
        message: "Data saved successfully",
        dataCount: totalCount,
        entry: savedEntry,
      },
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

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id, ...data } = await req.json();

    // Verify the entry belongs to the user before updating
    const existingEntry = await prisma.meteorologicalEntry.findFirst({
      where: { id, userId },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { message: "Entry not found or unauthorized" },
        { status: 404 }
      );
    }

    // Convert segmented fields (objects) to full strings if they exist
    const dataType = data.dataType
      ? Object.values(data.dataType).join("")
      : undefined;
    const stationNo = data.stationNo
      ? Object.values(data.stationNo).join("")
      : undefined;
    const year = data.year ? Object.values(data.year).join("") : undefined;

    // Prepare the update data object
    const updateData: any = {
      ...(dataType !== undefined && { dataType }),
      ...(stationNo !== undefined && { stationNo }),
      ...(year !== undefined && { year }),
      ...(data.stationName !== undefined && {
        stationName: data.stationName || "",
      }),
      ...(data.subIndicator !== undefined && {
        subIndicator: data.subIndicator || "",
      }),
      ...(data.alteredThermometer !== undefined && {
        alteredThermometer: data.alteredThermometer || "",
      }),
      ...(data.barAsRead !== undefined && { barAsRead: data.barAsRead || "" }),
      ...(data.correctedForIndex !== undefined && {
        correctedForIndex: data.correctedForIndex || "",
      }),
      ...(data.heightDifference !== undefined && {
        heightDifference: data.heightDifference || "",
      }),
      ...(data.correctionForTemp !== undefined && {
        correctionForTemp: data.correctionForTemp || "",
      }),
      ...(data.stationLevelPressure !== undefined && {
        stationLevelPressure: data.stationLevelPressure || "",
      }),
      ...(data.seaLevelReduction !== undefined && {
        seaLevelReduction: data.seaLevelReduction || "",
      }),
      ...(data.correctedSeaLevelPressure !== undefined && {
        correctedSeaLevelPressure: data.correctedSeaLevelPressure || "",
      }),
      ...(data.afternoonReading !== undefined && {
        afternoonReading: data.afternoonReading || "",
      }),
      ...(data.pressureChange24h !== undefined && {
        pressureChange24h: data.pressureChange24h || "",
      }),
      ...(data.dryBulbAsRead !== undefined && {
        dryBulbAsRead: data.dryBulbAsRead || "",
      }),
      ...(data.wetBulbAsRead !== undefined && {
        wetBulbAsRead: data.wetBulbAsRead || "",
      }),
      ...(data.maxMinTempAsRead !== undefined && {
        maxMinTempAsRead: data.maxMinTempAsRead || "",
      }),
      ...(data.dryBulbCorrected !== undefined && {
        dryBulbCorrected: data.dryBulbCorrected || "",
      }),
      ...(data.wetBulbCorrected !== undefined && {
        wetBulbCorrected: data.wetBulbCorrected || "",
      }),
      ...(data.maxMinTempCorrected !== undefined && {
        maxMinTempCorrected: data.maxMinTempCorrected || "",
      }),
      ...(data.Td !== undefined && { Td: data.Td || "" }),
      ...(data.relativeHumidity !== undefined && {
        relativeHumidity: data.relativeHumidity || "",
      }),
      ...(data.squallConfirmed !== undefined && {
        squallConfirmed: String(data.squallConfirmed ?? ""),
      }),
      ...(data.squallForce !== undefined && {
        squallForce: data.squallForce || "",
      }),
      ...(data.squallDirection !== undefined && {
        squallDirection: data.squallDirection || "",
      }),
      ...(data.squallTime !== undefined && {
        squallTime: data.squallTime || "",
      }),
      ...(data.horizontalVisibility !== undefined && {
        horizontalVisibility: data.horizontalVisibility || "",
      }),
      ...(data.miscMeteors !== undefined && {
        miscMeteors: data.miscMeteors || "",
      }),
      ...(data.pastWeatherW1 !== undefined && {
        pastWeatherW1: data.pastWeatherW1 || "",
      }),
      ...(data.pastWeatherW2 !== undefined && {
        pastWeatherW2: data.pastWeatherW2 || "",
      }),
      ...(data.presentWeatherWW !== undefined && {
        presentWeatherWW: data.presentWeatherWW || "",
      }),
      ...(data.c2Indicator !== undefined && {
        c2Indicator: data.c2Indicator || "",
      }),
      ...(data.observationTime !== undefined && {
        observationTime: data.observationTime || "",
      }),
      ...(data.timestamp !== undefined && {
        timestamp: data.timestamp || new Date().toISOString(),
      }),
    };

    const updatedEntry = await prisma.meteorologicalEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Data updated successfully", entry: updatedEntry },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating meteorological entry:", error);
    return NextResponse.json(
      { message: "Failed to update data", error: error.message },
      { status: 500 }
    );
  }
}
