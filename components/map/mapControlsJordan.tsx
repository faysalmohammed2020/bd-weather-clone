"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "@/lib/auth-client"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { MapPin, Building2 } from "lucide-react"

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

interface District {
  id: string
  name: string
  name_en: string
  admin_level: number
}

export default function MapControlsJordan({
  selectedStation,
  setSelectedStation,
  onDistrictSelect,
}: {
  selectedStation: Station | null
  setSelectedStation: (station: Station | null) => void
  onDistrictSelect?: (district: District | null) => void
}) {
  const t = useTranslations("dashboard.mapControls")
  const { data: session } = useSession()
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)

  // Jordan districts data
  const jordanDistricts: District[] = [
    { id: "amman", name: "عمان", name_en: "Amman", admin_level: 6 },
    { id: "irbid", name: "إربد", name_en: "Irbid", admin_level: 6 },
    { id: "zarqa", name: "الزرقاء", name_en: "Zarqa", admin_level: 6 },
    { id: "balqa", name: "البلقاء", name_en: "Balqa", admin_level: 6 },
    { id: "madaba", name: "مادبا", name_en: "Madaba", admin_level: 6 },
    { id: "karak", name: "الكرك", name_en: "Karak", admin_level: 6 },
    { id: "tafilah", name: "الطفيلة", name_en: "Tafilah", admin_level: 6 },
    { id: "maan", name: "معان", name_en: "Ma'an", admin_level: 6 },
    { id: "aqaba", name: "العقبة", name_en: "Aqaba", admin_level: 6 },
    { id: "ajloun", name: "عجلون", name_en: "Ajloun", admin_level: 6 },
    { id: "jerash", name: "جرش", name_en: "Jerash", admin_level: 6 },
    { id: "mafraq", name: "المفرق", name_en: "Mafraq", admin_level: 6 },
  ]

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/stationlocation")
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data = await response.json()
        setStations(data)

        if (session?.user?.role === "station_admin" || session?.user?.role === "observer") {
          const userStation = data.find((station: Station) => station.stationId === session?.user?.station?.stationId)
          if (userStation) {
            setSelectedStation(userStation)
          }
        }
      } catch (err) {
        setError("fetch")
        console.error("Error fetching stations:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStations()
  }, [session, setSelectedStation])

  const permittedStations =
    session?.user.role === "super_admin"
      ? stations
      : stations.filter((station) => station.stationId === session?.user?.station?.stationId)

  const handleDistrictChange = (districtId: string) => {
    const district = jordanDistricts.find((d) => d.id === districtId) || null
    setSelectedDistrict(district)
    onDistrictSelect?.(district)
  }

  const clearSelections = () => {
    setSelectedStation(null)
    setSelectedDistrict(null)
    onDistrictSelect?.(null)
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium bg-blue-400 text-white py-2 px-4 mb-4 rounded">Jordan Weather Map Controls</h3>

      {/* District Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Select District (Admin Level 6)
        </label>
        <Select value={selectedDistrict?.id || ""} onValueChange={handleDistrictChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a district to view..." />
          </SelectTrigger>
          <SelectContent>
            {jordanDistricts.map((district) => (
              <SelectItem key={district.id} value={district.id}>
                {district.name_en} ({district.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Station Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {t("stationsLabel")}
        </label>

        <Select
          value={selectedStation?.stationId || ""}
          onValueChange={(value) => {
            const station = stations.find((s) => s.stationId === value)
            setSelectedStation(station || null)
          }}
          disabled={loading || permittedStations.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                loading ? t("loading") : permittedStations.length === 0 ? t("noStations") : t("selectStation")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {permittedStations.map((station) => (
              <SelectItem key={station.id} value={station.stationId}>
                {station.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Selections Button */}
      <Button
        variant="outline"
        onClick={clearSelections}
        className="w-full bg-transparent"
        disabled={!selectedStation && !selectedDistrict}
      >
        Clear All Selections
      </Button>

      {/* Selection Summary */}
      {(selectedStation || selectedDistrict) && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Current Selection:</h4>
          {selectedDistrict && (
            <div className="text-xs text-gray-600 mb-1">
              <Building2 className="h-3 w-3 inline mr-1" />
              District: {selectedDistrict.name_en} ({selectedDistrict.name})
            </div>
          )}
          {selectedStation && (
            <div className="text-xs text-gray-600">
              <MapPin className="h-3 w-3 inline mr-1" />
              Station: {selectedStation.name} (ID: {selectedStation.stationId})
            </div>
          )}
        </div>
      )}

      {error && <div className="mt-4 text-red-600 text-sm">{t("error", { error })}</div>}

      {/* Instructions */}
      <div className="bg-blue-50 p-3 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Instructions:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Select a weather station to view its district polygon</li>
          <li>• District boundaries are shown at Admin Level 6</li>
          <li>• Use weather parameter buttons to change visualization</li>
          <li>• Polygon colors indicate weather conditions</li>
        </ul>
      </div>
    </div>
  )
}
