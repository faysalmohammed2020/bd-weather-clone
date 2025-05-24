// "use client";

// import { useEffect, useState } from "react";
// import { useFormikContext } from "formik";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { CalendarIcon, LineChart, AlertCircle, Loader2 } from "lucide-react";
// import BasicInfoTab from "@/components/basic-info-tab";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { useSession } from "@/lib/auth-client";

// const categoryColors = {
//   pressure: {
//     bg: "bg-blue-50",
//     text: "text-blue-700",
//     border: "border-blue-200",
//     icon: <LineChart className="h-4 w-4" />,
//   },
//   temperature: {
//     bg: "bg-amber-50",
//     text: "text-amber-700",
//     border: "border-amber-200",
//     icon: <LineChart className="h-4 w-4" />,
//   },
//   precipitation: {
//     bg: "bg-cyan-50",
//     text: "text-cyan-700",
//     border: "border-cyan-200",
//     icon: <LineChart className="h-4 w-4" />,
//   },
//   humidity: {
//     bg: "bg-indigo-50",
//     text: "text-indigo-700",
//     border: "border-indigo-200",
//     icon: <LineChart className="h-4 w-4" />,
//   },
//   wind: {
//     bg: "bg-emerald-50",
//     text: "text-emerald-700",
//     border: "border-emerald-200",
//     icon: <LineChart className="h-4 w-4" />,
//   },
//   cloud: {
//     bg: "bg-slate-50",
//     text: "text-slate-700",
//     border: "border-slate-200",
//     icon: <LineChart className="h-4 w-4" />,
//   },
//   visibility: {
//     bg: "bg-yellow-50",
//     text: "text-yellow-700",
//     border: "border-yellow-200",
//     icon: <LineChart className="h-4 w-4" />,
//   },
// };

// export default function DailySummery() {
//   const { values, setFieldValue } = useFormikContext<{
//     measurements: string[];
//   }>();

//   const [selectedDate, setSelectedDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );
//   const [isLoading, setIsLoading] = useState(false);
//   const [tableData, setTableData] = useState<any[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const { data: session } = useSession();

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const firstCardResponse = await fetch("/api/first-card-data");
//         const formatedFirstCardData = await firstCardResponse.json();
//         const todayFirstCardData = await formatedFirstCardData.entries
//           .map((item: any) => item.MeteorologicalEntry)
//           .flat();

//         const observationsResponse = await fetch("/api/second-card-data");
//         const formatedObservationsData = await observationsResponse.json();

//         const todayWeatherObservations = formatedObservationsData
//           .map((item: any) => item.WeatherObservation)
//           .flat();

//         const measurements = Array(16).fill("-");

//         const processFirstCard = (
//           key: string,
//           id: number,
//           reducer: (arr: number[]) => number
//         ) => {
//           const values = todayFirstCardData
//             .map((item: any) => Number.parseFloat(item[key]))
//             .filter((val: number) => !isNaN(val));
//           if (values.length > 0)
//             measurements[id] = Math.round(reducer(values)).toString();
//         };

//         processFirstCard(
//           "stationLevelPressure",
//           0,
//           (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
//         );
//         processFirstCard(
//           "correctedSeaLevelPressure",
//           1,
//           (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
//         );
//         processFirstCard(
//           "dryBulbAsRead",
//           2,
//           (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
//         );
//         processFirstCard(
//           "wetBulbAsRead",
//           3,
//           (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
//         );
//         processFirstCard("maxMinTempAsRead", 4, (arr) => Math.max(...arr));
//         processFirstCard("maxMinTempAsRead", 5, (arr) => Math.min(...arr));
//         processFirstCard(
//           "Td",
//           7,
//           (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
//         );
//         processFirstCard(
//           "relativeHumidity",
//           8,
//           (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
//         );
//         // processFirstCard("horizontalVisibility", 14, (arr) => Math.min(...arr))
//         processFirstCard(
//           "horizontalVisibility",
//           14,
//           (arr) => Math.min(...arr)
//         );

//         const totalPrecip = todayWeatherObservations.reduce(
//           (sum: number, item: any) => {
//             const val = Number.parseFloat(item.rainfallLast24Hours);
//             return isNaN(val) ? sum : sum + val;
//           },
//           0
//         );
//         if (totalPrecip > 0)
//           measurements[6] = Math.round(totalPrecip).toString();

//         const windSpeeds = todayWeatherObservations
//           .map((item: any) => Number.parseFloat(item.windSpeed))
//           .filter((val) => !isNaN(val));
//         if (windSpeeds.length > 0) {
//           measurements[9] = Math.round(
//             windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length
//           ).toString();
//         }

//         const directions = todayWeatherObservations.map(
//           (item: any) => item.windDirection
//         );
//         if (directions.length > 0) {
//           const dirCount = directions.reduce(
//             (acc: Record<string, number>, dir: string) => {
//               acc[dir] = (acc[dir] || 0) + 1;
//               return acc;
//             },
//             {}
//           );
//           measurements[10] = Object.entries(dirCount).reduce((a, b) =>
//             a[1] > b[1] ? a : b
//           )[0];
//         }

//         const windData = todayWeatherObservations
//           .map((item: any) => ({
//             speed: Number.parseFloat(item.windSpeed),
//             direction: item.windDirection,
//           }))
//           .filter((item) => !isNaN(item.speed));
//         if (windData.length > 0) {
//           const maxWind = windData.reduce((max, item) =>
//             item.speed > max.speed ? item : max
//           );
//           measurements[11] = Math.round(maxWind.speed).toString();
//           measurements[12] = maxWind.direction;
//         }

//         const cloudAmounts = todayWeatherObservations
//           .map((item: any) => Number.parseFloat(item.totalCloudAmount))
//           .filter((val) => !isNaN(val));
//         if (cloudAmounts.length > 0) {
//           measurements[13] = Math.round(
//             cloudAmounts.reduce((a, b) => a + b, 0) / cloudAmounts.length
//           ).toString();
//         }

//         const totalRainDuration = todayWeatherObservations.reduce(
//           (total: number, item: any) => {
//             if (item.rainfallLast24Hours) {
//               const [sh, sm] = item.rainfallLast24Hours.split(".").map(Number);
//               const [eh, em] = item.rainfallLast24Hours.split(".").map(Number);
//               return total + (eh * 60 + em - (sh * 60 + sm));
//             }
//             return total;
//           },
//           0
//         );
//         if (totalRainDuration > 0) {
//           const hours = Math.floor(totalRainDuration / 60);
//           const minutes = totalRainDuration % 60;
//           measurements[15] = `${hours}-${minutes.toString().padStart(2, "0")}`;
//         }

//         setFieldValue("measurements", measurements);

//         const meta = [
//           "Av. Station Pressure",
//           "Av. Sea-Level Pressure",
//           "Av. Dry-Bulb Temperature",
//           "Av. Wet Bulb Temperature",
//           "Max. Temperature",
//           "Min Temperature",
//           "Total Precipitation",
//           "Av. Dew Point Temperature",
//           "Av. Rel Humidity",
//           "Av. Wind Speed",
//           "Prevailing Wind Direction",
//           "Max Wind Speed",
//           "Direction of Max Wind",
//           "Av. Total Cloud",
//           "Lowest visibility",
//           "Total Duration of Rain",
//         ];

//         const ranges = [
//           "14-18",
//           "19-23",
//           "24-26",
//           "27-28",
//           "30-32",
//           "33-35",
//           "36-39",
//           "40-42",
//           "43-45",
//           "46-48",
//           "49-50",
//           "51-53",
//           "54-55",
//           "56",
//           "57-59",
//           "60-63",
//         ];

//         const units = [
//           "hPa",
//           "hPa",
//           "°C",
//           "°C",
//           "°C",
//           "°C",
//           "mm",
//           "°C",
//           "%",
//           "m/s",
//           "16Pts",
//           "m/s",
//           "16Pts",
//           "oktas",
//           "km",
//           "H-M",
//         ];

//         const categories = [
//           "pressure",
//           "pressure",
//           "temperature",
//           "temperature",
//           "temperature",
//           "temperature",
//           "precipitation",
//           "temperature",
//           "humidity",
//           "wind",
//           "wind",
//           "wind",
//           "wind",
//           "cloud",
//           "visibility",
//           "precipitation",
//         ];

//         const formatted = measurements.map((val, i) => ({
//           id: i,
//           label: meta[i],
//           range: ranges[i],
//           unit: units[i],
//           category: categories[i],
//           value: val,
//         }));

//         setTableData(formatted);
//       } catch (e) {
//         console.error(e);
//         setError("Failed to load weather data. Please try again later.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedDate, setFieldValue]);

//   // Group data by category for summary cards
//   const groupedData = tableData.reduce((acc, item) => {
//     if (!acc[item.category]) {
//       acc[item.category] = [];
//     }
//     acc[item.category].push(item);
//     return acc;
//   }, {});

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const handleSaveMeasurements = async () => {
//     try {
//       const payload = {
//         userId: session?.user.id,
//         dataType: "SY",
//         stationNo: session?.user.station?.stationId,
//         year: new Date(selectedDate).getFullYear().toString(),
//         month: (new Date(selectedDate).getMonth() + 1).toString(),
//         day: new Date(selectedDate).getDate().toString(),
//         measurements: tableData.map((item) => item.value),
//         windDirection: tableData[10]?.value || "",
//       };

//       const res = await fetch("/api/daily-summary", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await res.json();

//       if (!result.success) {
//         return toast.error(result.error);
//       }

//       if (!res.ok) {
//         return toast.error(result.error);
//       }

//       if (result.success) {
//         toast.success(result.message);
//       }
//     } catch (error) {
//       console.error("❌ Save error:", error);
//       toast.error("Failed to save measurements");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-100">
//         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//           <span className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm">
//             <LineChart size={20} />
//           </span>
//           Weather Measurements Summary
//         </h2>

//         <div className="relative">
//           <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400">
//             <CalendarIcon className="h-4 w-4 text-gray-400" />
//             <input
//               type="date"
//               id="observation-date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="border-0 p-0 text-sm focus:outline-none focus:ring-0"
//               disabled={isLoading}
//             />
//           </div>
//           <p className="text-xs text-gray-500 mt-1">
//             {formatDate(selectedDate)}
//           </p>
//         </div>
//       </div>
//       <BasicInfoTab />

//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
//           <AlertCircle className="h-5 w-5" />
//           <p>{error}</p>
//         </div>
//       )}

//       {isLoading ? (
//         <div className="flex flex-col justify-center items-center py-20">
//           <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
//           <p className="text-gray-500">Loading weather measurements...</p>
//         </div>
//       ) : (
//         <div className="space-y-8">
//           {/* Category summary cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//             {Object.keys(groupedData).map((category) => {
//               const categoryData = groupedData[category];
//               const style = categoryColors[category];

//               // Find a representative value for the category
//               const displayItem =
//                 categoryData.find((item) => item.value !== "-") ||
//                 categoryData[0];

//               return (
//                 <Card
//                   key={category}
//                   className={`overflow-hidden border ${style.border} shadow-sm hover:shadow-md transition-shadow`}
//                 >
//                   <div
//                     className={`${style.bg} px-4 py-3 flex justify-between items-center`}
//                   >
//                     <h3 className={`font-medium capitalize ${style.text}`}>
//                       {category}
//                       {" " + "(" + displayItem.unit + ")"}
//                     </h3>
//                     <span className={`${style.text}`}>{style.icon}</span>
//                   </div>
//                   <CardContent className="p-4 space-y-2">
//                     <div className="flex justify-between items-baseline">
//                       <p className="text-sm text-gray-500">
//                         {displayItem.label}
//                       </p>
//                       <div className="flex items-baseline gap-1">
//                         <span className="text-lg font-semibold">
//                           {displayItem.value}
//                         </span>
//                         {/* <span className="text-xs text-gray-500">{displayItem.unit}</span> */}
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-400">
//                       Range: {displayItem.range}
//                     </p>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>

//           {/* Detailed measurements table */}
//           <Card className="shadow-sm border border-gray-200 overflow-hidden">
//             <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
//               <CardTitle className="text-white text-base font-medium flex items-center justify-between">
//                 <span>Detailed Weather Measurements</span>
//                 <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
//                   {formatDate(selectedDate)}
//                 </span>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="p-0">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-gray-50 text-gray-600 uppercase font-bold tracking-wider">
//                       <th className="px-6 py-3 text-left font-medium">#</th>
//                       <th className="px-6 py-3 text-left font-medium">
//                         Measurement
//                       </th>
//                       <th className="px-6 py-3 text-left font-medium">Range</th>
//                       <th className="px-6 py-3 text-left font-medium">Value</th>
//                       <th className="px-6 py-3 text-left font-medium">Unit</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {tableData.map((item) => {
//                       const style = categoryColors[item.category];

//                       return (
//                         <tr
//                           key={item.id}
//                           className="hover:bg-gray-50 transition-colors"
//                         >
//                           <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-700">
//                             {item.id + 1}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center gap-2">
//                               <span
//                                 className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium ${style.bg} ${style.text}`}
//                               >
//                                 {style.icon}
//                                 {item.label}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-gray-600">
//                             {item.range}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">
//                             {item.value !== "-" ? (
//                               <span className="bg-gray-100 px-2 py-1 rounded">
//                                 {item.value}
//                               </span>
//                             ) : (
//                               <span className="text-gray-400">-</span>
//                             )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-gray-500">
//                             {item.unit}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//       <div className="flex justify-end">
//         <Button
//           className="bg-blue-600 text-white mt-2 px-4 py-2"
//           onClick={handleSaveMeasurements}
//         >
//           Submit Data
//         </Button>
//       </div>
//     </div>
//   );
// }



"use client"

import { useFormikContext } from "formik"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useSession } from "@/lib/auth-client"
import { CalendarIcon, LineChart, AlertCircle, Loader2 } from "lucide-react"

// Daily Summary Form Values Interface
interface DailySummaryFormValues {
  measurements: string[]
  dataType: string
  stationNo: string
  year: string
  month: string
  day: string
}

// Measurements configuration for daily summary
const measurements = [
  { id: 0, label: "Av. Station Pressure", range: "14-18", unit: "hPa", category: "pressure" },
  { id: 1, label: "Av. Sea-Level Pressure", range: "19-23", unit: "hPa", category: "pressure" },
  { id: 2, label: "Av. Dry-Bulb Temperature", range: "24-26", unit: "°C", category: "temperature" },
  { id: 3, label: "Av. Wet Bulb Temperature", range: "27-28", unit: "°C", category: "temperature" },
  { id: 4, label: "Max. Temperature", range: "30-32", unit: "°C", category: "temperature" },
  { id: 5, label: "Min Temperature", range: "33-35", unit: "°C", category: "temperature" },
  { id: 6, label: "Total Precipitation", range: "36-39", unit: "mm", category: "precipitation" },
  { id: 7, label: "Av. Dew Point Temperature", range: "40-42", unit: "°C", category: "temperature" },
  { id: 8, label: "Av. Rel Humidity", range: "43-45", unit: "%", category: "humidity" },
  { id: 9, label: "Av. Wind Speed", range: "46-48", unit: "m/s", category: "wind" },
  { id: 10, label: "Prevailing Wind Direction", range: "49-50", unit: "16Pts", category: "wind" },
  { id: 11, label: "Max Wind Speed", range: "51-53", unit: "m/s", category: "wind" },
  { id: 12, label: "Direction of Max Wind", range: "54-55", unit: "16Pts", category: "wind" },
  { id: 13, label: "Av. Total Cloud", range: "56", unit: "oktas", category: "cloud" },
  { id: 14, label: "Lowest visibility", range: "57-59", unit: "km", category: "visibility" },
  { id: 15, label: "Total Duration of Rain", range: "60-63", unit: "H-M", category: "precipitation" },
]

const categoryColors = {
  pressure: "bg-blue-50 text-blue-700",
  temperature: "bg-amber-50 text-amber-700",
  precipitation: "bg-cyan-50 text-cyan-700",
  humidity: "bg-indigo-50 text-indigo-700",
  wind: "bg-emerald-50 text-emerald-700",
  cloud: "bg-slate-50 text-slate-700",
  visibility: "bg-yellow-50 text-yellow-700",
}

export function DailySummaryForm() {
  const { values, setFieldValue } = useFormikContext<DailySummaryFormValues>()
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [dataStatus, setDataStatus] = useState<{
    hasToday: boolean
    message: string
    isLoading: boolean
    error?: string
  }>({
    hasToday: true,
    message: "",
    isLoading: true,
  })

  useEffect(() => {
    const fetchDailySummaryData = async () => {
      try {
        setDataStatus((prev) => ({
          ...prev,
          isLoading: true,
          error: undefined,
        }))

        // Fetch meteorological data
        const firstCardResponse = await fetch("/api/first-card-data")
        const formatedFirstCardData = await firstCardResponse.json()
        const todayFirstCardData = await formatedFirstCardData.entries.flatMap((item: any) => item.MeteorologicalEntry)

        // Fetch weather observations
        const observationsResponse = await fetch("/api/second-card-data")
        const formatedObservationsData = await observationsResponse.json()
        const todayWeatherObservations = formatedObservationsData.flatMap((item: any) => item.WeatherObservation)

        const calculatedMeasurements = Array(16).fill("")

        // Helper function to process meteorological data
        const processFirstCard = (key: string, id: number, reducer: (arr: number[]) => number) => {
          const values = todayFirstCardData
            .map((item: any) => Number.parseFloat(item[key]))
            .filter((val: number) => !isNaN(val))
          if (values.length > 0) calculatedMeasurements[id] = Math.round(reducer(values)).toString()
        }

        // Calculate pressure measurements
        processFirstCard("stationLevelPressure", 0, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)
        processFirstCard("correctedSeaLevelPressure", 1, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)

        // Calculate temperature measurements
        processFirstCard("dryBulbAsRead", 2, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)
        processFirstCard("wetBulbAsRead", 3, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)
        processFirstCard("maxMinTempAsRead", 4, (arr) => Math.max(...arr))
        processFirstCard("maxMinTempAsRead", 5, (arr) => Math.min(...arr))
        processFirstCard("Td", 7, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)

        // Calculate humidity
        processFirstCard("relativeHumidity", 8, (arr) => arr.reduce((a, b) => a + b, 0) / arr.length)

        // Calculate visibility
        processFirstCard("horizontalVisibility", 14, (arr) => Math.min(...arr))

        // Calculate precipitation
        const totalPrecip = todayWeatherObservations.reduce((sum: number, item: any) => {
          const val = Number.parseFloat(item.rainfallLast24Hours)
          return isNaN(val) ? sum : sum + val
        }, 0)
        if (totalPrecip > 0) calculatedMeasurements[6] = Math.round(totalPrecip).toString()

        // Calculate wind measurements
        const windSpeeds = todayWeatherObservations
          .map((item: any) => Number.parseFloat(item.windSpeed))
          .filter((val) => !isNaN(val))
        if (windSpeeds.length > 0) {
          calculatedMeasurements[9] = Math.round(windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length).toString()
        }

        // Calculate prevailing wind direction
        const directions = todayWeatherObservations.map((item: any) => item.windDirection)
        if (directions.length > 0) {
          const dirCount = directions.reduce((acc: Record<string, number>, dir: string) => {
            acc[dir] = (acc[dir] || 0) + 1
            return acc
          }, {})
          calculatedMeasurements[10] = Object.entries(dirCount).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
        }

        // Calculate max wind speed and direction
        const windData = todayWeatherObservations
          .map((item: any) => ({
            speed: Number.parseFloat(item.windSpeed),
            direction: item.windDirection,
          }))
          .filter((item) => !isNaN(item.speed))
        if (windData.length > 0) {
          const maxWind = windData.reduce((max, item) => (item.speed > max.speed ? item : max))
          calculatedMeasurements[11] = Math.round(maxWind.speed).toString()
          calculatedMeasurements[12] = maxWind.direction
        }

        // Calculate cloud amount
        const cloudAmounts = todayWeatherObservations
          .map((item: any) => Number.parseFloat(item.totalCloudAmount))
          .filter((val) => !isNaN(val))
        if (cloudAmounts.length > 0) {
          calculatedMeasurements[13] = Math.round(
            cloudAmounts.reduce((a, b) => a + b, 0) / cloudAmounts.length,
          ).toString()
        }

        // Calculate rain duration
        const totalRainDuration = todayWeatherObservations.reduce((total: number, item: any) => {
          if (item.rainfallLast24Hours) {
            const [sh, sm] = item.rainfallLast24Hours.split(".").map(Number)
            const [eh, em] = item.rainfallLast24Hours.split(".").map(Number)
            return total + (eh * 60 + em - (sh * 60 + sm))
          }
          return total
        }, 0)
        if (totalRainDuration > 0) {
          const hours = Math.floor(totalRainDuration / 60)
          const minutes = totalRainDuration % 60
          calculatedMeasurements[15] = `${hours}-${minutes.toString().padStart(2, "0")}`
        }

        // Check if today's date matches the selected date
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
          today.getDate(),
        ).padStart(2, "0")}`
        const isToday = todayStr === selectedDate

        setDataStatus({
          hasToday: isToday,
          message: isToday ? "Using today's weather data" : "No data available for today, using most recent data",
          isLoading: false,
        })

        // Update form fields
        setFieldValue("measurements", calculatedMeasurements)
        setFieldValue("stationNo", session?.user?.station?.stationId || "41953")
        setFieldValue("dataType", "SY")
        setFieldValue("year", new Date(selectedDate).getFullYear().toString())
        setFieldValue("month", (new Date(selectedDate).getMonth() + 1).toString().padStart(2, "0"))
        setFieldValue("day", new Date(selectedDate).getDate().toString().padStart(2, "0"))
      } catch (error) {
        console.error("Error fetching daily summary data:", error)
        setDataStatus({
          hasToday: false,
          message: "Error loading weather data",
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })

        // Set default values on error
        const now = new Date(selectedDate)
        setFieldValue("measurements", Array(16).fill(""))
        setFieldValue("stationNo", session?.user?.station?.stationId || "41953")
        setFieldValue("dataType", "SY")
        setFieldValue("year", now.getFullYear().toString())
        setFieldValue("month", String(now.getMonth() + 1).padStart(2, "0"))
        setFieldValue("day", String(now.getDate()).padStart(2, "0"))
      }
    }

    fetchDailySummaryData()
  }, [selectedDate, setFieldValue, session])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (dataStatus.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Loading daily summary data...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        dataType: values.dataType || "SY",
        measurements: values.measurements,
        windDirection: values.measurements[10] || "",
      }

      const response = await fetch("/api/daily-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!result.success) {
        return toast.error(result.error)
      }

      if (!response.ok) {
        return toast.error(result.error)
      }

      if (result.success) {
        toast.success(result.message)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("❌ Something went wrong")
    }
  }

  const handleMeasurementChange = (index: number, value: string) => {
    const newMeasurements = [...values.measurements]
    newMeasurements[index] = value
    setFieldValue("measurements", newMeasurements)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-blue-700 flex items-center">
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-2">
            <LineChart size={18} />
          </span>
          Daily Summary Measurements
        </h2>
      </div>

      {/* Status Messages */}
      {dataStatus.error ? (
        <div className="p-3 rounded-md bg-red-100 text-red-800 text-sm">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            Error: {dataStatus.error}
          </div>
        </div>
      ) : (
        dataStatus.message && (
          <div
            className={`p-3 rounded-md text-sm ${dataStatus.hasToday ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
              }`}
          >
            <div className="flex items-center">
              {dataStatus.hasToday ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
                <AlertCircle className="mr-2 h-4 w-4" />
              )}
              {dataStatus.message}
            </div>
          </div>
        )
      )}

      {/* Measurement Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-blue-50">
            <CardTitle className="text-sm font-medium text-blue-700">Measurements 1-8</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
                      {item.label}
                    </Label>
                    <div className={`text-xs px-1 py-0.5 rounded mt-1 ${categoryColors[item.category]}`}>
                      {item.unit}
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div>
                  <div className="col-span-4">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      onChange={(e) => handleMeasurementChange(item.id, e.target.value)}
                      className="border-blue-200 bg-white cursor-text"
                      placeholder="--"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-blue-50">
            <CardTitle className="text-sm font-medium text-blue-700">Measurements 9-16</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(8).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-5">
                    <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
                      {item.label}
                    </Label>
                    <div className={`text-xs px-1 py-0.5 rounded mt-1 ${categoryColors[item.category]}`}>
                      {item.unit}
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div>
                  <div className="col-span-4">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      onChange={(e) => handleMeasurementChange(item.id, e.target.value)}
                      className="border-blue-200 bg-white cursor-text"
                      placeholder="--"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Information */}
            <div className="mt-4">
              <Card className="border border-blue-100 shadow-sm rounded-xl">
                <CardHeader className="pb-2 pt-4 px-4 bg-blue-100 rounded-t-xl">
                  <CardTitle className="text-sm font-semibold text-blue-800">Summary Information</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">

                    {values.measurements.filter((m) => m && m !== "").length} / 16

                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md shadow-sm text-lg"
          onClick={handleSubmit}
        >
          Submit Daily Summary
        </Button>
      </div>
    </div>
  )
}
