"use client";

import { useState } from "react";
import WeatherSidebar from "./weather-sidebar";
import MapJordarn, { type EnabledMap, type ParameterId } from "./MapJordarn";

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
    solar: false,
  });

  const handleToggle = (id: string, on: boolean) => {
    // only react to the six requested station parameters
    const key = id as ParameterId;
    if (!(key in enabled)) return;
    setEnabled((prev) => ({ ...prev, [key]: on }));
  };

  return (
    <div className="grid grid-cols-[20rem_1fr] h-[calc(100vh-0px)]">
      <WeatherSidebar onParameterToggle={handleToggle} />
      <MapJordarn
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        enabled={enabled}
      />
    </div>
  );
}
