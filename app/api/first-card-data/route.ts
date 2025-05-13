// import { type NextRequest, NextResponse } from "next/server";
// import { getSession } from "@/lib/getSession";
// import {
//   parseISO,
//   subMonths,
//   subYears,
//   isToday,
//   isYesterday,
//   isAfter,
// } from "date-fns";
// import prisma from "@/lib/prisma";
// import { getFirstCardData } from "@/data/first-card-data";

// // Helper function to check if user can edit a record based on role and timestamp
// const canEditRecord = (userRole, timestamp, userId, recordUserId) => {
//   // For observers, they can only edit their own records
//   if (userRole === "observer" && userId !== recordUserId) {
//     return false;
//   }

//   const recordDate = parseISO(timestamp);
//   const now = new Date();

//   switch (userRole) {
//     case "super_admin":
//       return isAfter(recordDate, subYears(now, 1)); // Can edit 1 year of data
//     case "station_admin":
//       return isAfter(recordDate, subMonths(now, 1)); // Can edit 1 month of data
//     case "observer":
//       return isToday(recordDate) || isYesterday(recordDate); // Can edit today and yesterday's data
//     default:
//       return false;
//   }
// };


// export async function GET() {
//   try {
//     // Get the meteorological data
//     const data = getFirstCardData();

//     // Return the data as JSON
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Error fetching first card data:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch first card data" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Get user session for authentication
//     const session = await getSession();
//     if (!session?.user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const newData = await request.json();

//     // Add user ID and timestamps
//     const dataWithMetadata = {
//       ...newData,
//       userId: session.user.id,
//       timestamp: new Date().toISOString(),
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     // Save to database
//     const savedData = await prisma.meteorologicalData.create({
//       data: dataWithMetadata,
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Data saved successfully!",
//       data: savedData,
//     });
//   } catch (error) {
//     console.error("Error saving data:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to save data" },
//       { status: 500 }
//     );
//   }
// }

// // Add PUT method to update a specific record
// export async function PUT(request: NextRequest) {
//   try {
//     // Get user session for authentication
//     const session = await getSession();
//     if (!session?.user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { id, timestamp, ...updateData } = await request.json();

//     // Find the record to check permissions
//     const record = await prisma.meteorologicalData.findUnique({
//       where: { id },
//     });

//     if (!record) {
//       return NextResponse.json(
//         { success: false, message: "Record not found" },
//         { status: 404 }
//       );
//     }

//     // Check if user can edit this record
//     if (
//       !canEditRecord(
//         session.user.role,
//         record.timestamp,
//         session.user.id,
//         record.userId
//       )
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "You don't have permission to edit this record",
//         },
//         { status: 403 }
//       );
//     }

//     // Update the record
//     const updatedRecord = await prisma.meteorologicalData.update({
//       where: { id },
//       data: {
//         ...updateData,
//         updatedAt: new Date(),
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Record updated successfully!",
//       data: updatedRecord,
//     });
//   } catch (error) {
//     console.error("Error updating data:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to update data" },
//       { status: 500 }
//     );
//   }
// }

// // Add DELETE method to remove a specific record
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Get user session for authentication
//     const session = await getSession();
//     if (!session?.user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const id = params.id;

//     // Find the record to check permissions
//     const record = await prisma.meteorologicalData.findUnique({
//       where: { id },
//     });

//     if (!record) {
//       return NextResponse.json(
//         { success: false, message: "Record not found" },
//         { status: 404 }
//       );
//     }

//     // Check if user can delete this record
//     if (
//       !canEditRecord(
//         session.user.role,
//         record.timestamp,
//         session.user.id,
//         record.userId
//       )
//     ) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "You don't have permission to delete this record",
//         },
//         { status: 403 }
//       );
//     }

//     // Delete the record
//     await prisma.meteorologicalData.delete({
//       where: { id },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Record deleted successfully!",
//     });
//   } catch (error) {
//     console.error("Error deleting data:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to delete data" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/getSession";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    
    const data = await req.json();

    // Convert segmented fields (objects) to full strings
    const dataType = Object.values(data.dataType || {}).join("") || "";
    const stationNo = Object.values(data.stationNo || {}).join("") || "";
    const year = Object.values(data.year || {}).join("") || "";

    const savedEntry = await prisma.meteorologicalEntry.create({
      data: {
        userId,
        dataType,
        stationNo,
        stationName: data.stationName || "",
        year,
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
        observationTime: data.observationTime || "",
        timestamp: data.timestamp || new Date().toISOString(),
      },
    });

    const totalCount = await prisma.meteorologicalEntry.count();

    return NextResponse.json(
      { message: "Data saved successfully", dataCount: totalCount, entry: savedEntry },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error saving meteorological entry:", error);
    return NextResponse.json(
      { message: "Failed to save data", error: error.message },
      { status: 500 }
    );
  }
}
