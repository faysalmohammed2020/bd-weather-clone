"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Station } from "@prisma/client";
import WeatherDashboard from "@/components/msn-weather";
import type { MapComponentProps } from "@/components/map/MapComponent";
import { LocationProvider } from "@/contexts/divisionContext";

const MapComponent = dynamic<MapComponentProps>(
  () => import("@/components/map/MapComponent").then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100">Loading map...</div>
  }
);

const MapControls = dynamic(() => import("@/components/map/map-controls"), {
  ssr: false,
});

export default function DroughtDashboard() {
  const [selectedRegion, setSelectedRegion] = useState("Bangladesh");
  const [selectedPeriod, setSelectedPeriod] = useState("1 Month");
  const [selectedIndex, setSelectedIndex] = useState("Rainfall");
  const [currentDate, setCurrentDate] = useState("18-Oct");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  return (
    <LocationProvider>
      <div className="flex flex-col h-screen">
        {/* Responsive Layout for Controls and Map */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Controls */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
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

          {/* MapComponent - Takes remaining space */}
          <div className="flex-1 relative">
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

        {/* <div className="grid grid-cols-1 gap-4 md:p-4 ">
        <WeatherDashboard selectedStation={selectedStation} />
      </div> */}
      </div>
    </LocationProvider>
  );
}
