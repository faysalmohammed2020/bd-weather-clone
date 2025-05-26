"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Calendar, TrendingUp, AlertCircle } from "lucide-react"
import { useSession } from "@/lib/auth-client"

interface WeatherObservation {
  id: string
  utcTime: string
  localTime: string
  station: {
    stationId: string
    stationName: string
  }
  MeteorologicalEntry: Array<{
    id: string
    stationLevelPressure: string
    correctedSeaLevelPressure: string
    dryBulbAsRead: string
    wetBulbAsRead: string
    maxMinTempAsRead: string
    Td: string
    relativeHumidity: string
    horizontalVisibility: string
  }>
  WeatherObservation: Array<{
    id: string
    windSpeed: string
    windDirection: string
    totalCloudAmount: string
    rainfallLast24Hours: string
    rainfallTimeStart: string
    rainfallTimeEnd: string
  }>
}

interface DailySummary {
  id: string
  dataType: string
  avStationPressure: string
  avSeaLevelPressure: string
  avDryBulbTemperature: string
  avWetBulbTemperature: string
  maxTemperature: string
  minTemperature: string
  totalPrecipitation: string
  avDewPointTemperature: string
  avRelativeHumidity: string
  windSpeed: string
  windDirectionCode: string
  maxWindSpeed: string
  maxWindDirection: string
  avTotalCloud: string
  lowestVisibility: string
  totalRainDuration: string
  ObservingTime: {
    utcTime: string
    station: {
      stationId: string
      stationName: string
    }
  }
}

const observationTimes = ["00", "03", "06", "09", "12", "15", "18", "21"]

export default function WeatherDataTable() {
  const { data: session } = useSession()
  const [observations, setObservations] = useState<WeatherObservation[]>([])
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch meteorological data (first card)
      const firstCardResponse = await fetch("/api/first-card-data")
      if (!firstCardResponse.ok) throw new Error("Failed to fetch meteorological data")
      const firstCardData = await firstCardResponse.json()

      // Fetch weather observations (second card)
      const secondCardResponse = await fetch("/api/second-card-data")
      if (!secondCardResponse.ok) throw new Error("Failed to fetch weather observations")
      const secondCardData = await secondCardResponse.json()

      // Fetch daily summary
      const summaryResponse = await fetch("/api/daily-summary")
      const summaryData = await summaryResponse.json()

      setObservations(secondCardData || [])
      setDailySummary(summaryData?.[0] || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const formatTime = (utcTime: string) => {
    return new Date(utcTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    })
  }

  const formatValue = (value: string | null | undefined, unit?: string) => {
    if (!value || value === "" || value === "null") return "--"
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return value
    return `${numValue.toFixed(1)}${unit ? ` ${unit}` : ""}`
  }

  const getObservationByTime = (time: string) => {
    return observations.find((obs) => {
      const obsTime = new Date(obs.utcTime).getUTCHours().toString().padStart(2, "0")
      return obsTime === time
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Loading weather data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>Error: {error}</span>
          </div>
          <Button onClick={fetchData} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Data Table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Time (UTC)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Station Pressure (hPa)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Sea Level Pressure (hPa)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Dry Bulb Temp (°C)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Wet Bulb Temp (°C)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Dew Point (°C)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Humidity (%)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Wind Speed (m/s)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Wind Dir</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Visibility (km)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Cloud (octas)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-700">Rainfall (mm)</th>
                </tr>
              </thead>
              <tbody>
                {/* Observation Rows */}
                {observationTimes.map((time, index) => {
                  const observation = getObservationByTime(time)
                  const meteoData = observation?.MeteorologicalEntry?.[0]
                  const weatherData = observation?.WeatherObservation?.[0]

                  return (
                    <tr
                      key={time}
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{time}:00</td>
                      <td className="px-4 py-3 text-center">{formatValue(meteoData?.stationLevelPressure)}</td>
                      <td className="px-4 py-3 text-center">{formatValue(meteoData?.correctedSeaLevelPressure)}</td>
                      <td className="px-4 py-3 text-center">{formatValue(meteoData?.dryBulbAsRead)}</td>
                      <td className="px-4 py-3 text-center">{formatValue(meteoData?.wetBulbAsRead)}</td>
                      <td className="px-4 py-3 text-center">{formatValue(meteoData?.Td)}</td>
                      <td className="px-4 py-3 text-center">{formatValue(meteoData?.relativeHumidity)}</td>
                      <td className="px-4 py-3 text-center">{formatValue(weatherData?.windSpeed)}</td>
                      <td className="px-4 py-3 text-center">{weatherData?.windDirection || "--"}</td>
                      <td className="px-4 py-3 text-center">{formatValue(meteoData?.horizontalVisibility)}</td>
                      <td className="px-4 py-3 text-center">{formatValue(weatherData?.totalCloudAmount)}</td>
                      <td className="px-4 py-3 text-center">{formatValue(weatherData?.rainfallLast24Hours)}</td>
                    </tr>
                  )
                })}

                {/* Daily Summary Row */}
                {dailySummary && (
                  <tr className="bg-blue-50 border-t-2 border-blue-200 font-semibold">
                    <td className="px-4 py-4 font-bold text-blue-900">Daily Summary</td>
                    <td className="px-4 py-4 text-center text-blue-800">
                      {formatValue(dailySummary.avStationPressure)}
                    </td>
                    <td className="px-4 py-4 text-center text-blue-800">
                      {formatValue(dailySummary.avSeaLevelPressure)}
                    </td>
                    <td className="px-4 py-4 text-center text-blue-800">
                      {formatValue(dailySummary.avDryBulbTemperature)}
                    </td>
                    <td className="px-4 py-4 text-center text-blue-800">
                      {formatValue(dailySummary.avWetBulbTemperature)}
                    </td>
                    <td className="px-4 py-4 text-center text-blue-800">
                      {formatValue(dailySummary.avDewPointTemperature)}
                    </td>
                    <td className="px-4 py-4 text-center text-blue-800">
                      {formatValue(dailySummary.avRelativeHumidity)}
                    </td>
                    <td className="px-4 py-4 text-center text-blue-800">{formatValue(dailySummary.windSpeed)}</td>
                    <td className="px-4 py-4 text-center text-blue-800">{dailySummary.windDirectionCode || "--"}</td>
                    <td className="px-4 py-4 text-center text-blue-800">
                      {formatValue(dailySummary.lowestVisibility)}
                    </td>
                    <td className="px-4 py-4 text-center text-blue-800">{formatValue(dailySummary.avTotalCloud)}</td>
                    <td className="px-4 py-4 text-center text-blue-800">
                      {formatValue(dailySummary.totalPrecipitation)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>



      {/* No Data Message */}
      {observations.length === 0 && !dailySummary && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Data Available</h3>
            <p className="text-yellow-700">
              No weather observations or daily summary found for {selectedDate}. Please ensure both first card and
              second card data have been submitted.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

      {/* Summary Statistics */}
// {dailySummary && (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       <Card className="border-green-200 bg-green-50">
//         <CardContent className="p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-green-600">Max Temperature</p>
//               <p className="text-2xl font-bold text-green-800">{formatValue(dailySummary.maxTemperature, "°C")}</p>
//             </div>
//             <TrendingUp className="h-8 w-8 text-green-600" />
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="border-blue-200 bg-blue-50">
//         <CardContent className="p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-blue-600">Min Temperature</p>
//               <p className="text-2xl font-bold text-blue-800">{formatValue(dailySummary.minTemperature, "°C")}</p>
//             </div>
//             <TrendingUp className="h-8 w-8 text-blue-600 transform rotate-180" />
//           </div>
//         </CardContent>
//       </Card>

//       <Card className="border-cyan-200 bg-cyan-50">
//         <CardContent className="p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-cyan-600">Total Precipitation</p>
//               <p className="text-2xl font-bold text-cyan-800">
//                 {formatValue(dailySummary.totalPrecipitation, "mm")}
//               </p>
//             </div>
//             <Calendar className="h-8 w-8 text-cyan-600" />
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )}
