import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTodayUtcRange, utcToHour } from '@/lib/utils';
import { getSession } from '@/lib/getSession';

const prisma = new PrismaClient();

export async function GET() {
  try {

    const session = await getSession()

    if(!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { startToday, endToday } = getTodayUtcRange()

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
          }
        ]
      },
      orderBy: { utcTime: 'desc' },
      include: {
        MeteorologicalEntry: true,
        WeatherObservation: true,
      }
    });

    if (!observingTime?.MeteorologicalEntry.length || !observingTime?.WeatherObservation.length) {
      return NextResponse.json(
        { error: 'First or second card data not found' },
        { status: 404 }
      );
    }



    const firstCard = observingTime?.MeteorologicalEntry[0];
    const weatherObs = observingTime?.WeatherObservation[0];

    // Get the observation date from the most recent record
    const observationDate = weatherObs.submittedAt || firstCard.createdAt;
    const dateObj = new Date(observationDate);

    // Initialize measurements array
    const measurements: string[] = Array(21).fill('');

    // Helper functions
    const pad = (num: number | string | null | undefined, length: number): string => {
      return String(num ?? 0).padStart(length, '0');
    };

    const getTempValue = (temp: number | null | undefined): string => {
      const safeTemp = temp ?? 0;
      const sign = safeTemp >= 0 ? '0' : '1';
      const absTemp = Math.abs(Math.round(safeTemp * 10));
      return `${sign}${pad(absTemp, 3)}`;
    };

    // 1. C1 (16) - Always 1
    measurements[0] = '1';

    // 2. Iliii (17-21) - Station number (5 digits)
    const stationNo = session.user.station?.stationId as string;
    measurements[1] = stationNo;

    // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
    const lowCloudHeight = (weatherObs.lowCloudHeight || '0');
    const visibility = pad((Number(firstCard.horizontalVisibility?.toString()?.[0]) || 0) * 10, 2);
    measurements[2] = `32${lowCloudHeight}${visibility}`;

    // 4. Nddff (27-31) - Total cloud + wind direction + speed
    const totalCloud = weatherObs.totalCloudAmount || '0';
    const windDirectionDeg = Number(weatherObs.windDirection) || 0;
    const windSpeedKnots = Number(weatherObs.windSpeed) || 0;

    let dd;
    if (windSpeedKnots === 0) {
      dd = '00';
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
    const dryBulb = Number.parseFloat(firstCard.dryBulbAsRead || '0') / 10;
    measurements[4] = `1${getTempValue(dryBulb)}`;

    // 6. 2SnTdTdTd (37-41) - Dew point temperature
    const dewPoint = Number.parseFloat(firstCard.Td || '0');
    measurements[5] = `2${getTempValue(dewPoint)}`;

    // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
    const stationPressure = firstCard.stationLevelPressure?.toString().replace('.', '').slice(0, 4) || '0000';
    const seaLevelPressure = firstCard.correctedSeaLevelPressure?.toString().replace('.', '').slice(0, 4) || '0000';
    measurements[6] = `3${stationPressure}/4${seaLevelPressure}`;

    // 8. 6RRRtR (47-51) - Precipitation
    const precipitation = weatherObs.rainfallLast24Hours || '0';
    measurements[7] = `6${pad(precipitation, 4)}`;

    // 9. 7wwW1W2 (52-56) - Weather codes
    const presentWeather = firstCard.presentWeatherWW || '00';
    const pastWeather1 = firstCard.pastWeatherW1 || '0';
    const pastWeather2 = firstCard.pastWeatherW2 || '0';
    measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`;

    // 10. 8NhClCmCh (57-61) - Cloud information
    const lowAmount = weatherObs.lowCloudAmount || '0';
    const lowForm = weatherObs.lowCloudForm || '0';
    const mediumForm = weatherObs.mediumCloudForm || '0';
    const highForm = weatherObs.highCloudForm || '0';
    measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`;

    // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
    const minTemp = Number.parseFloat(firstCard.maxMinTempAsRead || '0') / 10;

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
    const lowDir = weatherObs.lowCloudDirection || '0';
    const mediumDir = weatherObs.mediumCloudDirection || '0';
    const highDir = weatherObs.highCloudDirection || '0';
    measurements[11] = `56${lowDir}${mediumDir}${highDir}`;

    // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
    const pressureTendency = firstCard.pressureChange24h?.toString()[0] || '0';
    measurements[12] = `57${pressureTendency}00`;

    // 14. Av. Total Cloud (56) - Total cloud amount
    measurements[13] = totalCloud;

    // 15. C2 (16) - Always 2
    measurements[14] = '2';

    // 16. GG (17-18) - Observation time (3 hour gap)
    

    measurements[15] = utcToHour(observingTime.utcTime.toString());

    // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
    const pressureChange = Number.parseFloat(firstCard.pressureChange24h || '0');
    const pressureChangeIndicator = pressureChange >= 0 ? '58' : '59';
    const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3);
    measurements[16] = `${pressureChangeIndicator}${absPressureChange}`;

    // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
    measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`;

    // 19. 8N5Ch5h5 (29-33) - Cloud information
    let lowFormSig = weatherObs.layer1Form || '0';
    let mediumFormSig = weatherObs.layer2Form || '0';
    let highFormSig = weatherObs.layer3Form || '0';

    let lowAmountSig = weatherObs.layer1Amount || '0';
    let mediumAmountSig = weatherObs.layer2Amount || '0';
    let highAmountSig = weatherObs.layer3Amount || '0';

    let lowHeightSig = pad((Number(weatherObs.layer1Height) || 0) * 10, 2);
    let mediumHeightSig = pad((Number(weatherObs.layer2Height) || 0) * 10, 2);
    let highHeightSig = pad((Number(weatherObs.layer3Height) || 0) * 10, 2);

    measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig}`;

    // 20. 90dqqqt (34-38) - Dew point depression
    const dewDepression = dryBulb - dewPoint;
    measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`;

    // 21. 91fqfqfq (39-43) - Relative humidity
    const humidity = firstCard.relativeHumidity || '0';
    measurements[20] = `91${pad(humidity, 3)}`;

    // Create the form values
    const formValues = {
      dataType: 'SYNOP',
      stationNo,
      year: dateObj.getFullYear().toString(),
      month: pad(dateObj.getMonth() + 1, 2),
      day: pad(dateObj.getDate(), 2),
      weatherRemark: weatherObs.observerInitial || '',
      measurements,
    };

    return NextResponse.json(formValues);

  } catch (error) {
    console.error('Error generating synoptic code:', error);
    return NextResponse.json(
      { error: 'Failed to generate synoptic code' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}