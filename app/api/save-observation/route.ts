import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();


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

    if (!observingTime || !observingTime._count.MeteorologicalEntry) {
      return NextResponse.json(
        {
          message: "First card entry not found",
          error: "The selected hour does not exist in the database",
        },
        { status: 404 }
      );
    }

    if(observingTime._count.WeatherObservation){
      return NextResponse.json(
        {
          message: "Second card entry already exists",
          error: "The selected hour already has a second card entry",
        },
        { status: 404 }
      );
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

    const observationData = {
      tabActive: data.metadata?.tabActiveAtSubmission || "unknown",

      // Observer info
      observerInitial: data.observer?.["observer-initial"] || null,

      // Cloud
      lowCloudForm: data.clouds?.low?.form || null,
      lowCloudHeight: data.clouds?.low?.height || null,
      lowCloudAmount: data.clouds?.low?.amount || null,
      lowCloudDirection: data.clouds?.low?.direction || null,
      mediumCloudForm: data.clouds?.medium?.form || null,
      mediumCloudHeight: data.clouds?.medium?.height || null,
      mediumCloudAmount: data.clouds?.medium?.amount || null,
      mediumCloudDirection: data.clouds?.medium?.direction || null,
      highCloudForm: data.clouds?.high?.form || null,
      highCloudHeight: data.clouds?.high?.height || null,
      highCloudAmount: data.clouds?.high?.amount || null,
      highCloudDirection: data.clouds?.high?.direction || null,

      // Total cloud
      totalCloudAmount: data.totalCloud?.["total-cloud-amount"] || null,

      // Significant clouds
      layer1Form: data.significantClouds?.layer1?.form || null,
      layer1Height: data.significantClouds?.layer1?.height || null,
      layer1Amount: data.significantClouds?.layer1?.amount || null,
      layer2Form: data.significantClouds?.layer2?.form || null,
      layer2Height: data.significantClouds?.layer2?.height || null,
      layer2Amount: data.significantClouds?.layer2?.amount || null,
      layer3Form: data.significantClouds?.layer3?.form || null,
      layer3Height: data.significantClouds?.layer3?.height || null,
      layer3Amount: data.significantClouds?.layer3?.amount || null,
      layer4Form: data.significantClouds?.layer4?.form || null,
      layer4Height: data.significantClouds?.layer4?.height || null,
      layer4Amount: data.significantClouds?.layer4?.amount || null,

      // Rainfall
      rainfallTimeStart: data.rainfall?.["time-start"] || null,
      rainfallTimeEnd: data.rainfall?.["time-end"] || null,
      rainfallSincePrevious: data.rainfall?.["since-previous"] || null,
      rainfallDuringPrevious: data.rainfall?.["during-previous"] || null,
      rainfallLast24Hours: data.rainfall?.["last-24-hours"] || null,

      // Wind
      windFirstAnemometer: data.wind?.["first-anemometer"] || null,
      windSecondAnemometer: data.wind?.["second-anemometer"] || null,
      windSpeed: data.wind?.speed || null,
      windDirection: data.wind?.["wind-direction"] || null,
    };

    const saved = await prisma.weatherObservation.create({
      data: {
        ObservingTime: {
          connect: {
            id: observingTime?.id,
            stationId: stationRecord.id,
          },
        },
        ...observationData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Observation saved successfully",
      data: { id: saved.id, stationId: stationRecord.id },
    });
  } catch (error) {
    console.error("Error saving observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const stationIdParam = searchParams.get("stationId");

    const stationId = stationIdParam || session.user.station?.stationId;

    if (!stationId && session.user.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Station ID is required" }, { status: 400 });
    }

    let stationRecord = null;
    if (stationId && stationId !== "all") {
      stationRecord = await prisma.station.findFirst({ where: { stationId } });

      if (!stationRecord) {
        return NextResponse.json({ success: false, error: `No station found with ID: ${stationId}` }, { status: 404 });
      }
    }

    const startTime = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
    startTime.setHours(0, 0, 0, 0);
    const endTime = endDate ? new Date(endDate) : new Date();
    endTime.setHours(23, 59, 59, 999);

    const whereClause: any = {
      utcTime: {
        gte: startTime,
        lte: endTime,
      },
    };

    if (stationRecord) {
      whereClause.stationId = stationRecord.id;
    } else if (session.user.role !== "super_admin") {
      whereClause.stationId = session.user.station?.id;
    }

    const entries = await prisma.observingTime.findMany({
      where: whereClause,
      include: {
        station: true,
        user: true,
        MeteorologicalEntry: true,
        WeatherObservation: true, // Add this to include WeatherObservation data
      },
      orderBy: { utcTime: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id, type, ...updateData } = await request.json(); // Add type parameter

    if (!id) {
      return NextResponse.json({ success: false, error: "Entry ID is required" }, { status: 400 });
    }

    if (type === "weather") {
      // Handle weather observation update
      const existing = await prisma.weatherObservation.findUnique({
        where: { id },
        include: {
          ObservingTime: {
            include: {
              user: true,
              station: true,
            }
          }
        }
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: "Weather observation not found" }, { status: 404 });
      }

      const userRole = session.user.role;
      const userStationId = session.user.station?.stationId;
      const isOwner = session.user.id === existing.ObservingTime?.userId;

      let canEdit = false;
      if (userRole === "super_admin") canEdit = true;
      else if (userRole === "station_admin" && userStationId === existing.ObservingTime?.station?.stationId) canEdit = true;
      else if (userRole === "observer" && isOwner) canEdit = true;

      if (!canEdit) {
        return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 });
      }

      const updated = await prisma.weatherObservation.update({
        where: { id },
        data: updateData,
        include: {
          ObservingTime: {
            include: {
              user: true,
              station: true,
            }
          }
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: "Weather observation updated", 
        data: updated 
      });
    } else {
      // Handle observing time update (your existing code)
      const existing = await prisma.observingTime.findUnique({
        where: { id },
        include: {
          user: true,
          station: true,
        },
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: "Entry not found" }, { status: 404 });
      }

      const userRole = session.user.role;
      const userStationId = session.user.station?.stationId;
      const isOwner = session.user.id === existing.userId;

      let canEdit = false;
      if (userRole === "super_admin") canEdit = true;
      else if (userRole === "station_admin" && userStationId === existing.station.stationId) canEdit = true;
      else if (userRole === "observer" && isOwner) canEdit = true;

      if (!canEdit) {
        return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 });
      }

      const updated = await prisma.observingTime.update({
        where: { id },
        data: {
          utcTime: updateData.utcTime ? new Date(updateData.utcTime) : existing.utcTime,
          localTime: updateData.localTime ? new Date(updateData.localTime) : existing.localTime,
        },
        include: {
          user: true,
          station: true,
        },
      });

      return NextResponse.json({ success: true, message: "Entry updated", data: updated });
    }
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}