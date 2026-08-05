// prisma/seed.ts

import prisma from "../lib/prisma";
import { stations } from "../data/stations";
import { hashPassword } from "../lib/password";

const SUPER_ADMIN_EMAIL =
  process.env.SEED_SUPER_ADMIN_EMAIL ?? "demo.superadmin@local.test";
const SUPER_ADMIN_PASSWORD =
  process.env.SEED_SUPER_ADMIN_PASSWORD ??
  (process.env.NODE_ENV === "production" ? undefined : "SuperAdmin123!");

type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "station_admin" | "observer";
};

const DEVELOPMENT_USERS: SeedUser[] = [
  {
    name: "Demo Station Admin",
    email: "demo.stationadmin@local.test",
    password: "StationAdmin123!",
    role: "station_admin",
  },
  {
    name: "Demo Observer",
    email: "demo.observer@local.test",
    password: "Observer123!",
    role: "observer",
  },
];

async function main() {
  if (!SUPER_ADMIN_PASSWORD) {
    throw new Error(
      "SEED_SUPER_ADMIN_PASSWORD is required when seeding in production."
    );
  }

  const seedUsers: SeedUser[] = [
    {
      name: "Demo Super Admin",
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      role: "super_admin",
    },
    ...(process.env.NODE_ENV === "production" ? [] : DEVELOPMENT_USERS),
  ];

  const usersWithPasswordHashes = await Promise.all(
    seedUsers.map(async (user) => ({
      ...user,
      passwordHash: await hashPassword(user.password),
    }))
  );

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

    for (const seedUser of usersWithPasswordHashes) {
      const now = new Date();
      const user = await tx.users.upsert({
        where: { email: seedUser.email },
        update: {
          name: seedUser.name,
          role: seedUser.role,
          stationId: adminStation.id,
          emailVerified: true,
          banned: false,
          banReason: null,
          banExpires: null,
          ...(process.env.NODE_ENV === "production"
            ? {}
            : { twoFactorEnabled: false }),
          updatedAt: now,
        },
        create: {
          name: seedUser.name,
          email: seedUser.email,
          role: seedUser.role,
          stationId: adminStation.id,
          emailVerified: true,
          image: null,
          banned: false,
          banReason: null,
          banExpires: null,
          twoFactorEnabled: false,
          createdAt: now,
          updatedAt: now,
        },
      });

      const credentialAccount = await tx.accounts.findFirst({
        where: {
          userId: user.id,
          providerId: "credential",
        },
        select: { id: true },
      });

      if (credentialAccount) {
        await tx.accounts.update({
          where: { id: credentialAccount.id },
          data: {
            accountId: user.id,
            password: seedUser.passwordHash,
            updatedAt: now,
          },
        });
      } else {
        await tx.accounts.create({
          data: {
            accountId: user.id,
            providerId: "credential",
            userId: user.id,
            password: seedUser.passwordHash,
            createdAt: now,
            updatedAt: now,
          },
        });
      }

      await tx.sessions.deleteMany({ where: { userId: user.id } });
      console.log(`${seedUser.role} ready: ${seedUser.email}`);
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
