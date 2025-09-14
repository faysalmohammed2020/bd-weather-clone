"use client";

import { useState, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { getAllStations, type WeatherStationData } from "./weather-data";
import { Roboto_Mono } from "next/font/google";

export type ParameterId =
  | "temperature"
  | "wind"
  | "humidity"
  | "pressure"
  | "dewpoint"
  | "solarRadiation";

export type EnabledMap = Record<ParameterId, boolean>;

export interface MapComponentProps {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  enabled: EnabledMap; // which layers to show
}

/** Small utility: dew point approximation (Magnus-Tetens) */
function dewPointFromTempRH(tempC: number, rh: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(rh / 100);
  const dp = (b * alpha) / (a - alpha);
  return Math.round(dp * 10) / 10;
}

/** Deterministic “twitch” so values change over time without re-randomizing */
function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededUnit(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function fluctuationDelta(index: number, stationId: string, param: ParameterId): number {
  const pattern = [1, 2, -3, 0];
  const base = pattern[index % pattern.length];
  const seed = hashString(`${stationId}-${param}-${index}`);
  const u = seededUnit(seed);
  const factor = u > 0.85 ? 2 : 1;
  return base * factor;
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

// Numeric font for all values
const robotoMono = Roboto_Mono({ subsets: ["latin"], weight: ["400", "700"], display: "swap" });

/* === NEW: a small base “dot” icon for stations when no parameter is active === */
function createBaseStationIcon() {
  const html = `
    <div style="
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #60a5fa, #1d4ed8);
      border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 0 8px rgba(29,78,216,0.6);
    "></div>
  `;
  return L.divIcon({
    html,
    className: "base-station-icon",
    iconSize: [10, 10],
  });
}

/** Value marker icons with gradients (kept from your code; now hoverable) */
function createParamIcon(
  station: WeatherStationData,
  param: ParameterId,
  value: string | null,
  overrideDirectionDeg?: number | null,
) {
  const display = value ?? "N/A";

  const gradientMap: Record<ParameterId, string> = {
    temperature: "linear-gradient(45deg,#ef4444,#f59e0b,#fbbf24)",
    humidity: "linear-gradient(45deg,#06b6d4,#0ea5e9,#3b82f6)",
    wind: "linear-gradient(45deg,#10b981,#059669,#047857)",
    pressure: "linear-gradient(45deg,#a78bfa,#8b5cf6,#7c3aed)",
    dewpoint: "linear-gradient(45deg,#22c55e,#16a34a,#15803d)",
    solarRadiation: "linear-gradient(45deg,#f59e0b,#f97316,#ea580c)",
  };

  if (param === "wind") {
    const base = station.windDirDeg ?? 0;
    const dir = overrideDirectionDeg != null ? overrideDirectionDeg : base;
    const rotation = (dir + 180) % 360; // from-direction -> to-direction
    const html = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;background:transparent;border:none;padding:0;margin:0;line-height:1;">
        <span class="${robotoMono.className}" style="
          background:${gradientMap.wind};
          -webkit-background-clip:text;background-clip:text;
          -webkit-text-fill-color:transparent;color:transparent;
          font-weight:900;font-size:18px;
        ">${display}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" style="transform:rotate(${rotation}deg);opacity:.9;">
          <path d="M12 4 L20 20 H4 Z" fill="#6b7280"/>
        </svg>
      </div>
    `;
    return L.divIcon({ html, className: "param-div-icon", iconSize: [24, 24] });
  }

  const html = `
    <div style="display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;padding:0;margin:0;font-size:18px;font-weight:900;line-height:1;">
      <span class="${robotoMono.className}" style="
        background:${gradientMap[param]};
        -webkit-background-clip:text;background-clip:text;
        -webkit-text-fill-color:transparent;color:transparent;
      ">${display}</span>
    </div>
  `;
  return L.divIcon({ html, className: "param-div-icon", iconSize: [24, 24] });
}

// Compute wind direction that also changes along the timeline
function dynamicWindDirectionDeg(index: number, stationId: string, baseDir: number | null | undefined) {
  const base = baseDir ?? 0;
  // Use the same fluctuation pattern but scale to degrees
  const step = fluctuationDelta(index, stationId, "wind"); // -3,0,1,2 mostly
  const amplified = step * 12; // 12° per step for noticeable but smooth change
  let dir = (base + amplified) % 360;
  if (dir < 0) dir += 360;
  return dir;
}

/* === NEW: units for tooltip readout === */
const paramUnits: Record<ParameterId, string> = {
  temperature: "°C",
  humidity: "%",
  wind: "km/h",
  pressure: "hPa",
  dewpoint: "°C",
  solarRadiation: "W/m²",
};

export default function MapComponent({
  currentDate,
  setCurrentDate,
  isPlaying,
  setIsPlaying,
  enabled,
}: MapComponentProps) {
  const { data: session } = useSession();
  const t = useTranslations("dashboard.mapComponent");

  /* ---------- LAZY IMPORT: add Tooltip here ---------- */
  const [leaflet, setLeaflet] = useState<null | {
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Tooltip: any;        // 👈 NEW
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
          Tooltip: rl.Tooltip,     // 👈 NEW
          useMap: rl.useMap,
        });
      }
    })();
    return () => { mounted = false; };
  }, []);

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
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = playbackSpeed === 2 ? 600 : 1200;
    const timer = setInterval(() => {
      const next = (currentIndex + 1) % dates.length;
      setCurrentDate(dates[next]);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, currentIndex, dates, setCurrentDate]);

  const goPrev = () => {
    const prev = (currentIndex - 1 + dates.length) % dates.length;
    setCurrentDate(dates[prev]);
  };
  const goNext = () => {
    const next = (currentIndex + 1) % dates.length;
    setCurrentDate(dates[next]);
  };

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

  const { MapContainer, TileLayer, Marker, Tooltip } = leaflet;

  // Value per parameter per station (same logic; used for marker label + tooltip)
  const valueForParam = (s: WeatherStationData, p: ParameterId): string | null => {
    const delta = fluctuationDelta(currentIndex, s.stationId, p);
    switch (p) {
      case "temperature": {
        const base = s.maxTemp ?? s.minTemp ?? null;
        if (base == null) return null;
        const adjusted = base + delta;
        return String(Math.round(adjusted * 10) / 10);
      }
      case "humidity": {
        if (s.relativeHumidity == null) return null;
        const adjusted = Math.min(100, Math.max(0, s.relativeHumidity + delta));
        return String(Math.round(adjusted));
      }
      case "dewpoint": {
        if (s.maxTemp != null && s.relativeHumidity != null && s.relativeHumidity > 0) {
          const dp = dewPointFromTempRH(s.maxTemp, s.relativeHumidity);
          const adjusted = dp + delta * 0.3;
          return String(Math.round(adjusted * 10) / 10);
        }
        return null;
      }
      case "wind": {
        if (s.windSpeedKph == null) return null;
        const adjusted = Math.max(0, s.windSpeedKph + delta);
        return String(Math.round(adjusted));
      }
      case "pressure": {
        if (s.pressure == null) return null;
        const adjusted = Math.max(800, Math.min(1100, s.pressure + delta * 0.5));
        return String(Math.round(adjusted));
      }
      case "solarRadiation": {
        if (s.solarRadiation == null) return null;
        const adjusted = Math.max(0, s.solarRadiation + delta * 5);
        return String(Math.round(adjusted));
      }
      default:
        return null;
    }
  };

  const activeParams = (Object.keys(enabled) as ParameterId[]).filter((k) => enabled[k]);
  const anyParamActive = activeParams.length > 0;

  /* === NEW: Tooltip renderer (station details). Keep it simple & compact. === */
  const StationTooltip = ({ s, param }: { s: WeatherStationData; param?: ParameterId }) => {
    const v = param ? valueForParam(s, param) : null;
    const unit = param ? ` ${paramUnits[param]}` : "";

    return (
      <div style={{ fontSize: 12, lineHeight: 1.2 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.stationName}</div>
        {param && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ opacity: 0.7, marginRight: 4 }}>{param}</span>
            <strong className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>{v ?? "—"}{v ? unit : ""}</strong>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "2px 8px" }}>
          <span>Max / Min</span><span className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>{s.maxTemp ?? "—"}°C / {s.minTemp ?? "—"}°C</span>
          <span>RH</span><span className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>{s.relativeHumidity ?? "—"}%</span>
          <span>Precip</span><span className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>{s.precipitation} mm</span>
          <span>Snow</span><span className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>{s.snowDepth} cm</span>
          <span>Wind</span><span className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>{s.windSpeedKph ?? "—"} km/h {`@ ${dynamicWindDirectionDeg(currentIndex, s.stationId, s.windDirDeg)}°`}</span>
          <span>Pressure</span><span className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>{s.pressure ?? "—"} hPa</span>
          <span>Solar</span><span className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>{s.solarRadiation ?? "—"} W/m²</span>
          <span>Coords</span>
          <span className={robotoMono.className} style={{ fontVariantNumeric: "tabular-nums" }}>
            {s.coordinates ? `${s.coordinates.lat.toFixed(3)}, ${s.coordinates.lng.toFixed(3)}` : "—"}
          </span>
        </div>
      </div>
    );
  };

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

          {/* === NEW: Base station markers (only when NO parameter is active) === */}
          {!anyParamActive &&
            stations.map((s) => {
              const coords = s.coordinates!;
              const icon = createBaseStationIcon();
              return (
                <Marker
                  key={`base-${s.stationId}`}
                  position={[coords.lat, coords.lng]}
                  icon={icon}
                  // interactive marker so the tooltip opens on hover
                  interactive={true}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={1} sticky>
                    <StationTooltip s={s} />
                  </Tooltip>
                </Marker>
              );
            })}

          {/* Parameter markers (only for active parameter), hide base layer to avoid clutter */}
          {anyParamActive &&
            activeParams.map((paramKey) =>
              stations.map((s) => {
                const coords = s.coordinates!;
                const val = valueForParam(s, paramKey);
                const dir = paramKey === "wind" ? dynamicWindDirectionDeg(currentIndex, s.stationId, s.windDirDeg) : null;
                const icon = createParamIcon(s, paramKey, val, dir ?? undefined);
                return (
                  <Marker
                    key={`${paramKey}-${s.stationId}`}
                    position={[coords.lat, coords.lng]}
                    icon={icon}
                    interactive={true}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={1} sticky>
                      <StationTooltip s={s} param={paramKey} />
                    </Tooltip>
                  </Marker>
                );
              }),
            )}
        </MapContainer>
      </div>

      {/* Timeline */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="mx-auto max-w-4xl rounded-2xl bg-blue-900/70 text-blue-50 shadow-2xl ring-1 ring-blue-400/20 backdrop-blur p-3">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setIsPlaying(!isPlaying)}
              className={
                "h-8 w-8 rounded-lg border transition " +
                (isPlaying
                  ? "bg-blue-600/90 hover:bg-blue-500/90 text-white border-blue-300/20"
                  : "bg-blue-950/40 hover:bg-blue-900/50 text-blue-100 border-blue-400/30")
              }
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              size="icon"
              variant="secondary"
              onClick={goPrev}
              className="h-8 w-8 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-100 border border-blue-400/30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={goNext}
              className="h-8 w-8 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-100 border border-blue-400/30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-950/40 text-[11px] ring-1 ring-blue-400/20">
              <span className="opacity-80">Speed</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPlaybackSpeed(1)}
                className={
                  "h-7 px-2 rounded-md border transition " +
                  (playbackSpeed === 1
                    ? "bg-blue-600/90 hover:bg-blue-500/90 text-white border-blue-300/20"
                    : "bg-blue-900/40 hover:bg-blue-800/50 text-blue-100 border-blue-400/30")
                }
              >
                1x
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPlaybackSpeed(2)}
                className={
                  "h-7 px-2 rounded-md border transition " +
                  (playbackSpeed === 2
                    ? "bg-blue-600/90 hover:bg-blue-500/90 text-white border-blue-300/20"
                    : "bg-blue-900/40 hover:bg-blue-800/50 text-blue-100 border-blue-400/30")
                }
              >
                2x
              </Button>
            </div>

            <div className="flex-1 mx-2">
              <div className="h-3 rounded-full bg-blue-300/20 ring-1 ring-blue-400/30 flex items-center px-2">
                <Slider
                  value={[currentIndex]}
                  max={dates.length - 1}
                  step={1}
                  onValueChange={(value) => setCurrentDate(dates[value[0]])}
                  className="w-full"
                />
              </div>
            </div>

            <div className="min-w-28 text-center font-medium text-xs bg-blue-950/40 ring-1 ring-blue-400/20 py-1 px-2 rounded-lg text-blue-100">
              {currentDate}
            </div>
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
        /* IMPORTANT: allow hover so tooltip works */
        .param-div-icon { pointer-events: auto; }
        .base-station-icon { pointer-events: auto; }
      `}</style>
    </div>
  );
}
