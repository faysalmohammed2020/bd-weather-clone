import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getSession } from "@/lib/getSession"
import { convertUTCToBDTime, hourToUtc } from "@/lib/utils"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const formattedObservingTime = hourToUtc(data.observingTimeId)
    const localTime = convertUTCToBDTime(formattedObservingTime)

    if (!formattedObservingTime) {
      return NextResponse.json(
        {
          message: "Observation time id not provided",
        },
        { status: 404 },
      )
    }

    const dataType =
      typeof data.dataType === "string" ? data.dataType : Object.values(data.dataType || {}).join("") || ""

    // Get station ID from session
    const stationId = session.user.station?.stationId

    if (!stationId) {
      return NextResponse.json({
        message: "Station ID is required",
        status: 400,
      })
    }

    // Find the station by stationId to get its primary key (id)
    const stationRecord = await prisma.station.findFirst({
      where: { stationId },
    })

    if (!stationRecord) {
      return NextResponse.json({
        message: `No station found with ID: ${stationId}`,
        status: 404,
      })
    }

    // Check if the observation time already exists
    const existingObservingTime = await prisma.observingTime.findUnique({
      where: {
        utcTime: formattedObservingTime,
      },
    })

    if (existingObservingTime) {
      return NextResponse.json({
        message: "Observing time already exists",
        status: 400,
      })
    }

    const createdObservingTime = await prisma.observingTime.create({
      data: {
        utcTime: formattedObservingTime,
        station: {
          connect: {
            id: stationRecord.id,
          },
        },
        localTime: localTime,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    })

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
        ObservingTime: {
          connect: {
            id: createdObservingTime.id,
          },
        },
        submittedAt: new Date(), // Set submission time
      },
    })

    const totalCount = await prisma.meteorologicalEntry.count()

    return NextResponse.json(
      {
        message: "Data saved successfully",
        dataCount: totalCount,
        entry: savedEntry,
      },
      { status: 200 },
    )
  } catch (error: unknown) {
    console.error("Error saving meteorological entry:", error)
    return NextResponse.json(
      { message: "Failed to save data", error: error instanceof Error ? error.message : "Unexpected Error" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const stationIdParam = searchParams.get("stationId")

    // Use the station ID from the query parameter if provided, otherwise use the user's station
    const stationId = stationIdParam || session.user.station?.stationId

    // Super admin can view all stations if no specific station is requested
    if (!stationId && session.user.role !== "super_admin") {
      return NextResponse.json({ message: "Station ID is required" }, { status: 400 })
    }

    // Find the station by stationId to get its primary key (id)
    let stationRecord = null
    if (stationId && stationId !== "all") {
      stationRecord = await prisma.station.findFirst({
        where: { stationId },
      })

      if (!stationRecord) {
        return NextResponse.json({
          message: `No station found with ID: ${stationId}`,
          status: 404,
        })
      }
    }

    const startTime = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7))
    startTime.setHours(0, 0, 0, 0) // Start of day

    const endTime = endDate ? new Date(endDate) : new Date()
    endTime.setHours(23, 59, 59, 999) // End of day

    // Build the query
    const whereClause: any = {
      utcTime: {
        gte: startTime,
        lte: endTime,
      },
    }

    // Add station filter if not super admin or if a specific station is requested
    if (stationRecord) {
      whereClause.stationId = stationRecord.id
    } else if (session.user.role !== "super_admin") {
      // Regular users can only see their station's data
      whereClause.stationId = session.user.station?.id
    }

    const entries = await prisma.observingTime.findMany({
      where: whereClause,
      include: {
        station: true,
        MeteorologicalEntry: true,
      },
      orderBy: {
        utcTime: "desc",
      },
      take: 100,
    })

    return NextResponse.json(entries, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching meteorological entries:", error)
    return NextResponse.json({ message: "Failed to fetch data", error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id, ...data } = await req.json()

    // Find the entry to update
    const existingEntry = await prisma.meteorologicalEntry.findUnique({
      where: { id },
      include: {
        ObservingTime: {
          include: {
            station: true,
          },
        },
      },
    })

    if (!existingEntry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    // Check permissions based on role
    const userRole = session.user.role
    const userStationId = session.user.station?.id
    const entryStationId = existingEntry.ObservingTime.stationId

    let canEdit = false

    if (userRole === "super_admin") {
      canEdit = true
    } else if (userRole === "station_admin" && userStationId === entryStationId) {
      // Station admin can edit records from their station
      canEdit = true
    } else if (userStationId === entryStationId) {
      // Regular users can edit records from their station
      canEdit = true
    }

    if (!canEdit) {
      return NextResponse.json({ message: "You don't have permission to edit this record" }, { status: 403 })
    }

    // Prepare the update data object
    const updateData: any = {
      dataType: data.dataType || existingEntry.dataType,
      subIndicator: data.subIndicator || existingEntry.subIndicator,
      alteredThermometer: data.alteredThermometer || existingEntry.alteredThermometer,
      barAsRead: data.barAsRead || existingEntry.barAsRead,
      correctedForIndex: data.correctedForIndex || existingEntry.correctedForIndex,
      heightDifference: data.heightDifference || existingEntry.heightDifference,
      correctionForTemp: data.correctionForTemp || existingEntry.correctionForTemp,
      stationLevelPressure: data.stationLevelPressure || existingEntry.stationLevelPressure,
      seaLevelReduction: data.seaLevelReduction || existingEntry.seaLevelReduction,
      correctedSeaLevelPressure: data.correctedSeaLevelPressure || existingEntry.correctedSeaLevelPressure,
      afternoonReading: data.afternoonReading || existingEntry.afternoonReading,
      pressureChange24h: data.pressureChange24h || existingEntry.pressureChange24h,
      dryBulbAsRead: data.dryBulbAsRead || existingEntry.dryBulbAsRead,
      wetBulbAsRead: data.wetBulbAsRead || existingEntry.wetBulbAsRead,
      maxMinTempAsRead: data.maxMinTempAsRead || existingEntry.maxMinTempAsRead,
      dryBulbCorrected: data.dryBulbCorrected || existingEntry.dryBulbCorrected,
      wetBulbCorrected: data.wetBulbCorrected || existingEntry.wetBulbCorrected,
      maxMinTempCorrected: data.maxMinTempCorrected || existingEntry.maxMinTempCorrected,
      Td: data.Td || existingEntry.Td,
      relativeHumidity: data.relativeHumidity || existingEntry.relativeHumidity,
      squallConfirmed:
        data.squallConfirmed !== undefined ? String(data.squallConfirmed) : existingEntry.squallConfirmed,
      squallForce: data.squallForce || existingEntry.squallForce,
      squallDirection: data.squallDirection || existingEntry.squallDirection,
      squallTime: data.squallTime || existingEntry.squallTime,
      horizontalVisibility: data.horizontalVisibility || existingEntry.horizontalVisibility,
      miscMeteors: data.miscMeteors || existingEntry.miscMeteors,
      pastWeatherW1: data.pastWeatherW1 || existingEntry.pastWeatherW1,
      pastWeatherW2: data.pastWeatherW2 || existingEntry.pastWeatherW2,
      presentWeatherWW: data.presentWeatherWW || existingEntry.presentWeatherWW,
      c2Indicator: data.c2Indicator || existingEntry.c2Indicator,
    }

    // Handle observing time update if provided
    if (data.observingTimeId) {
      const formattedObservingTime = hourToUtc(data.observingTimeId)
      const observingTime = await prisma.observingTime.findUnique({
        where: {
          utcTime: formattedObservingTime,
        },
      })

      if (observingTime) {
        updateData.observingTimeId = observingTime.id
      }
    }

    const updatedEntry = await prisma.meteorologicalEntry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ message: "Data updated successfully", entry: updatedEntry }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating meteorological entry:", error)
    return NextResponse.json({ message: "Failed to update data", error: error.message }, { status: 500 })
  }
}
