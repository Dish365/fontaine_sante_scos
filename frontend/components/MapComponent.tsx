"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Route, Supplier, Warehouse } from "@/types/types";
import { Loader2 } from "lucide-react";

// Define the props interface
interface MapComponentProps {
  routes: Route[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  transportModes: Record<
    string,
    {
      color: string;
      name: string;
      icon: React.ComponentType;
    }
  >;
  onRouteSelect?: (route: Route) => void;
}

// Helper function to get coordinates regardless of format
const getCoordinates = (location: any): [number, number] => {
  if (!location || !location.coordinates) {
    return [0, 0]; // Default fallback
  }

  const coords = location.coordinates;

  // Handle both formats: {lat, lng} and {latitude, longitude}
  const lat = coords.latitude !== undefined ? coords.latitude : coords.lat;
  const lng = coords.longitude !== undefined ? coords.longitude : coords.lng;

  return [lat, lng];
};

// Create custom marker icons
const createCustomIcon = (color: string, type: "supplier" | "warehouse") => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background-color: ${color};
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
      "></div>
      <div style="
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: rgba(255,255,255,0.5);
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transform: translate(50%, 50%);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapComponent: React.FC<MapComponentProps> = ({
  routes,
  suppliers,
  warehouses,
  transportModes,
  onRouteSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize the map
  useEffect(() => {
    // Only initialize if the container exists and map hasn't been initialized yet
    if (mapContainerRef.current && !mapInstanceRef.current) {
      try {
        console.log("Initializing map...");
        setLoading(true);

        // Create the map instance
        const mapInstance = L.map(mapContainerRef.current, {
          center: [40, -95], // Center on North America initially
          zoom: 3,
          zoomControl: true,
          attributionControl: true,
        });

        // Add the tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        // Store the map instance in the ref
        mapInstanceRef.current = mapInstance;

        // Set a small timeout to ensure the map is fully initialized
        setTimeout(() => {
          setMapInitialized(true);
          setLoading(false);
          console.log("Map initialized successfully");
        }, 500);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Failed to initialize map. Please try refreshing the page.");
        setLoading(false);
      }
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        console.log("Cleaning up map...");
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapInitialized(false);
      }
    };
  }, []);

  // Add markers and routes once the map is initialized
  useEffect(() => {
    if (!mapInitialized || !mapInstanceRef.current) {
      return;
    }

    try {
      console.log("Adding markers and routes to map...");
      const map = mapInstanceRef.current;
      const supplierMarkers: L.Marker[] = [];
      const warehouseMarkers: L.Marker[] = [];
      const routeLines: L.Polyline[] = [];

      // Add supplier markers
      suppliers.forEach((supplier) => {
        if (supplier.location) {
          const [lat, lng] = getCoordinates(supplier.location);
          console.log(`Supplier ${supplier.name} coordinates:`, lat, lng);

          const marker = L.marker([lat, lng], {
            icon: createCustomIcon("#3b82f6", "supplier"),
            title: supplier.name,
          })
            .addTo(map)
            .bindPopup(`<b>Supplier:</b> ${supplier.name}`);
          supplierMarkers.push(marker);
        }
      });

      // Add warehouse markers
      warehouses.forEach((warehouse) => {
        if (warehouse.location) {
          const [lat, lng] = getCoordinates(warehouse.location);
          console.log(`Warehouse ${warehouse.name} coordinates:`, lat, lng);

          const marker = L.marker([lat, lng], {
            icon: createCustomIcon("#ef4444", "warehouse"),
            title: warehouse.name,
          })
            .addTo(map)
            .bindPopup(`<b>Warehouse:</b> ${warehouse.name}`);
          warehouseMarkers.push(marker);
        }
      });

      // Add route lines
      routes.forEach((route) => {
        const supplier = suppliers.find((s) => s.id === route.supplierId);
        const warehouse = warehouses.find((w) => w.id === route.warehouseId);

        if (supplier?.location && warehouse?.location) {
          const supplierCoords = getCoordinates(supplier.location);
          const warehouseCoords = getCoordinates(warehouse.location);

          const transportMode = route.transport.mode;
          const color = transportModes[transportMode]?.color || "#94a3b8";

          const routeLine = L.polyline([supplierCoords, warehouseCoords], {
            color: color,
            weight: 3,
            opacity: 0.7,
            dashArray: transportMode === "airplane" ? "5, 5" : "",
          })
            .addTo(map)
            .bindPopup(
              `<b>Route:</b> ${supplier.name} to ${warehouse.name}<br>
               <b>Transport:</b> ${
                 transportModes[transportMode]?.name || "Unknown"
               }<br>
               <b>Distance:</b> ${route.transport.distance} km`
            );

          // Add click handler for route selection
          routeLine.on("click", () => {
            if (onRouteSelect) {
              onRouteSelect(route);
            }
          });

          routeLines.push(routeLine);
        }
      });

      // Fit bounds to show all markers if we have any
      if (supplierMarkers.length > 0 || warehouseMarkers.length > 0) {
        const allMarkers = [...supplierMarkers, ...warehouseMarkers];
        const bounds = L.featureGroup(allMarkers).getBounds();
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      // Cleanup function for this effect
      return () => {
        supplierMarkers.forEach((marker) => marker.remove());
        warehouseMarkers.forEach((marker) => marker.remove());
        routeLines.forEach((line) => line.remove());
      };
    } catch (err) {
      console.error("Error adding elements to map:", err);
      setError(
        "Failed to display routes on the map. Please try refreshing the page."
      );
    }
  }, [
    mapInitialized,
    routes,
    suppliers,
    warehouses,
    transportModes,
    onRouteSelect,
  ]);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <p className="text-red-500">{error}</p>
          <button
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing map...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className="h-full w-full" />;
};

export default MapComponent;
