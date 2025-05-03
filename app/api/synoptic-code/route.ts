import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Generate a unique filename based on timestamp and station
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const stationNo = data.stationNo || "unknown"
    const filename = `weather-data-station-${stationNo}-${timestamp}.json`

    // Write the data to a JSON file
    fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      message: "Weather data saved successfully",
      filename,
    })
  } catch (error) {
    console.error("Error saving weather data:", error)
    return NextResponse.json({ success: false, message: "Failed to save weather data" }, { status: 500 })
  }
}
