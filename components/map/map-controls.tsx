"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSession } from "@/lib/auth-client"

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

export default function MapControls({
  selectedRegion,
  setSelectedRegion,
  selectedPeriod,
  setSelectedPeriod,
  selectedIndex,
  setSelectedIndex,
  selectedStation,
  setSelectedStation,
}: {
  selectedRegion: string
  setSelectedRegion: (region: string) => void
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
  selectedIndex: string
  setSelectedIndex: (index: string) => void
  selectedStation: Station | null
  setSelectedStation: (station: Station | null) => void
}) {
  const { data: session } = useSession()
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/stationlocation")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: Station[] = await res.json()
        setStations(data)

        // Auto-select for station_admin or observer
        const role = session?.user?.role
        const userStationId = session?.user?.station?.stationId

        if ((role === "station_admin" || role === "observer") && userStationId) {
          const found = data.find((s) => s.stationId === userStationId)
          if (found) {
            setSelectedStation(found)
            setSelectedRegion("station")
          }
        }
      } catch (err) {
        console.error("Error fetching stations:", err)
        setError("Failed to load stations.")
      } finally {
        setLoading(false)
      }
    }

    fetchStations()
  }, [session, setSelectedRegion, setSelectedStation])

  const permittedStations =
    session?.user?.role === "super_admin"
      ? stations
      : stations.filter((s) => s.stationId === session?.user?.station?.stationId)

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium bg-blue-400 text-white py-2 px-4 mb-4 rounded">
        Map Controls
      </h3>

      <Label className="block text-sm font-medium text-gray-700 mb-1.5">Stations</Label>
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
              loading
                ? "Loading..."
                : permittedStations.length === 0
                ? "No stations"
                : "Select Station"
            }
          />
        </SelectTrigger>
        <SelectContent>
          {permittedStations.map((station) => (
            <SelectItem key={station.id} value={station.stationId}>
              {station.name} ({station.stationId})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  )
}
