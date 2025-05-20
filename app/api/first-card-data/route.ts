import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/getSession";
import { hourToUtc } from "@/lib/utils";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    console.log("API", data.observingTimeId)

    const formattedObservingTime = hourToUtc(data.observingTimeId)
    
    // First, find the ObservingTime record by its UTC time
    const observingTime = await prisma.observingTime.findUnique({
      where: {
        utcTime: formattedObservingTime
      }
    });
    
    if (!observingTime) {
      return NextResponse.json({ 
        message: "Observation time not found", 
        error: "The selected hour does not exist in the database" 
      }, { status: 404 });
    }

    const dataType = typeof data.dataType === "string"
      ? data.dataType
      : Object.values(data.dataType || {}).join("") || "";
    
    // Get station ID from session
    const stationId = session.user.station?.stationId;
    
    if (!stationId) {
      return NextResponse.json({ 
        message: "Station ID is required", 
        status: 400 
      });
    }
    
    // Find the station by stationId to get its primary key (id)
    const stationRecord = await prisma.station.findFirst({
      where: { stationId }
    });
    
    if (!stationRecord) {
      return NextResponse.json({
        message: `No station found with ID: ${stationId}`,
        status: 404
      });
    }

    const savedEntry = await prisma.meteorologicalEntry.create({
      data: {
        dataType,
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
        
        // Connect to existing ObservingTime and Station records
        ObservingTime: {
          connect: {
            id: observingTime.id
          }
        },
        station: {
          connect: {
            id: stationRecord.id
          }
        }
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

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const stationId = session.user.station?.stationId;

    if (!stationId) {
      return NextResponse.json(
        { message: "Station ID is required" },
        { status: 400 }
      );
    }

    // Find the station by stationId to get its primary key (id)
    const stationRecord = await prisma.station.findFirst({
      where: { stationId }
    });

    if (!stationRecord) {
      return NextResponse.json({
        message: `No station found with ID: ${stationId}`,
        status: 404
      });
    }

    const startTime = startDate ? new Date(startDate) : hourToUtc("00");
    const endTime = endDate ? new Date(endDate) : hourToUtc("23");

    const entries = await prisma.meteorologicalEntry.findMany({
      where: {
        stationId: stationRecord.id,
        ObservingTime: {
          utcTime: {
            gte: startTime,
            lte: endTime,
          }
        }
      },
      include: {
        ObservingTime: true,
        station: true
      },
      orderBy: {
        ObservingTime: {
          utcTime: "desc"
        }
      },
      take: 100
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

    const { id, ...data } = await req.json();
    const stationId = session.user.station?.stationId;

    if (!stationId) {
      return NextResponse.json(
        { message: "Station ID is required" },
        { status: 400 }
      );
    }

    // Find the station by stationId to get its primary key (id)
    const stationRecord = await prisma.station.findFirst({
      where: { stationId }
    });

    if (!stationRecord) {
      return NextResponse.json({
        message: `No station found with ID: ${stationId}`,
        status: 404
      });
    }

    // Verify the entry belongs to the user's station before updating
    const existingEntry = await prisma.meteorologicalEntry.findFirst({
      where: { 
        id,
        stationId: stationRecord.id 
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { message: "Entry not found or unauthorized" },
        { status: 404 }
      );
    }

    // Prepare the update data object
    const updateData: any = {
      dataType: data.dataType || "",
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
    };

    // Handle observing time update if provided
    if (data.observingTimeId) {
      const formattedObservingTime = hourToUtc(data.observingTimeId);
      const observingTime = await prisma.observingTime.findUnique({
        where: {
          utcTime: formattedObservingTime
        }
      });
      
      if (observingTime) {
        updateData.observingTimeId = observingTime.id;
      }
    }

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