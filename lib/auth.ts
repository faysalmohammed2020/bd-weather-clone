import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { randomBytes } from "node:crypto";
import prisma from "@/lib/prisma";
import { consumeAuthTicket } from "@/lib/auth-tickets";

const SESSION_MAX_AGE = 15 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    Credentials({
      id: "credentials",
      name: "Jordan Weather credentials",
      credentials: {
        loginTicket: { type: "text" },
      },
      async authorize(credentials) {
        const loginTicket = credentials.loginTicket;
        if (typeof loginTicket !== "string") return null;

        const userId = await consumeAuthTicket(loginTicket, "login");
        if (!userId) return null;

        const user = await prisma.users.findUnique({
          where: { id: userId },
          include: { Station: true },
        });

        if (!user || user.banned) return null;

        const sessionToken = randomBytes(32).toString("hex");
        const now = new Date();
        const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000);

        await prisma.sessions.create({
          data: {
            token: sessionToken,
            userId: user.id,
            expiresAt,
            createdAt: now,
            updatedAt: now,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          stationId: user.stationId,
          station: user.Station,
          twoFactorEnabled: Boolean(user.twoFactorEnabled),
          sessionToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.stationId = user.stationId;
        token.station = user.station;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.sessionToken = user.sessionToken;
        return token;
      }

      if (typeof token.sessionToken !== "string") return null;

      const activeSession = await prisma.sessions.findUnique({
        where: { token: token.sessionToken },
        include: { user: { include: { Station: true } } },
      });

      if (
        !activeSession ||
        activeSession.expiresAt <= new Date() ||
        activeSession.user.banned
      ) {
        return null;
      }

      token.id = activeSession.user.id;
      token.email = activeSession.user.email;
      token.name = activeSession.user.name;
      token.picture = activeSession.user.image;
      token.role = activeSession.user.role;
      token.stationId = activeSession.user.stationId;
      token.station = activeSession.user.Station;
      token.twoFactorEnabled = Boolean(activeSession.user.twoFactorEnabled);
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string | null;
      session.user.stationId = token.stationId as string;
      session.user.station = token.station as typeof session.user.station;
      session.user.twoFactorEnabled = Boolean(token.twoFactorEnabled);
      session.sessionToken = token.sessionToken as string;
      return session;
    },
  },
  events: {
    async signOut(message) {
      if ("token" in message && typeof message.token?.sessionToken === "string") {
        await prisma.sessions.deleteMany({
          where: { token: message.token.sessionToken },
        });
      }
    },
  },
});
