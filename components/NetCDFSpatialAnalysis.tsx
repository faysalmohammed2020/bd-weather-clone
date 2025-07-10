"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Upload,
  FileText,
  Activity,
  LineChart,
  ScatterChart,
  Gauge,
  Map,
  BoxSelect,
  Box,
  MapPin,
  Calendar,
  Play,
  Pause,
} from "lucide-react"
import dynamic from "next/dynamic"
import { useTranslations } from "next-intl"
import type { Data, Layout, PlotData } from "plotly.js"
import { NetCDFReader } from "netcdfjs"
import { saveAs } from "file-saver"

// Dynamic imports for heavy visualization libraries
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  ),
})

interface NCVariable {
  dimensions: string[]
  attributes: Array<{ name: string; value: any }>
  data: number[]
  shape?: number[]
}

interface NCData {
  metadata: {
    dimensions: Record<string, number>
    globalAttributes: Array<{ name: string; value: any }>
  }
  variables: Record<string, NCVariable>
}

interface SpatialMapData {
  id: string
  filename: string
  variable: string
  timeIndex: number
  lats: number[]
  lons: number[]
  z: number[][]
  title: string
  unit: string
}

export default function NetCDFSpatialAnalyzerFixed() {
  const t = useTranslations("netCdf")
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [ncData, setNcData] = useState<NCData | null>(null)
  const [selectedVariable, setSelectedVariable] = useState<string>("")
  const [plotType, setPlotType] = useState<string>("line")
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<string>("spatial")

  // Spatial analysis specific states
  const [spatialMaps, setSpatialMaps] = useState<SpatialMapData[]>([])
  const [spatialVariables, setSpatialVariables] = useState<string[]>([])
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number>(0)
  const [maxTimeIndex, setMaxTimeIndex] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1000)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsProcessing(true)
    setError("")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)
      const reader = new NetCDFReader(buffer)

      const dimensions = Object.fromEntries(Object.entries(reader.dimensions).map(([name, { size }]) => [name, size]))

      const globalAttributes = reader.globalAttributes.map((attr) => ({
        name: attr.name,
        value: attr.value,
      }))

      const variables: Record<string, NCVariable> = {}
      for (const variable of reader.variables) {
        variables[variable.name] = {
          dimensions: variable.dimensions,
          attributes: variable.attributes.map((attr) => ({
            name: attr.name,
            value: attr.value,
          })),
          data: downsampleData(reader.getDataVariable(variable.name)),
        }
      }

      const processedData = {
        metadata: {
          dimensions,
          globalAttributes,
        },
        variables,
      }

      setNcData(processedData)

      // Find spatial variables (variables with lat/lon dimensions)
      const spatialVars = findSpatialVariables(processedData)
      setSpatialVariables(spatialVars)

      // Set max time index
      const timeSize = getTimeDimensionSize(processedData)
      setMaxTimeIndex(timeSize - 1)

      // Auto-select first spatial variable
      if (spatialVars.length > 0) {
        setSelectedVariable(spatialVars[0])
        generateSpatialMap(processedData, spatialVars[0], 0)
      }

      // Auto-select first variable for standard plots
      if (Object.keys(variables).length > 0 && !selectedVariable) {
        setSelectedVariable(Object.keys(variables)[0])
      }
    } catch (error) {
      console.error("Error processing file:", error)
      setError("Error processing NetCDF file. Please check the file format.")
    } finally {
      setIsProcessing(false)
    }
  }

  const downsampleData = (data: any[], maxPoints = 50000) => {
    if (data.length <= maxPoints) return data
    const step = Math.ceil(data.length / maxPoints)
    const downsampled = []
    for (let i = 0; i < data.length; i += step) {
      downsampled.push(data[i])
    }
    return downsampled
  }

  const findSpatialVariables = (data: NCData): string[] => {
    const spatialVars: string[] = []

    // First, identify coordinate variables
    const latCoordVars = Object.keys(data.variables).filter(
      (varName) =>
        /^(lat|latitude|y|south_north|XLAT)$/i.test(varName) ||
        data.variables[varName].attributes.some(
          (attr) => attr.name === "standard_name" && /latitude/i.test(attr.value),
        ),
    )

    const lonCoordVars = Object.keys(data.variables).filter(
      (varName) =>
        /^(lon|longitude|x|west_east|XLONG)$/i.test(varName) ||
        data.variables[varName].attributes.some(
          (attr) => attr.name === "standard_name" && /longitude/i.test(attr.value),
        ),
    )

    console.log("Found lat coordinate variables:", latCoordVars)
    console.log("Found lon coordinate variables:", lonCoordVars)

    // If we have coordinate variables, find data variables that use these dimensions
    if (latCoordVars.length > 0 && lonCoordVars.length > 0) {
      const latDimNames = latCoordVars.flatMap((varName) => data.variables[varName].dimensions)
      const lonDimNames = lonCoordVars.flatMap((varName) => data.variables[varName].dimensions)

      console.log("Lat dimension names:", latDimNames)
      console.log("Lon dimension names:", lonDimNames)

      for (const [varName, variable] of Object.entries(data.variables)) {
        // Skip coordinate variables themselves
        if (latCoordVars.includes(varName) || lonCoordVars.includes(varName)) continue

        // Skip time variables
        if (/^(time|Time|XTIME)$/i.test(varName)) continue

        // Check if variable uses both lat and lon dimensions
        const hasLatDim = variable.dimensions.some((dim) => latDimNames.includes(dim) || latCoordVars.includes(dim))
        const hasLonDim = variable.dimensions.some((dim) => lonDimNames.includes(dim) || lonCoordVars.includes(dim))

        console.log(`Variable ${varName}:`, {
          dimensions: variable.dimensions,
          hasLatDim,
          hasLonDim,
        })

        if (hasLatDim && hasLonDim && variable.dimensions.length >= 2) {
          spatialVars.push(varName)
        }
      }
    }

    // Fallback: look for variables with spatial-sounding dimensions
    if (spatialVars.length === 0) {
      for (const [varName, variable] of Object.entries(data.variables)) {
        // Skip obvious coordinate variables
        if (/^(lat|latitude|lon|longitude|time|x|y|XLAT|XLONG|XTIME)$/i.test(varName)) continue

        // Look for variables with 2D or 3D structure that might be spatial
        if (variable.dimensions.length >= 2) {
          const dims = variable.dimensions
          const hasNumericDims = dims.some((dim) => /^\d+$/.test(dim))

          // If dimensions are numeric (like "1", "2"), it might be spatial
          if (hasNumericDims && variable.dimensions.length >= 2) {
            spatialVars.push(varName)
          }
        }
      }
    }

    console.log("Final spatial variables found:", spatialVars)
    return spatialVars
  }

  const getTimeDimensionSize = (data: NCData): number => {
    // Look for time dimension - dimension 0 based on your data structure
    if (data.metadata.dimensions["0"]) {
      return data.metadata.dimensions["0"]
    }

    // Fallback to traditional time dimension names
    const timeDimNames = ["time", "Time", "XTIME", "t"]
    for (const dimName of timeDimNames) {
      if (data.metadata.dimensions[dimName]) {
        return data.metadata.dimensions[dimName]
      }
    }
    return 1
  }

  const extractLatLonArrays = (data: NCData): { lats: number[]; lons: number[] } => {
    let lats: number[] = []
    let lons: number[] = []

    // First try to find explicit lat/lon coordinate variables
    const latVarNames = Object.keys(data.variables).filter(
      (varName) =>
        /^(lat|latitude|y|XLAT|south_north)$/i.test(varName) ||
        data.variables[varName].attributes.some(
          (attr) => attr.name === "standard_name" && /latitude/i.test(attr.value),
        ),
    )

    const lonVarNames = Object.keys(data.variables).filter(
      (varName) =>
        /^(lon|longitude|x|XLONG|west_east)$/i.test(varName) ||
        data.variables[varName].attributes.some(
          (attr) => attr.name === "standard_name" && /longitude/i.test(attr.value),
        ),
    )

    console.log("Extracting coordinates from:", { latVarNames, lonVarNames })

    // Extract latitude data
    for (const varName of latVarNames) {
      if (data.variables[varName]) {
        const latData = data.variables[varName].data
        console.log(`Lat data from ${varName}:`, latData.slice(0, 5), "... length:", latData.length)

        if (data.variables[varName].dimensions.length === 1) {
          lats = Array.from(latData)
          break
        } else if (data.variables[varName].dimensions.length === 2) {
          // 2D lat array - extract unique values
          const uniqueLats = [...new Set(latData)].sort((a, b) => a - b)
          lats = uniqueLats
          break
        }
      }
    }

    // Extract longitude data
    for (const varName of lonVarNames) {
      if (data.variables[varName]) {
        const lonData = data.variables[varName].data
        console.log(`Lon data from ${varName}:`, lonData.slice(0, 5), "... length:", lonData.length)

        if (data.variables[varName].dimensions.length === 1) {
          lons = Array.from(lonData)
          break
        } else if (data.variables[varName].dimensions.length === 2) {
          // 2D lon array - extract unique values
          const uniqueLons = [...new Set(lonData)].sort((a, b) => a - b)
          lons = uniqueLons
          break
        }
      }
    }

    // If still no coordinates found, try to infer from dimensions with numeric names
    if (lats.length === 0 || lons.length === 0) {
      const dims = data.metadata.dimensions
      console.log("Available dimensions:", dims)

      // Look for dimensions that might represent spatial coordinates
      const dimEntries = Object.entries(dims)

      // Try to match dimension sizes with coordinate variable sizes
      if (lats.length === 0) {
        // Look for a dimension that matches typical latitude range
        for (const [dimName, dimSize] of dimEntries) {
          if (dimSize > 10 && dimSize < 1000) {
            // Reasonable lat grid size
            lats = Array.from({ length: dimSize }, (_, i) => -90 + (i * 180) / (dimSize - 1))
            console.log(`Generated synthetic lats for dimension ${dimName}:`, lats.slice(0, 5))
            break
          }
        }
      }

      if (lons.length === 0) {
        // Look for a dimension that matches typical longitude range
        for (const [dimName, dimSize] of dimEntries) {
          if (dimSize > 10 && dimSize < 1000 && dimSize !== lats.length) {
            // Different from lat size
            lons = Array.from({ length: dimSize }, (_, i) => -180 + (i * 360) / (dimSize - 1))
            console.log(`Generated synthetic lons for dimension ${dimName}:`, lons.slice(0, 5))
            break
          }
        }
      }
    }

    console.log("Final extracted coordinates:", {
      lats: lats.slice(0, 5),
      lons: lons.slice(0, 5),
      latCount: lats.length,
      lonCount: lons.length,
    })

    return { lats, lons }
  }

  const generateSpatialMap = (data: NCData, variable: string, timeIndex: number) => {
    if (!data.variables[variable]) {
      console.error("Variable not found:", variable)
      return
    }

    const { lats, lons } = extractLatLonArrays(data)
    if (lats.length === 0 || lons.length === 0) {
      console.error("Could not extract lat/lon coordinates")
      return
    }

    const variableData = data.variables[variable]
    const dims = variableData.dimensions
    const variableArray = variableData.data

    console.log("Generating spatial map for:", {
      variable,
      timeIndex,
      dimensions: dims,
      dataLength: variableArray.length,
      latCount: lats.length,
      lonCount: lons.length,
    })

    // Handle the 4D data structure [time, lev, lat, lon] = [0, 3, 2, 1]
    const z: number[][] = []

    if (dims.length === 4) {
      // 4D data: [time, lev, lat, lon]
      const timeSize = data.metadata.dimensions[dims[0]] || 25 // dimension 0
      const levSize = data.metadata.dimensions[dims[1]] || 1 // dimension 3
      const latSize = data.metadata.dimensions[dims[2]] || 113 // dimension 2
      const lonSize = data.metadata.dimensions[dims[3]] || 113 // dimension 1

      console.log("4D data structure:", { timeSize, levSize, latSize, lonSize, timeIndex })

      // Extract data for specific time and level (assuming level 0)
      const levelIndex = 0 // Use first level

      for (let i = 0; i < latSize; i++) {
        const row: number[] = []
        for (let j = 0; j < lonSize; j++) {
          // Index calculation for [time, lev, lat, lon]
          const index = timeIndex * (levSize * latSize * lonSize) + levelIndex * (latSize * lonSize) + i * lonSize + j

          const value = variableArray[index]
          // Handle missing values
          if (value && value < 1e20) {
            // Filter out fill values
            row.push(value)
          } else {
            row.push(0)
          }
        }
        z.push(row)
      }
    } else if (dims.length === 3) {
      // 3D data: [time, lat, lon] or similar
      const dim1Size = data.metadata.dimensions[dims[0]] || 1
      const dim2Size = data.metadata.dimensions[dims[1]] || lats.length
      const dim3Size = data.metadata.dimensions[dims[2]] || lons.length

      console.log("3D data structure:", { dim1Size, dim2Size, dim3Size, timeIndex })

      const latSize = lats.length
      const lonSize = lons.length

      for (let i = 0; i < latSize; i++) {
        const row: number[] = []
        for (let j = 0; j < lonSize; j++) {
          const index = timeIndex * latSize * lonSize + i * lonSize + j
          const value = variableArray[index]
          if (value && value < 1e20) {
            row.push(value)
          } else {
            row.push(0)
          }
        }
        z.push(row)
      }
    } else if (dims.length === 2) {
      // 2D data: [lat, lon]
      const latSize = lats.length
      const lonSize = lons.length

      for (let i = 0; i < latSize; i++) {
        const row: number[] = []
        for (let j = 0; j < lonSize; j++) {
          const index = i * lonSize + j
          const value = variableArray[index]
          if (value && value < 1e20) {
            row.push(value)
          } else {
            row.push(0)
          }
        }
        z.push(row)
      }
    }

    if (z.length === 0 || z[0].length === 0) {
      console.error("Could not process spatial data for variable:", variable)
      return
    }

    console.log("Generated spatial data:", {
      zRows: z.length,
      zCols: z[0]?.length,
      sampleValues: z[0]?.slice(0, 3),
      dataRange: {
        min: Math.min(...z.flat()),
        max: Math.max(...z.flat()),
      },
    })

    const mapData: SpatialMapData = {
      id: `${variable}-${timeIndex}-${Date.now()}`,
      filename: file?.name || "netcdf-data",
      variable,
      timeIndex,
      lats,
      lons,
      z,
      title: getVariableTitle(variable),
      unit: getVariableUnit(variable, data.variables[variable]),
    }

    setSpatialMaps((prev) => {
      const filtered = prev.filter((m) => m.variable !== variable || m.timeIndex !== timeIndex)
      return [...filtered, mapData]
    })
  }

  const getVariableTitle = (variable: string): string => {
    if (/temp|temperature|t2m|T2/i.test(variable)) return "Temperature Distribution"
    if (/precip|precipitation|rain|RAIN|pr/i.test(variable)) return "Precipitation Distribution"
    if (/humid|humidity|rh|RH/i.test(variable)) return "Humidity Distribution"
    if (/wind|WIND|wspd|U10|V10/i.test(variable)) return "Wind Distribution"
    if (/pressure|pres|PRES|slp/i.test(variable)) return "Pressure Distribution"
    if (/cloud|CLOUD|cld/i.test(variable)) return "Cloud Cover Distribution"
    return `${variable} Distribution`
  }

  const getVariableUnit = (variable: string, variableData: NCVariable): string => {
    // First try to get unit from attributes
    const unitAttr = variableData.attributes.find((attr) => /^(units|unit|Unit|UNITS)$/i.test(attr.name))
    if (unitAttr) return unitAttr.value

    // Fallback to variable name patterns
    if (/temp|temperature|t2m|T2/i.test(variable)) return "°C"
    if (/precip|precipitation|rain|RAIN|pr/i.test(variable)) return "mm"
    if (/humid|humidity|rh|RH/i.test(variable)) return "%"
    if (/wind|WIND|wspd|U10|V10/i.test(variable)) return "m/s"
    if (/pressure|pres|PRES|slp/i.test(variable)) return "hPa"
    if (/cloud|CLOUD|cld/i.test(variable)) return "%"
    return ""
  }

  const getColorScale = (variable: string) => {
    if (/temp|temperature|t2m|T2/i.test(variable)) {
      return [
        [0, "#313695"],
        [0.1, "#4575b4"],
        [0.2, "#74add1"],
        [0.3, "#abd9e9"],
        [0.4, "#e0f3f8"],
        [0.5, "#ffffcc"],
        [0.6, "#fee090"],
        [0.7, "#fdae61"],
        [0.8, "#f46d43"],
        [0.9, "#d73027"],
        [1, "#a50026"],
      ]
    } else if (/precip|rain|RAIN|pr/i.test(variable)) {
      return [
        [0, "#f7fbff"],
        [0.1, "#deebf7"],
        [0.2, "#c6dbef"],
        [0.3, "#9ecae1"],
        [0.4, "#6baed6"],
        [0.5, "#4292c6"],
        [0.6, "#2171b5"],
        [0.7, "#08519c"],
        [0.8, "#08306b"],
        [0.9, "#041f4a"],
        [1, "#020c1f"],
      ]
    } else if (/humid|rh|RH/i.test(variable)) {
      return [
        [0, "#fff5f0"],
        [0.2, "#fee0d2"],
        [0.4, "#fcbba1"],
        [0.5, "#fc9272"],
        [0.6, "#fb6a4a"],
        [0.7, "#ef3b2c"],
        [0.8, "#cb181d"],
        [0.9, "#a50f15"],
        [1, "#67000d"],
      ]
    } else if (/wind|WIND|wspd/i.test(variable)) {
      return [
        [0, "#440154"],
        [0.2, "#31688e"],
        [0.4, "#35b779"],
        [0.6, "#fde725"],
        [0.8, "#fd8d3c"],
        [1, "#d73027"],
      ]
    }
    return "Viridis"
  }

  const getSpatialPlotData = (mapData: SpatialMapData): Data[] => {
    const baseData: Data[] = []

    if (/temp|temperature|T2/i.test(mapData.variable)) {
      // Temperature: Heatmap with contour overlay
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "heatmap",
        colorscale: getColorScale(mapData.variable),
        showscale: true,
        colorbar: { title: mapData.unit, titleside: "right" },
      } as PlotData)

      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "contour",
        colorscale: getColorScale(mapData.variable),
        contours: {
          coloring: "none",
          showlines: true,
          linecolor: "rgba(255,255,255,0.5)",
          linewidth: 1,
        },
        showscale: false,
        hoverinfo: "skip",
      } as PlotData)
    } else if (/precip|rain|RAIN/i.test(mapData.variable)) {
      // Precipitation: Filled contour
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "contour",
        colorscale: getColorScale(mapData.variable),
        contours: {
          coloring: "fill",
          showlines: true,
          linecolor: "#1f77b4",
          linewidth: 0.5,
        },
        showscale: true,
        colorbar: { title: mapData.unit, titleside: "right" },
      } as PlotData)
    } else {
      // Default: Standard heatmap
      baseData.push({
        z: mapData.z,
        x: mapData.lons,
        y: mapData.lats,
        type: "heatmap",
        colorscale: getColorScale(mapData.variable),
        showscale: true,
        colorbar: { title: mapData.unit, titleside: "right" },
      } as PlotData)
    }

    return baseData
  }

  const getSpatialLayout = (mapData: SpatialMapData): Partial<Layout> => {
    return {
      title: {
        text: `${mapData.title} - Time: ${mapData.timeIndex}`,
        font: { size: 14, family: "Arial, sans-serif" },
      },
      xaxis: {
        title: "Longitude (°E)",
        showgrid: true,
        gridcolor: "rgba(255,255,255,0.2)",
      },
      yaxis: {
        title: "Latitude (°N)",
        showgrid: true,
        gridcolor: "rgba(255,255,255,0.2)",
      },
      width: 700,
      height: 500,
      margin: { l: 60, r: 60, t: 60, b: 60 },
      paper_bgcolor: "#f8f9fa",
      plot_bgcolor: "#ffffff",
    }
  }

  // Animation functionality
  const startAnimation = () => {
    if (!ncData || !selectedVariable || maxTimeIndex <= 0) return

    setIsAnimating(true)
    const interval = setInterval(() => {
      setSelectedTimeIndex((prev) => {
        const next = prev >= maxTimeIndex ? 0 : prev + 1
        generateSpatialMap(ncData, selectedVariable, next)
        return next
      })
    }, animationSpeed)

    // Store interval ID for cleanup
    const cleanup = () => {
      clearInterval(interval)
      setIsAnimating(false)
    }

    // Auto-cleanup after reasonable time
    setTimeout(cleanup, animationSpeed * (maxTimeIndex + 1) * 3)
  }

  const stopAnimation = () => {
    setIsAnimating(false)
  }

  // Export functions (same as original NetCDFVisualizer)
  const exportToCSV = () => {
    if (!selectedVariable || !ncData) return
    const variable = ncData.variables[selectedVariable]
    const dimensions = variable.dimensions

    if (dimensions.length === 1) {
      const headers = `${dimensions[0]},value`
      const rows = variable.data.map((value, index) => `${index},${value}`)
      const csvContent = [headers, ...rows].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      saveAs(blob, `${selectedVariable}.csv`)
      return
    }

    if (dimensions.length === 2) {
      const dim1Size = ncData.metadata.dimensions[dimensions[0]] || Math.sqrt(variable.data.length)
      const dim2Size = ncData.metadata.dimensions[dimensions[1]] || Math.sqrt(variable.data.length)
      const headers = `${dimensions[0]},${dimensions[1]},value`
      const rows = []
      for (let i = 0; i < dim1Size; i++) {
        for (let j = 0; j < dim2Size; j++) {
          const index = i * dim2Size + j
          if (index < variable.data.length) {
            rows.push(`${i},${j},${variable.data[index]}`)
          }
        }
      }
      const csvContent = [headers, ...rows].join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      saveAs(blob, `${selectedVariable}.csv`)
      return
    }

    const headers = "index,value"
    const rows = variable.data.map((value, index) => `${index},${value}`)
    const csvContent = [headers, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, `${selectedVariable}.csv`)
  }

  const exportToTXT = () => {
    if (!selectedVariable || !ncData) return
    const variable = ncData.variables[selectedVariable]
    const dimensions = variable.dimensions

    if (dimensions.length === 1) {
      const headers = `${dimensions[0]},value`
      const rows = variable.data.map((value, index) => `${index},${value}`)
      const txtContent = [headers, ...rows].join("\n")
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" })
      saveAs(blob, `${selectedVariable}.txt`)
      return
    }

    if (dimensions.length === 2) {
      const dim1Size = ncData.metadata.dimensions[dimensions[0]] || Math.sqrt(variable.data.length)
      const dim2Size = ncData.metadata.dimensions[dimensions[1]] || Math.sqrt(variable.data.length)
      const headers = `${dimensions[0]},${dimensions[1]},value`
      const rows = []
      for (let i = 0; i < dim1Size; i++) {
        for (let j = 0; j < dim2Size; j++) {
          const index = i * dim2Size + j
          if (index < variable.data.length) {
            rows.push(`${i},${j},${variable.data[index]}`)
          }
        }
      }
      const txtContent = [headers, ...rows].join("\n")
      const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" })
      saveAs(blob, `${selectedVariable}.txt`)
      return
    }

    const headers = "index,value"
    const rows = variable.data.map((value, index) => `${index},${value}`)
    const txtContent = [headers, ...rows].join("\n")
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" })
    saveAs(blob, `${selectedVariable}.txt`)
  }

  const exportToJSON = () => {
    if (!selectedVariable || !ncData) return
    const variable = ncData.variables[selectedVariable]
    const jsonContent = JSON.stringify(
      {
        variable: selectedVariable,
        dimensions: variable.dimensions,
        attributes: variable.attributes,
        data: variable.data,
      },
      null,
      2,
    )
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    saveAs(blob, `${selectedVariable}.json`)
  }

  // Standard visualization functions (keeping existing functionality)
  const preparePlotData = (): Data[] | null => {
    if (!selectedVariable || !ncData) return null
    const variable = ncData.variables[selectedVariable]
    const data = variable.data

    switch (plotType) {
      case "line":
        return [
          {
            type: "scatter",
            mode: "lines+markers",
            x: Array.from({ length: data.length }, (_, i) => i),
            y: data,
            name: selectedVariable,
            line: { color: "#3b82f6" },
          } as PlotData,
        ]
      case "scatter":
        return [
          {
            type: "scatter",
            mode: "markers",
            x: Array.from({ length: data.length }, (_, i) => i),
            y: data,
            name: selectedVariable,
            marker: { color: "#3b82f6", size: 4 },
          } as PlotData,
        ]
      case "histogram":
        return [
          {
            type: "histogram",
            x: data,
            name: selectedVariable,
            marker: { color: "#3b82f6" },
          } as PlotData,
        ]
      case "heatmap":
        const reshaped = reshapeTo2D(data, variable.dimensions)
        return [
          {
            type: "heatmap",
            z: reshaped,
            name: selectedVariable,
            colorscale: "Viridis",
          } as PlotData,
        ]
      case "contour":
        const contourData = reshapeTo2D(data, variable.dimensions)
        return [
          {
            type: "contour",
            z: contourData,
            name: selectedVariable,
            colorscale: "Viridis",
          } as PlotData,
        ]
      case "surface":
        const surfaceData = reshapeTo2D(data, variable.dimensions)
        return [
          {
            type: "surface",
            z: surfaceData,
            name: selectedVariable,
            colorscale: "Viridis",
          } as PlotData,
        ]
      default:
        return null
    }
  }

  const reshapeTo2D = (data: number[], dims: string[]) => {
    if (!ncData?.metadata.dimensions) return [data]
    const dimSizes = dims.map((dim) => ncData.metadata.dimensions[dim] || Math.sqrt(data.length))

    if (dimSizes.length === 1) {
      return [data]
    }

    if (dimSizes.length >= 2) {
      const rows = dimSizes[0]
      const cols = dimSizes[1]
      const result = []
      for (let i = 0; i < rows; i++) {
        const row = []
        for (let j = 0; j < cols; j++) {
          const index = i * cols + j
          row.push(data[index] || 0)
        }
        result.push(row)
      }
      return result
    }
    return [data]
  }

  const getPlotLayout = (): Partial<Layout> => {
    const baseLayout: Partial<Layout> = {
      title: {
        text: selectedVariable,
        font: { size: 16 },
      },
      autosize: true,
      margin: { l: 60, r: 40, b: 60, t: 80, pad: 4 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
    }

    switch (plotType) {
      case "surface":
        return {
          ...baseLayout,
          scene: {
            xaxis: { title: { text: "X" } },
            yaxis: { title: { text: "Y" } },
            zaxis: { title: { text: selectedVariable } },
          },
        }
      case "heatmap":
      case "contour":
        return {
          ...baseLayout,
          xaxis: { title: { text: "X Index" } },
          yaxis: { title: { text: "Y Index" } },
        }
      case "histogram":
        return {
          ...baseLayout,
          xaxis: { title: { text: selectedVariable } },
          yaxis: { title: { text: "Frequency" } },
        }
      default:
        return {
          ...baseLayout,
          xaxis: { title: { text: "Index" } },
          yaxis: { title: { text: selectedVariable } },
        }
    }
  }

  const renderVisualization = () => {
    if (!selectedVariable || !ncData) return null
    const plotData = preparePlotData()
    if (!plotData) return null

    return (
      <div className="w-full h-96">
        <Plot
          data={plotData}
          layout={getPlotLayout()}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
          config={{
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ["pan2d", "lasso2d"],
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-xl shadow-lg backdrop-blur-sm bg-opacity-20">
        <h1 className="text-3xl font-bold mb-2 text-white">NetCDF Data Analysis</h1>
        <p className="text-white/90">
          Advanced spatial analysis and visualization of NetCDF weather data
        </p>
      </div>

      {/* File Upload Card */}
      <Card className="mb-6 backdrop-blur-sm bg-white/10 border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Upload className="h-5 w-5" />
            Upload NetCDF File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="file-upload" className="text-gray-800/80">
                Select NetCDF file (.nc)
              </Label>
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept=".nc"
                onChange={handleFileChange}
                className="mt-1 bg-white/5 border-gradient-to-r from-indigo-500 to-purple-500 text-gray-800 hover:bg-white/10 focus-visible:ring-white/50"
              />
            </div>
            {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</div>}
            <Button
              type="submit"
              disabled={!file || isProcessing}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/20"
            >
              {isProcessing ? "Processing..." : "Process NetCDF File"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {ncData && (
        <div>
          {/* Export Card */}
          <Card className="backdrop-blur-sm bg-white/10 border border-white/20 mt-4 mb-4">
            <CardHeader>
              <CardTitle className="text-black">Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  onClick={exportToCSV}
                  disabled={!selectedVariable}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                >
                  <FileText className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button
                  onClick={exportToTXT}
                  disabled={!selectedVariable}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                >
                  <FileText className="h-4 w-4" />
                  Export TXT
                </Button>
                <Button
                  onClick={exportToJSON}
                  disabled={!selectedVariable}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <FileText className="h-4 w-4" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="spatial" className="w-full" onValueChange={(value) => setActiveTab(value)}>
            <TabsList className="grid w-full grid-cols-3 backdrop-blur-sm bg-white/10 border border-white/20">
              <TabsTrigger
                value="spatial"
                className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:border-indigo-400"
              >
                <MapPin className="h-4 w-4" />
                Spatial Analysis
              </TabsTrigger>
              <TabsTrigger
                value="plot"
                className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:border-indigo-400"
              >
                <Activity className="h-4 w-4" />
                Standard Plots
              </TabsTrigger>
              <TabsTrigger
                value="metadata"
                className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:border-indigo-400"
              >
                <FileText className="h-4 w-4" />
                Metadata
              </TabsTrigger>
            </TabsList>

            {/* Spatial Analysis Tab */}
            <TabsContent value="spatial">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Controls Panel */}
                <div className="lg:col-span-1 space-y-4">
                  <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
                    <CardHeader>
                      <CardTitle className="text-black">Spatial Variables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {spatialVariables.length > 0 ? (
                        <Select
                          value={selectedVariable}
                          onValueChange={(value) => {
                            setSelectedVariable(value)
                            generateSpatialMap(ncData, value, selectedTimeIndex)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select spatial variable..." />
                          </SelectTrigger>
                          <SelectContent>
                            {spatialVariables.map((varName) => (
                              <SelectItem key={varName} value={varName}>
                                {getVariableTitle(varName)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm text-gray-600 p-2 bg-yellow-50 rounded">
                          No spatial variables found. Variables need lat/lon dimensions.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {maxTimeIndex > 0 && (
                    <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
                      <CardHeader>
                        <CardTitle className="text-black flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Time Control
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm text-gray-700">Time Index: {selectedTimeIndex}</Label>
                          <Slider
                            value={[selectedTimeIndex]}
                            max={maxTimeIndex}
                            step={1}
                            onValueChange={(value) => {
                              setSelectedTimeIndex(value[0])
                              if (selectedVariable) {
                                generateSpatialMap(ncData, selectedVariable, value[0])
                              }
                            }}
                            className="mt-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={isAnimating ? stopAnimation : startAnimation}
                            className="flex items-center gap-1"
                            disabled={!selectedVariable}
                          >
                            {isAnimating ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            {isAnimating ? "Stop" : "Animate"}
                          </Button>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-700">Animation Speed (ms)</Label>
                          <Slider
                            value={[animationSpeed]}
                            min={100}
                            max={3000}
                            step={100}
                            onValueChange={(value) => setAnimationSpeed(value[0])}
                            className="mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Visualization Panel */}
                <div className="lg:col-span-3">
                  {spatialMaps.length === 0 ? (
                    <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
                      <CardContent className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Spatial Data</h3>
                          <p className="text-gray-500">
                            {spatialVariables.length === 0
                              ? "No spatial variables found in this NetCDF file"
                              : "Select a spatial variable to generate visualization"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {spatialMaps.map((mapData) => (
                        <Card key={mapData.id} className="backdrop-blur-sm bg-white/10 border border-white/20">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-black">{mapData.title}</CardTitle>
                                <p className="text-sm text-gray-600">
                                  Time Index: {mapData.timeIndex} | Dataset: {mapData.filename}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSpatialMaps((prev) => prev.filter((m) => m.id !== mapData.id))}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="w-full">
                              <Plot
                                data={getSpatialPlotData(mapData)}
                                layout={getSpatialLayout(mapData)}
                                useResizeHandler
                                style={{ width: "100%", height: "500px" }}
                                config={{
                                  responsive: true,
                                  displayModeBar: true,
                                  modeBarButtonsToRemove: ["lasso2d", "select2d", "autoScale2d"],
                                  displaylogo: false,
                                  toImageButtonOptions: {
                                    format: "png",
                                    filename: `${mapData.variable}_spatial_t${mapData.timeIndex}`,
                                    height: 500,
                                    width: 700,
                                    scale: 2,
                                  },
                                }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Standard Plots Tab */}
            <TabsContent value="plot">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="backdrop-blur-sm bg-white/10 border border-white/20 h-full overflow-y-auto">
                    <CardHeader>
                      <CardTitle className="text-white bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                        All Variables
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs
                        value={selectedVariable}
                        onValueChange={setSelectedVariable}
                        className="w-full"
                        orientation="vertical"
                      >
                        <TabsList className="grid gap-2 w-full bg-transparent justify-start">
                          {Object.keys(ncData.variables).map((varName) => (
                            <TabsTrigger
                              key={varName}
                              value={varName}
                              className="justify-start px-4 py-2 text-left backdrop-blur-sm bg-white/5 hover:bg-white/10 border border-white/10 data-[state=active]:bg-indigo-500 data-[state=active]:border-indigo-400 data-[state=active]:text-white transition-all hover:bg-indigo-500 hover:text-white hover:border-indigo-400"
                            >
                              <div className="font-medium">{varName.charAt(0).toUpperCase() + varName.slice(1)}</div>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-3">
                  <Card className="backdrop-blur-sm bg-white/10 border border-white/20">
                    <CardContent>
                      <div className="space-y-4">
                        <Label className="text-black/80">Plot Types</Label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                          <Button
                            variant={plotType === "line" ? "default" : "outline"}
                            onClick={() => setPlotType("line")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:text-white hover:border-indigo-400 justify-center h-20 gap-1 ${
                              plotType === "line" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"
                            }`}
                          >
                            <LineChart className="h-5 w-5" />
                            <span className="text-sm">Line</span>
                          </Button>
                          <Button
                            variant={plotType === "scatter" ? "default" : "outline"}
                            onClick={() => setPlotType("scatter")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:text-white hover:border-indigo-400 justify-center h-20 gap-1 ${
                              plotType === "scatter" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"
                            }`}
                          >
                            <ScatterChart className="h-5 w-5" />
                            <span className="text-sm">Scatter</span>
                          </Button>
                          <Button
                            variant={plotType === "histogram" ? "default" : "outline"}
                            onClick={() => setPlotType("histogram")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:text-white hover:border-indigo-400 justify-center h-20 gap-1 ${
                              plotType === "histogram" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"
                            }`}
                          >
                            <Gauge className="h-5 w-5" />
                            <span className="text-sm">Histogram</span>
                          </Button>
                          <Button
                            variant={plotType === "heatmap" ? "default" : "outline"}
                            onClick={() => setPlotType("heatmap")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:border-indigo-400 hover:text-white justify-center h-20 gap-1 ${
                              plotType === "heatmap" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"
                            }`}
                          >
                            <Map className="h-5 w-5" />
                            <span className="text-sm">Heatmap</span>
                          </Button>
                          <Button
                            variant={plotType === "contour" ? "default" : "outline"}
                            onClick={() => setPlotType("contour")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:border-indigo-400 hover:text-white justify-center h-20 gap-1 ${
                              plotType === "contour" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"
                            }`}
                          >
                            <BoxSelect className="h-5 w-5" />
                            <span className="text-sm">Contour</span>
                          </Button>
                          <Button
                            variant={plotType === "surface" ? "default" : "outline"}
                            onClick={() => setPlotType("surface")}
                            className={`flex flex-col items-center hover:bg-indigo-600 hover:border-indigo-400 hover:text-white justify-center h-20 gap-1 ${
                              plotType === "surface" ? "bg-indigo-500 border-indigo-400" : "bg-white border-white"
                            }`}
                          >
                            <Box className="h-5 w-5" />
                            <span className="text-sm">Surface</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="backdrop-blur-sm bg-white/10 border border-white/20 mt-4">
                    <CardHeader>
                      <CardTitle className="text-black">
                        {selectedVariable ? `${selectedVariable} - ${plotType}` : "Select Variable"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedVariable ? (
                        renderVisualization()
                      ) : (
                        <div className="flex items-center justify-center h-96 text-black/70">
                          Select a variable to visualize
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Metadata Tab */}
            <TabsContent value="metadata">
              <Card className="backdrop-blur-sm bg-white/10 border-2 border-gradient-to-r from-indigo-500 to-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-black">NetCDF Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-black/80">Dimensions</h4>
                    <div className="bg-white/5 p-3 rounded-md border border-white/10">
                      <pre className="text-sm text-black/90">{JSON.stringify(ncData.metadata.dimensions, null, 2)}</pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-black/80">Global Attributes</h4>
                    <div className="bg-white/5 p-3 rounded-md max-h-64 overflow-y-auto border border-white/10">
                      <pre className="text-sm text-black/90">
                        {JSON.stringify(ncData.metadata.globalAttributes, null, 2)}
                      </pre>
                    </div>
                  </div>
                  {selectedVariable && (
                    <div>
                      <h4 className="font-semibold mb-2 text-black/80">Variable Attributes: {selectedVariable}</h4>
                      <div className="bg-white/5 p-3 rounded-md max-h-64 overflow-y-auto border border-white/10">
                        <pre className="text-sm text-black/90">
                          {JSON.stringify(ncData.variables[selectedVariable].attributes, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold mb-2 text-black/80">Spatial Variables Found</h4>
                    <div className="bg-white/5 p-3 rounded-md border border-white/10">
                      <div className="text-sm text-black/90">
                        {spatialVariables.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {spatialVariables.map((varName) => (
                              <li key={varName}>
                                {varName} - {getVariableTitle(varName)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>No spatial variables detected (variables need lat/lon dimensions)</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
