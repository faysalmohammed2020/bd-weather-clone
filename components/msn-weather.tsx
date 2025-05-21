"use client"

import type React from "react"

import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Eye,
  Cloud,
  CloudSun,
  AlertTriangle,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface WeatherData {
  maxTemperature: string | null
  minTemperature: string | null
  totalPrecipitation: string | null
  windSpeed: string | null
  avTotalCloud: string | null
  avRelativeHumidity: string | null
  lowestVisibility: string | null
  totalRainDuration: string | null
}

interface WeatherCardProps {
  icon: React.ReactNode
  title: string
  value: string
  status: string
  description: string
  color: string
  textColor: string
  subtext?: string
}

function WeatherCard({ icon, title, value, status, description, color, textColor, subtext }: WeatherCardProps) {
  return (
    <div className={`rounded-xl shadow-md p-5 space-y-3 transition-all duration-300 hover:shadow-lg ${color}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-gray-800">{title}</h3>
        <div className="p-2 bg-white rounded-full shadow-sm">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      {subtext && <div className="text-sm text-gray-600">{subtext}</div>}
      <div className={`font-medium ${textColor} pb-1 border-b border-gray-200`}>{status}</div>
      <p className="text-sm text-gray-600 leading-snug">{description}</p>
    </div>
  )
}

export default function WeatherDashboard({
  selectedStation,
}: {
  selectedStation: any | null
}) {
  const { data: session } = useSession()
  const role = session?.user.role

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stationName, setStationName] = useState<string>("No Station Selected")
  const [showLegend, setShowLegend] = useState(false)

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true)
      setError(null)

      try {
        let stationToQuery: string | null = null
        let nameToDisplay = "Your Station"

        // Super admin logic
        if (session?.user?.role === "super_admin") {
          stationToQuery = selectedStation?.stationId || session?.user?.station?.stationId || ""
          nameToDisplay = selectedStation?.name || ""
        } else {
          // Other roles: always use own station
          stationToQuery = session?.user?.station?.stationId || ""
          nameToDisplay = session?.user?.station?.name || "Your Station"
        }

        if (!stationToQuery) {
          setError("No station selected")
          setLoading(false)
          return
        }

        // Update station name for display
        setStationName(nameToDisplay)

        // Get current date in "DD-MMM" format
        const date = new Date()
        const day = date.getDate()
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const month = monthNames[date.getMonth()]
        const dateString = `${day}-${month}`

        // Fetch data
        const response = await fetch(`/api/daily-summary?stationNo=${stationToQuery}&date=${dateString}`)

        if (!response.ok) {
          setWeatherData(null)
          toast.error("No Data Found!")
          return
        }

        const data = await response.json()

        // Check if data has any non-null value
        const hasValidData = Object.values(data).some((val) => val !== null && val !== undefined)

        if (!hasValidData) {
          setError("No data available for selected station")
        }

        setWeatherData(data)
      } catch (err) {
        setError("Failed to fetch weather data")
        console.error("Error fetching weather data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [selectedStation, session])

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Weather Dashboard</h2>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">Loading weather data...</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-5 space-y-4 animate-pulse">
              <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-4 w-full bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default values if data is not available
  const defaultValues = {
    maxTemperature: "N/A",
    minTemperature: "N/A",
    totalPrecipitation: "N/A",
    windSpeed: "N/A",
    avTotalCloud: "N/A",
    avRelativeHumidity: "N/A",
    lowestVisibility: "N/A",
    totalRainDuration: "N/A",
  }

  const data = weatherData
    ? {
        maxTemperature: weatherData.maxTemperature || defaultValues.maxTemperature,
        minTemperature: weatherData.minTemperature || defaultValues.minTemperature,
        totalPrecipitation: weatherData.totalPrecipitation || defaultValues.totalPrecipitation,
        windSpeed: weatherData.windSpeed || defaultValues.windSpeed,
        avTotalCloud: weatherData.avTotalCloud || defaultValues.avTotalCloud,
        avRelativeHumidity: weatherData.avRelativeHumidity || defaultValues.avRelativeHumidity,
        lowestVisibility: weatherData.lowestVisibility || defaultValues.lowestVisibility,
        totalRainDuration: weatherData.totalRainDuration || defaultValues.totalRainDuration,
      }
    : defaultValues

  // Calculate temperature difference
  const tempDiff =
    data.maxTemperature !== "N/A" && data.minTemperature !== "N/A"
      ? `${(Number.parseFloat(data.maxTemperature) - Number.parseFloat(data.minTemperature)).toFixed(1)}°`
      : "N/A"

  // Format date for display
  const today = new Date()
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="w-full p-6 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Weather Dashboard</h2>
          <p className="text-gray-600">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
          >
            {showLegend ? "Hide Legend" : "Show Legend"}
          </button>
          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md flex items-center">
            <CloudSun className="mr-2" size={20} />
            <span>{stationName}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded flex items-center">
          <AlertTriangle className="mr-2" />
          <span> No Recorded Data Found</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Temperature */}
        <WeatherCard
          icon={<Thermometer className="text-red-500" size={24} />}
          title="Temperature"
          value={data.maxTemperature !== "N/A" ? `${data.maxTemperature}°` : "N/A"}
          status={`High: ${data.maxTemperature !== "N/A" ? `${data.maxTemperature}°` : "N/A"} | Low: ${data.minTemperature !== "N/A" ? `${data.minTemperature}°` : "N/A"}`}
          description={`Daily range: ${tempDiff}. Overnight low of ${data.minTemperature !== "N/A" ? `${data.minTemperature}°` : "N/A"}`}
          color="bg-gradient-to-br from-orange-50 to-yellow-100"
          textColor="text-orange-700"
        />

        {/* Cloud Cover */}
        <WeatherCard
          icon={<Cloud className="text-gray-600" size={24} />}
          title="Cloud Cover"
          value={data.avTotalCloud !== "N/A" ? `${data.avTotalCloud}%` : "N/A"}
          status={
            data.avTotalCloud !== "N/A"
              ? Number.parseInt(data.avTotalCloud) > 50
                ? "Mostly Cloudy"
                : "Partly Cloudy"
              : "No Data Recorded"
          }
          description={`Average cloud cover today`}
          color="bg-gradient-to-br from-gray-50 to-gray-100"
          textColor="text-gray-700"
        />

        {/* Precipitation */}
        <WeatherCard
          icon={<CloudRain className="text-blue-600" size={24} />}
          title="Precipitation"
          value={data.totalPrecipitation !== "N/A" ? `${data.totalPrecipitation} mm` : "N/A"}
          status={
            data.totalPrecipitation !== "N/A"
              ? Number.parseFloat(data.totalPrecipitation) > 0
                ? "Rain recorded"
                : "No precipitation"
              : "No Data Recorded"
          }
          description={`Total precipitation in last 24 hours`}
          color="bg-gradient-to-br from-blue-50 to-indigo-100"
          textColor="text-blue-700"
        />

        {/* Wind */}
        <WeatherCard
          icon={<Wind className="text-teal-600" size={24} />}
          title="Wind Speed"
          value={data.windSpeed !== "N/A" ? `${data.windSpeed} NM` : "N/A"}
          status={`Current wind conditions`}
          description={`Steady at ${data.windSpeed !== "N/A" ? `${data.windSpeed} NM` : "N/A"}`}
          color="bg-gradient-to-br from-teal-50 to-green-100"
          textColor="text-teal-700"
        />

        {/* Humidity */}
        <WeatherCard
          icon={<Droplets className="text-cyan-600" size={24} />}
          title="Humidity"
          value={data.avRelativeHumidity !== "N/A" ? `${data.avRelativeHumidity}%` : "N/A"}
          status={
            data.avRelativeHumidity !== "N/A"
              ? Number.parseInt(data.avRelativeHumidity) > 70
                ? "Very humid"
                : "Moderate humidity"
              : "No Data Recorded"
          }
          description={`Relative humidity in the air`}
          color="bg-gradient-to-br from-cyan-50 to-blue-100"
          textColor="text-cyan-700"
        />

        {/* Visibility */}
        <WeatherCard
          icon={<Eye className="text-purple-600" size={24} />}
          title="Visibility"
          value={data.lowestVisibility !== "N/A" ? `${data.lowestVisibility} km` : "N/A"}
          status={
            data.lowestVisibility !== "N/A"
              ? Number.parseInt(data.lowestVisibility) > 10
                ? "Excellent"
                : "Good"
              : "No Data Recorded"
          }
          description={`Current visibility conditions`}
          color="bg-gradient-to-br from-purple-50 to-pink-100"
          textColor="text-purple-700"
        />
      </div>
    </div>
  )
}
