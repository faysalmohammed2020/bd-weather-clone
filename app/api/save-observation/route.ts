// import { type NextRequest, NextResponse } from "next/server"
// import { promises as fs } from "fs"
// import path from "path"

// const DATA_FILE = "weather-observations.json"

// export async function POST(request: NextRequest) {
//   try {
//     // Parse the JSON data from the request
//     const newData = await request.json()

//     // Create data directory if it doesn't exist
//     const dataDir = path.join(process.cwd(), "data")
//     try {
//       await fs.access(dataDir)
//     } catch (error) {
//       await fs.mkdir(dataDir, { recursive: true })
//     }

//     // Path to the data file
//     const filePath = path.join(dataDir, DATA_FILE)

//     // Initialize data array
//     let allData = []

//     try {
//       // Read existing data if file exists
//       const fileContent = await fs.readFile(filePath, "utf-8")
//       allData = JSON.parse(fileContent)

//       // Ensure it's an array
//       if (!Array.isArray(allData)) {
//         allData = []
//       }
//     } catch (error) {
//       // File doesn't exist or is empty/corrupt - start fresh
//       allData = []
//     }

//     // Add metadata to the new data if not already present
//     if (!newData.metadata || !newData.metadata.id) {
//       const now = new Date()
//       newData.metadata = {
//         ...newData.metadata,
//         createdAt: now.toISOString(),
//         id: now.getTime().toString(), // Use timestamp as simple ID
//       }
//     }

//     // Add new data to the array
//     allData.push(newData)

//     // Write the updated data back to the file
//     await fs.writeFile(filePath, JSON.stringify(allData, null, 2))

//     return NextResponse.json({
//       success: true,
//       message: "Weather observation saved successfully!",
//       data: newData,
//       totalObservations: allData.length,
//     })
//   } catch (error) {
//     console.error("Error saving weather observation:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to save weather observation data",
//       },
//       { status: 500 },
//     )
//   }
// }

// app/api/save-observation/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.observer || !data.observer["station-id"]) {
      throw new Error("Station ID is required");
    }

    // Transform and validate data
    const observationData = {
      tabActive: data.metadata?.tabActiveAtSubmission || "unknown",
      stationId: data.observer["station-id"],

      // Cloud data with null checks
      lowCloudForm: data.clouds?.low?.form || null,
      lowCloudHeight: data.clouds?.low?.height || null,
      lowCloudAmount: data.clouds?.low?.amount || null,
      lowCloudDirection: data.clouds?.low?.direction || null,

      mediumCloudForm: data.clouds?.medium?.form || null,
      mediumCloudHeight: data.clouds?.medium?.height || null,
      mediumCloudAmount: data.clouds?.medium?.amount || null,
      mediumCloudDirection: data.clouds?.medium?.direction || null,

      highCloudForm: data.clouds?.high?.form || null,
      highCloudHeight: data.clouds?.high?.height || null,
      highCloudAmount: data.clouds?.high?.amount || null,
      highCloudDirection: data.clouds?.high?.direction || null,

      // Total cloud
      totalCloudAmount: data.totalCloud?.["total-cloud-amount"] || null,

      // Significant clouds
      layer1Form: data.significantClouds?.layer1?.form || null,
      layer1Height: data.significantClouds?.layer1?.height || null,
      layer1Amount: data.significantClouds?.layer1?.amount || null,

      layer2Form: data.significantClouds?.layer2?.form || null,
      layer2Height: data.significantClouds?.layer2?.height || null,
      layer2Amount: data.significantClouds?.layer2?.amount || null,

      layer3Form: data.significantClouds?.layer3?.form || null,
      layer3Height: data.significantClouds?.layer3?.height || null,
      layer3Amount: data.significantClouds?.layer3?.amount || null,

      layer4Form: data.significantClouds?.layer4?.form || null,
      layer4Height: data.significantClouds?.layer4?.height || null,
      layer4Amount: data.significantClouds?.layer4?.amount || null,

      // Rainfall
      rainfallTimeStart: data.rainfall?.["time-start"] || null,
      rainfallTimeEnd: data.rainfall?.["time-end"] || null,
      rainfallSincePrevious: data.rainfall?.["since-previous"] || null,
      rainfallDuringPrevious: data.rainfall?.["during-previous"] || null,
      rainfallLast24Hours: data.rainfall?.["last-24-hours"] || null,

      // Wind
      windFirstAnemometer: data.wind?.["first-anemometer"] || null,
      windSecondAnemometer: data.wind?.["second-anemometer"] || null,
      windSpeed: data.wind?.speed || null,
      windDirection: data.wind?.["wind-direction"] || null,

      // Observer
      observerInitial: data.observer?.["observer-initial"] || null,
      observationTime: data.observer?.["observation-time"]
        ? new Date(data.observer["observation-time"])
        : null,

      // Temporary user ID - replace with actual auth later
      userId: "temp-user-id",
    };

    // Save to database
    const observation = await prisma.weatherObservation.create({
      data: observationData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: observation.id,
        stationId: observation.stationId,
        observationTime: observation.observationTime,
      },
      message: "Observation saved successfully",
    });
  } catch (error) {
    console.error("Error saving observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Database error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
