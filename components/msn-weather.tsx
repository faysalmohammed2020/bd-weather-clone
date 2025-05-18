"use client";

import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Eye,
  Cloud,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

interface WeatherData {
  maxTemperature: string | null;
  minTemperature: string | null;
  totalPrecipitation: string | null;
  windSpeed: string | null;
  avTotalCloud: string | null;
  avRelativeHumidity: string | null;
  lowestVisibility: string | null;
}

export default function WeatherDashboard({
  selectedStation,
}: {
  selectedStation: any | null;
}) {
  const { data: session } = useSession();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Determine which station to query
        const stationToQuery =
          selectedStation?.stationId || session?.user?.stationId;

        if (!stationToQuery) {
          setError("No station selected");
          setLoading(false);
          return;
        }

        // Get current date in "DD-MMM" format
        const date = new Date();
        const day = date.getDate();
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const month = monthNames[date.getMonth()];
        const dateString = `${day}-${month}`;

        const response = await fetch(
          `/api/daily-summary?stationNo=${stationToQuery}&date=${dateString}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        setError("Failed to fetch weather data");
        console.error("Error fetching weather data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedStation, session]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 min-h-screen">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-5 space-y-4 animate-pulse"
          >
            <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  // Default values if data is not available
  const defaultValues = {
    maxTemperature: "N/A",
    minTemperature: "N/A",
    totalPrecipitation: "0 cm",
    windSpeed: "0 km/h",
    avTotalCloud: "0%",
    avRelativeHumidity: "0%",
    lowestVisibility: "0 km",
  };

  const data = weatherData
    ? {
        maxTemperature:
          weatherData.maxTemperature || defaultValues.maxTemperature,
        minTemperature:
          weatherData.minTemperature || defaultValues.minTemperature,
        totalPrecipitation:
          weatherData.totalPrecipitation || defaultValues.totalPrecipitation,
        windSpeed: weatherData.windSpeed || defaultValues.windSpeed,
        avTotalCloud: weatherData.avTotalCloud || defaultValues.avTotalCloud,
        avRelativeHumidity:
          weatherData.avRelativeHumidity || defaultValues.avRelativeHumidity,
        lowestVisibility:
          weatherData.lowestVisibility || defaultValues.lowestVisibility,
      }
    : defaultValues;

  // Calculate temperature difference
  const tempDiff =
    data.maxTemperature && data.minTemperature
      ? `${parseFloat(data.maxTemperature) - parseFloat(data.minTemperature)}°`
      : "N/A";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 min-h-screen">
      {/* Temperature */}
      <WeatherCard
        icon={<Thermometer className="text-blue-500" />}
        title="Temperature"
        value={`${data.maxTemperature}°`}
        status={`High: ${data.maxTemperature}° | Low: ${data.minTemperature}°`}
        description={`Daily range: ${tempDiff}. Overnight low of ${data.minTemperature}°`}
      />

      {/* Cloud Cover */}
      <WeatherCard
        icon={<Cloud className="text-gray-500" />}
        title="Cloud cover"
        value={`${data.avTotalCloud}%`}
        status={
          parseInt(data.avTotalCloud) > 50 ? "Mostly Cloudy" : "Partly Cloudy"
        }
        description={`Current cloud cover at ${data.avTotalCloud}%`}
      />

      {/* Precipitation */}
      <WeatherCard
        icon={<CloudRain className="text-indigo-500" />}
        title="Precipitation"
        value={data.totalPrecipitation}
        status={
          parseFloat(data.totalPrecipitation) > 0
            ? "Rain recorded"
            : "No precipitation"
        }
        description="Last 24 hours"
        subtext="In next 24h"
      />

      {/* Wind */}
      <WeatherCard
        icon={<Wind className="text-blue-600" />}
        title="Wind"
        value={data.windSpeed}
        status={`Current wind speed`}
        description={`Steady at ${data.windSpeed}`}
        subtext={`From ESE (110°)`}
      />

      <WeatherCard
        icon={<Droplets className="text-cyan-600" />}
        title="Rain"
        value={data.minTemperature}
        status={
          parseInt(data.avRelativeHumidity) > 70
            ? "Very humid"
            : "Moderate humidity"
        }
        description={`Current humidity level`}
        subtext={`Dew point: ${data.avRelativeHumidity}°`}
      />

      {/* Humidity */}
      <WeatherCard
        icon={<Droplets className="text-cyan-600" />}
        title="Humidity"
        value={data.avRelativeHumidity}
        status={
          parseInt(data.avRelativeHumidity) > 70
            ? "Very humid"
            : "Moderate humidity"
        }
        description={`Current humidity level`}
        subtext={`Dew point: ${data.avRelativeHumidity}°`}
      />

      {/* Visibility */}
      <WeatherCard
        icon={<Eye className="text-green-600" />}
        title="Visibility"
        value={data.lowestVisibility}
        status={parseInt(data.lowestVisibility) > 10 ? "Excellent" : "Good"}
        description={`Current visibility conditions`}
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
