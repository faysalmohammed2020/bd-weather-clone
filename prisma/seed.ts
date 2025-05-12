// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { stations } from "../data/stations";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Delete all existing stations first (optional)
  await prisma.station.deleteMany();
  console.log("🧹 Cleared existing stations data");

  // Create stations in batches
  for (const station of stations) {
    await prisma.station.create({
      data: station,
    });
    console.log(`✅ Created station: ${station.name}`);
  }

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
