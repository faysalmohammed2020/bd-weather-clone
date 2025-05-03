"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import MapControls from "@/components/map/map-controls";
import RainfallChart from "@/components/charts/rainfall-chart";
import EvapotranspirationChart from "@/components/charts/evapotranspiration-chart";
import SoilMoistureChart from "@/components/charts/soil-moisture-chart";
import TemperatureChart from "@/components/charts/temperature-chart";

const MapComponent = dynamic(() => import("@/components/map"), { ssr: false });

export default function DroughtDashboard() {
  const [selectedRegion, setSelectedRegion] = useState("Bangladesh");
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [selectedPeriod, setSelectedPeriod] = useState("1 Month");
  const [selectedIndex, setSelectedIndex] = useState("Rainfall");
  const [currentDate, setCurrentDate] = useState("19-Mar");

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 flex-grow overflow-auto">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow mb-4">
            <MapControls
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
            />
            {/* <MapComponent /> */}
          </div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <h3 className="text-lg font-medium bg-blue-400 text-white py-2 px-4 mb-4 rounded">
                About
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                ICIMOD is developing an integrated information platform linking
                weather and climate data with agriculture practices in the
                region. The platform provides data analysis support to
                professionals responsible for developing response strategies to
                drought conditions.
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 gap-4">
          <div className="bg-white rounded-lg shadow">
            <MapComponent
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <h3 className="text-lg font-medium mb-2">
                Soil Moisture (kg/m²)
              </h3>
              <SoilMoistureChart />
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium mb-2">Temperature (°C)</h3>
              <TemperatureChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
