// MapTilerVectorLayer.tsx
"use client";
import { useEffect } from "react";
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
    styleUrl?: string; // full MapTiler style URL (e.g., https://api.maptiler.com/maps/<id>/style.json?key=...)
    apiKey: string;
}) {
    const map = useMap();

    useEffect(() => {
        // Set the API key
        maptilersdk.config.apiKey = apiKey;

        // Create the layer using the imported maptilerLayer
        const layer = maptilerLayer({
            apiKey: apiKey,
            style: styleUrl ?? style,
            // optional: language, fog, etc.:
            // language: "ar", // Arabic labels, if you prefer
        }).addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, apiKey, style, styleUrl]);

    return null;
}
