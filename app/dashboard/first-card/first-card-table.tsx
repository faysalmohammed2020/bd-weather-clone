// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";
// import { format } from "date-fns";
// import type { FirstCardData } from "@/data/first-card-data";

// interface FirstCardTableProps {
//   refreshTrigger?: number;
// }

// export function FirstCardTable({ refreshTrigger = 0 }: FirstCardTableProps) {
//   const [data, setData] = useState<FirstCardData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(
//     format(new Date(), "yyyy-MM-dd")
//   );
//   const [stationFilter, setStationFilter] = useState("all");
//   const [stationNames, setStationNames] = useState<string[]>([]);

//   // Fetch data from API
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/first-card-data");
//       if (!response.ok) {
//         throw new Error("Failed to fetch data");
//       }
//       const result = await response.json();
//       setData(result);

//       // Extract unique station names
//       const names = new Set<string>();
//       result.forEach((item: FirstCardData) => {
//         if (item.stationName) {
//           names.add(item.stationName);
//         }
//       });
//       setStationNames(Array.from(names));
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data on component mount and when refreshTrigger changes
//   useEffect(() => {
//     fetchData();
//   }, [refreshTrigger]);

//   // Filter data based on selected date and station
//   const filteredData = data.filter((item) => {
//     if (!item.timestamp) return false;

//     const itemDate = format(new Date(item.timestamp), "yyyy-MM-dd");
//     const matchesDate = itemDate === selectedDate;
//     const matchesStation =
//       stationFilter === "all" || item.stationName === stationFilter;

//     return matchesDate && matchesStation;
//   });

//   // Navigate to previous day
//   const goToPreviousDay = () => {
//     const currentDate = new Date(selectedDate);
//     const previousDay = new Date(currentDate);
//     previousDay.setDate(currentDate.getDate() - 1);
//     setSelectedDate(format(previousDay, "yyyy-MM-dd"));
//   };

//   // Navigate to next day
//   const goToNextDay = () => {
//     const currentDate = new Date(selectedDate);
//     const nextDay = new Date(currentDate);
//     nextDay.setDate(currentDate.getDate() + 1);
//     setSelectedDate(format(nextDay, "yyyy-MM-dd"));
//   };

//   // Format data type for display
//   const formatDataType = (dataType?: { "0": string; "1": string }) => {
//     if (!dataType) return "--";
//     return `${dataType["0"] || "-"}${dataType["1"] || "-"}`;
//   };

//   // Format station number for display
//   const formatStationNo = (stationNo?: { [key: string]: string }) => {
//     if (!stationNo) return "-----";
//     let result = "";
//     for (let i = 0; i < 5; i++) {
//       result += stationNo[i.toString()] || "-";
//     }
//     return result;
//   };

//   // Format year for display
//   const formatYear = (year?: { "0": string; "1": string }) => {
//     if (!year) return "--";
//     return `${year["0"] || "-"}${year["1"] || "-"}`;
//   };

//   // Export to CSV
//   const exportToCSV = () => {
//     // Create CSV content
//     const headers = [
//       "Time",
//       "Station",
//       "Bar As Read",
//       "Corrected For Index",
//       "Height Difference",
//       "Station Level Pressure",
//       "Sea Level Reduction",
//       "Sea Level Pressure",
//       "Dry Bulb As Read",
//       "Wet Bulb As Read",
//       "Max/Min Temp As Read",
//       "Dry Bulb Corrected",
//       "Wet Bulb Corrected",
//       "Dew Point",
//       "Relative Humidity",
//       "Horizontal Visibility",
//       "Present Weather",
//     ];

//     const csvRows = [
//       headers.join(","),
//       ...filteredData.map((item) => {
//         const time = item.observationTime || "N/A";

//         return [
//           time,
//           item.stationName || "N/A",
//           item.barAsRead || "N/A",
//           item.correctedForIndex || "N/A",
//           item.heightDifference || "N/A",
//           item.stationLevelPressure || "N/A",
//           item.seaLevelReduction || "N/A",
//           item.correctedSeaLevelPressure || "N/A",
//           item.dryBulbAsRead || "N/A",
//           item.wetBulbAsRead || "N/A",
//           item.maxMinTempAsRead || "N/A",
//           item.dryBulb || "N/A",
//           item.wetBulb || "N/A",
//           item.Td || "N/A",
//           item.relativeHumidity || "N/A",
//           item.horizontalVisibility || "N/A",
//           item.presentWeatherWW || "N/A",
//         ].join(",");
//       }),
//     ];

//     const csvContent = csvRows.join("\n");

//     // Create and download the CSV file
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", `first-card-data-${selectedDate}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <Card className="shadow-lg border-none">
//       <CardHeader className="p-4 bg-sky-600 text-white">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//           <CardTitle className="text-xl font-bold">
//             First Card's Table
//           </CardTitle>

//           <div className="flex items-center gap-2">
//             <Button
//               onClick={exportToCSV}
//               className="gap-1 bg-green-600 hover:bg-green-700"
//             >
//               <Download size={16} /> Export CSV
//             </Button>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="p-6">
//         {/* Date and Station Filters */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="icon" onClick={goToPreviousDay}>
//               <ChevronLeft className="h-4 w-4" />
//             </Button>

//             <div className="relative">
//               <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="date"
//                 className="pl-8 w-40"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//               />
//             </div>

//             <Button variant="outline" size="icon" onClick={goToNextDay}>
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>

//           <div className="flex items-center gap-2">
//             <Label htmlFor="stationFilter" className="whitespace-nowrap">
//               Station:
//             </Label>
//             <Select value={stationFilter} onValueChange={setStationFilter}>
//               <SelectTrigger className="w-[200px]">
//                 <SelectValue placeholder="All Stations" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Stations</SelectItem>
//                 {stationNames.map((name) => (
//                   <SelectItem key={name} value={name}>
//                     {name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Form View */}
//         <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
//           {/* Header Section */}
//           <div className="p-4 bg-gray-100 border-b border-gray-300">
//             <div className="grid grid-cols-4 gap-4">
//               <div>
//                 <div className="text-xs font-bold uppercase text-gray-600">
//                   DATA TYPE
//                 </div>
//                 <div className="flex mt-1">
//                   <div className="w-8 h-8 border border-gray-400 flex items-center justify-center bg-white font-mono">
//                     {filteredData[0]?.dataType?.["0"] || "-"}
//                   </div>
//                   <div className="w-8 h-8 border-t border-r border-b border-gray-400 flex items-center justify-center bg-white font-mono">
//                     {filteredData[0]?.dataType?.["1"] || "-"}
//                   </div>
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs font-bold uppercase text-gray-600">
//                   STATION NO
//                 </div>
//                 <div className="flex mt-1">
//                   {[0, 1, 2, 3, 4].map((i) => (
//                     <div
//                       key={i}
//                       className="w-8 h-8 border-t border-b border-gray-400 flex items-center justify-center bg-white font-mono"
//                       style={{
//                         borderLeft: i === 0 ? "1px solid #9ca3af" : "none",
//                         borderRight: "1px solid #9ca3af",
//                       }}
//                     >
//                       {filteredData[0]?.stationNo?.[i.toString()] || "-"}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs font-bold uppercase text-gray-600">
//                   STATION NAME
//                 </div>
//                 <div className="mt-1 h-8 border border-gray-400 px-2 flex items-center bg-white font-mono">
//                   {filteredData[0]?.stationName || "-----"}
//                 </div>
//               </div>
//               <div>
//                 <div className="text-xs font-bold uppercase text-gray-600">
//                   YEAR
//                 </div>
//                 <div className="flex mt-1">
//                   <div className="w-8 h-8 border border-gray-400 flex items-center justify-center bg-white font-mono">
//                     {filteredData[0]?.year?.["0"] || "-"}
//                   </div>
//                   <div className="w-8 h-8 border-t border-r border-b border-gray-400 flex items-center justify-center bg-white font-mono">
//                     {filteredData[0]?.year?.["1"] || "-"}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main Table Section */}
//           <div className="p-4">
//             <div className="text-center font-bold text-lg border-b-2 border-gray-800 pb-2 mb-4">
//               FIRST CARD
//             </div>

//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse">
//                 {/* Table Header */}
//                 <thead>
//                   <tr>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       GG
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       CI
//                     </th>
//                     <th
//                       colSpan={9}
//                       className="border border-gray-400 bg-gray-100 text-xs p-1"
//                     >
//                       BAR PRESSURE
//                     </th>
//                     <th
//                       colSpan={6}
//                       className="border border-gray-400 bg-gray-100 text-xs p-1"
//                     >
//                       TEMPERATURE
//                     </th>
//                     <th
//                       colSpan={1}
//                       className="border border-gray-400 bg-gray-100 text-xs p-1"
//                     >
//                       Td Td Td
//                     </th>
//                     <th
//                       colSpan={1}
//                       className="border border-gray-400 bg-gray-100 text-xs p-1"
//                     >
//                       R.H.
//                     </th>
//                     <th
//                       colSpan={3}
//                       className="border border-gray-400 bg-gray-100 text-xs p-1"
//                     >
//                       SQUALL
//                     </th>
//                     <th
//                       colSpan={1}
//                       className="border border-gray-400 bg-gray-100 text-xs p-1"
//                     >
//                       VV
//                     </th>
//                     <th
//                       colSpan={1}
//                       className="border border-gray-400 bg-gray-100 text-xs p-1"
//                     ></th>
//                     <th
//                       colSpan={3}
//                       className="border border-gray-400 bg-gray-100 text-xs p-1"
//                     >
//                       WEATHER
//                     </th>
//                   </tr>
//                   <tr>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Time of Observation (GMT)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         1st Card Indicator
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Attached Thermometer (°C)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Bar As Read (hPa)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Corrected for Index
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Height Difference Correction (hPa)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Station Level Pressure (QFE)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Sea Level Reduction
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Sea Level Pressure (QNH)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Afternoon Reading
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         24-Hour Change
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">Dry Bulb (°C)</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">Wet Bulb (°C)</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">MAX/MIN (°C)</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">Dry Bulb (°C)</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">Wet Bulb (°C)</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">MAX/MIN (°C)</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Dew Point Temperature (°C)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Relative Humidity (%)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">Force (KTS)</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Direction (dq)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">Time (q1)</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Horizontal Visibility (km)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">
//                         Misc. Meteors (Code)
//                       </div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">Past W₁W₂</div>
//                     </th>
//                     <th className="border border-gray-400 bg-gray-100 text-xs p-1">
//                       <div className="writing-vertical h-16">Present ww</div>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {loading ? (
//                     <tr>
//                       <td colSpan={25} className="text-center py-8">
//                         <div className="flex justify-center items-center">
//                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800"></div>
//                           <span className="ml-2">Loading data...</span>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : filteredData.length === 0 ? (
//                     <tr>
//                       <td colSpan={25} className="text-center py-8">
//                         <div className="flex flex-col items-center justify-center text-muted-foreground">
//                           <p>No data found for this date</p>
//                           <p className="text-sm">
//                             Try selecting a different date
//                           </p>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredData.map((record, index) => {
//                       const time = record.observationTime || "--:--";

//                       return (
//                         <tr
//                           key={index}
//                           className="text-center font-mono hover:bg-gray-50"
//                         >
//                           <td className="border border-gray-400 p-1">
//                             {time.split(":")[0] || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.c2Indicator || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.alteredThermometer || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.barAsRead || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.correctedForIndex || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.heightDifference || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.stationLevelPressure || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.seaLevelReduction || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.correctedSeaLevelPressure || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.afternoonReading || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.pressureChange24h || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.dryBulbAsRead || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.wetBulbAsRead || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.maxMinTempAsRead || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.dryBulb || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.wetBulb || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.Td || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.relativeHumidity || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.squallForce || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.squallDirection || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.squallTime || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.horizontalVisibility || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.miscMeteors || "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.pastWeatherW1 && record.pastWeatherW2
//                               ? `${record.pastWeatherW1}/${record.pastWeatherW2}`
//                               : "--"}
//                           </td>
//                           <td className="border border-gray-400 p-1">
//                             {record.presentWeatherWW || "--"}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="mt-4 text-sm text-muted-foreground">
//               <div className="flex justify-between items-center">
//                 <div>
//                   Date:{" "}
//                   <span className="font-medium">
//                     {format(new Date(selectedDate), "MMMM d, yyyy")}
//                   </span>
//                 </div>
//                 <div>
//                   <span>Showing {filteredData.length} record(s)</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }










"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { format } from "date-fns";

interface MeteorologicalEntry {
  id: string;
  userId: string;
  dataType: string;
  stationNo: string;
  stationName: string;
  year: string;
  subIndicator: string;
  alteredThermometer: string;
  barAsRead: string;
  correctedForIndex: string;
  heightDifference: string;
  correctionForTemp: string;
  stationLevelPressure: string;
  seaLevelReduction: string;
  correctedSeaLevelPressure: string;
  afternoonReading: string;
  pressureChange24h: string;
  dryBulbAsRead: string;
  wetBulbAsRead: string;
  maxMinTempAsRead: string;
  dryBulbCorrected: string;
  wetBulbCorrected: string;
  maxMinTempCorrected: string;
  Td: string;
  relativeHumidity: string;
  squallConfirmed: string;
  squallForce: string;
  squallDirection: string;
  squallTime: string;
  horizontalVisibility: string;
  miscMeteors: string;
  pastWeatherW1: string;
  pastWeatherW2: string;
  presentWeatherWW: string;
  c2Indicator: string;
  observationTime: string;
  timestamp: string;
}

interface FirstCardTableProps {
  refreshTrigger?: number;
}

export function FirstCardTable({ refreshTrigger = 0 }: FirstCardTableProps) {
  const [data, setData] = useState<MeteorologicalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [stationFilter, setStationFilter] = useState("all");
  const [stationNames, setStationNames] = useState<string[]>([]);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/first-card-data");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result.entries);

      // Extract unique station names
      const names = new Set<string>();
      result.entries.forEach((item: MeteorologicalEntry) => {
        if (item.stationName) {
          names.add(item.stationName);
        }
      });
      setStationNames(Array.from(names));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Filter data based on selected date and station
  const filteredData = data.filter((item) => {
    if (!item.timestamp) return false;

    const itemDate = format(new Date(item.timestamp), "yyyy-MM-dd");
    const matchesDate = itemDate === selectedDate;
    const matchesStation =
      stationFilter === "all" || item.stationName === stationFilter;

    return matchesDate && matchesStation;
  });

  // Navigate to previous day
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    setSelectedDate(format(previousDay, "yyyy-MM-dd"));
  };

  // Navigate to next day
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setSelectedDate(format(nextDay, "yyyy-MM-dd"));
  };

  // Export to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "Time",
      "Station",
      "Bar As Read",
      "Corrected For Index",
      "Height Difference",
      "Station Level Pressure",
      "Sea Level Reduction",
      "Sea Level Pressure",
      "Dry Bulb As Read",
      "Wet Bulb As Read",
      "Max/Min Temp As Read",
      "Dry Bulb Corrected",
      "Wet Bulb Corrected",
      "Dew Point",
      "Relative Humidity",
      "Horizontal Visibility",
      "Present Weather",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredData.map((item) => {
        const time = item.observationTime || "N/A";

        return [
          time,
          item.stationName || "N/A",
          item.barAsRead || "N/A",
          item.correctedForIndex || "N/A",
          item.heightDifference || "N/A",
          item.stationLevelPressure || "N/A",
          item.seaLevelReduction || "N/A",
          item.correctedSeaLevelPressure || "N/A",
          item.dryBulbAsRead || "N/A",
          item.wetBulbAsRead || "N/A",
          item.maxMinTempAsRead || "N/A",
          item.dryBulbCorrected || "N/A",
          item.wetBulbCorrected || "N/A",
          item.Td || "N/A",
          item.relativeHumidity || "N/A",
          item.horizontalVisibility || "N/A",
          item.presentWeatherWW || "N/A",
        ].join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `meteorological-data-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format data type for display (assuming it's stored as a string like "AB")
  const formatDataType = (dataType?: string) => {
    if (!dataType) return "--";
    return dataType.length >= 2 ? `${dataType[0] || "-"}${dataType[1] || "-"}` : "--";
  };

  // Format station number for display (assuming it's stored as a string like "12345")
  const formatStationNo = (stationNo?: string) => {
    if (!stationNo) return "-----";
    return stationNo.padEnd(5, "-").substring(0, 5);
  };

  // Format year for display (assuming it's stored as a string like "23")
  const formatYear = (year?: string) => {
    if (!year) return "--";
    return year.length >= 2 ? `${year[0] || "-"}${year[1] || "-"}` : "--";
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="p-4 bg-sky-600 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-bold">
            Meteorological Data Table
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              onClick={exportToCSV}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <Download size={16} /> Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Date and Station Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                className="pl-8 w-40"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="stationFilter" className="whitespace-nowrap">
              Station:
            </Label>
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stationNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Form View */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-4 bg-gray-100 border-b border-gray-300">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-xs font-bold uppercase text-gray-600">
                  DATA TYPE
                </div>
                <div className="flex mt-1">
                  <div className="w-8 h-8 border border-gray-400 flex items-center justify-center bg-white font-mono">
                    {data[0]?.dataType?.[0] || "-"}
                  </div>
                  <div className="w-8 h-8 border-t border-r border-b border-gray-400 flex items-center justify-center bg-white font-mono">
                    {data[0]?.dataType?.[1] || "-"}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-gray-600">
                  STATION NO
                </div>
                <div className="flex mt-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 border-t border-b border-gray-400 flex items-center justify-center bg-white font-mono"
                      style={{
                        borderLeft: i === 0 ? "1px solid #9ca3af" : "none",
                        borderRight: "1px solid #9ca3af",
                      }}
                    >
                      {data[0]?.stationNo?.[i] || "-"}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-gray-600">
                  STATION NAME
                </div>
                <div className="mt-1 h-8 border border-gray-400 px-2 flex items-center bg-white font-mono">
                  {data[0]?.stationName || "-----"}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-gray-600">
                  YEAR
                </div>
                <div className="flex mt-1">
                  <div className="w-8 h-8 border border-gray-400 flex items-center justify-center bg-white font-mono">
                    {data[0]?.year?.[0] || "-"}
                  </div>
                  <div className="w-8 h-8 border-t border-r border-b border-gray-400 flex items-center justify-center bg-white font-mono">
                    {data[0]?.year?.[1] || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Section */}
          <div className="p-4">
            <div className="text-center font-bold text-lg border-b-2 border-gray-800 pb-2 mb-4">
              METEOROLOGICAL DATA
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      GG
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      CI
                    </th>
                    <th
                      colSpan={9}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      BAR PRESSURE
                    </th>
                    <th
                      colSpan={6}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      TEMPERATURE
                    </th>
                    <th
                      colSpan={1}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      Td
                    </th>
                    <th
                      colSpan={1}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      R.H.
                    </th>
                    <th
                      colSpan={3}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      SQUALL
                    </th>
                    <th
                      colSpan={1}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      VV
                    </th>
                    <th
                      colSpan={1}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    ></th>
                    <th
                      colSpan={3}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      WEATHER
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Time of Observation (GMT)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Indicator
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Attached Thermometer (°C)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Bar As Read (hPa)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Corrected for Index
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Height Difference Correction (hPa)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Station Level Pressure (QFE)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Sea Level Reduction
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Sea Level Pressure (QNH)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Afternoon Reading
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        24-Hour Change
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">Dry Bulb (°C)</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">Wet Bulb (°C)</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">MAX/MIN (°C)</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">Dry Bulb (°C)</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">Wet Bulb (°C)</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">MAX/MIN (°C)</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Dew Point Temperature (°C)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Relative Humidity (%)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">Force (KTS)</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Direction (dq)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">Time (q1)</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Horizontal Visibility (km)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">
                        Misc. Meteors (Code)
                      </div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">Past W₁W₂</div>
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      <div className="writing-vertical h-16">Present ww</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={25} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800"></div>
                          <span className="ml-2">Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={25} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p>No data found for this date</p>
                          <p className="text-sm">
                            Try selecting a different date
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, index) => {
                      const time = record.observationTime || "--:--";

                      return (
                        <tr
                          key={record.id}
                          className="text-center font-mono hover:bg-gray-50"
                        >
                          <td className="border border-gray-400 p-1">
                            {time.split(":")[0] || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.c2Indicator || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.alteredThermometer || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.barAsRead || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.correctedForIndex || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.heightDifference || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.stationLevelPressure || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.seaLevelReduction || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.correctedSeaLevelPressure || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.afternoonReading || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.pressureChange24h || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.dryBulbAsRead || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.wetBulbAsRead || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.maxMinTempAsRead || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.dryBulbCorrected || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.wetBulbCorrected || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.maxMinTempCorrected || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.Td || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.relativeHumidity || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.squallForce || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.squallDirection || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.squallTime || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.horizontalVisibility || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.miscMeteors || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.pastWeatherW1 && record.pastWeatherW2
                              ? `${record.pastWeatherW1}/${record.pastWeatherW2}`
                              : "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.presentWeatherWW || "--"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex justify-between items-center">
                <div>
                  Date:{" "}
                  <span className="font-medium">
                    {format(new Date(selectedDate), "MMMM d, yyyy")}
                  </span>
                </div>
                <div>
                  <span>Showing {filteredData.length} record(s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}