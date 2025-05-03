import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
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
        required: true,
        type: "string",
      },
      stationId: {
        nullable: true,
        required: false,
        type: "string",
      },
    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "admin",
    }),
  ],
});
