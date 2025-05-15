// "use client";

// import { useEffect, useState } from "react";
// import { useFormikContext } from "formik";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import firstCardData from "@/data/first-card-data.json";
// import weatherObservations from "@/data/weather-observations.json";

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
//     { id: 5, label: "Min Temperature", range: "33-35" },
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

//   useEffect(() => {
//     const filteredDate = selectedDate;

//     // Process first card data
//     const todayFirstCardData = firstCardData.filter((item) => {
//       const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
//       return itemDate === filteredDate;
//     });

//     // Process weather observations data
//     const todayWeatherObservations = weatherObservations.filter((item) => {
//       const itemDate = new Date(item.observer["observation-time"])
//         .toISOString()
//         .split("T")[0];
//       return itemDate === filteredDate;
//     });

//     const newMeasurements = Array(16).fill(""); // always reset first

//     // Process first card data measurements
//     if (todayFirstCardData.length > 0) {
//       measurements.forEach((measurement) => {
//         if (measurement.dataKey) {
//           const values = todayFirstCardData
//             .map((item) => Number.parseFloat(item[measurement.dataKey]))
//             .filter((val) => !isNaN(val));

//           if (values.length > 0) {
//             const result =
//               measurement.id === 4
//                 ? Math.max(...values)
//                 : measurement.id === 14
//                 ? Math.min(...values)
//                 : values.reduce((sum, val) => sum + val, 0) / values.length;

//             newMeasurements[measurement.id] = result.toFixed(2);
//           }
//         }
//       });
//     }

//     // Process weather observations data
//     if (todayWeatherObservations.length > 0) {
//       // Total Precipitation (36-39) - sum of last-24-hours
//       const totalPrecip = todayWeatherObservations.reduce((sum, item) => {
//         const val = Number.parseFloat(item.rainfall["last-24-hours"]);
//         return isNaN(val) ? sum : sum + val;
//       }, 0);
//       if (totalPrecip > 0) {
//         newMeasurements[6] = totalPrecip.toFixed(2);
//       }

//       // Av. Wind Speed (46-48) - average of wind.speed
//       const windSpeeds = todayWeatherObservations
//         .map((item) => Number.parseFloat(item.wind.speed))
//         .filter((val) => !isNaN(val));
//       if (windSpeeds.length > 0) {
//         const avgWindSpeed =
//           windSpeeds.reduce((sum, val) => sum + val, 0) / windSpeeds.length;
//         newMeasurements[9] = avgWindSpeed.toFixed(2);
//       }

//       // Prevailing Wind Direction (49-50) - most common direction
//       const directions = todayWeatherObservations.map(
//         (item) => item.wind["wind-direction"]
//       );
//       if (directions.length > 0) {
//         const directionCounts = directions.reduce((acc, dir) => {
//           acc[dir] = (acc[dir] || 0) + 1;
//           return acc;
//         }, {});
//         const prevailingDir = Object.entries(directionCounts).reduce((a, b) =>
//           a[1] > b[1] ? a : b
//         )[0];
//         newMeasurements[10] = prevailingDir;
//       }

//       // Max Wind Speed (51-53) and Direction (54-55)
//       const windData = todayWeatherObservations
//         .map((item) => ({
//           speed: Number.parseFloat(item.wind.speed),
//           direction: item.wind["wind-direction"],
//         }))
//         .filter((item) => !isNaN(item.speed));

//       if (windData.length > 0) {
//         const maxWind = windData.reduce((max, item) =>
//           item.speed > max.speed ? item : max
//         );
//         newMeasurements[11] = maxWind.speed.toFixed(2);
//         newMeasurements[12] = maxWind.direction;
//       }

//       // Av. Total Cloud (56) - average of total-cloud-amount
//       const cloudAmounts = todayWeatherObservations
//         .map((item) => Number.parseFloat(item.totalCloud["total-cloud-amount"]))
//         .filter((val) => !isNaN(val));
//       if (cloudAmounts.length > 0) {
//         const avgCloud =
//           cloudAmounts.reduce((sum, val) => sum + val, 0) / cloudAmounts.length;
//         newMeasurements[13] = avgCloud.toFixed(2);
//       }

//       // Total Duration of Rain (60-63) - sum of time differences between time-start and time-end
//       const totalRainDuration = todayWeatherObservations.reduce(
//         (total, item) => {
//           if (item.rainfall["time-start"] && item.rainfall["time-end"]) {
//             const [startH, startM] = item.rainfall["time-start"]
//               .split(".")
//               .map(Number);
//             const [endH, endM] = item.rainfall["time-end"]
//               .split(".")
//               .map(Number);

//             const startMinutes = startH * 60 + startM;
//             const endMinutes = endH * 60 + endM;

//             return total + (endMinutes - startMinutes);
//           }
//           return total;
//         },
//         0
//       );

//       if (totalRainDuration > 0) {
//         const hours = Math.floor(totalRainDuration / 60);
//         const minutes = totalRainDuration % 60;
//         newMeasurements[15] = `${hours}-${minutes.toString().padStart(2, "0")}`;
//       }
//     }

//     setFieldValue("measurements", newMeasurements);
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
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card className="border-green-200 bg-white shadow-sm">
//           <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
//             <CardTitle className="text-sm font-medium text-green-700">
//               Measurements 1-8
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-4">
//             <div className="space-y-3">
//               {measurements.slice(0, 8).map((item) => (
//                 <div
//                   key={item.id}
//                   className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
//                 >
//                   <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
//                     {item.id + 1}
//                   </div>
//                   <div className="col-span-7">
//                     <Label
//                       htmlFor={`measurement-${item.id}`}
//                       className="text-sm font-medium"
//                     >
//                       {item.label} ({item.range})
//                     </Label>
//                   </div>

//                   <div className="col-span-3">
//                     <Input
//                       id={`measurement-${item.id}`}
//                       value={values.measurements?.[item.id] || ""}
//                       className="border-green-200 focus:border-green-500"
//                       readOnly
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border-green-200 bg-white shadow-sm">
//           <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
//             <CardTitle className="text-sm font-medium text-green-700">
//               Measurements 9-16
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="p-4">
//             <div className="space-y-3">
//               {measurements.slice(8).map((item) => (
//                 <div
//                   key={item.id}
//                   className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
//                 >
//                   <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
//                     {item.id + 1}
//                   </div>
//                   <div className="col-span-7">
//                     <Label
//                       htmlFor={`measurement-${item.id}`}
//                       className="text-sm font-medium"
//                     >
//                       {item.label} ({item.range})
//                     </Label>
//                   </div>

//                   <div className="col-span-3">
//                     <Input
//                       id={`measurement-${item.id}`}
//                       value={values.measurements?.[item.id] || ""}
//                       className="border-green-200 focus:border-green-500"
//                       readOnly
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

















"use client";

import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MeasurementsTab() {
  const { values, setFieldValue } = useFormikContext<{
    measurements: string[];
  }>();

  const measurements = [
    {
      id: 0,
      label: "Av. Station Pressure",
      range: "14-18",
      dataKey: "stationLevelPressure",
    },
    {
      id: 1,
      label: "Av. Sea-Level Pressure",
      range: "19-23",
      dataKey: "correctedSeaLevelPressure",
    },
    {
      id: 2,
      label: "Av. Dry-Bulb Temperature",
      range: "24-26",
      dataKey: "dryBulbAsRead",
    },
    {
      id: 3,
      label: "Av. Wet Bulb Temperature",
      range: "27-28",
      dataKey: "wetBulbAsRead",
    },
    {
      id: 4,
      label: "Max. Temperature",
      range: "30-32",
      dataKey: "maxMinTempAsRead",
    },
    { id: 5, label: "Min Temperature", range: "33-35", dataKey: "maxMinTempAsRead" },
    { id: 6, label: "Total Precipitation", range: "36-39" },
    {
      id: 7,
      label: "Av. Dew. Point Temperature",
      range: "40-42",
      dataKey: "Td",
    },
    {
      id: 8,
      label: "Av. Rel Humidity",
      range: "43-45",
      dataKey: "relativeHumidity",
    },
    { id: 9, label: "Av. Wind Speed", range: "46-48" },
    { id: 10, label: "Prevailing Wind Direction (16Pts)", range: "49-50" },
    { id: 11, label: "Max Wind Speed", range: "51-53" },
    { id: 12, label: "Direction of Max Wind (16Pts)", range: "54-55" },
    { id: 13, label: "Av. Total Cloud", range: "56" },
    {
      id: 14,
      label: "Lowest visibility",
      range: "57-59",
      dataKey: "horizontalVisibility",
    },
    { id: 15, label: "Total Duration of Rain (H-M)", range: "60-63" },
  ];

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const filteredDate = selectedDate;

        // Fetch first card data
        const firstCardResponse = await fetch('/api/first-card-data');
        const firstCardData = await firstCardResponse.json();
        const todayFirstCardData = firstCardData.entries.filter((item: any) => {
          const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
          return itemDate === filteredDate;
        });

        // Fetch weather observations data
        const observationsResponse = await fetch('/api/save-observation');
        const weatherObservations = await observationsResponse.json();
        const todayWeatherObservations = weatherObservations.filter((item: any) => {
          const itemDate = new Date(item.observer["observation-time"])
            .toISOString()
            .split("T")[0];
          return itemDate === filteredDate;
        });

        const newMeasurements = Array(16).fill(""); // always reset first

        // Process first card data measurements
        if (todayFirstCardData.length > 0) {
          measurements.forEach((measurement) => {
            if (measurement.dataKey) {
              const values = todayFirstCardData
                .map((item: any) => Number.parseFloat(item[measurement.dataKey]))
                .filter((val) => !isNaN(val));

              if (values.length > 0) {
                let result;
                if (measurement.id === 4) {
                  // Max temperature
                  result = Math.max(...values);
                } else if (measurement.id === 5) {
                  // Min temperature
                  result = Math.min(...values);
                } else if (measurement.id === 14) {
                  // Lowest visibility
                  result = Math.min(...values);
                } else {
                  // Average for other measurements
                  result = values.reduce((sum, val) => sum + val, 0) / values.length;
                }

                newMeasurements[measurement.id] = result.toFixed(2);
              }
            }
          });
        }

        // Process weather observations data
        if (todayWeatherObservations.length > 0) {
          // Total Precipitation (36-39) - sum of last-24-hours
          const totalPrecip = todayWeatherObservations.reduce((sum: number, item: any) => {
            const val = Number.parseFloat(item.rainfall["last-24-hours"]);
            return isNaN(val) ? sum : sum + val;
          }, 0);
          if (totalPrecip > 0) {
            newMeasurements[6] = totalPrecip.toFixed(2);
          }

          // Av. Wind Speed (46-48) - average of wind.speed
          const windSpeeds = todayWeatherObservations
            .map((item: any) => Number.parseFloat(item.wind.speed))
            .filter((val) => !isNaN(val));
          if (windSpeeds.length > 0) {
            const avgWindSpeed =
              windSpeeds.reduce((sum, val) => sum + val, 0) / windSpeeds.length;
            newMeasurements[9] = avgWindSpeed.toFixed(2);
          }

          // Prevailing Wind Direction (49-50) - most common direction
          const directions = todayWeatherObservations.map(
            (item: any) => item.wind["wind-direction"]
          );
          if (directions.length > 0) {
            const directionCounts = directions.reduce((acc: Record<string, number>, dir: string) => {
              acc[dir] = (acc[dir] || 0) + 1;
              return acc;
            }, {});
            const prevailingDir = Object.entries(directionCounts).reduce((a, b) =>
              a[1] > b[1] ? a : b
            )[0];
            newMeasurements[10] = prevailingDir;
          }

          // Max Wind Speed (51-53) and Direction (54-55)
          const windData = todayWeatherObservations
            .map((item: any) => ({
              speed: Number.parseFloat(item.wind.speed),
              direction: item.wind["wind-direction"],
            }))
            .filter((item) => !isNaN(item.speed));

          if (windData.length > 0) {
            const maxWind = windData.reduce((max, item) =>
              item.speed > max.speed ? item : max
            );
            newMeasurements[11] = maxWind.speed.toFixed(2);
            newMeasurements[12] = maxWind.direction;
          }

          // Av. Total Cloud (56) - average of total-cloud-amount
          const cloudAmounts = todayWeatherObservations
            .map((item: any) => Number.parseFloat(item.totalCloud["total-cloud-amount"]))
            .filter((val) => !isNaN(val));
          if (cloudAmounts.length > 0) {
            const avgCloud =
              cloudAmounts.reduce((sum, val) => sum + val, 0) / cloudAmounts.length;
            newMeasurements[13] = avgCloud.toFixed(2);
          }

          // Total Duration of Rain (60-63) - sum of time differences between time-start and time-end
          const totalRainDuration = todayWeatherObservations.reduce(
            (total: number, item: any) => {
              if (item.rainfall["time-start"] && item.rainfall["time-end"]) {
                const [startH, startM] = item.rainfall["time-start"]
                  .split(".")
                  .map(Number);
                const [endH, endM] = item.rainfall["time-end"]
                  .split(".")
                  .map(Number);

                const startMinutes = startH * 60 + startM;
                const endMinutes = endH * 60 + endM;

                return total + (endMinutes - startMinutes);
              }
              return total;
            },
            0
          );

          if (totalRainDuration > 0) {
            const hours = Math.floor(totalRainDuration / 60);
            const minutes = totalRainDuration % 60;
            newMeasurements[15] = `${hours}-${minutes.toString().padStart(2, "0")}`;
          }
        }

        setFieldValue("measurements", newMeasurements);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, setFieldValue]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold text-green-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3" />
              <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
              <path d="M3 16h3a2 2 0 0 1 2 2v3" />
              <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
            </svg>
          </span>
          Weather Measurements
        </h2>

        <div>
          <input
            type="date"
            id="observationTime"
            name="observationTime"
            required
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-5 py-2 text-sm shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
            disabled={isLoading}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-green-200 bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
              <CardTitle className="text-sm font-medium text-green-700">
                Measurements 1-8
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {measurements.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
                  >
                    <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
                      {item.id + 1}
                    </div>
                    <div className="col-span-7">
                      <Label
                        htmlFor={`measurement-${item.id}`}
                        className="text-sm font-medium"
                      >
                        {item.label} ({item.range})
                      </Label>
                    </div>

                    <div className="col-span-3">
                      <Input
                        id={`measurement-${item.id}`}
                        value={values.measurements?.[item.id] || ""}
                        className="border-green-200 focus:border-green-500"
                        readOnly
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
              <CardTitle className="text-sm font-medium text-green-700">
                Measurements 9-16
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {measurements.slice(8).map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-green-50 transition-colors"
                  >
                    <div className="col-span-1 text-sm font-medium text-green-700 bg-green-100 rounded-full w-6 h-6 flex items-center justify-center">
                      {item.id + 1}
                    </div>
                    <div className="col-span-7">
                      <Label
                        htmlFor={`measurement-${item.id}`}
                        className="text-sm font-medium"
                      >
                        {item.label} ({item.range})
                      </Label>
                    </div>

                    <div className="col-span-3">
                      <Input
                        id={`measurement-${item.id}`}
                        value={values.measurements?.[item.id] || ""}
                        className="border-green-200 focus:border-green-500"
                        readOnly
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}