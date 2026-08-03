"use client";

import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Droplets,
  Eye,
  Gauge,
  Mountain,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { EnabledMap, ParameterId } from "./MapJordarn";
import type { ForecastLayerId } from "./Animation/ForecastOverlay";

type Props = {
  enabled: EnabledMap;
  enabledForecast: Record<ForecastLayerId, boolean>;
  onParameterToggle: (id: ParameterId, enabled: boolean) => void;
  onForecastToggle: (id: ForecastLayerId, enabled: boolean) => void;
};

type ToolbarItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

export default function WeatherLayerToolbar({
  enabled,
  enabledForecast,
  onParameterToggle,
  onForecastToggle,
}: Props) {
  const t = useTranslations("WeatherStation");

  const observations: ToolbarItem<ParameterId>[] = [
    { id: "temperature", label: t("temperature"), icon: Thermometer },
    { id: "humidity", label: t("humidity"), icon: Droplets },
    { id: "wind", label: t("wind"), icon: Wind },
    { id: "pressure", label: t("pressure"), icon: Gauge },
    { id: "dewpoint", label: t("dewpoint"), icon: CloudSnow },
    { id: "solarRadiation", label: t("solarRadiation"), icon: Sun },
  ];
  const forecasts: ToolbarItem<ForecastLayerId>[] = [
    { id: "forecast-temp", label: t("temperature"), icon: Thermometer },
    { id: "forecast-humidity", label: t("humidity"), icon: Droplets },
    { id: "forecast-wind", label: t("wind"), icon: Wind },
    { id: "pressure-isolines", label: t("pressureIsolines"), icon: Eye },
    { id: "msl-pressure", label: t("mslPressure"), icon: Gauge },
    { id: "geopotential", label: t("geopotential"), icon: Mountain },
    { id: "forecast-dewpoint", label: t("dewpoint"), icon: CloudSnow },
    { id: "low-clouds", label: t("lowClouds"), icon: Cloud },
    { id: "total-clouds", label: t("totalClouds"), icon: CloudRain },
  ];

  const renderButton = <T extends string>(
    item: ToolbarItem<T>,
    active: boolean,
    onClick: () => void
  ) => {
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        title={item.label}
        aria-label={item.label}
        aria-pressed={active}
        onClick={onClick}
        className={`group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
          active
            ? "bg-amber-400 text-slate-950 shadow-[0_0_0_1px_rgba(251,191,36,.35)]"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-100 dark:hover:bg-white/12 dark:hover:text-white"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-800 shadow-lg group-hover:block dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex max-w-[calc(100vw-7rem)] items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white/90 p-1.5 shadow-xl backdrop-blur-md transition-colors dark:border-white/15 dark:bg-slate-950/90 dark:shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span className="hidden px-1 text-[9px] font-bold tracking-[0.16em] text-slate-500 dark:text-slate-400 sm:inline">
        OBS
      </span>
      {observations.map((item) =>
        renderButton(item, enabled[item.id], () =>
          onParameterToggle(item.id, !enabled[item.id])
        )
      )}
      <span className="mx-1 h-6 w-px shrink-0 bg-slate-200 dark:bg-white/20" aria-hidden="true" />
      <span className="hidden px-1 text-[9px] font-bold tracking-[0.16em] text-slate-500 dark:text-slate-400 sm:inline">
        MODEL
      </span>
      {forecasts.map((item) =>
        renderButton(item, enabledForecast[item.id], () =>
          onForecastToggle(item.id, !enabledForecast[item.id])
        )
      )}
    </div>
  );
}
