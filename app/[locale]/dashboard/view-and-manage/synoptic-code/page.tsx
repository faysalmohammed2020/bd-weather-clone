"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Edit, AlertTriangle, Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { differenceInDays, parseISO, isValid, format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface Station {
  id: string;
  stationId: string;
  name: string;
}

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

// Determine if a record can be edited based on user role and time elapsed
const canEditRecord = (record: any, user: any): boolean => {
  if (!user) return false;
  if (!record.createdAt) return true;

  try {
    const submissionDate = parseISO(record.createdAt);
    if (!isValid(submissionDate)) return true;

    const now = new Date();
    const daysDifference = differenceInDays(now, submissionDate);
    const role = user.role;
    const userId = user.id;
    const userStationId = user.station?.id;
    const recordStationId = record.ObservingTime?.stationId;
    const recordUserId = record.ObservingTime?.userId;

    if (role === "super_admin") return daysDifference <= 365;
    if (role === "station_admin") {
      return daysDifference <= 30 && userStationId === recordStationId;
    }
    if (role === "observer") {
      return daysDifference <= 2 && userId === recordUserId;
    }
    return false;
  } catch (e) {
    console.warn("Error in canEditRecord:", e);
    return false;
  }
};

const SynopticCodeTable = forwardRef((props, ref) => {
  const [currentData, setCurrentData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { data: session } = useSession();
  const user = session?.user;
  const isSuperAdmin = user?.role === "super_admin";
  const isStationAdmin = user?.role === "station_admin";
  const [headerInfo, setHeaderInfo] = useState({
    dataType: "SY",
    stationNo: "41953",
    year: "24",
    month: "11",
    day: "03",
  });

  // Filter states
  const today = format(new Date(), "yyyy-MM-dd");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [dateError, setDateError] = useState<string | null>(null);
  const [stationFilter, setStationFilter] = useState("all");
  const [stations, setStations] = useState<Station[]>([]);

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPermissionDeniedOpen, setIsPermissionDeniedOpen] = useState(false);
  const t = useTranslations("SynopticCodeTable");

  // Expose the getData method via ref
  useImperativeHandle(ref, () => ({
    getData: () => {
      return currentData.map(item => ({
        ...item,
        dataType: headerInfo.dataType,
        stationNo: headerInfo.stationNo,
        date: item.ObservingTime?.utcTime || new Date().toISOString()
      }));
    }
  }));

  // Function to fetch the most recent data
  const fetchLatestData = async () => {
    setRefreshing(true);
    try {
      const url = `/api/synoptic-code?startDate=${startDate}&endDate=${endDate}${stationFilter !== "all" ? `&stationId=${stationFilter}` : ""
        }`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(t("errors.fetchFailed"));
      }
      const data = await res.json();

      if (data.length > 0) {
        setCurrentData(data);

        // Extract header info from the first entry if available
        const firstEntry = data[0];
        const observingTime = firstEntry.ObservingTime?.utcTime
          ? new Date(firstEntry.ObservingTime.utcTime)
          : new Date();

        setHeaderInfo({
          dataType: firstEntry.dataType?.substring(0, 2) || "SY",
          stationNo: user?.station?.stationId || "41953",
          year: observingTime.getFullYear().toString().substring(2),
          month: (observingTime.getMonth() + 1).toString().padStart(2, "0"),
          day: observingTime.getDate().toString().padStart(2, "0"),
        });
      } else {
        setCurrentData([]);
      }
    } catch (error) {
      console.error("Failed to fetch latest data:", error);
      toast.error(t("errors.fetchFailed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch stations if super admin
  const fetchStations = async () => {
    if (isSuperAdmin) {
      try {
        const response = await fetch("/api/stations");
        if (!response.ok) {
          throw new Error(t("errors.stationsFetchFailed"));
        }
        const stationsResult = await response.json();
        setStations(stationsResult);
      } catch (error) {
        console.error("Error fetching stations:", error);
        toast.error(t("errors.stationsFetchFailed"));
      }
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchLatestData();
    fetchStations();
  }, [startDate, endDate, stationFilter]);

  // Date navigation functions
  const goToPreviousWeek = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInRange = differenceInDays(end, start);

    // Calculate the new date range
    const newStart = new Date(start);
    newStart.setDate(start.getDate() - (daysInRange + 1));

    const newEnd = new Date(start);
    newEnd.setDate(start.getDate() - 1);

    // Always update the dates when going back
    setStartDate(format(newStart, "yyyy-MM-dd"));
    setEndDate(format(newEnd, "yyyy-MM-dd"));
    setDateError(null);
  };

  const goToNextWeek = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInRange = differenceInDays(end, start);

    // Calculate the new date range
    const newStart = new Date(start);
    newStart.setDate(start.getDate() + (daysInRange + 1));

    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + daysInRange);

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If the new range would go beyond today, adjust it
    if (newEnd > today) {
      // If we're already at or beyond today, don't go further
      if (end >= today) {
        return;
      }
      // Otherwise, set the end to today and adjust the start accordingly
      const adjustedEnd = new Date(today);
      const adjustedStart = new Date(adjustedEnd);
      adjustedStart.setDate(adjustedEnd.getDate() - daysInRange);

      setStartDate(format(adjustedStart, "yyyy-MM-dd"));
      setEndDate(format(adjustedEnd, "yyyy-MM-dd"));
    } else {
      // Update to the new range if it's valid
      setStartDate(format(newStart, "yyyy-MM-dd"));
      setEndDate(format(newEnd, "yyyy-MM-dd"));
    }

    setDateError(null);
  };

  // Handle date changes with validation
  const handleDateChange = (type: "start" | "end", newDate: string) => {
    const date = new Date(newDate);
    const otherDate =
      type === "start" ? new Date(endDate) : new Date(startDate);

    if (isNaN(date.getTime())) {
      setDateError(t("errors.invalidDate"));
      return;
    }

    // Reset error if dates are valid
    setDateError(null);

    if (type === "start") {
      if (date > otherDate) {
        setDateError(t("errors.startAfterEnd"));
        return;
      }
      setStartDate(newDate);
    } else {
      if (date < otherDate) {
        setDateError(t("errors.endBeforeStart"));
        return;
      }
      setEndDate(newDate);
    }
  };

  // Get station name by ID
  const getStationNameById = (stationId: string): string => {
    const station = stations.find((s) => s.id === stationId);
    return station ? station.name : t("unknownStation");
  };

  // Handle edit click
  const handleEditClick = (record: any) => {
    if (user && canEditRecord(record, user)) {
      setSelectedRecord(record);
      setEditFormData(record);
      setIsEditDialogOpen(true);
    } else {
      setIsPermissionDeniedOpen(true);
    }
  };

  // Handle input changes in edit form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditFormData((prev: any) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Save edited data
  const handleSaveEdit = async () => {
    if (!selectedRecord) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/synoptic-code", {
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
        throw new Error(t("errors.updateFailed"));
      }

      const result = await response.json();

      // Update local state
      setCurrentData(prevData =>
        prevData.map(item =>
          item.id === selectedRecord.id ? { ...item, ...editFormData } : item
        )
      );

      toast.success(t("editDialog.saveChanges"));
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error(`${t("errors.updateFailed")}: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to export data as CSV
  const exportToCSV = () => {
    if (!currentData || currentData.length === 0) return;

    // Create headers
    let csvContent =
      "Time,C1,Iliii,iRiXhvv,Nddff,1SnTTT,2SnTdTdTd,3PPP/4PPP,6RRRtR,7wwW1W2,8NhClCmCh,2SnTnTnTn/InInInIn,56DlDmDh,57CDaEc,C2,GG,58P24P24P24/59P24P24P24,(6RRRtR)/7R24R24R24,8N5Ch5h5,90dqqqt,91fqfqfq,Weather Remarks\n";

    // Add data rows
    currentData.forEach((entry) => {
      const observingTime = entry.ObservingTime?.utcTime
        ? new Date(entry.ObservingTime.utcTime)
        : new Date();
      const timeSlot = observingTime.getUTCHours().toString().padStart(2, "0");

      let row = `${timeSlot},`;
      row += `${entry.C1 || ""},`;
      row += `${entry.Iliii || ""},`;
      row += `${entry.iRiXhvv || ""},`;
      row += `${entry.Nddff || ""},`;
      row += `${entry.S1nTTT || ""},`;
      row += `${entry.S2nTddTddTdd || ""},`;
      row += `${entry.P3PPP4PPPP || ""},`;
      row += `${entry.RRRtR6 || ""},`;
      row += `${entry.wwW1W2 || ""},`;
      row += `${entry.NhClCmCh || ""},`;
      row += `${entry.S2nTnTnTnInInInIn || ""},`;
      row += `${entry.D56DLDMDH || ""},`;
      row += `${entry.CD57DaEc || ""},`;
      row += `${entry.avgTotalCloud || ""},`;
      row += `${entry.C2 || ""},`;
      row += `${entry.GG || ""},`;
      row += `${entry.P24Group58_59 || ""},`;
      row += `${entry.R24Group6_7 || ""},`;
      row += `${entry.NsChshs || ""},`;
      row += `${entry.dqqqt90 || ""},`;
      row += `${entry.fqfqfq91 || ""},`;
      row += `"${(entry.weatherRemark || "").replace(/"/g, '""')}"\n`;
      csvContent += row;
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

  return (
    <div className="space-y-6 print:space-y-0 m-2" dir="rtl">

      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center ml-3">
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
        {t("title")}
      </h2>

      {/* Date and station filter controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 bg-slate-100 p-3 sm:p-4 md:p-5 rounded-lg print:hidden">
        {/* Date Navigation Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousWeek}
              className="hover:bg-slate-200 flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                max={endDate}
                className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full sm:w-auto min-w-[120px]"
              />
              <span className="text-sm text-slate-600 whitespace-nowrap">{t("toDate")}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                min={startDate}
                max={format(new Date(), "yyyy-MM-dd")}
                className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full sm:w-auto min-w-[120px]"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextWeek}
              className="hover:bg-slate-200 flex-shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions and Filters Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
          {(isSuperAdmin || isStationAdmin) && (
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-50 w-full sm:w-auto px-3 py-2"
                onClick={exportToCSV}
                disabled={!currentData || currentData.length === 0}
              >
                <Download size={18} className="flex-shrink-0" />
                <span className="text-sm sm:text-base whitespace-nowrap">{t("exportCSV")}</span>
              </Button>
            </div>
          )}

          {isSuperAdmin && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-purple-500 flex-shrink-0" />
                <Label
                  htmlFor="stationFilter"
                  className="whitespace-nowrap font-medium text-slate-700 text-sm sm:text-base"
                >
                  {t("filter")}:
                </Label>
              </div>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] border-slate-300 focus:ring-purple-500 text-sm sm:text-base">
                  <SelectValue placeholder={t("allStations")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStations")}</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name} ({station.stationId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {dateError && (
        <div className="text-red-500 text-sm px-4 print:hidden">{dateError}</div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-700">
            {t("loading")}
          </span>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {t("noData")}
            </h3>
            <p className="text-lg text-gray-600 mb-5">
              {t("noDataDescription")}
            </p>
            <Button
              variant="outline"
              className="bg-white text-blue-700 border-blue-300 hover:bg-blue-50 text-base"
              onClick={fetchLatestData}
            >
              {t("tryAgain")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-auto print:overflow-visible">
          {/* Header Section */}
          <div className="mb-4 print:mb-2">
            <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-4 sm:py-6 print:py-3 rounded-t-lg">
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 print:gap-6 max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-5xl mx-auto px-3 sm:px-4">
                <div className="text-right">
                  <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
                    {t("dataType")}
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    {headerInfo.dataType.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-base sm:text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
                    {t("stationNo")}
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    {headerInfo.stationNo.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-base sm:text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
                    {t("year")}
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    {headerInfo.year.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-base sm:text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
                    {t("month")}
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    {headerInfo.month.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-base sm:text-lg font-bold text-blue-700 rounded"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-sm sm:text-base mb-2 text-gray-600">
                    {t("day")}
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    {headerInfo.day.split("").map((char, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 border-2 border-blue-300 bg-white flex items-center justify-center font-mono text-base sm:text-lg font-bold text-blue-700 rounded"
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
                    {t("time")}
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    {t("date")}
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    {t("station")}
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
                    2SnTnTnTn/1SnTxTxTx
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    56DlDmDh
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    57CDaEc
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
                    {t("weatherRemarks")}
                  </th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">
                    {t("action")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-100 text-center font-mono">
                {currentData && currentData.length > 0 ? (
                  currentData.map((entry, index) => {
                    const observingTime = entry.ObservingTime?.utcTime
                      ? new Date(entry.ObservingTime.utcTime)
                      : null;
                    const timeSlot = observingTime
                      ? observingTime.getUTCHours().toString().padStart(2, "0")
                      : "--";
                    const canEdit = user && canEditRecord(entry, user);

                    return (
                      <tr
                        key={index}
                        className="bg-white hover:bg-blue-50 print:hover:bg-white"
                      >
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
                          {timeSlot}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {new Date(entry.ObservingTime?.utcTime).toLocaleDateString()}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {getStationNameById(entry.ObservingTime?.stationId)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.C1 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.Iliii || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.iRiXhvv || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.Nddff || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.S1nTTT || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.S2nTddTddTdd || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.P3PPP4PPPP || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.RRRtR6 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.wwW1W2 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.NhClCmCh || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.S2nTnTnTnInInInIn || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.D56DLDMDH || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.CD57DaEc || ""}
                        </td>

                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.C2 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.GG || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.P24Group58_59 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.R24Group6_7 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.NsChshs || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.dqqqt90 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {entry.fqfqfq91 || ""}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap text-right text-gray-700">
                          {entry.weatherRemark ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center p-1 shadow-inner">
                                <img
                                  src={entry.weatherRemark.split(" - ")[0]}
                                  alt="Weather Symbol"
                                  className="h-6 w-6 object-contain"
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                {entry.weatherRemark.split(" - ")[1]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">--</span>
                          )}
                        </td>

                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`h-8 w-8 p-0 ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
                                  onClick={() => handleEditClick(entry)}
                                >
                                  <Edit size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {canEdit
                                  ? t("editTooltip")
                                  : t("editPermissionTooltip")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={22} className="text-center py-8 text-gray-500">
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Optional footer */}
            <div className="text-left text-sm text-blue-600 mt-2 pr-4 pb-2 print:hidden">
              {t("generated")}:{" "}
              {new Date().toLocaleString("ar-EG", { timeZone: "Asia/Dhaka" })}
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[90vw] !max-w-[95vw] rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-800">
              {t("editDialog.title")}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              {t("editDialog.description", {
                station: selectedRecord?.ObservingTime?.station?.name || t("unknownStation"),
                date: selectedRecord?.createdAt ? format(new Date(selectedRecord.createdAt), "MMMM d, yyyy") : t("unknownDate")
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
            {Object.entries(t.raw("editDialog.fields")).map(([id, label]) => (
              <div
                key={id}
                className={`space-y-1 p-3 rounded-lg ${id.charCodeAt(0) % 2 === 0 ? "bg-blue-50" : "bg-indigo-50"
                  } border border-white shadow-sm`}
              >
                <Label htmlFor={id} className="text-sm font-medium text-gray-700">
                  {label}
                </Label>
                <Input
                  id={id}
                  value={editFormData[id] || ""}
                  onChange={handleEditInputChange}
                  className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {t("editDialog.cancel")}
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("editDialog.saving")}
                </>
              ) : (
                t("editDialog.saveChanges")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Denied Dialog */}
      <Dialog open={isPermissionDeniedOpen} onOpenChange={setIsPermissionDeniedOpen}>
        <DialogContent className="max-w-md rounded-xl border-0 bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t("permissionDialog.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-700">
              {t("permissionDialog.description")}
            </p>
            <ul className="mt-2 list-disc pr-5 text-sm text-slate-600 space-y-1">
              {Array.isArray(t("permissionDialog.reasons"))
                ? t("permissionDialog.reasons").map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))
                : <li>{t("permissionDialog.reasons")}</li>
              }
            </ul>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsPermissionDeniedOpen(false)}
              className="bg-slate-200 text-slate-800 hover:bg-slate-300"
            >
              {t("permissionDialog.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
});

SynopticCodeTable.displayName = "SynopticCodeTable";

export default SynopticCodeTable;