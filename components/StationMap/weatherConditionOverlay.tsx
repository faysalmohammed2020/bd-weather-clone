"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Station {
  id: string
  stationId: string
  name: string
  latitude: number
  longitude: number
}

interface WeatherObservationData {
  lowCloudAmount: string | null
  layer3Height: string | null
  layer4Height: string | null
}

interface MeteorologicalData {
  rainfallLast24Hours: string | null
  maxMinTempAsRead: string | null
}

interface WeatherConditionOverlayProps {
  selectedStation: Station | null
  mapRef?: any // Reference to the map container
}

interface WeatherCondition {
  id: string
  type: "cloud" | "rain" | "temperature"
  imagePath: string
  description: string
  position: { x: number; y: number }
  animationDelay: number
}

export default function WeatherConditionOverlay({ selectedStation, mapRef }: WeatherConditionOverlayProps) {
  const [weatherConditions, setWeatherConditions] = useState<WeatherCondition[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Fetch weather observation data from first-card-data API
  const fetchWeatherObservationData = async (stationId: string): Promise<WeatherObservationData | null> => {
    try {
      const today = new Date()
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const response = await fetch(
        `/api/first-card-data?startDate=${startDate}&endDate=${endDate}&stationId=${stationId}`,
      )

      if (!response.ok) return null

      const data = await response.json()
      if (data.entries && data.entries.length > 0) {
        const latestEntry = data.entries[0]
        return {
          lowCloudAmount: latestEntry.WeatherObservation?.[0]?.lowCloudAmount || null,
          layer3Height: latestEntry.WeatherObservation?.[0]?.layer3Height || null,
          layer4Height: latestEntry.WeatherObservation?.[0]?.layer4Height || null,
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching weather observation data:", error)
      return null
    }
  }

  // Fetch meteorological data from save-observation API
  const fetchMeteorologicalData = async (stationId: string): Promise<MeteorologicalData | null> => {
    try {
      const today = new Date()
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString()
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString()

      const response = await fetch(
        `/api/save-observation?startDate=${startDate}&endDate=${endDate}&stationId=${stationId}`,
      )

      if (!response.ok) return null

      const data = await response.json()
      if (data.success && data.data && data.data.length > 0) {
        const latestEntry = data.data[0]
        return {
          rainfallLast24Hours: latestEntry.WeatherObservation?.[0]?.rainfallLast24Hours || null,
          maxMinTempAsRead: latestEntry.MeteorologicalEntry?.[0]?.maxMinTempAsRead || null,
        }
      }
      return null
    } catch (error) {
      console.error("Error fetching meteorological data:", error)
      return null
    }
  }

  // Determine weather conditions based on data
  const determineWeatherConditions = (
    weatherObs: WeatherObservationData | null,
    meteorological: MeteorologicalData | null,
  ): WeatherCondition[] => {
    const conditions: WeatherCondition[] = []
    let conditionId = 0

    // Cloud conditions from WeatherObservation data
    if (weatherObs?.lowCloudAmount) {
      conditions.push({
        id: `cloud-${conditionId++}`,
        type: "cloud",
        imagePath: "/images/cloud 2.png",
        description: "Low Cloud Cover",
        position: { x: 0, y: 0 },
        animationDelay: 0,
      })
    }

    if (weatherObs?.layer3Height && weatherObs?.layer4Height) {
      conditions.push({
        id: `cloudy-${conditionId++}`,
        type: "cloud",
        imagePath: "/images/cloudy.png",
        description: "Multiple Cloud Layers",
        position: { x: 20, y: -10 },
        animationDelay: 0.5,
      })
    }

    // Rain conditions from meteorological data
    if (meteorological?.rainfallLast24Hours) {
      const rainfall = Number.parseFloat(meteorological.rainfallLast24Hours)

      if (rainfall <= 10) {
        conditions.push({
          id: `light-rain-${conditionId++}`,
          type: "rain",
          imagePath: "/images/light-rain.png",
          description: "Light Rain",
          position: { x: -15, y: 10 },
          animationDelay: 1,
        })
      } else if (rainfall <= 50) {
        conditions.push({
          id: `rain-${conditionId++}`,
          type: "rain",
          imagePath: "/images/rain.png",
          description: "Moderate Rain",
          position: { x: -15, y: 10 },
          animationDelay: 1,
        })
      } else if (rainfall > 51) {
        conditions.push({
          id: `heavy-rain-${conditionId++}`,
          type: "rain",
          imagePath: "/images/heavy-rain.png",
          description: "Heavy Rain",
          position: { x: -15, y: 10 },
          animationDelay: 1,
        })
      }
    }

    // Temperature conditions from meteorological data
    if (meteorological?.maxMinTempAsRead) {
      const temperature = Number.parseFloat(meteorological.maxMinTempAsRead)

      if (temperature >= 35) {
        conditions.push({
          id: `hot-${conditionId++}`,
          type: "temperature",
          imagePath: "/images/hot.png",
          description: "High Temperature",
          position: { x: 10, y: -20 },
          animationDelay: 1.5,
        })
      }
    }

    return conditions
  }

  // Fetch and update weather conditions
  const updateWeatherConditions = async () => {
    if (!selectedStation) {
      setWeatherConditions([])
      return
    }

    setLoading(true)
    try {
      const [weatherObsData, meteorologicalData] = await Promise.all([
        fetchWeatherObservationData(selectedStation.id),
        fetchMeteorologicalData(selectedStation.id),
      ])

      const conditions = determineWeatherConditions(weatherObsData, meteorologicalData)
      setWeatherConditions(conditions)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error updating weather conditions:", error)
      setWeatherConditions([])
    } finally {
      setLoading(false)
    }
  }

  // Update conditions when station changes
  useEffect(() => {
    updateWeatherConditions()
  }, [selectedStation])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (selectedStation) {
          updateWeatherConditions()
        }
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [selectedStation])

  // Animation variants for different weather types
  const getAnimationVariants = (type: string) => {
    switch (type) {
      case "cloud":
        return {
          initial: { opacity: 0, scale: 0.5, x: -50 },
          animate: {
            opacity: [0.7, 1, 0.7],
            scale: [0.8, 1.1, 0.9],
            x: [0, 10, -5, 0],
            transition: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          },
          exit: { opacity: 0, scale: 0.5, transition: { duration: 0.5 } },
        }
      case "rain":
        return {
          initial: { opacity: 0, y: -30 },
          animate: {
            opacity: [0.8, 1, 0.8],
            y: [0, 5, 0],
            transition: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          },
          exit: { opacity: 0, y: -30, transition: { duration: 0.5 } },
        }
      case "temperature":
        return {
          initial: { opacity: 0, scale: 0.3 },
          animate: {
            opacity: [0.9, 1, 0.9],
            scale: [0.9, 1.2, 0.9],
            rotate: [0, 5, -5, 0],
            transition: {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          },
          exit: { opacity: 0, scale: 0.3, transition: { duration: 0.5 } },
        }
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
    }
  }

  if (!selectedStation) {
    return null
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-[1001]">
      {/* Weather Conditions Display */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <AnimatePresence mode="wait">
          {weatherConditions.map((condition) => (
            <motion.div
              key={condition.id}
              className="absolute"
              style={{
                left: `${condition.position.x}px`,
                top: `${condition.position.y}px`,
              }}
              variants={getAnimationVariants(condition.type)}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ delay: condition.animationDelay }}
            >
              <div className="relative">
                <img
                  src={condition.imagePath || "/broadcasting.png"}
                  alt={condition.description}
                  className="w-12 h-12 object-contain drop-shadow-lg"
                  onError={(e) => {
                    // Fallback to a default weather icon if image fails to load
                    e.currentTarget.src = "/broadcasting.png"
                  }}
                />

                {/* Glowing effect */}
                <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-sm animate-pulse" />

                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {condition.description}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-gray-600">Updating weather...</span>
          </div>
        </div>
      )}

      {/* Last updated indicator */}
      {lastUpdated && !loading && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-lg shadow-lg">
          <div className="text-xs text-gray-600">Updated: {lastUpdated.toLocaleTimeString()}</div>
        </div>
      )}

      {/* Station info with weather conditions count */}
      {weatherConditions.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg">
          <div className="text-sm font-medium text-gray-800">{selectedStation.name}</div>
          <div className="text-xs text-gray-600">
            {weatherConditions.length} weather condition{weatherConditions.length !== 1 ? "s" : ""} active
          </div>
          <div className="mt-1 space-y-1">
            {weatherConditions.map((condition) => (
              <div key={condition.id} className="flex items-center gap-2">
                <img
                  src={condition.imagePath || "/broadcasting.png"}
                  alt=""
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/broadcasting.png"
                  }}
                />
                <span className="text-xs text-gray-600">{condition.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
