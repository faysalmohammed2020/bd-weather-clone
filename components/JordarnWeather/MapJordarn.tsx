"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, Minus } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { getAllStations, type WeatherStationData } from "./weather-data";

export type ParameterId =
  | "temperature"
  | "wind"
  | "humidity"
  | "pressure"
  | "dewpoint"
  | "solar";

export type EnabledMap = Record<ParameterId, boolean>;

export interface MapComponentProps {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  enabled: EnabledMap; // <-- which layers to show
}

/** Small utility: dew point approximation (Magnus-Tetens) */
function dewPointFromTempRH(tempC: number, rh: number): number {
  // constants for water over liquid range
  const a = 17.27;
  const b = 237.7; // °C
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
  const dp = (b * alpha) / (a - alpha);
  return Math.round(dp * 10) / 10;
}

function FixLeafletIcons() {
  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/station-icon.png",
      iconUrl: "/station-icon.png",
      shadowUrl: "/station-icon.png",
    });
  }, []);
  return null;
}

/**
 * Creates a DivIcon with gradient colored values based on parameter type.
 */
function createParamIcon(
  station: WeatherStationData,
  param: ParameterId,
  value: string | null,
) {
  const display = value ?? "N/A";
  
  // Define color gradients for different parameter types
  const gradientMap: Record<ParameterId, string> = {
    temperature: "linear-gradient(45deg,#ef4444,#f59e0b,#fbbf24)",
    humidity: "linear-gradient(45deg,#06b6d4,#0ea5e9,#3b82f6)",
    wind: "linear-gradient(45deg,#10b981,#059669,#047857)",
    pressure: "linear-gradient(45deg,#a78bfa,#8b5cf6,#7c3aed)",
    dewpoint: "linear-gradient(45deg,#22c55e,#16a34a,#15803d)",
    solar: "linear-gradient(45deg,#f59e0b,#f97316,#ea580c)",
  };

  // Special case for wind: show speed + direction arrow
  if (param === "wind") {
    const rotation = ((station.windDirDeg ?? 0) + 180) % 360; // Convert from-direction to to-direction
    const html = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        background: transparent;
        border: none;
        padding: 0;
        margin: 0;
        line-height: 1;
      ">
        <span style="
          background: ${gradientMap.wind};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          font-weight: 900;
          font-size: 18px;
        ">
          ${display}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" 
             style="transform: rotate(${rotation}deg); opacity: 0.85;">
          <!-- up-pointing triangle; rotation handles direction -->
          <path d="M12 4 L20 20 H4 Z" fill="#6b7280"/>
        </svg>
      </div>
    `;
    return L.divIcon({ html, className: "param-div-icon", iconSize: [0, 0] });
  }

  // Default case for other parameters
  const html = `
    <div style="
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      line-height: 1;
    ">
      <span style="
        background: ${gradientMap[param] || 'linear-gradient(45deg, #4b5563, #6b7280)'};
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
      ">
        ${display}
      </span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "param-div-icon",
    iconSize: [0, 0], // size controlled by content
  });
}

export default function MapComponent({
  currentDate,
  setCurrentDate,
  isPlaying,
  setIsPlaying,
  enabled,
}: MapComponentProps) {
  const { data: session } = useSession();
  const t = useTranslations("dashboard.mapComponent");

  // Lazy-load react-leaflet only on the client
  const [leaflet, setLeaflet] = useState<null | {
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    useMap: any;
  }>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof window === "undefined") return;
      const rl = await import("react-leaflet");
      if (mounted) {
        setLeaflet({
          MapContainer: rl.MapContainer,
          TileLayer: rl.TileLayer,
          Marker: rl.Marker,
          useMap: rl.useMap,
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Custom Zoom Control uses useMap from the lazy import
  const CustomZoomControl = useMemo(() => {
    if (!leaflet) return () => null;
    const { useMap } = leaflet;
    return function ZoomCtrl() {
      const map = useMap();
      return (
        <div className="absolute top-2 left-2 z-[10] flex flex-col gap-1">
          <Button size="icon" variant="secondary" onClick={() => map.zoomIn()} className="h-8 w-8 bg-white">
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" onClick={() => map.zoomOut()} className="h-8 w-8 bg-white">
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      );
    };
  }, [leaflet]);

  const generateDates = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString("en-US", { day: "numeric", month: "short" }));
    }
    return dates;
  };

  const dates = useMemo(generateDates, []);
  const currentIndex = Math.max(0, dates.indexOf(currentDate));
  const stations = useMemo(() => getAllStations().filter(s => s.coordinates), []);

  const roleLabel =
    session?.user?.role === "super_admin"
      ? t("role.superAdmin")
      : session?.user?.role === "station_admin"
      ? t("role.stationAdmin")
      : session?.user?.role === "observer"
      ? t("role.observer")
      : t("role.guest");

  const roleDesc =
    session?.user?.role === "super_admin"
      ? t("roleDescription.superAdmin")
      : session?.user?.role === "station_admin" || session?.user?.role === "observer"
      ? t("roleDescription.stationAdmin")
      : t("roleDescription.guest");

  // Skeleton while react-leaflet loads
  if (!leaflet) {
    return (
      <div className="relative h-[calc(100vh-100px)] w-full z-10">
        <div className="h-[calc(100vh-100px)] w-full rounded-lg border-2 border-gray-200 overflow-hidden">
          <div className="h-full w-full animate-pulse bg-muted" />
        </div>
        <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
          <div className="flex items-center gap-3">
            <Button size="icon" variant={isPlaying ? "default" : "outline"} className="h-9 w-9" disabled />
            <div className="flex-1 mx-2 h-2 rounded bg-gray-200" />
            <div className="w-20 text-center font-medium text-sm bg-gray-100 py-1 px-2 rounded">
              {currentDate}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
          <div className="text-sm font-medium">{roleLabel}</div>
          <div className="text-xs text-gray-500">{roleDesc}</div>
        </div>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker } = leaflet;

  // Compute values per-parameter for each station
  const valueForParam = (s: WeatherStationData, p: ParameterId): string | null => {
    switch (p) {
      case "temperature":
        return s.maxTemp != null ? String(s.maxTemp) : s.minTemp != null ? String(s.minTemp) : null;
      case "humidity":
        return s.relativeHumidity != null ? String(s.relativeHumidity) : null;
      case "dewpoint":
        if (s.maxTemp != null && s.relativeHumidity != null && s.relativeHumidity > 0) {
          return String(dewPointFromTempRH(s.maxTemp, s.relativeHumidity));
        }
        return null;
      case "wind":
        return s.windSpeedKph != null ? String(Math.round(s.windSpeedKph)) : null;
      case "pressure":
      case "solar":
        return null;
      default:
        return null;
    }
  };

  const activeParams = (Object.keys(enabled) as ParameterId[]).filter((k) => enabled[k]);

  return (
    <div className="relative h-[calc(100vh-50px)] w-full z-10">
      {/* Map */}
      <div className="relative h-[calc(100vh-50px)] w-full rounded-lg overflow-hidden border-2 border-gray-200">
        <MapContainer
          center={[31.24, 36.51]} // Amman, Jordan
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          minZoom={6}
          maxBounds={[
            [29.0, 34.8],
            [33.5, 39.3],
          ]}
        >
          <FixLeafletIcons />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CustomZoomControl />

          {/* For each enabled param, render a layer of markers */}
          {activeParams.map((paramKey) =>
            stations.map((s) => {
              const coords = s.coordinates!;
              const val = valueForParam(s, paramKey);
              const icon = createParamIcon(s, paramKey, val);
              return <Marker key={`${paramKey}-${s.stationId}`} position={[coords.lat, coords.lng]} icon={icon} />;
            }),
          )}
        </MapContainer>
      </div>

      {/* Timeline */}
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
            value={[currentIndex]}
            max={dates.length - 1}
            step={1}
            onValueChange={(value) => setCurrentDate(dates[value[0]])}
            className="flex-1 mx-2"
          />

          <div className="w-20 text-center font-medium text-sm bg-gray-100 py-1 px-2 rounded">
            {currentDate}
          </div>
        </div>
      </div>

      {/* Role pill */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
        <div className="text-sm font-medium">{roleLabel}</div>
        <div className="text-xs text-gray-500">{roleDesc}</div>
      </div>

      {/* Global tweaks */}
      <style jsx global>{`
        .param-div-icon {
          /* allow clicks to pass through if needed */
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
