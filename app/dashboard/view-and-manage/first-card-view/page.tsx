"use client";

import type React from "react";

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
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  CloudSun,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

export default function FirstCardTable({ refreshTrigger = 0 }: FirstCardTableProps) {
  const [data, setData] = useState<MeteorologicalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [stationFilter, setStationFilter] = useState("all");
  const [stationNames, setStationNames] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  // Edit modal state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<MeteorologicalEntry | null>(null);
  const [editFormData, setEditFormData] = useState<
    Partial<MeteorologicalEntry>
  >({});
  const [isSaving, setIsSaving] = useState(false);

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
      toast.error("Failed to fetch meteorological data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh data manually
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
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

  // Get weather status color based on relative humidity
  const getWeatherStatusColor = (humidity: string) => {
    const humidityValue = Number.parseInt(humidity || "0");
    if (humidityValue >= 80) return "bg-blue-500";
    if (humidityValue >= 60) return "bg-green-500";
    if (humidityValue >= 40) return "bg-yellow-500";
    if (humidityValue >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  // Format data type for display (assuming it's stored as a string like "AB")
  const formatDataType = (dataType?: string) => {
    if (!dataType) return "--";
    return dataType.length >= 2
      ? `${dataType[0] || "-"}${dataType[1] || "-"}`
      : "--";
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

  const filteredYear = filteredData[0]?.timestamp
    ? new Date(filteredData[0].timestamp).getFullYear().toString().slice(-2)
    : new Date().getFullYear().toString().slice(-2);

  // Handle opening the edit dialog
  const handleEditClick = (record: MeteorologicalEntry) => {
    setSelectedRecord(record);
    setEditFormData(record);
    setIsEditDialogOpen(true);
  };

  // Handle input changes in the edit form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle select changes in the edit form
  const handleEditSelectChange = (id: string, value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Save the edited record
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/first-card-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedRecord.id,
          ...editFormData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update record");
      }

      const result = await response.json();

      // Update the data in the local state
      setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedRecord.id ? { ...item, ...editFormData } : item
        )
      );

      toast.success("Record updated successfully");

      // Close the dialog
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <CloudSun size={24} className="text-yellow-300" />
            <CardTitle className="text-xl font-bold">
              Meteorological Data Dashboard
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span className="ml-1">Refresh</span>
            </Button>
            <Button
              onClick={exportToCSV}
              className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
              size="sm"
            >
              <Download size={16} /> Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Date and Station Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-slate-100 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDay}
              className="hover:bg-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="relative">
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-purple-500" />
              <Input
                type="date"
                className="pl-8 w-40 border-slate-300 focus:border-purple-500 focus:ring-purple-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              className="hover:bg-slate-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-purple-500" />
            <Label
              htmlFor="stationFilter"
              className="whitespace-nowrap font-medium text-slate-700"
            >
              Station:
            </Label>
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-[200px] border-slate-300 focus:ring-purple-500">
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
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
            <div className="flex justify-around gap-4">
              <div className="flex flex-col">
                <Label
                  htmlFor="dataType"
                  className="text-sm font-medium text-slate-900 mb-2"
                >
                  DATA TYPE
                </Label>
                <div className="flex gap-1">
                  {["S", "Y"].map((char, i) => (
                    <Input
                      key={`dataType-${i}`}
                      id={`dataType-${i}`}
                      className="w-12 text-center p-2 bg-slate-100 border border-slate-400 shadow-sm"
                      defaultValue={char}
                      readOnly
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-600 ">
                  STATION NO
                </div>
                <div className="flex h-10 border border-slate-400 rounded-lg p-2 mx-auto">
                  {user?.station.stationId || "N/A"}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-600">
                  STATION NAME
                </div>
                <div className="h-10 border border-slate-400 p-2 mx-auto flex items-cente font-mono rounded-md">
                  {user?.station.name || "N/A"}
                </div>
              </div>

              <div>
                <div className="font-bold uppercase text-slate-600">YEAR</div>
                <div className="flex mt-1">
                  <div className="w-12 h-10 border border-slate-400 flex items-center justify-center p-2 font-mono rounded-l-md">
                    {filteredYear[0]}
                  </div>
                  <div className="w-12 h-10 border-t border-r border-b border-slate-400 flex items-center justify-center p-2 font-mono rounded-r-md">
                    {filteredYear[1]}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Section */}
          <div className="p-4">
            <div className="text-center font-bold text-xl border-b-2 border-indigo-600 pb-2 mb-4 text-indigo-800">
              METEOROLOGICAL DATA
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                      GG
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800">
                      CI
                    </th>
                    <th
                      colSpan={9}
                      className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 p-1 text-purple-800"
                    >
                      BAR PRESSURE
                    </th>
                    <th
                      colSpan={6}
                      className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 p-1 text-cyan-800"
                    >
                      TEMPERATURE
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                    >
                      Td
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 p-1 text-teal-800"
                    >
                      R.H.
                    </th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                    >
                      SQUALL
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      VV
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    ></th>
                    <th
                      colSpan={3}
                      className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                    >
                      WEATHER
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                    >
                      Actions
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">
                        Time of Observation (GMT)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Indicator</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Attached Thermometer (°C)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Bar As Read (hPa)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Corrected for Index
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Height Difference Correction (hPa)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Station Level Pressure (QFE)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Sea Level Reduction
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Sea Level Pressure (QNH)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">
                        Afternoon Reading
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-purple-50 to-purple-100 text-xs p-1">
                      <div className="h-16 text-purple-800">24-Hour Change</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">Dry Bulb (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">Wet Bulb (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">MAX/MIN (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">Dry Bulb (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">Wet Bulb (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-cyan-50 to-cyan-100 text-xs p-1">
                      <div className="h-16 text-cyan-800">MAX/MIN (°C)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                      <div className="h-16 text-teal-800">
                        Dew Point Temperature (°C)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-teal-50 to-teal-100 text-xs p-1">
                      <div className="h-16 text-teal-800">
                        Relative Humidity (%)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Force (KTS)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Direction (dq)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Time (q1)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">
                        Horizontal Visibility (km)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">
                        Misc. Meteors (Code)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Past W₁</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Past W2</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Present ww</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 text-xs p-1">
                      <div className="h-16 text-gray-800">Edit</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={25} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <span className="ml-3 text-indigo-600 font-medium">
                            Loading data...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={25} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CloudSun size={48} className="text-slate-400 mb-3" />
                          <p className="text-lg font-medium">
                            No meteorological data found
                          </p>
                          <p className="text-sm">
                            Try selecting a different date or station
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, index) => {
                      const time = record.observationTime || "--:--";
                      const humidityClass = getWeatherStatusColor(
                        record.relativeHumidity
                      );

                      return (
                        <tr
                          key={record.id}
                          className="text-center font-mono hover:bg-slate-50 transition-colors"
                        >
                          <td className="border border-slate-300 p-1 font-medium text-indigo-700">
                            {time.split(":")[0] || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.subIndicator || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.alteredThermometer || "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-purple-700">
                            {record.barAsRead || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.correctedForIndex || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.heightDifference || "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-purple-700">
                            {record.stationLevelPressure || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.seaLevelReduction || "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-purple-700">
                            {record.correctedSeaLevelPressure || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.afternoonReading || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.pressureChange24h || "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                            {record.dryBulbAsRead || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.wetBulbAsRead || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.maxMinTempAsRead || "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-cyan-700">
                            {record.dryBulbCorrected || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.wetBulbCorrected || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.maxMinTempCorrected || "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-teal-700">
                            {record.Td || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge
                              variant="outline"
                              className={`${humidityClass} text-white`}
                            >
                              {record.relativeHumidity || "--"}
                            </Badge>
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-amber-700">
                            {record.squallForce || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.squallDirection || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.squallTime || "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-blue-700">
                            {record.horizontalVisibility
                              ? parseInt(record.horizontalVisibility) % 10 === 0
                                ? parseInt(record.horizontalVisibility, 10) / 10
                                : (
                                    parseInt(record.horizontalVisibility, 10) /
                                    10
                                  ).toFixed(1)
                              : "--"}
                          </td>

                          <td className="border border-slate-300 p-1">
                            {record.miscMeteors || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.pastWeatherW1 && record.pastWeatherW2
                              ? `${record.pastWeatherW1}`
                              : "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            {record.pastWeatherW1 && record.pastWeatherW2
                              ? `${record.pastWeatherW2}`
                              : "--"}
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-emerald-700">
                            {record.presentWeatherWW || "--"}
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditClick(record)}
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
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-slate-600">
                  Date:{" "}
                  <span className="font-medium text-slate-800">
                    {format(new Date(selectedDate), "MMMM d, yyyy")}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                >
                  {filteredData.length} record(s)
                </Badge>
                {stationFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                  >
                    Station: {stationFilter}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[50vw] !max-w-[90vw] rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-indigo-800">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Meteorological Data
                </div>
              </DialogTitle>
              <div className="h-1 w-20 rounded-full bg-gradient-to-r from-indigo-400 to-blue-400 mt-2"></div>
            </DialogHeader>

            {selectedRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                {/* Input Fields */}
                {[
                  {
                    id: "observationTime",
                    label: "Observation Time (GMT)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  { id: "c2Indicator", label: "Indicator", bg: "bg-indigo-50" , readOnly: false},
                  {
                    id: "alteredThermometer",
                    label: "Attached Thermometer (°C)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "barAsRead",
                    label: "Bar As Read (hPa)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "correctedForIndex",
                    label: "Corrected for Index",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "heightDifference",
                    label: "Height Difference Correction (hPa)",
                    bg: "bg-indigo-50",
                    readOnly: true,
                  },
                  {
                    id: "stationLevelPressure",
                    label: "Station Level Pressure (QFE)",
                    bg: "bg-blue-50",
                    readOnly: true,
                  },
                  {
                    id: "seaLevelReduction",
                    label: "Sea Level Reduction",
                    bg: "bg-indigo-50",
                    readOnly: true,
                  },
                  {
                    id: "correctedSeaLevelPressure",
                    label: "Sea Level Pressure (QNH)",
                    bg: "bg-blue-50",
                    readOnly: true,
                  },
                  {
                    id: "dryBulbAsRead",
                    label: "Dry Bulb As Read (°C)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "wetBulbAsRead",
                    label: "Wet Bulb As Read (°C)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "maxMinTempAsRead",
                    label: "MAX/MIN Temp As Read (°C)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "dryBulbCorrected",
                    label: "Dry Bulb Corrected (°C)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "wetBulbCorrected",
                    label: "Wet Bulb Corrected (°C)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "Td",
                    label: "Dew Point Temperature (°C)",
                    bg: "bg-blue-50",
                    readOnly: true,
                  },
                  {
                    id: "relativeHumidity",
                    label: "Relative Humidity (%)",
                    bg: "bg-indigo-50",
                    readOnly: true,
                  },
                  {
                    id: "horizontalVisibility",
                    label: "Horizontal Visibility (km)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "presentWeatherWW",
                    label: "Present Weather (ww)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                  {
                    id: "pastWeatherW1",
                    label: "Past Weather (W₁)",
                    bg: "bg-blue-50",
                    readOnly: false,
                  },
                  {
                    id: "pastWeatherW2",
                    label: "Past Weather (W₂)",
                    bg: "bg-indigo-50",
                    readOnly: false,
                  },
                ].map((field) => (
                  <div
                    key={field.id}
                    className={`space-y-1 p-3 rounded-lg ${field.bg} border border-white shadow-sm`}
                  >
                    <Label
                      htmlFor={field.id}
                      className="text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      value={editFormData[field.id] || ""}
                      onChange={handleEditInputChange}
                      readOnly={field.readOnly}
                      className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 read-only:opacity-70 read-only:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add custom CSS for vertical text */}
        <style jsx global>{`
          .writing-vertical {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            text-align: center;
            margin: 0 auto;
            white-space: nowrap;
          }
        `}</style>
      </CardContent>
    </Card>
  );
}
