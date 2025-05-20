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

    const { id, ...updateData } = await req.json()

    if (!id) {
      return NextResponse.json({ message: "Entry ID is required" }, { status: 400 })
    }

    // Find the existing entry with its related observing time
    const existingEntry = await prisma.meteorologicalEntry.findUnique({
      where: { id },
      include: {
        ObservingTime: {
          include: {
            station: true,
            user: true,
          },
        },
      },
    })

    if (!existingEntry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    // Check permissions
    const userRole = session.user.role
    const userStationId = session.user.station?.id
    const entryStationId = existingEntry.ObservingTime.stationId
    const entryUserId = existingEntry.ObservingTime.userId

    let canEdit = false

    // Super admin can edit any record
    if (userRole === "super_admin") {
      canEdit = true
    }
    // Station admin can edit records from their station
    else if (userRole === "station_admin" && userStationId === entryStationId) {
      canEdit = true
    }
    // Regular users can only edit their own records
    else if (userStationId === entryStationId && session.user.id === entryUserId) {
      canEdit = true
    }

    if (!canEdit) {
      return NextResponse.json(
        { message: "You don't have permission to edit this record" },
        { status: 403 }
      )
    }

    // Prepare the data to update
    const dataToUpdate: any = {
      dataType: updateData.dataType || existingEntry.dataType,
      subIndicator: updateData.subIndicator ?? existingEntry.subIndicator,
      alteredThermometer: updateData.alteredThermometer ?? existingEntry.alteredThermometer,
      barAsRead: updateData.barAsRead ?? existingEntry.barAsRead,
      correctedForIndex: updateData.correctedForIndex ?? existingEntry.correctedForIndex,
      heightDifference: updateData.heightDifference ?? existingEntry.heightDifference,
      correctionForTemp: updateData.correctionForTemp ?? existingEntry.correctionForTemp,
      stationLevelPressure: updateData.stationLevelPressure ?? existingEntry.stationLevelPressure,
      seaLevelReduction: updateData.seaLevelReduction ?? existingEntry.seaLevelReduction,
      correctedSeaLevelPressure: updateData.correctedSeaLevelPressure ?? existingEntry.correctedSeaLevelPressure,
      afternoonReading: updateData.afternoonReading ?? existingEntry.afternoonReading,
      pressureChange24h: updateData.pressureChange24h ?? existingEntry.pressureChange24h,
      dryBulbAsRead: updateData.dryBulbAsRead ?? existingEntry.dryBulbAsRead,
      wetBulbAsRead: updateData.wetBulbAsRead ?? existingEntry.wetBulbAsRead,
      maxMinTempAsRead: updateData.maxMinTempAsRead ?? existingEntry.maxMinTempAsRead,
      dryBulbCorrected: updateData.dryBulbCorrected ?? existingEntry.dryBulbCorrected,
      wetBulbCorrected: updateData.wetBulbCorrected ?? existingEntry.wetBulbCorrected,
      maxMinTempCorrected: updateData.maxMinTempCorrected ?? existingEntry.maxMinTempCorrected,
      Td: updateData.Td ?? existingEntry.Td,
      relativeHumidity: updateData.relativeHumidity ?? existingEntry.relativeHumidity,
      squallConfirmed: updateData.squallConfirmed !== undefined 
        ? String(updateData.squallConfirmed) 
        : existingEntry.squallConfirmed,
      squallForce: updateData.squallForce ?? existingEntry.squallForce,
      squallDirection: updateData.squallDirection ?? existingEntry.squallDirection,
      squallTime: updateData.squallTime ?? existingEntry.squallTime,
      horizontalVisibility: updateData.horizontalVisibility ?? existingEntry.horizontalVisibility,
      miscMeteors: updateData.miscMeteors ?? existingEntry.miscMeteors,
      pastWeatherW1: updateData.pastWeatherW1 ?? existingEntry.pastWeatherW1,
      pastWeatherW2: updateData.pastWeatherW2 ?? existingEntry.pastWeatherW2,
      presentWeatherWW: updateData.presentWeatherWW ?? existingEntry.presentWeatherWW,
      c2Indicator: updateData.c2Indicator ?? existingEntry.c2Indicator,
    }

    // Update the entry
    const updatedEntry = await prisma.meteorologicalEntry.update({
      where: { id },
      data: dataToUpdate,
      include: {
        ObservingTime: {
          include: {
            station: true,
          },
        },
      },
    })

    return NextResponse.json(
      { 
        message: "Data updated successfully", 
        entry: updatedEntry 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error updating meteorological entry:", error)
    return NextResponse.json(
      { 
        message: "Failed to update data", 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
