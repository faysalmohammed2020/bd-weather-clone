"use server";

import prisma from "@/lib/prisma";
import { convertUTCToBDTime, hourToUtc } from "@/lib/utils";
import { getSession } from "@/lib/getSession";
import { revalidatePath } from "next/cache";

export const addTime = async (time: string) => {
  const session = await getSession();
  const formattedTime = hourToUtc(time);
  const localTime = convertUTCToBDTime(formattedTime);

  try {
    const newTime = await prisma.observingTime.create({
      data: {
        utcTime: formattedTime,
        localTime: localTime,
        user: {
          connect: {
            id: session?.user?.id,
          },
        },
      },
    });

    revalidatePath("/dashboard/data-entry/first-card");

    return {
        success: true,
        time: newTime.utcTime,
    };
  } catch (error) {
    return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
    };
  }
};
