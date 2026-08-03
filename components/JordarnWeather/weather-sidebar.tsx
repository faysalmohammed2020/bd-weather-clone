"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Thermometer,
  Wind,
  Droplets,
  Gauge,
  CloudSnow,
  Sun,
  Cloud,
  CloudRain,
  Eye,
  Mountain,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { ForecastLayerId } from "./Animation/ForecastOverlay";
import type { EnabledMap, ParameterId } from "./MapJordarn";
import { useLocale, useTranslations } from "next-intl";

interface WeatherParameter {
  id: string;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
  unit?: string;
}

interface WeatherSidebarProps {
  enabled: EnabledMap;
  enabledForecast: Record<ForecastLayerId, boolean>;
  onParameterToggle: (parameterId: string, enabled: boolean) => void;
  onForecastToggle: (parameterId: ForecastLayerId, enabled: boolean) => void;
}

export default function WeatherSidebar({
  enabled,
  enabledForecast,
  onParameterToggle,
  onForecastToggle,
}: WeatherSidebarProps) {
  const t = useTranslations("WeatherStation");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const weatherStations: Array<WeatherParameter & { id: ParameterId }> = [
    { id: "temperature", label: t("temperature"), icon: Thermometer, enabled: enabled.temperature, unit: t("unitC") },
    { id: "wind", label: t("wind"), icon: Wind, enabled: enabled.wind, unit: t("unitKMH") },
    { id: "humidity", label: t("humidity"), icon: Droplets, enabled: enabled.humidity, unit: t("unitPercent") },
    { id: "pressure", label: t("pressure"), icon: Gauge, enabled: enabled.pressure, unit: t("unitHPA") },
    { id: "dewpoint", label: t("dewpoint"), icon: CloudSnow, enabled: enabled.dewpoint, unit: t("unitC") },
    { id: "solarRadiation", label: t("solarRadiation"), icon: Sun, enabled: enabled.solarRadiation, unit: t("unitWM2") },
  ];

  type ForecastParam = Omit<WeatherParameter, "id"> & { id: ForecastLayerId };
  const numericalForecast: ForecastParam[] = [
    { id: "forecast-temp", label: t("temperature"), icon: Thermometer, enabled: enabledForecast["forecast-temp"] },
    { id: "forecast-humidity", label: t("humidity"), icon: Droplets, enabled: enabledForecast["forecast-humidity"] },
    { id: "forecast-wind", label: t("wind"), icon: Wind, enabled: enabledForecast["forecast-wind"] },
    { id: "pressure-isolines", label: t("pressureIsolines"), icon: Eye, enabled: enabledForecast["pressure-isolines"] },
    { id: "msl-pressure", label: t("mslPressure"), icon: Gauge, enabled: enabledForecast["msl-pressure"] },
    { id: "geopotential", label: t("geopotential"), icon: Mountain, enabled: enabledForecast.geopotential },
    { id: "forecast-dewpoint", label: t("dewpoint"), icon: CloudSnow, enabled: enabledForecast["forecast-dewpoint"] },
    { id: "low-clouds", label: t("lowClouds"), icon: Cloud, enabled: enabledForecast["low-clouds"] },
    { id: "total-clouds", label: t("totalClouds"), icon: CloudRain, enabled: enabledForecast["total-clouds"] },
  ];

  return (
    <div
      className="h-full w-full overflow-y-auto border-e border-slate-200 bg-white/95 p-3 text-slate-900 backdrop-blur-xl transition-colors sm:w-80 sm:p-4 dark:border-slate-800 dark:bg-slate-950/95 dark:text-white"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Weather Stations Section */}
      <Card className="mb-4 border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-xl">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("weatherStations")}
            </h2>
          </div>

          <div className="space-y-3">
            {weatherStations.map((param) => {
              const Icon = param.icon;
              return (
                <div
                  key={param.id}
                  className="flex items-center justify-between"
                >
                  {/* Label + icon should flip in RTL */}
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    <span className="text-sm text-slate-800 dark:text-white">{param.label}</span>
                    {param.unit && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({param.unit})
                      </span>
                    )}
                  </div>
                  {/* Switch always stays aligned on the opposite side */}
                  <Switch
                    checked={!!param.enabled}
                    onCheckedChange={(checked) => onParameterToggle(param.id, checked)}
                    className="data-[state=checked]:bg-sky-600 dark:data-[state=checked]:bg-sky-500"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Forecast Section */}
      <Card className="border-slate-200 bg-slate-50/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-xl">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("numericalForecast")}
            </h2>
          </div>

          <div className="space-y-3">
            {numericalForecast.map((param) => {
              const Icon = param.icon;
              return (
                <div
                  key={param.id}
                  className="flex items-center justify-between"
                >
                  <div
                    className={`flex items-center gap-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    <span className="text-sm text-slate-800 dark:text-white">{param.label}</span>
                  </div>
                  <Switch
                    checked={!!param.enabled}
                    onCheckedChange={(checked) => onForecastToggle(param.id, checked)}
                    className="data-[state=checked]:bg-sky-600 dark:data-[state=checked]:bg-sky-500"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
