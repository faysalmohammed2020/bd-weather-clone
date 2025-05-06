// "use client"

// import { useFormikContext } from "formik"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// export default function MeasurementsTab() {
//   const { values, errors, touched, setFieldValue } = useFormikContext<{
//     measurements: string[]
//   }>()

//   const measurements = [
//     { id: 0, label: "Av. Station Pressure", range: "14-18" },
//     { id: 1, label: "Av. Sea-Level Pressure", range: "19-23" },
//     { id: 2, label: "Av. Dry-Bulb Temperature", range: "24-26" },
//     { id: 3, label: "Av. Wet Bulb Temperature", range: "27-28" },
//     { id: 4, label: "Max. Temperature", range: "30-32" },
//     { id: 5, label: "Min Temperature", range: "33-35" },
//     { id: 6, label: "Total Precipitation", range: "36-39" },
//     { id: 7, label: "Av. Dew. Point Temperature", range: "40-42" },
//     { id: 8, label: "Av. Rel Humidity", range: "43-45" },
//     { id: 9, label: "Av. Wind Speed", range: "46-48" },
//     { id: 10, label: "Prevailing Wind Direction (16Pts)", range: "49-50" },
//     { id: 11, label: "Max Wind Speed", range: "51-53" },
//     { id: 12, label: "Direction of Max Wind (16Pts)", range: "54-55" },
//     { id: 13, label: "Av. Total Cloud", range: "56" },
//     { id: 14, label: "Lowest visibility", range: "57-59" },
//     { id: 15, label: "Total Duration of Rain (H-M)", range: "60-63" },
//   ]

//   return (
//     <div className="space-y-6">
//       <h2 className="text-lg font-semibold text-green-700 flex items-center">
//         <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-2">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <path d="M8 3v3a2 2 0 0 1-2 2H3" />
//             <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
//             <path d="M3 16h3a2 2 0 0 1 2 2v3" />
//             <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
//           </svg>
//         </span>
//         Weather Measurements
//       </h2>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card className="border-green-200 bg-white shadow-sm">
//           <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
//             <CardTitle className="text-sm font-medium text-green-700">Measurements 1-8</CardTitle>
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
//                     <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
//                       {item.label} ({item.range})
//                     </Label>
//                   </div>

//                   <div className="col-span-3">
//                     <Input
//                       id={`measurement-${item.id}`}
//                       value={values.measurements[item.id] || ""}
//                       className="border-green-200 focus:border-green-500"
//                       onChange={(e) => {
//                         const newMeasurements = [...values.measurements]
//                         newMeasurements[item.id] = e.target.value
//                         setFieldValue("measurements", newMeasurements)
//                       }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border-green-200 bg-white shadow-sm">
//           <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
//             <CardTitle className="text-sm font-medium text-green-700">Measurements 9-16</CardTitle>
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
//                     <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
//                       {item.label} ({item.range})
//                     </Label>
//                   </div>

//                   <div className="col-span-3">
//                     <Input
//                       id={`measurement-${item.id}`}
//                       value={values.measurements[item.id] || ""}
//                       className="border-green-200 focus:border-green-500"
//                       onChange={(e) => {
//                         const newMeasurements = [...values.measurements]
//                         newMeasurements[item.id] = e.target.value
//                         setFieldValue("measurements", newMeasurements)
//                       }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

// "use client"

// import { useEffect } from "react"
// import { useFormikContext } from "formik"
// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import firstCardData from "@/data/first-card-data.json"

// export default function MeasurementsTab() {
//   const { values, setFieldValue } = useFormikContext<{
//     measurements: string[]
//   }>()

//   const measurements = [
//     { id: 0, label: "Av. Station Pressure", range: "14-18", dataKey: "stationLevelPressure" },
//     { id: 1, label: "Av. Sea-Level Pressure", range: "19-23", dataKey: "correctedSeaLevelPressure" },
//     { id: 2, label: "Av. Dry-Bulb Temperature", range: "24-26", dataKey: "dryBulbAsRead" },
//     { id: 3, label: "Av. Wet Bulb Temperature", range: "27-28", dataKey: "wetBulbAsRead" },
//     { id: 4, label: "Max. Temperature", range: "30-32", dataKey: "maxMinTempAsRead" },
//     { id: 5, label: "Min Temperature", range: "33-35" },
//     { id: 6, label: "Total Precipitation", range: "36-39" },
//     { id: 7, label: "Av. Dew. Point Temperature", range: "40-42" },
//     { id: 8, label: "Av. Rel Humidity", range: "43-45" },
//     { id: 9, label: "Av. Wind Speed", range: "46-48" },
//     { id: 10, label: "Prevailing Wind Direction (16Pts)", range: "49-50" },
//     { id: 11, label: "Max Wind Speed", range: "51-53" },
//     { id: 12, label: "Direction of Max Wind (16Pts)", range: "54-55" },
//     { id: 13, label: "Av. Total Cloud", range: "56" },
//     { id: 14, label: "Lowest visibility", range: "57-59" },
//     { id: 15, label: "Total Duration of Rain (H-M)", range: "60-63" },
//   ]

//   // Calculate averages from the data
//   useEffect(() => {
//     // Get today's date in ISO format (YYYY-MM-DD)
//     const today = new Date().toISOString().split("T")[0]

//     // Filter data for the current date
//     const todayData = firstCardData.filter((item) => {
//       const itemDate = new Date(item.timestamp).toISOString().split("T")[0]
//       return itemDate === today
//     })

//     if (todayData.length > 0) {
//       // Create a new measurements array if it doesn't exist
//       const newMeasurements = [...(values.measurements || Array(16).fill(""))]

//       // Calculate averages for the first 5 measurements that have dataKey mappings
//       measurements.slice(0, 5).forEach((measurement) => {
//         if (measurement.dataKey) {
//           const values = todayData.map((item) => Number.parseFloat(item[measurement.dataKey]))
//           const validValues = values.filter((val) => !isNaN(val))

//           if (validValues.length > 0) {
//             const average = validValues.reduce((sum, val) => sum + val, 0) / validValues.length
//             newMeasurements[measurement.id] = average.toFixed(2)
//           }
//         }
//       })

//       // Update the form values
//       setFieldValue("measurements", newMeasurements)
//     }
//   }, [setFieldValue])

//   return (
//     <div className="space-y-6">
//       <h2 className="text-lg font-semibold text-green-700 flex items-center">
//         <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-2">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <path d="M8 3v3a2 2 0 0 1-2 2H3" />
//             <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
//             <path d="M3 16h3a2 2 0 0 1 2 2v3" />
//             <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
//           </svg>
//         </span>
//         Weather Measurements
//       </h2>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card className="border-green-200 bg-white shadow-sm">
//           <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
//             <CardTitle className="text-sm font-medium text-green-700">Measurements 1-8</CardTitle>
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
//                     <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
//                       {item.label} ({item.range})
//                     </Label>
//                   </div>

//                   <div className="col-span-3">
//                     <Input
//                       id={`measurement-${item.id}`}
//                       value={values.measurements?.[item.id] || ""}
//                       className="border-green-200 focus:border-green-500"
//                       onChange={(e) => {
//                         const newMeasurements = [...(values.measurements || Array(16).fill(""))]
//                         newMeasurements[item.id] = e.target.value
//                         setFieldValue("measurements", newMeasurements)
//                       }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border-green-200 bg-white shadow-sm">
//           <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
//             <CardTitle className="text-sm font-medium text-green-700">Measurements 9-16</CardTitle>
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
//                     <Label htmlFor={`measurement-${item.id}`} className="text-sm font-medium">
//                       {item.label} ({item.range})
//                     </Label>
//                   </div>

//                   <div className="col-span-3">
//                     <Input
//                       id={`measurement-${item.id}`}
//                       value={values.measurements?.[item.id] || ""}
//                       className="border-green-200 focus:border-green-500"
//                       onChange={(e) => {
//                         const newMeasurements = [...(values.measurements || Array(16).fill(""))]
//                         newMeasurements[item.id] = e.target.value
//                         setFieldValue("measurements", newMeasurements)
//                       }}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client";

import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import firstCardData from "@/data/first-card-data.json";

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
    { id: 5, label: "Min Temperature", range: "33-35" },
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
    { id: 14, label: "Lowest visibility", range: "57-59" },
    { id: 15, label: "Total Duration of Rain (H-M)", range: "60-63" },
  ];

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Calculate averages from the data
  // useEffect(() => {
  //   // Get today's date in ISO format (YYYY-MM-DD)
  //   // const today = new Date().toISOString().split("T")[0];
  //   const today = selectedDate;

  //   // Filter data for the current date
  //   const todayData = firstCardData.filter((item) => {
  //     const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
  //     return itemDate === today;
  //   });

  //   if (todayData.length > 0) {
  //     // Create a new measurements array if it doesn't exist
  //     const newMeasurements = [...(values.measurements || Array(16).fill(""))];

  //     // Process each measurement that has a dataKey mapping
  //     measurements.forEach((measurement) => {
  //       if (measurement.dataKey) {
  //         // Special case for Max Temperature - find the maximum value, not the average
  //         if (
  //           measurement.id === 4 &&
  //           measurement.dataKey === "maxMinTempAsRead"
  //         ) {
  //           const values = todayData.map((item) =>
  //             Number.parseFloat(item[measurement.dataKey])
  //           );
  //           const validValues = values.filter((val) => !isNaN(val));

  //           if (validValues.length > 0) {
  //             const maxValue = Math.max(...validValues);
  //             newMeasurements[measurement.id] = maxValue.toFixed(2);
  //           }
  //         }
  //         // For all other fields, calculate the average
  //         else {
  //           const values = todayData.map((item) =>
  //             Number.parseFloat(item[measurement.dataKey])
  //           );
  //           const validValues = values.filter((val) => !isNaN(val));

  //           if (validValues.length > 0) {
  //             const average =
  //               validValues.reduce((sum, val) => sum + val, 0) /
  //               validValues.length;
  //             newMeasurements[measurement.id] = average.toFixed(2);
  //           }
  //         }
  //       }
  //     });

  //     // Update the form values
  //     setFieldValue("measurements", newMeasurements);
  //   }
  // }, [selectedDate,setFieldValue, values.measurements]);

  useEffect(() => {
    const filteredDate = selectedDate;

    const todayData = firstCardData.filter((item) => {
      const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
      return itemDate === filteredDate;
    });

    const newMeasurements = Array(16).fill(""); // always reset first

    if (todayData.length > 0) {
      measurements.forEach((measurement) => {
        if (measurement.dataKey) {
          const values = todayData
            .map((item) => Number.parseFloat(item[measurement.dataKey]))
            .filter((val) => !isNaN(val));

          if (values.length > 0) {
            const result =
              measurement.id === 4
                ? Math.max(...values) // Max Temperature
                : values.reduce((sum, val) => sum + val, 0) / values.length;

            newMeasurements[measurement.id] = result.toFixed(2);
          }
        }
      });
    }

    setFieldValue("measurements", newMeasurements);
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
          />
        </div>
      </div>

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
                      onChange={(e) => {
                        const newMeasurements = [
                          ...(values.measurements || Array(16).fill("")),
                        ];
                        newMeasurements[item.id] = e.target.value;
                        setFieldValue("measurements", newMeasurements);
                      }}
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
                      onChange={(e) => {
                        const newMeasurements = [
                          ...(values.measurements || Array(16).fill("")),
                        ];
                        newMeasurements[item.id] = e.target.value;
                        setFieldValue("measurements", newMeasurements);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
