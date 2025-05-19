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
import { format, parseISO, differenceInDays, isValid } from "date-fns";
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
import type { SecondCardData } from "@/data/second-card-data";

interface SecondCardTableProps {
  refreshTrigger?: number;
}

function canEditObservation(record: SecondCardData, sessionUser: any) {
  if (!sessionUser || !record.metadata["submittedAt"]) return false;

  try {
    const observationDate = parseISO(record.metadata["submittedAt"]);
    if (!isValid(observationDate)) return false;

    const now = new Date();
    const daysDifference = differenceInDays(now, observationDate);

    const role = sessionUser.role;
    const userId = sessionUser.id;
    const stationId = sessionUser.stationId;
    const recordStationId = record.metadata.stationId;

    if (role === "super_admin") return daysDifference <= 365;
    if (role === "station_admin")
      return (
        daysDifference <= 30 &&
        stationId &&
        recordStationId &&
        stationId === recordStationId
      );
    if (role === "observer")
      return (
        daysDifference <= 2 &&
        userId &&
        record.observer?.id &&
        userId === record.observer.id
      );

    return false;
  } catch (e) {
    console.warn("Error in canEditObservation:", e);
    return false;
  }
}

export function SecondCardTable({ refreshTrigger = 0 }: SecondCardTableProps) {
  const [data, setData] = useState<SecondCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [stationFilter, setStationFilter] = useState("all");
  const [stations, setStations] = useState<
    { id: string; stationId: string; name: string }[]
  >([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SecondCardData | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<Partial<SecondCardData>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch weather observations
      const obsResponse = await fetch("/api/save-observation");
      if (!obsResponse.ok) {
        throw new Error("Failed to fetch observation data");
      }
      const obsResult = await obsResponse.json();
      setData(obsResult);

      // Fetch stations from the database
      const stationsResponse = await fetch("/api/stations");
      if (!stationsResponse.ok) {
        throw new Error("Failed to fetch stations");
      }
      const stationsResult = await stationsResponse.json();
      setStations(stationsResult);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch weather observation data");
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
    if (!item.metadata.submittedAt) return false;

    try {
      const parsedDate = parseISO(item.metadata.submittedAt);
      if (!isValid(parsedDate)) return false;

      const itemDate = format(parsedDate, "yyyy-MM-dd");
      const matchesDate = itemDate === selectedDate;
      const matchesStation =
        stationFilter === "all" || item.metadata.stationId === stationFilter;

      return matchesDate && matchesStation;
    } catch (e) {
      console.warn("Error parsing date:", e);
      return false;
    }
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
      "Observation Time",
      "Submission Time",
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
      "Layer 1 Height",
      "Layer 1 Form",
      "Layer 1 Amount",
      "Layer 2 Height",
      "Layer 2 Form",
      "Layer 2 Amount",
      "Layer 3 Height",
      "Layer 3 Form",
      "Layer 3 Amount",
      "Layer 4 Height",
      "Layer 4 Form",
      "Layer 4 Amount",
      "Rainfall Start",
      "Rainfall End",
      "Rainfall Since Previous",
      "Rainfall During Previous",
      "Rainfall Last 24h",
      "Wind First Anemometer",
      "Wind Second Anemometer",
      "Wind Speed",
      "Wind Direction",
      "Observer",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredData.map((item) => {
        let obsTime = "N/A";
        let subTime = "N/A";

        try {
          if (item.observer["observation-time"]) {
            const parsedDate = parseISO(item.observer["observation-time"]);
            if (isValid(parsedDate)) {
              obsTime = format(parsedDate, "yyyy-MM-dd HH:mm");
            }
          }

          if (item.metadata.submittedAt) {
            const parsedSubmitDate = parseISO(item.metadata.submittedAt);
            if (isValid(parsedSubmitDate)) {
              subTime = format(parsedSubmitDate, "yyyy-MM-dd HH:mm");
            }
          }
        } catch (e) {
          console.warn("Error formatting time for CSV:", e);
        }

        const totalCloudAmount =
          item.totalCloud?.["total-cloud-amount"] || "N/A";

        return [
          obsTime,
          subTime,
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
          item.significantClouds.layer1.height || "N/A",
          item.significantClouds.layer1.form || "N/A",
          item.significantClouds.layer1.amount || "N/A",
          item.significantClouds.layer2.height || "N/A",
          item.significantClouds.layer2.form || "N/A",
          item.significantClouds.layer2.amount || "N/A",
          item.significantClouds.layer3.height || "N/A",
          item.significantClouds.layer3.form || "N/A",
          item.significantClouds.layer3.amount || "N/A",
          item.significantClouds.layer4.height || "N/A",
          item.significantClouds.layer4.form || "N/A",
          item.significantClouds.layer4.amount || "N/A",
          item.rainfall["time-start"] || "N/A",
          item.rainfall["time-end"] || "N/A",
          item.rainfall["since-previous"] || "N/A",
          item.rainfall["during-previous"] || "N/A",
          item.rainfall["last-24-hours"] || "N/A",
          item.wind["first-anemometer"] || "N/A",
          item.wind["second-anemometer"] || "N/A",
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
    link.setAttribute("download", `weather-observations-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get cloud status color based on total cloud amount
  const getCloudStatusColor = (amount: string) => {
    if (!amount || amount === "--") return "bg-gray-400";
    const cloudAmount = Number.parseInt(amount);
    if (isNaN(cloudAmount)) return "bg-gray-400";

    if (cloudAmount >= 8) return "bg-blue-500";
    if (cloudAmount >= 6) return "bg-blue-400";
    if (cloudAmount >= 4) return "bg-blue-300";
    if (cloudAmount >= 2) return "bg-blue-200";
    return "bg-blue-100";
  };

  // Handle opening the edit dialog
  const handleEditClick = (record: SecondCardData) => {
    setSelectedRecord(record);
    setEditFormData({ ...record });
    setIsEditDialogOpen(true);
  };

  // Handle input changes in the edit form
  const handleEditInputChange = (
    section: keyof SecondCardData,
    field: string,
    value: string
  ) => {
    setEditFormData((prev) => {
      // Handle nested fields with dot notation (e.g., "low.form")
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [parent]: {
              ...((prev[section] as any)?.[parent] || {}),
              [child]: value,
            },
          },
        };
      }

      // Handle regular fields
      return {
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        },
      };
    });
  };

  // Save the edited record
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/save-observation", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedRecord.metadata.id,
          ...editFormData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update record");
      }

      // Update the data in the local state
      setData((prevData) =>
        prevData.map((item) =>
          item.metadata.id === selectedRecord.metadata.id
            ? { ...item, ...editFormData }
            : item
        )
      );

      toast.success("Weather observation updated successfully");

      // Close the dialog
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update weather observation");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">

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
              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-sky-500" />
              <Input
                type="date"
                className="pl-8 w-40 border-slate-300 focus:border-sky-500 focus:ring-sky-500"
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
            <Filter size={16} className="text-sky-500" />
            <Label
              htmlFor="stationFilter"
              className="whitespace-nowrap font-medium text-slate-700"
            >
              Station:
            </Label>
            <Select value={stationFilter} onValueChange={setStationFilter}>
              <SelectTrigger className="w-[200px] border-slate-300 focus:ring-sky-500">
                <SelectValue placeholder="All Stations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.stationId}>
                    {station.name} ({station.stationId})
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
                  {["W", "O"].map((char, i) => (
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
                <div className="font-bold uppercase text-slate-600">DATE</div>
                <div className="h-10 border border-slate-400 p-2 mx-auto flex items-center justify-center font-mono rounded-md">
                  {format(new Date(selectedDate), "dd/MM/yyyy")}
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Section */}
          <div className="p-4">
            <div className="text-center font-bold text-xl border-b-2 border-sky-600 pb-2 mb-4 text-sky-800">
              WEATHER OBSERVATION DATA
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800">
                      TIME
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800">
                      STATION
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800">
                      TOTAL CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      LOW CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      MEDIUM CLOUD
                    </th>
                    <th
                      colSpan={4}
                      className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 p-1 text-blue-800"
                    >
                      HIGH CLOUD
                    </th>
                    <th
                      colSpan={12}
                      className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 p-1 text-indigo-800"
                    >
                      SIGNIFICANT CLOUD
                    </th>
                    <th
                      colSpan={5}
                      className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 p-1 text-emerald-800"
                    >
                      RAINFALL
                    </th>
                    <th
                      colSpan={5}
                      className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 p-1 text-amber-800"
                    >
                      WIND
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                    >
                      OBSERVER
                    </th>
                    <th
                      colSpan={1}
                      className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 p-1 text-gray-800"
                    >
                      ACTIONS
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">
                        Time of Observation (GMT)
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">Station ID</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">Amount (N)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Height (H)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Form (CL)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Amount</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Height (H)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Form (CM)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Amount</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Height (H)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Form (CH)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-blue-50 to-blue-100 text-xs p-1">
                      <div className="h-16 text-blue-800">Amount</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Height 1</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Form 1</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Amount 1</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Height 2</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Form 2</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Amount 2</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Height 3</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Form 3</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Amount 3</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Height 4</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Form 4</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-indigo-50 to-indigo-100 text-xs p-1">
                      <div className="h-16 text-indigo-800">Amount 4</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Start Time</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">End Time</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">
                        Since Previous
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">
                        During Previous
                      </div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">Last 24 Hours</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">1st Anemometer</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">2nd Anemometer</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Speed</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Wind Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-amber-50 to-amber-100 text-xs p-1">
                      <div className="h-16 text-amber-800">Direction</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 text-xs p-1">
                      <div className="h-16 text-gray-800">Initial</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-gray-50 to-gray-100 text-xs p-1">
                      <div className="h-16 text-gray-800">Edit</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={38} className="text-center py-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                          <span className="ml-3 text-sky-600 font-medium">
                            Loading data...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={38} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CloudSun size={48} className="text-slate-400 mb-3" />
                          <p className="text-lg font-medium">
                            No weather observations found
                          </p>
                          <p className="text-sm">
                            Try selecting a different date or station
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, index) => {
                      const totalCloudAmount =
                        record.totalCloud?.["total-cloud-amount"] || "--";
                      const cloudClass = getCloudStatusColor(totalCloudAmount);
                      const rowClass =
                        index % 2 === 0 ? "bg-white" : "bg-slate-50";

                      return (
                        <tr
                          key={record.metadata.id || index}
                          className={`text-center font-mono hover:bg-blue-50 transition-colors ${rowClass}`}
                        >
                          <td className="border border-slate-300 p-1 font-medium text-sky-700">
                            <div className="flex flex-col">
                              <span>{record.observer["observation-time"]}</span>
                              {/* <span className="text-[10px] text-gray-500">
                                Sub: {record.metadata.submittedAt}
                              </span> */}
                            </div>
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className="font-mono">
                              {record.metadata.stationId || "--"}
                            </Badge>
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge
                              variant="outline"
                              className={`${cloudClass} text-white`}
                            >
                              {totalCloudAmount}
                            </Badge>
                          </td>

                          {/* Low Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.low.direction ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.low.direction || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.low.height ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.low.height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.low.form ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.low.form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.low.amount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.low.amount || "--"}
                          </td>

                          {/* Medium Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.medium.direction ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.medium.direction || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.medium.height ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.medium.height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.medium.form ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.medium.form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.medium.amount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.medium.amount || "--"}
                          </td>

                          {/* High Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.high.direction ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.high.direction || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.high.height ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.high.height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.high.form ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.high.form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.clouds.high.amount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {record.clouds.high.amount || "--"}
                          </td>

                          {/* Significant Clouds */}
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer1.height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer1.height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer1.form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer1.form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer1.amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer1.amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer2.height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer2.height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer2.form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer2.form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer2.amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer2.amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer3.height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer3.height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer3.form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer3.form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer3.amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer3.amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer4.height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer4.height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer4.form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer4.form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.significantClouds.layer4.amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {record.significantClouds.layer4.amount || "--"}
                          </td>

                          {/* Rainfall */}
                          <td
                            className={`border border-slate-300 p-1 ${record.rainfall["time-start"] ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {record.rainfall["time-start"] || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.rainfall["time-end"] ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {record.rainfall["time-end"] || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.rainfall["since-previous"] ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {record.rainfall["since-previous"] || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.rainfall["during-previous"] ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {record.rainfall["during-previous"] || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.rainfall["last-24-hours"] ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {record.rainfall["last-24-hours"] || "--"}
                          </td>

                          {/* Wind */}
                          <td
                            className={`border border-slate-300 p-1 ${record.wind["first-anemometer"] ? "text-amber-700 font-medium" : ""}`}
                          >
                            {record.wind["first-anemometer"] || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.wind["second-anemometer"] ? "text-amber-700 font-medium" : ""}`}
                          >
                            {record.wind["second-anemometer"] || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.wind.speed ? "text-amber-700 font-medium" : ""}`}
                          >
                            {record.wind.speed || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.wind["wind-direction"] ? "text-amber-700 font-medium" : ""}`}
                          >
                            {record.wind["wind-direction"] || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${record.wind.direction ? "text-amber-700 font-medium" : ""}`}
                          >
                            {record.wind.direction || "--"}
                          </td>

                          {/* Observer */}
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className="bg-gray-100">
                              {record.observer["observer-initial"] || "--"}
                            </Badge>
                          </td>

                          {/* Edit Button */}
                          <td className="border border-slate-300 p-1">
                            {canEditObservation(record, session?.user) ? (
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
                            ) : (
                              <span className="text-gray-400">--</span>
                            )}
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
                <Calendar className="h-4 w-4 text-sky-500" />
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
                  className="bg-sky-100 text-sky-800 hover:bg-sky-200"
                >
                  {filteredData.length} record(s)
                </Badge>
                {stationFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
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
          <DialogContent className="w-[50vw] !max-w-[90vw] rounded-xl border-0 bg-gradient-to-br from-sky-50 to-blue-50 p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-sky-800">
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
                  Edit Weather Observation
                </div>
              </DialogTitle>
              <div className="h-1 w-20 rounded-full bg-gradient-to-r from-sky-400 to-blue-400 mt-2"></div>
            </DialogHeader>

            {selectedRecord && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                {/* Total Cloud */}
                <div className="space-y-1 p-3 rounded-lg bg-sky-50 border border-white shadow-sm">
                  <Label
                    htmlFor="totalCloudAmount"
                    className="text-sm font-medium text-gray-700"
                  >
                    Total Cloud Amount
                  </Label>
                  <Input
                    id="totalCloudAmount"
                    value={
                      (editFormData.totalCloud?.[
                        "total-cloud-amount"
                      ] as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "totalCloud",
                        "total-cloud-amount",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                {/* Low Cloud */}
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Low Cloud Direction
                  </Label>
                  <Input
                    value={
                      (editFormData.clouds?.low?.direction as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "low.direction",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Low Cloud Height
                  </Label>
                  <Input
                    value={(editFormData.clouds?.low?.height as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "low.height",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Low Cloud Form
                  </Label>
                  <Input
                    value={(editFormData.clouds?.low?.form as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "low.form",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Low Cloud Amount
                  </Label>
                  <Input
                    value={(editFormData.clouds?.low?.amount as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "low.amount",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Medium Cloud */}
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Medium Cloud Direction
                  </Label>
                  <Input
                    value={
                      (editFormData.clouds?.medium?.direction as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "medium.direction",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Medium Cloud Height
                  </Label>
                  <Input
                    value={
                      (editFormData.clouds?.medium?.height as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "medium.height",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Medium Cloud Form
                  </Label>
                  <Input
                    value={(editFormData.clouds?.medium?.form as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "medium.form",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Medium Cloud Amount
                  </Label>
                  <Input
                    value={
                      (editFormData.clouds?.medium?.amount as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "medium.amount",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* High Cloud */}
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    High Cloud Direction
                  </Label>
                  <Input
                    value={
                      (editFormData.clouds?.high?.direction as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "high.direction",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    High Cloud Height
                  </Label>
                  <Input
                    value={(editFormData.clouds?.high?.height as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "high.height",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    High Cloud Form
                  </Label>
                  <Input
                    value={(editFormData.clouds?.high?.form as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "high.form",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    High Cloud Amount
                  </Label>
                  <Input
                    value={(editFormData.clouds?.high?.amount as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange(
                        "clouds",
                        "high.amount",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Rainfall */}
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Rainfall Start Time
                  </Label>
                  <Input
                    value={
                      (editFormData.rainfall?.["time-start"] as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "rainfall",
                        "time-start",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Rainfall End Time
                  </Label>
                  <Input
                    value={
                      (editFormData.rainfall?.["time-end"] as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "rainfall",
                        "time-end",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Rainfall Since Previous
                  </Label>
                  <Input
                    value={
                      (editFormData.rainfall?.["since-previous"] as string) ??
                      ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "rainfall",
                        "since-previous",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Rainfall During Previous
                  </Label>
                  <Input
                    value={
                      (editFormData.rainfall?.["during-previous"] as string) ??
                      ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "rainfall",
                        "during-previous",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Rainfall Last 24 Hours
                  </Label>
                  <Input
                    value={
                      (editFormData.rainfall?.["last-24-hours"] as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "rainfall",
                        "last-24-hours",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                {/* Wind */}
                <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    First Anemometer
                  </Label>
                  <Input
                    value={
                      (editFormData.wind?.["first-anemometer"] as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "wind",
                        "first-anemometer",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Second Anemometer
                  </Label>
                  <Input
                    value={
                      (editFormData.wind?.["second-anemometer"] as string) ?? ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "wind",
                        "second-anemometer",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Wind Speed
                  </Label>
                  <Input
                    value={(editFormData.wind?.speed as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange("wind", "speed", e.target.value)
                    }
                    className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Wind Direction
                  </Label>
                  <Input
                    value={(editFormData.wind?.direction as string) ?? ""}
                    onChange={(e) =>
                      handleEditInputChange("wind", "direction", e.target.value)
                    }
                    className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  />
                </div>

                {/* Observer */}
                <div className="space-y-1 p-3 rounded-lg bg-gray-50 border border-white shadow-sm">
                  <Label className="text-sm font-medium text-gray-700">
                    Observer Initial
                  </Label>
                  <Input
                    value={
                      (editFormData.observer?.["observer-initial"] as string) ??
                      ""
                    }
                    onChange={(e) =>
                      handleEditInputChange(
                        "observer",
                        "observer-initial",
                        e.target.value
                      )
                    }
                    className="w-full bg-white border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                  />
                </div>
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
                className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-md transition-all"
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
      </CardContent>
    </Card>
  );
}
