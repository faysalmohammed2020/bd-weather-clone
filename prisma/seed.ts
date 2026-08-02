// prisma/seed.ts

import prisma from "../lib/prisma";
import { stations } from "../data/stations";

async function main() {
  await prisma.$transaction(async (tx) => {
    console.log("🌱 Starting seed...");

    const existingStations = await tx.station.findMany({
      select: {
        id: true,
        stationId: true,
      },
    });

    const existingByStationId = new Map(
      existingStations.map((station) => [station.stationId, station.id])
    );

    let createdCount = 0;
    let updatedCount = 0;

    for (const station of stations) {
      const existingId = existingByStationId.get(station.stationId);

      if (existingId) {
        await tx.station.update({
          where: { id: existingId },
          data: {
            name: station.name,
            stationId: station.stationId,
            securityCode: station.securityCode,
            latitude: station.latitude,
            longitude: station.longitude,
          },
        });
        updatedCount++;
      } else {
        await tx.station.create({
          data: station,
        });
        createdCount++;
      }
    }

    console.log(
      `🎉 Seed complete. Created ${createdCount} stations, updated ${updatedCount} stations.`
    );
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
