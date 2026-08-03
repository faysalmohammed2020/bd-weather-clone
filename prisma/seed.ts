// prisma/seed.ts

import prisma from "../lib/prisma";
import { stations } from "../data/stations";
import { hashPassword } from "../lib/password";

const SUPER_ADMIN_EMAIL =
  process.env.SEED_SUPER_ADMIN_EMAIL ?? "superadmin@jordanweather.com";
const SUPER_ADMIN_PASSWORD =
  process.env.SEED_SUPER_ADMIN_PASSWORD ??
  (process.env.NODE_ENV === "production" ? undefined : "SuperAdmin@123");

async function main() {
  if (!SUPER_ADMIN_PASSWORD) {
    throw new Error(
      "SEED_SUPER_ADMIN_PASSWORD is required when seeding in production."
    );
  }

  const hashedSuperAdminPassword = await hashPassword(SUPER_ADMIN_PASSWORD);

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

    // A station relation is required for every user. Super admins still have
    // access to all stations regardless of this assigned home station.
    const adminStation = await tx.station.findFirstOrThrow({
      where: { stationId: stations[0].stationId },
      select: { id: true },
    });

    const superAdmin = await tx.users.upsert({
      where: { email: SUPER_ADMIN_EMAIL },
      update: {
        name: "Super Admin",
        role: "super_admin",
        stationId: adminStation.id,
        emailVerified: true,
        banned: false,
        banReason: null,
        banExpires: null,
        updatedAt: new Date(),
      },
      create: {
        name: "Super Admin",
        email: SUPER_ADMIN_EMAIL,
        role: "super_admin",
        stationId: adminStation.id,
        emailVerified: true,
        image: null,
        banned: false,
        banReason: null,
        banExpires: null,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const credentialAccount = await tx.accounts.findFirst({
      where: {
        userId: superAdmin.id,
        providerId: "credential",
      },
      select: { id: true },
    });

    if (credentialAccount) {
      await tx.accounts.update({
        where: { id: credentialAccount.id },
        data: {
          accountId: superAdmin.id,
          password: hashedSuperAdminPassword,
          updatedAt: new Date(),
        },
      });
    } else {
      await tx.accounts.create({
        data: {
          accountId: superAdmin.id,
          providerId: "credential",
          userId: superAdmin.id,
          password: hashedSuperAdminPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    console.log(`Super admin ready: ${SUPER_ADMIN_EMAIL}`);
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
