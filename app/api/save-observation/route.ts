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

    const stationId = data?.observer?.["station-id"];
    if (!stationId) {
      throw new Error("Station ID is required");
    }

    const observationData = {
      userId: session.user.id,
      stationId,
      tabActive: data.metadata?.tabActiveAtSubmission || "unknown",

      // Observer info
      observerInitial: data.observer?.["observer-initial"] || null,
      observationTime: data.observer?.["observation-time"]
        ? new Date(data.observer["observation-time"])
        : null,

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
      data: observationData,
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

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const observations = await prisma.weatherObservation.findMany({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { observationTime: "desc" },
    });

    const formatted = observations.map((obs) => ({
      metadata: {
        id: obs.id,
        stationId: obs.stationId,
        tabActive: obs.tabActive,
        submittedAt: obs.submittedAt,
      },
      observer: {
        "observer-initial": obs.observerInitial,
        "observation-time": obs.observationTime?.toISOString() || null,
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
        direction: obs.windDirection, // for CSV compatibility
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching observations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
