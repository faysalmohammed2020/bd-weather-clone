// MapTilerVectorLayer.tsx
"use client";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { maptilerLayer } from "@maptiler/leaflet-maptilersdk";
import * as maptilersdk from "@maptiler/sdk";

// Define the available style types
type MapTilerStyle = 
  | 'STREETS' | 'OUTDOOR' | 'SATELLITE' | 'WINTER' | 'HYBRID' | 'BRIGHT'
  | 'TOPO' | 'VESKIA' | 'VESKIA_DARK' | 'VESKIA_HYBRID' | 'VESKIA_SATELLITE'
  | 'VESKIA_STREETS' | 'VESKIA_TERRAIN' | 'VESKIA_TOPO' | 'VESKIA_VOYAGER';

export default function MapTilerVectorLayer({
  style = 'STREETS',
  styleUrl,
  apiKey,
}: {
  style?: MapTilerStyle;
  styleUrl?: string;
  apiKey: string;
}) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // Set the API key
    maptilersdk.config.apiKey = apiKey;

    // Remove existing layer if it exists
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    try {
      // Create the layer with error handling
      const layer = maptilerLayer({
        apiKey: apiKey,
        style: styleUrl || style.toLowerCase(),
        language: "ar"
      }).addTo(map);

      layerRef.current = layer;
    } catch (error) {
      console.error("Error initializing MapTiler layer:", error);
    }

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, apiKey, style, styleUrl]);

  return null;
}
