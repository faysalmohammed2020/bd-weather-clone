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
  trustedOrigins: ["http://localhost:7999"],
  user: {
    modelName: "users",
    additionalFields: {
      division: {
        required: true,
        type: "string",
      },
      district: {
        required: true,
        type: "string",
      },
      upazila: {
        nullable: true,
        required: false,
        type: "string",
      },
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
  appName: "BD Weather",
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
          division: authUser?.division,
          district: authUser?.district,
          upazila: authUser?.upazila,
        },
      };
    }),
    nextCookies(),
  ],
});
