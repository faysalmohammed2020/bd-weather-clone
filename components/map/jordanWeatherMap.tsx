"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap, CircleMarker, Polygon } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, Plus, Minus, Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Cloud, Droplets, Thermometer, Wind, Eye, Gauge, CloudSnow, Waves } from "lucide-react"
import { useTranslations } from "next-intl"

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

type WeatherParameter =
  | "temperature"
  | "precipitation"
  | "wind"
  | "clouds"
  | "humidity"
  | "visibility"
  | "pressure"
  | "dewpoint"

// Jordan District Feature interface
interface DistrictFeature {
  type: string
  properties: {
    name: string
    name_en: string
    admin_level: number
    id: string
  }
  geometry: {
    type: string
    coordinates: number[][][]
  }
}

interface DistrictFeatureCollection {
  type: string
  features: DistrictFeature[]
}

// Weather condition types
type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rain" | "heavy-rain" | "thunderstorm"

const weatherColors: Record<WeatherCondition, string> = {
  sunny: "#FFD700",
  "partly-cloudy": "#87CEEB",
  cloudy: "#708090",
  rain: "#4682B4",
  "heavy-rain": "#4169E1",
  thunderstorm: "#483D8B",
}

// Weather parameter configuration
const weatherParameters = [
  {
    key: "temperature" as WeatherParameter,
    label: "Temperature",
    icon: Thermometer,
    color: "#f46b6b",
    unit: "°C",
  },
  {
    key: "precipitation" as WeatherParameter,
    label: "Precipitation",
    icon: Droplets,
    color: "#0d6cd9",
    unit: "mm",
  },
  {
    key: "wind" as WeatherParameter,
    label: "Wind",
    icon: Wind,
    color: "#19ec86",
    unit: "km/h",
  },
  {
    key: "clouds" as WeatherParameter,
    label: "Clouds",
    icon: Cloud,
    color: "#f46b6b",
    unit: "%",
  },
  {
    key: "humidity" as WeatherParameter,
    label: "Humidity",
    icon: Waves,
    color: "#93c47d",
    unit: "%",
  },
  {
    key: "visibility" as WeatherParameter,
    label: "Visibility",
    icon: Eye,
    color: "#478fa4",
    unit: "km",
  },
  {
    key: "pressure" as WeatherParameter,
    label: "Sea Level Pressure",
    icon: Gauge,
    color: "#f46b6b",
    unit: "hPa",
  },
  {
    key: "dewpoint" as WeatherParameter,
    label: "Dew Point",
    icon: CloudSnow,
    color: "#674ea7",
    unit: "°C",
  },
]

// Jordan Districts GeoJSON data (Admin Level 6)
const jordanDistricts: DistrictFeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "عمان", name_en: "Amman", admin_level: 6, id: "amman" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.8, 31.8],
            [36.0, 31.8],
            [36.0, 32.1],
            [35.8, 32.1],
            [35.8, 31.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "إربد", name_en: "Irbid", admin_level: 6, id: "irbid" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.7, 32.4],
            [36.0, 32.4],
            [36.0, 32.7],
            [35.7, 32.7],
            [35.7, 32.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "الزرقاء", name_en: "Zarqa", admin_level: 6, id: "zarqa" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [36.0, 32.0],
            [36.3, 32.0],
            [36.3, 32.3],
            [36.0, 32.3],
            [36.0, 32.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "البلقاء", name_en: "Balqa", admin_level: 6, id: "balqa" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.6, 31.8],
            [35.9, 31.8],
            [35.9, 32.1],
            [35.6, 32.1],
            [35.6, 31.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "مادبا", name_en: "Madaba", admin_level: 6, id: "madaba" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.7, 31.5],
            [36.0, 31.5],
            [36.0, 31.8],
            [35.7, 31.8],
            [35.7, 31.5],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "الكرك", name_en: "Karak", admin_level: 6, id: "karak" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.5, 31.0],
            [35.8, 31.0],
            [35.8, 31.4],
            [35.5, 31.4],
            [35.5, 31.0],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "الطفيلة", name_en: "Tafilah", admin_level: 6, id: "tafilah" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.4, 30.6],
            [35.7, 30.6],
            [35.7, 31.0],
            [35.4, 31.0],
            [35.4, 30.6],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "معان", name_en: "Ma'an", admin_level: 6, id: "maan" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.5, 29.8],
            [36.5, 29.8],
            [36.5, 30.8],
            [35.5, 30.8],
            [35.5, 29.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "العقبة", name_en: "Aqaba", admin_level: 6, id: "aqaba" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [34.9, 29.4],
            [35.1, 29.4],
            [35.1, 29.7],
            [34.9, 29.7],
            [34.9, 29.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "عجلون", name_en: "Ajloun", admin_level: 6, id: "ajloun" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.6, 32.2],
            [35.8, 32.2],
            [35.8, 32.5],
            [35.6, 32.5],
            [35.6, 32.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "جرش", name_en: "Jerash", admin_level: 6, id: "jerash" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [35.8, 32.2],
            [36.0, 32.2],
            [36.0, 32.4],
            [35.8, 32.4],
            [35.8, 32.2],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { name: "المفرق", name_en: "Mafraq", admin_level: 6, id: "mafraq" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [36.0, 32.2],
            [37.0, 32.2],
            [37.0, 33.0],
            [36.0, 33.0],
            [36.0, 32.2],
          ],
        ],
      },
    },
  ],
}

// Function to determine which district a station belongs to
function getStationDistrict(station: Station): DistrictFeature | null {
  for (const district of jordanDistricts.features) {
    const coords = district.geometry.coordinates[0]
    const polygon = coords.map((coord) => [coord[1], coord[0]]) // Convert to [lat, lng]

    // Simple point-in-polygon check
    if (isPointInPolygon([station.latitude, station.longitude], polygon)) {
      return district
    }
  }
  return null
}

// Point in polygon algorithm
function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }

  return inside
}

// Get weather condition based on weather data
function getWeatherCondition(weatherData: DailySummary | null): WeatherCondition {
  if (!weatherData) return "sunny"

  const precipitation = weatherData.totalPrecipitation ? Number.parseFloat(weatherData.totalPrecipitation) : 0
  const cloudCover = weatherData.avTotalCloud ? Number.parseFloat(weatherData.avTotalCloud) : 0

  if (precipitation > 20) return "heavy-rain"
  if (precipitation > 5) return "rain"
  if (cloudCover > 75) return "cloudy"
  if (cloudCover > 25) return "partly-cloudy"
  return "sunny"
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
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.3,
        color: "#ff6b6b",
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

// District Polygons Component
function DistrictPolygons({
  selectedStation,
  weatherData,
  activeWeatherLayer,
}: {
  selectedStation: Station | null
  weatherData: DailySummary | null
  activeWeatherLayer: WeatherParameter | null
}) {
  const map = useMap()
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictFeature | null>(null)

  useEffect(() => {
    if (selectedStation) {
      const district = getStationDistrict(selectedStation)
      setSelectedDistrict(district)

      if (district) {
        // Zoom to district bounds
        const coords = district.geometry.coordinates[0]
        const bounds = L.latLngBounds(coords.map((coord) => [coord[1], coord[0]]))
        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 10,
          duration: 0.8,
        })
      }
    } else {
      setSelectedDistrict(null)
    }
  }, [selectedStation, map])

  if (!selectedDistrict) return null

  const weatherCondition = getWeatherCondition(weatherData)
  const polygonColor = activeWeatherLayer
    ? weatherParameters.find((p) => p.key === activeWeatherLayer)?.color || "#4682B4"
    : weatherColors[weatherCondition]

  return (
    <Polygon
      positions={selectedDistrict.geometry.coordinates[0].map((coord) => [coord[1], coord[0]])}
      pathOptions={{
        color: polygonColor,
        weight: 3,
        opacity: 0.8,
        fillColor: polygonColor,
        fillOpacity: 0.3,
      }}
    >
      <Popup>
        <div className="font-bold text-lg">{selectedDistrict.properties.name_en}</div>
        <div className="text-sm text-gray-600">{selectedDistrict.properties.name}</div>
        <div className="text-sm mt-2">Admin Level: {selectedDistrict.properties.admin_level}</div>
        {weatherData && (
          <div className="mt-2 border-t pt-2">
            <div className="text-sm font-medium mb-1">District Weather:</div>
            <div className="text-xs">
              Temperature: {weatherData.maxTemperature || "N/A"}°C / {weatherData.minTemperature || "N/A"}°C
            </div>
            <div className="text-xs">Precipitation: {weatherData.totalPrecipitation || "0"} mm</div>
            <div className="text-xs">Cloud Cover: {weatherData.avTotalCloud || "0"}%</div>
          </div>
        )}
      </Popup>
    </Polygon>
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
  const map = useMap()
  const t = useTranslations("dashboard.mapComponent")

  const getStationIcon = (station: Station) => {
    const stationRemark = weatherRemarks.find((remark) => remark.stationId === station.stationId)
    let iconUrl = "/broadcasting.png"

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

  return (
    <>
      {stations.map((station) => {
        const stationIcon = getStationIcon(station)
        const weatherDescription = getWeatherDescription(station)
        const hasWeatherRemark = weatherRemarks.some(
          (remark) => remark.stationId === station.stationId && remark.weatherRemark,
        )
        const district = getStationDistrict(station)

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

              {district && (
                <div className="text-sm mb-2 bg-blue-50 p-2 rounded">
                  <div className="font-medium">District: {district.properties.name_en}</div>
                  <div className="text-xs text-gray-600">{district.properties.name}</div>
                </div>
              )}

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

              {selectedStation?.id === station.id && (
                <div className="border-t pt-2 mt-2">
                  {loading ? (
                    <div className="text-xs">Loading...</div>
                  ) : weatherData ? (
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center">
                        <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                        <div className="text-xs">
                          <span className="font-medium">Temperature: </span>
                          {weatherData.maxTemperature ? `${weatherData.maxTemperature}°C (Max)` : "N/A"} /
                          {weatherData.minTemperature ? `${weatherData.minTemperature}°C (Min)` : "N/A"}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                        <div className="text-xs">
                          <span className="font-medium">Precipitation: </span>
                          {weatherData.totalPrecipitation ? `${weatherData.totalPrecipitation} mm` : "No data"}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Wind className="h-4 w-4 mr-2 text-gray-500" />
                        <div className="text-xs">
                          <span className="font-medium">Wind: </span>
                          {weatherData.windSpeed ? `${weatherData.windSpeed} km/h` : "No data"}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Cloud className="h-4 w-4 mr-2 text-gray-400" />
                        <div className="text-xs">
                          <span className="font-medium">Clouds: </span>
                          {weatherData.avTotalCloud ? `${weatherData.avTotalCloud}%` : "No data"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No weather data available</div>
                  )}
                </div>
              )}
            </Popup>
          </Marker>
        )
      })}

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

export default function JordanWeatherMap({
  currentDate,
  setCurrentDate,
  isPlaying,
  setIsPlaying,
  selectedStation,
  onStationSelect,
}: MapComponentProps) {
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
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("dashboard.mapComponent")

  // Weather layer states
  const [activeWeatherLayer, setActiveWeatherLayer] = useState<WeatherParameter | null>(null)
  const [layerLoading, setLayerLoading] = useState(false)

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
        const today = new Date().toISOString().split("T")[0]
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

  // Fetch weather data for selected station
  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true)
      setError(null)

      try {
        let stationToQuery: string | null = null

        if (session?.user?.role === "super_admin") {
          stationToQuery = selectedStation?.id || session?.user?.station?.id || ""
        } else {
          stationToQuery = session?.user?.station?.id || ""
        }

        if (!stationToQuery) {
          setWeatherData(null)
          setError("No station selected")
          setLoading(false)
          return
        }

        const today = new Date()
        const startToday = new Date(today)
        startToday.setUTCHours(0, 0, 0, 0)
        const endToday = new Date(today)
        endToday.setUTCHours(23, 59, 59, 999)

        const response = await fetch(
          `/api/daily-summary?startDate=${startToday.toISOString()}&endDate=${endToday.toISOString()}&stationId=${stationToQuery}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch weather data")
        }

        const data = await response.json()

        if (data.length === 0) {
          setError("No weather data available")
          setWeatherData(null)
          return
        }

        const latestEntry = data[0]
        setWeatherData(latestEntry)
        setError(null)
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

  // Handle weather parameter button click
  const handleWeatherParameterClick = (parameter: WeatherParameter) => {
    if (activeWeatherLayer === parameter) {
      setActiveWeatherLayer(null)
    } else {
      setActiveWeatherLayer(parameter)
    }
  }

  return (
    <div className="relative h-full w-full z-10">
      {/* Map Container */}
      <div className="relative h-[500px] w-full rounded-lg overflow-hidden border-2 border-gray-200">
        <MapContainer
          center={[31.24, 36.51]} // Center on Amman, Jordan
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          minZoom={6}
          maxBounds={[
            [29.0, 34.8], // Southwest corner of Jordan
            [33.5, 39.3], // Northeast corner of Jordan
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

          {/* District Polygons */}
          <DistrictPolygons
            selectedStation={selectedStation}
            weatherData={weatherData}
            activeWeatherLayer={activeWeatherLayer}
          />

          <CustomZoomControl />
        </MapContainer>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-[1000]">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" />
            Loading...
          </div>
        </div>
      )}

      {/* Weather Parameter Buttons */}
      <div className="absolute top-4 md:left-14 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000] max-w-xs">
        <div className="grid grid-cols-8 gap-2">
          {weatherParameters.map((param) => {
            const Icon = param.icon
            const isActive = activeWeatherLayer === param.key

            return (
              <Button
                key={param.key}
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => handleWeatherParameterClick(param.key)}
                className={`flex items-center gap-2 text-xs h-8`}
                disabled={layerLoading}
              >
                <div className="relative group">
                  <Icon className="h-3 w-3" />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">
                    {param.label}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
        {layerLoading && <div className="text-xs text-gray-500 mt-2 text-center">Loading animation...</div>}
      </div>

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
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
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
            ? "Full access to all stations"
            : session?.user?.role === "station_admin" || session?.user?.role === "observer"
              ? "Limited to assigned station"
              : "Read-only access"}
        </div>
      </div>

      {/* Weather summary panel */}
      {selectedStation && (
        <div className="absolute bottom-20 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000] w-64">
          <div className="text-sm font-medium mb-2">Weather Summary</div>
          <div className="text-xs text-gray-600 mb-2">Station: {selectedStation.name}</div>
          {(() => {
            const district = getStationDistrict(selectedStation)
            return district ? (
              <div className="text-xs text-blue-600 mb-2 bg-blue-50 p-2 rounded">
                District: {district.properties.name_en} ({district.properties.name})
              </div>
            ) : null
          })()}
          {loading ? (
            <div className="text-xs">Loading...</div>
          ) : error ? (
            <div className="text-xs text-red-500">{error}</div>
          ) : weatherData ? (
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center">
                <Thermometer className="h-4 w-4 mr-2 text-orange-500" />
                <div className="text-xs">
                  <span className="font-medium">Temperature: </span>
                  {weatherData.maxTemperature ? `${weatherData.maxTemperature}°C Max` : "N/A"} /
                  {weatherData.minTemperature ? `${weatherData.minTemperature}°C Min` : "N/A"}
                </div>
              </div>
              <div className="flex items-center">
                <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                <div className="text-xs">
                  <span className="font-medium">Precipitation: </span>
                  {weatherData.totalPrecipitation ? `${weatherData.totalPrecipitation} mm` : "No data"}
                </div>
              </div>
              <div className="flex items-center">
                <Wind className="h-4 w-4 mr-2 text-gray-500" />
                <div className="text-xs">
                  <span className="font-medium">Wind Speed: </span>
                  {weatherData.windSpeed ? `${weatherData.windSpeed} km/h` : "No data"}
                </div>
              </div>
              <div className="flex items-center">
                <Cloud className="h-4 w-4 mr-2 text-gray-400" />
                <div className="text-xs">
                  <span className="font-medium">Cloud Cover: </span>
                  {weatherData.avTotalCloud ? `${weatherData.avTotalCloud}%` : "No data"}
                </div>
              </div>
              {weatherData.totalPrecipitation && Number.parseFloat(weatherData.totalPrecipitation) > 0 && (
                <div className="text-xs text-blue-600 font-medium mt-1">
                  Rain detected: {weatherData.totalPrecipitation} mm
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500">No weather data available</div>
          )}
        </div>
      )}

      {/* District Legend */}
      <div className="absolute bottom-16 left-4 bg-white p-2 rounded shadow z-[1000] w-48">
        <h4 className="font-bold mb-1 text-center text-sm">Jordan Districts</h4>
        <div className="text-xs text-gray-600 text-center mb-2">Admin Level 6 Boundaries</div>
        <div className="text-xs">• Select a weather station to view its district polygon</div>
        <div className="text-xs">• Polygon color indicates weather conditions</div>
        <div className="text-xs">• Click weather parameter buttons to change visualization</div>
      </div>

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
      `}</style>
    </div>
  )
}
