"use client";

import type React from "react";
import { useState } from "react";
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
  Waves,
  Eye,
  Mountain,
  MapPin,
} from "lucide-react";
import type { ForecastLayerId } from "./Animation/ForecastOverlay";

interface WeatherParameter {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  enabled: boolean;
  unit?: string;
}

interface WeatherSidebarProps {
  onParameterToggle: (parameterId: string, enabled: boolean) => void;
  onForecastToggle: (parameterId: ForecastLayerId, enabled: boolean) => void;
}

export default function WeatherSidebar({ onParameterToggle, onForecastToggle }: WeatherSidebarProps) {
  const [weatherStations, setWeatherStations] = useState<WeatherParameter[]>([
    { id: "temperature", label: "Temperature", icon: Thermometer, enabled: false, unit: "°C" },
    { id: "wind", label: "Wind", icon: Wind, enabled: false, unit: "km/h" },
    { id: "humidity", label: "Relative Humidity", icon: Droplets, enabled: false, unit: "%" },
    { id: "pressure", label: "Air Pressure", icon: Gauge, enabled: false, unit: "hPa" },
    { id: "dewpoint", label: "Dew Point", icon: CloudSnow, enabled: false, unit: "°C" },
    { id: "solarRadiation", label: "Solar Radiation", icon: Sun, enabled: false, unit: "W/m²" },
  ]);

  // Optional future: forecast list (single-select behavior added here too)
  type ForecastParam = Omit<WeatherParameter, "id"> & { id: ForecastLayerId };
  const [numericalForecast, setNumericalForecast] = useState<ForecastParam[]>([
    { id: "forecast-temp", label: "Temperature", icon: Thermometer, enabled: false },
    { id: "forecast-humidity", label: "Relative Humidity", icon: Droplets, enabled: false },
    { id: "forecast-wind", label: "Wind", icon: Wind, enabled: false },
    { id: "pressure-isolines", label: "Pressure Isolines", icon: Eye, enabled: false },
    { id: "msl-pressure", label: "MSL Pressure", icon: Gauge, enabled: false },
    { id: "geopotential", label: "Geopotential height", icon: Mountain, enabled: false },
    { id: "forecast-dewpoint", label: "Dew Point", icon: CloudSnow, enabled: false },
    { id: "low-clouds", label: "Low Clouds", icon: Cloud, enabled: false },
    { id: "total-clouds", label: "Total Clouds", icon: CloudRain, enabled: false },
    // { id: "wave-height", label: "Wave Height", icon: Waves, enabled: false },
    // { id: "wave-direction", label: "Wave Direction", icon: Waves, enabled: false },
  ]);

  // ---- Single-select handlers ----
  const handleWeatherStationToggle = (id: string) => {
    setWeatherStations((prev) => {
      const target = prev.find((p) => p.id === id);
      const turningOn = !(target?.enabled);
      
      // First, create the new state
      const nextState = prev.map((p) =>
        p.id === id ? { ...p, enabled: turningOn } : { ...p, enabled: false },
      );

      // Calculate changes after state update
      const changes: Array<{id: string, enabled: boolean}> = [];
      
      // Target's state is changing
      if (target?.enabled !== turningOn) {
        changes.push({ id, enabled: turningOn });
      }
      
      // If turning on, turn off all others that were on
      if (turningOn) {
        prev.forEach(p => {
          if (p.id !== id && p.enabled) {
            changes.push({ id: p.id, enabled: false });
          }
        });
        // Also turn off ALL forecast items when a station is turned on
        setNumericalForecast((nfPrev) => {
          const turnedOff = nfPrev.filter((f) => f.enabled).map((f) => f.id);
          const nfNext = nfPrev.map((f) => ({ ...f, enabled: false }));
          // Notify parent after render
          setTimeout(() => {
            turnedOff.forEach((fid) => onForecastToggle(fid, false));
          }, 0);
          return nfNext;
        });
      }

      // Apply changes after state is updated
      setTimeout(() => {
        changes.forEach(({ id, enabled }) => onParameterToggle(id, enabled));
      }, 0);

      return nextState;
    });
  };

  const handleForecastToggle = (id: ForecastLayerId) => {
    setNumericalForecast((prev) => {
      const target = prev.find((p) => p.id === id);
      const turningOn = !(target?.enabled);
      
      // First, create the new state
      const nextState = prev.map((p) =>
        p.id === id ? { ...p, enabled: turningOn } : { ...p, enabled: false },
      );

      // Calculate changes after state update
      const changes: Array<{id: string, enabled: boolean}> = [];
      
      // Target's state is changing
      if (target?.enabled !== turningOn) {
        changes.push({ id, enabled: turningOn });
      }
      
      // If turning on, turn off all others that were on
      if (turningOn) {
        prev.forEach(p => {
          if (p.id !== id && p.enabled) {
            changes.push({ id: p.id, enabled: false });
          }
        });
        // Also turn off ALL station items when a forecast is turned on
        setWeatherStations((wsPrev) => {
          const turnedOff = wsPrev.filter((w) => w.enabled).map((w) => w.id);
          const wsNext = wsPrev.map((w) => ({ ...w, enabled: false }));
          // Notify parent after render
          setTimeout(() => {
            turnedOff.forEach((wid) => onParameterToggle(wid, false));
          }, 0);
          return wsNext;
        });
      }

      // Apply changes after state is updated
      setTimeout(() => {
        changes.forEach(({ id, enabled }) => onForecastToggle(id as ForecastLayerId, enabled));
      }, 0);

      return nextState;
    });
  };

  return (
    <div className="w-80 h-full bg-blue-900 text-white p-4 overflow-y-auto">
      {/* Weather Stations Section */}
      <Card className="bg-blue-800 border-blue-700 mb-4">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Weather Stations</h2>
          </div>

          <div className="space-y-3">
            {weatherStations.map((param) => {
              const Icon = param.icon;
              return (
                <div key={param.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-blue-200" />
                    <span className="text-sm text-white">{param.label}</span>
                    {param.unit && <span className="text-xs text-blue-300">({param.unit})</span>}
                  </div>
                  <Switch
                    checked={!!param.enabled}
                    // clicking the same switch again turns it off (so all become off)
                    onCheckedChange={() => handleWeatherStationToggle(param.id)}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Numerical Forecast Section (also single-select) */}
      <Card className="bg-blue-800 border-blue-700">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Cloud className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Numerical Forecast</h2>
          </div>

          <div className="space-y-3">
            {numericalForecast.map((param) => {
              const Icon = param.icon;
              return (
                <div key={param.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-blue-200" />
                    <span className="text-sm text-white">{param.label}</span>
                  </div>
                  <Switch
                    checked={!!param.enabled}
                    onCheckedChange={() => handleForecastToggle(param.id)}
                    className="data-[state=checked]:bg-blue-500"
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
