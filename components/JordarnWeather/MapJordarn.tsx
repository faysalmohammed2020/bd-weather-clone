"use client";

import { useState, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { getAllStations, type WeatherStationData } from "./weather-data";
import ForecastOverlay, {
  type ForecastLayerId,
} from "./Animation/ForecastOverlay";
import dynamic from "next/dynamic";
import { Roboto_Mono } from "next/font/google";
import type { FeatureCollection } from "geojson";

const MapTilerVectorLayer = dynamic(() => import("./MapTilerVectorLayer"), {
  ssr: false,
});

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
  enabledForecast: Record<ForecastLayerId, boolean>;
}

/** Small utility: dew point approximation (Magnus-Tetens) */
function dewPointFromTempRH(tempC: number, rh: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = (a * tempC) / (b + tempC) + Math.log(rh / 100);
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
function fluctuationDelta(
  index: number,
  stationId: string,
  param: ParameterId
): number {
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
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/* === NEW: a small base “dot” icon for stations when no parameter is active === */
function createBaseStationIcon() {
  const html = `
    <div style="width: 24px; height: 24px; display: flex; justify-content: center; align-items: center;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 10C13.1046 10 14 9.10457 14 8C14 6.89543 13.1046 6 12 6C10.8954 6 10 6.89543 10 8C10 9.10457 10.8954 10 12 10Z" fill="#3b82f6"/>
        <path d="M12 12C9.8 12 8 10.2 8 8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8C16 10.2 14.2 12 12 12ZM12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8C14 6.9 13.1 6 12 6Z" fill="#1d4ed8"/>
        <path d="M12 16C15.9 16 19 12.9 19 9C19 8.4 18.6 8 18 8C17.4 8 17 8.4 17 9C17 11.8 14.8 14 12 14C9.2 14 7 11.8 7 9C7 8.4 6.6 8 6 8C5.4 8 5 8.4 5 9C5 12.9 8.1 16 12 16Z" fill="#3b82f6"/>
        <path d="M12 20C17.5 20 22 15.5 22 10C22 9.4 21.6 9 21 9C20.4 9 20 9.4 20 10C20 14.4 16.4 18 12 18C7.6 18 4 14.4 4 10C4 9.4 3.6 9 3 9C2.4 9 2 9.4 2 10C2 15.5 6.5 20 12 20Z" fill="#1d4ed8"/>
        <path d="M12 22C6.5 22 2 17.5 2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12C22 17.5 17.5 22 12 22ZM12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C16.4 20 20 16.4 20 12C20 7.6 16.4 4 12 4Z" fill="#1d4ed8" fill-opacity="0.3"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "base-station-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

/** Value marker icons with gradients (kept from your code; now hoverable) */
function createParamIcon(
  station: WeatherStationData,
  param: ParameterId,
  value: string | null,
  overrideDirectionDeg?: number | null,
  forceBlack?: boolean
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

    const valueStr = (value ?? value === 0) ? `${value}` : "—";

    // SVG geometry
    const cx = 24,
      cy = 28; // center
    const r = 14; // inner radius
    const ringR = 20; // dotted orbit radius

    const html = `
    <div style="pointer-events:none; display:flex; align-items:center; justify-content:center; background:transparent;">
      <svg width="40" height="40" viewBox="0 0 56 64" style="overflow:visible; shape-rendering:geometricPrecision;">
        <defs>
          <linearGradient id="windFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#39b5ff"/>
            <stop offset="1" stop-color="#1677ff"/>
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity=".35"/>
          </filter>
        </defs>
  
        <!-- dotted orbit -->
        <circle cx="${cx}" cy="${cy}" r="${ringR}"
                fill="none" stroke="#7fb8ff" stroke-width="2"
                stroke-dasharray="1 6" opacity=".6"/>
  
        <!-- pointer wedge (rotates around center) -->
        <g style="transform:rotate(${rotation}deg); transform-origin:${cx}px ${cy}px">
          <path d="M ${cx} ${cy - r - 10} L ${cx - 9} ${cy - r + 4} L ${cx + 9} ${cy - r + 4} Z"
                fill="#1a5fd0" opacity=".95" filter="url(#shadow)"/>
        </g>
  
        <!-- outer ring -->
        <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="#125ecb" filter="url(#shadow)"/>
        <!-- inner face -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#windFill)"/>
  
        <!-- centered value -->
        <text x="${cx}" y="${cy + 5}" text-anchor="middle"
              font-family="Roboto Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
              font-weight="800" font-size="16"
              fill="#ffffff" stroke="#0d3a7e" stroke-width="2" paint-order="stroke">
          ${valueStr}
        </text>
      </svg>
    </div>
    `;

    return L.divIcon({
      html,
      className: "wind-pin-icon",
      iconSize: [56, 64],
    });
  }

  const blackStyle = `color:#000;-webkit-text-fill-color:initial;background:none;`;
  const gradientStyle = `background:${gradientMap[param]};-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;`;
  const styleSpan = forceBlack ? blackStyle : gradientStyle;

  const html = `
    <div style="display:inline-flex;align-items:center;justify-content:center;background:transparent;border:none;padding:0;margin:0;font-size:18px;font-weight:900;line-height:1;">
      <span class="${robotoMono.className}" style="${styleSpan}">${display}</span>
    </div>
  `;
  return L.divIcon({ html, className: "param-div-icon", iconSize: [24, 24] });
}

// Compute wind direction that also changes along the timeline
function dynamicWindDirectionDeg(
  index: number,
  stationId: string,
  baseDir: number | null | undefined
) {
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
  enabledForecast,
}: MapComponentProps) {
  const { data: session } = useSession();
  const t = useTranslations("WeatherStation");
  const [jordanBoundary, setJordanBoundary] =
    useState<FeatureCollection | null>(null);

  // Load Jordan boundary GeoJSON
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/jordan.json"); // served from /public
        if (!res.ok) return;
        const gj = (await res.json()) as FeatureCollection;
        if (mounted) setJordanBoundary(gj);
      } catch {
        console.warn("Failed to load jordan.json");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- LAZY IMPORT: add Tooltip here ---------- */
  const [leaflet, setLeaflet] = useState<null | {
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Tooltip: any; // 👈 NEW
    GeoJSON: any;
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
          Tooltip: rl.Tooltip, // 👈 NEW
          GeoJSON: rl.GeoJSON,
          useMap: rl.useMap,
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const CustomZoomControl = useMemo(() => {
    if (!leaflet) return () => null;
    const { useMap } = leaflet;
    return function ZoomCtrl() {
      const map = useMap();
      return (
        <div className="absolute top-2 left-2 z-[10] flex flex-col gap-1">
          <Button
            size="icon"
            variant="secondary"
            onClick={() => map.zoomIn()}
            aria-label="Zoom in"
            className="h-8 w-8 bg-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            onClick={() => map.zoomOut()}
            aria-label="Zoom out"
            className="h-8 w-8 bg-white"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      );
    };
  }, [leaflet]);

  const dates = useMemo(() => {
    const dateList: string[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dateList.push(
        date.toLocaleDateString("en-US", { day: "numeric", month: "short" })
      );
    }
    return dateList;
  }, []);

  const currentIndex =
    dates.length > 0 ? Math.max(0, dates.indexOf(currentDate)) : 0;
  const stations = useMemo(
    () => getAllStations().filter((s) => s.coordinates),
    []
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isPlaying || dates.length === 0) return;
    const intervalMs = playbackSpeed === 2 ? 600 : 1200;
    const timer = setInterval(() => {
      const next = (currentIndex + 1) % dates.length;
      setCurrentDate(dates[next]);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, currentIndex, dates, setCurrentDate]);

  const goPrev = () => {
    if (dates.length === 0) return;
    const prev = (currentIndex - 1 + dates.length) % dates.length;
    setCurrentDate(dates[prev]);
  };

  const goNext = () => {
    if (dates.length === 0) return;
    const next = (currentIndex + 1) % dates.length;
    setCurrentDate(dates[next]);
  };

  // Determine active forecast layer (single-select expected). Must be declared
  // before any early returns to keep Hooks order consistent across renders.
  const activeForecast: ForecastLayerId | null = useMemo(() => {
    const entries = Object.entries(enabledForecast) as Array<
      [ForecastLayerId, boolean]
    >;
    const found = entries.find(([, v]) => v);
    return found ? found[0] : null;
  }, [enabledForecast]);

  const roleLabel =
    session?.user?.role === "super_admin"
      ? t("role.superAdmin")
      : session?.user?.role === "station_admin"
        ? t("role.stationAdmin")
        : session?.user?.role === "observer"
          ? t("role.observer")
          : t("guest");

  const roleDesc =
    session?.user?.role === "super_admin"
      ? t("roleDescription.superAdmin")
      : session?.user?.role === "station_admin" ||
          session?.user?.role === "observer"
        ? t("roleDescription.stationAdmin")
        : t("guestDescription");

  const { MapContainer, TileLayer, Marker, Tooltip, GeoJSON, useMap } =
    leaflet || ({} as any);

  // Component to fit map to Jordan bounds
  function FitJordanBounds({ data }: { data: FeatureCollection }) {
    const map = useMap();
    useEffect(() => {
      const bounds = L.geoJSON(data as any).getBounds();
      map.fitBounds(bounds, { padding: [20, 20] });
    }, [map, data]);
    return null;
  }

  // Value per parameter per station (same logic; used for marker label + tooltip)
  const valueForParam = (
    s: WeatherStationData,
    p: ParameterId
  ): string | null => {
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
        if (
          s.maxTemp != null &&
          s.relativeHumidity != null &&
          s.relativeHumidity > 0
        ) {
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
        const adjusted = Math.max(
          800,
          Math.min(1100, s.pressure + delta * 0.5)
        );
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

  // Parameters explicitly enabled from the stations UI
  const uiActiveParams = (Object.keys(enabled) as ParameterId[]).filter(
    (k) => enabled[k]
  );
  // If no parameter is enabled but forecast-temp is active, implicitly show temperature markers
  const effectiveActiveParams: ParameterId[] =
    uiActiveParams.length > 0
      ? uiActiveParams
      : activeForecast === "forecast-temp"
        ? (["temperature"] as ParameterId[])
        : [];
  const anyParamActive = effectiveActiveParams.length > 0;

  // All forecast products support time scrubbing. Hide the timeline only when
  // no station parameter or numerical forecast layer is selected.
  const hideTimeline = !anyParamActive && !activeForecast;

  /* === NEW: Tooltip renderer (station details). Keep it simple & compact. === */
  const StationTooltip = ({
    s,
    param,
  }: {
    s: WeatherStationData;
    param?: ParameterId;
  }) => {
    const v = param ? valueForParam(s, param) : null;
    const unit = param ? ` ${paramUnits[param]}` : "";

    return (
      <div style={{ fontSize: 12, lineHeight: 1.2 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{s.stationName}</div>
        {param && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ opacity: 0.7, marginRight: 4 }}>{param}</span>
            <strong
              className={robotoMono.className}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {v ?? "—"}
              {v ? unit : ""}
            </strong>
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto auto",
            gap: "2px 8px",
          }}
        >
          <span>{t("maxMin")}</span>
          <span
            className={robotoMono.className}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.maxTemp ?? "—"}
            {t("unitC")} / {s.minTemp ?? "—"}
            {t("unitC")}
          </span>
          <span>{t("relativeHumidity")}</span>
          <span
            className={robotoMono.className}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.relativeHumidity ?? "—"}%
          </span>
          <span>{t("precipitation")}</span>
          <span
            className={robotoMono.className}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.precipitation} {t("unitMM")}
          </span>
          <span>{t("snowDepth")}</span>
          <span
            className={robotoMono.className}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.snowDepth} {t("unitCM")}
          </span>
          <span>{t("windSpeed")}</span>
          <span
            className={robotoMono.className}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.windSpeedKph ?? "—"} {t("unitKMH")}{" "}
            {`@ ${dynamicWindDirectionDeg(currentIndex, s.stationId, s.windDirDeg)}°`}
          </span>
          <span>{t("pressure")}</span>
          <span
            className={robotoMono.className}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.pressure ?? "—"} {t("unitHPA")}
          </span>
          <span>{t("solarRadiation")}</span>
          <span
            className={robotoMono.className}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.solarRadiation ?? "—"} {t("unitWM2")}
          </span>
          <span>{t("coords")}</span>
          <span
            className={robotoMono.className}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.coordinates
              ? `${s.coordinates.lat.toFixed(3)}, ${s.coordinates.lng.toFixed(3)}`
              : "—"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-[calc(100vh-50px)] w-full z-10">
      {/* Map */}
      <div className="relative h-[calc(100vh-50px)] w-full rounded-lg overflow-hidden border-2 border-gray-200">
        {!leaflet ? (
          <>
            <div className="h-full w-full rounded-lg border-2 border-gray-200 overflow-hidden">
              <div className="h-full w-full animate-pulse bg-muted" />
            </div>
          </>
        ) : (
          <MapContainer
            center={[31.24, 36.51]} // Amman, Jordan
            zoom={8}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
            minZoom={8}
            maxBounds={[
              [29.0, 34.8],
              [33.5, 39.3],
            ]}
          >
            <FixLeafletIcons />
            {process.env.NEXT_PUBLIC_MAPTILER_KEY ? (
              <MapTilerVectorLayer
                apiKey={process.env.NEXT_PUBLIC_MAPTILER_KEY}
                styleUrl={`https://api.maptiler.com/maps/01994da9-ef78-7028-abca-085899f842e2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}

            {/* Jordan boundary outline */}
            {jordanBoundary && (
              <>
                <GeoJSON
                  data={jordanBoundary as any}
                  style={{
                    weight: 3,
                    color: "#000000",
                    opacity: 0.8,
                    fillOpacity: 0,
                  }} // Changed weight, color, and slightly increased opacity for better visibility
                  interactive={false}
                />
                <FitJordanBounds data={jordanBoundary} />
              </>
            )}

            <CustomZoomControl />

            {/* Forecast overlays */}
            {activeForecast && (
              <ForecastOverlay
                layerId={activeForecast}
                enabled={true}
                opacity={0.76}
                isPlaying={isPlaying}
                timelineKey={currentIndex}
              />
            )}

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
                    <Tooltip
                      direction="top"
                      offset={[0, -6]}
                      opacity={1}
                      sticky
                    >
                      <StationTooltip s={s} />
                    </Tooltip>
                  </Marker>
                );
              })}

            {/* Parameter markers (only for active parameter), hide base layer to avoid clutter */}
            {anyParamActive &&
              effectiveActiveParams.map((paramKey: ParameterId) =>
                stations.map((s) => {
                  const coords = s.coordinates!;
                  const val = valueForParam(s, paramKey);
                  const dir =
                    paramKey === "wind"
                      ? dynamicWindDirectionDeg(
                          currentIndex,
                          s.stationId,
                          s.windDirDeg
                        )
                      : null;
                  const forceBlack =
                    activeForecast === "forecast-temp" &&
                    paramKey === "temperature";
                  const icon = createParamIcon(
                    s,
                    paramKey,
                    val,
                    dir ?? undefined,
                    forceBlack
                  );
                  return (
                    <Marker
                      key={`${paramKey}-${s.stationId}`}
                      position={[coords.lat, coords.lng]}
                      icon={icon}
                      interactive={true}
                    >
                      <Tooltip
                        direction="top"
                        offset={[0, -8]}
                        opacity={1}
                        sticky
                      >
                        <StationTooltip s={s} param={paramKey} />
                      </Tooltip>
                    </Marker>
                  );
                })
              )}
          </MapContainer>
        )}
      </div>

      {/* Timeline */}
      {!hideTimeline && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="mx-auto max-w-4xl rounded-2xl bg-blue-900/70 text-blue-50 shadow-2xl ring-1 ring-blue-400/20 backdrop-blur p-3">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? "Pause forecast animation" : "Play forecast animation"}
                className={
                  "h-8 w-8 rounded-lg border transition " +
                  (isPlaying
                    ? "bg-blue-600/90 hover:bg-blue-500/90 text-white border-blue-300/20"
                    : "bg-blue-950/40 hover:bg-blue-900/50 text-blue-100 border-blue-400/30")
                }
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                size="icon"
                variant="secondary"
                onClick={goPrev}
                aria-label="Previous forecast day"
                className="h-8 w-8 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-100 border border-blue-400/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={goNext}
                aria-label="Next forecast day"
                className="h-8 w-8 rounded-lg bg-blue-950/40 hover:bg-blue-900/50 text-blue-100 border border-blue-400/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-950/40 text-[11px] ring-1 ring-blue-400/20">
                <span className="opacity-80">{t("speed")}</span>
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
                  {t("1x")}
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
                  {t("2x")}
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
      )}

      {/* Role pill */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
        <div className="text-sm font-medium">{roleLabel}</div>
        <div className="text-xs text-gray-500">{roleDesc}</div>
      </div>

      {/* Global tweaks */}
      <style jsx global>{`
        /* IMPORTANT: allow hover so tooltip works */
        .param-div-icon {
          pointer-events: auto;
        }
        .base-station-icon {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
