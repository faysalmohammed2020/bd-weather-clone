import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import {
  parseISO,
  subMonths,
  subYears,
  isToday,
  isYesterday,
  isAfter,
} from "date-fns";
import prisma from "@/lib/prisma";
import { getFirstCardData } from "@/data/first-card-data";

// Helper function to check if user can edit a record based on role and timestamp
const canEditRecord = (userRole, timestamp, userId, recordUserId) => {
  // For observers, they can only edit their own records
  if (userRole === "observer" && userId !== recordUserId) {
    return false;
  }

  const recordDate = parseISO(timestamp);
  const now = new Date();

  switch (userRole) {
    case "super_admin":
      return isAfter(recordDate, subYears(now, 1)); // Can edit 1 year of data
    case "station_admin":
      return isAfter(recordDate, subMonths(now, 1)); // Can edit 1 month of data
    case "observer":
      return isToday(recordDate) || isYesterday(recordDate); // Can edit today and yesterday's data
    default:
      return false;
  }
};

// Update the GET function to ensure super_admin can see all data
// export async function GET(request: NextRequest) {
//   try {
//     // Get user session for role-based access
//     const session = await getSession();
//     if (!session?.user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(request.url);
//     const date = searchParams.get("date");
//     const stationName = searchParams.get("stationName");

//     // Build query filters
//     const filters: any = {};

//     // Date filter
//     if (date) {
//       const startDate = new Date(`${date}T00:00:00Z`);
//       const endDate = new Date(`${date}T23:59:59Z`);
//       filters.timestamp = {
//         gte: startDate,
//         lte: endDate,
//       };
//     }

//     // Station filter - only apply if specified and not "all"
//     if (stationName && stationName !== "all") {
//       filters.stationName = stationName;
//     }

//     // Role-based filtering - only for non-super_admin roles
//     if (session.user.role === "observer") {
//       // Observers can only see their own data
//       filters.userId = session.user.id;
//     } else if (session.user.role === "station_admin") {
//       // Station admins can only see their station's data
//       if (!stationName || stationName === "all") {
//         filters.stationName = session.user.stationName;
//       }
//     }
//     // For super_admin, no additional filters - they see all data

//     // For file-based data (temporary solution until fully migrated to database)
//     // This is to handle the JSON file data shown in the attachment
//     try {
//       // Try to fetch from database first
//       const dbData = await prisma.meteorologicalData.findMany({
//         where: filters,
//         orderBy: { timestamp: "asc" },
//       });

//       // If we're using file-based data as a fallback or in addition to DB data
//       const fs = require("fs");
//       const path = require("path");
//       const DATA_FILE_PATH = path.join(
//         process.cwd(),
//         "data",
//         "first-card-data.json"
//       );

//       let fileData = [];
//       try {
//         const fileContent = await fs.promises.readFile(DATA_FILE_PATH, "utf-8");
//         fileData = JSON.parse(fileContent);

//         // Apply filters to file data
//         if (date) {
//           const startDate = new Date(`${date}T00:00:00Z`);
//           const endDate = new Date(`${date}T23:59:59Z`);
//           fileData = fileData.filter((item) => {
//             const itemDate = new Date(item.timestamp);
//             return itemDate >= startDate && itemDate <= endDate;
//           });
//         }

//         if (stationName && stationName !== "all") {
//           fileData = fileData.filter(
//             (item) => item.stationName === stationName
//           );
//         }

//         if (session.user.role === "observer") {
//           fileData = fileData.filter((item) => item.userId === session.user.id);
//         } else if (session.user.role === "station_admin") {
//           if (!stationName || stationName === "all") {
//             fileData = fileData.filter(
//               (item) => item.stationName === session.user.stationName
//             );
//           }
//         }
//         // For super_admin, no additional filtering
//       } catch (fileError) {
//         // File doesn't exist or can't be read, just use DB data
//         console.log("No file data available:", fileError.message);
//         fileData = [];
//       }

//       // Combine data from both sources
//       const combinedData = [...dbData, ...fileData];

//       // Sort by timestamp
//       combinedData.sort(
//         (a, b) =>
//           new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
//       );

//       return NextResponse.json(combinedData);
//     } catch (dbError) {
//       console.error("Database error:", dbError);
//       // Fallback to file-based data if database fails
//       // This is temporary until full migration to database
//       const fs = require("fs");
//       const path = require("path");
//       const DATA_FILE_PATH = path.join(
//         process.cwd(),
//         "data",
//         "first-card-data.json"
//       );

//       try {
//         const fileContent = await fs.promises.readFile(DATA_FILE_PATH, "utf-8");
//         let fileData = JSON.parse(fileContent);

//         // Apply filters to file data
//         if (date) {
//           const startDate = new Date(`${date}T00:00:00Z`);
//           const endDate = new Date(`${date}T23:59:59Z`);
//           fileData = fileData.filter((item) => {
//             const itemDate = new Date(item.timestamp);
//             return itemDate >= startDate && itemDate <= endDate;
//           });
//         }

//         if (stationName && stationName !== "all") {
//           fileData = fileData.filter(
//             (item) => item.stationName === stationName
//           );
//         }

//         if (session.user.role === "observer") {
//           fileData = fileData.filter((item) => item.userId === session.user.id);
//         } else if (session.user.role === "station_admin") {
//           if (!stationName || stationName === "all") {
//             fileData = fileData.filter(
//               (item) => item.stationName === session.user.stationName
//             );
//           }
//         }
//         // For super_admin, no additional filtering

//         return NextResponse.json(fileData);
//       } catch (fileError) {
//         console.error("File error:", fileError);
//         return NextResponse.json([]);
//       }
//     }
//   } catch (error) {
//     console.error("Error reading data:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to read data" },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  try {
    // Get the meteorological data
    const data = getFirstCardData();

    // Return the data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching first card data:", error);
    return NextResponse.json(
      { error: "Failed to fetch first card data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session for authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const newData = await request.json();

    // Add user ID and timestamps
    const dataWithMetadata = {
      ...newData,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to database
    const savedData = await prisma.meteorologicalData.create({
      data: dataWithMetadata,
    });

    return NextResponse.json({
      success: true,
      message: "Data saved successfully!",
      data: savedData,
    });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save data" },
      { status: 500 }
    );
  }
}

// Add PUT method to update a specific record
export async function PUT(request: NextRequest) {
  try {
    // Get user session for authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, timestamp, ...updateData } = await request.json();

    // Find the record to check permissions
    const record = await prisma.meteorologicalData.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    // Check if user can edit this record
    if (
      !canEditRecord(
        session.user.role,
        record.timestamp,
        session.user.id,
        record.userId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to edit this record",
        },
        { status: 403 }
      );
    }

    // Update the record
    const updatedRecord = await prisma.meteorologicalData.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Record updated successfully!",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update data" },
      { status: 500 }
    );
  }
}

// Add DELETE method to remove a specific record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session for authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Find the record to check permissions
    const record = await prisma.meteorologicalData.findUnique({
      where: { id },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    // Check if user can delete this record
    if (
      !canEditRecord(
        session.user.role,
        record.timestamp,
        session.user.id,
        record.userId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You don't have permission to delete this record",
        },
        { status: 403 }
      );
    }

    // Delete the record
    await prisma.meteorologicalData.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting data:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete data" },
      { status: 500 }
    );
  }
}
