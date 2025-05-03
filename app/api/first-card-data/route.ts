import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.access(dataDir)
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true })
    }
    
    // Generate filename with timestamp
    const now = new Date()
    const dateString = now.toISOString().split("T")[0]
    const timeString = now.toTimeString().split(" ")[0].replace(/:/g, "-")
    const filename = `meteorological-data_${dateString}_${timeString}.json`
    
    // Write the file
    const filePath = path.join(dataDir, filename)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: "Data saved successfully!",
      filePath: `/data/${filename}`
    })
  } catch (error) {
    console.error("Error saving data:", error)
    return NextResponse.json(
      { success: false, message: "Failed to save data" },
      { status: 500 }
    )
  }
}
