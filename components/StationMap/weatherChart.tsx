"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const chartConfig = {
  maxTemperature: {
    label: "Max Temperature (°C)",
    color: "hsl(var(--chart-1))",
  },
  minTemperature: {
    label: "Min Temperature (°C)",
    color: "hsl(var(--chart-2))",
  },
  totalPrecipitation: {
    label: "Precipitation (mm)",
    color: "hsl(var(--chart-3))",
  },
  windSpeed: {
    label: "Wind Speed (km/h)",
    color: "hsl(var(--chart-4))",
  },
  avRelativeHumidity: {
    label: "Humidity (%)",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const dataTypeOptions = [
  { value: "temperature", label: "Temperature", metrics: ["maxTemperature", "minTemperature"] },
  { value: "precipitation", label: "Precipitation", metrics: ["totalPrecipitation"] },
  { value: "wind", label: "Wind Speed", metrics: ["windSpeed"] },
  { value: "humidity", label: "Humidity", metrics: ["avRelativeHumidity"] },
  { value: "all", label: "All Metrics", metrics: ["maxTemperature", "minTemperature", "totalPrecipitation", "windSpeed"] },
]

export default function DailySummaryChart() {
  const [weatherData, setWeatherData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [timeRange, setTimeRange] = React.useState("30d")
  const [dataType, setDataType] = React.useState("temperature")
  const [stationId, setStationId] = React.useState("")

  const fetchWeatherData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      let daysToSubtract = 30
      
      if (timeRange === "7d") {
        daysToSubtract = 7
      } else if (timeRange === "90d") {
        daysToSubtract = 90
      }
      
      startDate.setDate(startDate.getDate() - daysToSubtract)
      
      // Build query parameters
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })
      
      if (stationId) {
        params.append('stationId', stationId)
      }
      
      const response = await fetch(`/api/daily-summary?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform data for chart
      const transformedData = data.map(item => ({
        date: new Date(item.ObservingTime.utcTime).toISOString().split('T')[0],
        stationName: item.ObservingTime.station.name,
        maxTemperature: parseFloat(item.maxTemperature) || 0,
        minTemperature: parseFloat(item.minTemperature) || 0,
        totalPrecipitation: parseFloat(item.totalPrecipitation) || 0,
        windSpeed: parseFloat(item.windSpeed) || 0,
        avRelativeHumidity: parseFloat(item.avRelativeHumidity) || 0,
        avTotalCloud: parseFloat(item.avTotalCloud) || 0,
        lowestVisibility: parseFloat(item.lowestVisibility) || 0,
      })).sort((a, b) => new Date(a.date) - new Date(b.date))
      
      setWeatherData(transformedData)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching weather data:', err)
    } finally {
      setLoading(false)
    }
  }, [timeRange, stationId])

  React.useEffect(() => {
    fetchWeatherData()
  }, [fetchWeatherData])

  const selectedMetrics = dataTypeOptions.find(option => option.value === dataType)?.metrics || []

  const getChartTitle = () => {
    const typeLabel = dataTypeOptions.find(option => option.value === dataType)?.label || "Weather Data"
    return `Daily Weather Summary - ${typeLabel}`
  }

  const getChartDescription = () => {
    const days = timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"
    return `Showing weather data for the last ${days}`
  }

  const getYAxisLabel = () => {
    switch (dataType) {
      case "temperature": return "Temperature (°C)"
      case "precipitation": return "Precipitation (mm)"
      case "wind": return "Wind Speed (km/h)"
      case "humidity": return "Humidity (%)"
      default: return "Value"
    }
  }

  if (loading) {
    return (
      <Card className="pt-0">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="mb-2">Loading weather data...</div>
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="pt-0">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center text-red-600">
            <div className="mb-2">Error loading data:</div>
            <div className="text-sm">{error}</div>
            <button 
              onClick={fetchWeatherData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (weatherData.length === 0) {
    return (
      <Card className="pt-0">
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center text-gray-600">
            <div className="mb-2">No weather data available</div>
            <div className="text-sm">Try adjusting the time range or check if data exists for the selected period.</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>
            {getChartDescription()}
            {weatherData.length > 0 && ` • ${weatherData.length} data points`}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger className="w-[140px] rounded-lg">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {dataTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-lg">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] rounded-lg">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 90 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <AreaChart data={weatherData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {selectedMetrics.map((metric) => (
                <linearGradient key={metric} id={`fill${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig[metric]?.color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig[metric]?.color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            {selectedMetrics.map((metric, index) => (
              <Area
                key={metric}
                dataKey={metric}
                type="monotone"
                fill={`url(#fill${metric})`}
                stroke={chartConfig[metric]?.color}
                strokeWidth={2}
                stackId={dataType === "all" ? "a" : undefined}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
        
        {/* Weather Conditions Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-900">Avg Max Temp</div>
            <div className="text-xl font-bold text-blue-700">
              {(weatherData.reduce((sum, item) => sum + item.maxTemperature, 0) / weatherData.length).toFixed(1)}°C
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-medium text-green-900">Avg Min Temp</div>
            <div className="text-xl font-bold text-green-700">
              {(weatherData.reduce((sum, item) => sum + item.minTemperature, 0) / weatherData.length).toFixed(1)}°C
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-medium text-purple-900">Total Precipitation</div>
            <div className="text-xl font-bold text-purple-700">
              {weatherData.reduce((sum, item) => sum + item.totalPrecipitation, 0).toFixed(1)}mm
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="font-medium text-orange-900">Avg Wind Speed</div>
            <div className="text-xl font-bold text-orange-700">
              {(weatherData.reduce((sum, item) => sum + item.windSpeed, 0) / weatherData.length).toFixed(1)} km/h
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}