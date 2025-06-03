"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap, CircleMarker } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, Plus, Minus } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Cloud, Droplets, Thermometer, Wind, Navigation } from "lucide-react"
import WeatherConditionOverlay from "./weatherConditionOverlay"

// Station interface matching Prisma model
interface Station {
  id: string
  stationId: string
  name: string
  latitude: number
  longitude: number
  securityCode: string
  createdAt: Date
  updatedAt: Date
}

interface DailySummary {
  maxTemperature: string | null
  minTemperature: string | null
  totalPrecipitation: string | null
  windSpeed: string | null
  avTotalCloud: string | null
}

interface WeatherRemark {
  stationId: string
  weatherRemark: string | null
}

interface MapComponentProps {
  currentDate: string
  setCurrentDate: (date: string) => void
  isPlaying: boolean
  setIsPlaying: (playing: boolean) => void
  selectedStation: Station | null
  onStationSelect: (station: Station | null) => void
}

// Enhanced Thermometer Component
const ThermometerCard = ({
  maxTemp,
  minTemp,
}: {
  maxTemp: number | null
  minTemp: number | null
}) => {
  // Use average of max and min as current temperature, or max if min is not available
  const currentTemp = maxTemp !== null && minTemp !== null ? (maxTemp + minTemp) / 2 : maxTemp || 0
  const tempPercentage = Math.max(0, Math.min(100, ((currentTemp + 20) / 70) * 100))

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return "#1e40af" // Deep blue
    if (temp < 10) return "#3b82f6" // Blue
    if (temp < 20) return "#06b6d4" // Cyan
    if (temp < 30) return "#10b981" // Green
    if (temp < 35) return "#f59e0b" // Yellow
    if (temp < 40) return "#f97316" // Orange
    return "#dc2626" // Red
  }

  return (
    <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200 flex flex-col items-center w-[110px]">
      <div className="flex items-center gap-1 mb-1">
        <Thermometer className="h-4 w-4 text-red-500" />
        <span className="text-xs font-medium">Temperature</span>
      </div>

      {/* Thermometer Visual */}
      <div className="relative w-6 h-24 bg-gray-200 rounded-full overflow-hidden mb-1">
        {/* Temperature fill */}
        <div
          className="absolute bottom-0 w-full transition-all duration-1000 ease-out rounded-full"
          style={{
            height: `${tempPercentage}%`,
            backgroundColor: getTemperatureColor(currentTemp),
            boxShadow: `0 0 5px ${getTemperatureColor(currentTemp)}40`,
          }}
        />

        {/* Thermometer bulb */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full border border-white"
          style={{ backgroundColor: getTemperatureColor(currentTemp) }}
        />

        {/* Scale marks */}
        {[0, 25, 50, 75, 100].map((mark) => (
          <div key={mark} className="absolute right-0 w-2 h-0.5 bg-gray-400" style={{ bottom: `${mark}%` }} />
        ))}
      </div>

      {/* Temperature readings */}
      <div className="text-center">
        <div className="text-sm font-bold" style={{ color: getTemperatureColor(currentTemp) }}>
          {currentTemp.toFixed(1)}°C
        </div>
        {maxTemp !== null && minTemp !== null && (
          <div className="text-xs text-gray-500">
            H: {maxTemp}° L: {minTemp}°
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced Compass Component
const CompassCard = ({ windSpeed }: { windSpeed: number | null }) => {
  const speed = windSpeed || 0
  // Generate wind direction based on wind speed (since API doesn't provide direction)
  // Higher wind speeds tend to be more consistent in direction
  const direction = speed > 0 ? (speed * 23.7) % 360 : 0

  const getWindSpeedColor = (speed: number) => {
    if (speed < 5) return "#10b981" // Green - Light
    if (speed < 15) return "#f59e0b" // Yellow - Moderate
    if (speed < 25) return "#f97316" // Orange - Strong
    return "#dc2626" // Red - Very strong
  }

  const getDirectionName = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    return directions[Math.round(deg / 45) % 8]
  }

  return (
    <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200 flex flex-col items-center w-[110px]">
      <div className="flex items-center gap-1 mb-1">
        <Navigation className="h-4 w-4 text-blue-500" />
        <span className="text-xs font-medium">Wind</span>
      </div>

      {/* Compass Visual */}
      <div className="relative w-20 h-20 mb-1">
        {/* Compass circle */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-300 bg-gradient-to-br from-blue-50 to-blue-100">
          {/* Cardinal directions */}
          <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-gray-700">
            N
          </div>
          <div className="absolute right-0.5 top-1/2 transform -translate-y-1/2 text-[8px] font-bold text-gray-700">
            E
          </div>
          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-gray-700">
            S
          </div>
          <div className="absolute left-0.5 top-1/2 transform -translate-y-1/2 text-[8px] font-bold text-gray-700">
            W
          </div>
        </div>

        {/* Wind direction arrow */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${direction}deg)` }}
        >
          <div
            className="w-0.5 h-7 rounded-full shadow-sm"
            style={{
              backgroundColor: getWindSpeedColor(speed),
              boxShadow: `0 0 4px ${getWindSpeedColor(speed)}60`,
            }}
          />
          <div
            className="absolute top-2 w-0 h-0 border-l-[3px] border-r-[3px] border-b-[6px] border-transparent"
            style={{ borderBottomColor: getWindSpeedColor(speed) }}
          />
        </div>

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-600 rounded-full" />
      </div>

      {/* Wind readings */}
      <div className="text-center">
        <div className="text-sm font-bold" style={{ color: getWindSpeedColor(speed) }}>
          {speed} km/h
        </div>
        <div className="text-xs text-gray-500">
          {getDirectionName(direction)} ({Math.round(direction)}°)
        </div>
      </div>
    </div>
  )
}

// Enhanced Rain Meter Component
const RainMeterCard = ({ precipitation }: { precipitation: number | null }) => {
  const value = precipitation || 0

  const getRainColor = (val: number) => {
    if (val < 0.1) return "#dbeafe" // Very light blue - Trace
    if (val < 2.5) return "#93c5fd" // Light blue - Light
    if (val < 7.6) return "#60a5fa" // Medium blue - Moderate
    if (val < 20) return "#3b82f6" // Blue - Heavy
    if (val < 50) return "#2563eb" // Dark blue - Very heavy
    return "#1e40af" // Very dark blue - Extreme
  }

  const getRainLevel = (val: number) => {
    if (val < 0.1) return "Trace"
    if (val < 2.5) return "Light"
    if (val < 7.6) return "Moderate"
    if (val < 20) return "Heavy"
    if (val < 50) return "V. Heavy"
    return "Extreme"
  }

  // Calculate fill height (max 100%)
  const fillHeight = Math.min(100, (value / 50) * 100)

  return (
    <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200 flex flex-col items-center w-[110px]">
      <div className="flex items-center gap-1 mb-1">
        <Droplets className="h-4 w-4 text-blue-500" />
        <span className="text-xs font-medium">Rainfall</span>
      </div>

      {/* Rain Gauge Visual */}
      <div className="relative w-6 h-24 bg-gray-100 rounded-md overflow-hidden mb-1 border border-gray-300">
        {/* Water level marks */}
        {[0, 20, 40, 60, 80, 100].map((mark) => (
          <div key={mark} className="absolute w-full h-[1px] bg-gray-300" style={{ bottom: `${mark}%` }} />
        ))}

        {/* Water fill */}
        <div
          className="absolute bottom-0 w-full transition-all duration-1000 ease-out"
          style={{
            height: `${fillHeight}%`,
            backgroundColor: getRainColor(value),
            boxShadow: `0 0 5px ${getRainColor(value)}40`,
          }}
        >
          {/* Water surface effect */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white opacity-30"></div>
        </div>
      </div>

      {/* Rain readings */}
      <div className="text-center">
        <div className="text-sm font-bold" style={{ color: getRainColor(value) }}>
          {value.toFixed(1)} mm
        </div>
        <div className="text-xs text-gray-500">{getRainLevel(value)}</div>
      </div>
    </div>
  )
}

// Enhanced Cloud Meter Component
const CloudMeterCard = ({ cloudCover }: { cloudCover: number | null }) => {
  const cover = cloudCover || 0

  const getCloudColor = (cover: number) => {
    if (cover < 10) return "#f0f9ff" // Very light blue - Clear
    if (cover < 30) return "#e0f2fe" // Light blue - Few
    if (cover < 50) return "#bae6fd" // Medium blue - Scattered
    if (cover < 80) return "#7dd3fc" // Blue - Broken
    return "#0ea5e9" // Dark blue - Overcast
  }

  const getCloudLevel = (cover: number) => {
    if (cover < 10) return "Clear"
    if (cover < 30) return "Few"
    if (cover < 50) return "Scattered"
    if (cover < 80) return "Broken"
    return "Overcast"
  }

  return (
    <div className="bg-white p-2 rounded-lg shadow-md border border-gray-200 flex flex-col items-center w-[110px]">
      <div className="flex items-center gap-1 mb-1">
        <Cloud className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium">Cloud Cover</span>
      </div>

      {/* Cloud Meter Visual */}
      <div className="relative w-20 h-20 mb-1">
        {/* Sky background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-400 to-blue-100 overflow-hidden">
          {/* Cloud cover visualization */}
          <div
            className="absolute inset-0 bg-white transition-opacity duration-1000 ease-out"
            style={{
              opacity: cover / 100,
              backgroundImage:
                "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDU2IDQ4Ij48cGF0aCBmaWxsPSIjZjBmOWZmIiBmaWxsLW9wYWNpdHk9IjAuOCIgZD0iTTEyIDQwYzYuNjI3IDAgMTItNS4zNzMgMTItMTIgMC01LjI5MS0zLjQzOC05Ljc5OC04LjItMTEuNDAxLjEzMy0uNjA0LjItMS4yMzMuMi0xLjg3OUMxNiA4LjY3MSAxMC42MjcgMy4yOTkgNCAxLjk5OSAxMC41NiA2Ljc5OCAxNSAxMy4xOTcgMTUgMjAuNjYzYzAgMS4xMzEtLjA5NCAyLjI0Mi0uMjcxIDMuMzI5QzE2LjUzNiAyNS4yMTkgMTQgMjcuOTQ3IDE0IDMxLjMzYzAgMi40MTYgMS45NTMgNC4zOCA0LjM2NyA0LjM4SDEyVjQwem0yOCAwYzYuNjI3IDAgMTItNS4zNzMgMTItMTIgMC01LjI5MS0zLjQzOC05Ljc5OC04LjItMTEuNDAxLjEzMy0uNjA0LjItMS4yMzMuMi0xLjg3OUM0NCA4LjY3MSAzOC42MjcgMy4yOTkgMzIgMS45OTljNi41NiA0Ljc5OSAxMSAxMS4xOTcgMTEgMTguNjY0IDAgMS4xMzEtLjA5NCAyLjI0Mi0uMjcxIDMuMzI5QzQ0LjUzNiAyNS4yMTkgNDIgMjcuOTQ3IDQyIDMxLjMzYzAgMi40MTYgMS45NTMgNC4zOCA0LjM2NyA0LjM4SDQwVjQweiIvPjwvc3ZnPg==')",
              backgroundSize: "cover",
            }}
          />
        </div>

        {/* Percentage indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-lg font-bold text-white text-shadow">{Math.round(cover)}%</div>
        </div>
      </div>

      {/* Cloud cover description */}
      <div className="text-center">
        <div className="text-sm font-bold" style={{ color: getCloudColor(cover) }}>
          {getCloudLevel(cover)}
        </div>
        <div className="text-xs text-gray-500">{Math.round(cover)}% covered</div>
      </div>
    </div>
  )
}

// Weather Card Components (keeping existing ones for popup)
const TemperatureCard = ({
  maxTemp,
  minTemp,
}: {
  maxTemp: number | null
  minTemp: number | null
}) => {
  const getTemperatureColor = (temp: number | null) => {
    if (!temp) return "bg-gray-200"
    if (temp < 10) return "bg-blue-400"
    if (temp < 20) return "bg-blue-300"
    if (temp < 30) return "bg-green-400"
    if (temp < 35) return "bg-yellow-400"
    return "bg-red-500"
  }

  return (
    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center w-24">
      <div className="flex items-center gap-1 mb-1">
        <Thermometer className="h-4 w-4 text-orange-500" />
        <span className="text-xs font-medium">Temp</span>
      </div>
      {maxTemp !== null && minTemp !== null ? (
        <>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
            <div
              className={`h-full ${getTemperatureColor(maxTemp)}`}
              style={{ width: `${Math.min(100, (maxTemp / 50) * 100)}%` }}
            />
          </div>
          <div className="text-xs">
            <span className="font-semibold">{maxTemp}°</span>
            <span className="text-gray-500">/{minTemp}°</span>
          </div>
        </>
      ) : (
        <span className="text-xs text-gray-500">N/A</span>
      )}
    </div>
  )
}

const PrecipitationCard = ({ value }: { value: number | null }) => {
  const getPrecipitationLevel = (val: number | null) => {
    if (!val) return 0
    if (val < 0.1) return 1 // Trace
    if (val < 2.5) return 2 // Light
    if (val < 7.6) return 3 // Moderate
    if (val < 50) return 4 // Heavy
    return 5 // Very heavy
  }

  const levels = [
    { label: "None", color: "bg-blue-100" },
    { label: "Trace", color: "bg-blue-200" },
    { label: "Light", color: "bg-blue-300" },
    { label: "Moderate", color: "bg-blue-400" },
    { label: "Heavy", color: "bg-blue-500" },
    { label: "V. Heavy", color: "bg-blue-600" },
  ]

  const level = getPrecipitationLevel(value)

  return (
    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center w-24">
      <div className="flex items-center gap-1 mb-1">
        <Droplets className="h-4 w-4 text-blue-500" />
        <span className="text-xs font-medium">Rain</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1 relative">
        {levels.map((_, i) => (
          <div
            key={i}
            className={`absolute h-full ${i <= level ? levels[i].color : "bg-gray-200"}`}
            style={{
              left: `${(i / 5) * 100}%`,
              width: `${100 / 5}%`,
              borderRight: i < 5 ? "1px solid white" : "none",
            }}
          />
        ))}
      </div>
      <div className="text-xs">
        {value !== null ? (
          <span className="font-semibold">{value} mm</span>
        ) : (
          <span className="text-gray-500">No data</span>
        )}
      </div>
    </div>
  )
}

const WindSpeedCard = ({ speed }: { speed: number | null }) => {
  const getWindLevel = (val: number | null) => {
    if (!val) return 0
    if (val < 1) return 0 // Calm
    if (val < 4) return 1 // Light
    if (val < 8) return 2 // Moderate
    if (val < 12) return 3 // Fresh
    if (val < 20) return 4 // Strong
    return 5 // Gale
  }

  const levels = [
    { label: "Calm", color: "bg-gray-200" },
    { label: "Light", color: "bg-green-200" },
    { label: "Moderate", color: "bg-green-300" },
    { label: "Fresh", color: "bg-yellow-300" },
    { label: "Strong", color: "bg-orange-300" },
    { label: "Gale", color: "bg-red-400" },
  ]

  const level = getWindLevel(speed)

  return (
    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center w-24">
      <div className="flex items-center gap-1 mb-1">
        <Wind className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium">Wind</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1 relative">
        {levels.map((_, i) => (
          <div
            key={i}
            className={`absolute h-full ${i <= level ? levels[i].color : "bg-gray-200"}`}
            style={{
              left: `${(i / 5) * 100}%`,
              width: `${100 / 5}%`,
              borderRight: i < 5 ? "1px solid white" : "none",
            }}
          />
        ))}
      </div>
      <div className="text-xs">
        {speed !== null ? (
          <span className="font-semibold">{speed} NM</span>
        ) : (
          <span className="text-gray-500">No data</span>
        )}
      </div>
    </div>
  )
}

const CloudCoverCard = ({ cover }: { cover: number | null }) => {
  const getCloudLevel = (val: number | null) => {
    if (!val) return 0
    return Math.min(4, Math.floor(val / 25))
  }

  const levels = [
    { label: "Clear", color: "bg-blue-100" },
    { label: "Few", color: "bg-gray-200" },
    { label: "Scattered", color: "bg-gray-300" },
    { label: "Broken", color: "bg-gray-400" },
    { label: "Overcast", color: "bg-gray-500" },
  ]

  const level = getCloudLevel(cover)

  return (
    <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center w-24">
      <div className="flex items-center gap-1 mb-1">
        <Cloud className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium">Clouds</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-1 relative">
        {levels.map((_, i) => (
          <div
            key={i}
            className={`absolute h-full ${i <= level ? levels[i].color : "bg-gray-200"}`}
            style={{
              left: `${(i / 4) * 100}%`,
              width: `${100 / 4}%`,
              borderRight: i < 4 ? "1px solid white" : "none",
            }}
          />
        ))}
      </div>
      <div className="text-xs">
        {cover !== null ? (
          <span className="font-semibold">{cover}%</span>
        ) : (
          <span className="text-gray-500">No data</span>
        )}
      </div>
    </div>
  )
}

// Animated live location marker
function LiveLocationMarker({
  station,
}: {
  station: { coordinates: L.LatLngExpression } | null
}) {
  const [pulseSize, setPulseSize] = useState(10)
  const pulseRef = useRef<L.CircleMarker>(null)

  useEffect(() => {
    if (!station) return

    // Animation loop
    const interval = setInterval(() => {
      setPulseSize((prev) => (prev >= 30 ? 10 : prev + 2))
    }, 200)

    return () => clearInterval(interval)
  }, [station])

  useEffect(() => {
    if (pulseRef.current) {
      pulseRef.current.setRadius(pulseSize)
    }
  }, [pulseSize])

  if (!station) return null

  return (
    <CircleMarker
      ref={pulseRef}
      center={station.coordinates}
      radius={10}
      pathOptions={{
        fillColor: "#ff0000",
        color: "#ff0000",
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.3,
      }}
    />
  )
}

function FixLeafletIcons() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/station-icon.png",
      iconUrl: "/station-icon.png",
      shadowUrl: "/station-icon.png",
    })
  }, [])
  return null
}

function CustomZoomControl() {
  const map = useMap()
  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1 z-[1000]">
      <Button size="icon" variant="secondary" onClick={() => map.zoomIn()} className="h-8 w-8 bg-white">
        <Plus className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="secondary" onClick={() => map.zoomOut()} className="h-8 w-8 bg-white">
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  )
}

function StationMarkers({
  stations,
  selectedStation,
  onStationSelect,
  weatherData,
  weatherRemarks,
  currentDate,
  loading,
}: {
  stations: Station[]
  selectedStation: Station | null
  onStationSelect: (station: Station | null) => void
  weatherData: DailySummary | null
  weatherRemarks: WeatherRemark[]
  currentDate: string
  loading: boolean
}) {
  const [error, setError] = useState<string | null>(null)
  const map = useMap()

  // Function to get the appropriate icon for each station
  const getStationIcon = (station: Station) => {
    const stationRemark = weatherRemarks.find((remark) => remark.stationId === station.stationId)

    let iconUrl = "/broadcasting.png" // Default icon

    // If weather remark exists and has an image URL, use it
    if (stationRemark?.weatherRemark) {
      const remarkParts = stationRemark.weatherRemark.split(" - ")
      if (remarkParts.length > 0 && remarkParts[0].trim()) {
        iconUrl = remarkParts[0].trim()
      }
    }

    return L.icon({
      iconUrl: iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: stationRemark?.weatherRemark ? "weather-remark-icon" : "default-station-icon",
    })
  }

  // Function to get weather remark description
  const getWeatherDescription = (station: Station) => {
    const stationRemark = weatherRemarks.find((remark) => remark.stationId === station.stationId)
    if (stationRemark?.weatherRemark) {
      const remarkParts = stationRemark.weatherRemark.split(" - ")
      if (remarkParts.length > 1) {
        return remarkParts[1].trim()
      }
    }
    return "No weather remarks"
  }

  // Zoom to selected station
  useEffect(() => {
    if (!selectedStation) {
      map.fitBounds([
        [20.5, 88.0],
        [26.5, 92.5],
      ])
      return
    }

    map.flyTo([selectedStation.latitude, selectedStation.longitude], 12, {
      duration: 1,
    })
  }, [selectedStation, map])

  return (
    <>
      {/* Station markers */}
      {stations.map((station) => {
        const stationIcon = getStationIcon(station)
        const weatherDescription = getWeatherDescription(station)
        const hasWeatherRemark = weatherRemarks.some(
          (remark) => remark.stationId === station.stationId && remark.weatherRemark,
        )

        return (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={stationIcon}
            eventHandlers={{
              click: () => onStationSelect(station),
              mouseover: (e) => {
                const marker = e.target
                marker.openPopup()
              },
              mouseout: (e) => {
                const marker = e.target
                marker.closePopup()
              },
            }}
          >
            <Popup className="min-w-[280px]" autoClose={false} closeOnClick={false}>
              <div className="font-bold text-lg">{station.name}</div>
              <div className="text-sm">Station ID: {station.stationId}</div>
              <div className="text-sm mb-2">
                Coordinates: {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
              </div>

              {/* Weather Remark Section */}
              {hasWeatherRemark && (
                <div className="border-t pt-2 mt-2 mb-2">
                  <div className="text-sm font-medium mb-1">Current Weather:</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        weatherRemarks.find((r) => r.stationId === station.stationId)?.weatherRemark?.split(" - ")[0] ||
                        "/broadcasting.png" ||
                        "/placeholder.svg"
                      }
                      alt="Weather Symbol"
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/broadcasting.png"
                      }}
                    />
                    <span className="text-sm text-gray-700">{weatherDescription}</span>
                  </div>
                </div>
              )}

              {/* Weather Summary in Popup */}
              {selectedStation?.id === station.id && (
                <div className="border-t pt-2 mt-2">
                  {loading ? (
                    <div className="text-xs">Loading weather data...</div>
                  ) : error ? (
                    <div className="text-xs text-red-500">{error}</div>
                  ) : weatherData ? (
                    <div className="grid grid-cols-2 gap-2">
                      <TemperatureCard
                        maxTemp={weatherData.maxTemperature ? Number.parseFloat(weatherData.maxTemperature) : null}
                        minTemp={weatherData.minTemperature ? Number.parseFloat(weatherData.minTemperature) : null}
                      />
                      <PrecipitationCard
                        value={
                          weatherData.totalPrecipitation ? Number.parseFloat(weatherData.totalPrecipitation) : null
                        }
                      />
                      <WindSpeedCard speed={weatherData.windSpeed ? Number.parseFloat(weatherData.windSpeed) : null} />
                      <CloudCoverCard
                        cover={weatherData.avTotalCloud ? Number.parseFloat(weatherData.avTotalCloud) : null}
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No weather data available for {currentDate}</div>
                  )}
                </div>
              )}
            </Popup>
          </Marker>
        )
      })}

      {/* Live location animation */}
      {selectedStation && (
        <LiveLocationMarker
          station={{
            coordinates: [selectedStation.latitude, selectedStation.longitude],
          }}
        />
      )}
    </>
  )
}

export default function EnhancedMapComponent({
  currentDate,
  setCurrentDate,
  isPlaying,
  setIsPlaying,
  selectedStation,
  onStationSelect,
}: MapComponentProps) {
  // Generate dates for the last 7 days including today
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString("en-US", { day: "numeric", month: "short" }))
    }
    return dates
  }

  const dates = generateDates()
  const { data: session } = useSession()
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<DailySummary | null>(null)
  const [weatherRemarks, setWeatherRemarks] = useState<WeatherRemark[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef(null)

  // Fetch stations from API based on user role
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/stations")
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        setStations(data)

        // If user is station_admin or observer, auto-select their station
        if ((session?.user?.role === "station_admin" || session?.user?.role === "observer") && !selectedStation) {
          const userStation = data.find((station: Station) => station.stationId === session.user.station?.stationId)
          if (userStation) {
            onStationSelect(userStation)
          }
        }
      } catch (error) {
        console.error("Error fetching stations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStations()
  }, [session, selectedStation, onStationSelect])

  // Fetch weather remarks for all stations
  useEffect(() => {
    const fetchWeatherRemarks = async () => {
      try {
        const today = new Date().toISOString().split("T")[0] // "YYYY-MM-DD"
        const response = await fetch(`/api/synoptic-code?date=${today}`)
        if (!response.ok) throw new Error(`Error: ${response.status}`)

        const synopticData = await response.json()

        const remarks: WeatherRemark[] = synopticData.map((entry: any) => ({
          stationId: entry.ObservingTime?.station?.stationId || "",
          weatherRemark: entry.weatherRemark || null,
        }))

        setWeatherRemarks(remarks)
      } catch (error) {
        console.error("Error fetching weather remarks:", error)
        setWeatherRemarks([])
      }
    }

    fetchWeatherRemarks()
  }, [])

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true)
      setError(null) // Clear previous errors

      try {
        let stationToQuery: string | null = null
        let nameToDisplay = "Your Station"

        if (session?.user?.role === "super_admin") {
          stationToQuery = selectedStation?.id || session?.user?.station?.id || ""
          nameToDisplay = selectedStation?.name || "No Station"
        } else {
          stationToQuery = session?.user?.station?.id || ""
          nameToDisplay = session?.user?.station?.name || "Your Station"
        }

        if (!stationToQuery) {
          setWeatherData(null)
          setError("No station selected")
          setLoading(false)
          return
        }

        // Get today's date range in UTC
        const today = new Date()
        const startToday = new Date(today)
        startToday.setUTCHours(0, 0, 0, 0)

        const endToday = new Date(today)
        endToday.setUTCHours(23, 59, 59, 999)

        const response = await fetch(
          `/api/daily-summary?startDate=${startToday.toISOString()}&endDate=${endToday.toISOString()}&stationId=${stationToQuery}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }

        const data = await response.json()

        if (data.length === 0) {
          setError("No data available for selected station")
          setWeatherData(null)
          return
        }

        // Take the first entry (most recent)
        const latestEntry = data[0]
        setWeatherData(latestEntry)
        setError(null) // Clear error on successful data fetch
        setLastUpdated(new Date().toLocaleTimeString())
      } catch (err) {
        setError("Failed to fetch weather data")
        setWeatherData(null)
        console.error("Weather fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [selectedStation, session])

  return (
    <div className="relative h-full w-full z-10">
      {/* Map Container */}
      <div className="h-[500px] w-full rounded-lg overflow-hidden border-2 border-gray-200">
        {/* Weather Condition Overlay */}
        <WeatherConditionOverlay selectedStation={selectedStation} mapRef={mapRef} />
        <MapContainer
          ref={mapRef}
          center={[23.685, 90.3563]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          minZoom={6}
          maxBounds={[
            [20.5, 88.0],
            [26.5, 92.5],
          ]}
        >
          <FixLeafletIcons />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <StationMarkers
            stations={stations}
            selectedStation={selectedStation}
            onStationSelect={onStationSelect}
            weatherData={weatherData}
            weatherRemarks={weatherRemarks}
            currentDate={currentDate}
            loading={loading}
          />
          <CustomZoomControl />
        </MapContainer>

        
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-[1000]">
          <div className="bg-white p-4 rounded-lg shadow-lg">Loading stations...</div>
        </div>
      )}

      {/* Timeline Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant={isPlaying ? "default" : "outline"}
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-9 w-9"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Slider
            value={[dates.indexOf(currentDate)]}
            max={dates.length - 1}
            step={1}
            onValueChange={(value) => setCurrentDate(dates[value[0]])}
            className="flex-1 mx-2"
          />
          <div className="w-20 text-center font-medium text-sm bg-gray-100 py-1 px-2 rounded">{currentDate}</div>
        </div>
      </div>

      {/* User role indicator */}
      <div className="absolute top-2 right-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
        <div className="text-sm font-medium">
          {session?.user?.role === "super_admin"
            ? "Super Admin"
            : session?.user?.role === "station_admin"
              ? "Station Admin"
              : session?.user?.role === "observer"
                ? "Observer"
                : "Guest"}
        </div>
        <div className="text-xs text-gray-500">
          {session?.user?.role === "super_admin"
            ? "Viewing all stations"
            : session?.user?.role === "station_admin" || session?.user?.role === "observer"
              ? "Viewing your assigned station"
              : "No stations available"}
        </div>
      </div>

      {/* Selected station info */}
      {selectedStation && (
        <div className="absolute top-3 left-12 bg-white p-2 rounded-lg shadow-lg z-[1000]">
          <div className="text-sm font-medium">{selectedStation.name}</div>
          <div className="text-xs text-gray-600">
            Lat: {selectedStation.latitude.toFixed(4)}, Long: {selectedStation.longitude.toFixed(4)}
          </div>
          {lastUpdated && <div className="text-xs text-gray-500 mt-1">Updated: {lastUpdated}</div>}
        </div>
      )}

      {/* Enhanced Weather Instruments Panel - Using Real API Data */}
      {selectedStation && weatherData && (
        <div className="absolute bottom-20 right-4 z-[1000]">
          <div className="grid grid-cols-2 gap-2">
            <ThermometerCard
              maxTemp={weatherData.maxTemperature ? Number.parseFloat(weatherData.maxTemperature) : null}
              minTemp={weatherData.minTemperature ? Number.parseFloat(weatherData.minTemperature) : null}
            />
            <CompassCard windSpeed={weatherData.windSpeed ? Number.parseFloat(weatherData.windSpeed) : null} />
            <RainMeterCard
              precipitation={weatherData.totalPrecipitation ? Number.parseFloat(weatherData.totalPrecipitation) : null}
            />
            <CloudMeterCard
              cloudCover={weatherData.avTotalCloud ? Number.parseFloat(weatherData.avTotalCloud) : null}
            />
          </div>
        </div>
      )}

      {/* Show message when no data available */}
      {selectedStation && !weatherData && !loading && (
        <div className="absolute bottom-20 right-4 z-[1000]">
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <div className="text-sm text-gray-500 text-center">
              No weather data available
              <br />
              for selected station
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for weather icons */}
      <style jsx global>{`
        .weather-remark-icon {
          border-radius: 0;
          box-shadow: none;
          border: none;
        }

        .default-station-icon {
          border-radius: 0;
          box-shadow: none;
          border: none;
        }

        .text-shadow {
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}
