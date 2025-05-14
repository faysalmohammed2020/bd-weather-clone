"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Printer } from "lucide-react";
import {
  generateSynopticCode,
  type SynopticFormValues,
} from "@/lib/generateSynopticCode";

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
];

// Mock function to simulate fetching data for different time slots
const fetchSynopticDataForTimeSlot = async (
  timeSlot: string
): Promise<SynopticFormValues | null> => {
  try {
    const res = await fetch(`/api/synoptic?time=${timeSlot}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data as SynopticFormValues;
  } catch (error) {
    console.error(`Failed to fetch data for time slot ${timeSlot}:`, error);
    return null;
  }
};

export default function SynopticCodeTable() {
  const [synopticData, setSynopticData] = useState<
    Record<string, SynopticFormValues | null>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<Record<string, boolean>>({});
  const [headerInfo, setHeaderInfo] = useState({
    dataType: "SY",
    stationNo: "41953",
    year: "24",
    month: "11",
    day: "03",
  });

  // Load data for all time slots on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      const dataPromises = TIME_SLOTS.map((slot) =>
        fetchSynopticDataForTimeSlot(slot.value).then((data) => ({
          slot: slot.value,
          data,
        }))
      );

      const results = await Promise.all(dataPromises);
      const newData: Record<string, SynopticFormValues | null> = {};

      results.forEach(({ slot, data }) => {
        if (data !== null) {
          newData[slot] = data;

          // Update header info from the first available data
          if (Object.keys(newData).length === 1) {
            setHeaderInfo({
              dataType: data.dataType.substring(0, 2),
              stationNo: data.stationNo,
              year: data.year.substring(2),
              month: data.month,
              day: data.day,
            });
          }
        }
      });

      setSynopticData(newData);
      setLoading(false);
    };

    loadAllData();
  }, []);

  // Function to export data as CSV
  const exportToCSV = () => {
    // Create headers
    let csvContent =
      "Time,C1,Iliii,iRiXhvv,Nddff,1SnTTT,2SnTdTdTd,3PPP/4PPP,6RRRtR,7wwW1W2,8NhClCmCh,2SnTnTnTn/InInInIn,56DlDmDh,57CDaEc,C2,GG,58P24P24P24/59P24P24P24,(6RRRtR)/7R24R24R24,8N5Ch5h5,90dqqqt,91fqfqfq,Weather Remarks\n";

    // Get time slots that have data
    const slotsWithData = TIME_SLOTS.filter(
      (slot) => synopticData[slot.value] !== undefined
    ).sort((a, b) => Number.parseInt(a.value) - Number.parseInt(b.value));

    // Add data rows
    slotsWithData.forEach((slot) => {
      const data = synopticData[slot.value];
      if (data) {
        let row = `${slot.label},`;

        // Add measurements
        data.measurements.forEach((measurement) => {
          row += `${measurement},`;
        });

        // Add weather remark
        row += `"${data.weatherRemark.replace(/"/g, '""')}"\n`;
        csvContent += row;
      }
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `synoptic_data_${headerInfo.year}${headerInfo.month}${headerInfo.day}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to print the table
  const printTable = () => {
    window.print();
  };

  // Get time slots that have data, sorted by time
  const slotsWithData = TIME_SLOTS.filter(
    (slot) => synopticData[slot.value] !== undefined
  ).sort((a, b) => Number.parseInt(a.value) - Number.parseInt(b.value));

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
            onClick={exportToCSV}
            disabled={slotsWithData.length === 0}
          >
            <Download size={18} />
            <span className="text-base">Export CSV</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={printTable}
            disabled={slotsWithData.length === 0}
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
      ) : slotsWithData.length === 0 ? (
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
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              No Data Available
            </h3>
            <p className="text-lg text-gray-600 mb-5">
              There is no synoptic data available for any time slot today.
            </p>
            <Button
              variant="outline"
              className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 text-base"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-auto print:overflow-visible">
          {/* Header Section */}
          <div className="mb-4 print:mb-2">
            <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-6 print:py-3 rounded-t-lg">
              <h2 className="text-3xl font-extrabold uppercase mb-5 print:mb-3 text-blue-800">
                SYNOPTIC CODE
              </h2>

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
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    Time
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    C1
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    Iliii
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    iRiXhvv
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    Nddff
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    1SnTTT
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    2SnTdTdTd
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    3PPP/4PPP
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    6RRRtR
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    7wwW1W2
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    8NhClCmCh
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    2SnTnTnTn/InInInIn
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    56DlDmDh
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    57CDaEc
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    Av. Total Clouds
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    C2
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    GG
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    58/59P24
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    (6RRRtR)/7R24
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    8N5Ch5h5
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    90dqqqt
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    91fqfqfq
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 text-center font-mono">
                {TIME_SLOTS.map((slot, index) => {
                  const data = synopticData[slot.value];
                  if (!data) return null;

                  return (
                    <tr
                      key={slot.value}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                      } hover:bg-blue-50 print:hover:bg-white`}
                    >
                      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
                        {slot.label}
                      </td>
                      {data.measurements.map((m, i) => (
                        <td
                          key={i}
                          className={`border border-blue-200 px-4 py-3 whitespace-nowrap ${
                            i % 3 === 0 ? "bg-blue-50/20" : ""
                          }`}
                        >
                          {m}
                        </td>
                      ))}
                      <td className="border border-blue-200 px-4 py-3 whitespace-nowrap text-left text-gray-700">
                        {data.weatherRemark}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Optional footer */}
            <div className="text-right text-sm text-blue-600 mt-2 pr-4 pb-2 print:hidden">
              Generated:{" "}
              {new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}
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
  );
}