// import { getSession } from "@/lib/getSession";
// import prisma from "@/lib/prisma";
// import { getTodayUtcRange } from "@/lib/utils";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();

//     const session = await getSession();

//     if (!session || !session.user?.id) {
//       return NextResponse.json(
//         { success: false, error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     // First, find the ObservingTime record by its UTC time
//     const { startToday, endToday } = getTodayUtcRange();
//     // First, find the ObservingTime record by its UTC time
//     const observingTime = await prisma.observingTime.findFirst({
//       where: {
//         AND: [
//           {
//             utcTime: {
//               gte: startToday,
//               lte: endToday,
//             },
//           },
//           {
//             stationId: session.user.station?.id,
//           },
//         ],
//       },
//       select: {
//         id: true,
//         utcTime: true,
//         _count: {
//           select: {
//             MeteorologicalEntry: true,
//             WeatherObservation: true,
//             SynopticCode: true,
//             DailySummary: true,
//           },
//         },
//       },
//       orderBy: {
//         utcTime: "desc",
//       },
//     });

//     if (!observingTime) {
//       return NextResponse.json({
//         success: false,
//         error: "No observing time for today",
//         status: 404,
//       });
//     }

//     if (!observingTime) {
//       return NextResponse.json({
//         success: false,
//         error: "No observing time for today",
//         status: 404,
//       });
//     }

//     if (
//       observingTime &&
//       !observingTime._count.MeteorologicalEntry &&
//       !observingTime._count.WeatherObservation
//     ) {
//       return NextResponse.json({
//         success: false,
//         error:
//           "Meteorological entry and weather observation are not available for this time",
//         status: 400,
//       });
//     }

//     if (observingTime && observingTime._count.DailySummary > 0) {
//       return NextResponse.json({
//         success: false,
//         error: "Daily summary already exists for this time",
//         status: 400,
//       });
//     }

//     // Get station ID from session
//     const stationId = session.user.station?.id;
//     if (!stationId) {
//       return NextResponse.json({
//         success: false,
//         error: "Station ID is required",
//         status: 400,
//       });
//     }

//     // Find the station by stationId to get its primary key (id)
//     const stationRecord = await prisma.station.findFirst({
//       where: { id: stationId },
//     });

//     if (!stationRecord) {
//       return NextResponse.json({
//         success: false,
//         error: `No station found with ID: ${stationId}`,
//         status: 404,
//       });
//     }

//     const entry = await prisma.dailySummary.create({
//       data: {
//         dataType: body.dataType,
//         avStationPressure: body.measurements?.[0] || null,
//         avSeaLevelPressure: body.measurements?.[1] || null,
//         avDryBulbTemperature: body.measurements?.[2] || null,
//         avWetBulbTemperature: body.measurements?.[3] || null,
//         maxTemperature: body.measurements?.[4] || null,
//         minTemperature: body.measurements?.[5] || null,
//         totalPrecipitation: body.measurements?.[6] || null,
//         avDewPointTemperature: body.measurements?.[7] || null,
//         avRelativeHumidity: body.measurements?.[8] || null,
//         windSpeed: body.measurements?.[9] || null,
//         windDirectionCode: body.windDirection || null,
//         maxWindSpeed: body.measurements?.[11] || null,
//         maxWindDirection: body.measurements?.[12] || null,
//         avTotalCloud: body.measurements?.[13] || null,
//         lowestVisibility: body.measurements?.[14] || null,
//         totalRainDuration: body.measurements?.[15] || null,
//         ObservingTime: {
//           connect: {
//             id: observingTime?.id,
//             stationId: stationRecord.id,
//           },
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Daily summary saved successfully",
//     });
//   } catch (err) {
//     console.error("❌ DB save error:", err);
//     return NextResponse.json({
//       success: false,
//       error: "Failed to save data",
//     }, { status: 500 });
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const stationNo = searchParams.get("stationNo");

//     if (!stationNo) {
//       return new NextResponse("Station number is required", { status: 400 });
//     }

//     const summary = await prisma.dailySummary.findFirst({
//       where: {
//         ObservingTime: {
//           station: {
//             stationId: stationNo,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//       select: {
//         maxTemperature: true,
//         minTemperature: true,
//         totalPrecipitation: true,
//         windSpeed: true,
//         avTotalCloud: true,
//         totalRainDuration: true,
//         avRelativeHumidity: true,
//         lowestVisibility: true,
//       },
//     });

//     if (!summary) {
//       return new NextResponse("No data found", { status: 404 });
//     }

//     // Normalize units
//     const adjustedSummary = {
//       ...summary,
//       maxTemperature: summary.maxTemperature
//         ? (parseFloat(summary.maxTemperature as any) / 10).toFixed(1)
//         : summary.maxTemperature,
//       minTemperature: summary.minTemperature
//         ? (parseFloat(summary.minTemperature as any) / 10).toFixed(1)
//         : summary.minTemperature,
//       lowestVisibility: summary.lowestVisibility
//         ? parseFloat(summary.lowestVisibility as any).toFixed(1)
//         : summary.lowestVisibility,
//     };

//     return NextResponse.json(adjustedSummary);
//   } catch (err) {
//     console.error("Error:", err);
//     return new NextResponse("Failed to fetch data", { status: 500 });
//   }
// }



import { getSession } from "@/lib/getSession"
import prisma from "@/lib/prisma"
import { getTodayUtcRange } from "@/lib/utils"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const session = await getSession()

    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // First, find the ObservingTime record by its UTC time
    const { startToday, endToday } = getTodayUtcRange()
    // First, find the ObservingTime record by its UTC time
    const observingTime = await prisma.observingTime.findFirst({
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
      select: {
        id: true,
        utcTime: true,
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
    })

    if (!observingTime) {
      return NextResponse.json({
        success: false,
        error: "No observing time for today",
        status: 404,
      })
    }

    if (!observingTime) {
      return NextResponse.json({
        success: false,
        error: "No observing time for today",
        status: 404,
      })
    }

    if (observingTime && !observingTime._count.MeteorologicalEntry && !observingTime._count.WeatherObservation) {
      return NextResponse.json({
        success: false,
        error: "Meteorological entry and weather observation are not available for this time",
        status: 400,
      })
    }

    if (observingTime && observingTime._count.DailySummary > 0) {
      return NextResponse.json({
        success: false,
        error: "Daily summary already exists for this time",
        status: 400,
      })
    }

    // Get station ID from session
    const stationId = session.user.station?.id
    if (!stationId) {
      return NextResponse.json({
        success: false,
        error: "Station ID is required",
        status: 400,
      })
    }

    // Find the station by stationId to get its primary key (id)
    const stationRecord = await prisma.station.findFirst({
      where: { id: stationId },
    })

    if (!stationRecord) {
      return NextResponse.json({
        success: false,
        error: `No station found with ID: ${stationId}`,
        status: 404,
      })
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
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Daily summary saved successfully",
    })
  } catch (err) {
    console.error("❌ DB save error:", err)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save data",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  const session = await getSession()

  if (!session || !session.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const stationIdParam = searchParams.get("stationId")
  const stationNo = searchParams.get("stationNo")

  // Handle legacy stationNo parameter for backward compatibility
  if (stationNo && !stationIdParam) {
    try {
      const summary = await prisma.dailySummary.findFirst({
        where: {
          ObservingTime: {
            station: {
              stationId: stationNo,
            },
          },
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
      })

      if (!summary) {
        return new NextResponse("No data found", { status: 404 })
      }

      // Normalize units
      const adjustedSummary = {
        ...summary,
        maxTemperature: summary.maxTemperature
          ? (Number.parseFloat(summary.maxTemperature as any) / 10).toFixed(1)
          : summary.maxTemperature,
        minTemperature: summary.minTemperature
          ? (Number.parseFloat(summary.minTemperature as any) / 10).toFixed(1)
          : summary.minTemperature,
        lowestVisibility: summary.lowestVisibility
          ? Number.parseFloat(summary.lowestVisibility as any).toFixed(1)
          : summary.lowestVisibility,
      }

      return NextResponse.json(adjustedSummary)
    } catch (err) {
      console.error("Error:", err)
      return new NextResponse("Failed to fetch data", { status: 500 })
    }
  }

  const userStationId = session.user.station?.id
  const isSuperAdmin = session.user.role === "super_admin"

  const startTime = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7))
  startTime.setHours(0, 0, 0, 0)
  const endTime = endDate ? new Date(endDate) : new Date()
  endTime.setHours(23, 59, 59, 999)

  const stationId = stationIdParam || userStationId
  if (!stationId && !isSuperAdmin) {
    return NextResponse.json({ message: "Station ID is required" }, { status: 400 })
  }

  try {
    const entries = await prisma.dailySummary.findMany({
      where: {
        ObservingTime: {
          stationId: stationId,
          utcTime: {
            gte: startTime,
            lte: endTime,
          },
        },
      },
      include: {
        ObservingTime: {
          include: {
            station: true,
          },
        },
      },
      orderBy: {
        ObservingTime: {
          utcTime: "desc",
        },
      },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error("Error fetching daily summary data:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, ObservingTime, ...updateData } = body

    const existingRecord = await prisma.dailySummary.findUnique({
      where: { id },
      include: { ObservingTime: true },
    })

    if (!existingRecord) {
      return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 })
    }

    const userStationId = session.user.station?.id
    const recordStationId = existingRecord.ObservingTime?.stationId

    if (session.user.role !== "super_admin" && userStationId !== recordStationId) {
      return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 })
    }

    const updatedRecord = await prisma.dailySummary.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updatedRecord }, { status: 200 })
  } catch (error) {
    console.error("Error updating daily summary record:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
