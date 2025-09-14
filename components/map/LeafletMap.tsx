"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Optional: Fix default marker icons for Next.js if needed
// delete (L.Icon.Default.prototype as any)._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: "/leaflet/marker-icon-2x.png",
//   iconUrl: "/leaflet/marker-icon.png",
//   shadowUrl: "/leaflet/marker-shadow.png",
// })

export default function LeafletMap() {
  // Guard against SSR (no-op, component is client-only)
  useEffect(() => {}, [])

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden">
      <MapContainer center={[31.24, 36.51]} zoom={7} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[31.95, 35.93]}>
          <Popup>Amman, Jordan</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
