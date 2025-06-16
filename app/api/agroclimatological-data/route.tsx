import prisma from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export interface AgroclimatologicalFormData {
  stationInfo: {
    stationName: string
    latitude: string
    longitude: string
    elevation: string
    year: number
    month: number
  }
  solarRadiation: string
  sunShineHour: string
  airTemperature: {
    dry05m: string
    wet05m: string
    dry12m: string
    wet12m: string
    dry22m: string
    wet22m: string
  }
  minTemp: string
  maxTemp: string
  meanTemp: string
  grassMinTemp: string
  soilTemperature: {
    depth5cm: string
    depth10cm: string
    depth20cm: string
    depth30cm: string
    depth50cm: string
  }
  panWaterEvap: string
  relativeHumidity: string
  evaporation: string
  soilMoisture: {
    depth0to20cm: string
    depth20to50cm: string
  }
  dewPoint: string
  windSpeed: string
  duration: string
  rainfall: string
  userId?: string // Optional user ID for tracking who submitted
}

// Helper function to safely parse float values
function parseFloatSafe(value: any): number | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (str === "") return null;

  const parsed = Number.parseFloat(str);
  return isNaN(parsed) ? null : parsed;
}


export async function POST(request: NextRequest) {
  try {
    const data: AgroclimatologicalFormData = await request.json()

    // Validate required fields
    if (!data.stationInfo?.stationName) {
      return NextResponse.json({ success: false, message: "Station name is required" }, { status: 400 })
    }

    if (!data.stationInfo?.latitude || !data.stationInfo?.longitude) {
      return NextResponse.json({ success: false, message: "Latitude and longitude are required" }, { status: 400 })
    }

    // Create the database entry
    const result = await prisma.agroclimatologicalData.create({
      data: {
        // Station Information
        stationName: data.stationInfo.stationName,
        latitude: parseFloatSafe(data.stationInfo.latitude) || 0,
        longitude: parseFloatSafe(data.stationInfo.longitude) || 0,
        elevation: parseFloatSafe(data.stationInfo.elevation) || 0,
        year: data.stationInfo.year,
        month: data.stationInfo.month,

        // Solar & Sunshine Data
        solarRadiation: parseFloatSafe(data.solarRadiation),
        sunShineHour: parseFloatSafe(data.sunShineHour),

        // Air Temperature Data
        airTempDry05m: parseFloatSafe(data.airTemperature.dry05m),
        airTempWet05m: parseFloatSafe(data.airTemperature.wet05m),
        airTempDry12m: parseFloatSafe(data.airTemperature.dry12m),
        airTempWet12m: parseFloatSafe(data.airTemperature.wet12m),
        airTempDry22m: parseFloatSafe(data.airTemperature.dry22m),
        airTempWet22m: parseFloatSafe(data.airTemperature.wet22m),

        // Temperature Summary
        minTemp: parseFloatSafe(data.minTemp),
        maxTemp: parseFloatSafe(data.maxTemp),
        meanTemp: parseFloatSafe(data.meanTemp),
        grassMinTemp: parseFloatSafe(data.grassMinTemp),

        // Soil Temperature Data
        soilTemp5cm: parseFloatSafe(data.soilTemperature.depth5cm),
        soilTemp10cm: parseFloatSafe(data.soilTemperature.depth10cm),
        soilTemp20cm: parseFloatSafe(data.soilTemperature.depth20cm),
        soilTemp30cm: parseFloatSafe(data.soilTemperature.depth30cm),
        soilTemp50cm: parseFloatSafe(data.soilTemperature.depth50cm),

        // Soil Moisture Data
        soilMoisture0to20cm: parseFloatSafe(data.soilMoisture.depth0to20cm),
        soilMoisture20to50cm: parseFloatSafe(data.soilMoisture.depth20to50cm),

        // Humidity & Evaporation Data
        panWaterEvap: parseFloatSafe(data.panWaterEvap),
        relativeHumidity: parseFloatSafe(data.relativeHumidity),
        evaporation: parseFloatSafe(data.evaporation),
        dewPoint: parseFloatSafe(data.dewPoint),

        // Weather Measurements
        windSpeed: parseFloatSafe(data.windSpeed),
        duration: parseFloatSafe(data.duration),
        rainfall: parseFloatSafe(data.rainfall),

        // User tracking (optional)
        userId: data.userId || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Agroclimatological data submitted successfully!",
      data: {
        id: result.id,
        stationName: result.stationName,
        year: result.year,
        month: result.month,
        createdAt: result.createdAt,
      },
    })
  } catch (error) {
    console.error("Database submission error:", error)

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data for this station, year, and month already exists. Please update the existing record or choose different parameters.",
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit data to database. Please try again.",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stationName = searchParams.get("stationName")
    const year = searchParams.get("year")
    const month = searchParams.get("month")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const where: any = {}

    if (stationName) where.stationName = { contains: stationName, mode: "insensitive" }
    if (year) where.year = Number.parseInt(year)
    if (month) where.month = Number.parseInt(month)

    const [data, total] = await Promise.all([
      prisma.agroclimatologicalData.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }, { stationName: "asc" }],
        take: limit,
        skip: offset,
      }),
      prisma.agroclimatologicalData.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Database fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data from database.",
        data: [],
      },
      { status: 500 },
    )
  }
}
