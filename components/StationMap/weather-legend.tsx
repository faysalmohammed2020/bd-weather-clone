import { Cloud, Droplets, Thermometer, ThermometerSnowflake, Wind } from "lucide-react"

export default function WeatherLegend() {
  return (
    <div className="absolute bottom-20 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
      <div className="text-sm font-medium mb-2">Weather Legend</div>
      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <div className="flex items-center">
            <Thermometer className="h-4 w-4 mr-1 text-red-500" />
            <span className="text-xs">High Temperature (&gt;30°C)</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <div className="flex items-center">
            <ThermometerSnowflake className="h-4 w-4 mr-1 text-blue-500" />
            <span className="text-xs">Low Temperature (&lt;15°C)</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
          <div className="flex items-center">
            <Droplets className="h-4 w-4 mr-1 text-blue-600" />
            <span className="text-xs">Precipitation (larger circle = more rain)</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <div className="flex items-center">
            <Wind className="h-4 w-4 mr-1 text-yellow-500" />
            <span className="text-xs">High Wind (&gt;20 km/h)</span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
          <div className="flex items-center">
            <Cloud className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-xs">Default (no extreme conditions)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
