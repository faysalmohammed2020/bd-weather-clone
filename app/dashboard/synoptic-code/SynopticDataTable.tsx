"use client";

import { useFormikContext } from "formik";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// types.ts
export interface SynopticFormValues {
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
  weatherRemark: string;
  measurements: string[];
}

export default function SynopticDataTable() {
  const { values } = useFormikContext<SynopticFormValues>();
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "basic"
  );

  const measurementLabels = [
    "C1",
    "Iliii",
    "iRiXhvv",
    "Nddff",
    "ISnTTT",
    "2SnTdTdTd",
    "3P.P.P.P/4PPPP",
    "6RRRtR",
    "7wwW1W2",
    "8NhClCmC11",
    "2SnInInIn/InInInIn",
    "56DLDMDH",
    "57CDaEc",
    "Av. Total Cloud",
    "C2",
    "GG",
    "58P24P24P24/59P24P24P24",
    "(6RRRtR)/7R24R24R24",
    "8N5Ch5h5",
    "90dqqqt",
    "91fqfqfq",
  ];

  const formattedDate =
    values.year && values.month && values.day
      ? `${values.year}/${values.month}/${values.day}`
      : "Not set";

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-purple-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-2">
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
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </span>
        Synoptic Data Summary
      </h2>

      {/* Basic Information Section */}
      <Card className="border-purple-200 bg-white shadow-sm rounded-xl overflow-hidden">
        <CardHeader
          className="bg-purple-50 cursor-pointer py-3"
          onClick={() =>
            setExpandedSection(expandedSection === "basic" ? null : "basic")
          }
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-purple-700">
              Basic Information
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {expandedSection === "basic" ? (
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
                  className="text-purple-700"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              ) : (
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
                  className="text-purple-700"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </Button>
          </div>
        </CardHeader>
        {expandedSection === "basic" && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="text-left p-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  <tr className="hover:bg-purple-50">
                    <td className="p-3 text-sm font-medium text-gray-700">
                      Data Type
                    </td>
                    <td className="p-3 text-sm text-gray-900 font-mono">
                      {values.dataType || "Not set"}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="p-3 text-sm font-medium text-gray-700">
                      Station No.
                    </td>
                    <td className="p-3 text-sm text-gray-900 font-mono">
                      {values.stationNo || "Not set"}
                    </td>
                  </tr>
                  <tr className="hover:bg-purple-50">
                    <td className="p-3 text-sm font-medium text-gray-700">
                      Date (Y/M/D)
                    </td>
                    <td className="p-3 text-sm text-gray-900 font-mono">
                      {formattedDate}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Measurements Section */}
      <Card className="border-purple-200 bg-white shadow-sm rounded-xl overflow-hidden">
        <CardHeader
          className="bg-purple-50 cursor-pointer py-3"
          onClick={() =>
            setExpandedSection(
              expandedSection === "measurements" ? null : "measurements"
            )
          }
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-purple-700">
              Synoptic Measurements
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {expandedSection === "measurements" ? (
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
                  className="text-purple-700"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              ) : (
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
                  className="text-purple-700"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </Button>
          </div>
        </CardHeader>
        {expandedSection === "measurements" && (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="text-left p-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                      No.
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                      Measurement
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-purple-700 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  {values.measurements?.map((measurement, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-purple-50"}
                    >
                      <td className="p-3 text-sm font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="p-3 text-sm font-medium text-gray-700">
                        {measurementLabels[index]}
                      </td>
                      <td className="p-3 text-sm text-gray-900 font-mono">
                        {measurement || "-"}
                      </td>
                    </tr>
                  ))}
                  {(!values.measurements ||
                    values.measurements.length === 0) && (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-3 text-sm text-center text-gray-500"
                      >
                        No measurements recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Weather Remarks Section */}
      <Card className="border-purple-200 bg-white shadow-sm rounded-xl overflow-hidden">
        <CardHeader
          className="bg-purple-50 cursor-pointer py-3"
          onClick={() =>
            setExpandedSection(expandedSection === "remarks" ? null : "remarks")
          }
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-purple-700">
              Weather Remarks
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {expandedSection === "remarks" ? (
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
                  className="text-purple-700"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              ) : (
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
                  className="text-purple-700"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </Button>
          </div>
        </CardHeader>
        {expandedSection === "remarks" && (
          <CardContent className="p-4">
            <div className="bg-purple-50 p-3 rounded-md">
              <p className="text-sm whitespace-pre-wrap">
                {values.weatherRemark || "No weather remarks recorded."}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Export Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
          onClick={() => {
            // Would handle print functionality
            window.print();
          }}
        >
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
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect width="12" height="8" x="6" y="14" />
          </svg>
          Print
        </Button>
        <Button
          className="bg-purple-600 text-white hover:bg-purple-700"
          onClick={() => {
            // Would handle export functionality
            const jsonData = JSON.stringify(values, null, 2);
            const blob = new Blob([jsonData], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `synoptic-data-${values.year}${values.month}${values.day}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
        >
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Export Data
        </Button>
      </div>
    </div>
  );
}
