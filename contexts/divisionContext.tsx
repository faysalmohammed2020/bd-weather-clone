"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { LatLngExpression } from "leaflet";
import axios from "axios";

// Public global Overpass instances. Queries fall through when one is busy.
const OVERPASS_APIS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// Admin levels in Bangladesh
const ADMIN_LEVELS = {
  DIVISION: "4", // Divisions
  DISTRICT: "5", // Districts/Zillas
  UPAZILA: "6", // Upazilas/Thanas
};

const BANGLADESH_DIVISIONS: AdministrativeArea[] = [
  { name: "Dhaka", osmId: 3921322, coordinates: [23.7779, 90.3995], adminLevel: ADMIN_LEVELS.DIVISION },
  { name: "Chittagong", osmId: 3824588, coordinates: [22.3569, 91.7832], adminLevel: ADMIN_LEVELS.DIVISION },
  { name: "Mymensingh", osmId: 7318343, coordinates: [24.7145, 90.4069], adminLevel: ADMIN_LEVELS.DIVISION },
  { name: "Khulna", osmId: 3825003, coordinates: [22.8456, 89.5403], adminLevel: ADMIN_LEVELS.DIVISION },
  { name: "Rajshahi", osmId: 3859335, coordinates: [24.3745, 88.6042], adminLevel: ADMIN_LEVELS.DIVISION },
  { name: "Sylhet", osmId: 3921222, coordinates: [24.8949, 91.8687], adminLevel: ADMIN_LEVELS.DIVISION },
  { name: "Barishal", osmId: 3921298, coordinates: [22.701, 90.3535], adminLevel: ADMIN_LEVELS.DIVISION },
  { name: "Rangpur", osmId: 3921211, coordinates: [25.7439, 89.2532], adminLevel: ADMIN_LEVELS.DIVISION },
];

interface AdministrativeArea {
  name: string;
  osmId: number;
  coordinates: LatLngExpression;
  geometry?: any; // For storing raw geometry data
  adminLevel: string;
  parentId?: number;
}

interface LocationContextType {
  selectedDivision: AdministrativeArea | null;
  setSelectedDivision: (division: AdministrativeArea | null) => void;
  selectedDistrict: AdministrativeArea | null;
  setSelectedDistrict: (district: AdministrativeArea | null) => void;
  selectedUpazila: AdministrativeArea | null;
  setSelectedUpazila: (upazila: AdministrativeArea | null) => void;
  divisions: AdministrativeArea[];
  districts: AdministrativeArea[];
  upazilas: AdministrativeArea[];
  loading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType>({
  selectedDivision: null,
  setSelectedDivision: () => {},
  selectedDistrict: null,
  setSelectedDistrict: () => {},
  selectedUpazila: null,
  setSelectedUpazila: () => {},
  divisions: [],
  districts: [],
  upazilas: [],
  loading: false,
  error: null,
});

// Helper function to build Overpass queries with specific relation IDs
const buildQuery = (relationId: number, adminLevel: string): string => {
  return `
    [out:json][timeout:90];
    // Get the relation with the specified ID
    relation(${relationId});
    // Convert to area
    map_to_area;
    // Find all administrative boundaries within this area with the specified admin_level
    relation[boundary=administrative][admin_level=${adminLevel}](area);
    // Get all data including geometry
    out body geom;
  `;
};

// Fetch administrative boundaries using Overpass API
const fetchBoundaries = async (query: string): Promise<any[]> => {
  for (const endpoint of OVERPASS_APIS) {
    try {
      const response = await axios.post(endpoint, query, {
        timeout: 30_000,
        headers: {
          "Content-Type": "text/plain",
          Accept: "application/json",
        },
      });
      return response.data.elements || [];
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const canRetry =
        status === undefined || [429, 502, 503, 504].includes(status);
      if (!canRetry) return [];
    }
  }

  return [];
};

// Function to handle irregular geometry data
const processGeometry = (element: any): any[] => {
  if (element.geometry && Array.isArray(element.geometry)) {
    return element.geometry;
  }

  if (element.members && Array.isArray(element.members)) {
    const geometryPoints = [];
    element.members
      .filter((member: any) => member.type === "way" && member.geometry)
      .forEach((member: any) => {
        if (Array.isArray(member.geometry)) {
          geometryPoints.push(...member.geometry);
        }
      });
    return geometryPoints;
  }

  return [];
};

// Calculate the center point of a geometry
const calculateCenter = (geometry: any[]): LatLngExpression => {
  if (!geometry || geometry.length === 0) {
    return [23.685, 90.3563]; // Default center for Bangladesh
  }

  const validPoints = geometry.filter(
    (point) =>
      point && typeof point.lat === "number" && typeof point.lon === "number"
  );

  if (validPoints.length === 0) {
    return [23.685, 90.3563];
  }

  let totalLat = 0,
    totalLon = 0;
  validPoints.forEach((point) => {
    totalLat += point.lat;
    totalLon += point.lon;
  });

  return [totalLat / validPoints.length, totalLon / validPoints.length];
};

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [divisions] = useState<AdministrativeArea[]>(BANGLADESH_DIVISIONS);
  const [districts, setDistricts] = useState<AdministrativeArea[]>([]);
  const [upazilas, setUpazilas] = useState<AdministrativeArea[]>([]);

  const [selectedDivision, setSelectedDivision] =
    useState<AdministrativeArea | null>(null);
  const [selectedDistrict, setSelectedDistrict] =
    useState<AdministrativeArea | null>(null);
  const [selectedUpazila, setSelectedUpazila] =
    useState<AdministrativeArea | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load districts when division is selected
  useEffect(() => {
    if (!selectedDivision) {
      setDistricts([]);
      setSelectedDistrict(null);
      return;
    }

    const loadDistricts = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = buildQuery(selectedDivision.osmId, ADMIN_LEVELS.DISTRICT);
        const elements = await fetchBoundaries(query);

        if (elements.length === 0) {
          setError(`No districts found for ${selectedDivision.name}.`);
          setDistricts([]);
          return;
        }

        const processedDistricts = elements.map((element) => {
          const name = element.tags["name:en"];
          const geometry = processGeometry(element);
          const coordinates = calculateCenter(geometry);

          return {
            name,
            osmId: element.id,
            coordinates,
            geometry,
            adminLevel: ADMIN_LEVELS.DISTRICT,
            parentId: selectedDivision.osmId,
          };
        });

        setDistricts(processedDistricts);
      } catch (err) {
        console.error("Error loading districts:", err);
        setError("Failed to load districts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadDistricts();
  }, [selectedDivision]);

  // Load upazilas when district is selected
  useEffect(() => {
    if (!selectedDistrict) {
      setUpazilas([]);
      setSelectedUpazila(null);
      return;
    }

    const loadUpazilas = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = buildQuery(selectedDistrict.osmId, ADMIN_LEVELS.UPAZILA);
        const elements = await fetchBoundaries(query);

        if (elements.length === 0) {
          setError(`No upazilas found for ${selectedDistrict.name}.`);
          setUpazilas([]);
          return;
        }

        const processedUpazilas = elements.map((element) => {
          const name = element.tags["name:en"];
          const geometry = processGeometry(element);
          const coordinates = calculateCenter(geometry);

          return {
            name,
            osmId: element.id,
            coordinates,
            geometry,
            adminLevel: ADMIN_LEVELS.UPAZILA,
            parentId: selectedDistrict.osmId,
          };
        });

        setUpazilas(processedUpazilas);
      } catch (err) {
        console.error("Error loading upazilas:", err);
        setError("Failed to load upazilas. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadUpazilas();
  }, [selectedDistrict]);

  return (
    <LocationContext.Provider
      value={{
        selectedDivision,
        setSelectedDivision,
        selectedDistrict,
        setSelectedDistrict,
        selectedUpazila,
        setSelectedUpazila,
        divisions,
        districts,
        upazilas,
        loading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
