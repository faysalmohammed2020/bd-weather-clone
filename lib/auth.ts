import { betterAuth } from "better-auth";
import { admin, twoFactor, customSession } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { multiSession } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    ...(process.env.NODE_ENV === "development"
      ? [
          process.env.NEXT_PUBLIC_APP_URL!,
          process.env.NEXT_PUBLIC_SECONDARY_APP_URL!,
        ]
      : [process.env.NEXT_PUBLIC_APP_URL!]),
  ],
  user: {
    modelName: "users",
    additionalFields: {
      stationId: {
        required: true,
        type: "string",
      },
      role: {
        required: true,
        type: "string",
        enum: ["super_admin", "station_admin", "observer"],
      },
    },
  },
  session: {
    cookieCache: {
      enabled: false,
    },
    modelName: "sessions",
    expiresIn: 60 * 15, // 15 minutes
    updateAge: 0,
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
    disableCleanup: true,
  },
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
  },
  appName: "Jordan Weather",
  plugins: [
    multiSession({
      maximumSessions: 1,
    }),
    admin({
      defaultRole: "observer",
      adminRoles: ["super_admin"],
    }),
    twoFactor(),
    customSession(async ({ user, session }) => {
      const authUser = await prisma.users.findUnique({
        where: {
          id: session.userId,
        },
        include: {
          Station: true,
        },
      });

      return {
        session,
        user: {
          ...user,
          role: authUser?.role,
          station: authUser?.Station,
        },
      };
    }),
    nextCookies(),
  ],
});
