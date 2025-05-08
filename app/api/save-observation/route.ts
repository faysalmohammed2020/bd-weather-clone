import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_FILE = "weather-observations.json"

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON data from the request
    const newData = await request.json()

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.access(dataDir)
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Path to the data file
    const filePath = path.join(dataDir, DATA_FILE)

    // Initialize data array
    let allData = []

    try {
      // Read existing data if file exists
      const fileContent = await fs.readFile(filePath, "utf-8")
      allData = JSON.parse(fileContent)

      // Ensure it's an array
      if (!Array.isArray(allData)) {
        allData = []
      }
    } catch (error) {
      // File doesn't exist or is empty/corrupt - start fresh
      allData = []
    }

    // Add metadata to the new data if not already present
    if (!newData.metadata || !newData.metadata.id) {
      const now = new Date()
      newData.metadata = {
        ...newData.metadata,
        createdAt: now.toISOString(),
        id: now.getTime().toString(), // Use timestamp as simple ID
      }
    }

    // Add new data to the array
    allData.push(newData)

    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(allData, null, 2))

    return NextResponse.json({
      success: true,
      message: "Weather observation saved successfully!",
      data: newData,
      totalObservations: allData.length,
    })
  } catch (error) {
    console.error("Error saving weather observation:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save weather observation data",
      },
      { status: 500 },
    )
  }
}
