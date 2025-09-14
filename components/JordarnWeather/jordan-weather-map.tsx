"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic';
import WeatherSidebar from "./weather-sidebar"
import { type WeatherStationData } from "./weather-data"
import { Thermometer, Wind, Droplets, Gauge, CloudSnow, Sun } from "lucide-react"

// Client-side only component to wrap the map
function ClientOnlyMap({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? <>{children}</> : null
}

// Dynamically import MapComponent with SSR disabled
const DynamicMap = dynamic(
  () => import('@/components/JordarnWeather/MapJordarn'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse">Loading map...</div>
      </div>
    )
  }
)

interface JordanWeatherMapProps {
  selectedStation?: WeatherStationData | null
  onStationSelect?: (station: WeatherStationData | null) => void
}

export default function JordanWeatherMap({ selectedStation, onStationSelect }: JordanWeatherMapProps) {
  const [activeParameters, setActiveParameters] = useState<Set<string>>(new Set())
  const [selectedStationData, setSelectedStationData] = useState<WeatherStationData | null>(null)
  const [isClient, setIsClient] = useState(false)
  // State for map controls
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" })
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setIsMounted(true)
  }, [])

  const handleParameterToggle = (parameterId: string, enabled: boolean) => {
    setActiveParameters((prev) => {
      const newSet = new Set(prev)
      if (enabled) {
        newSet.add(parameterId)
      } else {
        newSet.delete(parameterId)
      }
      return newSet
    })
  }

  // Keeping sidebar and overlays unchanged; station selection from MapComponent is not wired here

  const getParameterIcon = (parameterId: string) => {
    switch (parameterId) {
      case "temperature":
        return Thermometer
      case "wind":
        return Wind
      case "humidity":
        return Droplets
      case "pressure":
        return Gauge
      case "dewpoint":
        return CloudSnow
      case "solar":
        return Sun
      default:
        return Thermometer
    }
  }

  const getParameterValue = (station: WeatherStationData, parameterId: string) => {
    switch (parameterId) {
      case "temperature":
        return station.maxTemp ? `${station.maxTemp}°C` : "N/A"
      case "wind":
        return "N/A" // Wind data not available in current dataset
      case "humidity":
        return station.relativeHumidity ? `${station.relativeHumidity}%` : "N/A"
      case "pressure":
        return "N/A" // Pressure data not available in current dataset
      case "dewpoint":
        return "N/A" // Dew point data not available in current dataset
      case "solar":
        return "N/A" // Solar radiation data not available in current dataset
      default:
        return "N/A"
    }
  }

  if (!isMounted) {
    return (
      <div className="flex h-screen">
        <WeatherSidebar onParameterToggle={handleParameterToggle} />
        <div className="flex-1 flex items-center justify-center">
          <div>Loading map...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <WeatherSidebar onParameterToggle={handleParameterToggle} />

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <ClientOnlyMap>
          <DynamicMap
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            selectedStation={null}
            onStationSelect={() => {}}
          />
        </ClientOnlyMap>

        {/* Active Parameter Icons Overlay */}
        {activeParameters.size > 0 && selectedStationData && (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
            <h3 className="font-semibold mb-3">{selectedStationData.stationName}</h3>
            <div className="space-y-2">
              {Array.from(activeParameters).map((parameterId) => {
                const Icon = getParameterIcon(parameterId)
                const value = getParameterValue(selectedStationData, parameterId)

                return (
                  <div key={parameterId} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium capitalize">{parameterId.replace("-", " ")}</span>
                    <span className="text-sm">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
