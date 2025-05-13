// prisma/seed.ts

import prisma from "../lib/prisma";
import { stations } from "../data/stations";

async function main() {
  console.log("🌱 Starting seed...");

  // Delete all existing stations first (optional)
  await prisma.station.deleteMany();
  console.log("🧹 Cleared existing stations data");

  // Create stations in batches
  await prisma.station.createMany({
    data: stations,
  });

  console.log(`🎉 Successfully seeded ${stations.length} stations`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
