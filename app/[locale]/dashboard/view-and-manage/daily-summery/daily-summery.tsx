"use client"

import type React from "react"
import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Download,
  Edit,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  LineChart,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { differenceInDays, parseISO, isValid, format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

interface Station {
  id: string
  stationId: string
  name: string
}

// Determine if a record can be edited based on user role and time elapsed
const canEditRecord = (record: any, user: any): boolean => {
  if (!user) return false
  if (!record.createdAt) return true

  try {
    const submissionDate = parseISO(record.createdAt)
    if (!isValid(submissionDate)) return true

    const now = new Date()
    const daysDifference = differenceInDays(now, submissionDate)
    const role = user.role
    const userId = user.id
    const userStationId = user.station?.id
    const recordStationId = record.ObservingTime?.stationId
    const recordUserId = record.ObservingTime?.userId

    if (role === "super_admin") return daysDifference <= 365
    if (role === "station_admin") {
      return daysDifference <= 30 && userStationId === recordStationId
    }
    if (role === "observer") {
      return daysDifference <= 2 && userId === recordUserId
    }
    return false
  } catch (e) {
    console.warn("Error in canEditRecord:", e)
    return false
  }
}

const DailySummaryTable = forwardRef((props, ref) => {
  const t = useTranslations("DailySummaryTable")
  const [currentData, setCurrentData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const { data: session } = useSession()
  const user = session?.user
  const isSuperAdmin = user?.role === "super_admin"
  const isStationAdmin = user?.role === "station_admin"
  const [headerInfo, setHeaderInfo] = useState({
    dataType: "SY",
    stationNo: "41953",
    year: "24",
    month: "11",
    day: "03",
  })

  // Filter states
  const today = format(new Date(), "yyyy-MM-dd")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [dateError, setDateError] = useState<string | null>(null)
  const [stationFilter, setStationFilter] = useState("all")
  const [stations, setStations] = useState<Station[]>([])

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPermissionDeniedOpen, setIsPermissionDeniedOpen] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Field validations
  const fieldValidations = {
    avStationPressure: { length: 5 },
    avSeaLevelPressure: { length: 5 },
    avDryBulbTemperature: { length: 3 },
    avWetBulbTemperature: { length: 3 },
    maxTemperature: { length: 3 },
    minTemperature: { length: 3 },
    totalPrecipitation: { length: 3 },
    avDewPointTemperature: { length: 3 },
    avRelativeHumidity: { length: 3 },
    windSpeed: { length: 3 },
    windDirectionCode: { length: 2 },
    maxWindSpeed: { length: 3 },
    maxWindDirection: { length: 2 },
    avTotalCloud: { length: 1 },
    lowestVisibility: { length: 3 },
    totalRainDuration: { length: 4 },
  }

  // Form fields configuration
  const formFields = [
    { id: "avStationPressure", bg: "bg-blue-50" },
    { id: "avSeaLevelPressure", bg: "bg-indigo-50" },
    { id: "avDryBulbTemperature", bg: "bg-blue-50" },
    { id: "avWetBulbTemperature", bg: "bg-indigo-50" },
    { id: "maxTemperature", bg: "bg-blue-50" },
    { id: "minTemperature", bg: "bg-indigo-50" },
    { id: "totalPrecipitation", bg: "bg-blue-50" },
    { id: "avDewPointTemperature", bg: "bg-indigo-50" },
    { id: "avRelativeHumidity", bg: "bg-blue-50" },
    { id: "windSpeed", bg: "bg-indigo-50" },
    { id: "windDirectionCode", bg: "bg-blue-50" },
    { id: "maxWindSpeed", bg: "bg-indigo-50" },
    { id: "maxWindDirection", bg: "bg-blue-50" },
    { id: "avTotalCloud", bg: "bg-indigo-50" },
    { id: "lowestVisibility", bg: "bg-blue-50" },
    { id: "totalRainDuration", bg: "bg-indigo-50" },
  ]

  // Expose the getData method via ref
  useImperativeHandle(ref, () => ({
    getData: () => {
      return currentData.map(item => ({
        ...item,
        dataType: headerInfo.dataType,
        stationNo: headerInfo.stationNo,
        date: item.ObservingTime?.utcTime || new Date().toISOString(),
      }))
    },
  }))

  // Function to fetch the most recent data
  const fetchLatestData = async () => {
    setRefreshing(true)
    try {
      const url = `/api/daily-summary?startDate=${startDate}&endDate=${endDate}${stationFilter !== "all" ? `&stationId=${stationFilter}` : ""
        }`
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(t("errors.fetchFailed"))
      }
      const data = await res.json()

      if (data.length > 0) {
        setCurrentData(data)

        // Extract header info from the first entry if available
        const firstEntry = data[0]
        const observingTime = firstEntry.ObservingTime?.utcTime
          ? new Date(firstEntry.ObservingTime.utcTime)
          : new Date()

        setHeaderInfo({
          dataType: firstEntry.dataType?.substring(0, 2) || "SY",
          stationNo: user?.station?.stationId || "41953",
          year: observingTime.getFullYear().toString().substring(2),
          month: (observingTime.getMonth() + 1).toString().padStart(2, "0"),
          day: observingTime.getDate().toString().padStart(2, "0"),
        })
      } else {
        setCurrentData([])
      }
    } catch (error) {
      console.error("Failed to fetch latest data:", error)
      toast.error(t("errors.fetchFailed"))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Fetch stations if super admin
  const fetchStations = async () => {
    if (isSuperAdmin) {
      try {
        const response = await fetch("/api/stations")
        if (!response.ok) {
          throw new Error(t("errors.stationsFetchFailed"))
        }
        const stationsResult = await response.json()
        setStations(stationsResult)
      } catch (error) {
        console.error("Error fetching stations:", error)
        toast.error(t("errors.stationsFetchFailed"))
      }
    }
  }

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchLatestData()
    fetchStations()
  }, [startDate, endDate, stationFilter])

  // Date navigation functions
  const goToPreviousWeek = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysInRange = differenceInDays(end, start)

    // Calculate the new date range
    const newStart = new Date(start)
    newStart.setDate(start.getDate() - (daysInRange + 1))

    const newEnd = new Date(start)
    newEnd.setDate(start.getDate() - 1)

    // Always update the dates when going back
    setStartDate(format(newStart, "yyyy-MM-dd"))
    setEndDate(format(newEnd, "yyyy-MM-dd"))
    setDateError(null)
  }

  const goToNextWeek = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysInRange = differenceInDays(end, start)

    // Calculate the new date range
    const newStart = new Date(start)
    newStart.setDate(start.getDate() + (daysInRange + 1))

    const newEnd = new Date(newStart)
    newEnd.setDate(newStart.getDate() + daysInRange)

    // Get today's date at midnight for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // If the new range would go beyond today, adjust it
    if (newEnd > today) {
      // If we're already at or beyond today, don't go further
      if (end >= today) {
        return
      }
      // Otherwise, set the end to today and adjust the start accordingly
      const adjustedEnd = new Date(today)
      const adjustedStart = new Date(adjustedEnd)
      adjustedStart.setDate(adjustedEnd.getDate() - daysInRange)

      setStartDate(format(adjustedStart, "yyyy-MM-dd"))
      setEndDate(format(adjustedEnd, "yyyy-MM-dd"))
    } else {
      // Update to the new range if it's valid
      setStartDate(format(newStart, "yyyy-MM-dd"))
      setEndDate(format(newEnd, "yyyy-MM-dd"))
    }

    setDateError(null)
  }

  // Handle date changes with validation
  const handleDateChange = (type: "start" | "end", newDate: string) => {
    const date = new Date(newDate)
    const otherDate = type === "start" ? new Date(endDate) : new Date(startDate)

    if (isNaN(date.getTime())) {
      setDateError(t("errors.invalidDate"))
      return
    }

    // Reset error if dates are valid
    setDateError(null)

    if (type === "start") {
      if (date > otherDate) {
        setDateError(t("errors.startAfterEnd"))
        return
      }
      setStartDate(newDate)
    } else {
      if (date < otherDate) {
        setDateError(t("errors.endBeforeStart"))
        return
      }
      setEndDate(newDate)
    }
  }

  // Get station name by ID
  const getStationNameById = (stationId: string): string => {
    const station = stations.find((s) => s.id === stationId)
    return station ? station.name : t("unknownStation")
  }

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    let isValid = true

    formFields.forEach((field) => {
      const value = editFormData[field.id] || ""
      const validation = fieldValidations[field.id as keyof typeof fieldValidations]

      if (value.length === 0) {
        errors[field.id] = t("editDialog.validation.required")
        isValid = false
      } else if (value.length !== validation.length) {
        errors[field.id] = t("editDialog.validation.exactLength", {
          length: validation.length,
          current: value.length
        })
        isValid = false
      }
    })

    setFieldErrors(errors)
    return isValid
  }

  // Save edited data
  const handleSaveEdit = async () => {
    if (!selectedRecord) return

    // Validate form before saving
    if (!validateForm()) {
      toast.error(t("errors.validationErrors"))
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/daily-summary", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedRecord.id,
          ...editFormData,
        }),
      })

      if (!response.ok) {
        throw new Error(t("errors.updateFailed"))
      }

      // Update local state
      setCurrentData((prevData) =>
        prevData.map((item) => (item.id === selectedRecord.id ? { ...item, ...editFormData } : item)),
      )

      toast.success(t("editDialog.saveChanges"))
      setIsEditDialogOpen(false)
      setFieldErrors({}) // Clear errors on successful save
    } catch (error) {
      console.error("Error updating record:", error)
      toast.error(`${t("errors.updateFailed")}: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-"
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (!isNaN(numValue)) {
      return Math.round(numValue).toString()
    }
    return value || "-"
  }

  // Function to export data as CSV
  const exportToCSV = () => {
    if (!currentData || currentData.length === 0) return

    // Create headers
    let csvContent =
      "Date,Station,Av Station Pressure,Av Sea-Level Pressure,Av Dry-Bulb Temperature,Av Wet Bulb Temperature,Max Temperature,Min Temperature,Total Precipitation,Av Dew Point Temperature,Av Relative Humidity,Wind Speed,Wind Direction,Max Wind Speed,Max Wind Direction,Av Total Cloud,Lowest Visibility,Total Rain Duration\n"

    // Add data rows
    currentData.forEach((entry) => {
      const observingTime = entry.ObservingTime?.utcTime ? new Date(entry.ObservingTime.utcTime) : new Date()
      const dateStr = observingTime.toLocaleDateString()

      let row = `${dateStr},`
      row += `${entry.ObservingTime?.station?.name || ""},`
      row += `${entry.avStationPressure || ""},`
      row += `${entry.avSeaLevelPressure || ""},`
      row += `${entry.avDryBulbTemperature || ""},`
      row += `${entry.avWetBulbTemperature || ""},`
      row += `${entry.maxTemperature || ""},`
      row += `${entry.minTemperature || ""},`
      row += `${entry.totalPrecipitation || ""},`
      row += `${entry.avDewPointTemperature || ""},`
      row += `${entry.avRelativeHumidity || ""},`
      row += `${entry.windSpeed || ""},`
      row += `${entry.windDirectionCode || ""},`
      row += `${entry.maxWindSpeed || ""},`
      row += `${entry.maxWindDirection || ""},`
      row += `${entry.avTotalCloud || ""},`
      row += `${entry.lowestVisibility || ""},`
      row += `${entry.totalRainDuration || ""}\n`
      csvContent += row
    })

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `daily_summary_${headerInfo.year}${headerInfo.month}${headerInfo.day}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 print:space-y-0" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm ml-3">
            <LineChart size={20} />
          </span>
          {t("title")}
        </h2>
      </div>

      {/* Responsive Date and Station Filter Controls */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 bg-slate-100 p-3 sm:p-4 rounded-lg print:hidden">
        {/* Top Row - Date Navigation */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousWeek}
              className="hover:bg-slate-200 flex-shrink-0 h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 flex flex-col md:flex-row items-center gap-2 min-w-0">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange("start", e.target.value)}
                max={endDate}
                className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full"
              />
              <span className="text-sm text-slate-600 whitespace-nowrap px-1">{t("toDate")}</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange("end", e.target.value)}
                min={startDate}
                max={format(new Date(), "yyyy-MM-dd")}
                className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextWeek}
              className="hover:bg-slate-200 flex-shrink-0 h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Row - Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
          {/* Export Button - Only for admins */}
          {(isSuperAdmin || isStationAdmin) && (
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 hover:bg-blue-50 border-blue-300 text-blue-700 w-full sm:w-auto"
              disabled={!currentData || currentData.length === 0}
            >
              <Download className="h-4 w-4" />
              <span className="whitespace-nowrap text-xs sm:text-sm">{t("exportCSV")}</span>
            </Button>
          )}

          {/* Station Filter - Only for super admin */}
          {isSuperAdmin && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-purple-500 flex-shrink-0" />
                <Label
                  htmlFor="stationFilter"
                  className="whitespace-nowrap font-medium text-slate-700 text-xs md:text-sm"
                >
                  {t("filter")}:
                </Label>
              </div>
              <Select value={stationFilter} onValueChange={setStationFilter}>
                <SelectTrigger className="w-full md:w-[180px] border-slate-300 focus:ring-purple-500 text-xs md:text-sm h-9">
                  <SelectValue placeholder={t("allStations")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStations")}</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      <span className="block truncate text-xs md:text-sm">
                        {station.name} ({station.stationId})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {dateError && <div className="text-red-500 text-sm px-4 print:hidden">{dateError}</div>}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="ml-3 text-lg text-gray-700">{t("loading")}</span>
        </div>
      ) : !currentData || currentData.length === 0 ? (
        <div className="flex justify-center items-center h-64 bg-blue-50/50 rounded-lg border-2 border-dashed border-blue-200">
          <div className="text-center p-8">
            <LineChart className="mx-auto mb-5 text-blue-400" size={56} />
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t("noData")}</h3>
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
            <div className="text-center border-b-2 border-blue-200 bg-gradient-to-b from-blue-50 to-white py-6 print:py-3 rounded-t-lg">
              <div className="flex flex-wrap justify-center gap-10 print:gap-6 max-w-5xl mx-auto">
                <div className="text-right">
                  <div className="font-bold text-base mb-2 text-gray-600">{t("dataType")}</div>
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

                <div className="text-right">
                  <div className="font-bold text-base mb-2 text-gray-600">{t("stationNo")}</div>
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

                <div className="text-right">
                  <div className="font-bold text-base mb-2 text-gray-600">{t("year")}</div>
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

                <div className="text-right">
                  <div className="font-bold text-base mb-2 text-gray-600">{t("month")}</div>
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

                <div className="text-right">
                  <div className="font-bold text-base mb-2 text-gray-600">{t("day")}</div>
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
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("date")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("station")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.avStationPressure")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.avSeaLevelPressure")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.avDryBulbTemperature")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.avWetBulbTemperature")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.maxTemperature")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.minTemperature")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.totalPrecipitation")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.avDewPointTemperature")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.avRelativeHumidity")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.windSpeed")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.windDirectionCode")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.maxWindSpeed")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.maxWindDirection")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.avTotalCloud")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.lowestVisibility")}</th>
                  <th className="border border-blue-300 px-4 py-3 whitespace-nowrap">{t("editDialog.fields.totalRainDuration")}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-100 text-center font-mono">
                {currentData && currentData.length > 0 ? (
                  currentData.map((entry, index) => {
                    const observingTime = entry.ObservingTime?.utcTime ? new Date(entry.ObservingTime.utcTime) : null

                    return (
                      <tr key={index} className="bg-white hover:bg-blue-50 print:hover:bg-white">
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap font-semibold text-blue-700">
                          {observingTime ? observingTime.toLocaleDateString() : "--"}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {getStationNameById(entry.ObservingTime.station.name)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.avStationPressure)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.avSeaLevelPressure)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.avDryBulbTemperature)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.avWetBulbTemperature)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.maxTemperature)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.minTemperature)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.totalPrecipitation)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.avDewPointTemperature)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.avRelativeHumidity)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.windSpeed)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.windDirectionCode)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.maxWindSpeed)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.maxWindDirection)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.avTotalCloud)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.lowestVisibility)}
                        </td>
                        <td className="border border-blue-200 px-4 py-3 whitespace-nowrap">
                          {formatValue(entry.totalRainDuration)}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={19} className="text-center py-8 text-gray-500">
                      {t("noData")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Optional footer */}
            <div className="text-left text-sm text-blue-600 mt-2 pr-4 pb-2 print:hidden">
              {t("generated")}: {new Date().toLocaleString("ar-EG", { timeZone: "Asia/Dhaka" })}
            </div>
          </div>
        </div>
      )}

      {/* Summary footer */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 print:hidden">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-sky-500" />
          <span className="text-sm text-slate-600">
            {t("dateRange")}:{" "}
            <span className="font-semibold text-slate-800">
              {`${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d, yyyy")}`}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-sky-100 text-sky-800 hover:bg-sky-200">
            {currentData.length} {t("records")}
          </Badge>
          {stationFilter !== "all" && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {t("station")}: {getStationNameById(stationFilter)}
            </Badge>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[50vw] !max-w-[90vw] rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-indigo-800">{t("editDialog.title")}</DialogTitle>
            <DialogDescription className="text-slate-600">
              {t("editDialog.description", {
                station: selectedRecord?.ObservingTime?.station?.name || t("unknownStation"),
                date: selectedRecord?.createdAt ? format(new Date(selectedRecord.createdAt), "MMMM d, yyyy") : t("unknownDate")
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
            {formFields.map((field) => {
              const validation = fieldValidations[field.id as keyof typeof fieldValidations]
              const error = fieldErrors[field.id]
              const hasError = !!error
              const value = editFormData[field.id] || ""
              const displayValue = typeof value === 'number' ? Math.floor(value).toString() : value.replace(/\./g, '')

              return (
                <div
                  key={field.id}
                  className={`space-y-1 p-3 rounded-lg ${field.bg} border ${hasError ? "border-red-300" : "border-white"} shadow-sm`}
                >
                  <Label htmlFor={field.id} className="text-sm font-medium text-gray-700">
                    {t(`editDialog.fields.${field.id}`)}
                  </Label>
                  <Input
                    id={field.id}
                    value={displayValue}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^0-9]/g, "")
                      const truncatedValue = numericValue.slice(0, validation.length)

                      setEditFormData((prev: any) => ({
                        ...prev,
                        [field.id]: truncatedValue,
                      }))

                      let error = ""
                      if (truncatedValue.length === 0) {
                        error = t("editDialog.validation.required")
                      } else if (truncatedValue.length < validation.length) {
                        error = t("editDialog.validation.exactLength", {
                          length: validation.length,
                          current: truncatedValue.length
                        })
                      } else if (truncatedValue.length > validation.length) {
                        error = t("editDialog.validation.maxLength", {
                          length: validation.length
                        })
                      }

                      setFieldErrors((prev) => ({
                        ...prev,
                        [field.id]: error,
                      }))
                    }}
                    className={`w-full bg-white ${hasError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-gray-300 focus:border-indigo-400 focus:ring-indigo-200"} focus:ring-2`}
                    maxLength={validation.length}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder={`${"0".repeat(validation.length)}`}
                  />
                  {hasError ? (
                    <div className="text-xs text-red-600 mt-1 font-medium">{error}</div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">
                      {t("editDialog.validation.exactLength", {
                        length: validation.length,
                        current: 0
                      }).replace("0", "")}
                    </div>
                  )}
                </div>
              )
            })}
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
              disabled={isSaving || Object.keys(fieldErrors).some((key) => fieldErrors[key])}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-slate-700">{t("permissionDialog.description")}</p>
            <ul className="mt-2 list-disc pr-5 text-sm text-slate-600 space-y-1">
              {t("permissionDialog.reasons")
                .split("\n")
                .map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
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
  )
})

DailySummaryTable.displayName = "DailySummaryTable"

export default DailySummaryTable