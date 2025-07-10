"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

interface Station {
  id: string;
  stationId: string;
  name: string;
  latitude: number;
  longitude: number;
  securityCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function MapControls({
  setSelectedRegion,
  selectedStation,
  setSelectedStation,
}: {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedIndex: string;
  setSelectedIndex: (index: string) => void;
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
}) {
  const t = useTranslations("dashboard.mapControls");
  const { data: session } = useSession();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/stationlocation");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setStations(data);

        if (
          session?.user?.role === "station_admin" ||
          session?.user?.role === "observer"
        ) {
          const userStation = data.find(
            (station: Station) =>
              station.stationId === session?.user?.station?.stationId
          );
          if (userStation) {
            setSelectedStation(userStation);
            setSelectedRegion("station");
          }
        }
      } catch (err) {
        setError("fetch");
        console.error("Error fetching stations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [session, setSelectedStation, setSelectedRegion]);

  const permittedStations =
    session?.user.role === "super_admin"
      ? stations
      : stations.filter(
          (station) =>
            station.stationId === session?.user?.station?.stationId
        );

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium bg-gradient-to-r from-teal-600 to-teal-800 text-white py-2 px-4 mb-4 rounded">
        {t("title")}
      </h3>

      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {t("stationsLabel")}
      </label>

      <Select
        value={selectedStation?.stationId || ""}
        onValueChange={(value) => {
          const station = stations.find((s) => s.stationId === value);
          setSelectedStation(station || null);
        }}
        disabled={loading || permittedStations.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              loading
                ? t("loading")
                : permittedStations.length === 0
                ? t("noStations")
                : t("selectStation")
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

      {error && (
        <div className="mt-4 text-red-600 text-sm">
          {t("error", { error })}
        </div>
      )}
    </div>
  );
}
