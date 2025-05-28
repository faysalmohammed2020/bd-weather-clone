"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function getLogs() {
  try {
    const session = await getSession();

    if (!session) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }

    const logs = await prisma.logs.findMany({
      where: {
        AND: [
          {
            role: session.user.role == "super_admin" ? "super_admin" : "observer",
          },
          {
            actor: {
              stationId: session.user.station?.id,
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        actor: true,
        targetUser: true,
      },
    });

    return logs;
  } catch (error) {
    console.error("Error fetching logs:", error);
    return {
      error: `Failed to fetch logs: ${error}`,
      status: 500,
    };
  }
}
