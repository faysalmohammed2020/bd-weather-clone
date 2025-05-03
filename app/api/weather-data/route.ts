import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Add timestamp to filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `weather-data-${timestamp}.json`

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Write data to file
    const filePath = path.join(dataDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      message: "Weather data saved successfully",
      filename,
    })
  } catch (error) {
    console.error("Error saving weather data:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to save weather data",
      },
      { status: 500 },
    )
  }
}
