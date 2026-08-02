"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import WeatherSidebar from "./weather-sidebar";
import type { EnabledMap, ParameterId } from "./MapJordarn";
import type { ForecastLayerId } from "./Animation/ForecastOverlay";

// Leaflet reads `window` while its module is initialized. A Client Component can
// still be pre-rendered by Next.js, so keep the entire map out of the SSR bundle.
const MapJordarn = dynamic(() => import("./MapJordarn"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" />,
});

export default function MapWithSidebar() {
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" }),
  );
  const [isPlaying, setIsPlaying] = useState(false);

  // track which parameters are enabled
  const [enabled, setEnabled] = useState<EnabledMap>({
    temperature: false,
    wind: false,
    humidity: false,
    pressure: false,
    dewpoint: false,
    solarRadiation: false,
  });

  // track which forecast overlay is enabled (single-select handled in sidebar)
  const [enabledForecast, setEnabledForecast] = useState<Record<ForecastLayerId, boolean>>({
    "forecast-temp": false,
    "forecast-humidity": false,
    "forecast-wind": false,
    "pressure-isolines": false,
    "msl-pressure": false,
    "geopotential": false,
    "forecast-dewpoint": false,
    "low-clouds": false,
    "total-clouds": false,
  });

  const handleToggle = (id: string, on: boolean) => {
    // Pause timeline on any sidebar change
    setIsPlaying(false);
    // only react to the six requested station parameters
    const key = id as ParameterId;
    if (!(key in enabled)) return;
    setEnabled((prev) => ({ ...prev, [key]: on }));
  };

  const handleForecastToggle = (id: ForecastLayerId, on: boolean) => {
    // Pause timeline on any sidebar change
    setIsPlaying(false);
    setEnabledForecast((prev) => ({ ...prev, [id]: on }));
  };

  return (
    <div className="grid grid-cols-[20rem_1fr] h-[calc(100vh-0px)]">
      <WeatherSidebar onParameterToggle={handleToggle} onForecastToggle={handleForecastToggle} />
      <MapJordarn
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        enabled={enabled}
        enabledForecast={enabledForecast}
      />
    </div>
  );
}
