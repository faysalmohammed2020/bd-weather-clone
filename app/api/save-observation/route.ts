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

    // Transform the form data structure to match the Prisma model
    const observationData = {
      tabActive: data.metadata?.tabActiveAtSubmission || "unknown",
      stationId: data.observer["station-id"] || "unknown",

      // Cloud data
      lowCloudForm: data.clouds.low.form,
      lowCloudHeight: data.clouds.low.height,
      lowCloudAmount: data.clouds.low.amount,
      lowCloudDirection: data.clouds.low.direction,

      mediumCloudForm: data.clouds.medium.form,
      mediumCloudHeight: data.clouds.medium.height,
      mediumCloudAmount: data.clouds.medium.amount,
      mediumCloudDirection: data.clouds.medium.direction,

      highCloudForm: data.clouds.high.form,
      highCloudHeight: data.clouds.high.height,
      highCloudAmount: data.clouds.high.amount,
      highCloudDirection: data.clouds.high.direction,

      // Total cloud
      totalCloudAmount: data.totalCloud["total-cloud-amount"],

      // Significant clouds
      layer1Form: data.significantClouds.layer1.form,
      layer1Height: data.significantClouds.layer1.height,
      layer1Amount: data.significantClouds.layer1.amount,

      layer2Form: data.significantClouds.layer2.form,
      layer2Height: data.significantClouds.layer2.height,
      layer2Amount: data.significantClouds.layer2.amount,

      layer3Form: data.significantClouds.layer3.form,
      layer3Height: data.significantClouds.layer3.height,
      layer3Amount: data.significantClouds.layer3.amount,

      layer4Form: data.significantClouds.layer4.form,
      layer4Height: data.significantClouds.layer4.height,
      layer4Amount: data.significantClouds.layer4.amount,

      // Rainfall
      rainfallTimeStart: data.rainfall["time-start"],
      rainfallTimeEnd: data.rainfall["time-end"],
      rainfallSincePrevious: data.rainfall["since-previous"],
      rainfallDuringPrevious: data.rainfall["during-previous"],
      rainfallLast24Hours: data.rainfall["last-24-hours"],

      // Wind
      windFirstAnemometer: data.wind["first-anemometer"],
      windSecondAnemometer: data.wind["second-anemometer"],
      windSpeed: data.wind["speed"],
      windDirection: data.wind["wind-direction"],

      // Observer
      observerInitial: data.observer["observer-initial"],
      observationTime: data.observer["observation-time"]
        ? new Date(data.observer["observation-time"])
        : null,

      // Note: You'll need to add user authentication to set the userId
      userId: "temp-user-id", // Replace with actual user ID from session
    };

    // Save to database
    const observation = await prisma.weatherObservation.create({
      data: observationData,
    });

    return NextResponse.json({
      success: true,
      data: observation,
      message: "Observation saved successfully",
    });
  } catch (error) {
    console.error("Error saving observation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
