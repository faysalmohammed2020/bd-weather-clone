"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, ChevronLeft, ChevronRight, Download, Edit, Loader2 } from "lucide-react"
import { differenceInDays, format, parseISO } from "date-fns"
import { useSession } from "@/lib/auth-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { WeatherObservation } from "@prisma/client"

// Define the SecondCardData interface based on the database schema
interface SecondCardData {
  metadata: {
    id: string;
    stationId: string;
  };
  observer: {
    id: string;
    "observer-initial": string;
    "observation-time": string;
  };
  totalCloud: {
    "total-cloud-amount": string;
  };
  clouds: {
    low: {
      direction: string;
      height: string;
      form: string;
      amount: string;
    };
    medium: {
      direction: string;
      height: string;
      form: string;
      amount: string;
    };
    high: {
      direction: string;
      height: string;
      form: string;
      amount: string;
    };
  };
  significantClouds: {
    layer1: {
      height: string;
      form: string;
      amount: string;
    };
    layer2: {
      height: string;
      form: string;
      amount: string;
    };
    layer3: {
      height: string;
      form: string;
      amount: string;
    };
    layer4: {
      height: string;
      form: string;
      amount: string;
    };
  };
  rainfall: {
    "time-start": string;
    "time-end": string;
    "since-previous": string;
    "during-previous": string;
    "last-24-hours": string;
  };
  wind: {
    "first-anemometer": string;
    "second-anemometer": string;
    speed: string;
    direction: string;
    "wind-direction": string;
  };
}

interface SecondCardTableProps {
  refreshTrigger?: number
}

function canEditObservation(record: SecondCardData, sessionUser: any) {
  try {
    if (!sessionUser || !record?.observer?.["observation-time"]) return false

    const observationDate = parseISO(record.observer["observation-time"])
    const now = new Date()
    const daysDifference = differenceInDays(now, observationDate)

    const role = sessionUser?.role
    const userId = String(sessionUser?.id || "")
    const stationId = String(sessionUser?.stationId || "")
    const recordStationId = String(record?.metadata?.stationId || "")
    const recordUserId = String(record?.observer?.id || "")

    if (role === "super_admin") return daysDifference <= 365
    if (role === "station_admin")
      return daysDifference <= 30 && stationId && recordStationId && stationId === recordStationId
    if (role === "observer")
      return daysDifference <= 2 && userId && recordUserId && userId === recordUserId

    return false
  } catch (error) {
    console.error("Error in canEditObservation:", error)
    return false
  }
}

export function SecondCardTable({ refreshTrigger = 0 }: SecondCardTableProps) {
  const [data, setData] = useState<SecondCardData[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [stationFilter, setStationFilter] = useState("all")
  const [stations, setStations] = useState<{ id: string; stationId: string; name: string }[]>([])

  // Edit modal state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<SecondCardData | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<SecondCardData>>({})
  const [saveLoading, setSaveLoading] = useState(false)

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch weather observations
      const obsResponse = await fetch("/api/save-observation")
      if (!obsResponse.ok) {
        throw new Error("Failed to fetch observation data")
      }
      
      // The API already returns data in the correct format
      // We just need to ensure all properties are properly set
      const obsResult = await obsResponse.json()
      
      console.log("API Response:", obsResult) // Debug log to see what data is coming from the API
      
      // Make sure the data has the required structure
      const transformedData = obsResult.map((obs: any) => {
        // Ensure the observer ID is correctly set for permission checks
        if (!obs.observer.id && obs.observer.userId) {
          obs.observer.id = obs.observer.userId
        }
        
        // Make sure all required properties exist
        return {
          metadata: {
            id: obs.metadata?.id || "",
            stationId: obs.metadata?.stationId || "",
          },
          observer: {
            id: obs.observer?.id || obs.observer?.userId || "", // Ensure we have the observer ID
            "observer-initial": obs.observer?.["observer-initial"] || "",
            "observation-time": obs.observer?.["observation-time"] || new Date().toISOString(),
          },
          totalCloud: {
            "total-cloud-amount": obs.totalCloud?.["total-cloud-amount"] || "",
          },
          clouds: {
            low: {
              direction: obs.clouds?.low?.direction || "",
              height: obs.clouds?.low?.height || "",
              form: obs.clouds?.low?.form || "",
              amount: obs.clouds?.low?.amount || "",
            },
            medium: {
              direction: obs.clouds?.medium?.direction || "",
              height: obs.clouds?.medium?.height || "",
              form: obs.clouds?.medium?.form || "",
              amount: obs.clouds?.medium?.amount || "",
            },
            high: {
              direction: obs.clouds?.high?.direction || "",
              height: obs.clouds?.high?.height || "",
              form: obs.clouds?.high?.form || "",
              amount: obs.clouds?.high?.amount || "",
            },
          },
          significantClouds: {
            layer1: {
              height: obs.significantClouds?.layer1?.height || "",
              form: obs.significantClouds?.layer1?.form || "",
              amount: obs.significantClouds?.layer1?.amount || "",
            },
            layer2: {
              height: obs.significantClouds?.layer2?.height || "",
              form: obs.significantClouds?.layer2?.form || "",
              amount: obs.significantClouds?.layer2?.amount || "",
            },
            layer3: {
              height: obs.significantClouds?.layer3?.height || "",
              form: obs.significantClouds?.layer3?.form || "",
              amount: obs.significantClouds?.layer3?.amount || "",
            },
            layer4: {
              height: obs.significantClouds?.layer4?.height || "",
              form: obs.significantClouds?.layer4?.form || "",
              amount: obs.significantClouds?.layer4?.amount || "",
            },
          },
          rainfall: {
            "time-start": obs.rainfall?.["time-start"] || "",
            "time-end": obs.rainfall?.["time-end"] || "",
            "since-previous": obs.rainfall?.["since-previous"] || "",
            "during-previous": obs.rainfall?.["during-previous"] || "",
            "last-24-hours": obs.rainfall?.["last-24-hours"] || "",
          },
          wind: {
            "first-anemometer": obs.wind?.["first-anemometer"] || "",
            "second-anemometer": obs.wind?.["second-anemometer"] || "",
            speed: obs.wind?.speed || "",
            direction: obs.wind?.direction || "",
            "wind-direction": obs.wind?.["wind-direction"] || obs.wind?.direction || "",
          },
        }
      })
      
      console.log("Transformed Data:", transformedData) // Debug log to see the transformed data
      setData(transformedData)

      // Fetch stations from the database
      const stationsResponse = await fetch("/api/stations")
      if (!stationsResponse.ok) {
        throw new Error("Failed to fetch stations")
      }
      const stationsResult = await stationsResponse.json()
      setStations(stationsResult)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  // Filter data based on selected date and station
  const filteredData = data.filter((item) => {
    const itemDate = item.observer["observation-time"]
      ? format(parseISO(item.observer["observation-time"]), "yyyy-MM-dd")
      : ""

    const matchesDate = itemDate === selectedDate
    const matchesStation = stationFilter === "all" || item.metadata.stationId === stationFilter

    return matchesDate && matchesStation
  })

  // Navigate to previous day
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate)
    const previousDay = new Date(currentDate)
    previousDay.setDate(currentDate.getDate() - 1)
    setSelectedDate(format(previousDay, "yyyy-MM-dd"))
  }

  // Navigate to next day
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = new Date(currentDate)
    nextDay.setDate(currentDate.getDate() + 1)
    setSelectedDate(format(nextDay, "yyyy-MM-dd"))
  }

  // Edit handlers
  const handleEditClick = (record: SecondCardData) => {
    setSelectedRecord(record)
    setEditFormData(JSON.parse(JSON.stringify(record))) // Deep copy to avoid reference issues
    setIsEditDialogOpen(true)
  }

  const handleEditChange = (section: keyof SecondCardData, field: string, value: string) => {
    // Handle nested properties like 'low.direction'
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setEditFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [parent]: {
            ...(prev[section] as any)?.[parent],
            [child]: value,
          },
        },
      }))
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }))
    }
  }

  const handleSaveEdit = async () => {
    try {
      setSaveLoading(true)
      const response = await fetch(`/api/save-observation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editFormData.metadata?.id,
          ...editFormData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update record")
      }

      // Update the data in the UI
      setData((prevData) =>
        prevData.map((item) =>
          item.metadata.id === editFormData.metadata?.id ? (editFormData as SecondCardData) : item,
        ),
      )

      // Refresh data from server
      fetchData()

      setIsEditDialogOpen(false)
      toast.success("Record updated successfully")
    } catch (error) {
      console.error("Error updating record:", error)
      toast.error("Failed to update record")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
  }

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
    ]

    const csvRows = [
      headers.join(","),
      ...filteredData.map((item) => {
        const time = item.observer["observation-time"]
          ? format(parseISO(item.observer["observation-time"]), "HH:mm")
          : "N/A"

        const totalCloudAmount = item.totalCloud?.["total-cloud-amount"] !== undefined ? item.totalCloud["total-cloud-amount"] : "N/A"

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
        ].join(",")
      }),
    ]

    const csvContent = csvRows.join("\n")

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `second-card-data-${selectedDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="p-4 bg-sky-600 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-bold">Second Card</CardTitle>

          <div className="flex items-center gap-2">
            <Button onClick={exportToCSV} className="gap-1 bg-green-600 hover:bg-green-700">
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

        {/* Main Table Section */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-100 border-b border-gray-300">
            <div className="text-center font-bold text-lg border-b-2 border-gray-800 pb-2 mb-4">SECOND CARD </div>
          </div>

          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Table Header */}
                <thead>
                  <tr>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">TIME</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">STATION</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">TOTAL CLOUD</th>
                    <th colSpan={4} className="border border-gray-400 bg-gray-100 text-xs p-1">
                      LOW CLOUD
                    </th>
                    <th colSpan={4} className="border border-gray-400 bg-gray-100 text-xs p-1">
                      MEDIUM CLOUD
                    </th>
                    <th colSpan={4} className="border border-gray-400 bg-gray-100 text-xs p-1">
                      HIGH CLOUD
                    </th>
                    <th colSpan={12} className="border border-gray-400 bg-gray-100 text-xs p-1">
                      SIGNIFICANT CLOUD
                    </th>
                    <th colSpan={5} className="border border-gray-400 bg-gray-100 text-xs p-1">
                      RAINFALL
                    </th>
                    <th colSpan={5} className="border border-gray-400 bg-gray-100 text-xs p-1">
                      WIND
                    </th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">OBSERVER</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">ACTIONS</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">GG</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">ID</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">N</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Dir</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">H</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">CL</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Amt</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Dir</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">H</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">CM</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Amt</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Dir</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">H</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">CH</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Amt</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">H1</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">C1</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">A1</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">H2</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">C2</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">A2</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">H3</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">C3</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">A3</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">H4</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">C4</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">A4</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Start</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">End</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Since</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">During</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">24h</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">1st</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">2nd</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Speed</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">WD</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Dir</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">Init</th>
                    <th className="border border-gray-400 bg-gray-100 text-xs p-1">EDIT</th>
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
                          <p className="text-sm">Try selecting a different date</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record, index) => {
                      const time = record.observer["observation-time"]
                        ? format(parseISO(record.observer["observation-time"]), "HH:mm")
                        : "--:--"

                      const totalCloudAmount =
                        record.totalCloud?.["total-cloud-amount"] || "--"

                      return (
                        <tr key={index} className="text-center font-mono hover:bg-gray-50">
                          <td className="border border-gray-400 p-1">{time}</td>
                          <td className="border border-gray-400 p-1">{record.metadata.stationId || "XYZ"}</td>
                          <td className="border border-gray-400 p-1">{totalCloudAmount}</td>

                          {/* Low Cloud */}
                          <td className="border border-gray-400 p-1">{record.clouds.low.direction || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.low.height || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.low.form || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.low.amount || "--"}</td>

                          {/* Medium Cloud */}
                          <td className="border border-gray-400 p-1">{record.clouds.medium.direction || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.medium.height || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.medium.form || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.medium.amount || "--"}</td>

                          {/* High Cloud */}
                          <td className="border border-gray-400 p-1">{record.clouds.high.direction || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.high.height || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.high.form || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.clouds.high.amount || "--"}</td>

                          {/* Significant Clouds */}
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer1.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">{record.significantClouds.layer1.form || "--"}</td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer1.amount || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer2.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">{record.significantClouds.layer2.form || "--"}</td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer2.amount || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer3.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">{record.significantClouds.layer3.form || "--"}</td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer3.amount || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer4.height || "--"}
                          </td>
                          <td className="border border-gray-400 p-1">{record.significantClouds.layer4.form || "--"}</td>
                          <td className="border border-gray-400 p-1">
                            {record.significantClouds.layer4.amount || "--"}
                          </td>

                          {/* Rainfall */}
                          <td className="border border-gray-400 p-1">{record.rainfall["time-start"] || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.rainfall["time-end"] || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.rainfall["since-previous"] || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.rainfall["during-previous"] || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.rainfall["last-24-hours"] || "--"}</td>

                          {/* Wind */}
                          <td className="border border-gray-400 p-1">{record.wind["first-anemometer"] || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.wind["second-anemometer"] || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.wind.speed || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.wind["wind-direction"] || "--"}</td>
                          <td className="border border-gray-400 p-1">{record.wind.direction || "--"}</td>

                          {/* Observer */}
                          <td className="border border-gray-400 p-1">{record.observer["observer-initial"] || "--"}</td>

                          {/* Edit Button */}
                          <td className="border border-gray-400 p-1">
                            {canEditObservation(record, session?.user) ? (
                              <Button
                                size="sm"
                                className="text-xs h-7 bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() => handleEditClick(record)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            ) : (
                              "--"
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex justify-between items-center">
                <div>
                  Date: <span className="font-medium">{format(new Date(selectedDate), "MMMM d, yyyy")}</span>
                </div>
                <div>
                  <span>Showing {filteredData.length} record(s)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center">
                <Edit className="mr-2 h-5 w-5" />
                Edit Weather Observation
              </DialogTitle>
            </DialogHeader>

            {selectedRecord && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                {/* Observer Information */}
                <div className="space-y-2">
                  <Label htmlFor="observer-initial">Observer Initial</Label>
                  <Input
                    id="observer-initial"
                    value={editFormData.observer?.["observer-initial"] || ""}
                    onChange={(e) => handleEditChange("observer", "observer-initial", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Total Cloud */}
                <div className="space-y-2">
                  <Label htmlFor="total-cloud-amount">Total Cloud Amount</Label>
                  <Input
                    id="total-cloud-amount"
                    value={editFormData.totalCloud?.["total-cloud-amount"] || ""}
                    onChange={(e) => handleEditChange("totalCloud", "total-cloud-amount", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Low Cloud Section */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-semibold mb-4 text-blue-700">Low Cloud</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="low-cloud-direction">Direction</Label>
                      <Input
                        id="low-cloud-direction"
                        value={editFormData.clouds?.low?.direction || ""}
                        onChange={(e) => handleEditChange("clouds", "low.direction", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="low-cloud-height">Height</Label>
                      <Input
                        id="low-cloud-height"
                        value={editFormData.clouds?.low?.height || ""}
                        onChange={(e) => handleEditChange("clouds", "low.height", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="low-cloud-form">Form</Label>
                      <Input
                        id="low-cloud-form"
                        value={editFormData.clouds?.low?.form || ""}
                        onChange={(e) => handleEditChange("clouds", "low.form", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="low-cloud-amount">Amount</Label>
                      <Input
                        id="low-cloud-amount"
                        value={editFormData.clouds?.low?.amount || ""}
                        onChange={(e) => handleEditChange("clouds", "low.amount", e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Medium Cloud Section */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h3 className="text-lg font-semibold mb-4 text-indigo-700">Medium Cloud</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="medium-cloud-direction">Direction</Label>
                      <Input
                        id="medium-cloud-direction"
                        value={editFormData.clouds?.medium?.direction || ""}
                        onChange={(e) => handleEditChange("clouds", "medium.direction", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medium-cloud-height">Height</Label>
                      <Input
                        id="medium-cloud-height"
                        value={editFormData.clouds?.medium?.height || ""}
                        onChange={(e) => handleEditChange("clouds", "medium.height", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medium-cloud-form">Form</Label>
                      <Input
                        id="medium-cloud-form"
                        value={editFormData.clouds?.medium?.form || ""}
                        onChange={(e) => handleEditChange("clouds", "medium.form", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medium-cloud-amount">Amount</Label>
                      <Input
                        id="medium-cloud-amount"
                        value={editFormData.clouds?.medium?.amount || ""}
                        onChange={(e) => handleEditChange("clouds", "medium.amount", e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* High Cloud Section */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h3 className="text-lg font-semibold mb-4 text-purple-700">High Cloud</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="high-cloud-direction">Direction</Label>
                      <Input
                        id="high-cloud-direction"
                        value={editFormData.clouds?.high?.direction || ""}
                        onChange={(e) => handleEditChange("clouds", "high.direction", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="high-cloud-height">Height</Label>
                      <Input
                        id="high-cloud-height"
                        value={editFormData.clouds?.high?.height || ""}
                        onChange={(e) => handleEditChange("clouds", "high.height", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="high-cloud-form">Form</Label>
                      <Input
                        id="high-cloud-form"
                        value={editFormData.clouds?.high?.form || ""}
                        onChange={(e) => handleEditChange("clouds", "high.form", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="high-cloud-amount">Amount</Label>
                      <Input
                        id="high-cloud-amount"
                        value={editFormData.clouds?.high?.amount || ""}
                        onChange={(e) => handleEditChange("clouds", "high.amount", e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Rainfall Section */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                  <h3 className="text-lg font-semibold mb-4 text-cyan-700">Rainfall</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rainfall-time-start">Time Start</Label>
                      <Input
                        id="rainfall-time-start"
                        value={editFormData.rainfall?.["time-start"] || ""}
                        onChange={(e) => handleEditChange("rainfall", "time-start", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rainfall-time-end">Time End</Label>
                      <Input
                        id="rainfall-time-end"
                        value={editFormData.rainfall?.["time-end"] || ""}
                        onChange={(e) => handleEditChange("rainfall", "time-end", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rainfall-since-previous">Since Previous</Label>
                      <Input
                        id="rainfall-since-previous"
                        value={editFormData.rainfall?.["since-previous"] || ""}
                        onChange={(e) => handleEditChange("rainfall", "since-previous", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rainfall-during-previous">During Previous</Label>
                      <Input
                        id="rainfall-during-previous"
                        value={editFormData.rainfall?.["during-previous"] || ""}
                        onChange={(e) => handleEditChange("rainfall", "during-previous", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rainfall-last-24-hours">Last 24 Hours</Label>
                      <Input
                        id="rainfall-last-24-hours"
                        value={editFormData.rainfall?.["last-24-hours"] || ""}
                        onChange={(e) => handleEditChange("rainfall", "last-24-hours", e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Wind Section */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <h3 className="text-lg font-semibold mb-4 text-amber-700">Wind</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wind-first-anemometer">First Anemometer</Label>
                      <Input
                        id="wind-first-anemometer"
                        value={editFormData.wind?.["first-anemometer"] || ""}
                        onChange={(e) => handleEditChange("wind", "first-anemometer", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wind-second-anemometer">Second Anemometer</Label>
                      <Input
                        id="wind-second-anemometer"
                        value={editFormData.wind?.["second-anemometer"] || ""}
                        onChange={(e) => handleEditChange("wind", "second-anemometer", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wind-speed">Wind Speed</Label>
                      <Input
                        id="wind-speed"
                        value={editFormData.wind?.speed || ""}
                        onChange={(e) => handleEditChange("wind", "speed", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wind-direction">Wind Direction</Label>
                      <Input
                        id="wind-direction"
                        value={editFormData.wind?.direction || ""}
                        onChange={(e) => handleEditChange("wind", "direction", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wind-wind-direction">Wind Direction (WD)</Label>
                      <Input
                        id="wind-wind-direction"
                        value={editFormData.wind?.["wind-direction"] || ""}
                        onChange={(e) => handleEditChange("wind", "wind-direction", e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saveLoading}>
                {saveLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
