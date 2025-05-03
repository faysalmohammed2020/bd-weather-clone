import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON data from the request
    const data = await request.json()

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.access(dataDir)
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Generate a unique filename with timestamp
    const now = new Date()
    const dateString = now.toISOString().split("T")[0]
    const timeString = now.toTimeString().split(" ")[0].replace(/:/g, "-")
    const filename = `weather-observation_${dateString}_${timeString}.json`

    // Add metadata to the data
    const dataWithMetadata = {
      ...data,
      metadata: {
        createdAt: now.toISOString(),
        filename: filename,
      },
    }

    // Write the file
    const filePath = path.join(dataDir, filename)
    await fs.writeFile(filePath, JSON.stringify(dataWithMetadata, null, 2))

    return NextResponse.json({
      success: true,
      message: "Weather observation saved successfully!",
      filePath: `/data/${filename}`,
      filename: filename,
    })
  } catch (error) {
    console.error("Error saving weather observation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save weather observation data",
      },
      { status: 500 },
    )
  }
}
