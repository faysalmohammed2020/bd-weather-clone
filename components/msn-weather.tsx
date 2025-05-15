"use client";

import {
  Sun,
  Moon,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Eye,
  Cloud,
  Gauge,
  CircleGauge,
  SunDim,
  CircleDot,
} from "lucide-react";

export default function WeatherDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-blue-50 min-h-screen">
      {/* Temperature */}
      <WeatherCard
        icon={<Thermometer className="text-blue-500" />}
        title="Temperature"
        value="34°"
        status="Steady"
        description="Steady at current value of 34°. Overnight low of 26° at 3:00 AM."
      />

      {/* Feels Like */}
      <WeatherCard
        icon={<Droplets className="text-red-500" />}
        title="Feels like"
        value="42°"
        status="Hot"
        description="Feels considerably warmer than the actual temperature due to the humidity."
        subtext="Dominant factor: humidity"
        extra="Temperature: 34°"
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

      {/* UV */}
      <WeatherCard
        icon={<SunDim className="text-yellow-500" />}
        title="UV"
        value="6"
        status="High"
        description="Maximum UV exposure for today will be high, expected at 2:52 PM."
      />

      {/* AQI */}
      <WeatherCard
        icon={<CircleGauge className="text-yellow-600" />}
        title="AQI"
        value="91"
        status="Moderate"
        description="Deteriorating air quality with primary pollutant: PM2.5 33 µg/m³."
      />

      {/* Visibility */}
      <WeatherCard
        icon={<Eye className="text-green-600" />}
        title="Visibility"
        value="4 km"
        status="Good"
        description="Remaining steady at 20 km. Excellent visibility expected in the evening."
      />

      {/* Pressure */}
      <WeatherCard
        icon={<Gauge className="text-blue-700" />}
        title="Pressure"
        value="1005 mb"
        status="Falling slowly"
        description="Falling slowly in the last 3 hours. Expected to fall slowly in the next 3 hours."
        subtext="2:56 PM (Now)"
      />

      {/* Sun */}
      <WeatherCard
        icon={<Sun className="text-orange-500" />}
        title="Sun"
        value="13 hrs 17 mins"
        status="Sunrise: 5:16 AM"
        description="Sunset: 6:33 PM"
      />

      {/* Moon */}
      <WeatherCard
        icon={<Moon className="text-purple-600" />}
        title="Moon"
        value="10 hrs 30 mins"
        status="Moonrise: 9:09 PM"
        description="Moonset: 7:39 AM"
      />

      {/* Moon Phase */}
      <WeatherCard
        icon={<CircleDot className="text-yellow-400" />}
        title="Moon phase"
        value="94%"
        status="Phase of moon"
        description="Next time full moon: Jun 11"
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
