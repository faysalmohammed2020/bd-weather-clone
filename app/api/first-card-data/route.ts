import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// Path to the single data file
const DATA_FILE_PATH = path.join(process.cwd(), "data", "first-card-data.json")

export async function POST(request: NextRequest) {
  try {
    const newData = await request.json()
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), "data")
    try {
      await fs.access(dataDir)
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true })
    }

    let existingData = []
    
    // Read existing data if file exists
    try {
      const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8")
      existingData = JSON.parse(fileContent)
      
      // Ensure existingData is an array
      if (!Array.isArray(existingData)) {
        existingData = [existingData]
      }
    } catch (error) {
      // File doesn't exist yet, we'll create it
      console.log("Creating new data file...")
    }
    
    // Add timestamp to the new data entry
    const dataWithTimestamp = {
      ...newData,
      timestamp: new Date().toISOString()
    }
    
    // Append new data to existing data
    const updatedData = [...existingData, dataWithTimestamp]
    
    // Write the updated data back to the file
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(updatedData, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: "Data saved successfully!",
      dataCount: updatedData.length
    })
  } catch (error) {
    console.error("Error saving data:", error)
    return NextResponse.json(
      { success: false, message: "Failed to save data" },
      { status: 500 }
    )
  }
}

// Add GET method to retrieve all data
export async function GET() {
  try {
    // Check if file exists
    try {
      await fs.access(DATA_FILE_PATH)
    } catch (error) {
      // File doesn't exist yet, return empty array
      return NextResponse.json([])
    }
    
    // Read and return the data
    const fileContent = await fs.readFile(DATA_FILE_PATH, "utf-8")
    const data = JSON.parse(fileContent)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error reading data:", error)
    return NextResponse.json(
      { success: false, message: "Failed to read data" },
      { status: 500 }
    )
  }
}