import { createHash, randomBytes } from "node:crypto";
import prisma from "@/lib/prisma";

export type AuthTicketKind = "login" | "pending-2fa";

const hashTicket = (ticket: string) =>
  createHash("sha256").update(ticket).digest("hex");

export async function issueAuthTicket(
  userId: string,
  kind: AuthTicketKind,
  lifetimeSeconds = 5 * 60,
) {
  const ticket = randomBytes(32).toString("base64url");
  const now = new Date();
  const identifier = `${kind}:${userId}`;

  await prisma.$transaction([
    prisma.verifications.deleteMany({ where: { identifier } }),
    prisma.verifications.create({
      data: {
        identifier,
        value: hashTicket(ticket),
        expiresAt: new Date(now.getTime() + lifetimeSeconds * 1000),
        createdAt: now,
        updatedAt: now,
      },
    }),
  ]);

  return ticket;
}

export async function readAuthTicket(ticket: string, kind: AuthTicketKind) {
  const record = await prisma.verifications.findFirst({
    where: {
      identifier: { startsWith: `${kind}:` },
      value: hashTicket(ticket),
      expiresAt: { gt: new Date() },
    },
  });

  if (!record) return null;

  return {
    id: record.id,
    value: record.value,
    userId: record.identifier.slice(kind.length + 1),
  };
}

export async function consumeAuthTicket(ticket: string, kind: AuthTicketKind) {
  const record = await readAuthTicket(ticket, kind);
  if (!record) return null;

  const deleted = await prisma.verifications.deleteMany({
    where: { id: record.id, value: record.value },
  });
  if (deleted.count !== 1) return null;

  return record.userId;
}
