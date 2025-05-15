import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET stations based on role
export async function GET() {
  try {
    // Return stations from `station` table for super_admin
    const stations = await prisma.station.findMany();
    return NextResponse.json(stations);
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { message: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}

// POST create new station
export async function POST(request: Request) {
  try {
    const { name, stationId, securityCode } = await request.json();

    const station = await prisma.station.create({
      data: {
        name,
        stationId,
        securityCode,
      },
    });

    return NextResponse.json(station);
  } catch (error) {
    console.error("Error creating station:", error);
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { getSession } from "@/lib/getSession";

// // GET: Return stations based on role
// export async function GET() {
//   try {
//     const session = await getSession();

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const userRole = session.user.role;
//     const userStationId = session.user.stationId;
//     let stations;

//     if (userRole === "super_admin") {
//       // Super admin can see all stations
//       stations = await prisma.station.findMany();
//     } else if (userRole === "station_admin" || userRole === "observer") {
//       // Only see their assigned station
//       if (!userStationId) {
//         return NextResponse.json(
//           { error: "No station assigned to user" },
//           { status: 404 }
//         );
//       }

//       stations = await prisma.station.findMany({
//         where: { id: userStationId },
//       });
//     } else {
//       return NextResponse.json({ error: "Invalid role" }, { status: 403 });
//     }

//     return NextResponse.json(stations);
//   } catch (error) {
//     console.error("Error fetching stations:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch stations" },
//       { status: 500 }
//     );
//   }
// }

// // POST: Create a new station (likely by super_admin)
// export async function POST(request: Request) {
//   try {
//     const session = await getSession();

//     if (!session || !session.user || session.user.role !== "super_admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { name, stationId, securityCode, latitude, longitude } =
//       await request.json();

//     if (
//       !name ||
//       !stationId ||
//       !securityCode ||
//       latitude == null ||
//       longitude == null
//     ) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const station = await prisma.station.create({
//       data: {
//         name,
//         stationId,
//         securityCode,
//         latitude,
//         longitude,
//       },
//     });

//     return NextResponse.json(station);
//   } catch (error) {
//     console.error("Error creating station:", error);
//     return NextResponse.json(
//       { error: "Failed to create station" },
//       { status: 500 }
//     );
//   }
// }
