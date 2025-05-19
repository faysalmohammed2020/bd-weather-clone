import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newEntry = await prisma.synopticEntry.create({
      data: {
        stationNo: body.stationNo || null,
        stationName: body.stationName || null,
        year: body.year || null,
        month: body.month || null,
        day: body.day || null,
        dataType: body.dataType || "SYNOP",

        // Measurement fields
        C1: body.C1 || null,
        Iliii: body.Iliii || null,
        iRiXhvv: body.iRiXhvv || null,
        Nddff: body.Nddff || null,
        S1nTTT: body.S1nTTT || null,
        S2nTddTddTdd: body.S2nTddTddTdd || null,
        P3PPP4PPPP: body.P3PPP4PPPP || null,
        RRRtR6: body.RRRtR6 || null,
        wwW1W2: body.wwW1W2 || null,
        NhClCmCh: body.NhClCmCh || null,
        S2nTnTnTnInInInIn: body.S2nTnTnTnInInInIn || null,
        D56DLDMDH: body.D56DLDMDH || null,
        CD57DaEc: body.CD57DaEc || null,
        avgTotalCloud: body.avgTotalCloud || null,
        C2: body.C2 || null,
        GG: body.GG || null,
        P24Group58_59: body.P24Group58_59 || null,
        R24Group6_7: body.R24Group6_7 || null,
        NsChshs: body.NsChshs || null,
        dqqqt90: body.dqqqt90 || null,
        fqfqfq91: body.fqfqfq91 || null,

        weatherRemark: body.weatherRemark || null,
      },
    });

    return NextResponse.json(
      { message: "Synoptic entry saved", data: newEntry },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save synoptic entry:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
