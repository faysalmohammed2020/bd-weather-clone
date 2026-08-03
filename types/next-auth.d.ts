import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Station } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string | null;
      stationId: string;
      station: Station;
      twoFactorEnabled: boolean;
    } & DefaultSession["user"];
    sessionToken: string;
  }

  interface User {
    role: string | null;
    stationId: string;
    station: Station;
    twoFactorEnabled: boolean;
    sessionToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    stationId?: string;
    station?: Station;
    twoFactorEnabled?: boolean;
    sessionToken?: string;
  }
}
