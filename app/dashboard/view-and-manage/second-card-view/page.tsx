"use client"
import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, CloudSun, Filter, Loader2, AlertTriangle } from "lucide-react"
import { format, parseISO, differenceInDays, isValid } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useSession } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { utcToHour } from "@/lib/utils"
import { Download } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Validation schema with specific digit requirements
const validationSchema = yup.object({
  // 1 digit fields (most cloud-related fields)
  totalCloudAmount: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  lowCloudDirection: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  lowCloudHeight: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  lowCloudForm: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  lowCloudAmount: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  mediumCloudDirection: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  mediumCloudHeight: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  mediumCloudForm: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  mediumCloudAmount: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  highCloudDirection: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  highCloudHeight: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  highCloudForm: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  highCloudAmount: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  windDirection: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  layer1Form: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  layer1Amount: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  layer2Form: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  layer2Amount: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  layer3Form: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  layer3Amount: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  layer4Form: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),
  layer4Amount: yup
    .string()
    .matches(/^\d{1}$/, "Must be exactly 1 digit")
    .required("Required"),

  // 2 digit fields
  layer1Height: yup
    .string()
    .matches(/^\d{2}$/, "Must be exactly 2 digits")
    .required("Required"),
  layer2Height: yup
    .string()
    .matches(/^\d{2}$/, "Must be exactly 2 digits")
    .required("Required"),
  layer3Height: yup
    .string()
    .matches(/^\d{2}$/, "Must be exactly 2 digits")
    .required("Required"),
  layer4Height: yup
    .string()
    .matches(/^\d{2}$/, "Must be exactly 2 digits")
    .required("Required"),
  rainfallTimeStart: yup
    .string()
    .matches(/^\d{2}$/, "Must be exactly 2 digits")
    .required("Required"),
  rainfallTimeEnd: yup
    .string()
    .matches(/^\d{2}$/, "Must be exactly 2 digits")
    .required("Required"),
  rainfallSincePrevious: yup
    .string()
    .matches(/^\d{2}$/, "Must be exactly 2 digits")
    .required("Required"),
  rainfallLast24Hours: yup
    .string()
    .matches(/^\d{2}$/, "Must be exactly 2 digits")
    .required("Required"),

  // 3 digit field
  windSpeed: yup
    .string()
    .matches(/^\d{3}$/, "Must be exactly 3 digits")
    .required("Required"),

  // 4 digit field
  rainfallDuringPrevious: yup
    .string()
    .matches(/^\d{4}$/, "Must be exactly 4 digits")
    .required("Required"),

  // 5 digit fields
  windFirstAnemometer: yup
    .string()
    .matches(/^\d{5}$/, "Must be exactly 5 digits")
    .required("Required"),
  windSecondAnemometer: yup
    .string()
    .matches(/^\d{5}$/, "Must be exactly 5 digits")
    .required("Required"),

  // Readonly field (no validation needed as it's readonly)
  observerInitial: yup.string(),
})

type FormData = yup.InferType<typeof validationSchema>

// Define the structure of weather observation data
interface WeatherObservation {
  id: string
  observingTimeId: string
  tabActive: string
  observerInitial: string | null
  lowCloudForm: string | null
  lowCloudHeight: string | null
  lowCloudAmount: string | null
  lowCloudDirection: string | null
  mediumCloudForm: string | null
  mediumCloudHeight: string | null
  mediumCloudAmount: string | null
  mediumCloudDirection: string | null
  highCloudForm: string | null
  highCloudHeight: string | null
  highCloudAmount: string | null
  highCloudDirection: string | null
  totalCloudAmount: string | null
  layer1Form: string | null
  layer1Height: string | null
  layer1Amount: string | null
  layer2Form: string | null
  layer2Height: string | null
  layer2Amount: string | null
  layer3Form: string | null
  layer3Height: string | null
  layer3Amount: string | null
  layer4Form: string | null
  layer4Height: string | null
  layer4Amount: string | null
  rainfallTimeStart: string | null
  rainfallTimeEnd: string | null
  rainfallSincePrevious: string | null
  rainfallDuringPrevious: string | null
  rainfallLast24Hours: string | null
  windFirstAnemometer: string | null
  windSecondAnemometer: string | null
  windSpeed: string | null
  windDirection: string | null
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  [key: string]: any
}

interface MeteorologicalEntry {
  id: string
  observingTimeId: string
  dataType: string
  subIndicator: string
  barAsRead: string
  heightDifference: string
  stationLevelPressure: string
  seaLevelReduction: string
  correctedSeaLevelPressure: string
  dryBulbAsRead: string
  wetBulbAsRead: string
  maxMinTempAsRead: string
  Td: string
  relativeHumidity: string
  squallConfirmed: string
  horizontalVisibility: string
  miscMeteors: string
  pastWeatherW1: string
  pastWeatherW2: string
  presentWeatherWW: string
  submittedAt: string | null
  createdAt: string
  updatedAt: string
  [key: string]: any
}

interface ObservationData {
  id: string
  userId: string
  stationId: string
  utcTime: string
  localTime: string
  createdAt: string
  updatedAt: string
  station: {
    id: string
    stationId: string
    name: string
    latitude: number
    longitude: number
  }
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  MeteorologicalEntry: MeteorologicalEntry[]
  WeatherObservation: WeatherObservation[]
}

interface SecondCardTableProps {
  refreshTrigger?: number
}

// Helper function to determine if a user can edit an observation
function canEditObservation(record: ObservationData, sessionUser: any) {
  if (!sessionUser || !record.WeatherObservation?.[0]) return false

  try {
    const observationDate = parseISO(record.WeatherObservation[0].createdAt || "")
    if (!isValid(observationDate)) return false

    const now = new Date()
    const daysDifference = differenceInDays(now, observationDate)

    const role = sessionUser.role
    const userId = sessionUser.id
    const userStationId = sessionUser.station?.id
    const recordStationId = record.station?.id

    if (role === "super_admin") return daysDifference <= 365
    if (role === "station_admin") return daysDifference <= 30 && userStationId === recordStationId
    if (role === "observer") return daysDifference <= 2 && userId === record.userId

    return false
  } catch (e) {
    console.warn("Error in canEditObservation:", e)
    return false
  }
}

// Helper function to get cloud status color
function getCloudStatusColor(amount: string | null) {
  if (!amount || amount === "--") return "bg-gray-400"

  const numAmount = Number.parseInt(amount)
  if (isNaN(numAmount)) return "bg-gray-400"

  if (numAmount <= 2) return "bg-sky-500"
  if (numAmount <= 4) return "bg-blue-500"
  if (numAmount <= 6) return "bg-indigo-500"
  if (numAmount <= 8) return "bg-purple-500"
  return "bg-slate-700"
}

const SecondCardTable = forwardRef(({ refreshTrigger = 0 }: SecondCardTableProps, ref) => {
  const [data, setData] = useState<ObservationData[]>([])
  const [loading, setLoading] = useState(true)
  const [stationFilter, setStationFilter] = useState("all")
  const [stations, setStations] = useState<{ id: string; stationId: string; name: string }[]>([])
  const { data: session } = useSession()
  const user = session?.user

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ObservationData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPermissionDeniedOpen, setIsPermissionDeniedOpen] = useState(false)

  const today = format(new Date(), "yyyy-MM-dd")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [dateError, setDateError] = useState<string | null>(null)

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  })

  // Expose getData method via ref
  useImperativeHandle(ref, () => ({
    getData: () => {
      return data
        .filter((record) => record.WeatherObservation && record.WeatherObservation.length > 0)
        .map((record) => ({
          ...record.WeatherObservation[0],
          stationId: record.stationId,
          stationName: record.station?.name || "",
          utcTime: record.utcTime,
          localTime: record.localTime,
        }))
    },
  }))

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true)

      // Build the URL with query parameters
      const url = new URL("/api/save-observation", window.location.origin)
      url.searchParams.append("startDate", startDate)
      url.searchParams.append("endDate", endDate)

      if (stationFilter !== "all") {
        url.searchParams.append("stationId", stationFilter)
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error("Failed to fetch observation data")
      }

      const result = await response.json()
      setData(result.data)

      // Fetch stations if not already loaded
      if (stations.length === 0) {
        const stationsResponse = await fetch("/api/stations")
        if (!stationsResponse.ok) {
          throw new Error("Failed to fetch stations")
        }
        const stationsResult = await stationsResponse.json()
        setStations(stationsResult)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch weather observation data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount and when filters or refreshTrigger changes
  useEffect(() => {
    fetchData()
  }, [startDate, endDate, stationFilter, refreshTrigger])

  // Handle edit click
  const handleEditClick = (record: ObservationData) => {
    if (user && canEditObservation(record, user)) {
      setSelectedRecord(record)
      const weatherObs = record.WeatherObservation[0] || {}

      // Reset form and set values
      reset()
      Object.keys(weatherObs).forEach((key) => {
        if (weatherObs[key] !== null && weatherObs[key] !== undefined) {
          setValue(key as keyof FormData, weatherObs[key])
        }
      })

      setIsEditDialogOpen(true)
    } else {
      setIsPermissionDeniedOpen(true)
    }
  }

  // Handle form submission
  const onSubmit = async (formData: FormData) => {
    if (!selectedRecord || !selectedRecord.WeatherObservation?.[0]) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/save-observation", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedRecord.WeatherObservation[0].id,
          type: "weather",
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update record")
      }

      // Update the data in the local state
      setData((prevData) =>
        prevData.map((item) => {
          if (item.id === selectedRecord.id) {
            return {
              ...item,
              WeatherObservation: [
                {
                  ...item.WeatherObservation[0],
                  ...formData,
                  updatedAt: new Date().toISOString(),
                },
              ],
            }
          }
          return item
        }),
      )

      toast.success("Weather observation updated successfully")
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating record:", error)
      toast.error("Failed to update weather observation")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle form cancel
  const handleCancel = () => {
    reset()
    setIsEditDialogOpen(false)
  }

  // Filter data to only show records with WeatherObservation entries
  const filteredData = data.filter((record) => record.WeatherObservation && record.WeatherObservation.length > 0)

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

  const handleDateChange = (type: "start" | "end", newDate: string) => {
    const date = new Date(newDate)
    const otherDate = type === "start" ? new Date(endDate) : new Date(startDate)

    if (isNaN(date.getTime())) {
      setDateError("Invalid date format")
      return
    }

    // Reset error if dates are valid
    setDateError(null)

    if (type === "start") {
      if (date > otherDate) {
        setDateError("Start date cannot be after end date")
        return
      }
      setStartDate(newDate)
    } else {
      if (date < otherDate) {
        setDateError("End date cannot be before start date")
        return
      }
      setEndDate(newDate)
    }
  }

  const exportToCSV = () => {
    const filteredData = data.filter((record) => record.WeatherObservation && record.WeatherObservation.length > 0)

    if (filteredData.length === 0) {
      toast.error("No weather observation data available to export")
      return
    }

    // Define headers
    const headers = [
      "Time (GMT)",
      "Station Name & ID ",
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
      "Layer1 Height",
      "Layer1 Form",
      "Layer1 Amount",
      "Layer2 Height",
      "Layer2 Form",
      "Layer2 Amount",
      "Layer3 Height",
      "Layer3 Form",
      "Layer3 Amount",
      "Layer4 Height",
      "Layer4 Form",
      "Layer4 Amount",
      "Rainfall Start Time",
      "Rainfall End Time",
      "Since Previous",
      "During Previous",
      "Last 24 Hours",
      "Wind First Anemometer",
      "Wind Second Anemometer",
      "Wind Speed",
      "Wind Direction",
      "Observer Initial",
    ]

    // Convert filteredData to CSV rows
    const rows = filteredData.map((record) => {
      const obs = record.WeatherObservation?.[0] || {}
      return [
        utcToHour(record.utcTime),
        record.station?.name + " " + record.station?.stationId || "--",
        obs.totalCloudAmount || "--",
        obs.lowCloudDirection || "--",
        obs.lowCloudHeight || "--",
        obs.lowCloudForm || "--",
        obs.lowCloudAmount || "--",
        obs.mediumCloudDirection || "--",
        obs.mediumCloudHeight || "--",
        obs.mediumCloudForm || "--",
        obs.mediumCloudAmount || "--",
        obs.highCloudDirection || "--",
        obs.highCloudHeight || "--",
        obs.highCloudForm || "--",
        obs.highCloudAmount || "--",
        obs.layer1Height || "--",
        obs.layer1Form || "--",
        obs.layer1Amount || "--",
        obs.layer2Height || "--",
        obs.layer2Form || "--",
        obs.layer2Amount || "--",
        obs.layer3Height || "--",
        obs.layer3Form || "--",
        obs.layer3Amount || "--",
        obs.layer4Height || "--",
        obs.layer4Form || "--",
        obs.layer4Amount || "--",
        obs.rainfallTimeStart || "--",
        obs.rainfallTimeEnd || "--",
        obs.rainfallSincePrevious || "--",
        obs.rainfallDuringPrevious || "--",
        obs.rainfallLast24Hours || "--",
        obs.windFirstAnemometer || "--",
        obs.windSecondAnemometer || "--",
        obs.windSpeed || "--",
        obs.windDirection || "--",
        obs.observerInitial || "--",
      ]
    })

    // Generate CSV string
    const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    // Create blob & download
    const blob = new Blob([csvContent], { type: "text/plain;charset=utf-8;" })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `weather_observation_${startDate}_to_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success("CSV export started")
  }

  return (
    <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
      <div className="text-center font-bold text-xl border-b-2 border-indigo-600 pb-2 text-indigo-800">
        Second Card Data Table
      </div>
      <CardContent className="p-6">
        {/* Date and Station Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-slate-100 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="hover:bg-slate-200">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  max={endDate}
                  className="text-xs p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  min={startDate}
                  max={format(new Date(), "yyyy-MM-dd")}
                  className="text-xs p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded"
                />
              </div>
              <Button variant="outline" size="icon" onClick={goToNextWeek} className="hover:bg-slate-200">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session?.user?.role && ["super_admin", "station_admin"].includes(session?.user?.role) && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-1 hover:bg-green-50 border-green-200 text-green-700"
                disabled={filteredData.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            )}

            {session?.user?.role === "super_admin" && (
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-sky-500" />
                <Label htmlFor="stationFilter" className="whitespace-nowrap font-medium text-slate-700">
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
            )}
          </div>
        </div>

        {/* Form View */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          {/* Header Section */}
          <div className="p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
            <div className="flex justify-around gap-4">
              <div className="flex flex-col">
                <Label htmlFor="dataType" className="text-sm font-medium text-slate-900 mb-2">
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
                <div className="font-bold uppercase text-slate-600 ">STATION NO</div>
                <div className="flex h-10 border border-slate-400 rounded-lg p-2 mx-auto">
                  {user?.station?.stationId || "N/A"}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-slate-600">STATION NAME</div>
                <div className="h-10 border border-slate-400 p-2 mx-auto flex items-cente font-mono rounded-md">
                  {user?.station?.name || "N/A"}
                </div>
              </div>

              <div>
                <div className="font-bold uppercase text-slate-600">DATE</div>
                <div className="h-10 border border-slate-400 p-2 mx-auto flex items-center justify-center font-mono rounded-md">
                  {format(new Date(startDate), "dd/MM/yyyy")}
                </div>
              </div>
            </div>
          </div>

          {/* Main Table Section */}
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr>
                    <th
                      colSpan={2}
                      className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 p-1 text-sky-800"
                    >
                      TIME & DATE
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
                      colSpan={4}
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
                      <div className="h-16 text-sky-800">Time of Observation (UTC)</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">Date of Observation</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-sky-50 to-sky-100 text-xs p-1">
                      <div className="h-16 text-sky-800">Station Name & ID</div>
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
                      <div className="h-16 text-emerald-800">Since Previous</div>
                    </th>
                    <th className="border border-slate-300 bg-gradient-to-b from-emerald-50 to-emerald-100 text-xs p-1">
                      <div className="h-16 text-emerald-800">During Previous</div>
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
                          <span className="ml-3 text-sky-600 font-medium">Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={38} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CloudSun size={48} className="text-slate-400 mb-3" />
                          <p className="text-lg font-medium">No weather observations found</p>
                          <p className="text-sm">Try selecting a different date or station</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, index) => {
                      const weatherObs = record.WeatherObservation[0]
                      const totalCloudAmount = weatherObs?.totalCloudAmount || "--"
                      const cloudClass = getCloudStatusColor(totalCloudAmount)
                      const rowClass = index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      const canEdit = user && canEditObservation(record, user)

                      return (
                        <tr
                          key={record.id || index}
                          className={`text-center font-mono hover:bg-blue-50 transition-colors ${rowClass}`}
                        >
                          <td className="border border-slate-300 p-1 font-medium text-sky-700">
                            <div className="flex flex-col">{utcToHour(record.utcTime.toString())}</div>
                          </td>
                          <td className="border border-slate-300 p-1 font-medium text-sky-700">
                            {new Date(record.utcTime).toLocaleDateString()}
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className="font-mono">
                              {record.station?.name + " " + record.station?.stationId || "--"}
                            </Badge>
                          </td>
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className={`${cloudClass} text-white`}>
                              {totalCloudAmount}
                            </Badge>
                          </td>

                          {/* Low Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.lowCloudDirection ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.lowCloudDirection || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.lowCloudHeight ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.lowCloudHeight || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.lowCloudForm ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.lowCloudForm || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.lowCloudAmount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.lowCloudAmount || "--"}
                          </td>

                          {/* Medium Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudDirection ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudDirection || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudHeight ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudHeight || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudForm ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudForm || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.mediumCloudAmount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.mediumCloudAmount || "--"}
                          </td>

                          {/* High Cloud */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudDirection ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudDirection || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudHeight ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudHeight || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudForm ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudForm || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.highCloudAmount ? "text-blue-700 font-medium" : ""}`}
                          >
                            {weatherObs?.highCloudAmount || "--"}
                          </td>

                          {/* Significant Clouds */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer1Height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer1Height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer1Form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer1Form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer1Amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer1Amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer2Height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer2Height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer2Form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer2Form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer2Amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer2Amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer3Height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer3Height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer3Form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer3Form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer3Amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer3Amount || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer4Height ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer4Height || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer4Form ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer4Form || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.layer4Amount ? "text-indigo-700 font-medium" : ""}`}
                          >
                            {weatherObs?.layer4Amount || "--"}
                          </td>

                          {/* Rainfall */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallTimeStart ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallTimeStart || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallTimeEnd ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallTimeEnd || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallSincePrevious ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallSincePrevious || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallDuringPrevious ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallDuringPrevious || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.rainfallLast24Hours ? "text-emerald-700 font-medium" : ""}`}
                          >
                            {weatherObs?.rainfallLast24Hours || "--"}
                          </td>

                          {/* Wind */}
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.windFirstAnemometer ? "text-amber-700 font-medium" : ""}`}
                          >
                            {weatherObs?.windFirstAnemometer || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.windSecondAnemometer ? "text-amber-700 font-medium" : ""}`}
                          >
                            {weatherObs?.windSecondAnemometer || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.windSpeed ? "text-amber-700 font-medium" : ""}`}
                          >
                            {weatherObs?.windSpeed || "--"}
                          </td>
                          <td
                            className={`border border-slate-300 p-1 ${weatherObs?.windDirection ? "text-amber-700 font-medium" : ""}`}
                          >
                            {weatherObs?.windDirection || "--"}
                          </td>

                          {/* Observer */}
                          <td className="border border-slate-300 p-1">
                            <Badge variant="outline" className="bg-gray-100">
                              {weatherObs?.observerInitial || "--"}
                            </Badge>
                          </td>

                          {/* Edit Button */}
                          <td className="border border-slate-300 p-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-8 w-8 p-0 ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
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
                                </TooltipTrigger>
                                <TooltipContent>
                                  {canEdit ? "Edit this record" : "You don't have permission to edit this record"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-sky-500" />
                <span className="text-sm text-slate-600">
                  Date Range:{" "}
                  <span className="font-medium text-slate-800">
                    {`${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d, yyyy")}`}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-sky-100 text-sky-800 hover:bg-sky-200">
                  {filteredData.length} record(s)
                </Badge>
                {stationFilter !== "all" && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Station: {stationFilter}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Dialog with Validation */}
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
              <DialogDescription className="text-slate-600">
                Editing record from {selectedRecord?.station?.name || "Unknown Station"} on{" "}
                {selectedRecord?.utcTime ? format(new Date(selectedRecord.utcTime), "MMMM d, yyyy") : "Unknown Date"}
              </DialogDescription>
              <div className="h-1 w-20 rounded-full bg-gradient-to-r from-sky-400 to-blue-400 mt-2"></div>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              {selectedRecord && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
                  {/* Total Cloud */}
                  <div className="space-y-1 p-3 rounded-lg bg-sky-50 border border-white shadow-sm">
                    <Label htmlFor="totalCloudAmount" className="text-sm font-medium text-gray-700">
                      Total Cloud Amount (1 digit)
                    </Label>
                    <Input
                      {...register("totalCloudAmount")}
                      className={`w-full bg-white border-gray-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-200 ${
                        errors.totalCloudAmount ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.totalCloudAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors.totalCloudAmount.message}</p>
                    )}
                  </div>

                  {/* Low Cloud */}
                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Low Cloud Direction (1 digit)</Label>
                    <Input
                      {...register("lowCloudDirection")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.lowCloudDirection ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.lowCloudDirection && (
                      <p className="text-red-500 text-xs mt-1">{errors.lowCloudDirection.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Low Cloud Height (1 digit)</Label>
                    <Input
                      {...register("lowCloudHeight")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.lowCloudHeight ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.lowCloudHeight && (
                      <p className="text-red-500 text-xs mt-1">{errors.lowCloudHeight.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Low Cloud Form (1 digit)</Label>
                    <Input
                      {...register("lowCloudForm")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.lowCloudForm ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.lowCloudForm && <p className="text-red-500 text-xs mt-1">{errors.lowCloudForm.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Low Cloud Amount (1 digit)</Label>
                    <Input
                      {...register("lowCloudAmount")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.lowCloudAmount ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.lowCloudAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors.lowCloudAmount.message}</p>
                    )}
                  </div>

                  {/* Medium Cloud */}
                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Medium Cloud Direction (1 digit)</Label>
                    <Input
                      {...register("mediumCloudDirection")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.mediumCloudDirection ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.mediumCloudDirection && (
                      <p className="text-red-500 text-xs mt-1">{errors.mediumCloudDirection.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Medium Cloud Height (1 digit)</Label>
                    <Input
                      {...register("mediumCloudHeight")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.mediumCloudHeight ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.mediumCloudHeight && (
                      <p className="text-red-500 text-xs mt-1">{errors.mediumCloudHeight.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Medium Cloud Form (1 digit)</Label>
                    <Input
                      {...register("mediumCloudForm")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.mediumCloudForm ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.mediumCloudForm && (
                      <p className="text-red-500 text-xs mt-1">{errors.mediumCloudForm.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Medium Cloud Amount (1 digit)</Label>
                    <Input
                      {...register("mediumCloudAmount")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.mediumCloudAmount ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.mediumCloudAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors.mediumCloudAmount.message}</p>
                    )}
                  </div>

                  {/* High Cloud */}
                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">High Cloud Direction (1 digit)</Label>
                    <Input
                      {...register("highCloudDirection")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.highCloudDirection ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.highCloudDirection && (
                      <p className="text-red-500 text-xs mt-1">{errors.highCloudDirection.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">High Cloud Height (1 digit)</Label>
                    <Input
                      {...register("highCloudHeight")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.highCloudHeight ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.highCloudHeight && (
                      <p className="text-red-500 text-xs mt-1">{errors.highCloudHeight.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">High Cloud Form (1 digit)</Label>
                    <Input
                      {...register("highCloudForm")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.highCloudForm ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.highCloudForm && (
                      <p className="text-red-500 text-xs mt-1">{errors.highCloudForm.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-blue-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">High Cloud Amount (1 digit)</Label>
                    <Input
                      {...register("highCloudAmount")}
                      className={`w-full bg-white border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 ${
                        errors.highCloudAmount ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.highCloudAmount && (
                      <p className="text-red-500 text-xs mt-1">{errors.highCloudAmount.message}</p>
                    )}
                  </div>

                  {/* Rainfall */}
                  <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Rainfall Start Time (2 digits)</Label>
                    <Input
                      {...register("rainfallTimeStart")}
                      className={`w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 ${
                        errors.rainfallTimeStart ? "border-red-500" : ""
                      }`}
                      maxLength={2}
                    />
                    {errors.rainfallTimeStart && (
                      <p className="text-red-500 text-xs mt-1">{errors.rainfallTimeStart.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Rainfall End Time (2 digits)</Label>
                    <Input
                      {...register("rainfallTimeEnd")}
                      className={`w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 ${
                        errors.rainfallTimeEnd ? "border-red-500" : ""
                      }`}
                      maxLength={2}
                    />
                    {errors.rainfallTimeEnd && (
                      <p className="text-red-500 text-xs mt-1">{errors.rainfallTimeEnd.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Rainfall Since Previous (2 digits)</Label>
                    <Input
                      {...register("rainfallSincePrevious")}
                      className={`w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 ${
                        errors.rainfallSincePrevious ? "border-red-500" : ""
                      }`}
                      maxLength={2}
                    />
                    {errors.rainfallSincePrevious && (
                      <p className="text-red-500 text-xs mt-1">{errors.rainfallSincePrevious.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Rainfall During Previous (4 digits)</Label>
                    <Input
                      {...register("rainfallDuringPrevious")}
                      className={`w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 ${
                        errors.rainfallDuringPrevious ? "border-red-500" : ""
                      }`}
                      maxLength={4}
                    />
                    {errors.rainfallDuringPrevious && (
                      <p className="text-red-500 text-xs mt-1">{errors.rainfallDuringPrevious.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Rainfall Last 24 Hours (2 digits)</Label>
                    <Input
                      {...register("rainfallLast24Hours")}
                      className={`w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 ${
                        errors.rainfallLast24Hours ? "border-red-500" : ""
                      }`}
                      maxLength={2}
                    />
                    {errors.rainfallLast24Hours && (
                      <p className="text-red-500 text-xs mt-1">{errors.rainfallLast24Hours.message}</p>
                    )}
                  </div>

                  {/* Wind */}
                  <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">First Anemometer (5 digits)</Label>
                    <Input
                      {...register("windFirstAnemometer")}
                      className={`w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 ${
                        errors.windFirstAnemometer ? "border-red-500" : ""
                      }`}
                      maxLength={5}
                    />
                    {errors.windFirstAnemometer && (
                      <p className="text-red-500 text-xs mt-1">{errors.windFirstAnemometer.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Second Anemometer (5 digits)</Label>
                    <Input
                      {...register("windSecondAnemometer")}
                      className={`w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 ${
                        errors.windSecondAnemometer ? "border-red-500" : ""
                      }`}
                      maxLength={5}
                    />
                    {errors.windSecondAnemometer && (
                      <p className="text-red-500 text-xs mt-1">{errors.windSecondAnemometer.message}</p>
                    )}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Wind Speed (3 digits)</Label>
                    <Input
                      {...register("windSpeed")}
                      className={`w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 ${
                        errors.windSpeed ? "border-red-500" : ""
                      }`}
                      maxLength={3}
                    />
                    {errors.windSpeed && <p className="text-red-500 text-xs mt-1">{errors.windSpeed.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Wind Direction (1 digit)</Label>
                    <Input
                      {...register("windDirection")}
                      className={`w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 ${
                        errors.windDirection ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.windDirection && (
                      <p className="text-red-500 text-xs mt-1">{errors.windDirection.message}</p>
                    )}
                  </div>

                  {/* Observer */}
                  <div className="space-y-1 p-3 rounded-lg bg-gray-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Observer Initial (Readonly)</Label>
                    <Input
                      {...register("observerInitial")}
                      readOnly
                      className="w-full bg-gray-100 border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 cursor-not-allowed"
                    />
                  </div>

                  {/* Significant Clouds */}
                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 1 Height (2 digits)</Label>
                    <Input
                      {...register("layer1Height")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer1Height ? "border-red-500" : ""
                      }`}
                      maxLength={2}
                    />
                    {errors.layer1Height && <p className="text-red-500 text-xs mt-1">{errors.layer1Height.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 1 Form (1 digit)</Label>
                    <Input
                      {...register("layer1Form")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer1Form ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.layer1Form && <p className="text-red-500 text-xs mt-1">{errors.layer1Form.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 1 Amount (1 digit)</Label>
                    <Input
                      {...register("layer1Amount")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer1Amount ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.layer1Amount && <p className="text-red-500 text-xs mt-1">{errors.layer1Amount.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 2 Height (2 digits)</Label>
                    <Input
                      {...register("layer2Height")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer2Height ? "border-red-500" : ""
                      }`}
                      maxLength={2}
                    />
                    {errors.layer2Height && <p className="text-red-500 text-xs mt-1">{errors.layer2Height.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 2 Form (1 digit)</Label>
                    <Input
                      {...register("layer2Form")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer2Form ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.layer2Form && <p className="text-red-500 text-xs mt-1">{errors.layer2Form.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 2 Amount (1 digit)</Label>
                    <Input
                      {...register("layer2Amount")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer2Amount ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.layer2Amount && <p className="text-red-500 text-xs mt-1">{errors.layer2Amount.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 3 Height (2 digits)</Label>
                    <Input
                      {...register("layer3Height")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer3Height ? "border-red-500" : ""
                      }`}
                      maxLength={2}
                    />
                    {errors.layer3Height && <p className="text-red-500 text-xs mt-1">{errors.layer3Height.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 3 Form (1 digit)</Label>
                    <Input
                      {...register("layer3Form")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer3Form ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.layer3Form && <p className="text-red-500 text-xs mt-1">{errors.layer3Form.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 3 Amount (1 digit)</Label>
                    <Input
                      {...register("layer3Amount")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer3Amount ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.layer3Amount && <p className="text-red-500 text-xs mt-1">{errors.layer3Amount.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 4 Height (2 digits)</Label>
                    <Input
                      {...register("layer4Height")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer4Height ? "border-red-500" : ""
                      }`}
                      maxLength={2}
                    />
                    {errors.layer4Height && <p className="text-red-500 text-xs mt-1">{errors.layer4Height.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 4 Form (1 digit)</Label>
                    <Input
                      {...register("layer4Form")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer4Form ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.layer4Form && <p className="text-red-500 text-xs mt-1">{errors.layer4Form.message}</p>}
                  </div>

                  <div className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm">
                    <Label className="text-sm font-medium text-gray-700">Layer 4 Amount (1 digit)</Label>
                    <Input
                      {...register("layer4Amount")}
                      className={`w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 ${
                        errors.layer4Amount ? "border-red-500" : ""
                      }`}
                      maxLength={1}
                    />
                    {errors.layer4Amount && <p className="text-red-500 text-xs mt-1">{errors.layer4Amount.message}</p>}
                  </div>
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Permission Denied Dialog */}
        <Dialog open={isPermissionDeniedOpen} onOpenChange={setIsPermissionDeniedOpen}>
          <DialogContent className="max-w-md rounded-xl border-0 bg-white p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Permission Denied
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-700">You don't have permission to edit this record. This could be because:</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>The record is too old to edit</li>
                <li>The record belongs to a different station</li>
                <li>You don't have the required role permissions</li>
              </ul>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsPermissionDeniedOpen(false)}
                className="bg-slate-200 text-slate-800 hover:bg-slate-300"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
})

SecondCardTable.displayName = "SecondCardTable"

export default SecondCardTable
