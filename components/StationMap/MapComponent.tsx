"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, Minus } from "lucide-react";
import { useSession } from "@/lib/auth-client";

// Station interface matching Prisma model
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

interface MapComponentProps {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  selectedStation: Station | null;
  onStationSelect: (station: Station | null) => void;
}

// Animated live location marker
function LiveLocationMarker({
  station,
}: {
  station: { coordinates: L.LatLngExpression } | null;
}) {
  const map = useMap();
  const [pulseSize, setPulseSize] = useState(10);
  const pulseRef = useRef<L.CircleMarker>(null);

  useEffect(() => {
    if (!station) return;

    // Animation loop
    const interval = setInterval(() => {
      setPulseSize((prev) => (prev >= 30 ? 10 : prev + 2));
    }, 200);

    return () => clearInterval(interval);
  }, [station]);

  useEffect(() => {
    if (pulseRef.current) {
      pulseRef.current.setRadius(pulseSize);
    }
  }, [pulseSize]);

  if (!station) return null;

  return (
    <CircleMarker
      ref={pulseRef}
      center={station.coordinates}
      radius={10}
      pathOptions={{
        fillColor: "#ff0000",
        color: "#ff0000",
        weight: 2,
        opacity: 0.7,
        fillOpacity: 0.3,
      }}
    />
  );
}

function FixLeafletIcons() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/images/marker-icon-2x.png",
      iconUrl: "/images/marker-icon.png",
      shadowUrl: "/images/marker-shadow.png",
    });
  }, []);
  return null;
}

function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1 z-[1000]">
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.zoomIn()}
        className="h-8 w-8 bg-white"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => map.zoomOut()}
        className="h-8 w-8 bg-white"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StationMarkers({
  stations,
  selectedStation,
  onStationSelect,
}: {
  stations: Station[];
  selectedStation: Station | null;
  onStationSelect: (station: Station | null) => void;
}) {
  const map = useMap();
  const { data: session } = useSession();

  const stationIcon = L.icon({
    iconUrl: "/station-icon.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const selectedStationIcon = L.icon({
    iconUrl: "/station-icon.png",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

  // Zoom to selected station
  useEffect(() => {
    if (!selectedStation) {
      map.fitBounds([
        [20.5, 88.0],
        [26.5, 92.5],
      ]);
      return;
    }

    map.flyTo([selectedStation.latitude, selectedStation.longitude], 12, {
      duration: 1,
    });
  }, [selectedStation, map]);

  return (
    <>
      {/* Station markers */}
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={
            selectedStation?.id === station.id
              ? selectedStationIcon
              : stationIcon
          }
          eventHandlers={{
            click: () => onStationSelect(station),
            mouseover: (e) => {
              const marker = e.target;
              marker.openPopup();
            },
            mouseout: (e) => {
              const marker = e.target;
              marker.closePopup();
            },
          }}
        >
          <Popup
            className="min-w-[200px]"
            autoClose={false}
            closeOnClick={false}
          >
            <div className="font-bold text-lg">{station.name}</div>
            <div className="text-sm">Station ID: {station.stationId}</div>
            <div className="text-sm">
              Coordinates: {station.latitude.toFixed(4)},{" "}
              {station.longitude.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Live location animation */}
      {selectedStation && (
        <LiveLocationMarker
          station={{
            coordinates: [selectedStation.latitude, selectedStation.longitude],
          }}
        />
      )}
    </>
  );
}

export default function MapComponent({
  currentDate,
  setCurrentDate,
  isPlaying,
  setIsPlaying,
  selectedStation,
  onStationSelect,
}: MapComponentProps) {
  const dates = [
    "18-Oct",
    "19-Nov",
    "19-Dec",
    "19-Jan",
    "19-Feb",
    "19-Mar",
    "19-Apr",
    "19-May",
    "19-Jun",
  ];
  const { data: session } = useSession();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch stations from API based on user role
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/stations");
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setStations(data);

        // If user is station_admin or observer, auto-select their station
        if (
          (session?.user?.role === "station_admin" ||
            session?.user?.role === "observer") &&
          !selectedStation
        ) {
          const userStation = data.find(
            (station: Station) => station.stationId === session.user.stationId
          );
          if (userStation) {
            onStationSelect(userStation);
          }
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [session, selectedStation, onStationSelect]);

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div className="h-[500px] w-full rounded-lg overflow-hidden border-2 border-gray-200">
        <MapContainer
          center={[23.685, 90.3563]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          minZoom={6}
          maxBounds={[
            [20.5, 88.0],
            [26.5, 92.5],
          ]}
        >
          <FixLeafletIcons />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <StationMarkers
            stations={stations}
            selectedStation={selectedStation}
            onStationSelect={onStationSelect}
          />
          <CustomZoomControl />
        </MapContainer>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-[1000]">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            Loading stations...
          </div>
        </div>
      )}

      {/* Timeline Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant={isPlaying ? "default" : "outline"}
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-9 w-9"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[dates.indexOf(currentDate)]}
            max={dates.length - 1}
            step={1}
            onValueChange={(value) => setCurrentDate(dates[value[0]])}
            className="flex-1 mx-2"
          />
          <div className="w-20 text-center font-medium text-sm bg-gray-100 py-1 px-2 rounded">
            {currentDate}
          </div>
        </div>
      </div>

      {/* User role indicator */}
      <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
        <div className="text-sm font-medium">
          {session?.user?.role === "super_admin"
            ? "Super Admin"
            : session?.user?.role === "station_admin"
              ? "Station Admin"
              : session?.user?.role === "observer"
                ? "Observer"
                : "Guest"}
        </div>
        <div className="text-xs text-gray-500">
          {session?.user?.role === "super_admin"
            ? "Viewing all stations"
            : session?.user?.role === "station_admin" ||
                session?.user?.role === "observer"
              ? "Viewing your assigned station"
              : "No stations available"}
        </div>
      </div>

      {/* Selected station info */}
      {selectedStation && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
          <div className="text-sm font-medium">{selectedStation.name}</div>
          <div className="text-xs text-gray-500">
            Lat: {selectedStation.latitude.toFixed(4)}, Long:{" "}
            {selectedStation.longitude.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import { useState, useEffect, useRef } from "react";
// import {
//   MapContainer,
//   Marker,
//   Popup,
//   TileLayer,
//   useMap,
//   CircleMarker,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import { Slider } from "@/components/ui/slider";
// import { Button } from "@/components/ui/button";
// import { Play, Pause, Plus, Minus } from "lucide-react";
// import { useSession } from "@/lib/auth-client";

// // Station interface matching Prisma model
// interface Station {
//   id: string;
//   stationId: string;
//   name: string;
//   latitude: number;
//   longitude: number;
//   securityCode: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// interface MapComponentProps {
//   currentDate: string;
//   setCurrentDate: (date: string) => void;
//   isPlaying: boolean;
//   setIsPlaying: (playing: boolean) => void;
//   selectedStation: Station | null;
// }

// // Animated live location marker
// function LiveLocationMarker({
//   station,
// }: {
//   station: { coordinates: L.LatLngExpression } | null;
// }) {
//   const map = useMap();
//   const [pulseSize, setPulseSize] = useState(10);
//   const pulseRef = useRef<L.CircleMarker>(null);

//   useEffect(() => {
//     if (!station) return;

//     // Animation loop
//     const interval = setInterval(() => {
//       setPulseSize((prev) => (prev >= 30 ? 10 : prev + 2));
//     }, 200);

//     return () => clearInterval(interval);
//   }, [station]);

//   useEffect(() => {
//     if (pulseRef.current) {
//       pulseRef.current.setRadius(pulseSize);
//     }
//   }, [pulseSize]);

//   if (!station) return null;

//   return (
//     <CircleMarker
//       ref={pulseRef}
//       center={station.coordinates}
//       radius={10}
//       pathOptions={{
//         fillColor: "#ff0000",
//         color: "#ff0000",
//         weight: 2,
//         opacity: 0.7,
//         fillOpacity: 0.3,
//       }}
//     />
//   );
// }

// function FixLeafletIcons() {
//   useEffect(() => {
//     delete (L.Icon.Default.prototype as any)._getIconUrl;
//     L.Icon.Default.mergeOptions({
//       iconRetinaUrl: "/images/marker-icon-2x.png",
//       iconUrl: "/images/marker-icon.png",
//       shadowUrl: "/images/marker-shadow.png",
//     });
//   }, []);
//   return null;
// }

// function CustomZoomControl() {
//   const map = useMap();
//   return (
//     <div className="absolute top-2 left-2 flex flex-col gap-1 z-[1000]">
//       <Button
//         size="icon"
//         variant="secondary"
//         onClick={() => map.zoomIn()}
//         className="h-8 w-8 bg-white"
//       >
//         <Plus className="h-4 w-4" />
//       </Button>
//       <Button
//         size="icon"
//         variant="secondary"
//         onClick={() => map.zoomOut()}
//         className="h-8 w-8 bg-white"
//       >
//         <Minus className="h-4 w-4" />
//       </Button>
//     </div>
//   );
// }

// function StationMarkersAndBoundaries() {
//   const map = useMap();
//   const [stations, setStations] = useState<Station[]>([]);
//   const [selectedStation, setSelectedStation] = useState<Station | null>(null);
//   const [loading, setLoading] = useState(false);
//   const { data: session } = useSession();

//   // Fetch stations from API based on user role
//   useEffect(() => {
//     const fetchStations = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch("/api/stations");
//         if (!response.ok) {
//           throw new Error(`Error: ${response.status}`);
//         }
//         const data = await response.json();
//         setStations(data);

//         // If user is station_admin or observer, auto-select their station
//         if (
//           session?.user?.role === "station_admin" ||
//           session?.user?.role === "observer"
//         ) {
//           if (data.length === 1) {
//             setSelectedStation(data[0]);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching stations:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStations();
//   }, [session]);

//   const stationIcon = L.icon({
//     iconUrl: "/station-icon.png",
//     iconSize: [32, 32],
//     iconAnchor: [16, 16],
//   });

//   const selectedStationIcon = L.icon({
//     iconUrl: "/station-icon.png",
//     iconSize: [48, 48],
//     iconAnchor: [24, 24],
//   });

//   // Zoom to selected station
//   useEffect(() => {
//     if (!selectedStation) {
//       map.fitBounds([
//         [20.5, 88.0],
//         [26.5, 92.5],
//       ]);
//       return;
//     }

//     map.flyTo([selectedStation.latitude, selectedStation.longitude], 12, {
//       duration: 1,
//     });
//   }, [selectedStation, map]);

//   return (
//     <>
//       {/* Station markers */}
//       {stations.map((station) => (
//         <Marker
//           key={station.id}
//           position={[station.latitude, station.longitude]}
//           icon={
//             selectedStation?.id === station.id
//               ? selectedStationIcon
//               : stationIcon
//           }
//           eventHandlers={{
//             click: () => setSelectedStation(station),
//           }}
//         >
//           <Popup className="min-w-[200px]">
//             <div className="font-bold text-lg">{station.name}</div>
//             <div className="text-sm">Station ID: {station.stationId}</div>
//             <div className="text-sm">
//               Coordinates: {station.latitude.toFixed(4)},{" "}
//               {station.longitude.toFixed(4)}
//             </div>
//           </Popup>
//         </Marker>
//       ))}

//       {/* Live location animation */}
//       {selectedStation && (
//         <LiveLocationMarker
//           station={{
//             coordinates: [selectedStation.latitude, selectedStation.longitude],
//           }}
//         />
//       )}

//       {/* Loading indicator */}
//       {loading && (
//         <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-[1000]">
//           <div className="bg-white p-4 rounded-lg shadow-lg">
//             Loading stations...
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default function MapComponent({
//   currentDate,
//   setCurrentDate,
//   isPlaying,
//   setIsPlaying,
// }: {
//   currentDate: string;
//   setCurrentDate: (date: string) => void;
//   isPlaying: boolean;
//   setIsPlaying: (playing: boolean) => void;
// }) {
//   const dates = [
//     "18-Oct",
//     "19-Nov",
//     "19-Dec",
//     "19-Jan",
//     "19-Feb",
//     "19-Mar",
//     "19-Apr",
//     "19-May",
//     "19-Jun",
//   ];
//   const { data: session } = useSession();

//   return (
//     <div className="relative h-full w-full">
//       {/* Map Container */}
//       <div className="h-[500px] w-full rounded-lg overflow-hidden border-2 border-gray-200">
//         <MapContainer
//           center={[23.685, 90.3563]}
//           zoom={7}
//           style={{ height: "100%", width: "100%" }}
//           zoomControl={false}
//           minZoom={6}
//           maxBounds={[
//             [20.5, 88.0],
//             [26.5, 92.5],
//           ]}
//         >
//           <FixLeafletIcons />
//           <TileLayer
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
//           <StationMarkersAndBoundaries />
//           <CustomZoomControl />
//         </MapContainer>
//       </div>

//       {/* Timeline Controls */}
//       <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
//         <div className="flex items-center gap-3">
//           <Button
//             size="icon"
//             variant={isPlaying ? "default" : "outline"}
//             onClick={() => setIsPlaying(!isPlaying)}
//             className="h-9 w-9"
//           >
//             {isPlaying ? (
//               <Pause className="h-4 w-4" />
//             ) : (
//               <Play className="h-4 w-4" />
//             )}
//           </Button>
//           <Slider
//             value={[dates.indexOf(currentDate)]}
//             max={dates.length - 1}
//             step={1}
//             onValueChange={(value) => setCurrentDate(dates[value[0]])}
//             className="flex-1 mx-2"
//           />
//           <div className="w-20 text-center font-medium text-sm bg-gray-100 py-1 px-2 rounded">
//             {currentDate}
//           </div>
//         </div>
//       </div>

//       {/* User role indicator */}
//       <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-[1000]">
//         <div className="text-sm font-medium">
//           {session?.user?.role === "super_admin"
//             ? "Super Admin"
//             : session?.user?.role === "station_admin"
//               ? "Station Admin"
//               : session?.user?.role === "observer"
//                 ? "Observer"
//                 : "Guest"}
//         </div>
//         <div className="text-xs text-gray-500">
//           {session?.user?.role === "super_admin"
//             ? "Viewing all stations"
//             : session?.user?.role === "station_admin" ||
//                 session?.user?.role === "observer"
//               ? "Viewing your assigned station"
//               : "No stations available"}
//         </div>
//       </div>
//     </div>
//   );
// }
