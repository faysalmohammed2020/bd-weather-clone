"use client";

import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";

interface Station {
  id: string;
  stationId: string;
  name: string;
  latitude: number;
  longitude: number;
  securityCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function MapControls({
  selectedRegion,
  setSelectedRegion,
  selectedPeriod,
  setSelectedPeriod,
  selectedIndex,
  setSelectedIndex,
  selectedStation,
  setSelectedStation,
}: {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedIndex: string;
  setSelectedIndex: (index: string) => void;
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
}) {
  const { data: session } = useSession();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stations based on user role
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/stations");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setStations(data);

        // If user is station_admin or observer, auto-select their station
        if (
          session?.user?.role === "station_admin" ||
          session?.user?.role === "observer"
        ) {
          const userStation = data.find(
            (station: Station) => station.stationId === session.user.stationId
          );
          if (userStation) {
            setSelectedStation(userStation);
            setSelectedRegion("station");
          }
        }
      } catch (err) {
        setError("Failed to fetch stations");
        console.error("Error fetching stations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [session, setSelectedStation, setSelectedRegion]);

  // Filter stations based on user role
  const permittedStations =
    session?.user.role === "super_admin"
      ? stations
      : stations.filter(
          (station) => station.stationId === session?.user.stationId
        );

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium bg-blue-400 text-white py-2 px-4 mb-4 rounded">
        Map Controls
      </h3>

      <RadioGroup
        value={selectedRegion}
        onValueChange={setSelectedRegion}
        className="mb-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bangladesh" id="bangladesh" />
          <Label htmlFor="bangladesh">Bangladesh</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="station" id="station" />
          <Label htmlFor="station">
            <Select
              value={selectedStation?.stationId || ""}
              onValueChange={(value) => {
                const station = stations.find((s) => s.stationId === value);
                setSelectedStation(station || null);
              }}
              disabled={loading || permittedStations.length === 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={
                    loading
                      ? "Loading..."
                      : permittedStations.length === 0
                        ? "No stations"
                        : "Select Station"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {permittedStations.map((station) => (
                  <SelectItem key={station.id} value={station.stationId}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
        </div>
      </RadioGroup>

      <h4 className="font-medium mb-2">Select Periodicity</h4>
      <RadioGroup
        value={selectedPeriod}
        onValueChange={setSelectedPeriod}
        className="mb-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="Dekad (10 Days)" id="dekad" />
          <Label htmlFor="dekad">Dekad (10 Days)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1 Month" id="month" />
          <Label htmlFor="month">1 Month</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="3 Months" id="3months" />
          <Label htmlFor="3months">3 Months</Label>
        </div>
      </RadioGroup>

      <h4 className="font-medium mb-2">Select 4 Indices</h4>
      <Select value={selectedIndex} onValueChange={setSelectedIndex}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Index" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Rainfall">Rainfall</SelectItem>
          <SelectItem value="Total Evapotranspiration">
            Total Evapotranspiration
          </SelectItem>
          <SelectItem value="Soil Moisture">Soil Moisture</SelectItem>
          <SelectItem value="Temperature">Temperature</SelectItem>
        </SelectContent>
      </Select>

      {error && <div className="mt-4 text-red-600 text-sm">Error: {error}</div>}
    </div>
  );
}

// "use client";

// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useLocation } from "@/contexts/divisionContext";
// import { useSession } from "@/lib/auth-client";

// export default function MapControls({
//   selectedRegion,
//   setSelectedRegion,
//   selectedPeriod,
//   setSelectedPeriod,
//   selectedIndex,
//   setSelectedIndex,
// }: {
//   selectedRegion: string;
//   setSelectedRegion: () => void;
//   selectedPeriod: string;
//   setSelectedPeriod: () => void;
//   selectedIndex: string;
//   setSelectedIndex: () => void;
// }) {
//   const { data: session } = useSession();

//   const {
//     selectedDivision,
//     setSelectedDivision,
//     selectedDistrict,
//     setSelectedDistrict,
//     selectedUpazila,
//     setSelectedUpazila,
//     divisions,
//     districts,
//     upazilas,
//     loading,
//     error,
//   } = useLocation();

//   const permittedDivisions =
//     session?.user.role === "super_admin"
//       ? divisions
//       : divisions.filter(
//           (division) => division.name === session?.user.division
//         );

//   const permittedDistricts =
//     session?.user.role === "super_admin"
//       ? districts
//       : districts.filter(
//           (district) => district.name === session?.user.district
//         );

//   const handleDivisionChange = (value: string) => {
//     const foundDivision = divisions.find((div) => div.name === value);

//     if (foundDivision) {
//       setSelectedDivision(foundDivision);
//       setSelectedDistrict(null); // Reset district when division changes
//       setSelectedUpazila(null); // Reset upazila when division changes
//     } else {
//       setSelectedDivision(null);
//     }
//   };

//   const handleDistrictChange = (value: string) => {
//     const foundDistrict = districts.find((dist) => dist.name === value);
//     if (foundDistrict) {
//       setSelectedDistrict(foundDistrict);
//       setSelectedUpazila(null); // Reset upazila when district changes
//     } else {
//       setSelectedDistrict(null);
//     }
//   };

//   const handleUpazilaChange = (value: string) => {
//     const foundUpazila = upazilas.find((upa) => upa.name === value);
//     if (foundUpazila) {
//       setSelectedUpazila(foundUpazila);
//     } else {
//       setSelectedUpazila(null);
//     }
//   };

//   return (
//     <div className="p-4">
//       <h3 className="text-lg font-medium bg-blue-400 text-white py-2 px-4 mb-4 rounded">
//         Map Controls
//       </h3>

//       <RadioGroup
//         value={selectedRegion}
//         onValueChange={setSelectedRegion}
//         className="mb-4"
//       >
//         <div className="flex items-center space-x-2">
//           <RadioGroupItem value="bangladesh" id="bangladesh" />
//           <Label htmlFor="bangladesh">Bangladesh</Label>
//         </div>
//         <div className="flex items-center space-x-2">
//           <RadioGroupItem value="division" id="division" />
//           <Label htmlFor="division">
//             <Select
//               value={selectedDivision?.name || ""}
//               onValueChange={handleDivisionChange}
//               disabled={loading}
//             >
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue
//                   placeholder={loading ? "Loading..." : "Division"}
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 {permittedDivisions.map((division) => (
//                   <SelectItem key={division.osmId} value={division.name}>
//                     {division.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </Label>
//         </div>
//         {selectedDivision && (
//           <div className="flex items-center space-x-2 ml-6">
//             <RadioGroupItem value="district" id="district" />
//             <Label htmlFor="district">
//               <Select
//                 value={selectedDistrict?.name || ""}
//                 onValueChange={handleDistrictChange}
//                 disabled={loading || !selectedDivision}
//               >
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue
//                     placeholder={
//                       loading && selectedDivision
//                         ? "Loading..."
//                         : "Select District"
//                     }
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {permittedDistricts.map((district) => (
//                     <SelectItem key={district.osmId} value={district.name}>
//                       {district.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </Label>
//           </div>
//         )}
//         {selectedDistrict && (
//           <div className="flex items-center space-x-2 ml-6">
//             <RadioGroupItem value="upazila" id="upazila" />
//             <Label htmlFor="upazila">
//               <Select
//                 value={selectedUpazila?.name || ""}
//                 onValueChange={handleUpazilaChange}
//                 disabled={loading || !selectedDistrict}
//               >
//                 <SelectTrigger className="w-[180px]">
//                   <SelectValue
//                     placeholder={
//                       loading && selectedDistrict
//                         ? "Loading..."
//                         : "Select Upazila"
//                     }
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {upazilas.map((upazila) => (
//                     <SelectItem key={upazila.osmId} value={upazila.name}>
//                       {upazila.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </Label>
//           </div>
//         )}
//       </RadioGroup>

//       <h4 className="font-medium mb-2">Select Periodicity</h4>
//       <RadioGroup
//         value={selectedPeriod}
//         onValueChange={setSelectedPeriod}
//         className="mb-4"
//       >
//         <div className="flex items-center space-x-2">
//           <RadioGroupItem value="Dekad (10 Days)" id="dekad" />
//           <Label htmlFor="dekad">Dekad (10 Days)</Label>
//         </div>
//         <div className="flex items-center space-x-2">
//           <RadioGroupItem value="1 Month" id="month" />
//           <Label htmlFor="month">1 Month</Label>
//         </div>
//         <div className="flex items-center space-x-2">
//           <RadioGroupItem value="3 Months" id="3months" />
//           <Label htmlFor="3months">3 Months</Label>
//         </div>
//       </RadioGroup>

//       <h4 className="font-medium mb-2">Select 4 Indices</h4>
//       <Select value={selectedIndex} onValueChange={setSelectedIndex}>
//         <SelectTrigger className="w-full">
//           <SelectValue placeholder="Select Index" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="Rainfall">Rainfall</SelectItem>
//           <SelectItem value="Total Evapotranspiration">
//             Total Evapotranspiration
//           </SelectItem>
//           <SelectItem value="Soil Moisture">Soil Moisture</SelectItem>
//           <SelectItem value="Temperature">Temperature</SelectItem>
//         </SelectContent>
//       </Select>

//       {error && <div className="mt-4 text-red-600 text-sm">Error: {error}</div>}
//     </div>
//   );
// }
