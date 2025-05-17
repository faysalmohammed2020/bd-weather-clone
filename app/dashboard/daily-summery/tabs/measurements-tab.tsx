// "use client";

// import { useEffect, useState } from "react";
// import { useFormikContext } from "formik";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// export default function MeasurementsTab() {
//   const { values, setFieldValue } = useFormikContext<{
//     measurements: string[];
//   }>();

//   const measurements = [
//     {
//       id: 0,
//       label: "Av. Station Pressure",
//       range: "14-18",
//       dataKey: "stationLevelPressure",
//     },
//     {
//       id: 1,
//       label: "Av. Sea-Level Pressure",
//       range: "19-23",
//       dataKey: "correctedSeaLevelPressure",
//     },
//     {
//       id: 2,
//       label: "Av. Dry-Bulb Temperature",
//       range: "24-26",
//       dataKey: "dryBulbAsRead",
//     },
//     {
//       id: 3,
//       label: "Av. Wet Bulb Temperature",
//       range: "27-28",
//       dataKey: "wetBulbAsRead",
//     },
//     {
//       id: 4,
//       label: "Max. Temperature",
//       range: "30-32",
//       dataKey: "maxMinTempAsRead",
//     },
//     {
//       id: 5,
//       label: "Min Temperature",
//       range: "33-35",
//       dataKey: "maxMinTempAsRead",
//     },
//     { id: 6, label: "Total Precipitation", range: "36-39" },
//     {
//       id: 7,
//       label: "Av. Dew. Point Temperature",
//       range: "40-42",
//       dataKey: "Td",
//     },
//     {
//       id: 8,
//       label: "Av. Rel Humidity",
//       range: "43-45",
//       dataKey: "relativeHumidity",
//     },
//     { id: 9, label: "Av. Wind Speed", range: "46-48" },
//     { id: 10, label: "Prevailing Wind Direction (16Pts)", range: "49-50" },
//     { id: 11, label: "Max Wind Speed", range: "51-53" },
//     { id: 12, label: "Direction of Max Wind (16Pts)", range: "54-55" },
//     { id: 13, label: "Av. Total Cloud", range: "56" },
//     {
//       id: 14,
//       label: "Lowest visibility",
//       range: "57-59",
//       dataKey: "horizontalVisibility",
//     },
//     { id: 15, label: "Total Duration of Rain (H-M)", range: "60-63" },
//   ];

//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );
//   const [isLoading, setIsLoading] = useState(false);

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     setIsLoading(true);
//   //     try {
//   //       const filteredDate = selectedDate;

//   //       // Fetch first card data
//   //       const firstCardResponse = await fetch("/api/first-card-data");
//   //       const firstCardData = await firstCardResponse.json();
//   //       const todayFirstCardData = firstCardData.entries.filter((item: any) => {
//   //         const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
//   //         return itemDate === filteredDate;
//   //       });

//   //       // Fetch weather observations data
//   //       const observationsResponse = await fetch("/api/save-observation");
//   //       const weatherObservations = await observationsResponse.json();
//   //       const todayWeatherObservations = weatherObservations.filter(
//   //         (item: any) => {
//   //           const itemDate = new Date(item.observer["observation-time"])
//   //             .toISOString()
//   //             .split("T")[0];
//   //           return itemDate === filteredDate;
//   //         }
//   //       );

//   //       console.log("First Card Data:", todayFirstCardData);
//   //       console.log("Weather Observations:", weatherObservations);

//   //       const newMeasurements = Array(16).fill(""); // always reset first

//   //       // Process first card data measurements
//   //       if (todayFirstCardData.length > 0) {
//   //         measurements.forEach((measurement) => {
//   //           if (measurement.dataKey) {
//   //             const values = todayFirstCardData
//   //               .map((item: any) =>
//   //                 Number.parseFloat(item[measurement.dataKey])
//   //               )
//   //               .filter((val) => !isNaN(val));

//   //             if (values.length > 0) {
//   //               let result;
//   //               if (measurement.id === 4) {
//   //                 // Max temperature
//   //                 result = Math.max(...values);
//   //               } else if (measurement.id === 5) {
//   //                 // Min temperature
//   //                 result = Math.min(...values);
//   //               } else if (measurement.id === 14) {
//   //                 // Lowest visibility
//   //                 result = Math.min(...values);
//   //               } else {
//   //                 // Average for other measurements
//   //                 result =
//   //                   values.reduce((sum, val) => sum + val, 0) / values.length;
//   //               }

//   //               newMeasurements[measurement.id] = result.toFixed(2);
//   //             }
//   //           }
//   //         });
//   //       }

//   //       // Process weather observations data
//   //       if (todayWeatherObservations.length > 0) {
//   //         // Total Precipitation (36-39) - sum of last-24-hours
//   //         const totalPrecip = todayWeatherObservations.reduce(
//   //           (sum: number, item: any) => {
//   //             const val = Number.parseFloat(item.rainfall["last-24-hours"]);
//   //             return isNaN(val) ? sum : sum + val;
//   //           },
//   //           0
//   //         );
//   //         if (totalPrecip > 0) {
//   //           newMeasurements[6] = totalPrecip.toFixed(2);
//   //         }

//   //         // Av. Wind Speed (46-48) - average of wind.speed
//   //         const windSpeeds = todayWeatherObservations
//   //           .map((item: any) => Number.parseFloat(item.wind.speed))
//   //           .filter((val) => !isNaN(val));
//   //         if (windSpeeds.length > 0) {
//   //           const avgWindSpeed =
//   //             windSpeeds.reduce((sum, val) => sum + val, 0) / windSpeeds.length;
//   //           newMeasurements[9] = avgWindSpeed.toFixed(2);
//   //         }

//   //         // Prevailing Wind Direction (49-50) - most common direction
//   //         const directions = todayWeatherObservations.map(
//   //           (item: any) => item.wind["wind-direction"]
//   //         );
//   //         if (directions.length > 0) {
//   //           const directionCounts = directions.reduce(
//   //             (acc: Record<string, number>, dir: string) => {
//   //               acc[dir] = (acc[dir] || 0) + 1;
//   //               return acc;
//   //             },
//   //             {}
//   //           );
//   //           const prevailingDir = Object.entries(directionCounts).reduce(
//   //             (a, b) => (a[1] > b[1] ? a : b)
//   //           )[0];
//   //           newMeasurements[10] = prevailingDir;
//   //         }

//   //         // Max Wind Speed (51-53) and Direction (54-55)
//   //         const windData = todayWeatherObservations
//   //           .map((item: any) => ({
//   //             speed: Number.parseFloat(item.wind.speed),
//   //             direction: item.wind["wind-direction"],
//   //           }))
//   //           .filter((item) => !isNaN(item.speed));

//   //         if (windData.length > 0) {
//   //           const maxWind = windData.reduce((max, item) =>
//   //             item.speed > max.speed ? item : max
//   //           );
//   //           newMeasurements[11] = maxWind.speed.toFixed(2);
//   //           newMeasurements[12] = maxWind.direction;
//   //         }

//   //         // Av. Total Cloud (56) - average of total-cloud-amount
//   //         const cloudAmounts = todayWeatherObservations
//   //           .map((item: any) =>
//   //             Number.parseFloat(item.totalCloud["total-cloud-amount"])
//   //           )
//   //           .filter((val) => !isNaN(val));
//   //         if (cloudAmounts.length > 0) {
//   //           const avgCloud =
//   //             cloudAmounts.reduce((sum, val) => sum + val, 0) /
//   //             cloudAmounts.length;
//   //           newMeasurements[13] = avgCloud.toFixed(2);
//   //         }

//   //         // Total Duration of Rain (60-63) - sum of time differences between time-start and time-end
//   //         const totalRainDuration = todayWeatherObservations.reduce(
//   //           (total: number, item: any) => {
//   //             if (item.rainfall["time-start"] && item.rainfall["time-end"]) {
//   //               const [startH, startM] = item.rainfall["time-start"]
//   //                 .split(".")
//   //                 .map(Number);
//   //               const [endH, endM] = item.rainfall["time-end"]
//   //                 .split(".")
//   //                 .map(Number);

//   //               const startMinutes = startH * 60 + startM;
//   //               const endMinutes = endH * 60 + endM;

//   //               return total + (endMinutes - startMinutes);
//   //             }
//   //             return total;
//   //           },
//   //           0
//   //         );

//   //         if (totalRainDuration > 0) {
//   //           const hours = Math.floor(totalRainDuration / 60);
//   //           const minutes = totalRainDuration % 60;
//   //           newMeasurements[15] = `${hours}-${minutes.toString().padStart(2, "0")}`;
//   //         }
//   //       }

//   //       setFieldValue("measurements", newMeasurements);
//   //     } catch (error) {
//   //       console.error("Error fetching data:", error);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   };

//   //   fetchData();
//   // }, [selectedDate, setFieldValue]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const filteredDate = selectedDate;

//         // Fetch first card data
//         const firstCardResponse = await fetch("/api/first-card-data");
//         const firstCardData = await firstCardResponse.json();
//         const todayFirstCardData = firstCardData.entries.filter((item: any) => {
//           const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
//           return itemDate === filteredDate;
//         });

//         // Fetch weather observations data
//         const observationsResponse = await fetch("/api/save-observation");
//         const weatherObservations = await observationsResponse.json();

//         // Filter observations using submittedAt instead of observation-time
//         const todayWeatherObservations = weatherObservations.filter(
//           (item: any) => {
//             // Use submittedAt if available, otherwise fall back to observation-time
//             const dateField =
//               item.metadata?.submittedAt || item.observer?.["observation-time"];
//             if (!dateField) return false;

//             const itemDate = new Date(dateField).toISOString().split("T")[0];
//             return itemDate === filteredDate;
//           }
//         );

//         console.log("First Card Data:", todayFirstCardData);
//         console.log("Weather Observations:", todayWeatherObservations); // Changed to log filtered data

//         const newMeasurements = Array(16).fill(""); // always reset first

//         // Process first card data measurements
//         if (todayFirstCardData.length > 0) {
//           measurements.forEach((measurement) => {
//             if (measurement.dataKey) {
//               const values = todayFirstCardData
//                 .map((item: any) =>
//                   Number.parseFloat(item[measurement.dataKey])
//                 )
//                 .filter((val) => !isNaN(val));

//               if (values.length > 0) {
//                 let result;
//                 if (measurement.id === 4) {
//                   // Max temperature
//                   result = Math.max(...values);
//                 } else if (measurement.id === 5) {
//                   // Min temperature
//                   result = Math.min(...values);
//                 } else if (measurement.id === 14) {
//                   // Lowest visibility
//                   result = Math.min(...values);
//                 } else {
//                   // Average for other measurements
//                   result =
//                     values.reduce((sum, val) => sum + val, 0) / values.length;
//                 }

//                 newMeasurements[measurement.id] = result.toFixed(2);
//               }
//             }
//           });
//         }

//         // Process weather observations data
//         if (todayWeatherObservations.length > 0) {
//           // Total Precipitation (36-39) - sum of last-24-hours
//           const totalPrecip = todayWeatherObservations.reduce(
//             (sum: number, item: any) => {
//               const val = Number.parseFloat(item.rainfall["last-24-hours"]);
//               return isNaN(val) ? sum : sum + val;
//             },
//             0
//           );
//           if (totalPrecip > 0) {
//             newMeasurements[6] = totalPrecip.toFixed(2);
//           }

//           // Av. Wind Speed (46-48) - average of wind.speed
//           const windSpeeds = todayWeatherObservations
//             .map((item: any) => Number.parseFloat(item.wind.speed))
//             .filter((val) => !isNaN(val));
//           if (windSpeeds.length > 0) {
//             const avgWindSpeed =
//               windSpeeds.reduce((sum, val) => sum + val, 0) / windSpeeds.length;
//             newMeasurements[9] = avgWindSpeed.toFixed(2);
//           }

//           // Prevailing Wind Direction (49-50) - most common direction
//           const directions = todayWeatherObservations.map(
//             (item: any) => item.wind["wind-direction"]
//           );
//           if (directions.length > 0) {
//             const directionCounts = directions.reduce(
//               (acc: Record<string, number>, dir: string) => {
//                 acc[dir] = (acc[dir] || 0) + 1;
//                 return acc;
//               },
//               {}
//             );
//             const prevailingDir = Object.entries(directionCounts).reduce(
//               (a, b) => (a[1] > b[1] ? a : b)
//             )[0];
//             newMeasurements[10] = prevailingDir;
//           }

//           // Max Wind Speed (51-53) and Direction (54-55)
//           const windData = todayWeatherObservations
//             .map((item: any) => ({
//               speed: Number.parseFloat(item.wind.speed),
//               direction: item.wind["wind-direction"],
//             }))
//             .filter((item) => !isNaN(item.speed));

//           if (windData.length > 0) {
//             const maxWind = windData.reduce((max, item) =>
//               item.speed > max.speed ? item : max
//             );
//             newMeasurements[11] = maxWind.speed.toFixed(2);
//             newMeasurements[12] = maxWind.direction;
//           }

//           // Av. Total Cloud (56) - average of total-cloud-amount
//           const cloudAmounts = todayWeatherObservations
//             .map((item: any) =>
//               Number.parseFloat(item.totalCloud["total-cloud-amount"])
//             )
//             .filter((val) => !isNaN(val));
//           if (cloudAmounts.length > 0) {
//             const avgCloud =
//               cloudAmounts.reduce((sum, val) => sum + val, 0) /
//               cloudAmounts.length;
//             newMeasurements[13] = avgCloud.toFixed(2);
//           }

//           // Total Duration of Rain (60-63) - sum of time differences between time-start and time-end
//           const totalRainDuration = todayWeatherObservations.reduce(
//             (total: number, item: any) => {
//               if (item.rainfall["time-start"] && item.rainfall["time-end"]) {
//                 const [startH, startM] = item.rainfall["time-start"]
//                   .split(".")
//                   .map(Number);
//                 const [endH, endM] = item.rainfall["time-end"]
//                   .split(".")
//                   .map(Number);

//                 const startMinutes = startH * 60 + startM;
//                 const endMinutes = endH * 60 + endM;

//                 return total + (endMinutes - startMinutes);
//               }
//               return total;
//             },
//             0
//           );

//           if (totalRainDuration > 0) {
//             const hours = Math.floor(totalRainDuration / 60);
//             const minutes = totalRainDuration % 60;
//             newMeasurements[15] = `${hours}-${minutes.toString().padStart(2, "0")}`;
//           }
//         }

//         setFieldValue("measurements", newMeasurements);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedDate, setFieldValue]);
//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between">
//         <h2 className="text-lg font-semibold text-green-700 flex items-center">
//           <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-2">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="18"
//               height="18"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M8 3v3a2 2 0 0 1-2 2H3" />
//               <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
//               <path d="M3 16h3a2 2 0 0 1 2 2v3" />
//               <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
//             </svg>
//           </span>
//           Weather Measurements
//         </h2>

//         <div>
//           <input
//             type="date"
//             id="observationTime"
//             name="observationTime"
//             required
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="block w-full rounded-md border border-gray-300 px-5 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//             disabled={isLoading}
//           />
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <Card className="border-green-200 bg-white shadow-sm">
//             <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
//               <CardTitle className="text-sm font-medium text-green-700">
//                 Measurements 1-8
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-4">
//               <div className="space-y-3">
//                 {measurements.slice(0, 8).map((item) => (
//                   <div
//                     key={item.id}
//                     className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
//                   >
//                     <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
//                       {item.id + 1}
//                     </div>
//                     <div className="col-span-7">
//                       <Label
//                         htmlFor={`measurement-${item.id}`}
//                         className="text-sm font-medium"
//                       >
//                         {item.label} ({item.range})
//                       </Label>
//                     </div>

//                     <div className="col-span-3">
//                       <Input
//                         id={`measurement-${item.id}`}
//                         value={values.measurements?.[item.id] || ""}
//                         className="border-green-200 focus:border-green-500"
//                         readOnly
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border-green-200 bg-white shadow-sm">
//             <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
//               <CardTitle className="text-sm font-medium text-green-700">
//                 Measurements 9-16
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-4">
//               <div className="space-y-3">
//                 {measurements.slice(8).map((item) => (
//                   <div
//                     key={item.id}
//                     className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
//                   >
//                     <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
//                       {item.id + 1}
//                     </div>
//                     <div className="col-span-7">
//                       <Label
//                         htmlFor={`measurement-${item.id}`}
//                         className="text-sm font-medium"
//                       >
//                         {item.label} ({item.range})
//                       </Label>
//                     </div>

//                     <div className="col-span-3">
//                       <Input
//                         id={`measurement-${item.id}`}
//                         value={values.measurements?.[item.id] || ""}
//                         className="border-green-200 focus:border-green-500"
//                         readOnly
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { useFormikContext } from "formik";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// // Color mapping for different measurement categories
// const categoryColors = {
//   pressure: "bg-blue-100 text-blue-800",
//   temperature: "bg-red-100 text-red-800",
//   precipitation: "bg-cyan-100 text-cyan-800",
//   humidity: "bg-purple-100 text-purple-800",
//   wind: "bg-green-100 text-green-800",
//   cloud: "bg-gray-100 text-gray-800",
//   visibility: "bg-yellow-100 text-yellow-800",
// };

// export default function MeasurementsTab() {
//   const { values, setFieldValue } = useFormikContext<{
//     measurements: string[];
//   }>();

//   const measurements = [
//     {
//       id: 0,
//       label: "Av. Station Pressure",
//       range: "14-18",
//       dataKey: "stationLevelPressure",
//       category: "pressure",
//       unit: "hPa",
//     },
//     {
//       id: 1,
//       label: "Av. Sea-Level Pressure",
//       range: "19-23",
//       dataKey: "correctedSeaLevelPressure",
//       category: "pressure",
//       unit: "hPa",
//     },
//     {
//       id: 2,
//       label: "Av. Dry-Bulb Temperature",
//       range: "24-26",
//       dataKey: "dryBulbAsRead",
//       category: "temperature",
//       unit: "°C",
//     },
//     {
//       id: 3,
//       label: "Av. Wet Bulb Temperature",
//       range: "27-28",
//       dataKey: "wetBulbAsRead",
//       category: "temperature",
//       unit: "°C",
//     },
//     {
//       id: 4,
//       label: "Max. Temperature",
//       range: "30-32",
//       dataKey: "maxMinTempAsRead",
//       category: "temperature",
//       unit: "°C",
//     },
//     {
//       id: 5,
//       label: "Min Temperature",
//       range: "33-35",
//       dataKey: "maxMinTempAsRead",
//       category: "temperature",
//       unit: "°C",
//     },
//     {
//       id: 6,
//       label: "Total Precipitation",
//       range: "36-39",
//       category: "precipitation",
//       unit: "mm",
//     },
//     {
//       id: 7,
//       label: "Av. Dew Point Temperature",
//       range: "40-42",
//       dataKey: "Td",
//       category: "temperature",
//       unit: "°C",
//     },
//     {
//       id: 8,
//       label: "Av. Rel Humidity",
//       range: "43-45",
//       dataKey: "relativeHumidity",
//       category: "humidity",
//       unit: "%",
//     },
//     {
//       id: 9,
//       label: "Av. Wind Speed",
//       range: "46-48",
//       category: "wind",
//       unit: "m/s",
//     },
//     {
//       id: 10,
//       label: "Prevailing Wind Direction",
//       range: "49-50",
//       category: "wind",
//       unit: "16Pts",
//     },
//     {
//       id: 11,
//       label: "Max Wind Speed",
//       range: "51-53",
//       category: "wind",
//       unit: "m/s",
//     },
//     {
//       id: 12,
//       label: "Direction of Max Wind",
//       range: "54-55",
//       category: "wind",
//       unit: "16Pts",
//     },
//     {
//       id: 13,
//       label: "Av. Total Cloud",
//       range: "56",
//       category: "cloud",
//       unit: "oktas",
//     },
//     {
//       id: 14,
//       label: "Lowest visibility",
//       range: "57-59",
//       dataKey: "horizontalVisibility",
//       category: "visibility",
//       unit: "km",
//     },
//     {
//       id: 15,
//       label: "Total Duration of Rain",
//       range: "60-63",
//       category: "precipitation",
//       unit: "H-M",
//     },
//   ];

//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );
//   const [isLoading, setIsLoading] = useState(false);
//   const [tableData, setTableData] = useState<any[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const filteredDate = selectedDate;

//         // Fetch first card data
//         const firstCardResponse = await fetch("/api/first-card-data");
//         const firstCardData = await firstCardResponse.json();
//         const todayFirstCardData = firstCardData.entries.filter((item: any) => {
//           const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
//           return itemDate === filteredDate;
//         });

//         // Fetch weather observations data
//         const observationsResponse = await fetch("/api/save-observation");
//         const weatherObservations = await observationsResponse.json();
//         const todayWeatherObservations = weatherObservations.filter(
//           (item: any) => {
//             const dateField =
//               item.metadata?.submittedAt || item.observer?.["observation-time"];
//             if (!dateField) return false;
//             const itemDate = new Date(dateField).toISOString().split("T")[0];
//             return itemDate === filteredDate;
//           }
//         );

//         const newMeasurements = Array(16).fill("");

//         // Process first card data measurements
//         if (todayFirstCardData.length > 0) {
//           measurements.forEach((measurement) => {
//             if (measurement.dataKey) {
//               const values = todayFirstCardData
//                 .map((item: any) => Number.parseFloat(item[measurement.dataKey]))
//                 .filter((val) => !isNaN(val));

//               if (values.length > 0) {
//                 let result;
//                 if (measurement.id === 4) {
//                   result = Math.max(...values);
//                 } else if (measurement.id === 5) {
//                   result = Math.min(...values);
//                 } else if (measurement.id === 14) {
//                   result = Math.min(...values);
//                 } else {
//                   result = values.reduce((sum, val) => sum + val, 0) / values.length;
//                 }
//                 newMeasurements[measurement.id] = result.toFixed(2);
//               }
//             }
//           });
//         }

//         // Process weather observations data
//         if (todayWeatherObservations.length > 0) {
//           // Total Precipitation
//           const totalPrecip = todayWeatherObservations.reduce(
//             (sum: number, item: any) => {
//               const val = Number.parseFloat(item.rainfall["last-24-hours"]);
//               return isNaN(val) ? sum : sum + val;
//             },
//             0
//           );
//           if (totalPrecip > 0) {
//             newMeasurements[6] = totalPrecip.toFixed(2);
//           }

//           // Wind calculations
//           const windSpeeds = todayWeatherObservations
//             .map((item: any) => Number.parseFloat(item.wind.speed))
//             .filter((val) => !isNaN(val));
//           if (windSpeeds.length > 0) {
//             const avgWindSpeed =
//               windSpeeds.reduce((sum, val) => sum + val, 0) / windSpeeds.length;
//             newMeasurements[9] = avgWindSpeed.toFixed(2);
//           }

//           const directions = todayWeatherObservations.map(
//             (item: any) => item.wind["wind-direction"]
//           );
//           if (directions.length > 0) {
//             const directionCounts = directions.reduce(
//               (acc: Record<string, number>, dir: string) => {
//                 acc[dir] = (acc[dir] || 0) + 1;
//                 return acc;
//               },
//               {}
//             );
//             const prevailingDir = Object.entries(directionCounts).reduce(
//               (a, b) => (a[1] > b[1] ? a : b)
//             )[0];
//             newMeasurements[10] = prevailingDir;
//           }

//           const windData = todayWeatherObservations
//             .map((item: any) => ({
//               speed: Number.parseFloat(item.wind.speed),
//               direction: item.wind["wind-direction"],
//             }))
//             .filter((item) => !isNaN(item.speed));

//           if (windData.length > 0) {
//             const maxWind = windData.reduce((max, item) =>
//               item.speed > max.speed ? item : max
//             );
//             newMeasurements[11] = maxWind.speed.toFixed(2);
//             newMeasurements[12] = maxWind.direction;
//           }

//           // Cloud calculations
//           const cloudAmounts = todayWeatherObservations
//             .map((item: any) =>
//               Number.parseFloat(item.totalCloud["total-cloud-amount"])
//             )
//             .filter((val) => !isNaN(val));
//           if (cloudAmounts.length > 0) {
//             const avgCloud =
//               cloudAmounts.reduce((sum, val) => sum + val, 0) / cloudAmounts.length;
//             newMeasurements[13] = avgCloud.toFixed(2);
//           }

//           // Rain duration calculation
//           const totalRainDuration = todayWeatherObservations.reduce(
//             (total: number, item: any) => {
//               if (item.rainfall["time-start"] && item.rainfall["time-end"]) {
//                 const [startH, startM] = item.rainfall["time-start"]
//                   .split(".")
//                   .map(Number);
//                 const [endH, endM] = item.rainfall["time-end"]
//                   .split(".")
//                   .map(Number);

//                 const startMinutes = startH * 60 + startM;
//                 const endMinutes = endH * 60 + endM;

//                 return total + (endMinutes - startMinutes);
//               }
//               return total;
//             },
//             0
//           );

//           if (totalRainDuration > 0) {
//             const hours = Math.floor(totalRainDuration / 60);
//             const minutes = totalRainDuration % 60;
//             newMeasurements[15] = `${hours}-${minutes.toString().padStart(2, "0")}`;
//           }
//         }

//         setFieldValue("measurements", newMeasurements);

//         // Prepare table data with measurements and their metadata
//         const formattedData = measurements.map((measurement) => ({
//           ...measurement,
//           value: newMeasurements[measurement.id] || "-",
//         }));
//         setTableData(formattedData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedDate, setFieldValue]);

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-green-700 flex items-center">
//           <span className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-3">
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M8 3v3a2 2 0 0 1-2 2H3" />
//               <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
//               <path d="M3 16h3a2 2 0 0 1 2 2v3" />
//               <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
//             </svg>
//           </span>
//           Weather Measurements Summary
//         </h2>

//         <div className="w-64">
//           <label htmlFor="observation-date" className="block text-sm font-medium text-gray-700 mb-1">
//             Observation Date
//           </label>
//           <input
//             type="date"
//             id="observation-date"
//             value={selectedDate}
//             onChange={(e) => setSelectedDate(e.target.value)}
//             className="block w-full rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
//             disabled={isLoading}
//           />
//         </div>
//       </div>

//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//         </div>
//       ) : (
//         <Card className="border-0 shadow-lg">
//           <CardHeader className="bg-green-600 rounded-t-lg">
//             <CardTitle className="text-white text-xl">
//               Meteorological Data for {new Date(selectedDate).toLocaleDateString()}
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       #
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Measurement
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Range
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Value
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Unit
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {tableData.map((item) => (
//                     <tr key={item.id} className="hover:bg-gray-50 transition-colors">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {item.id + 1}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${categoryColors[item.category as keyof typeof categoryColors]}`}>
//                           {item.label}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {item.range}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
//                         {item.value}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {item.unit}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarIcon, LineChart, AlertCircle, Loader2 } from "lucide-react";
import BasicInfoTab from "@/components/basic-info-tab";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

const categoryColors = {
  pressure: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: <LineChart className="h-4 w-4" />,
  },
  temperature: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: <LineChart className="h-4 w-4" />,
  },
  precipitation: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    icon: <LineChart className="h-4 w-4" />,
  },
  humidity: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: <LineChart className="h-4 w-4" />,
  },
  wind: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: <LineChart className="h-4 w-4" />,
  },
  cloud: {
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: <LineChart className="h-4 w-4" />,
  },
  visibility: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    icon: <LineChart className="h-4 w-4" />,
  },
};

export default function MeasurementsTab() {
  const { values, setFieldValue } = useFormikContext<{
    measurements: string[];
  }>();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filteredDate = selectedDate;

        const firstCardResponse = await fetch("/api/first-card-data");
        const firstCardData = await firstCardResponse.json();
        const todayFirstCardData = firstCardData.entries.filter((item: any) => {
          const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
          return itemDate === filteredDate;
        });

        const observationsResponse = await fetch("/api/save-observation");
        const weatherObservations = await observationsResponse.json();
        const todayWeatherObservations = weatherObservations.filter(
          (item: any) => {
            const dateField =
              item.metadata?.submittedAt || item.observer?.["observation-time"];
            if (!dateField) return false;
            const itemDate = new Date(dateField).toISOString().split("T")[0];
            return itemDate === filteredDate;
          }
        );

        const measurements = Array(16).fill("-");

        const processFirstCard = (
          key: string,
          id: number,
          reducer: (arr: number[]) => number
        ) => {
          const values = todayFirstCardData
            .map((item: any) => parseFloat(item[key]))
            .filter((val: number) => !isNaN(val));
          if (values.length > 0) measurements[id] = reducer(values).toFixed(2);
        };

        processFirstCard(
          "stationLevelPressure",
          0,
          (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
        );
        processFirstCard(
          "correctedSeaLevelPressure",
          1,
          (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
        );
        processFirstCard(
          "dryBulbAsRead",
          2,
          (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
        );
        processFirstCard(
          "wetBulbAsRead",
          3,
          (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
        );
        processFirstCard("maxMinTempAsRead", 4, (arr) => Math.max(...arr));
        processFirstCard("maxMinTempAsRead", 5, (arr) => Math.min(...arr));
        processFirstCard(
          "Td",
          7,
          (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
        );
        processFirstCard(
          "relativeHumidity",
          8,
          (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
        );
        processFirstCard("horizontalVisibility", 14, (arr) => Math.min(...arr));

        const totalPrecip = todayWeatherObservations.reduce(
          (sum: number, item: any) => {
            const val = parseFloat(item.rainfall["last-24-hours"]);
            return isNaN(val) ? sum : sum + val;
          },
          0
        );
        if (totalPrecip > 0) measurements[6] = totalPrecip.toFixed(2);

        const windSpeeds = todayWeatherObservations
          .map((item: any) => parseFloat(item.wind.speed))
          .filter((val) => !isNaN(val));
        if (windSpeeds.length > 0) {
          measurements[9] = (
            windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
          ).toFixed(2);
        }

        const directions = todayWeatherObservations.map(
          (item: any) => item.wind["wind-direction"]
        );
        if (directions.length > 0) {
          const dirCount = directions.reduce(
            (acc: Record<string, number>, dir: string) => {
              acc[dir] = (acc[dir] || 0) + 1;
              return acc;
            },
            {}
          );
          measurements[10] = Object.entries(dirCount).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];
        }

        const windData = todayWeatherObservations
          .map((item: any) => ({
            speed: parseFloat(item.wind.speed),
            direction: item.wind["wind-direction"],
          }))
          .filter((item) => !isNaN(item.speed));
        if (windData.length > 0) {
          const maxWind = windData.reduce((max, item) =>
            item.speed > max.speed ? item : max
          );
          measurements[11] = maxWind.speed.toFixed(2);
          measurements[12] = maxWind.direction;
        }

        const cloudAmounts = todayWeatherObservations
          .map((item: any) => parseFloat(item.totalCloud["total-cloud-amount"]))
          .filter((val) => !isNaN(val));
        if (cloudAmounts.length > 0) {
          measurements[13] = (
            cloudAmounts.reduce((a, b) => a + b, 0) / cloudAmounts.length
          ).toFixed(2);
        }

        const totalRainDuration = todayWeatherObservations.reduce(
          (total: number, item: any) => {
            if (item.rainfall["time-start"] && item.rainfall["time-end"]) {
              const [sh, sm] = item.rainfall["time-start"]
                .split(".")
                .map(Number);
              const [eh, em] = item.rainfall["time-end"].split(".").map(Number);
              return total + (eh * 60 + em - (sh * 60 + sm));
            }
            return total;
          },
          0
        );
        if (totalRainDuration > 0) {
          const hours = Math.floor(totalRainDuration / 60);
          const minutes = totalRainDuration % 60;
          measurements[15] = `${hours}-${minutes.toString().padStart(2, "0")}`;
        }

        setFieldValue("measurements", measurements);

        const meta = [
          "Av. Station Pressure",
          "Av. Sea-Level Pressure",
          "Av. Dry-Bulb Temperature",
          "Av. Wet Bulb Temperature",
          "Max. Temperature",
          "Min Temperature",
          "Total Precipitation",
          "Av. Dew Point Temperature",
          "Av. Rel Humidity",
          "Av. Wind Speed",
          "Prevailing Wind Direction",
          "Max Wind Speed",
          "Direction of Max Wind",
          "Av. Total Cloud",
          "Lowest visibility",
          "Total Duration of Rain",
        ];

        const ranges = [
          "14-18",
          "19-23",
          "24-26",
          "27-28",
          "30-32",
          "33-35",
          "36-39",
          "40-42",
          "43-45",
          "46-48",
          "49-50",
          "51-53",
          "54-55",
          "56",
          "57-59",
          "60-63",
        ];

        const units = [
          "hPa",
          "hPa",
          "°C",
          "°C",
          "°C",
          "°C",
          "mm",
          "°C",
          "%",
          "m/s",
          "16Pts",
          "m/s",
          "16Pts",
          "oktas",
          "km",
          "H-M",
        ];

        const categories = [
          "pressure",
          "pressure",
          "temperature",
          "temperature",
          "temperature",
          "temperature",
          "precipitation",
          "temperature",
          "humidity",
          "wind",
          "wind",
          "wind",
          "wind",
          "cloud",
          "visibility",
          "precipitation",
        ];

        const formatted = measurements.map((val, i) => ({
          id: i,
          label: meta[i],
          range: ranges[i],
          unit: units[i],
          category: categories[i],
          value: val,
        }));

        setTableData(formatted);
      } catch (e) {
        console.error(e);
        setError("Failed to load weather data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, setFieldValue]);

  // Group data by category for summary cards
  const groupedData = tableData.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSaveMeasurements = async () => {
    try {
      const payload = {
        userId: session?.user.id, // Replace with actual user ID
        dataType: "SY", // Replace or dynamically set from BasicInfoTab if needed
        stationNo: session?.user.stationId, // Replace with selected station
        year: new Date(selectedDate).getFullYear().toString(),
        month: (new Date(selectedDate).getMonth() + 1).toString(),
        day: new Date(selectedDate).getDate().toString(),
        measurements: tableData.map((item) => item.value),
        windDirection: tableData[10]?.value || "",
      };

      const res = await fetch("/api/daily-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to save");
      }

      toast.success("✅ Measurements saved successfully!");
    } catch (error) {
      console.error("❌ Save error:", error);
      toast.error("Failed to save measurements");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
            <LineChart size={20} />
          </span>
          Weather Measurements Summary
        </h2>

        <div className="relative">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              id="observation-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-0 p-0 text-sm focus:outline-none focus:ring-0"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(selectedDate)}
          </p>
        </div>
      </div>
      <BasicInfoTab />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading weather measurements...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Category summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.keys(groupedData).map((category) => {
              const categoryData = groupedData[category];
              const style = categoryColors[category];

              // Find a representative value for the category
              const displayItem =
                categoryData.find((item) => item.value !== "-") ||
                categoryData[0];

              return (
                <Card
                  key={category}
                  className={`overflow-hidden border ${style.border} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div
                    className={`${style.bg} px-4 py-3 flex justify-between items-center`}
                  >
                    <h3 className={`font-medium capitalize ${style.text}`}>
                      {category}
                    </h3>
                    <span className={`${style.text}`}>{style.icon}</span>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <p className="text-sm text-gray-500">
                        {displayItem.label}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-semibold">
                          {displayItem.value}
                        </span>
                        <span className="text-xs text-gray-500">
                          {displayItem.unit}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      Range: {displayItem.range}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detailed measurements table */}
          <Card className="shadow-sm border border-gray-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
              <CardTitle className="text-white text-base font-medium flex items-center justify-between">
                <span>Detailed Weather Measurements</span>
                <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                  {formatDate(selectedDate)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase font-bold tracking-wider">
                      <th className="px-6 py-3 text-left font-medium">#</th>
                      <th className="px-6 py-3 text-left font-medium">
                        Measurement
                      </th>
                      <th className="px-6 py-3 text-left font-medium">Range</th>
                      <th className="px-6 py-3 text-left font-medium">Value</th>
                      <th className="px-6 py-3 text-left font-medium">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tableData.map((item) => {
                      const style = categoryColors[item.category];

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
                            {item.id + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium ${style.bg} ${style.text}`}
                              >
                                {style.icon}
                                {item.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {item.range}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
                            {item.value !== "-" ? (
                              <span className="bg-gray-100 px-2 py-1 rounded">
                                {item.value}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {item.unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="flex justify-end">
        <Button
          className="bg-blue-600 text-white mt-2 px-4 py-2"
          onClick={handleSaveMeasurements}
        >
          Submit Data
        </Button>
      </div>
    </div>
  );
}
