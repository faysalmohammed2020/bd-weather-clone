"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import useSWR from "swr";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

import {
  Droplets,
  Eye,
  Clock,
  RefreshCw,
  LayoutDashboard,
  Thermometer,
  Wind,
  Gauge,
  Cloud,
  Activity,
  TrendingUp,
  Umbrella,
  Sun,
  CloudSun,
} from "lucide-react";
import DailySummaryChart from "./StationMap/weatherChart";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// All weather
const CurrentWeather = ({
  temperature,
  condition,
  windSpeed,
  humidity,
  feelsLike,
  dewPoint,
  pressure,
  visibility,
  uvIndex,
  airQuality,
}: {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  feelsLike: number;
  dewPoint: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  airQuality: number;
}) => {
  const t = useTranslations();
  const getConditionIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Sun size={16} className="text-yellow-500" />;
      case "partly cloudy":
        return <CloudSun size={16} className="text-blue-400" />;
      default:
        return <Cloud size={16} className="text-blue-500" />;
    }
  };

  const getAirQualityColor = (aqi: number) => {
    if (aqi <= 50) return "bg-green-100 text-green-800";
    if (aqi <= 100) return "bg-yellow-100 text-yellow-800";
    if (aqi <= 150) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getUVIndexColor = (uv: number) => {
    if (uv <= 2) return "bg-green-100 text-green-800";
    if (uv <= 5) return "bg-yellow-100 text-yellow-800";
    if (uv <= 7) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-blue-50 border border-blue-200 shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-blue-800 text-sm font-semibold flex items-center gap-2">
            {getConditionIcon(condition)}
            {t("dashboard.currentWeather")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-0 text-xs text-blue-900">
          {/* Temperature Section */}
          <motion.div
            className="col-span-1"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-4xl font-bold text-blue-700">
              {temperature}°F
            </div>
            <div className="text-sm text-blue-500 capitalize">{condition}</div>

            {/* Animated weather icon */}
            <motion.div
              className="mt-2"
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {getConditionIcon(condition)}
            </motion.div>
          </motion.div>

          {/* Primary Metrics */}
          <div className="space-y-2 col-span-1 text-xs">
            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Wind size={14} className="text-blue-600" />
              {t("dashboard.wind")}: {windSpeed} {t("common.units.windSpeed")}
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Droplets size={14} className="text-blue-600" />
              {t("dashboard.humidity")}: {humidity}%
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Thermometer size={14} className="text-blue-600" />
              {t("dashboard.feelsLike")}: {feelsLike}°F
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Thermometer size={14} className="text-blue-600" />
              {t("dashboard.dewPoint")}: {dewPoint}°F
            </motion.div>
          </div>

          {/* Secondary Metrics */}
          <div className="space-y-2 col-span-1 text-xs">
            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Gauge size={14} className="text-blue-600" />
              {t("dashboard.pressure")}: {pressure}
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Eye size={14} className="text-blue-600" />
              {t("dashboard.visibility")}: {visibility} {t("common.units.km")}
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Sun size={14} className="text-blue-600" />
              {t("common.units.uvIndex")}:{" "}
              <Badge className={`ml-1 ${getUVIndexColor(uvIndex)}`}>
                {uvIndex}
              </Badge>
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-xs">
                🟠
              </div>
              {t("dashboard.airQuality")}:{" "}
              <Badge className={`ml-1 ${getAirQualityColor(airQuality)}`}>
                {airQuality}
              </Badge>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Thermometer Component
const ThermometerGauge = ({
  temperature,
  min = -10,
  max = 50,
  size = 160,
}: {
  temperature: number;
  min?: number;
  max?: number;
  size?: number;
}) => {
  const percentage = Math.max(
    0,
    Math.min(100, ((temperature - min) / (max - min)) * 100)
  );

  const t = useTranslations();

  const getColor = (temp: number) => {
    if (temp > 35) return "url(#hotGradient)";
    if (temp > 25) return "url(#warmGradient)";
    if (temp > 15) return "url(#mildGradient)";
    if (temp > 5) return "url(#coolGradient)";
    return "url(#coldGradient)";
  };

  const getStatusColor = (temp: number) => {
    if (temp > 35) return "text-red-600";
    if (temp > 25) return "text-orange-600";
    if (temp > 15) return "text-yellow-600";
    if (temp > 5) return "text-blue-600";
    return "text-blue-800";
  };

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Thermometer size={16} className="text-blue-600" />
          {t("dashboard.temperature")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative">
          <svg
            width="100"
            height={size}
            viewBox="0 0 100 160"
            className="drop-shadow-sm"
          >
            <defs>
              <linearGradient
                id="hotGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <linearGradient
                id="warmGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient
                id="mildGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient
                id="coolGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient
                id="coldGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Thermometer body */}
            <rect
              x="30"
              y="15"
              width="40"
              height="110"
              rx="20"
              fill="white"
              stroke="#e2e8f0"
              strokeWidth="2"
              filter="url(#glow)"
            />

            {/* Temperature fill with animation */}
            <motion.rect
              x="32"
              y={17}
              width="36"
              height="106"
              rx="18"
              fill={getColor(temperature)}
              initial={{ height: 0, y: 123 }}
              animate={{
                height: (106 * percentage) / 100,
                y: 17 + (106 * (100 - percentage)) / 100,
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Bulb */}
            <motion.circle
              cx="50"
              cy="140"
              r="18"
              fill={getColor(temperature)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              filter="url(#glow)"
            />

            {/* Scale marks */}
            {[0, 25, 50, 75, 100].map((mark, i) => (
              <g key={i}>
                <line
                  x1="72"
                  y1={125 - mark * 1.06}
                  x2="80"
                  y2={125 - mark * 1.06}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <text
                  x="85"
                  y={130 - mark * 1.06}
                  fontSize="10"
                  fill="#64748b"
                  textAnchor="start"
                  fontWeight="500"
                >
                  {Math.round(min + (max - min) * (mark / 100))}°
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="text-center mt-4 space-y-1">
          <div className={`text-3xl font-bold ${getStatusColor(temperature)}`}>
            {temperature.toFixed(1)}°C
          </div>
          <Badge variant="secondary" className="text-xs">
            {temperature > 30
              ? "Hot"
              : temperature > 20
                ? "Warm"
                : temperature > 10
                  ? "Mild"
                  : "Cool"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Wind Compass
const WindCompass = ({
  windSpeed,
  windDirection,
  size = 160,
}: {
  windSpeed: number;
  windDirection: number;
  size?: number;
}) => {
  const radius = size / 2 - 25;
  const centerX = size / 2;
  const centerY = size / 2;

  const angleRad = (windDirection * Math.PI) / 180;
  const arrowLength = radius * 0.7;
  const arrowX = centerX + Math.sin(angleRad) * arrowLength;
  const arrowY = centerY - Math.cos(angleRad) * arrowLength;
  const t = useTranslations();

  const getWindColor = (speed: number) => {
    if (speed > 20) return "#dc2626";
    if (speed > 10) return "#f59e0b";
    return "#10b981";
  };

  const getWindStatus = (speed: number) => {
    if (speed > 20) return "Strong";
    if (speed > 10) return "Moderate";
    if (speed > 5) return "Light";
    return "Calm";
  };

  return (
    <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Wind size={16} className="text-green-600" />
          {t("dashboard.wind")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-sm"
          >
            <defs>
              <radialGradient id="compassGradient">
                <stop offset="0%" stopColor="white" />
                <stop offset="100%" stopColor="#f8fafc" />
              </radialGradient>
              <filter id="compassShadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodOpacity="0.1"
                />
              </filter>
            </defs>

            {/* Compass circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="url(#compassGradient)"
              stroke="#e2e8f0"
              strokeWidth="2"
              filter="url(#compassShadow)"
            />

            {/* Cardinal directions */}
            <text
              x={centerX}
              y="20"
              textAnchor="middle"
              fontSize="14"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t("common.units.n")}
            </text>
            <text
              x={size - 15}
              y={centerY + 5}
              textAnchor="middle"
              fontSize="14"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t("common.units.e")}
            </text>
            <text
              x={centerX}
              y={size - 10}
              textAnchor="middle"
              fontSize="14"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t("common.units.s")}
            </text>
            <text
              x="15"
              y={centerY + 5}
              textAnchor="middle"
              fontSize="14"
              fill="#1e293b"
              fontWeight="bold"
            >
              {t("common.units.w")}
            </text>

            {/* Wind direction arrow */}
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <line
                x1={centerX}
                y1={centerY}
                x2={arrowX}
                y2={arrowY}
                stroke={getWindColor(windSpeed)}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon
                points={`${arrowX},${arrowY} ${arrowX - 10 * Math.cos(angleRad - Math.PI / 6)},${arrowY + 10 * Math.sin(angleRad - Math.PI / 6)} ${arrowX - 10 * Math.cos(angleRad + Math.PI / 6)},${arrowY + 10 * Math.sin(angleRad + Math.PI / 6)}`}
                fill={getWindColor(windSpeed)}
              />
            </motion.g>

            {/* Center dot */}
            <circle cx={centerX} cy={centerY} r="6" fill="#374151" />

            {/* Speed rings */}
            {[0.3, 0.6, 0.9].map((factor, i) => (
              <circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={radius * factor}
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.5"
              />
            ))}
          </svg>
        </div>

        <div className="text-center mt-4 space-y-1">
          <div className="text-3xl font-bold text-gray-800">
            {windSpeed.toFixed(1)} <span className="text-lg">m/s</span>
          </div>
          <div className="text-sm text-gray-600">
            {windDirection.toFixed(0)}° • {getWindStatus(windSpeed)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Humidity Gauge
const HumidityGauge = ({
  humidity,
  size = 160,
}: {
  humidity: number;
  size?: number;
}) => {
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (humidity / 100) * circumference;

  const getHumidityColor = (h: number) => {
    if (h > 70) return "#3b82f6";
    if (h > 30) return "#10b981";
    return "#f59e0b";
  };

  const getHumidityStatus = (h: number) => {
    if (h > 70) return "High";
    if (h > 30) return "Normal";
    return "Low";
  };

  const t = useTranslations();

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Droplets size={16} className="text-blue-600" />
          {t("common.units.humidity")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 drop-shadow-sm"
          >
            <defs>
              <linearGradient
                id="humidityGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={getHumidityColor(humidity)} />
                <stop
                  offset="100%"
                  stopColor={getHumidityColor(humidity)}
                  stopOpacity="0.6"
                />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="url(#humidityGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{
                strokeDasharray: circumference,
                strokeDashoffset: circumference,
              }}
              animate={{ strokeDasharray: circumference, strokeDashoffset }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplets
              size={28}
              color={getHumidityColor(humidity)}
              className="mb-2"
            />
            <div className="text-3xl font-bold text-gray-800">
              {humidity.toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="text-center mt-2">
          <Badge variant="secondary" className="text-xs">
            {getHumidityStatus(humidity)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Pressure Barometer
const PressureBarometer = ({
  pressure,
  size = 160,
}: {
  pressure: number;
  size?: number;
}) => {
  const minPressure = 980;
  const maxPressure = 1050;
  const normalizedPressure = Math.max(
    minPressure,
    Math.min(maxPressure, pressure)
  );
  const angle =
    ((normalizedPressure - minPressure) / (maxPressure - minPressure)) * 180 -
    90;

  const getPressureStatus = (p: number) => {
    if (p > 1020) return "High";
    if (p > 1000) return "Normal";
    return "Low";
  };

  const t = useTranslations();

  return (
    <Card className="h-full bg-gradient-to-br from-purple-50 to-violet-50 border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Gauge size={16} className="text-purple-600" />
          {t("common.units.pressure")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative">
          <svg
            width={size}
            height={size * 0.8}
            viewBox={`0 0 ${size} ${size * 0.8}`}
            className="drop-shadow-sm"
          >
            <defs>
              <linearGradient
                id="pressureGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>

            {/* Barometer arc background */}
            <path
              d={`M 25 ${size * 0.65} A ${size / 2 - 25} ${size / 2 - 25} 0 0 1 ${size - 25} ${size * 0.65}`}
              stroke="#e2e8f0"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
            />

            {/* Pressure arc */}
            <motion.path
              d={`M 25 ${size * 0.65} A ${size / 2 - 25} ${size / 2 - 25} 0 0 1 ${size - 25} ${size * 0.65}`}
              stroke="url(#pressureGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 180" }}
              animate={{
                strokeDasharray: `${((normalizedPressure - minPressure) / (maxPressure - minPressure)) * 180} 180`,
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Needle */}
            <motion.g
              transform={`translate(${size / 2}, ${size * 0.65})`}
              initial={{ rotate: -90 }}
              animate={{ rotate: angle }}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={-(size / 2 - 35)} 
                stroke="#374151"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="0" cy="0" r="6" fill="#374151" />
            </motion.g>

            {/* Scale labels */}
            <text
              x="25"
              y={size * 0.75}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
              fontWeight="500"
            >
              {minPressure}
            </text>
            <text
              x={size / 2}
              y="30"
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
              fontWeight="500"
            >
              {(minPressure + maxPressure) / 2}
            </text>
            <text
              x={size - 25}
              y={size * 0.75}
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
              fontWeight="500"
            >
              {maxPressure}
            </text>
          </svg>
        </div>

        <div className="text-center mt-4 space-y-1">
          <div className="text-3xl font-bold text-gray-800">
            {pressure.toFixed(0)} <span className="text-lg">{t("common.units.pressure")}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {getPressureStatus(pressure)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Cloud Cover Gauge
const CloudCoverGauge = ({
  cloudCover,
  size = 160,
}: {
  cloudCover: number;
  size?: number;
}) => {
  const cloudCount = Math.ceil((cloudCover / 100) * 6);

  const getCloudStatus = (cover: number) => {
    if (cover > 75) return "Overcast";
    if (cover > 50) return "Cloudy";
    if (cover > 25) return "Partly Cloudy";
    return "Clear";
  };

  const t = useTranslations();

  return (
    <Card className="h-full bg-gradient-to-br from-gray-50 to-slate-50 border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Cloud size={16} className="text-gray-600" />
          {t("dashboard.cloudCover")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-sm"
          >
            <defs>
              <linearGradient
                id="skyGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#bfdbfe" />
              </linearGradient>
            </defs>

            {/* Sky background */}
            <rect width={size} height={size} rx="12" fill="url(#skyGradient)" />

            {/* Clouds */}
            {Array.from({ length: 6 }, (_, i) => (
              <motion.g
                key={i}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{
                  opacity: i < cloudCount ? 0.9 : 0.2,
                  y: 0,
                  scale: i < cloudCount ? 1 : 0.8,
                }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <ellipse
                  cx={25 + (i % 3) * 35}
                  cy={35 + Math.floor(i / 3) * 30}
                  rx="18"
                  ry="12"
                  fill="#9ca3af"
                />
                <ellipse
                  cx={30 + (i % 3) * 35}
                  cy={30 + Math.floor(i / 3) * 30}
                  rx="15"
                  ry="10"
                  fill="#9ca3af"
                />
              </motion.g>
            ))}

            {/* Sun */}
            <motion.g
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: cloudCover > 70 ? 0.3 : 1,
                scale: cloudCover > 70 ? 0.8 : 1,
              }}
              transition={{ duration: 1 }}
            >
              <circle cx={size - 30} cy="30" r="18" fill="#fbbf24" />
              {/* Sun rays */}
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const x1 = size - 30 + Math.cos(angle) * 25;
                const y1 = 30 + Math.sin(angle) * 25;
                const x2 = size - 30 + Math.cos(angle) * 30;
                const y2 = 30 + Math.sin(angle) * 30;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#fbbf24"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                );
              })}
            </motion.g>
          </svg>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-white bg-opacity-90 rounded-lg px-3 py-1 backdrop-blur-sm">
              <div className="text-2xl font-bold text-gray-800">
                {cloudCover.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-2">
          <Badge variant="secondary" className="text-xs">
            {getCloudStatus(cloudCover)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Visibility Gauge
const VisibilityGauge = ({
  visibility,
  size = 160,
}: {
  visibility: number;
  size?: number;
}) => {
  const maxVisibility = 20;
  const percentage = Math.min((visibility / maxVisibility) * 100, 100);

  const getVisibilityColor = (vis: number) => {
    if (vis > 15) return "#10b981";
    if (vis > 10) return "#f59e0b";
    return "#ef4444";
  };

  const getVisibilityStatus = (vis: number) => {
    if (vis > 15) return "Excellent";
    if (vis > 10) return "Good";
    if (vis > 5) return "Moderate";
    return "Poor";
  };

  const t = useTranslations();

  return (
    <Card className="h-full bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Eye size={16} className="text-amber-600" />
          {t("dashboard.visibility")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-sm"
          >
            <defs>
              <linearGradient
                id="visibilityGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={getVisibilityColor(visibility)} />
                <stop
                  offset="100%"
                  stopColor={getVisibilityColor(visibility)}
                  stopOpacity="0.6"
                />
              </linearGradient>
            </defs>

            {/* Background bar */}
            <rect
              width={size - 20}
              height="16"
              x="10"
              y={size / 2 - 8}
              rx="8"
              fill="#e2e8f0"
            />

            {/* Visibility bar */}
            <motion.rect
              width="0"
              height="16"
              x="10"
              y={size / 2 - 8}
              rx="8"
              fill="url(#visibilityGradient)"
              initial={{ width: 0 }}
              animate={{ width: ((size - 20) * percentage) / 100 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />

            {/* Scale marks */}
            {[0, 25, 50, 75, 100].map((mark, i) => (
              <g key={i}>
                <line
                  x1={10 + ((size - 20) * mark) / 100}
                  y1={size / 2 + 12}
                  x2={10 + ((size - 20) * mark) / 100}
                  y2={size / 2 + 18}
                  stroke="#64748b"
                  strokeWidth="1.5"
                />
                <text
                  x={10 + ((size - 20) * mark) / 100}
                  y={size / 2 + 28}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  fontWeight="500"
                >
                  {((maxVisibility * mark) / 100).toFixed(0)}
                </text>
              </g>
            ))}

            {/* Eye icon */}
            <g transform={`translate(${size / 2 - 16}, 25)`}>
              <Eye size={32} color={getVisibilityColor(visibility)} />
            </g>
          </svg>
        </div>

        <div className="text-center mt-4 space-y-1">
          <div className="text-3xl font-bold text-gray-800">
            {visibility.toFixed(1)} <span className="text-lg">km</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {getVisibilityStatus(visibility)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

//precipitation:

const PrecipitationCard = ({
  precipitation,
  next24h,
  size = 160,
}: {
  precipitation: number;
  next24h: number;
  size?: number;
}) => {
  const getPrecipitationColor = (amount: number) => {
    if (amount === 0) return "#60a5fa"; // Blue for no precipitation
    if (amount < 0.1) return "#38bdf8"; // Light blue for trace amounts
    if (amount < 0.5) return "#0ea5e9"; // Medium blue for light rain
    return "#0369a1"; // Dark blue for heavier rain
  };

  const getPrecipitationStatus = (amount: number) => {
    if (amount === 0) return "No Precipitation";
    if (amount < 0.1) return "Trace Precipitation";
    if (amount < 0.5) return "Light Rain";
    if (amount < 2) return "Moderate Rain";
    return "Heavy Rain";
  };

  const t = useTranslations();

  return (
    <Card className="h-full bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Umbrella size={16} className="text-blue-600" />
          {t("dashboard.precipitation")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-sm"
          >
            {/* Raindrop visualization */}
            <motion.path
              d={`M${size / 2} 40 L${size / 2 - 20} 80 L${size / 2 + 20} 80 Z`}
              fill={getPrecipitationColor(precipitation)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            />

            {/* Animated falling rain drops */}
            {precipitation > 0 && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.line
                    key={i}
                    x1={size / 4 + (i * size) / 8}
                    y1="30"
                    x2={size / 4 + (i * size) / 8}
                    y2="50"
                    stroke={getPrecipitationColor(precipitation)}
                    strokeWidth="1.5"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: [0, 0.6, 0], y: 80 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "linear",
                    }}
                  />
                ))}
              </>
            )}
          </svg>
        </div>

        <div className="text-center mt-4 space-y-1">
          <div className="text-3xl font-bold text-gray-800">
            {precipitation.toFixed(2)} {t("common.units.mm")}
          </div>
          <Badge variant="secondary" className="text-xs">
            {getPrecipitationStatus(precipitation)}
          </Badge>
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          <div className="font-medium">
            {next24h.toFixed(2)} { t("common.units.mm")}{" "}
            <span className="text-gray-500">{t("common.units.mm")} {t("dashboard.next24h")}</span>
          </div>
          <p className="text-xs mt-2 text-gray-500">
            {precipitation > 0
              ? "Light rain expected in next 24 hours."
              : "No precipitation expected in next 24 hours."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// UV Index Card
const UVIndexCard = ({
  uvIndex,
  maxUvIndex,
  description,
}: {
  uvIndex: number;
  maxUvIndex: number;
  description?: string;
}) => {
  const t = useTranslations();
  const getUVColor = (index: number) => {
    if (index <= 2) return "#4ade80"; // Vibrant green
    if (index <= 5) return "#facc15"; // Bright yellow
    if (index <= 7) return "#fb923c"; // Orange
    if (index <= 10) return "#f87171"; // Coral red
    return "#c084fc"; // Purple
  };

  const getUVStatus = (index: number) => {
    if (index <= 2) return t("weather.uvStatus.low");
    if (index <= 5) return t("weather.uvStatus.moderate");
    if (index <= 7) return t("weather.uvStatus.high");
    if (index <= 10) return t("weather.uvStatus.veryHigh");
    return t("weather.uvStatus.extreme");
  };

 

  const uvPercentage = Math.min((uvIndex / 11) * 100, 100);
  const maxUvPercentage = Math.min((maxUvIndex / 11) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full w-full"
    >
      <Card className="h-full w-full bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-purple-800 text-lg font-bold flex items-center gap-3">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sun size={24} className="text-yellow-500" />
            </motion.div>
            {t("dashboard.uvIndex")}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-60px)] flex flex-col p-4">
          {/* Main UV Display */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              className="relative mb-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 rounded-full bg-yellow-100 blur-md opacity-70"></div>
              <div
                className="relative w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold"
                style={{ backgroundColor: getUVColor(uvIndex), color: uvIndex > 7 ? 'white' : 'black' }}
              >
                {uvIndex}
              </div>
            </motion.div>

            <Badge
              className={`text-lg py-2 px-4 mb-6 ${getUVColor(uvIndex) === "#4ade80" ? "bg-green-100 text-green-800" :
                getUVColor(uvIndex) === "#facc15" ? "bg-yellow-100 text-yellow-800" :
                  getUVColor(uvIndex) === "#fb923c" ? "bg-orange-100 text-orange-800" :
                    getUVColor(uvIndex) === "#f87171" ? "bg-red-100 text-red-800" : "bg-purple-100 text-purple-800"}`}
            >
              {getUVStatus(uvIndex)} {t("dashboard.risk")}
            </Badge>
          </div>

          {/* UV Scale */}
          <div className="w-full mb-6">
            <div className="flex justify-between text-sm font-medium text-purple-800 mb-1">
              <span>{t("weather.uvStatus.low")}</span>
              <span>{t("weather.uvStatus.extreme")}</span>
            </div>
            <div className="relative h-4 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-500 to-red-500 to-purple-500 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 h-full w-1.5 bg-white shadow-md"
                initial={{ left: "0%" }}
                animate={{ left: `${uvPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between text-xs text-purple-600 mt-1">
              <span>{t("weather.uvStatus.low")}</span>
              <span>{t("weather.uvStatus.extreme")}</span>
            </div>
          </div>

          {/* Max UV and Description */}
          <div className="text-center">
            <div className="text-lg font-bold text-purple-800 mb-1">
              {t("weather.uvStatus.peakToday")}: {maxUvIndex} ({getUVStatus(maxUvIndex)})
            </div>
            <motion.p
              className="text-sm text-purple-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {description || `${t("weather.uvStatus.maxUvIndex")} ${getUVStatus(maxUvIndex).toLowerCase()} ${t("weather.uvStatus.uvLavl")}.`}
            </motion.p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Dashboard Component
export default function ProfessionalWeatherDashboard({
  selectedStation,
}: {
  selectedStation: any | null;
}) {
  const { data: session } = useSession();
  // const [selectedMetric, setSelectedMetric] = useState<string>("temperature");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const t = useTranslations();

  // Update the main data fetching with SWR
  const {
    data: weatherData,
    mutate,
  } = useSWR<any[]>(
    () => {
      const stationId =
        session?.user?.role === "super_admin"
          ? selectedStation?.id || session?.user?.station?.id
          : session?.user?.station?.id;

      if (!stationId) return null;

      const today = new Date();
      const startToday = new Date(today);
      startToday.setUTCHours(0, 0, 0, 0);
      const endToday = new Date(today);
      endToday.setUTCHours(23, 59, 59, 999);

      return `/api/daily-summary?startDate=${startToday.toISOString()}&endDate=${endToday.toISOString()}&stationId=${stationId}`;
    },
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      onSuccess: () => {
        setLastUpdated(new Date());
        setIsRefreshing(false);
      },
    }
  );

  const [processedData, setProcessedData] = useState<any[]>([]);

  useEffect(() => {
    if (weatherData && weatherData.length > 0) {
      const processed = weatherData.map((item, index) => {
        const timestamp = new Date(item.ObservingTime.utcTime);
        return {
          time: timestamp.toISOString().substr(11, 8),
          timestamp: timestamp.toISOString(),
          temperature: Number.parseFloat(item.maxTemperature) || 0,
          humidity: Number.parseFloat(item.avRelativeHumidity) || 0,
          pressure: Number.parseFloat(item.avStationPressure) || 1013,
          windSpeed: Number.parseFloat(item.windSpeed) || 0,
          windDirection: Number.parseFloat(item.windDirectionCode) || 0,
          cloudCover: Number.parseFloat(item.avTotalCloud) || 0,
          precipitation: Number.parseFloat(item.totalPrecipitation) || 0,
          visibility: Number.parseFloat(item.lowestVisibility) || 10,
        };
      });
      setProcessedData(processed);
    }
  }, [weatherData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
  };

  const currentData =
    processedData.length > 0
      ? processedData[processedData.length - 1]
      : {
        temperature: 22.5,
        humidity: 65,
        pressure: 1013,
        windSpeed: 8.2,
        windDirection: 180,
        cloudCover: 45,
        precipitation: 0.2,
        visibility: 15,
      };

  const formattedTime = lastUpdated.toLocaleTimeString("en-US", {
    hour12: false,
    timeZone: "UTC",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div>
        <DailySummaryChart />
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Weather Gauges Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <ThermometerGauge
            temperature={currentData.temperature}
            min={-10}
            max={50}
          />

          <HumidityGauge humidity={currentData.humidity} />

          <PressureBarometer pressure={currentData.pressure} />

          <WindCompass
            windSpeed={currentData.windSpeed}
            windDirection={currentData.windDirection}
          />

          <CloudCoverGauge cloudCover={currentData.cloudCover} />

          <PrecipitationCard
            precipitation={currentData.precipitation}
            next24h={0.8}
          />

          <VisibilityGauge visibility={currentData.visibility} />

          <UVIndexCard
            uvIndex={7}
            maxUvIndex={8}
            description={t("weather.uvStatus.maxUvIndex")}
          />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" />
                {t("dashboard.quickOverview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {currentData.temperature.toFixed(1)}°C
                  </div>
                  <div className="text-xs text-red-500 uppercase tracking-wide">
                    {t("dashboard.quickStats.temperature")}
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentData.humidity.toFixed(0)}%
                  </div>
                  <div className="text-xs text-blue-500 uppercase tracking-wide">
                    {t("dashboard.quickStats.humidity")}
                  </div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentData.pressure.toFixed(0)}
                  </div>
                  <div className="text-xs text-purple-500 uppercase tracking-wide">
                    {t("dashboard.quickStats.pressure")}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {currentData.windSpeed.toFixed(1)}
                  </div>
                  <div className="text-xs text-green-500 uppercase tracking-wide">
                    {t("dashboard.quickStats.wind")}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {currentData.cloudCover.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("dashboard.quickStats.clouds")}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {currentData.precipitation.toFixed(0)} mm
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("dashboard.quickStats.precipitation")}
                  </div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {currentData.visibility.toFixed(1)}
                  </div>
                  <div className="text-xs text-amber-500 uppercase tracking-wide">
                    {t("dashboard.quickStats.visibility")}
                  </div>
                </div>

                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">
                    {currentData.uvIndex}
                  </div>
                  <div className="text-xs text-amber-500 uppercase tracking-wide">
                    {t("dashboard.quickStats.uvIndex")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
