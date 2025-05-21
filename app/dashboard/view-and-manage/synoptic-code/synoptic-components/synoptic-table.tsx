"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download, Printer } from "lucide-react"

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
const fetchSynopticDataForTimeSlot = async (): Promise<any[]> => {
  try {
    const res = await fetch("/api/synoptic-code")
    if (!res.ok) {
      console.error("Failed to fetch synoptic data:", await res.text())
      return []
    }
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Failed to fetch synoptic data:", error)
    return []
  }
}

export default function SynopticCodeTable() {
  const [currentData, setCurrentData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [headerInfo, setHeaderInfo] = useState({
    dataType: "SY",
    stationNo: "41953",
    year: "24",
    month: "11",
    day: "03",
  })

  // Function to fetch the most recent data
  const fetchLatestData = async () => {
    setRefreshing(true)
    try {
      const data = await fetchSynopticDataForTimeSlot()
      if (data.length > 0) {
        setCurrentData(data)

        // Extract header info from the first entry if available
        const firstEntry = data[0]
        const observingTime = firstEntry.ObservingTime?.utcTime
          ? new Date(firstEntry.ObservingTime.utcTime)
          : new Date()

        setHeaderInfo({
          dataType: firstEntry.dataType?.substring(0, 2) || "SY",
          stationNo: "41953", // Using default as it's not in the API response
          year: observingTime.getFullYear().toString().substring(2),
          month: (observingTime.getMonth() + 1).toString().padStart(2, "0"),
          day: observingTime.getDate().toString().padStart(2, "0"),
        })
      }
    } catch (error) {
      console.error("Failed to fetch latest data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchLatestData()
  }, [])

  // Function to export data as CSV
  const exportToCSV = () => {
    if (!currentData || currentData.length === 0) return

    // Create headers
    let csvContent =
      "Time,C1,Iliii,iRiXhvv,Nddff,1SnTTT,2SnTdTdTd,3PPP/4PPP,6RRRtR,7wwW1W2,8NhClCmCh,2SnTnTnTn/InInInIn,56DlDmDh,57CDaEc,Avg Total Cloud,C2,GG,58P24P24P24/59P24P24P24,(6RRRtR)/7R24R24R24,8N5Ch5h5,90dqqqt,91fqfqfq,Weather Remarks\n"

    // Add data rows
    currentData.forEach((entry) => {
      const observingTime = entry.ObservingTime?.utcTime ? new Date(entry.ObservingTime.utcTime) : new Date()
      const timeSlot = observingTime.getUTCHours().toString().padStart(2, "0")

      let row = `${timeSlot},`
      row += `${entry.C1 || ""},`
      row += `${entry.Iliii || ""},`
      row += `${entry.iRiXhvv || ""},`
      row += `${entry.Nddff || ""},`
      row += `${entry.S1nTTT || ""},`
      row += `${entry.S2nTddTddTdd || ""},`
      row += `${entry.P3PPP4PPPP || ""},`
      row += `${entry.RRRtR6 || ""},`
      row += `${entry.wwW1W2 || ""},`
      row += `${entry.NhClCmCh || ""},`
      row += `${entry.S2nTnTnTnInInInIn || ""},`
      row += `${entry.D56DLDMDH || ""},`
      row += `${entry.CD57DaEc || ""},`
      row += `${entry.avgTotalCloud || ""},`
      row += `${entry.C2 || ""},`
      row += `${entry.GG || ""},`
      row += `${entry.P24Group58_59 || ""},`
      row += `${entry.R24Group6_7 || ""},`
      row += `${entry.NsChshs || ""},`
      row += `${entry.dqqqt90 || ""},`
      row += `${entry.fqfqfq91 || ""},`
      row += `"${(entry.weatherRemark || "").replace(/"/g, '""')}"\n`
      csvContent += row
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

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={fetchLatestData}
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-base">Refresh</span>}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={exportToCSV}
            disabled={!currentData || currentData.length === 0}
          >
            <Download size={18} />
            <span className="text-base">Export CSV</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={printTable}
            disabled={!currentData}
          >
            <Printer size={18} />
            <span className="text-base">Print</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-700">Loading synoptic data...</span>
        </div>
      ) : !currentData || currentData.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-200">
          <div className="text-center p-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-5 text-blue-400"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 8h20" />
              <path d="M6 12h4" />
              <path d="M14 12h4" />
              <path d="M6 16h4" />
              <path d="M14 16h4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">No Data Available</h3>
            <p className="text-lg text-gray-600 mb-5">There is no synoptic data available for the current time slot.</p>
            <Button
              variant="outline"
              className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 text-base"
              onClick={fetchLatestData}
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-auto print:overflow-visible">
          {/* Header Section */}
          <div className="mb-4 print:mb-2">
            <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-6 print:py-3 rounded-t-lg">
              <h2 className="text-3xl font-extrabold uppercase mb-5 print:mb-3 text-blue-800">SYNOPTIC CODE</h2>

              <div className="flex flex-wrap justify-center gap-10 print:gap-6 max-w-5xl mx-auto">
                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">DATA TYPE</div>
                  <div className="flex">
                    {headerInfo.dataType.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">STATION NO.</div>
                  <div className="flex">
                    {headerInfo.stationNo.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">YEAR</div>
                  <div className="flex">
                    {headerInfo.year.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">MONTH</div>
                  <div className="flex">
                    {headerInfo.month.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-base mb-2 text-gray-600">DAY</div>
                  <div className="flex">
                    {headerInfo.day.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-200 rounded-lg shadow-lg overflow-x-auto print:overflow-visible bg-white">
            <table className="w-full border-collapse min-w-[1800px] text-base text-gray-800">
              <thead className="bg-gradient-to-b from-blue-600 to-blue-700 text-sm font-bold uppercase text-center text-white print:bg-blue-700">
                <tr>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Time</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">C1</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Iliii</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">iRiXhvv</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Nddff</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">1SnTTT</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">2SnTdTdTd</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">3PPP/4PPP</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">6RRRtR</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">7wwW1W2</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">8NhClCmCh</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">2SnTnTnTn/InInInIn</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">56DlDmDh</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">57CDaEc</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Av. Total Clouds</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">C2</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">GG</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">58/59P24</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">(6RRRtR)/7R24</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">8N5Ch5h5</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">90dqqqt</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">91fqfqfq</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 text-center font-mono">
                {currentData && currentData.length > 0 ? (
                  currentData.map((entry, index) => {
                    const observingTime = entry.ObservingTime?.utcTime ? new Date(entry.ObservingTime.utcTime) : null
                    const timeSlot = observingTime ? observingTime.getUTCHours().toString().padStart(2, "0") : "--"

                    return (
                      <tr key={index} className="bg-white hover:bg-blue-50 print:hover:bg-white">
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
                          {timeSlot}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.C1 || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.Iliii || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.iRiXhvv || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.Nddff || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.S1nTTT || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.S2nTddTddTdd || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.P3PPP4PPPP || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.RRRtR6 || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.wwW1W2 || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.NhClCmCh || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.S2nTnTnTnInInInIn || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.D56DLDMDH || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.CD57DaEc || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.avgTotalCloud || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.C2 || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.GG || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.P24Group58_59 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.R24Group6_7 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.NsChshs || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.dqqqt90 || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">{entry.fqfqfq91 || ""}</td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap text-left text-gray-700">
                          {entry.weatherRemark || ""}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={22} className="text-center py-8 text-gray-500">
                      No synoptic data available for today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Optional footer */}
            <div className="text-right text-sm text-blue-600 mt-2 pr-4 pb-2 print:hidden">
              Generated: {new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
            </div>
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
            font-size: 10pt;
          }

          .print\\:bg-blue-700 {
            background-color: #1d4ed8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:bg-white {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}












