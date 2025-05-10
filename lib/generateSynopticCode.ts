// // utils/generateSynopticCode.ts
// import firstCardData from '../data/first-card-data.json';
// import weatherObservations from '../data/weather-observations.json';

// export interface SynopticFormValues {
//   dataType: string;
//   stationNo: string;
//   year: string;
//   month: string;
//   day: string;
//   weatherRemark: string;
//   measurements: string[];
// }

// export function generateSynopticCode(): SynopticFormValues {
//   // Get the most recent entries from both files
//   const firstCard = firstCardData[firstCardData.length - 1];
//   const weatherObs = weatherObservations[weatherObservations.length - 1];

//   // Initialize measurements array with empty strings
//   const measurements: string[] = Array(21).fill('');

//   // Helper functions
//   const pad = (num: number | string, length: number): string => {
//     return String(num).padStart(length, '0');
//   };

//   const getTempValue = (temp: number): string => {
//     const sign = temp >= 0 ? '0' : '1';
//     const absTemp = Math.abs(Math.round(temp * 10));
//     return `${sign}${pad(absTemp, 3)}`;
//   };

//   // 1. C1 (16) - Always 1
//   measurements[0] = '1';

//   // 2. Iliii (17-21) - Station number (5 digits)
//   const stationNo = firstCard.stationNo ? 
//     Object.values(firstCard.stationNo).slice(0, 5).join('') : '00000';
//   measurements[1] = stationNo;

//   // 3. iRiXhvv (22-26) - 32 + low cloud height (2 digits) + visibility (1 digit)
//   const lowCloudHeight = pad(weatherObs.clouds?.low?.height || 0, 2);
//   const visibility = firstCard.horizontalVisibility?.toString()?.[0] || '0';
//   measurements[2] = `32${lowCloudHeight}${visibility}`;

//   // 4. Nddff (27-31) - Total cloud (1 digit) + wind direction (2 digits) + wind speed (2 digits)
//   const totalCloud = weatherObs.totalCloud?.['total-cloud-amount'] || '0';
//   const windDirection = pad(weatherObs.wind?.direction || 0, 2);
//   const windSpeed = pad(weatherObs.wind?.speed || 0, 2);
//   measurements[3] = `${totalCloud}${windDirection}${windSpeed}`;

//   // 5. 1SnTTT (32-36) - 1 + sign + dry bulb temp (3 digits)
//   const dryBulb = parseFloat(firstCard.dryBulbAsRead || '0');
//   measurements[4] = `1${getTempValue(dryBulb)}`;

//   // 6. 2SnTdTdTd (37-41) - 2 + sign + dew point temp (3 digits)
//   const dewPoint = parseFloat(firstCard.Td || '0');
//   measurements[5] = `2${getTempValue(dewPoint)}`;

//   // 7. 3PPP/4PPP (42-46) - Station pressure / sea level pressure
//   const stationPressure = firstCard.stationLevelPressure?.toString().replace('.', '').slice(0, 4) || '0000';
//   const seaLevelPressure = firstCard.correctedSeaLevelPressure?.toString().replace('.', '').slice(0, 4) || '0000';
//   measurements[6] = `3${stationPressure}/4${seaLevelPressure}`;

//   // 8. 6RRRtR (47-51) - Precipitation (4 digits) + duration (1 digit)
//   const precipitation = weatherObs.rainfall?.['last-24-hours'] || '0';
//   measurements[7] = `6${pad(precipitation, 4)}0`;

//   // 9. 7wwW1W2 (52-56) - Weather codes
//   const presentWeather = firstCard.presentWeatherWW || '00';
//   const pastWeather1 = firstCard.pastWeatherW1 || '0';
//   const pastWeather2 = firstCard.pastWeatherW2 || '0';
//   measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`;

//   // 10. 8NhClCmCh (57-61) - Cloud information
//   const lowAmount = weatherObs.clouds?.low?.amount || '0';
//   const lowForm = weatherObs.clouds?.low?.form || '0';
//   const mediumForm = weatherObs.clouds?.medium?.form || '0';
//   const highForm = weatherObs.clouds?.high?.form || '0';
//   measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`;

//   // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
//   const minTemp = parseFloat(firstCard.maxMinTempAsRead || '0');
//   measurements[10] = `2${getTempValue(minTemp)}/0000`;

//   // 12. 56DlDmDh (67-71) - Cloud directions
//   const lowDir = weatherObs.clouds?.low?.direction || '0';
//   const mediumDir = weatherObs.clouds?.medium?.direction || '0';
//   const highDir = weatherObs.clouds?.high?.direction || '0';
//   measurements[11] = `56${lowDir}${mediumDir}${highDir}`;

//   // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
//   const pressureTendency = firstCard.pressureChange24h?.toString()[0] || '0';
//   measurements[12] = `57${pressureTendency}00`;

//   // 14. Av. Total Cloud (56) - Total cloud amount
//   measurements[13] = totalCloud;

//   // 15. C2 (16) - Always 2
//   measurements[14] = '2';

//   // 16. GG (17-18) - Observation time (3 hour gap)
//   const obsTime = weatherObs.observer?.['observation-time'] || '';
//   let hour = '00';
//   if (obsTime) {
//     const timePart = obsTime.split('T')[1] || '';
//     const hours = parseInt(timePart.split(':')[0] || '0');
//     hour = pad(Math.floor(hours / 3) * 3, 2);
//   }
//   measurements[15] = hour;

//   // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
//   const pressureChange = parseFloat(firstCard.pressureChange24h || '0');
//   const pressureChangeIndicator = pressureChange >= 0 ? '58' : '59';
//   const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3);
//   measurements[16] = `${pressureChangeIndicator}${absPressureChange}/${pressureChangeIndicator.slice(0, 1)}9${absPressureChange}`;

//   // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
//   measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`;

//   // 19. 8N5Ch5h5 (29-33) - Cloud information
//   measurements[18] = `8${totalCloud}${lowForm}00`;

//   // 20. 90dqqqt (34-38) - Dew point depression
//   const dewDepression = dryBulb - dewPoint;
//   measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`;

//   // 21. 91fqfqfq (39-43) - Relative humidity
//   const humidity = firstCard.relativeHumidity || '0';
//   measurements[20] = `91${pad(humidity, 3)}`;

//   // Create the form values
//   const now = new Date();
//   const formValues: SynopticFormValues = {
//     dataType: 'SYNOP',
//     stationNo,
//     year: now.getFullYear().toString(),
//     month: pad(now.getMonth() + 1, 2),
//     day: pad(now.getDate(), 2),
//     weatherRemark: weatherObs.observer?.['observer-initial'] || '',
//     measurements,
//   };

//   return formValues;
// }



// import type { SynopticFormValues } from "../types/synoptic"

// // Dummy data - replace with your actual data source
// const firstCardData = [
//   {
//     date: "2024-01-01",
//     stationNo: { "0": "1", "1": "2", "2": "3", "3": "4", "4": "5" },
//     horizontalVisibility: 10,
//     dryBulbAsRead: "25.5",
//     Td: "20.0",
//     stationLevelPressure: 1012.5,
//     correctedSeaLevelPressure: 1015.0,
//     presentWeatherWW: "01",
//     pastWeatherW1: "1",
//     pastWeatherW2: "2",
//     maxMinTempAsRead: "15.0",
//     pressureChange24h: "2.5",
//     relativeHumidity: "80",
//   },
//   {
//     date: "2024-01-02",
//     stationNo: { "0": "1", "1": "2", "2": "3", "3": "4", "4": "5" },
//     horizontalVisibility: 10,
//     dryBulbAsRead: "25.5",
//     Td: "20.0",
//     stationLevelPressure: 1012.5,
//     correctedSeaLevelPressure: 1015.0,
//     presentWeatherWW: "01",
//     pastWeatherW1: "1",
//     pastWeatherW2: "2",
//     maxMinTempAsRead: "15.0",
//     pressureChange24h: "2.5",
//     relativeHumidity: "80",
//   },
//   {
//     date: "2024-01-03",
//     stationNo: { "0": "1", "1": "2", "2": "3", "3": "4", "4": "5" },
//     horizontalVisibility: 10,
//     dryBulbAsRead: "25.5",
//     Td: "20.0",
//     stationLevelPressure: 1012.5,
//     correctedSeaLevelPressure: 1015.0,
//     presentWeatherWW: "01",
//     pastWeatherW1: "1",
//     pastWeatherW2: "2",
//     maxMinTempAsRead: "15.0",
//     pressureChange24h: "2.5",
//     relativeHumidity: "80",
//   },
// ]

// const weatherObservations = [
//   {
//     observer: { "observation-time": "2024-01-01T12:00:00", "observer-initial": "AB" },
//     clouds: {
//       low: { height: 100, amount: "3", form: "1", direction: "N" },
//       medium: { form: "4", direction: "E" },
//       high: { form: "7", direction: "W" },
//     },
//     wind: { direction: 90, speed: 15 },
//     totalCloud: { "total-cloud-amount": "5" },
//     rainfall: { "last-24-hours": "10" },
//   },
//   {
//     observer: { "observation-time": "2024-01-02T12:00:00", "observer-initial": "AB" },
//     clouds: {
//       low: { height: 100, amount: "3", form: "1", direction: "N" },
//       medium: { form: "4", direction: "E" },
//       high: { form: "7", direction: "W" },
//     },
//     wind: { direction: 90, speed: 15 },
//     totalCloud: { "total-cloud-amount": "5" },
//     rainfall: { "last-24-hours": "10" },
//   },
//   {
//     observer: { "observation-time": "2024-01-03T12:00:00", "observer-initial": "AB" },
//     clouds: {
//       low: { height: 100, amount: "3", form: "1", direction: "N" },
//       medium: { form: "4", direction: "E" },
//       high: { form: "7", direction: "W" },
//     },
//     wind: { direction: 90, speed: 15 },
//     totalCloud: { "total-cloud-amount": "5" },
//     rainfall: { "last-24-hours": "10" },
//   },
// ]

// export function generateSynopticCode(): SynopticFormValues {
//   // Get the current date
//   const now = new Date()
//   const today = now.toISOString().split("T")[0] // Format: YYYY-MM-DD

//   // Filter data for the current date only
//   const todayFirstCardData = firstCardData.filter((card) => {
//     // Check if the card has a date property and it matches today's date
//     return card.date && card.date.toString().includes(today)
//   })

//   const todayWeatherObservations = weatherObservations.filter((obs) => {
//     // Check if the observation has a date property and it matches today's date
//     const obsDate = obs.observer?.["observation-time"]?.split("T")[0]
//     return obsDate === today
//   })

//   // Get the most recent entries from filtered data
//   // If no entries for today, fall back to the most recent entry
//   const firstCard =
//     todayFirstCardData.length > 0
//       ? todayFirstCardData[todayFirstCardData.length - 1]
//       : firstCardData[firstCardData.length - 1]

//   const weatherObs =
//     todayWeatherObservations.length > 0
//       ? todayWeatherObservations[todayWeatherObservations.length - 1]
//       : weatherObservations[weatherObservations.length - 1]

//   // Rest of the function remains the same
//   // Initialize measurements array with empty strings
//   const measurements: string[] = Array(21).fill("")

//   // Helper functions
//   const pad = (num: number | string, length: number): string => {
//     return String(num).padStart(length, "0")
//   }

//   const getTempValue = (temp: number): string => {
//     const sign = temp >= 0 ? "0" : "1"
//     const absTemp = Math.abs(Math.round(temp * 10))
//     return `${sign}${pad(absTemp, 3)}`
//   }

//   // 1. C1 (16) - Always 1
//   measurements[0] = "1"

//   // 2. Iliii (17-21) - Station number (5 digits)
//   const stationNo = firstCard.stationNo ? Object.values(firstCard.stationNo).slice(0, 5).join("") : "00000"
//   measurements[1] = stationNo

//   // 3. iRiXhvv (22-26) - 32 + low cloud height (2 digits) + visibility (1 digit)
//   const lowCloudHeight = pad(weatherObs.clouds?.low?.height || 0, 2)
//   const visibility = firstCard.horizontalVisibility?.toString()?.[0] || "0"
//   measurements[2] = `32${lowCloudHeight}${visibility}`

//   // 4. Nddff (27-31) - Total cloud (1 digit) + wind direction (2 digits) + wind speed (2 digits)
//   const totalCloud = weatherObs.totalCloud?.["total-cloud-amount"] || "0"
//   const windDirection = pad(weatherObs.wind?.direction || 0, 2)
//   const windSpeed = pad(weatherObs.wind?.speed || 0, 2)
//   measurements[3] = `${totalCloud}${windDirection}${windSpeed}`

//   // 5. 1SnTTT (32-36) - 1 + sign + dry bulb temp (3 digits)
//   const dryBulb = Number.parseFloat(firstCard.dryBulbAsRead || "0")
//   measurements[4] = `1${getTempValue(dryBulb)}`

//   // 6. 2SnTdTdTd (37-41) - 2 + sign + dew point temp (3 digits)
//   const dewPoint = Number.parseFloat(firstCard.Td || "0")
//   measurements[5] = `2${getTempValue(dewPoint)}`

//   // 7. 3PPP/4PPP (42-46) - Station pressure / sea level pressure
//   const stationPressure = firstCard.stationLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//   const seaLevelPressure = firstCard.correctedSeaLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
//   measurements[6] = `3${stationPressure}/4${seaLevelPressure}`

//   // 8. 6RRRtR (47-51) - Precipitation (4 digits) + duration (1 digit)
//   const precipitation = weatherObs.rainfall?.["last-24-hours"] || "0"
//   measurements[7] = `6${pad(precipitation, 4)}0`

//   // 9. 7wwW1W2 (52-56) - Weather codes
//   const presentWeather = firstCard.presentWeatherWW || "00"
//   const pastWeather1 = firstCard.pastWeatherW1 || "0"
//   const pastWeather2 = firstCard.pastWeatherW2 || "0"
//   measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`

//   // 10. 8NhClCmCh (57-61) - Cloud information
//   const lowAmount = weatherObs.clouds?.low?.amount || "0"
//   const lowForm = weatherObs.clouds?.low?.form || "0"
//   const mediumForm = weatherObs.clouds?.medium?.form || "0"
//   const highForm = weatherObs.clouds?.high?.form || "0"
//   measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`

//   // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
//   const minTemp = Number.parseFloat(firstCard.maxMinTempAsRead || "0")
//   measurements[10] = `2${getTempValue(minTemp)}/0000`

//   // 12. 56DlDmDh (67-71) - Cloud directions
//   const lowDir = weatherObs.clouds?.low?.direction || "0"
//   const mediumDir = weatherObs.clouds?.medium?.direction || "0"
//   const highDir = weatherObs.clouds?.high?.direction || "0"
//   measurements[11] = `56${lowDir}${mediumDir}${highDir}`

//   // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
//   const pressureTendency = firstCard.pressureChange24h?.toString()[0] || "0"
//   measurements[12] = `57${pressureTendency}00`

//   // 14. Av. Total Cloud (56) - Total cloud amount
//   measurements[13] = totalCloud

//   // 15. C2 (16) - Always 2
//   measurements[14] = "2"

//   // 16. GG (17-18) - Observation time (3 hour gap)
//   const obsTime = weatherObs.observer?.["observation-time"] || ""
//   let hour = "00"
//   if (obsTime) {
//     const timePart = obsTime.split("T")[1] || ""
//     const hours = Number.parseInt(timePart.split(":")[0] || "0")
//     hour = pad(Math.floor(hours / 3) * 3, 2)
//   }
//   measurements[15] = hour

//   // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
//   const pressureChange = Number.parseFloat(firstCard.pressureChange24h || "0")
//   const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59"
//   const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3)
//   measurements[16] = `${pressureChangeIndicator}${absPressureChange}/${pressureChangeIndicator.slice(0, 1)}9${absPressureChange}`

//   // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
//   measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`

//   // 19. 8N5Ch5h5 (29-33) - Cloud information
//   measurements[18] = `8${totalCloud}${lowForm}00`

//   // 20. 90dqqqt (34-38) - Dew point depression
//   const dewDepression = dryBulb - dewPoint
//   measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`

//   // 21. 91fqfqfq (39-43) - Relative humidity
//   const humidity = firstCard.relativeHumidity || "0"
//   measurements[20] = `91${pad(humidity, 3)}`

//   // Create the form values
//   const formValues: SynopticFormValues = {
//     dataType: "SYNOP",
//     stationNo,
//     year: now.getFullYear().toString(),
//     month: pad(now.getMonth() + 1, 2),
//     day: pad(now.getDate(), 2),
//     weatherRemark: weatherObs.observer?.["observer-initial"] || "",
//     measurements,
//   }

//   return formValues
// }








import firstCardData from "../data/first-card-data.json"
import weatherObservations from "../data/weather-observations.json"

export interface SynopticFormValues {
  dataType: string
  stationNo: string
  year: string
  month: string
  day: string
  weatherRemark: string
  measurements: string[]
}

export function generateSynopticCode(): SynopticFormValues {
  // Get the current date
  const now = new Date()
  const today = now.toISOString().split("T")[0] // Format: YYYY-MM-DD

  // Filter data for the current date only
  const todayFirstCardData = firstCardData.filter((card) => {
    // Check if the card has a timestamp property and it matches today's date
    return card.timestamp && card.timestamp.toString().includes(today)
  })

  const todayWeatherObservations = weatherObservations.filter((obs) => {
    // Check if the observation has a date property and it matches today's date
    const obsDate = obs.observer?.["observation-time"]?.split("T")[0]
    return obsDate === today
  })

  // Get the most recent entries from filtered data
  // If no entries for today, fall back to the most recent entry
  const firstCard =
    todayFirstCardData.length > 0
      ? todayFirstCardData[todayFirstCardData.length - 1]
      : firstCardData[firstCardData.length - 1]

  const weatherObs =
    todayWeatherObservations.length > 0
      ? todayWeatherObservations[todayWeatherObservations.length - 1]
      : weatherObservations[weatherObservations.length - 1]

  // Initialize measurements array with empty strings
  const measurements: string[] = Array(21).fill("")

  // Helper functions
  const pad = (num: number | string, length: number): string => {
    return String(num).padStart(length, "0")
  }

  const getTempValue = (temp: number): string => {
    const sign = temp >= 0 ? "0" : "1"
    const absTemp = Math.abs(Math.round(temp * 10))
    return `${sign}${pad(absTemp, 3)}`
  }

  // 1. C1 (16) - Always 1
  measurements[0] = "1"

  // 2. Iliii (17-21) - Station number (5 digits)
  // "Iliii 17-21" field data will come from: "stationNo" of "first-card-data.json"
  const stationNo = firstCard.stationNo ? Object.values(firstCard.stationNo).slice(0, 5).join("") : "00000"
  measurements[1] = stationNo

  // 3. iRiXhvv (22-26) - 32 + low cloud height (2 digits) + visibility (1 digit)
  // "iRiXhW 22-26" field data will come from : 32 is constant + "clouds>low>height" fields+ "horizontalVisibility" of "first-card-data.json"
  const lowCloudHeight = pad(weatherObs.clouds?.low?.height || 0, 2)
  const visibility = firstCard.horizontalVisibility?.toString()?.[0] || "0"
  measurements[2] = `32${lowCloudHeight}${visibility}`

  // 4. Nddff (27-31) - Total cloud (1 digit) + wind direction (2 digits) + wind speed (2 digits)
  // "Nddff 27-31" field data come from:"totalCloud>total-cloud-amount" of "weather-obserbations.json" + "wind>speed" of "weather-obserbations.json" file
  const totalCloud = weatherObs.totalCloud?.["total-cloud-amount"] || "0"
  const windDirection = pad(weatherObs.wind?.direction || 0, 2)
  const windSpeed = pad(weatherObs.wind?.speed || 0, 2)
  measurements[3] = `${totalCloud}${windDirection}${windSpeed}`

  // 5. 1SnTTT (32-36) - 1 + sign + dry bulb temp (3 digits)
  // "1SnTTT 32-36" field data come from: 1 is constant + (0/1, if zero or positive then value is 0 , else 1)+"dryBulbAsRead" from "first-card-data.json"
  const dryBulb = Number.parseFloat(firstCard.dryBulbAsRead || "0")
  measurements[4] = `1${getTempValue(dryBulb)}`

  // 6. 2SnTdTdTd (37-41) - 2 + sign + dew point temp (3 digits)
  // "2SnTdTdTd 37-41" field come from: 2 is constant +(0/1, if zero or positive then value is 0 , else 1)+"Td" of "first-card-data.json"
  const dewPoint = Number.parseFloat(firstCard.Td || "0")
  measurements[5] = `2${getTempValue(dewPoint)}`

  // 7. 3PPP/4PPP (42-46) - Station pressure / sea level pressure
  // "3PPP/4PPP 42-46" field come from: (show as the given format, do not calculate:(3/4)(stationLevelPressure/correctedSeaLevelPressure)) from "first-card-data.json"
  const stationPressure = firstCard.stationLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
  const seaLevelPressure = firstCard.correctedSeaLevelPressure?.toString().replace(".", "").slice(0, 4) || "0000"
  measurements[6] = `3${stationPressure}/4${seaLevelPressure}`

  // 8. 6RRRtR (47-51) - Precipitation (4 digits) + duration (1 digit)
  const precipitation = weatherObs.rainfall?.["last-24-hours"] || "0"
  measurements[7] = `6${pad(precipitation, 4)}0`

  // 9. 7wwW1W2 (52-56) - Weather codes
  const presentWeather = firstCard.presentWeatherWW || "00"
  const pastWeather1 = firstCard.pastWeatherW1 || "0"
  const pastWeather2 = firstCard.pastWeatherW2 || "0"
  measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`

  // 10. 8NhClCmCh (57-61) - Cloud information
  // "8NhClCmCh 57-61" field data come from: 8 is constant + "clouds>low>amount" from "weather-obserbations.json"+"clouds>low>form"+"clouds>medium>form"+"clouds>high>form"
  const lowAmount = weatherObs.clouds?.low?.amount || "0"
  const lowForm = weatherObs.clouds?.low?.form || "0"
  const mediumForm = weatherObs.clouds?.medium?.form || "0"
  const highForm = weatherObs.clouds?.high?.form || "0"
  measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`

  // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
  const minTemp = Number.parseFloat(firstCard.maxMinTempAsRead || "0")
  measurements[10] = `2${getTempValue(minTemp)}/0000`

  // 12. 56DlDmDh (67-71) - Cloud directions
  // "56DlDmDh 67-71" field data come from: 56 is constant+ low cloud direction "clouds>low>direction" from "weather-obserbations.json" + medium cloud direction "clouds>medium>direction" from "weather-obserbations.json" + high cloud direction "clouds>high>direction" "weather-obserbations.json"
  const lowDir = weatherObs.clouds?.low?.direction || "0"
  const mediumDir = weatherObs.clouds?.medium?.direction || "0"
  const highDir = weatherObs.clouds?.high?.direction || "0"
  measurements[11] = `56${lowDir}${mediumDir}${highDir}`

  // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
  const pressureTendency = firstCard.pressureChange24h?.toString()[0] || "0"
  measurements[12] = `57${pressureTendency}00`

  // 14. Av. Total Cloud (56) - Total cloud amount
  measurements[13] = totalCloud

  // 15. C2 (16) - Always 2
  // "C2 16": all are 2
  measurements[14] = "2"

  // 16. GG (17-18) - Observation time (3 hour gap)
  // "GG 17-18" : this field data means time 3houre gap data 03 , 06, 09
  const obsTime = weatherObs.observer?.["observation-time"] || ""
  let hour = "00"
  if (obsTime) {
    const timePart = obsTime.split("T")[1] || ""
    const hours = Number.parseInt(timePart.split(":")[0] || "0")
    hour = pad(Math.floor(hours / 3) * 3, 2)
  }
  measurements[15] = hour

  // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
  // "58P24P24P24/59P24P24P24 19-23" this field data come from: "pressureChange24h" of "first-card-data.json" if value is possitive then code value is 58 else 59 + Value of "pressureChange24h"
  const pressureChange = Number.parseFloat(firstCard.pressureChange24h || "0")
  const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59"
  const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3)
  measurements[16] = `${pressureChangeIndicator}${absPressureChange}`

  // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
  measurements[17] = `(${measurements[7]})/7${pad(precipitation, 3)}`

  // 19. 8N5Ch5h5 (29-33) - Cloud information
  measurements[18] = `8${totalCloud}${lowForm}00`

  // 20. 90dqqqt (34-38) - Dew point depression
  const dewDepression = dryBulb - dewPoint
  measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`

  // 21. 91fqfqfq (39-43) - Relative humidity
  const humidity = firstCard.relativeHumidity || "0"
  measurements[20] = `91${pad(humidity, 3)}`

  // Create the form values
  const formValues: SynopticFormValues = {
    dataType: "SYNOP",
    stationNo,
    year: now.getFullYear().toString(),
    month: pad(now.getMonth() + 1, 2),
    day: pad(now.getDate(), 2),
    weatherRemark: weatherObs.observer?.["observer-initial"] || "",
    measurements,
  }

  return formValues
}
