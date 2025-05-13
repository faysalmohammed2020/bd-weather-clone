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
import { format, parseISO } from "date-fns";
import { SecondCardData } from "@/data/second-card-data";
import { useSession } from "@/lib/auth-client";

interface SecondCardTableProps {
  refreshTrigger?: number;
}

export function SecondCardTable({ refreshTrigger = 0 }: SecondCardTableProps) {
  const [data, setData] = useState<SecondCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [stationFilter, setStationFilter] = useState("all");
  const [stationNames, setStationNames] = useState<string[]>([]);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/save-observation");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result);

      // Extract unique station IDs
      const stationIds = new Set<string>();
      result.forEach((item: SecondCardData) => {
        if (item.metadata.stationId) {
          stationIds.add(item.metadata.stationId);
        }
      });
      setStationNames(Array.from(stationIds));
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
    const itemDate = item.observer["observation-time"]
      ? format(parseISO(item.observer["observation-time"]), "yyyy-MM-dd")
      : "";

    const matchesDate = itemDate === selectedDate;
    const matchesStation =
      stationFilter === "all" || item.metadata.stationId === stationFilter;

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
      "Station ID",
      "Total Cloud Amount",
      "Low Cloud Direction",
      "Low Cloud Height",
      "Low Cloud Form",
      "Low Cloud Amount",
      "Medium Cloud Direction",
      "Medium Cloud Height",
      "Medium Cloud Form",
      "Medium Cloud Amount",
      "High Cloud Direction",
      "High Cloud Height",
      "High Cloud Form",
      "High Cloud Amount",
      "Rainfall Start",
      "Rainfall End",
      "Rainfall Since Previous",
      "Rainfall During Previous",
      "Rainfall Last 24h",
      "Wind Speed",
      "Wind Direction",
      "Observer",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredData.map((item) => {
        const time = item.observer["observation-time"]
          ? format(parseISO(item.observer["observation-time"]), "HH:mm")
          : "N/A";

        const totalCloudAmount =
          item.totalCloud?.["total-cloud-amount"] ||
          item.observer["total-cloud-amount"] ||
          "N/A";

        return [
          time,
          item.metadata.stationId || "N/A",
          totalCloudAmount,
          item.clouds.low.direction || "N/A",
          item.clouds.low.height || "N/A",
          item.clouds.low.form || "N/A",
          item.clouds.low.amount || "N/A",
          item.clouds.medium.direction || "N/A",
          item.clouds.medium.height || "N/A",
          item.clouds.medium.form || "N/A",
          item.clouds.medium.amount || "N/A",
          item.clouds.high.direction || "N/A",
          item.clouds.high.height || "N/A",
          item.clouds.high.form || "N/A",
          item.clouds.high.amount || "N/A",
          item.rainfall["time-start"] || "N/A",
          item.rainfall["time-end"] || "N/A",
          item.rainfall["since-previous"] || "N/A",
          item.rainfall["during-previous"] || "N/A",
          item.rainfall["last-24-hours"] || "N/A",
          item.wind.speed || "N/A",
          item.wind.direction || "N/A",
          item.observer["observer-initial"] || "N/A",
        ].join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `second-card-data-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="p-4 bg-sky-600 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-bold">Second Card</CardTitle>

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
          {session?.user?.role === "super_admin" && (
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
                  {stationNames.map((id) => (
                    <SelectItem key={id} value={id}>
                      Station {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Main Table Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-100 border-b border-gray-300">
            <div className="text-center font-bold text-lg border-b-2 border-gray-800 pb-2 mb-4">
              SECOND CARD
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      TIME
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      STATION
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      TOTAL CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      LOW CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      MEDIUM CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      HIGH CLOUD
                    </th>
                    <th
                      colSpan={12}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      SIGNIFICANT CLOUD
                    </th>
                    <th
                      colSpan={5}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      RAINFALL
                    </th>
                    <th
                      colSpan={5}
                      className="border border-gray-400 bg-gray-100 text-xs p-1"
                    >
                      WIND
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      OBSERVER
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      GG
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      ID
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      N
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Dir
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      H
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      CL
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Amt
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Dir
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      H
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      CM
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Amt
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Dir
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      H
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      CH
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Amt
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      H1
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      C1
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      A1
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      H2
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      C2
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      A2
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      H3
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      C3
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      A3
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      H4
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      C4
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      A4
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Start
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      End
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Since
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      During
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      24h
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      1st
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      2nd
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Speed
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      WD
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Dir
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">
                      Init
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={38} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-800"></div>
                          <span className="ml-2">Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={38} className="text-center py-8">
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
                      const time = record.observer["observation-time"]
                        ? format(
                            parseISO(record.observer["observation-time"]),
                            "HH:mm"
                          )
                        : "--:--";

                      const totalCloudAmount =
                        record.totalCloud?.["total-cloud-amount"] ||
                        record.observer["total-cloud-amount"] ||
                        "--";

                      return (
                        <tr
                          key={index}
                          className="text-center font-mono hover:bg-gray-50"
                        >
                          <td className="border border-gray-400 p-1">{time}</td>
                          <td className="border border-gray-400 p-1">
                            {record.metadata.stationId || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {totalCloudAmount}
                          </td>

                          {/* Low Cloud */}
                          <td className="border border-gray-400 p-1">
                            {record.clouds.low.direction || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.low.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.low.form || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.low.amount || "--"}
                          </td>

                          {/* Medium Cloud */}
                          <td className="border border-gray-400 p-1">
                            {record.clouds.medium.direction || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.medium.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.medium.form || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.medium.amount || "--"}
                          </td>

                          {/* High Cloud */}
                          <td className="border border-gray-400 p-1">
                            {record.clouds.high.direction || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.high.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.high.form || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.clouds.high.amount || "--"}
                          </td>

                          {/* Significant Clouds */}
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer1.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer1.form || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer1.amount || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer2.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer2.form || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer2.amount || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer3.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer3.form || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer3.amount || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer4.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer4.form || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer4.amount || "--"}
                          </td>

                          {/* Rainfall */}
                          <td className="border border-gray-400 p-1">
                            {record.rainfall["time-start"] || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.rainfall["time-end"] || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.rainfall["since-previous"] || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.rainfall["during-previous"] || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.rainfall["last-24-hours"] || "--"}
                          </td>

                          {/* Wind */}
                          <td className="border border-gray-400 p-1">
                            {record.wind["first-anemometer"] || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.wind["second-anemometer"] || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.wind.speed || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.wind["wind-direction"] || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.wind.direction || "--"}
                          </td>

                          {/* Observer */}
                          <td className="border border-gray-400 p-1">
                            {record.observer["observer-initial"] || "--"}
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
