// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Loader2, RefreshCw, Download } from "lucide-react"
// import { generateSynopticCode, type SynopticFormValues } from "@/lib/generateSynopticCode"

// // Time slots for 3-hour intervals
// const TIME_SLOTS = [
//   { label: "00:00 - 03:00", value: "00" },
//   { label: "03:00 - 06:00", value: "03" },
//   { label: "06:00 - 09:00", value: "06" },
//   { label: "09:00 - 12:00", value: "09" },
//   { label: "12:00 - 15:00", value: "12" },
//   { label: "15:00 - 18:00", value: "15" },
//   { label: "18:00 - 21:00", value: "18" },
//   { label: "21:00 - 00:00", value: "21" },
// ]

// // Column definitions for the table
// const COLUMN_GROUPS = [
//   {
//     name: "Basic Info",
//     columns: [
//       { id: "timeSlot", label: "Time Slot", width: "120px" },
//       { id: "dataType", label: "Data Type", width: "100px" },
//       { id: "stationNo", label: "Station No", width: "100px" },
//       { id: "date", label: "Date", width: "120px" },
//     ],
//   },
//   {
//     name: "Measurements 1-7",
//     columns: [
//       { id: "m0", label: "C1 (16)", width: "90px" },
//       { id: "m1", label: "Iliii (17-21)", width: "110px" },
//       { id: "m2", label: "iRiXhvv (22-26)", width: "120px" },
//       { id: "m3", label: "Nddff (27-31)", width: "110px" },
//       { id: "m4", label: "1SnTTT (32-36)", width: "120px" },
//       { id: "m5", label: "2SnTdTdTd (37-41)", width: "130px" },
//       { id: "m6", label: "3PPP/4PPP (42-46)", width: "130px" },
//     ],
//   },
//   {
//     name: "Measurements 8-14",
//     columns: [
//       { id: "m7", label: "6RRRtR (47-51)", width: "120px" },
//       { id: "m8", label: "7wwW1W2 (52-56)", width: "130px" },
//       { id: "m9", label: "8NhClCmCh (57-61)", width: "130px" },
//       { id: "m10", label: "2SnTnTnTn/InInInIn (62-66)", width: "180px" },
//       { id: "m11", label: "56DlDmDh (67-71)", width: "130px" },
//       { id: "m12", label: "57CDaEc (72-76)", width: "120px" },
//       { id: "m13", label: "Av. Total Cloud (56)", width: "150px" },
//     ],
//   },
//   {
//     name: "Measurements 15-21",
//     columns: [
//       { id: "m14", label: "C2 (16)", width: "90px" },
//       { id: "m15", label: "GG (17-18)", width: "100px" },
//       { id: "m16", label: "58P24P24P24/59P24P24P24 (19-23)", width: "220px" },
//       { id: "m17", label: "(6RRRtR)/7R24R24R24 (24-28)", width: "200px" },
//       { id: "m18", label: "8N5Ch5h5 (29-33)", width: "130px" },
//       { id: "m19", label: "90dqqqt (34-38)", width: "120px" },
//       { id: "m20", label: "91fqfqfq (39-43)", width: "120px" },
//     ],
//   },
// ]

// // Mock function to simulate fetching data for different time slots
// const fetchSynopticDataForTimeSlot = async (timeSlot: string): Promise<SynopticFormValues> => {
//   // Simulate API delay
//   await new Promise((resolve) => setTimeout(resolve, 300))

//   // Get base data
//   const baseData = generateSynopticCode()

//   // Modify the data slightly for different time slots to simulate different readings
//   const data = { ...baseData }

//   // Set the time slot
//   data.measurements[15] = timeSlot

//   // Slightly modify some values based on time slot to simulate different readings
//   const timeSlotNum = Number.parseInt(timeSlot)

//   // Modify temperature based on time of day (warmer in afternoon, cooler at night)
//   const tempModifier = timeSlotNum >= 9 && timeSlotNum <= 15 ? 1 : -1
//   const currentTemp = data.measurements[4]
//   if (currentTemp.startsWith("1")) {
//     const tempSign = currentTemp[1]
//     const tempValue = Number.parseInt(currentTemp.substring(2))
//     const newTempValue = Math.max(0, tempValue + tempModifier * 5)
//     data.measurements[4] = `1${tempSign}${newTempValue.toString().padStart(3, "0")}`
//   }

//   // Modify cloud cover based on time (more clouds in afternoon)
//   const cloudModifier = timeSlotNum >= 12 && timeSlotNum <= 18 ? 1 : 0
//   const currentCloud = data.measurements[3][0]
//   const newCloudValue = Math.min(8, Number.parseInt(currentCloud) + cloudModifier)
//   data.measurements[3] = newCloudValue + data.measurements[3].substring(1)
//   data.measurements[13] = newCloudValue.toString()

//   return data
// }

// export default function SynopticTable() {
//   const [activeTab, setActiveTab] = useState<string>("all")
//   const [synopticData, setSynopticData] = useState<Record<string, SynopticFormValues>>({})
//   const [loading, setLoading] = useState<boolean>(true)
//   const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})

//   // Load data for all time slots on component mount
//   useEffect(() => {
//     const loadAllData = async () => {
//       setLoading(true)
//       const dataPromises = TIME_SLOTS.map((slot) =>
//         fetchSynopticDataForTimeSlot(slot.value).then((data) => ({ [slot.value]: data })),
//       )

//       const results = await Promise.all(dataPromises)
//       const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {})

//       setSynopticData(combinedData)
//       setLoading(false)
//     }

//     loadAllData()
//   }, [])

//   // Function to refresh data for a specific time slot
//   const refreshTimeSlotData = async (timeSlot: string) => {
//     setRefreshing((prev) => ({ ...prev, [timeSlot]: true }))
//     try {
//       const newData = await fetchSynopticDataForTimeSlot(timeSlot)
//       setSynopticData((prev) => ({ ...prev, [timeSlot]: newData }))
//     } finally {
//       setRefreshing((prev) => ({ ...prev, [timeSlot]: false }))
//     }
//   }

//   // Function to export data as CSV
//   const exportToCSV = () => {
//     // Create headers
//     let csvContent = "Time Slot,Data Type,Station No,Date,"

//     // Add measurement headers
//     for (let i = 0; i < 21; i++) {
//       csvContent += `Measurement ${i + 1},`
//     }
//     csvContent += "Weather Remark\n"

//     // Add data rows
//     TIME_SLOTS.forEach((slot) => {
//       const data = synopticData[slot.value]
//       if (data) {
//         const date = `${data.year}-${data.month}-${data.day}`
//         csvContent += `${slot.label},${data.dataType},${data.stationNo},${date},`

//         // Add measurements
//         data.measurements.forEach((measurement) => {
//           csvContent += `${measurement},`
//         })

//         // Add weather remark
//         csvContent += `"${data.weatherRemark.replace(/"/g, '""')}"\n`
//       }
//     })

//     // Create download link
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//     const url = URL.createObjectURL(blob)
//     const link = document.createElement("a")
//     link.setAttribute("href", url)
//     link.setAttribute("download", `synoptic_data_${new Date().toISOString().split("T")[0]}.csv`)
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
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
//           Synoptic Code Data (3-Hour Intervals)
//         </h2>
//         <Button
//           variant="outline"
//           className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50"
//           onClick={exportToCSV}
//         >
//           <Download size={16} />
//           Export CSV
//         </Button>
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center h-64">
//           <Loader2 className="h-8 w-8 animate-spin text-green-600" />
//           <span className="ml-2 text-green-700">Loading synoptic data...</span>
//         </div>
//       ) : (
//         <Card className="border-green-200 shadow-sm">
//           <CardHeader className="pb-2 bg-green-50 border-b border-green-100">
//             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//               <TabsList className="bg-green-100/50 p-1">
//                 <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
//                   All Time Slots
//                 </TabsTrigger>
//                 {COLUMN_GROUPS.map((group) => (
//                   <TabsTrigger
//                     key={group.name}
//                     value={group.name}
//                     className="data-[state=active]:bg-white data-[state=active]:text-green-700"
//                   >
//                     {group.name}
//                   </TabsTrigger>
//                 ))}
//               </TabsList>
//             </Tabs>
//           </CardHeader>
//           <CardContent className="p-0">
//             <ScrollArea className="h-[calc(100vh-300px)] min-h-[500px]">
//               <div className="p-4">
//                 <div className="overflow-x-auto">
//                   <table className="w-full border-collapse">
//                     <thead>
//                       <tr className="bg-green-50">
//                         {/* Always show basic info columns */}
//                         {COLUMN_GROUPS[0].columns.map((column) => (
//                           <th
//                             key={column.id}
//                             className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider border border-green-200"
//                             style={{ minWidth: column.width }}
//                           >
//                             {column.label}
//                           </th>
//                         ))}

//                         {/* Show columns based on active tab */}
//                         {(activeTab === "all" || activeTab === COLUMN_GROUPS[1].name) &&
//                           COLUMN_GROUPS[1].columns.map((column) => (
//                             <th
//                               key={column.id}
//                               className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider border border-green-200"
//                               style={{ minWidth: column.width }}
//                             >
//                               {column.label}
//                             </th>
//                           ))}

//                         {(activeTab === "all" || activeTab === COLUMN_GROUPS[2].name) &&
//                           COLUMN_GROUPS[2].columns.map((column) => (
//                             <th
//                               key={column.id}
//                               className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider border border-green-200"
//                               style={{ minWidth: column.width }}
//                             >
//                               {column.label}
//                             </th>
//                           ))}

//                         {(activeTab === "all" || activeTab === COLUMN_GROUPS[3].name) &&
//                           COLUMN_GROUPS[3].columns.map((column) => (
//                             <th
//                               key={column.id}
//                               className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider border border-green-200"
//                               style={{ minWidth: column.width }}
//                             >
//                               {column.label}
//                             </th>
//                           ))}

//                         {/* Action column */}
//                         <th
//                           className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider border border-green-200"
//                           style={{ minWidth: "100px" }}
//                         >
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {TIME_SLOTS.map((slot, index) => {
//                         const data = synopticData[slot.value]
//                         if (!data) return null

//                         return (
//                           <tr key={slot.value} className={index % 2 === 0 ? "bg-white" : "bg-green-50/30"}>
//                             {/* Basic Info */}
//                             <td className="px-3 py-2 text-sm border border-green-100 font-medium">{slot.label}</td>
//                             <td className="px-3 py-2 text-sm border border-green-100">{data.dataType}</td>
//                             <td className="px-3 py-2 text-sm border border-green-100">{data.stationNo}</td>
//                             <td className="px-3 py-2 text-sm border border-green-100">
//                               {`${data.year}-${data.month}-${data.day}`}
//                             </td>

//                             {/* Measurements 1-7 */}
//                             {(activeTab === "all" || activeTab === COLUMN_GROUPS[1].name) &&
//                               data.measurements.slice(0, 7).map((measurement, i) => (
//                                 <td key={`m${i}`} className="px-3 py-2 text-sm border border-green-100 font-mono">
//                                   {measurement}
//                                 </td>
//                               ))}

//                             {/* Measurements 8-14 */}
//                             {(activeTab === "all" || activeTab === COLUMN_GROUPS[2].name) &&
//                               data.measurements.slice(7, 14).map((measurement, i) => (
//                                 <td key={`m${i + 7}`} className="px-3 py-2 text-sm border border-green-100 font-mono">
//                                   {measurement}
//                                 </td>
//                               ))}

//                             {/* Measurements 15-21 */}
//                             {(activeTab === "all" || activeTab === COLUMN_GROUPS[3].name) &&
//                               data.measurements.slice(14, 21).map((measurement, i) => (
//                                 <td key={`m${i + 14}`} className="px-3 py-2 text-sm border border-green-100 font-mono">
//                                   {measurement}
//                                 </td>
//                               ))}

//                             {/* Actions */}
//                             <td className="px-3 py-2 text-sm border border-green-100">
//                               <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="h-8 px-2 text-green-700"
//                                 onClick={() => refreshTimeSlotData(slot.value)}
//                                 disabled={refreshing[slot.value]}
//                               >
//                                 {refreshing[slot.value] ? (
//                                   <Loader2 className="h-4 w-4 animate-spin" />
//                                 ) : (
//                                   <RefreshCw className="h-4 w-4" />
//                                 )}
//                                 <span className="ml-1">Refresh</span>
//                               </Button>
//                             </td>
//                           </tr>
//                         )
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </ScrollArea>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }





"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Printer } from "lucide-react"
import { generateSynopticCode, type SynopticFormValues } from "@/lib/generateSynopticCode"

// Time slots for 3-hour intervals
const TIME_SLOTS = [
  { label: "00", value: "00" },
  { label: "03", value: "03" },
  { label: "06", value: "06" },
  { label: "09", value: "09" },
  { label: "12", value: "12" },
  { label: "15", value: "15" },
  { label: "18", value: "18" },
  { label: "21", value: "21" },
]

// Mock function to simulate fetching data for different time slots
const fetchSynopticDataForTimeSlot = async (timeSlot: string): Promise<SynopticFormValues | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // For demonstration purposes, create a pattern of available data
  // In a real app, this would be determined by your actual data source
  const slotHour = Number.parseInt(timeSlot)

  // Simulate a pattern where some time slots have data and others don't
  // For example: 00:00, 06:00, 12:00, 18:00 have data, others don't
  const hasData = slotHour % 3 === 0 // All slots have data for demo purposes

  if (!hasData) {
    return null // No data for this time slot
  }

  // Get base data
  const baseData = generateSynopticCode()

  // Modify the data slightly for different time slots to simulate different readings
  const data = { ...baseData }

  // Set the time slot
  data.measurements[15] = timeSlot

  // Slightly modify some values based on time slot to simulate different readings
  const timeSlotNum = Number.parseInt(timeSlot)

  // Modify temperature based on time of day (warmer in afternoon, cooler at night)
  const tempModifier = timeSlotNum >= 9 && timeSlotNum <= 15 ? 1 : -1
  const currentTemp = data.measurements[4]
  if (currentTemp.startsWith("1")) {
    const tempSign = currentTemp[1]
    const tempValue = Number.parseInt(currentTemp.substring(2))
    const newTempValue = Math.max(0, tempValue + tempModifier * 5)
    data.measurements[4] = `1${tempSign}${newTempValue.toString().padStart(3, "0")}`
  }

  // Modify cloud cover based on time (more clouds in afternoon)
  const cloudModifier = timeSlotNum >= 12 && timeSlotNum <= 18 ? 1 : 0
  const currentCloud = data.measurements[3][0]
  const newCloudValue = Math.min(8, Number.parseInt(currentCloud) + cloudModifier)
  data.measurements[3] = newCloudValue + data.measurements[3].substring(1)
  data.measurements[13] = newCloudValue.toString()

  return data
}

export default function SynopticCodeTable() {
  const [synopticData, setSynopticData] = useState<Record<string, SynopticFormValues | null>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({})
  const [headerInfo, setHeaderInfo] = useState({
    dataType: "SY",
    stationNo: "41953",
    year: "24",
    month: "11",
    day: "03",
  })

  // Load data for all time slots on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      const dataPromises = TIME_SLOTS.map((slot) =>
        fetchSynopticDataForTimeSlot(slot.value).then((data) => ({ slot: slot.value, data })),
      )

      const results = await Promise.all(dataPromises)
      const newData: Record<string, SynopticFormValues | null> = {}

      results.forEach(({ slot, data }) => {
        if (data !== null) {
          newData[slot] = data

          // Update header info from the first available data
          if (Object.keys(newData).length === 1) {
            setHeaderInfo({
              dataType: data.dataType.substring(0, 2),
              stationNo: data.stationNo,
              year: data.year.substring(2),
              month: data.month,
              day: data.day,
            })
          }
        }
      })

      setSynopticData(newData)
      setLoading(false)
    }

    loadAllData()
  }, [])

  // Function to export data as CSV
  const exportToCSV = () => {
    // Create headers
    let csvContent =
      "Time,C1,Iliii,iRiXhvv,Nddff,1SnTTT,2SnTdTdTd,3PPP/4PPP,6RRRtR,7wwW1W2,8NhClCmCh,2SnTnTnTn/InInInIn,56DlDmDh,57CDaEc,C2,GG,58P24P24P24/59P24P24P24,(6RRRtR)/7R24R24R24,8N5Ch5h5,90dqqqt,91fqfqfq,Weather Remarks\n"

    // Get time slots that have data
    const slotsWithData = TIME_SLOTS.filter((slot) => synopticData[slot.value] !== undefined).sort(
      (a, b) => Number.parseInt(a.value) - Number.parseInt(b.value),
    )

    // Add data rows
    slotsWithData.forEach((slot) => {
      const data = synopticData[slot.value]
      if (data) {
        let row = `${slot.label},`

        // Add measurements
        data.measurements.forEach((measurement) => {
          row += `${measurement},`
        })

        // Add weather remark
        row += `"${data.weatherRemark.replace(/"/g, '""')}"\n`
        csvContent += row
      }
    })

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `synoptic_data_${headerInfo.year}${headerInfo.month}${headerInfo.day}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Function to print the table
  const printTable = () => {
    window.print()
  }

  // Get time slots that have data, sorted by time
  const slotsWithData = TIME_SLOTS.filter((slot) => synopticData[slot.value] !== undefined).sort(
    (a, b) => Number.parseInt(a.value) - Number.parseInt(b.value),
  )

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center mr-2">
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
          Synoptic Code Data
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-gray-700 border-gray-200 hover:bg-gray-50"
            onClick={exportToCSV}
            disabled={slotsWithData.length === 0}
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-gray-700 border-gray-200 hover:bg-gray-50"
            onClick={printTable}
            disabled={slotsWithData.length === 0}
          >
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          <span className="ml-2 text-gray-700">Loading synoptic data...</span>
        </div>
      ) : slotsWithData.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-gray-50/50 rounded-lg border border-gray-200">
          <div className="text-center p-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 text-gray-400"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 8h20" />
              <path d="M6 12h4" />
              <path d="M14 12h4" />
              <path d="M6 16h4" />
              <path d="M14 16h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">There is no synoptic data available for any time slot today.</p>
            <Button
              variant="outline"
              className="bg-white text-gray-700 border-gray-300"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-auto print:overflow-visible">
          {/* Header Section */}
          <div className="mb-2 print:mb-0">
            <div className="text-center border-b border-gray-300 bg-white py-4 print:py-2">
              <h2 className="text-xl font-bold uppercase mb-4 print:mb-2">SYNOPTIC CODE</h2>

              <div className="flex flex-wrap justify-center gap-8 print:gap-4 max-w-4xl mx-auto">
                <div className="text-left">
                  <div className="font-bold text-sm mb-1">DATA TYPE</div>
                  <div className="flex">
                    {headerInfo.dataType.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 border border-gray-400 flex items-center justify-center font-mono text-base"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-sm mb-1">STATION NO.</div>
                  <div className="flex">
                    {headerInfo.stationNo.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 border border-gray-400 flex items-center justify-center font-mono text-base"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-sm mb-1">YEAR</div>
                  <div className="flex">
                    {headerInfo.year.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 border border-gray-400 flex items-center justify-center font-mono text-base"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-sm mb-1">MONTH</div>
                  <div className="flex">
                    {headerInfo.month.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 border border-gray-400 flex items-center justify-center font-mono text-base"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-sm mb-1">DAY</div>
                  <div className="flex">
                    {headerInfo.day.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 border border-gray-400 flex items-center justify-center font-mono text-base"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="border border-gray-300 print:border-0 overflow-x-auto">
            <table className="w-full border-collapse table-fixed min-w-[1500px]">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-10 print:bg-white">
                    14-15
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-8 print:bg-white">
                    16
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    17-21
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    22-26
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    27-31
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    32-36
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    37-41
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-20 print:bg-white">
                    42-46
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    47-51
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    52-56
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    57-61
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-20 print:bg-white">
                    62-66
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    67-71
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    72-76
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-8 print:bg-white">
                    16
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-10 print:bg-white">
                    17-18
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    19-23
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-20 print:bg-white">
                    24-28
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    29-33
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    34-38
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-16 print:bg-white">
                    39-43
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 w-20 print:bg-white">
                    WEATHER
                  </th>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    Time
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    C1
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    Iliii
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    iRiXhvv
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    Nddff
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    1SnTTT
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    2SnTdTdTd
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    3PPP/4PPP
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    6RRRtR
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    7wwW1W2
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    8NhClCmCh
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    2SnTnTnTn/InInInIn
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    56DlDmDh
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    57CDaEc
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    C2
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    GG
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white whitespace-nowrap overflow-hidden text-ellipsis">
                    58P24P24P24/59P24P24P24
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white whitespace-nowrap overflow-hidden text-ellipsis">
                    (6RRRtR)/7R24R24R24
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    8N5Ch5h5
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    90dqqqt
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    91fqfqfq
                  </th>
                  <th className="border border-gray-300 px-1 py-1 text-xs font-medium text-center bg-gray-100 print:bg-white">
                    REMARKS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slotsWithData.map((slot, index) => {
                  const data = synopticData[slot.value]
                  if (!data) return null

                  return (
                    <tr
                      key={slot.value}
                      className={`hover:bg-gray-50 print:hover:bg-white ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                    >
                      {/* Time */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">{slot.label}</td>

                      {/* C1 */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[0]}
                      </td>

                      {/* Iliii */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[1]}
                      </td>

                      {/* iRiXhvv */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[2]}
                      </td>

                      {/* Nddff */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[3]}
                      </td>

                      {/* 1SnTTT */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[4]}
                      </td>

                      {/* 2SnTdTdTd */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[5]}
                      </td>

                      {/* 3PPP/4PPP */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[6]}
                      </td>

                      {/* 6RRRtR */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[7]}
                      </td>

                      {/* 7wwW1W2 */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[8]}
                      </td>

                      {/* 8NhClCmCh */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[9]}
                      </td>

                      {/* 2SnTnTnTn/InInInIn */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[10]}
                      </td>

                      {/* 56DlDmDh */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[11]}
                      </td>

                      {/* 57CDaEc */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[12]}
                      </td>

                      {/* C2 */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[14]}
                      </td>

                      {/* GG */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[15]}
                      </td>

                      {/* 58P24P24P24/59P24P24P24 */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[16]}
                      </td>

                      {/* (6RRRtR)/7R24R24R24 */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[17]}
                      </td>

                      {/* 8N5Ch5h5 */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[18]}
                      </td>

                      {/* 90dqqqt */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[19]}
                      </td>

                      {/* 91fqfqfq */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.measurements[20]}
                      </td>

                      {/* Weather Remarks */}
                      <td className="border border-gray-300 px-1 py-1 text-sm font-mono text-center">
                        {data.weatherRemark}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          
          body {
            font-size: 9pt;
          }
        }
      `}</style>
    </div>
  )
}
