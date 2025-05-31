import prisma from "@/lib/prisma";
import { hourToUtc } from "@/lib/utils";
import { generateDailySummary } from "@/lib/getDailySummary";
import { getSession } from "@/lib/getSession";

const TestPage = async () => {
    const session = await getSession();
    if (!session || !session.user?.id) {
        return;
      }

    const formattedObservingTime = hourToUtc("00");
    const firstAndSecondCardData = await prisma.observingTime.findMany({
        where: {
          AND: [
            {
              utcTime: formattedObservingTime,
            },
            { stationId: session.user.station?.id as string },
          ],
        },
        include: {
          station: true,
          MeteorologicalEntry: true,
          WeatherObservation: true,
        },
        orderBy: {
          utcTime: "desc",
        },
        take: 100,
      });
      

      const getCalculatedDailySummary = generateDailySummary(
        firstAndSecondCardData,
        formattedObservingTime,
        session.user?.station?.id as string
      );

      console.log("getCalculatedDailySummary", getCalculatedDailySummary);

    return (
        <>
        <div>{JSON.stringify(getCalculatedDailySummary)}</div>
        </>
    );
}
 
export default TestPage;