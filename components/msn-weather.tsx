"use client";

import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Eye,
  Cloud,
} from "lucide-react";

export default function WeatherDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6  min-h-screen">
      {/* Temperature */}
      <WeatherCard
        icon={<Thermometer className="text-blue-500" />}
        title="Temperature"
        value="34°"
        status="Steady"
        description="Steady at current value of 34°. Overnight low of 26° at 3:00 AM."
      />

      {/* Cloud Cover */}
      <WeatherCard
        icon={<Cloud className="text-gray-500" />}
        title="Cloud cover"
        value="Mostly Cloudy (75%)"
        status="Mostly Cloudy"
        description="Decreasing with partly cloudy sky at 3:00 PM. Partly cloudy sky expected in the evening."
      />

      {/* Precipitation */}
      <WeatherCard
        icon={<CloudRain className="text-indigo-500" />}
        title="Precipitation"
        value="0.04 cm"
        status="Light rain showers"
        description="Rain stopping soon"
        subtext="In next 24h"
      />

      {/* Wind */}
      <WeatherCard
        icon={<Wind className="text-blue-600" />}
        title="Wind"
        value="10 km/h"
        status="Force: 2 (Light Breeze)"
        description="Steady with averages holding at 8 km/h (gusts to 18) expected from 5 through the evening."
        subtext="From ESE (110°), Gust: 31 km/h"
      />

      {/* Humidity */}
      <WeatherCard
        icon={<Droplets className="text-cyan-600" />}
        title="Humidity"
        value="70%"
        status="Very humid"
        description="Steady at 72%. Very humid conditions expected in the evening."
        subtext="Dew point: 28°"
      />

      {/* Visibility */}
      <WeatherCard
        icon={<Eye className="text-green-600" />}
        title="Visibility"
        value="4 km"
        status="Good"
        description="Remaining steady at 20 km. Excellent visibility expected in the evening."
      />
    </div>
  );
}

interface WeatherCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  status: string;
  description: string;
  subtext?: string;
  extra?: string;
}

function WeatherCard({
  icon,
  title,
  value,
  status,
  description,
  subtext,
  extra,
}: WeatherCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-gray-700">{title}</h3>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subtext && <div className="text-sm text-gray-500">{subtext}</div>}
      {extra && <div className="text-sm text-gray-500">{extra}</div>}
      <div className="font-medium text-blue-600">{status}</div>
      <p className="text-sm text-gray-600 leading-snug">{description}</p>
    </div>
  );
}
