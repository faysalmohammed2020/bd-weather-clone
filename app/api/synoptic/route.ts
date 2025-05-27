import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTodayUtcRange, utcToHour } from "@/lib/utils";
import { getSession } from "@/lib/getSession";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { startToday, endToday } = getTodayUtcRange();

    const observingTime = await prisma.observingTime.findFirst({
      where: {
        AND: [
          {
            utcTime: {
              gte: startToday,
              lte: endToday,
            },
          },
          {
            stationId: session.user.station?.id,
          },
        ],
      },
      orderBy: { utcTime: "desc" },
      include: {
        MeteorologicalEntry: true,
        WeatherObservation: true,
      },
    });

    console.log(observingTime);

    if (
      !observingTime?.MeteorologicalEntry.length ||
      !observingTime?.WeatherObservation.length
    ) {
      return NextResponse.json(
        { error: "First or second card data not found" },
        { status: 404 }
      );
    }

    const firstCard = observingTime?.MeteorologicalEntry[0];
    const weatherObs = observingTime?.WeatherObservation[0];

    // Get the observation date from the most recent record
    const observationDate = weatherObs.submittedAt || firstCard.createdAt;
    const dateObj = new Date(observationDate);

    // Initialize measurements array
    const measurements: string[] = Array(21).fill("");

    // Helper functions
    const pad = (
      num: number | string | null | undefined,
      length: number
    ): string => {
      return String(num ?? 0).padStart(length, "0");
    };

    const getTempValue = (temp: number | null | undefined): string => {
      const safeTemp = temp ?? 0;
      const sign = safeTemp >= 0 ? "0" : "1";
      const absTemp = Math.abs(Math.round(safeTemp * 10));
      return `${sign}${pad(absTemp, 3)}`;
    };

    // 1. C1 (16) - Always 1
    measurements[0] = "1";

    // 2. Iliii (17-21) - Station number (5 digits)
    const stationNo = session.user.station?.stationId as string;
    measurements[1] = stationNo;

    // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
    const lowCloudHeight = weatherObs.lowCloudHeight || "0";
    const visibility = pad(
      (Number(firstCard.horizontalVisibility?.toString()?.[0]) || 0) * 10,
      2
    );
    measurements[2] = `32${lowCloudHeight}${visibility}`;

    // 4. Nddff (27-31) - Total cloud + wind direction + speed
    const totalCloud = weatherObs.totalCloudAmount || "0";
    const windDirectionDeg = Number(weatherObs.windDirection) || 0;
    const windSpeedKnots = Number(weatherObs.windSpeed) || 0;

    let dd;
    if (windSpeedKnots === 0) {
      dd = "00";
    } else {
      let directionCode;
      if (windDirectionDeg >= 355) {
        directionCode = 36;
      } else {
        directionCode = Math.floor((windDirectionDeg + 5) / 10);
      }
      dd = pad(directionCode, 2);
    }

    let ff;
    if (windSpeedKnots >= 100) {
      const numericDd = parseInt(dd, 10);
      dd = pad(numericDd + 50, 2);
      ff = pad(windSpeedKnots - 100, 2);
    } else {
      ff = pad(windSpeedKnots, 2);
    }
    measurements[3] = `${totalCloud}${dd}${ff}`;

    // 5. 1SnTTT (32-36) - Dry bulb temperature
    const dryBulb = Number.parseFloat(firstCard.dryBulbAsRead || "0") / 10;
    measurements[4] = `1${getTempValue(dryBulb)}`;

    // 6. 2SnTdTdTd (37-41) - Dew point temperature
    const dewPoint = Number.parseFloat(firstCard.Td || "0");
    measurements[5] = `2${getTempValue(dewPoint)}`;

    // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
    const formatPressure = (pressure: number | undefined): string => {
      const str = pressure?.toString().replace(".", "") || "0000";
      return str.startsWith("1") && str.length === 5
        ? str.slice(1, 5)
        : str.slice(0, 4);
    };

    const stationPressure = formatPressure(firstCard.stationLevelPressure);
    const seaLevelPressure = formatPressure(
      firstCard.correctedSeaLevelPressure
    );

    measurements[6] = `3${stationPressure}/4${seaLevelPressure}`;

    // 8. 6RRRtR (47-51) - Precipitation
<<<<<<< HEAD
    // 8. 6RRRtR (47-51) - Precipitation
    const rainFall = Number(weatherObs.rainfallDuringPrevious) || 0;
    const rainFallPadded = pad(rainFall.toString().slice(-3), 3); // Last 3 digits

    // Get times from database (all in UTC)
    const observationTime = new Date(observingTime.utcTime); // H (reporting time)
=======
<<<<<<< Updated upstream
    const precipitation = weatherObs.rainfallLast24Hours || '0';
    measurements[7] = `6${pad(precipitation, 4)}`;
=======
    // 8. 6RRRtR (47-51) - Precipitation
    // ... পূর্বের কোড (prisma, session, etc.) এখানে ধরেই নিচ্ছি

    const rainFall = Number(weatherObs.rainfallDuringPrevious) || 0;
    const rainFallPadded = pad(rainFall.toString().slice(-3), 3); // শেষ ৩ সংখ্যা

    const observationTime = new Date(observingTime.utcTime); // H (রিপোর্ট টাইম)
>>>>>>> zisan
    const rainStart = weatherObs.rainfallTimeStart
      ? new Date(weatherObs.rainfallTimeStart)
      : null;
    const rainEnd = weatherObs.rainfallTimeEnd
      ? new Date(weatherObs.rainfallTimeEnd)
      : null;
<<<<<<< HEAD

    let tr = "/";

    if (rainStart && rainEnd) {
      // 1. বৃষ্টির সময়কাল (ঘণ্টায়)
      const durationHours =
        (rainEnd.getTime() - rainStart.getTime()) / (1000 * 60 * 60);

      // 2. বৃষ্টি শেষ হওয়ার পর থেকে রিপোর্ট সময়ের পার্থক্য (ঘণ্টায়)
      let hoursSinceEnd =
        (observationTime.getTime() - rainEnd.getTime()) / (1000 * 60 * 60);

      // রাত ১২টা পার হলে সংশোধন
      if (hoursSinceEnd < 0) {
        hoursSinceEnd += 24; // যেমন: 00:00 - 22:00 = -2 → 22 ঘণ্টা (সঠিক মান 2 ঘণ্টা)
      }

      // 3. tr মান নির্ধারণ
      if (durationHours <= 2) {
        if (hoursSinceEnd <= 2) tr = "4";
        else if (hoursSinceEnd <= 4) tr = "5";
        else if (hoursSinceEnd <= 6) tr = "6";
      } else if (durationHours <= 4) {
        if (hoursSinceEnd <= 2) tr = "7";
        else if (hoursSinceEnd <= 4) tr = "8";
      } else if (durationHours <= 6 && hoursSinceEnd <= 4) tr = "9";
    }

    measurements[7] = `6${rainFallPadded}${tr}`;
=======
    const isIntermittentRain = weatherObs.isIntermittentRain; // true/false; ফর্ম/ডিবিতে যোগ করুন

    let tr = "/";

    // ৬ ঘণ্টার window নির্ধারণ
    const H = observationTime;
    const H_3 = new Date(H.getTime() - 3 * 60 * 60 * 1000);
    const H_6 = new Date(H.getTime() - 6 * 60 * 60 * 1000);

    if (rainStart && rainEnd) {
      if (isIntermittentRain) {
        // Intermittent rain (বিরতিযুক্ত বৃষ্টি) — WMO tr = 1, 2, 3
        if (rainStart >= H_6 && rainEnd <= H_3) {
          tr = "1"; // H-6 to H-3
        } else if (rainStart >= H_3 && rainEnd <= H) {
          tr = "2"; // H-3 to H
        } else if (
          (rainStart <= H_6 && rainEnd >= H) || // পুরো ৬ ঘণ্টা জুড়ে
          (rainStart <= H_6 && rainEnd >= H_3 && rainEnd <= H) || // overlap case
          (rainStart >= H_6 && rainStart <= H_3 && rainEnd >= H)
        ) {
          tr = "3"; // Full 6-hour intermittent
        }
        // না মিললে tr = "/"
      } else {
        // Continuous rain — WMO tr = 4-9
        // Window check: বৃষ্টি অবশ্যই H-6 থেকে H এর মধ্যে
        if (rainStart < H_6 || rainEnd > H) {
          tr = "/";
        } else {
          const durationHours =
            (rainEnd.getTime() - rainStart.getTime()) / (1000 * 60 * 60);
          let hoursSinceEnd =
            (H.getTime() - rainEnd.getTime()) / (1000 * 60 * 60);

          // রাত পার হলে
          if (hoursSinceEnd < 0) hoursSinceEnd += 24;

          if (durationHours <= 2) {
            if (hoursSinceEnd <= 2) tr = "4";
            else if (hoursSinceEnd <= 4) tr = "5";
            else if (hoursSinceEnd <= 6) tr = "6";
          } else if (durationHours <= 4) {
            if (hoursSinceEnd <= 2) tr = "7";
            else if (hoursSinceEnd <= 4) tr = "8";
          } else if (durationHours <= 6 && hoursSinceEnd <= 2) {
            tr = "9";
          }
          // না মিললে tr = "/"
        }
      }
    }

    measurements[7] = `6${rainFallPadded}${tr}`;
>>>>>>> Stashed changes
>>>>>>> zisan

    // 9. 7wwW1W2 (52-56) - Weather codes
    const presentWeather = firstCard.presentWeatherWW || "00";
    const pastWeather1 = firstCard.pastWeatherW1 || "0";
    const pastWeather2 = firstCard.pastWeatherW2 || "0";
    measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`;

    // 10. 8NhClCmCh (57-61) - Cloud information
    const lowAmount = weatherObs.lowCloudAmount || "0";
    const lowForm = weatherObs.lowCloudForm || "0";
    const mediumForm = weatherObs.mediumCloudForm || "0";
    const highForm = weatherObs.highCloudForm || "0";
    measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`;

    // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
    const minTemp = Number.parseFloat(firstCard.maxMinTempAsRead || "0") / 10;

    let sN, x;
    if (minTemp >= 0) {
      sN = 0;
      x = 1;
    } else {
      sN = 1;
      x = 2;
    }
    const conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3);
    measurements[10] = `${x}${sN}${conVertMinTemp}`;

    // 12. 56DlDmDh (67-71) - Cloud directions
    const lowDir = weatherObs.lowCloudDirection || "0";
    const mediumDir = weatherObs.mediumCloudDirection || "0";
    const highDir = weatherObs.highCloudDirection || "0";
    measurements[11] = `56${lowDir}${mediumDir}${highDir}`;

    // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
    const specialCloudForm = weatherObs.layer1Form || "0";
    const specialCloudDirection = weatherObs.lowCloudDirection || "0";
    measurements[12] = `57${specialCloudForm}${specialCloudDirection}${specialCloudForm}`;

    // 14. Av. Total Cloud (56) - Total cloud amount
    measurements[13] = totalCloud;

    // 15. C2 (16) - Always 2
    measurements[14] = "2";

    // 16. GG (17-18) - Observation time (3 hour gap)

    measurements[15] = utcToHour(observingTime.utcTime.toString());

    // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
    const pressureChange = Number.parseFloat(
      firstCard.pressureChange24h || "0"
    );
    const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59";
    const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3);
    measurements[16] = `${pressureChangeIndicator}${absPressureChange}`;

    // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
    measurements[17] = `${measurements[7]}`;

    // 19. 8N5Ch5h5 (29-33) - Cloud information
    let lowFormSig = weatherObs.layer1Form || "0";
    let mediumFormSig = weatherObs.layer2Form || "0";
    let highFormSig = weatherObs.layer3Form || "0";
    let fourthFormSig = weatherObs.layer4Form || "0";

    let lowAmountSig = weatherObs.layer1Amount || "0";
    let mediumAmountSig = weatherObs.layer2Amount || "0";
    let highAmountSig = weatherObs.layer3Amount || "0";
    let fourthAmountSig = weatherObs.layer4Amount || "0";

    let lowHeightSig = pad(Number(weatherObs.layer1Height) || 0, 2);
    let mediumHeightSig = pad(Number(weatherObs.layer2Height) || 0, 2);
    let highHeightSig = pad(Number(weatherObs.layer3Height) || 0, 2);
    let fourthHeightSig = pad(Number(weatherObs.layer4Height) || 0, 2);
    measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig} /8${fourthAmountSig}${fourthFormSig}${fourthHeightSig}`;

    // 20. 90dqqqt (34-38) - Dew point depression
    const dewDepression = dryBulb - dewPoint;
    measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`;

    // 21. 91fqfqfq (39-43) - Relative humidity
    const humidity = firstCard.relativeHumidity || "0";
    measurements[20] = `91${pad(humidity, 3)}`;

    // Create the form values
    const formValues = {
      dataType: "SYNOP",
      stationNo,
      year: dateObj.getFullYear().toString(),
      month: pad(dateObj.getMonth() + 1, 2),
      day: pad(dateObj.getDate(), 2),
      weatherRemark: weatherObs.observerInitial || "",
      measurements,
    };

    return NextResponse.json(formValues);
  } catch (error) {
    console.error("Error generating synoptic code:", error);
    return NextResponse.json(
      { error: "Failed to generate synoptic code" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
