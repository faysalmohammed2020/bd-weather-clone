import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { hourToUtc } from "@/lib/utils";

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

    const formattedObservingTime = hourToUtc(data.observingTimeId);
    // First, find the ObservingTime record by its UTC time
    const observingTime = await prisma.observingTime.findUnique({
      where: {
        utcTime: formattedObservingTime,
      },
    });

    if (!observingTime) {
      return NextResponse.json(
        {
          message: "Observation time not found",
          error: "The selected hour does not exist in the database",
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
        station: {
          connect: {
            id: stationRecord.id,
          },
        },
        ObservingTime: {
          connect: {
            id: observingTime.id,
          },
        },
        ...observationData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Observation saved successfully",
      data: { id: saved.id, stationId: saved.stationId },
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

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { role, id: userId } = session.user;
    const stationId = session.user.station?.id; // Access the station ID correctly

    let observations;

    if (role === "super_admin") {
      observations = await prisma.weatherObservation.findMany({
        include: { user: true },
        orderBy: { observationTime: "desc" },
      });
    } else if (role === "station_admin") {
      observations = await prisma.weatherObservation.findMany({
        where: { stationId: stationId?.toString() },
        include: { user: true },
        orderBy: { observationTime: "desc" },
      });
    } else {
      observations = await prisma.weatherObservation.findMany({
        where: { userId },
        include: { user: true },
        orderBy: { observationTime: "desc" },
      });
    }

    const formatted = observations.map((obs) => ({
      metadata: {
        id: obs.id,
        stationId: obs.stationId,
        tabActive: obs.tabActive,
        submittedAt: obs.submittedAt,
      },
      observer: {
        "observer-initial": obs.observerInitial,
        "observation-time": obs.observationTime || null,
        name: obs.user?.name,
        email: obs.user?.email,
        role: obs.user?.role,
      },
      clouds: {
        low: {
          direction: obs.lowCloudDirection,
          height: obs.lowCloudHeight,
          form: obs.lowCloudForm,
          amount: obs.lowCloudAmount,
        },
        medium: {
          direction: obs.mediumCloudDirection,
          height: obs.mediumCloudHeight,
          form: obs.mediumCloudForm,
          amount: obs.mediumCloudAmount,
        },
        high: {
          direction: obs.highCloudDirection,
          height: obs.highCloudHeight,
          form: obs.highCloudForm,
          amount: obs.highCloudAmount,
        },
      },
      totalCloud: {
        "total-cloud-amount": obs.totalCloudAmount,
      },
      significantClouds: {
        layer1: {
          height: obs.layer1Height,
          form: obs.layer1Form,
          amount: obs.layer1Amount,
        },
        layer2: {
          height: obs.layer2Height,
          form: obs.layer2Form,
          amount: obs.layer2Amount,
        },
        layer3: {
          height: obs.layer3Height,
          form: obs.layer3Form,
          amount: obs.layer3Amount,
        },
        layer4: {
          height: obs.layer4Height,
          form: obs.layer4Form,
          amount: obs.layer4Amount,
        },
      },
      rainfall: {
        "time-start": obs.rainfallTimeStart,
        "time-end": obs.rainfallTimeEnd,
        "since-previous": obs.rainfallSincePrevious,
        "during-previous": obs.rainfallDuringPrevious,
        "last-24-hours": obs.rainfallLast24Hours,
      },
      wind: {
        "first-anemometer": obs.windFirstAnemometer,
        "second-anemometer": obs.windSecondAnemometer,
        speed: obs.windSpeed,
        "wind-direction": obs.windDirection,
        direction: obs.windDirection,
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching observations:", error);
    return NextResponse.json(
      { success: false, error: "Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, clouds, rainfall, wind, totalCloud, observer } =
      await request.json();

    const observation = await prisma.weatherObservation.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        stationId: true,
        observationTime: true,
        submittedAt: true,
      },
    });

    if (!observation) {
      return NextResponse.json(
        { error: "Observation not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const obsTime = new Date(observation.submittedAt || now);
    const daysDiff = Math.floor((+now - +obsTime) / (1000 * 60 * 60 * 24));
    const { role, id: userId } = session.user;
    const stationId = session.user.station?.id; // Access the station ID correctly

    const canEdit =
      (role === "super_admin" && daysDiff <= 365) ||
      (role === "station_admin" &&
        observation.stationId === stationId &&
        daysDiff <= 30) ||
      (role === "observer" && observation.userId === userId && daysDiff <= 1);

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatePayload = {
      // Flat cloud values
      lowCloudForm: clouds?.low?.form || null,
      lowCloudHeight: clouds?.low?.height || null,
      lowCloudAmount: clouds?.low?.amount || null,
      lowCloudDirection: clouds?.low?.direction || null,

      mediumCloudForm: clouds?.medium?.form || null,
      mediumCloudHeight: clouds?.medium?.height || null,
      mediumCloudAmount: clouds?.medium?.amount || null,
      mediumCloudDirection: clouds?.medium?.direction || null,

      highCloudForm: clouds?.high?.form || null,
      highCloudHeight: clouds?.high?.height || null,
      highCloudAmount: clouds?.high?.amount || null,
      highCloudDirection: clouds?.high?.direction || null,

      // Total cloud
      totalCloudAmount: totalCloud?.["total-cloud-amount"] || null,

      // Rainfall
      rainfallTimeStart: rainfall?.["time-start"] || null,
      rainfallTimeEnd: rainfall?.["time-end"] || null,
      rainfallSincePrevious: rainfall?.["since-previous"] || null,
      rainfallDuringPrevious: rainfall?.["during-previous"] || null,
      rainfallLast24Hours: rainfall?.["last-24-hours"] || null,

      // Wind
      windFirstAnemometer: wind?.["first-anemometer"] || null,
      windSecondAnemometer: wind?.["second-anemometer"] || null,
      windSpeed: wind?.speed || null,
      windDirection: wind?.["wind-direction"] || null,

      // Observer
      observerInitial: observer?.["observer-initial"] || null,
    };

    const updated = await prisma.weatherObservation.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating observation:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
