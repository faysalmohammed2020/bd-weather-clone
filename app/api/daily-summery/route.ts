// // app/api/daily-summary/route.ts

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// import { getSession } from "@/lib/getSession";
// import { PrismaClient } from "@prisma/client";
// import { NextResponse } from "next/server";
// const prisma = new PrismaClient();

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//      const session = await getSession();
//         if (!session || !session.user) {
//           return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//         }
//     const userId = session.user.id;     // Convert segmented fields (objects) to full string

    

//     const created = await prisma.dailySummary.create({
//       data: {
//         userId,
//         dataType: body.dataType,
//         stationNo: body.stationNo,
//         month: body.month,
//         day: body.day,
//         year: body.year,
//         avStationPressure: body.avStationPressure,
//         avSeaLevelPressure: body.avSeaLevelPressure,
//         avDryBulbTemperature: body.avDryBulbTemperature,
//         avWetBulbTemperature: body.avWetBulbTemperature,
//         maxTemperature: body.maxTemperature,
//         minTemperature: body.minTemperature,
//         totalPrecipitation: body.totalPrecipitation,
//         avDewPointTemperature: body.avDewPointTemperature,
//         avRelativeHumidity: body.avRelativeHumidity,
//         windSpeed: body.windSpeed,
//         windDirectionCode: body.windDirectionCode,
//         maxWindSpeed: body.maxWindSpeed,
//         maxWindDirection: body.maxWindDirection,
//         avTotalCloud: body.avTotalCloud,
//         lowestVisibility: body.lowestVisibility,
//         totalRainDuration: body.totalRainDuration,
//       },
//     });

//     return NextResponse.json(created);
//   } catch (error) {
//     console.error("Failed to save daily summary:", error);
//     return new NextResponse("Server Error", { status: 500 });
//   }
// }


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const entry = await prisma.dailySummary.create({
      data: {
        userId: body.userId,
        dataType: body.dataType,
        stationNo: body.stationNo,
        year: parseInt(body.year),
        month: parseInt(body.month),
        day: parseInt(body.day),

        avStationPressure: body.measurements?.[0] || null,
        avSeaLevelPressure: body.measurements?.[1] || null,
        avDryBulbTemperature: body.measurements?.[2] || null,
        avWetBulbTemperature: body.measurements?.[3] || null,
        maxTemperature: body.measurements?.[4] || null,
        minTemperature: body.measurements?.[5] || null,
        totalPrecipitation: body.measurements?.[6] || null,
        avDewPointTemperature: body.measurements?.[7] || null,
        avRelativeHumidity: body.measurements?.[8] || null,
        windSpeed: body.measurements?.[9] || null,
        windDirectionCode: body.windDirection || null,
        maxWindSpeed: body.measurements?.[11] || null,
        maxWindDirection: body.measurements?.[12] || null,
        avTotalCloud: body.measurements?.[13] || null,
        lowestVisibility: body.measurements?.[14] || null,
        totalRainDuration: body.measurements?.[15] || null,

      },
    });

    return NextResponse.json(entry);
  } catch (err) {
    console.error("❌ DB save error:", err);
    return new NextResponse("Failed to save data", { status: 500 });
  }
}
