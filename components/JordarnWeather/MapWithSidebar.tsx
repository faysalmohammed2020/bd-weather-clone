"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  useEffect(() => {
    // Leaflet measures its container imperatively. Notify it both when the
    // transition starts and after the grid column animation has completed.
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
    });
    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 320);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [isSidebarOpen]);

  return (
    <div
      className="relative grid h-[calc(100vh-0px)] overflow-hidden transition-[grid-template-columns] duration-300 ease-in-out"
      style={{ gridTemplateColumns: isSidebarOpen ? "20rem minmax(0, 1fr)" : "0 minmax(0, 1fr)" }}
    >
      <aside
        id="weather-sidebar"
        aria-hidden={!isSidebarOpen}
        className={`h-full min-w-0 overflow-hidden transition-opacity duration-200 ${
          isSidebarOpen ? "visible opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <WeatherSidebar
          onParameterToggle={handleToggle}
          onForecastToggle={handleForecastToggle}
        />
      </aside>

      <button
        type="button"
        aria-controls="weather-sidebar"
        aria-expanded={isSidebarOpen}
        aria-label={isSidebarOpen ? "Collapse weather sidebar" : "Expand weather sidebar"}
        onClick={() => setIsSidebarOpen((open) => !open)}
        className="absolute top-1/2 z-[1200] flex h-10 w-10 items-center justify-center rounded-full border border-blue-300/40 bg-blue-700 text-white shadow-xl transition-[left,transform,background-color] duration-300 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
        style={{
          left: isSidebarOpen ? "20rem" : "0.75rem",
          transform: isSidebarOpen ? "translate(-50%, -50%)" : "translate(0, -50%)",
        }}
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="h-5 w-5" aria-hidden="true" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <div className="h-full min-w-0">
        <MapJordarn
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          enabled={enabled}
          enabledForecast={enabledForecast}
        />
      </div>
    </div>
  );
}
