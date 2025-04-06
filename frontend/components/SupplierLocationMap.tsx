"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define the props for the component
interface SupplierLocationMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  name: string;
}

// Create a custom icon for the supplier marker
const createSupplierIcon = () => {
  return L.icon({
    iconUrl: "/images/supplier-marker.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    // Fallback to default Leaflet icon if custom icon fails to load
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

export default function SupplierLocationMap({
  coordinates,
  name,
}: SupplierLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Skip if no coordinates or map container
    if (!coordinates || !mapRef.current) return;

    // Clean up previous map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Create a new map instance
    const map = L.map(mapRef.current).setView(
      [coordinates.lat, coordinates.lng],
      13
    );

    // Add the OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Try to use custom icon, fallback to default if it fails
    let markerIcon;
    try {
      markerIcon = createSupplierIcon();
    } catch (error) {
      console.error("Failed to create custom icon, using default", error);
      markerIcon = new L.Icon.Default();
    }

    // Add a marker for the supplier location
    const marker = L.marker([coordinates.lat, coordinates.lng], {
      icon: markerIcon,
    }).addTo(map);

    // Add a popup with the supplier name
    marker.bindPopup(`<b>${name}</b>`).openPopup();

    // Store the map instance for cleanup
    mapInstanceRef.current = map;

    // Fix the map display issue by triggering a resize after a short delay
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    // Clean up on component unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates, name]);

  return (
    <div ref={mapRef} className="h-full w-full rounded-md overflow-hidden" />
  );
}
