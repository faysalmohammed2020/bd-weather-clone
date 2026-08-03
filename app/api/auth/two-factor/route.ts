import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { consumeAuthTicket, issueAuthTicket, readAuthTicket } from "@/lib/auth-tickets";
import { verifyPassword } from "@/lib/password";
import {
  consumeBackupCode,
  createTwoFactorSetup,
  decryptTwoFactorValue,
  encryptTwoFactorValue,
  verifyTotp,
} from "@/lib/two-factor";

const PENDING_COOKIE = "jordan-weather.2fa";

async function getPasswordHash(userId: string) {
  const account = await prisma.accounts.findFirst({
    where: { userId, providerId: "credential" },
    select: { password: true },
  });
  return account?.password ?? null;
}

async function pendingUserId() {
  const ticket = (await cookies()).get(PENDING_COOKIE)?.value;
  if (!ticket) return null;
  const pending = await readAuthTicket(ticket, "pending-2fa");
  return pending ? { ticket, userId: pending.userId } : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action as string;
    const session = await auth();

    if (action === "enable" || action === "disable") {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const passwordHash = await getPasswordHash(session.user.id);
      if (!passwordHash || !(await verifyPassword(body.password ?? "", passwordHash))) {
        return NextResponse.json({ error: "Invalid password" }, { status: 400 });
      }

      if (action === "disable") {
        await prisma.$transaction([
          prisma.twoFactor.deleteMany({ where: { userId: session.user.id } }),
          prisma.users.update({
            where: { id: session.user.id },
            data: { twoFactorEnabled: false, updatedAt: new Date() },
          }),
        ]);
        return NextResponse.json({ status: true });
      }

      const setup = createTwoFactorSetup(session.user.email ?? "user");
      await prisma.twoFactor.deleteMany({ where: { userId: session.user.id } });
      await prisma.twoFactor.create({
        data: {
          userId: session.user.id,
          secret: encryptTwoFactorValue(setup.secret),
          backupCodes: encryptTwoFactorValue(JSON.stringify(setup.backupCodes)),
        },
      });
      return NextResponse.json({ totpURI: setup.totpURI, backupCodes: setup.backupCodes });
    }

    if (action === "verify-totp") {
      const pending = session?.user?.id ? null : await pendingUserId();
      const userId = session?.user?.id ?? pending?.userId;
      if (!userId) {
        return NextResponse.json({ error: "Two-factor session expired" }, { status: 401 });
      }
      const record = await prisma.twoFactor.findFirst({ where: { userId } });
      if (!record?.secret || !(await verifyTotp(decryptTwoFactorValue(record.secret), body.code ?? ""))) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
      }

      if (session?.user?.id) {
        await prisma.users.update({
          where: { id: userId },
          data: { twoFactorEnabled: true, updatedAt: new Date() },
        });
        return NextResponse.json({ status: true });
      }

      if (!pending || (await consumeAuthTicket(pending.ticket, "pending-2fa")) !== userId) {
        return NextResponse.json({ error: "Two-factor session expired" }, { status: 401 });
      }
      const loginTicket = await issueAuthTicket(userId, "login");
      const response = NextResponse.json({ status: true, loginTicket });
      response.cookies.delete(PENDING_COOKIE);
      return response;
    }

    if (action === "verify-backup-code") {
      const pending = await pendingUserId();
      if (!pending) {
        return NextResponse.json({ error: "Two-factor session expired" }, { status: 401 });
      }
      const record = await prisma.twoFactor.findFirst({ where: { userId: pending.userId } });
      if (!record?.backupCodes) {
        return NextResponse.json({ error: "Backup codes are not configured" }, { status: 400 });
      }
      const remaining = consumeBackupCode(record.backupCodes, body.code ?? "");
      if (!remaining) {
        return NextResponse.json({ error: "Invalid backup code" }, { status: 400 });
      }
      await prisma.twoFactor.update({
        where: { id: record.id },
        data: { backupCodes: encryptTwoFactorValue(JSON.stringify(remaining)) },
      });
      if ((await consumeAuthTicket(pending.ticket, "pending-2fa")) !== pending.userId) {
        return NextResponse.json({ error: "Two-factor session expired" }, { status: 401 });
      }
      const loginTicket = await issueAuthTicket(pending.userId, "login");
      const response = NextResponse.json({ status: true, loginTicket });
      response.cookies.delete(PENDING_COOKIE);
      return response;
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Two-factor request failed:", error);
    return NextResponse.json({ error: "Two-factor request failed" }, { status: 500 });
  }
}
