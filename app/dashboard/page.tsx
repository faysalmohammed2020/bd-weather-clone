"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import RainfallChart from "@/components/charts/rainfall-chart";
import EvapotranspirationChart from "@/components/charts/evapotranspiration-chart";
import SoilMoistureChart from "@/components/charts/soil-moisture-chart";
import TemperatureChart from "@/components/charts/temperature-chart";
import { Station } from "@prisma/client";
import WeatherDashboard from "@/components/msn-weather";

const MapComponent = dynamic(
  () => import("@/components/StationMap/MapComponent"),
  { ssr: false }
);

const MapControls = dynamic(() => import("@/components/map/map-controls"), {
  ssr: false,
});

export default function DroughtDashboard() {
  const [selectedRegion, setSelectedRegion] = useState("Bangladesh");
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [selectedPeriod, setSelectedPeriod] = useState("1 Month");
  const [selectedIndex, setSelectedIndex] = useState("Rainfall");
  const [currentDate, setCurrentDate] = useState("18-Oct");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  return (
    <div className="flex flex-col h-screen">
      <div className="grid grid-cols-5 rounded-lg shadow mb-4">
        <div className="col-span-1">
          <MapControls
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
          />
        </div>

        <div className="col-span-4 p-4">
          <MapComponent
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            selectedStation={selectedStation}
            onStationSelect={setSelectedStation}
          />
        </div>
      </div>

      <div className="md:col-span-2 grid grid-cols-1 gap-4 p-4">
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-2">Rainfall (mm/day)</h3>
            <RainfallChart />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-2">
              Total Evapotranspiration (mm/day)
            </h3>
            <EvapotranspirationChart />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium mb-2">Temperature (°C)</h3>
            <TemperatureChart />
          </div>
        </div> */}

        <WeatherDashboard />
      </div>
    </div>
  );
}
