"use client"

import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Info, Maximize2, Wind, Thermometer, Droplets } from "lucide-react"
import type { JSX } from "react/jsx-runtime"
import { useTranslations } from "next-intl"

// Interface matching your RadiosondeAnalyzer data structure
interface DecodedLevel {
  pressure: number
  height: number | null
  temperature: number | null
  dewpoint: number | null
  windDirection: number | null
  windSpeed: number | null
  dewpointDepression: number | null
}

interface DecodedData {
  station: string
  date: number
  time: number
  surfacePressure: number
  surfaceTemperature: number
  surfaceDewpointDepression: number
  surfaceWindDirection: number
  surfaceWindSpeed: number
  mandatoryLevels: DecodedLevel[]
  significantLevels: DecodedLevel[]
  tropopause: {
    pressure: number
    temperature: number
    dewpoint: number
    windDirection: number
    windSpeed: number
  } | null
  maxWind: {
    pressure: number
    windDirection: number
    windSpeed: number
  } | null
}

interface TephigramProps {
  width?: string | number
  height?: number
  decodedData: DecodedData | null
}

// Enhanced coordinate transformation functions
const pressureToY = (pressure: number, height: number, minP = 100, maxP = 1000): number => {
  const logP = Math.log(pressure)
  const logMinP = Math.log(minP)
  const logMaxP = Math.log(maxP)
  return height * (1 - (logP - logMinP) / (logMaxP - logMinP))
}

const temperatureToX = (temperature: number, width: number, minT = -80, maxT = 50): number => {
  return (width * (temperature - minT)) / (maxT - minT)
}

// Professional wind barb drawing function
const drawWindBarb = (x: number, y: number, direction: number, speed: number): JSX.Element => {
  const barbLength = 28
  const flagLength = 12
  const angle = (((direction + 180) % 360) * Math.PI) / 180

  const shaftEndX = x + barbLength * Math.cos(angle)
  const shaftEndY = y + barbLength * Math.sin(angle)

  const flags = Math.floor(speed / 50)
  const fullBarbs = Math.floor((speed % 50) / 10)
  const halfBarbs = Math.floor((speed % 10) / 5)

  const elements: JSX.Element[] = []

  // Professional main shaft
  elements.push(
    <line
      key="shaft"
      x1={x}
      y1={y}
      x2={shaftEndX}
      y2={shaftEndY}
      stroke="#1e40af"
      strokeWidth="3"
      strokeLinecap="round"
    />,
  )

  let currentPos = 0.8

  // Enhanced flags (50+ knots)
  for (let i = 0; i < flags; i++) {
    const flagX = x + barbLength * currentPos * Math.cos(angle)
    const flagY = y + barbLength * currentPos * Math.sin(angle)
    const flagEndX = flagX + flagLength * Math.cos(angle + Math.PI / 2)
    const flagEndY = flagY + flagLength * Math.sin(angle + Math.PI / 2)
    const flagTipX = flagX + flagLength * 0.7 * Math.cos(angle - Math.PI / 4)
    const flagTipY = flagY + flagLength * 0.7 * Math.sin(angle - Math.PI / 4)

    elements.push(
      <polygon
        key={`flag-${i}`}
        points={`${flagX},${flagY} ${flagEndX},${flagEndY} ${flagTipX},${flagTipY}`}
        fill="#1e40af"
        stroke="#1e3a8a"
        strokeWidth="1"
      />,
    )
    currentPos -= 0.15
  }

  // Enhanced full barbs (10 knots)
  for (let i = 0; i < fullBarbs; i++) {
    const barbX = x + barbLength * currentPos * Math.cos(angle)
    const barbY = y + barbLength * currentPos * Math.sin(angle)
    const barbEndX = barbX + flagLength * Math.cos(angle + Math.PI / 2)
    const barbEndY = barbY + flagLength * Math.sin(angle + Math.PI / 2)

    elements.push(
      <line
        key={`barb-${i}`}
        x1={barbX}
        y1={barbY}
        x2={barbEndX}
        y2={barbEndY}
        stroke="#1e40af"
        strokeWidth="2.5"
        strokeLinecap="round"
      />,
    )
    currentPos -= 0.1
  }

  // Enhanced half barbs (5 knots)
  for (let i = 0; i < halfBarbs; i++) {
    const barbX = x + barbLength * currentPos * Math.cos(angle)
    const barbY = y + barbLength * currentPos * Math.sin(angle)
    const barbEndX = barbX + flagLength * 0.5 * Math.cos(angle + Math.PI / 2)
    const barbEndY = barbY + flagLength * 0.5 * Math.sin(angle + Math.PI / 2)

    elements.push(
      <line
        key={`half-barb-${i}`}
        x1={barbX}
        y1={barbY}
        x2={barbEndX}
        y2={barbEndY}
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
      />,
    )
    currentPos -= 0.08
  }

  return <g key={`windbarb-${x}-${y}`}>{elements}</g>
}

// Professional gradient definitions
const ProfessionalGradients = () => (
  <defs>
    {/* Background gradients */}
    <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#fafbff" />
      <stop offset="50%" stopColor="#f1f5f9" />
      <stop offset="100%" stopColor="#e2e8f0" />
    </linearGradient>

    {/* Temperature gradients */}
    <linearGradient id="temperatureGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#b91c1c" />
      <stop offset="30%" stopColor="#dc2626" />
      <stop offset="70%" stopColor="#ef4444" />
      <stop offset="100%" stopColor="#f87171" />
    </linearGradient>

    {/* Dewpoint gradients */}
    <linearGradient id="dewpointGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#065f46" />
      <stop offset="30%" stopColor="#059669" />
      <stop offset="70%" stopColor="#10b981" />
      <stop offset="100%" stopColor="#34d399" />
    </linearGradient>

    {/* Wind gradients */}
    <linearGradient id="windGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1e3a8a" />
      <stop offset="50%" stopColor="#1e40af" />
      <stop offset="100%" stopColor="#3b82f6" />
    </linearGradient>

    {/* Pressure gradients */}
    <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#4338ca" />
      <stop offset="50%" stopColor="#6366f1" />
      <stop offset="100%" stopColor="#8b5cf6" />
    </linearGradient>

    {/* Tropopause gradient */}
    <radialGradient id="tropopauseGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#f59e0b" />
      <stop offset="50%" stopColor="#d97706" />
      <stop offset="100%" stopColor="#b45309" />
    </radialGradient>

    {/* Adiabat gradients */}
    <linearGradient id="dryAdiabatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#166534" />
      <stop offset="50%" stopColor="#16a34a" />
      <stop offset="100%" stopColor="#22c55e" />
    </linearGradient>

    <linearGradient id="satAdiabatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#581c87" />
      <stop offset="50%" stopColor="#7c3aed" />
      <stop offset="100%" stopColor="#a855f7" />
    </linearGradient>

    {/* Humidity gradient */}
    <linearGradient id="humidityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#0e7490" />
      <stop offset="50%" stopColor="#0891b2" />
      <stop offset="100%" stopColor="#06b6d4" />
    </linearGradient>

    {/* Glow effects */}
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
    </filter>
  </defs>
)

const Tephigram: React.FC<TephigramProps> = ({ width = "100%", height = 800, decodedData }) => {
  const t = useTranslations('tephigram')
  const svgWidth = 1400 // Increased width for better visibility
  const svgHeight = height
  const margin = { top: 80, right: 220, bottom: 100, left: 120 }
  const plotWidth = svgWidth - margin.left - margin.right
  const plotHeight = svgHeight - margin.top - margin.bottom

  const pressureRange = { min: 100, max: 1000 }
  const temperatureRange = { min: -80, max: 50 }

  if (!decodedData) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
        <Card className="w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center h-96 p-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Info className="w-10 h-10 text-white" />
              </div>
              <div className="text-gray-700 text-2xl mb-3 font-bold">{t('noData.title')}</div>
              <div className="text-gray-500 text-lg">{t('noData.description')}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Combine all data for processing
  const allLevels = [
    {
      pressure: decodedData.surfacePressure,
      temperature: decodedData.surfaceTemperature,
      dewpoint: decodedData.surfaceTemperature - decodedData.surfaceDewpointDepression,
      windDirection: decodedData.surfaceWindDirection,
      windSpeed: decodedData.surfaceWindSpeed,
      height: null,
      dewpointDepression: decodedData.surfaceDewpointDepression,
    },
    ...decodedData.mandatoryLevels,
    ...decodedData.significantLevels,
  ].sort((a, b) => b.pressure - a.pressure)

  // 1. Enhanced Isobars Component
  const IsobarsChart = () => {
    const isobarLevels = [1000, 925, 850, 700, 500, 400, 300, 250, 200, 150, 100]

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.isobars.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.isobars.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#cbd5e1" strokeWidth="2" rx="12" />

              {/* Professional grid pattern */}
              <defs>
                <pattern id="professionalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="#e2e8f0" opacity="0.4" />
                </pattern>
              </defs>
              <rect width={plotWidth} height={plotHeight} fill="url(#professionalGrid)" />

              {/* Enhanced isobar lines */}
              {isobarLevels.map((pressure, index) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                const isMainLevel = [1000, 850, 700, 500, 300, 200, 100].includes(pressure)
                const color = isMainLevel ? "#1e40af" : "#3b82f6"

                return (
                  <g key={`isobar-${pressure}`}>
                    <line
                      x1={0}
                      y1={y}
                      x2={plotWidth}
                      y2={y}
                      stroke={color}
                      strokeWidth={isMainLevel ? "3" : "2"}
                      filter={isMainLevel ? "url(#shadow)" : "none"}
                    />
                    <rect
                      x={-110}
                      y={y - 15}
                      width="100"
                      height="30"
                      fill={color}
                      rx="6"
                      opacity="0.95"
                      filter="url(#shadow)"
                    />
                    <text x={-60} y={y + 6} fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">
                      {pressure} hPa
                    </text>
                    <circle cx={plotWidth - 30} cy={y} r="6" fill={color} filter="url(#shadow)" />
                  </g>
                )
              })}

              {/* Y-axis labels */}
              <text x={-60} y={-20} fontSize="16" fill="#1e293b" fontWeight="bold" textAnchor="middle">
                {t('charts.isobars.title')}
              </text>
            </g>

            {/* Y-axis title */}
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 2. Enhanced Isotherms Component
  const IsothermsChart = () => {
    const isothermLevels = [-60, -40, -20, 0, 20, 40]

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.isotherms.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.isotherms.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#fecaca" strokeWidth="2" rx="12" />

              {/* Enhanced isotherm lines */}
              {isothermLevels.map((temp, index) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                const isZero = temp === 0
                const color = isZero ? "#dc2626" : temp < 0 ? "#3b82f6" : "#f59e0b"

                return (
                  <g key={`isotherm-${temp}`}>
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={plotHeight}
                      stroke={color}
                      strokeWidth={isZero ? "4" : "3"}
                      filter={isZero ? "url(#shadow)" : "none"}
                    />
                    <rect
                      x={x - 30}
                      y={plotHeight + 25}
                      width="60"
                      height="35"
                      fill={color}
                      rx="8"
                      opacity="0.95"
                      filter="url(#shadow)"
                    />
                    <text x={x} y={plotHeight + 46} fontSize="14" fill="white" textAnchor="middle" fontWeight="bold">
                      {temp}°C
                    </text>
                    <circle cx={x} cy={25} r="8" fill={color} filter="url(#shadow)" />
                    <text x={x} y={10} fontSize="12" fill={color} textAnchor="middle" fontWeight="bold">
                      {temp}°
                    </text>
                  </g>
                )
              })}

              {/* X-axis grid lines */}
              {[-60, -40, -20, 0, 20, 40].map((temp) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                return (
                  <line
                    key={`grid-${temp}`}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={plotHeight}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )
              })}
            </g>

            {/* X-axis title */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t('charts.isotherms.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 3. Enhanced Dry Adiabats Component
  const DryAdiabatsChart = () => {
    const dryAdiabatLevels = [-40, -20, 0, 20, 40, 60, 80]

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.dryAdiabats.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.dryAdiabats.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#bbf7d0" strokeWidth="2" rx="12" />

              {/* Pressure grid lines */}
              {[1000, 850, 700, 500, 300, 200, 100].map((pressure) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                return (
                  <g key={`pressure-grid-${pressure}`}>
                    <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#f0fdf4" strokeWidth="1" />
                    <text x={-5} y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end">
                      {pressure}
                    </text>
                  </g>
                )
              })}

              {/* Temperature grid lines */}
              {[-60, -40, -20, 0, 20, 40].map((temp) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                return (
                  <g key={`temp-grid-${temp}`}>
                    <line x1={x} y1={0} x2={x} y2={plotHeight} stroke="#f0fdf4" strokeWidth="1" />
                    <text x={x} y={plotHeight + 15} fontSize="12" fill="#6b7280" textAnchor="middle">
                      {temp}°C
                    </text>
                  </g>
                )
              })}

              {/* Enhanced dry adiabat lines */}
              {dryAdiabatLevels.map((potentialTemp, index) => {
                const pathPoints: string[] = []
                for (let p = pressureRange.max; p >= pressureRange.min; p -= 10) {
                  const temp = potentialTemp - 273.15 + 273.15 * Math.pow(p / 1000, 0.286)
                  const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                  const y = pressureToY(p, plotHeight, pressureRange.min, pressureRange.max)

                  if (x >= 0 && x <= plotWidth) {
                    pathPoints.push(`${x},${y}`)
                  }
                }

                if (pathPoints.length > 1) {
                  const color = `hsl(${120 + index * 12}, 75%, ${45 + index * 4}%)`
                  return (
                    <g key={`dry-adiabat-${potentialTemp}`}>
                      <polyline
                        points={pathPoints.join(" ")}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray="10,5"
                        filter="url(#glow)"
                      />
                      <rect
                        x={20}
                        y={40 + index * 35}
                        width="140"
                        height="25"
                        fill={color}
                        rx="6"
                        opacity="0.95"
                        filter="url(#shadow)"
                      />
                      <text x={90} y={56 + index * 35} fontSize="13" fill="white" textAnchor="middle" fontWeight="bold">
                        θ = {potentialTemp}K
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </g>

            {/* Axis titles */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t('charts.isotherms.title')}
            </text>
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 4. Enhanced Saturated Adiabats Component
  const SaturatedAdiabatsChart = () => {
    const satAdiabatLevels = [-20, 0, 20, 40]

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.satAdiabats.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.satAdiabats.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#ddd6fe" strokeWidth="2" rx="12" />

              {/* Pressure grid lines */}
              {[1000, 850, 700, 500, 300, 200, 100].map((pressure) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                return (
                  <g key={`pressure-grid-${pressure}`}>
                    <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#faf5ff" strokeWidth="1" />
                    <text x={-5} y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end">
                      {pressure}
                    </text>
                  </g>
                )
              })}

              {/* Temperature grid lines */}
              {[-60, -40, -20, 0, 20, 40].map((temp) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                return (
                  <g key={`temp-grid-${temp}`}>
                    <line x1={x} y1={0} x2={x} y2={plotHeight} stroke="#faf5ff" strokeWidth="1" />
                    <text x={x} y={plotHeight + 15} fontSize="12" fill="#6b7280" textAnchor="middle">
                      {temp}°C
                    </text>
                  </g>
                )
              })}

              {/* Enhanced saturated adiabat lines */}
              {satAdiabatLevels.map((startTemp, index) => {
                const pathPoints: string[] = []
                let currentTemp = startTemp

                for (let p = 1000; p >= pressureRange.min; p -= 20) {
                  const x = temperatureToX(currentTemp, plotWidth, temperatureRange.min, temperatureRange.max)
                  const y = pressureToY(p, plotHeight, pressureRange.min, pressureRange.max)

                  if (x >= 0 && x <= plotWidth) {
                    pathPoints.push(`${x},${y}`)
                  }

                  // Approximate saturated adiabatic lapse rate
                  currentTemp -= 6.5 * (20 / 1000) * 1000
                }

                if (pathPoints.length > 1) {
                  const color = `hsl(${280 + index * 25}, 75%, ${50 + index * 6}%)`
                  return (
                    <g key={`sat-adiabat-${startTemp}`}>
                      <polyline
                        points={pathPoints.join(" ")}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray="8,8"
                        filter="url(#glow)"
                      />
                      <rect
                        x={plotWidth - 160}
                        y={40 + index * 35}
                        width="150"
                        height="25"
                        fill={color}
                        rx="6"
                        opacity="0.95"
                        filter="url(#shadow)"
                      />
                      <text
                        x={plotWidth - 85}
                        y={56 + index * 35}
                        fontSize="13"
                        fill="white"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        θw = {startTemp}°C
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </g>

            {/* Axis titles */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t('charts.isotherms.title')}
            </text>
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 5. Enhanced Humidity Mixing Ratio Lines Component
  const HmrLinesChart = () => {
    const hmrLevels = [0.1, 0.5, 1, 2, 5, 10, 20]

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.hmrLines.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.hmrLines.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#a7f3d0" strokeWidth="2" rx="12" />

              {/* Pressure grid lines */}
              {[1000, 850, 700, 500, 300, 200, 100].map((pressure) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                return (
                  <g key={`pressure-grid-${pressure}`}>
                    <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#f0fdfa" strokeWidth="1" />
                    <text x={-5} y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end">
                      {pressure}
                    </text>
                  </g>
                )
              })}

              {/* Temperature grid lines */}
              {[-60, -40, -20, 0, 20, 40].map((temp) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                return (
                  <g key={`temp-grid-${temp}`}>
                    <line x1={x} y1={0} x2={x} y2={plotHeight} stroke="#f0fdfa" strokeWidth="1" />
                    <text x={x} y={plotHeight + 15} fontSize="12" fill="#6b7280" textAnchor="middle">
                      {temp}°C
                    </text>
                  </g>
                )
              })}

              {/* Enhanced humidity mixing ratio lines */}
              {hmrLevels.map((mixingRatio, index) => {
                const pathPoints: string[] = []

                for (let p = pressureRange.max; p >= pressureRange.min; p -= 10) {
                  const es = (mixingRatio * p) / (622 + mixingRatio)
                  const temp = (243.5 * Math.log(es / 6.112)) / (17.67 - Math.log(es / 6.112))

                  if (!isNaN(temp) && temp >= temperatureRange.min && temp <= temperatureRange.max) {
                    const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                    const y = pressureToY(p, plotHeight, pressureRange.min, pressureRange.max)
                    pathPoints.push(`${x},${y}`)
                  }
                }

                if (pathPoints.length > 1) {
                  const color = `hsl(${180 + index * 18}, 75%, ${45 + index * 4}%)`
                  return (
                    <g key={`hmr-${mixingRatio}`}>
                      <polyline
                        points={pathPoints.join(" ")}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray="6,6"
                        filter="url(#glow)"
                      />
                      <rect
                        x={plotWidth - 100}
                        y={plotHeight - 70 - index * 40}
                        width="90"
                        height="25"
                        fill={color}
                        rx="6"
                        opacity="0.95"
                        filter="url(#shadow)"
                      />
                      <text
                        x={plotWidth - 55}
                        y={plotHeight - 52 - index * 40}
                        fontSize="13"
                        fill="white"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {mixingRatio}g/kg
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </g>

            {/* Axis titles */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t('charts.isotherms.title')}
            </text>
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 6. Enhanced Environmental Lapse Rate Component
  const EnvironmentalLapseRateChart = () => {
    const tempData = allLevels.filter((d) => d.temperature !== null)
    const tempProfilePoints: string[] = []

    tempData.forEach((point) => {
      const x = temperatureToX(point.temperature!, plotWidth, temperatureRange.min, temperatureRange.max)
      const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
      if (x >= 0 && x <= plotWidth && y >= 0 && y <= plotHeight) {
        tempProfilePoints.push(`${x},${y}`)
      }
    })

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.tempProfile.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.tempProfile.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#fed7aa" strokeWidth="2" rx="12" />

              {/* Enhanced grid lines */}
              {[1000, 850, 700, 500, 300, 200, 100].map((pressure) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                return (
                  <g key={`pressure-grid-${pressure}`}>
                    <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#fef7ed" strokeWidth="2" />
                    <text x={-5} y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end" fontWeight="bold">
                      {pressure}
                    </text>
                  </g>
                )
              })}

              {[-60, -40, -20, 0, 20, 40].map((temp) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                return (
                  <g key={`temp-grid-${temp}`}>
                    <line x1={x} y1={0} x2={x} y2={plotHeight} stroke="#fef7ed" strokeWidth="2" />
                    <text x={x} y={plotHeight + 15} fontSize="12" fill="#6b7280" textAnchor="middle" fontWeight="bold">
                      {temp}°C
                    </text>
                  </g>
                )
              })}

              {/* Enhanced temperature profile */}
              {tempProfilePoints.length > 1 && (
                <>
                  <polyline
                    points={tempProfilePoints.join(" ")}
                    fill="none"
                    stroke="url(#temperatureGradient)"
                    strokeWidth="8"
                    filter="url(#glow)"
                  />
                  <polyline points={tempProfilePoints.join(" ")} fill="none" stroke="#dc2626" strokeWidth="5" />
                </>
              )}

              {/* Enhanced data points */}
              {tempData.map((point, index) => {
                const x = temperatureToX(point.temperature!, plotWidth, temperatureRange.min, temperatureRange.max)
                const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
                if (x >= 0 && x <= plotWidth && y >= 0 && y <= plotHeight) {
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="10"
                        fill="url(#temperatureGradient)"
                        stroke="white"
                        strokeWidth="3"
                        filter="url(#shadow)"
                      />
                      <circle cx={x} cy={y} r="5" fill="#dc2626" />
                      <rect
                        x={x + 15}
                        y={y - 10}
                        width="70"
                        height="20"
                        fill="rgba(220, 38, 38, 0.95)"
                        rx="4"
                        filter="url(#shadow)"
                      />
                      <text x={x + 50} y={y + 4} fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">
                        {point.pressure}mb
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </g>

            {/* Axis titles */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t('charts.isotherms.title')}
            </text>
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 7. Enhanced Dew Point Profile Component
  const DewPointProfileChart = () => {
    const dewPointData = allLevels.filter((d) => d.dewpoint !== null)
    const dewPointProfilePoints: string[] = []

    dewPointData.forEach((point) => {
      const x = temperatureToX(point.dewpoint!, plotWidth, temperatureRange.min, temperatureRange.max)
      const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
      if (x >= 0 && x <= plotWidth && y >= 0 && y <= plotHeight) {
        dewPointProfilePoints.push(`${x},${y}`)
      }
    })

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.dewpointProfile.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.dewpointProfile.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#a7f3d0" strokeWidth="2" rx="12" />

              {/* Enhanced grid lines */}
              {[1000, 850, 700, 500, 300, 200, 100].map((pressure) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                return (
                  <g key={`pressure-grid-${pressure}`}>
                    <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#f0fdf4" strokeWidth="2" />
                    <text x={-5} y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end" fontWeight="bold">
                      {pressure}
                    </text>
                  </g>
                )
              })}

              {[-60, -40, -20, 0, 20, 40].map((temp) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                return (
                  <g key={`temp-grid-${temp}`}>
                    <line x1={x} y1={0} x2={x} y2={plotHeight} stroke="#f0fdf4" strokeWidth="2" />
                    <text x={x} y={plotHeight + 15} fontSize="12" fill="#6b7280" textAnchor="middle" fontWeight="bold">
                      {temp}°C
                    </text>
                  </g>
                )
              })}

              {/* Enhanced dew point profile */}
              {dewPointProfilePoints.length > 1 && (
                <>
                  <polyline
                    points={dewPointProfilePoints.join(" ")}
                    fill="none"
                    stroke="url(#dewpointGradient)"
                    strokeWidth="8"
                    filter="url(#glow)"
                  />
                  <polyline points={dewPointProfilePoints.join(" ")} fill="none" stroke="#10b981" strokeWidth="5" />
                </>
              )}

              {/* Enhanced data points */}
              {dewPointData.map((point, index) => {
                const x = temperatureToX(point.dewpoint!, plotWidth, temperatureRange.min, temperatureRange.max)
                const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
                if (x >= 0 && x <= plotWidth && y >= 0 && y <= plotHeight) {
                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="10"
                        fill="url(#dewpointGradient)"
                        stroke="white"
                        strokeWidth="3"
                        filter="url(#shadow)"
                      />
                      <circle cx={x} cy={y} r="5" fill="#10b981" />
                      <rect
                        x={x + 15}
                        y={y - 10}
                        width="70"
                        height="20"
                        fill="rgba(16, 185, 129, 0.95)"
                        rx="4"
                        filter="url(#shadow)"
                      />
                      <text x={x + 50} y={y + 4} fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">
                        {point.pressure}mb
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </g>

            {/* Axis titles */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t('charts.dewpointProfile.title')}
            </text>
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 8. Enhanced Wind Barbs Component
  const WindBarbsChart = () => {
    const windData = allLevels.filter((d) => d.windDirection !== null && d.windSpeed !== null)

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.windBarbs.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.windBarbs.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#c7d2fe" strokeWidth="2" rx="12" />

              {/* Enhanced pressure reference lines */}
              {[1000, 850, 700, 500, 300, 200, 100].map((pressure) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                return (
                  <g key={pressure}>
                    <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#e0e7ff" strokeWidth="2" />
                    <rect
                      x={-105}
                      y={y - 12}
                      width="95"
                      height="24"
                      fill="#4f46e5"
                      rx="4"
                      opacity="0.95"
                      filter="url(#shadow)"
                    />
                    <text x={-57.5} y={y + 5} fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">
                      {pressure} hPa
                    </text>
                  </g>
                )
              })}

              {/* Enhanced wind barbs */}
              {windData.map((point, index) => {
                const x = plotWidth / 2
                const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)

                if (y >= 0 && y <= plotHeight) {
                  return (
                    <g key={index}>
                      {drawWindBarb(x, y, point.windDirection!, point.windSpeed!)}
                      <rect
                        x={x + 60}
                        y={y - 10}
                        width="140"
                        height="20"
                        fill="rgba(79, 70, 229, 0.95)"
                        rx="4"
                        filter="url(#shadow)"
                      />
                      <text x={x + 130} y={y + 4} fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">
                        {point.pressure}mb - {point.windDirection}°/{point.windSpeed}kt
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </g>

            {/* Y-axis title */}
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 9. Enhanced Tropopause Layer Component
  const TropopauseChart = () => {
    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.tropopause.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.tropopause.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#fde68a" strokeWidth="2" rx="12" />

              {/* Enhanced grid lines */}
              {[1000, 850, 700, 500, 300, 200, 100].map((pressure) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                return (
                  <g key={`pressure-grid-${pressure}`}>
                    <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#fef3c7" strokeWidth="2" />
                    <text x={-5} y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end" fontWeight="bold">
                      {pressure}
                    </text>
                  </g>
                )
              })}

              {[-60, -40, -20, 0, 20, 40].map((temp) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                return (
                  <g key={`temp-grid-${temp}`}>
                    <line x1={x} y1={0} x2={x} y2={plotHeight} stroke="#fef3c7" strokeWidth="2" />
                    <text x={x} y={plotHeight + 15} fontSize="12" fill="#6b7280" textAnchor="middle" fontWeight="bold">
                      {temp}°C
                    </text>
                  </g>
                )
              })}

              {decodedData.tropopause && (
                <g>
                  <line
                    x1={0}
                    y1={pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    x2={plotWidth}
                    y2={pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    stroke="url(#tropopauseGradient)"
                    strokeWidth="10"
                    strokeDasharray="25,15"
                    filter="url(#glow)"
                  />
                  <text
                    x={plotWidth / 2}
                    y={
                      pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max) -
                      35
                    }
                    fontSize="20"
                    fill="#f59e0b"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    TROPOPAUSE BOUNDARY
                  </text>
                  <text
                    x={plotWidth / 2}
                    y={
                      pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max) -
                      10
                    }
                    fontSize="16"
                    fill="#d97706"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {decodedData.tropopause.pressure}mb - {decodedData.tropopause.temperature}°C
                  </text>
                  <circle
                    cx={temperatureToX(
                      decodedData.tropopause.temperature,
                      plotWidth,
                      temperatureRange.min,
                      temperatureRange.max,
                    )}
                    cy={pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    r="15"
                    fill="url(#tropopauseGradient)"
                    stroke="white"
                    strokeWidth="4"
                    filter="url(#shadow)"
                  />
                </g>
              )}

              {!decodedData.tropopause && (
                <g>
                  <rect
                    x={plotWidth / 2 - 200}
                    y={plotHeight / 2 - 40}
                    width="400"
                    height="80"
                    fill="rgba(251, 191, 36, 0.1)"
                    rx="12"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <text
                    x={plotWidth / 2}
                    y={plotHeight / 2 - 5}
                    fontSize="20"
                    fill="#92400e"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    No Tropopause Data Available
                  </text>
                  <text x={plotWidth / 2} y={plotHeight / 2 + 25} fontSize="16" fill="#a16207" textAnchor="middle">
                    88PtPtPt group not found in radiosonde data
                  </text>
                </g>
              )}
            </g>

            {/* Axis titles */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 20}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t('charts.isotherms.title')}
            </text>
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 10. Enhanced Maximum Wind Level Component
  const MaxWindChart = () => {
    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.maxWind.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.maxWind.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#fecdd3" strokeWidth="2" rx="12" />

              {/* Enhanced grid lines */}
              {[1000, 850, 700, 500, 300, 200, 100].map((pressure) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                return (
                  <g key={`pressure-grid-${pressure}`}>
                    <line x1={0} y1={y} x2={plotWidth} y2={y} stroke="#fef2f2" strokeWidth="2" />
                    <text x={-5} y={y + 4} fontSize="12" fill="#6b7280" textAnchor="end" fontWeight="bold">
                      {pressure}
                    </text>
                  </g>
                )
              })}

              {decodedData.maxWind && (
                <g>
                  <line
                    x1={0}
                    y1={pressureToY(decodedData.maxWind.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    x2={plotWidth}
                    y2={pressureToY(decodedData.maxWind.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    stroke="#dc2626"
                    strokeWidth="10"
                    strokeDasharray="20,12"
                    filter="url(#glow)"
                  />
                  <text
                    x={plotWidth / 2}
                    y={pressureToY(decodedData.maxWind.pressure, plotHeight, pressureRange.min, pressureRange.max) - 35}
                    fontSize="20"
                    fill="#dc2626"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    MAXIMUM WIND LEVEL
                  </text>
                  <text
                    x={plotWidth / 2}
                    y={pressureToY(decodedData.maxWind.pressure, plotHeight, pressureRange.min, pressureRange.max) - 10}
                    fontSize="16"
                    fill="#b91c1c"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {decodedData.maxWind.pressure}mb - {decodedData.maxWind.windDirection}°/
                    {decodedData.maxWind.windSpeed}kt
                  </text>
                  {drawWindBarb(
                    plotWidth / 2,
                    pressureToY(decodedData.maxWind.pressure, plotHeight, pressureRange.min, pressureRange.max),
                    decodedData.maxWind.windDirection,
                    decodedData.maxWind.windSpeed,
                  )}
                </g>
              )}

              {!decodedData.maxWind && (
                <g>
                  <rect
                    x={plotWidth / 2 - 200}
                    y={plotHeight / 2 - 40}
                    width="400"
                    height="80"
                    fill="rgba(220, 38, 38, 0.1)"
                    rx="12"
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <text
                    x={plotWidth / 2}
                    y={plotHeight / 2 - 5}
                    fontSize="20"
                    fill="#7f1d1d"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    No Maximum Wind Data Available
                  </text>
                  <text x={plotWidth / 2} y={plotHeight / 2 + 25} fontSize="16" fill="#991b1b" textAnchor="middle">
                    77PmPmPm group not found in radiosonde data
                  </text>
                </g>
              )}
            </g>

            {/* Y-axis title */}
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // 11. Enhanced Complete Tephigram
  const CompleteTephigram = () => {
    const tempData = allLevels.filter((d) => d.temperature !== null)
    const dewPointData = allLevels.filter((d) => d.dewpoint !== null)
    const windData = allLevels.filter((d) => d.windDirection !== null && d.windSpeed !== null)

    const tempProfilePoints: string[] = []
    const dewPointProfilePoints: string[] = []

    tempData.forEach((point) => {
      const x = temperatureToX(point.temperature!, plotWidth, temperatureRange.min, temperatureRange.max)
      const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
      if (x >= 0 && x <= plotWidth && y >= 0 && y <= plotHeight) {
        tempProfilePoints.push(`${x},${y}`)
      }
    })

    dewPointData.forEach((point) => {
      const x = temperatureToX(point.dewpoint!, plotWidth, temperatureRange.min, temperatureRange.max)
      const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
      if (x >= 0 && x <= plotWidth && y >= 0 && y <= plotHeight) {
        dewPointProfilePoints.push(`${x},${y}`)
      }
    })

    return (
      <div className="w-full">
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-slate-200">
          <svg width={svgWidth} height={svgHeight} className="min-w-full">
            <ProfessionalGradients />
            <rect width={svgWidth} height={svgHeight} fill="url(#backgroundGradient)" />

            {/* Title and description */}
            <text x={svgWidth / 2} y={35} textAnchor="middle" fontSize="24" fill="#1e293b" fontWeight="bold">
              {t('charts.complete.title')}
            </text>
            <text x={svgWidth / 2} y={60} textAnchor="middle" fontSize="16" fill="#64748b">
              {t('charts.complete.description')}
            </text>

            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <rect width={plotWidth} height={plotHeight} fill="white" stroke="#a855f7" strokeWidth="2" rx="12" />

              {/* Enhanced Isobars with alternating colors */}
              {[1000, 925, 850, 700, 500, 400, 300, 250, 200, 150, 100].map((pressure, index) => {
                const y = pressureToY(pressure, plotHeight, pressureRange.min, pressureRange.max)
                const isMainLevel = [1000, 850, 700, 500, 300, 200, 100].includes(pressure)
                return (
                  <g key={`isobar-${pressure}`}>
                    <line
                      x1={0}
                      y1={y}
                      x2={plotWidth}
                      y2={y}
                      stroke={isMainLevel ? "#475569" : "#94a3b8"}
                      strokeWidth={isMainLevel ? "2" : "1"}
                      strokeDasharray={isMainLevel ? "none" : "3,3"}
                    />
                    <rect
                      x={-105}
                      y={y - 12}
                      width="95"
                      height="24"
                      fill={isMainLevel ? "#475569" : "#94a3b8"}
                      rx="4"
                      opacity="0.95"
                      filter="url(#shadow)"
                    />
                    <text x={-57.5} y={y + 5} fontSize="11" fill="white" textAnchor="middle" fontWeight="bold">
                      {pressure}
                    </text>
                  </g>
                )
              })}

              {/* Enhanced Isotherms */}
              {[-60, -40, -20, 0, 20, 40].map((temp) => {
                const x = temperatureToX(temp, plotWidth, temperatureRange.min, temperatureRange.max)
                const color = temp === 0 ? "#dc2626" : temp < 0 ? "#3b82f6" : "#f59e0b"
                const isZero = temp === 0
                return (
                  <g key={`isotherm-${temp}`}>
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={plotHeight}
                      stroke={color}
                      strokeWidth={isZero ? "3" : "1.5"}
                      strokeDasharray={isZero ? "none" : "4,4"}
                      opacity="0.7"
                    />
                    <rect x={x - 18} y={plotHeight + 30} width="36" height="22" fill={color} rx="4" opacity="0.95" />
                    <text x={x} y={plotHeight + 44} fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">
                      {temp}°C
                    </text>
                  </g>
                )
              })}

              {/* Enhanced Temperature Profile with glow effect */}
              {tempProfilePoints.length > 1 && (
                <>
                  <polyline
                    points={tempProfilePoints.join(" ")}
                    fill="none"
                    stroke="url(#temperatureGradient)"
                    strokeWidth="8"
                    filter="url(#glow)"
                  />
                  <polyline points={tempProfilePoints.join(" ")} fill="none" stroke="#dc2626" strokeWidth="5" />
                </>
              )}

              {/* Enhanced Dew Point Profile */}
              {dewPointProfilePoints.length > 1 && (
                <>
                  <polyline
                    points={dewPointProfilePoints.join(" ")}
                    fill="none"
                    stroke="url(#dewpointGradient)"
                    strokeWidth="8"
                    filter="url(#glow)"
                  />
                  <polyline points={dewPointProfilePoints.join(" ")} fill="none" stroke="#10b981" strokeWidth="5" />
                </>
              )}

              {/* Enhanced data points */}
              {tempData.map((point, index) => {
                const x = temperatureToX(point.temperature!, plotWidth, temperatureRange.min, temperatureRange.max)
                const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
                if (x >= 0 && x <= plotWidth && y >= 0 && y <= plotHeight) {
                  return (
                    <g key={`temp-point-${index}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="url(#temperatureGradient)"
                        stroke="white"
                        strokeWidth="3"
                        filter="url(#shadow)"
                      />
                      <circle cx={x} cy={y} r="4" fill="#dc2626" />
                    </g>
                  )
                }
                return null
              })}

              {dewPointData.map((point, index) => {
                const x = temperatureToX(point.dewpoint!, plotWidth, temperatureRange.min, temperatureRange.max)
                const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
                if (x >= 0 && x <= plotWidth && y >= 0 && y <= plotHeight) {
                  return (
                    <g key={`dew-point-${index}`}>
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="url(#dewpointGradient)"
                        stroke="white"
                        strokeWidth="3"
                        filter="url(#shadow)"
                      />
                      <circle cx={x} cy={y} r="4" fill="#10b981" />
                    </g>
                  )
                }
                return null
              })}

              {/* Enhanced Tropopause */}
              {decodedData.tropopause && (
                <g>
                  <line
                    x1={0}
                    y1={pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    x2={plotWidth}
                    y2={pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    stroke="url(#tropopauseGradient)"
                    strokeWidth="8"
                    strokeDasharray="20,12"
                    filter="url(#glow)"
                  />
                  <circle
                    cx={temperatureToX(
                      decodedData.tropopause.temperature,
                      plotWidth,
                      temperatureRange.min,
                      temperatureRange.max,
                    )}
                    cy={pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    r="12"
                    fill="url(#tropopauseGradient)"
                    stroke="white"
                    strokeWidth="4"
                    filter="url(#shadow)"
                  />
                  <text
                    x={plotWidth / 2}
                    y={
                      pressureToY(decodedData.tropopause.pressure, plotHeight, pressureRange.min, pressureRange.max) -
                      25
                    }
                    fontSize="16"
                    fill="#f59e0b"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    TROPOPAUSE - {decodedData.tropopause.pressure}mb
                  </text>
                </g>
              )}

              {/* Enhanced Max Wind */}
              {decodedData.maxWind && (
                <g>
                  <line
                    x1={0}
                    y1={pressureToY(decodedData.maxWind.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    x2={plotWidth}
                    y2={pressureToY(decodedData.maxWind.pressure, plotHeight, pressureRange.min, pressureRange.max)}
                    stroke="#dc2626"
                    strokeWidth="6"
                    strokeDasharray="15,10"
                    filter="url(#glow)"
                  />
                  <text
                    x={plotWidth / 2}
                    y={pressureToY(decodedData.maxWind.pressure, plotHeight, pressureRange.min, pressureRange.max) - 20}
                    fontSize="14"
                    fill="#dc2626"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    MAX WIND - {decodedData.maxWind.pressure}mb - {decodedData.maxWind.windSpeed}kt
                  </text>
                </g>
              )}
            </g>

            {/* Enhanced Wind Barbs Panel */}
            <g transform={`translate(${margin.left + plotWidth + 40}, ${margin.top})`}>
              <rect
                x={-15}
                y={-15}
                width="180"
                height={plotHeight + 30}
                fill="rgba(255,255,255,0.95)"
                stroke="#e2e8f0"
                strokeWidth="2"
                rx="12"
                filter="url(#shadow)"
              />
              <text x={75} y={10} textAnchor="middle" fontSize="16" fill="#1e293b" fontWeight="bold">
                {t('charts.windBarbs.title')}
              </text>

              {windData.map((point, index) => {
                const y = pressureToY(point.pressure, plotHeight, pressureRange.min, pressureRange.max)
                if (y >= 0 && y <= plotHeight) {
                  return (
                    <g key={index}>
                      {drawWindBarb(35, y, point.windDirection!, point.windSpeed!)}
                      <rect x={80} y={y - 10} width="80" height="20" fill="#f1f5f9" rx="4" filter="url(#shadow)" />
                      <text x={120} y={y + 4} fontSize="10" fill="#334155" textAnchor="middle" fontWeight="bold">
                        {point.pressure}mb
                      </text>
                    </g>
                  )
                }
                return null
              })}
            </g>

            {/* Enhanced axis labels */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 25}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t('charts.isotherms.title')}
            </text>
            <text
              x={30}
              y={svgHeight / 2}
              textAnchor="middle"
              fontSize="18"
              fill="#1e293b"
              fontWeight="bold"
              transform={`rotate(-90 30 ${svgHeight / 2})`}
            >
              {t('charts.isobars.title')}
            </text>

            {/* Enhanced legend */}
            <g transform={`translate(${svgWidth - 200}, ${margin.top + 30})`}>
              <rect
                x={-15}
                y={-15}
                width="190"
                height="140"
                fill="rgba(255,255,255,0.98)"
                stroke="#e2e8f0"
                strokeWidth="2"
                rx="12"
                filter="url(#shadow)"
              />
              <text x={80} y={5} textAnchor="middle" fontSize="16" fill="#1e293b" fontWeight="bold">
                {t('charts.complete.legend')}
              </text>

              <line x1={15} y1={25} x2={40} y2={25} stroke="url(#temperatureGradient)" strokeWidth="5" />
              <text x={45} y={29} fontSize="13" fill="#1e293b" fontWeight="medium">
                {t('charts.complete.legend.temperature')}
              </text>

              <line x1={15} y1={50} x2={40} y2={50} stroke="url(#dewpointGradient)" strokeWidth="5" />
              <text x={45} y={54} fontSize="13" fill="#1e293b" fontWeight="medium">
                {t('charts.complete.legend.dewPoint')}
              </text>

              <line
                x1={15}
                y1={75}
                x2={40}
                y2={75}
                stroke="url(#tropopauseGradient)"
                strokeWidth="5"
                strokeDasharray="10,5"
              />
              <text x={45} y={79} fontSize="13" fill="#1e293b" fontWeight="medium">
                {t('charts.complete.legend.tropopause')}
              </text>

              <line x1={15} y1={100} x2={40} y2={100} stroke="#dc2626" strokeWidth="4" strokeDasharray="8,4" />
              <text x={45} y={104} fontSize="13" fill="#1e293b" fontWeight="medium">
                {t('charts.complete.legend.maxWind')}
              </text>
            </g>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <Card className="w-full shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-t-xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-4 text-3xl mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Thermometer className="w-6 h-6 text-white" />
                </div>
                {t('header.title')}
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                  {t('header.badges.station', { station: decodedData.station })}
                </Badge>
              </CardTitle>
              <CardDescription className="text-blue-100 text-xl">
                {t('header.description', { date: decodedData.date, time: String(decodedData.time).padStart(2, "0") })}
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Download className="w-5 h-5 mr-2" />
                {t('header.buttons.export')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <Badge
              variant="secondary"
              className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 text-sm px-3 py-2"
            >
              <Wind className="w-4 h-4 mr-2" />
              {t('header.badges.mandatoryLevels', { count: decodedData.mandatoryLevels.length })}
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-100 border-blue-400/30 text-sm px-3 py-2">
              <Droplets className="w-4 h-4 mr-2" />
              {t('header.badges.significantLevels', { count: decodedData.significantLevels.length })}
            </Badge>
            {decodedData.tropopause && (
              <Badge
                variant="secondary"
                className="bg-amber-500/20 text-amber-100 border-amber-400/30 text-sm px-3 py-2"
              >
                {t('header.badges.tropopause')}
              </Badge>
            )}
            {decodedData.maxWind && (
              <Badge variant="secondary" className="bg-red-500/20 text-red-100 border-red-400/30 text-sm px-3 py-2">
                {t('header.badges.maxWind')}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-10">
          <Tabs defaultValue="complete" className="w-full">
            <TabsList className="grid grid-cols-6 lg:grid-cols-11 mb-10 h-14 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl">
              <TabsTrigger
                value="isobars"
                className="text-sm font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.isobars')}
              </TabsTrigger>
              <TabsTrigger
                value="isotherms"
                className="text-sm font-semibold data-[state=active]:bg-red-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.isotherms')}
              </TabsTrigger>
              <TabsTrigger
                value="dry-adiabats"
                className="text-sm font-semibold data-[state=active]:bg-green-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.dryAdiabats')}
              </TabsTrigger>
              <TabsTrigger
                value="sat-adiabats"
                className="text-sm font-semibold data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.satAdiabats')}
              </TabsTrigger>
              <TabsTrigger
                value="hmr-lines"
                className="text-sm font-semibold data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.hmrLines')}
              </TabsTrigger>
              <TabsTrigger
                value="temp-profile"
                className="text-sm font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.tempProfile')}
              </TabsTrigger>
              <TabsTrigger
                value="dewpoint-profile"
                className="text-sm font-semibold data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.dewpointProfile')}
              </TabsTrigger>
              <TabsTrigger
                value="wind-barbs"
                className="text-sm font-semibold data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.windBarbs')}
              </TabsTrigger>
              <TabsTrigger
                value="tropopause"
                className="text-sm font-semibold data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.tropopause')}
              </TabsTrigger>
              <TabsTrigger
                value="max-wind"
                className="text-sm font-semibold data-[state=active]:bg-rose-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.maxWind')}
              </TabsTrigger>
              <TabsTrigger
                value="complete"
                className="text-sm font-semibold data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-lg"
              >
                {t('tabs.complete')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="isobars" className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-blue-900">{t('charts.isobars.title')}</h3>
                <p className="text-blue-700 leading-relaxed text-lg">
                  {t('charts.isobars.description')}
                </p>
              </div>
              <IsobarsChart />
            </TabsContent>

            <TabsContent value="isotherms" className="space-y-8">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 rounded-2xl border border-red-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-red-900">{t('charts.isotherms.title')}</h3>
                <p className="text-red-700 leading-relaxed text-lg">
                  {t('charts.isotherms.description')}
                </p>
              </div>
              <IsothermsChart />
            </TabsContent>

            <TabsContent value="dry-adiabats" className="space-y-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-green-900">
                  {t('charts.dryAdiabats.title')}
                </h3>
                <p className="text-green-700 leading-relaxed text-lg">
                  {t('charts.dryAdiabats.description')}
                </p>
              </div>
              <DryAdiabatsChart />
            </TabsContent>

            <TabsContent value="sat-adiabats" className="space-y-8">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-purple-900">{t('charts.satAdiabats.title')}</h3>
                <p className="text-purple-700 leading-relaxed text-lg">
                  {t('charts.satAdiabats.description')}
                </p>
              </div>
              <SaturatedAdiabatsChart />
            </TabsContent>

            <TabsContent value="hmr-lines" className="space-y-8">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-cyan-900">{t('charts.hmrLines.title')}</h3>
                <p className="text-cyan-700 leading-relaxed text-lg">
                  {t('charts.hmrLines.description')}
                </p>
              </div>
              <HmrLinesChart />
            </TabsContent>

            <TabsContent value="temp-profile" className="space-y-8">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-orange-900">
                  {t('charts.tempProfile.title')}
                </h3>
                <p className="text-orange-700 leading-relaxed text-lg">
                  {t('charts.tempProfile.description')}
                </p>
              </div>
              <EnvironmentalLapseRateChart />
            </TabsContent>

            <TabsContent value="dewpoint-profile" className="space-y-8">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-8 rounded-2xl border border-emerald-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-emerald-900">{t('charts.dewpointProfile.title')}</h3>
                <p className="text-emerald-700 leading-relaxed text-lg">
                  {t('charts.dewpointProfile.description')}
                </p>
              </div>
              <DewPointProfileChart />
            </TabsContent>

            <TabsContent value="wind-barbs" className="space-y-8">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-2xl border border-indigo-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-indigo-900">{t('charts.windBarbs.title')}</h3>
                <p className="text-indigo-700 leading-relaxed text-lg">
                  {t('charts.windBarbs.description')}
                </p>
              </div>
              <WindBarbsChart />
            </TabsContent>

            <TabsContent value="tropopause" className="space-y-8">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-8 rounded-2xl border border-amber-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-amber-900">{t('charts.tropopause.title')}</h3>
                <p className="text-amber-700 leading-relaxed text-lg">
                  {t('charts.tropopause.description')}
                </p>
              </div>
              <TropopauseChart />
            </TabsContent>

            <TabsContent value="max-wind" className="space-y-8">
              <div className="bg-gradient-to-r from-rose-50 to-red-50 p-8 rounded-2xl border border-rose-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-rose-900">{t('charts.maxWind.title')}</h3>
                <p className="text-rose-700 leading-relaxed text-lg">
                  {t('charts.maxWind.description')}
                </p>
              </div>
              <MaxWindChart />
            </TabsContent>

            <TabsContent value="complete" className="space-y-8">
              <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 p-8 rounded-2xl border border-purple-200 shadow-sm">
                <h3 className="text-3xl font-bold mb-4 text-purple-900">{t('charts.complete.title')}</h3>
                <p className="text-purple-700 leading-relaxed text-lg mb-6">
                  {t('charts.complete.description')}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl shadow-sm">
                    <div className="w-6 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                    <span className="font-semibold text-gray-700">{t('charts.complete.legend.temperature')}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl shadow-sm">
                    <div className="w-6 h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                    <span className="font-semibold text-gray-700">{t('charts.complete.legend.dewPoint')}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl shadow-sm">
                    <div className="w-6 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                    <span className="font-semibold text-gray-700">{t('charts.complete.legend.tropopause')}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl shadow-sm">
                    <div className="w-6 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                    <span className="font-semibold text-gray-700">{t('charts.complete.legend.maxWind')}</span>
                  </div>
                </div>
              </div>
              <CompleteTephigram />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default Tephigram