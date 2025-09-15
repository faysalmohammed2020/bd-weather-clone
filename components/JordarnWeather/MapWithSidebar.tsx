"use client";

import { useState } from "react";
import WeatherSidebar from "./weather-sidebar";
import MapJordarn, { type EnabledMap, type ParameterId } from "./MapJordarn";
import type { ForecastLayerId } from "./Animation/ForecastOverlay";

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
