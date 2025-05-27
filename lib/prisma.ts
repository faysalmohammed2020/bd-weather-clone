import { PrismaPg, withBemiExtension } from "@bemi-db/prisma";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof withBemiExtension<PrismaClient>>;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma =
  globalForPrisma.prisma ||
  withBemiExtension(
    new PrismaClient({
      adapter,
      log: ["error"],
    })
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
