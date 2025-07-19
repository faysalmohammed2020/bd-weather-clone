import prisma from "../lib/prisma";
import { stations } from "../data/stations";
import bcrypt from "bcryptjs";

async function main() {
  await prisma.$transaction(async (tx) => {
    console.log("🌱 Starting seed...");

    // Step 1: Clear old data
    await tx.synopticCode.deleteMany();
    await tx.dailySummary.deleteMany();
    await tx.weatherObservation.deleteMany();
    await tx.meteorologicalEntry.deleteMany();
    await tx.observingTime.deleteMany();

    await tx.soilMoistureData.deleteMany();
    await tx.sunshineData.deleteMany();
    await tx.agroclimatologicalData.deleteMany();

    await tx.sessions.deleteMany();
    await tx.accounts.deleteMany();
    await tx.twoFactor.deleteMany();
    await tx.logs.deleteMany();

    await tx.users.deleteMany();
    await tx.station.deleteMany();

    console.log("🧹 All old data cleared safely");

    // Step 2: Seed all stations
    await tx.station.createMany({
      data: stations,
      skipDuplicates: true,
    });

    // Step 3: Fetch Amman/Marka Airport station
    const ammanStation = await tx.station.findFirst({
      where: { stationId: "OJAM" }, // ✅ Replaced 41923 with OJAM
    });

    if (!ammanStation) {
      throw new Error("❌ OJAM station not found");
    }

    // Step 4: Create 3 users for 3 roles
    const users = await Promise.all([
      tx.users.create({
        data: {
          name: "Super Admin",
          email: "superadmin@example.com",
          emailVerified: true,
          role: "super_admin",
          banned: false,
          stationId: ammanStation.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      tx.users.create({
        data: {
          name: "Station Admin",
          email: "stationadmin@example.com",
          emailVerified: true,
          role: "station_admin",
          banned: false,
          stationId: ammanStation.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
      tx.users.create({
        data: {
          name: "Observer",
          email: "observer@example.com",
          emailVerified: true,
          role: "observer",
          banned: false,
          stationId: ammanStation.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      }),
    ]);

    // Step 5: Create accounts with hashed passwords
    const salt = await bcrypt.genSalt(10);

    await tx.accounts.createMany({
      data: [
        {
          accountId: "superadmin@example.com",
          providerId: "credentials",
          password: await bcrypt.hash("superadmin123", salt),
          userId: users[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          accountId: "stationadmin@example.com",
          providerId: "credentials",
          password: await bcrypt.hash("stationadmin123", salt),
          userId: users[1].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          accountId: "observer@example.com",
          providerId: "credentials",
          password: await bcrypt.hash("observer123", salt),
          userId: users[2].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    });

    console.log("✅ Seeded OJAM station, 3 users, and passwords");
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
