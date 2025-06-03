// "use client"

// import * as React from "react"
// import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartLegend,
//   ChartLegendContent,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// const chartConfig = {
//   maxTemperature: {
//     label: "Max Temperature (°C)",
//     color: "hsl(var(--chart-1))",
//   },
//   minTemperature: {
//     label: "Min Temperature (°C)",
//     color: "hsl(var(--chart-2))",
//   },
//   totalPrecipitation: {
//     label: "Precipitation (mm)",
//     color: "hsl(var(--chart-3))",
//   },
//   windSpeed: {
//     label: "Wind Speed (km/h)",
//     color: "hsl(var(--chart-4))",
//   },
//   avRelativeHumidity: {
//     label: "Humidity (%)",
//     color: "hsl(var(--chart-5))",
//   },
// } satisfies ChartConfig

// const dataTypeOptions = [
//   { value: "temperature", label: "Temperature", metrics: ["maxTemperature", "minTemperature"] },
//   { value: "precipitation", label: "Precipitation", metrics: ["totalPrecipitation"] },
//   { value: "wind", label: "Wind Speed", metrics: ["windSpeed"] },
//   { value: "humidity", label: "Humidity", metrics: ["avRelativeHumidity"] },
//   { value: "all", label: "All Metrics", metrics: ["maxTemperature", "minTemperature", "totalPrecipitation", "windSpeed"] },
// ]

// export default function DailySummaryChart() {
//   const [weatherData, setWeatherData] = React.useState([])
//   const [loading, setLoading] = React.useState(true)
//   const [error, setError] = React.useState(null)
//   const [timeRange, setTimeRange] = React.useState("30d")
//   const [dataType, setDataType] = React.useState("temperature")
//   const [stationId, setStationId] = React.useState("")

//   const fetchWeatherData = React.useCallback(async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       // Calculate date range
//       const endDate = new Date()
//       const startDate = new Date()
//       let daysToSubtract = 30

//       if (timeRange === "7d") {
//         daysToSubtract = 7
//       } else if (timeRange === "90d") {
//         daysToSubtract = 90
//       }

//       startDate.setDate(startDate.getDate() - daysToSubtract)

//       // Build query parameters
//       const params = new URLSearchParams({
//         startDate: startDate.toISOString().split('T')[0],
//         endDate: endDate.toISOString().split('T')[0],
//       })

//       if (stationId) {
//         params.append('stationId', stationId)
//       }

//       const response = await fetch(`/api/daily-summary?${params}`)

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const data = await response.json()

//       // Transform data for chart
//       const transformedData = data.map(item => ({
//         date: new Date(item.ObservingTime.utcTime).toISOString().split('T')[0],
//         stationName: item.ObservingTime.station.name,
//         maxTemperature: parseFloat(item.maxTemperature) || 0,
//         minTemperature: parseFloat(item.minTemperature) || 0,
//         totalPrecipitation: parseFloat(item.totalPrecipitation) || 0,
//         windSpeed: parseFloat(item.windSpeed) || 0,
//         avRelativeHumidity: parseFloat(item.avRelativeHumidity) || 0,
//         avTotalCloud: parseFloat(item.avTotalCloud) || 0,
//         lowestVisibility: parseFloat(item.lowestVisibility) || 0,
//       })).sort((a, b) => new Date(a.date) - new Date(b.date))

//       setWeatherData(transformedData)
//     } catch (err) {
//       setError(err.message)
//       console.error('Error fetching weather data:', err)
//     } finally {
//       setLoading(false)
//     }
//   }, [timeRange, stationId])

//   React.useEffect(() => {
//     fetchWeatherData()
//   }, [fetchWeatherData])

//   const selectedMetrics = dataTypeOptions.find(option => option.value === dataType)?.metrics || []

//   const getChartTitle = () => {
//     const typeLabel = dataTypeOptions.find(option => option.value === dataType)?.label || "Weather Data"
//     return `Daily Weather Summary - ${typeLabel}`
//   }

//   const getChartDescription = () => {
//     const days = timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"
//     return `Showing weather data for the last ${days}`
//   }

//   const getYAxisLabel = () => {
//     switch (dataType) {
//       case "temperature": return "Temperature (°C)"
//       case "precipitation": return "Precipitation (mm)"
//       case "wind": return "Wind Speed (km/h)"
//       case "humidity": return "Humidity (%)"
//       default: return "Value"
//     }
//   }

//   if (loading) {
//     return (
//       <Card className="pt-0">
//         <CardContent className="flex items-center justify-center h-[400px]">
//           <div className="text-center">
//             <div className="mb-2">Loading weather data...</div>
//             <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   if (error) {
//     return (
//       <Card className="pt-0">
//         <CardContent className="flex items-center justify-center h-[400px]">
//           <div className="text-center text-red-600">
//             <div className="mb-2">Error loading data:</div>
//             <div className="text-sm">{error}</div>
//             <button 
//               onClick={fetchWeatherData}
//               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Retry
//             </button>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   if (weatherData.length === 0) {
//     return (
//       <Card className="pt-0">
//         <CardContent className="flex items-center justify-center h-[400px]">
//           <div className="text-center text-gray-600">
//             <div className="mb-2">No weather data available</div>
//             <div className="text-sm">Try adjusting the time range or check if data exists for the selected period.</div>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <Card className="pt-0">
//       <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
//         <div className="grid flex-1 gap-1">
//           <CardTitle>{getChartTitle()}</CardTitle>
//           <CardDescription>
//             {getChartDescription()}
//             {weatherData.length > 0 && ` • ${weatherData.length} data points`}
//           </CardDescription>
//         </div>
//         <div className="flex gap-2">
//           <Select value={dataType} onValueChange={setDataType}>
//             <SelectTrigger className="w-[140px] rounded-lg">
//               <SelectValue placeholder="Select metric" />
//             </SelectTrigger>
//             <SelectContent className="rounded-xl">
//               {dataTypeOptions.map((option) => (
//                 <SelectItem key={option.value} value={option.value} className="rounded-lg">
//                   {option.label}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Select value={timeRange} onValueChange={setTimeRange}>
//             <SelectTrigger className="w-[140px] rounded-lg">
//               <SelectValue placeholder="Time range" />
//             </SelectTrigger>
//             <SelectContent className="rounded-xl">
//               <SelectItem value="7d" className="rounded-lg">
//                 Last 7 days
//               </SelectItem>
//               <SelectItem value="30d" className="rounded-lg">
//                 Last 30 days
//               </SelectItem>
//               <SelectItem value="90d" className="rounded-lg">
//                 Last 90 days
//               </SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </CardHeader>
//       <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
//         <ChartContainer
//           config={chartConfig}
//           className="aspect-auto h-[400px] w-full"
//         >
//           <AreaChart data={weatherData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
//             <defs>
//               {selectedMetrics.map((metric) => (
//                 <linearGradient key={metric} id={`fill${metric}`} x1="0" y1="0" x2="0" y2="1">
//                   <stop
//                     offset="5%"
//                     stopColor={chartConfig[metric]?.color}
//                     stopOpacity={0.8}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor={chartConfig[metric]?.color}
//                     stopOpacity={0.1}
//                   />
//                 </linearGradient>
//               ))}
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//             <XAxis
//               dataKey="date"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               minTickGap={32}
//               tickFormatter={(value) => {
//                 const date = new Date(value)
//                 return date.toLocaleDateString("en-US", {
//                   month: "short",
//                   day: "numeric",
//                 })
//               }}
//             />
//             <YAxis
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               label={{ value: getYAxisLabel(), angle: -90, position: 'insideLeft' }}
//             />
//             <ChartTooltip
//               cursor={false}
//               content={
//                 <ChartTooltipContent
//                   labelFormatter={(value) => {
//                     return new Date(value).toLocaleDateString("en-US", {
//                       weekday: "long",
//                       year: "numeric",
//                       month: "long",
//                       day: "numeric",
//                     })
//                   }}
//                   indicator="dot"
//                 />
//               }
//             />
//             {selectedMetrics.map((metric, index) => (
//               <Area
//                 key={metric}
//                 dataKey={metric}
//                 type="monotone"
//                 fill={`url(#fill${metric})`}
//                 stroke={chartConfig[metric]?.color}
//                 strokeWidth={2}
//                 stackId={dataType === "all" ? "a" : undefined}
//               />
//             ))}
//             <ChartLegend content={<ChartLegendContent />} />
//           </AreaChart>
//         </ChartContainer>
//       </CardContent>
//     </Card>
//   )
// }

"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format, subDays } from "date-fns"

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
import { Skeleton } from "@/components/ui/skeleton"
import { FaSpinner, FaThermometerHalf, FaCloudRain, FaWind, FaLayerGroup } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { IoIosWarning } from "react-icons/io";
import { IoCloudOffline } from "react-icons/io5";
import { BsDropletHalf } from "react-icons/bs";

// Define vibrant colors for each metric
const CHART_COLORS = {
    maxTemperature: "#FF6B6B",
    minTemperature: "#4ECDC4",
    totalPrecipitation: "#54A0FF",
    windSpeed: "#FF9FF3",
    avRelativeHumidity: "#FECA57",
}

const chartConfig = {
    maxTemperature: {
        label: "Max Temperature (°C)",
        color: CHART_COLORS.maxTemperature,
    },
    minTemperature: {
        label: "Min Temperature (°C)",
        color: CHART_COLORS.minTemperature,
    },
    totalPrecipitation: {
        label: "Precipitation (mm)",
        color: CHART_COLORS.totalPrecipitation,
    },
    windSpeed: {
        label: "Wind Speed (km/h)",
        color: CHART_COLORS.windSpeed,
    },
    avRelativeHumidity: {
        label: "Humidity (%)",
        color: CHART_COLORS.avRelativeHumidity,
    },
} satisfies ChartConfig

const dataTypeOptions = [
    {
        value: "temperature",
        label: "Temperature",
        metrics: ["maxTemperature", "minTemperature"],
        icon: <FaThermometerHalf className="h-4 w-4" />,
    },
    {
        value: "precipitation",
        label: "Precipitation",
        metrics: ["totalPrecipitation"],
        icon: <FaCloudRain className="h-4 w-4" />,
    },
    {
        value: "wind",
        label: "Wind Speed",
        metrics: ["windSpeed"],
        icon: <FaWind className="h-4 w-4" />,
    },
    {
        value: "humidity",
        label: "Humidity",
        metrics: ["avRelativeHumidity"],
        icon: <BsDropletHalf className="h-4 w-4" />,
    },
    {
        value: "all",
        label: "All Metrics",
        metrics: ["maxTemperature", "minTemperature", "totalPrecipitation", "windSpeed", "avRelativeHumidity"],
        icon: <FaLayerGroup className="h-4 w-4" />,
    },
] as const

const timeRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
] as const

type DataType = typeof dataTypeOptions[number]["value"]
type TimeRange = typeof timeRangeOptions[number]["value"]

interface WeatherData {
    date: string
    stationName: string
    maxTemperature: number
    minTemperature: number
    totalPrecipitation: number
    windSpeed: number
    avRelativeHumidity: number
    avTotalCloud: number
    lowestVisibility: number
}

export default function DailySummaryChart() {
    const [weatherData, setWeatherData] = React.useState<WeatherData[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [timeRange, setTimeRange] = React.useState<TimeRange>("30d")
    const [dataType, setDataType] = React.useState<DataType>("temperature")

    const fetchWeatherData = React.useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Calculate date range
            const endDate = new Date()
            let startDate: Date

            switch (timeRange) {
                case "7d":
                    startDate = subDays(endDate, 7)
                    break
                case "30d":
                    startDate = subDays(endDate, 30)
                    break
                case "90d":
                    startDate = subDays(endDate, 90)
                    break
                default:
                    startDate = subDays(endDate, 30)
            }

            // Build query parameters
            const params = new URLSearchParams({
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
            })

            const response = await fetch(`/api/daily-summary?${params}`)

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`)
            }

            const data = await response.json()

            // Transform data for chart
            const transformedData = data.map((item: any) => ({
                date: new Date(item.ObservingTime.utcTime).toISOString().split('T')[0],
                stationName: item.ObservingTime.station.name,
                maxTemperature: parseFloat(item.maxTemperature) || 0,
                minTemperature: parseFloat(item.minTemperature) || 0,
                totalPrecipitation: parseFloat(item.totalPrecipitation) || 0,
                windSpeed: parseFloat(item.windSpeed) || 0,
                avRelativeHumidity: parseFloat(item.avRelativeHumidity) || 0,
                avTotalCloud: parseFloat(item.avTotalCloud) || 0,
                lowestVisibility: parseFloat(item.lowestVisibility) || 0,
            })).sort((a: WeatherData, b: WeatherData) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            )

            setWeatherData(transformedData)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred")
            console.error('Error fetching weather data:', err)
        } finally {
            setLoading(false)
        }
    }, [timeRange])

    React.useEffect(() => {
        fetchWeatherData()
    }, [fetchWeatherData])

    const selectedOption = dataTypeOptions.find(option => option.value === dataType)
    const selectedMetrics = selectedOption?.metrics || []

    const getChartTitle = () => {
        return `Daily ${selectedOption?.label || "Weather Data"}`
    }

    const getChartDescription = () => {
        const days = timeRange === "7d" ? "7 days" : timeRange === "30d" ? "30 days" : "90 days"
        const station = weatherData[0]?.stationName ? ` at ${weatherData[0].stationName}` : ""
        return `Showing ${selectedOption?.label.toLowerCase()} data for the last ${days}${station}`
    }

    const getYAxisLabel = () => {
        switch (dataType) {
            case "temperature": return "°C"
            case "precipitation": return "mm"
            case "wind": return "km/h"
            case "humidity": return "%"
            default: return "Value"
        }
    }

    if (loading) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-36 rounded-lg" />
                            <Skeleton className="h-10 w-36 rounded-lg" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="text-center space-y-2">
                            <FaSpinner className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                            <p className="text-sm text-muted-foreground">Loading weather data...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                    <CardTitle>Weather Dashboard</CardTitle>
                    <CardDescription>Error loading data</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-center">
                        <IoIosWarning className="h-12 w-12 text-red-500" />
                        <div>
                            <h3 className="text-lg font-medium">Failed to load weather data</h3>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                        <button
                            onClick={fetchWeatherData}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        >
                            <FiRefreshCcw className="mr-2 h-4 w-4" />
                            Retry
                        </button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (weatherData.length === 0) {
        return (
            <Card className="border-0 shadow-lg">
                <CardHeader className="border-b">
                    <CardTitle>Weather Dashboard</CardTitle>
                    <CardDescription>No data available</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4 text-center">
                        <IoCloudOffline className="h-12 w-12 text-gray-400" />
                        <div>
                            <h3 className="text-lg font-medium">No weather data found</h3>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting the time range or check if data exists for the selected period.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                            {getChartTitle()}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            {getChartDescription()}
                            {weatherData.length > 0 && (
                                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                    {weatherData.length} records
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select value={dataType} onValueChange={(value: DataType) => setDataType(value)}>
                            <SelectTrigger className="w-[160px] rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <SelectValue placeholder="Select metric" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                                {dataTypeOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="rounded-md hover:bg-gray-100"
                                    >
                                        <div className="flex items-center gap-2">
                                            {option.icon}
                                            {option.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
                            <SelectTrigger className="w-[140px] rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <SelectValue placeholder="Time range" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-gray-200 shadow-lg">
                                {timeRangeOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                        className="rounded-md hover:bg-gray-100"
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[400px]">
                    <ChartContainer
                        config={chartConfig}
                        className="w-full h-full"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={weatherData}
                                margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                            >
                                <defs>
                                    {selectedMetrics.map((metric) => (
                                        <linearGradient
                                            key={metric}
                                            id={`fill${metric}`}
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor={CHART_COLORS[metric as keyof typeof CHART_COLORS]}
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={CHART_COLORS[metric as keyof typeof CHART_COLORS]}
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    minTickGap={32}
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return format(date, 'MMM d')
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                    width={40}
                                    label={{
                                        value: getYAxisLabel(),
                                        angle: -90,
                                        position: 'insideLeft',
                                        style: { textAnchor: 'middle', fill: "#6b7280" },
                                        offset: -10
                                    }}
                                />
                                <ChartTooltip
                                    cursor={{
                                        stroke: "#d1d5db",
                                        strokeWidth: 1,
                                        strokeDasharray: "4 4",
                                    }}
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value) => {
                                                return format(new Date(value), 'EEEE, MMMM d, yyyy')
                                            }}
                                            indicator="circle"
                                            labelClassName="font-medium text-gray-900"
                                            valueClassName="font-semibold"
                                            className="bg-white shadow-lg rounded-lg border border-gray-200 p-3"
                                        />
                                    }
                                />
                                {selectedMetrics.map((metric) => (
                                    <Area
                                        key={metric}
                                        dataKey={metric}
                                        type="monotone"
                                        fill={`url(#fill${metric})`}
                                        stroke={CHART_COLORS[metric as keyof typeof CHART_COLORS]}
                                        strokeWidth={2}
                                        activeDot={{
                                            r: 6,
                                            strokeWidth: 2,
                                            fill: "#ffffff",
                                            stroke: CHART_COLORS[metric as keyof typeof CHART_COLORS],
                                        }}
                                        stackId={dataType === "all" ? "a" : undefined}
                                    />
                                ))}
                                <ChartLegend
                                    content={
                                        <ChartLegendContent
                                            className="mt-4 flex flex-wrap justify-center gap-4"
                                            itemClassName="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full"
                                            iconClassName="w-3 h-3 rounded-full"
                                            labelClassName="text-sm font-medium text-gray-700"
                                        />
                                    }
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    )
}