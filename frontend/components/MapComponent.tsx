"use client";

import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Route, Supplier, Warehouse } from "@/types/types";
import { Loader2 } from "lucide-react";
// Import Leaflet directly for client-side only
import type {
  Map,
  DivIcon,
  FeatureGroup,
  LatLngBounds,
  Marker,
  Polyline,
} from "leaflet";

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

// Define a location interface to avoid using 'any'
interface LocationCoordinates {
  coordinates: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
  };
}

const MapComponent: React.FC<MapComponentProps> = ({
  routes,
  suppliers,
  warehouses,
  transportModes,
  onRouteSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [containerReady, setContainerReady] = useState(false);

  // Add debug logging function
  const addDebugInfo = (message: string) => {
    console.log(message);
    setDebugInfo((prev) => [...prev, message]);
  };

  // Cleanup function for the map
  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      addDebugInfo("Cleaning up map...");
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  // Check if the container is ready
  useLayoutEffect(() => {
    if (mapContainerRef.current) {
      setContainerReady(true);
      addDebugInfo("Map container is ready");
    } else {
      addDebugInfo("Map container not ready yet");
    }
  }, []);

  // Initialize the map
  useEffect(() => {
    // Only initialize if the container is ready
    if (!containerReady) {
      return;
    }

    // Clean up previous map instance if it exists
    cleanupMap();

    // Reset state for new initialization
    setLoading(true);
    setError(null);

    addDebugInfo("Starting map initialization");
    addDebugInfo(
      `Routes: ${routes.length}, Suppliers: ${suppliers.length}, Warehouses: ${warehouses.length}`
    );

    const initMap = async () => {
      try {
        addDebugInfo("Importing Leaflet...");

        // Dynamically import Leaflet to avoid SSR issues
        const L = await import("leaflet");
        addDebugInfo("Leaflet imported successfully");

        // Add Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          addDebugInfo("Adding Leaflet CSS...");
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
          addDebugInfo("Leaflet CSS added");
        }

        // Double check the container is still available
        if (!mapContainerRef.current) {
          throw new Error("Map container not found or was removed");
        }

        // Ensure the container has dimensions
        const containerWidth = mapContainerRef.current.clientWidth;
        const containerHeight = mapContainerRef.current.clientHeight;

        if (containerWidth === 0 || containerHeight === 0) {
          addDebugInfo(
            `Container dimensions: ${containerWidth}x${containerHeight}`
          );
          throw new Error("Map container has zero dimensions");
        }

        addDebugInfo(
          `Creating map instance in container with dimensions: ${containerWidth}x${containerHeight}`
        );

        // Create the map instance
        const mapInstance = L.map(mapContainerRef.current, {
          center: [45.5017, -73.5673], // Center on Montreal initially
          zoom: 4,
          zoomControl: true,
          attributionControl: true,
        });

        // Store the map instance in the ref
        mapInstanceRef.current = mapInstance;

        addDebugInfo("Map instance created");

        // Add the tile layer
        addDebugInfo("Adding tile layer...");
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance);
        addDebugInfo("Tile layer added");

        // Helper function to get coordinates regardless of format
        const getCoordinates = (
          location: LocationCoordinates
        ): [number, number] => {
          if (!location || !location.coordinates) {
            return [0, 0]; // Default fallback
          }

          const coords = location.coordinates;

          // Handle both formats: {lat, lng} and {latitude, longitude}
          const lat =
            coords.latitude !== undefined ? coords.latitude : coords.lat;
          const lng =
            coords.longitude !== undefined ? coords.longitude : coords.lng;

          return [lat || 0, lng || 0];
        };

        // Create custom marker icons
        const createCustomIcon = (color: string): DivIcon => {
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
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
        };

        // Add supplier markers
        addDebugInfo(`Adding ${suppliers.length} supplier markers...`);
        const supplierMarkers: Marker[] = [];
        suppliers.forEach((supplier) => {
          if (supplier.location && supplier.location.coordinates) {
            const [lat, lng] = getCoordinates(
              supplier.location as LocationCoordinates
            );

            if (lat && lng) {
              addDebugInfo(
                `Adding supplier marker for ${supplier.name} at [${lat}, ${lng}]`
              );

              const marker = L.marker([lat, lng], {
                icon: createCustomIcon("#3b82f6"),
                title: supplier.name,
              })
                .addTo(mapInstance)
                .bindPopup(`<b>Supplier:</b> ${supplier.name}`);
              supplierMarkers.push(marker);
            }
          }
        });
        addDebugInfo(`Added ${supplierMarkers.length} supplier markers`);

        // Add warehouse markers
        addDebugInfo(`Adding ${warehouses.length} warehouse markers...`);
        const warehouseMarkers: Marker[] = [];
        warehouses.forEach((warehouse) => {
          if (warehouse.location && warehouse.location.coordinates) {
            const [lat, lng] = getCoordinates(
              warehouse.location as LocationCoordinates
            );

            if (lat && lng) {
              addDebugInfo(
                `Adding warehouse marker for ${warehouse.name} at [${lat}, ${lng}]`
              );

              const marker = L.marker([lat, lng], {
                icon: createCustomIcon("#ef4444"),
                title: warehouse.name,
              })
                .addTo(mapInstance)
                .bindPopup(`<b>Warehouse:</b> ${warehouse.name}`);
              warehouseMarkers.push(marker);
            }
          }
        });
        addDebugInfo(`Added ${warehouseMarkers.length} warehouse markers`);

        // Add route lines
        addDebugInfo(`Adding ${routes.length} route lines...`);
        const routeLines: Polyline[] = [];
        routes.forEach((route) => {
          const supplier = suppliers.find((s) => s.id === route.supplierId);
          const warehouse = warehouses.find((w) => w.id === route.warehouseId);

          if (supplier?.location && warehouse?.location) {
            const supplierCoords = getCoordinates(
              supplier.location as LocationCoordinates
            );
            const warehouseCoords = getCoordinates(
              warehouse.location as LocationCoordinates
            );

            if (
              supplierCoords[0] &&
              supplierCoords[1] &&
              warehouseCoords[0] &&
              warehouseCoords[1]
            ) {
              addDebugInfo(
                `Adding route line from ${supplier.name} to ${warehouse.name}`
              );

              const transportMode = route.transport.mode;
              const color = transportModes[transportMode]?.color || "#94a3b8";

              const routeLine = L.polyline([supplierCoords, warehouseCoords], {
                color: color,
                weight: 3,
                opacity: 0.7,
                dashArray: transportMode === "airplane" ? "5, 5" : "",
              })
                .addTo(mapInstance)
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
          }
        });
        addDebugInfo(`Added ${routeLines.length} route lines`);

        // Fit bounds to show all markers if we have any
        if (supplierMarkers.length > 0 || warehouseMarkers.length > 0) {
          addDebugInfo("Fitting bounds to markers...");
          const allMarkers = [...supplierMarkers, ...warehouseMarkers];
          const featureGroup: FeatureGroup = L.featureGroup(allMarkers);
          const bounds: LatLngBounds = featureGroup.getBounds();

          mapInstance.fitBounds(bounds, { padding: [50, 50] });
          addDebugInfo("Bounds fitted to markers");
        }

        // Force a re-render to ensure the map is displayed
        setTimeout(() => {
          if (mapInstance) {
            mapInstance.invalidateSize();
            addDebugInfo("Map size invalidated to force redraw");
          }
        }, 100);

        // Set loading to false immediately
        setLoading(false);
        addDebugInfo("Map initialized successfully");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Error initializing map:", err);
        addDebugInfo(`Error initializing map: ${errorMessage}`);
        setError(`Failed to initialize map: ${errorMessage}`);
        setLoading(false);
      }
    };

    // Initialize the map
    initMap();

    // Cleanup function
    return cleanupMap;
  }, [
    routes,
    suppliers,
    warehouses,
    transportModes,
    onRouteSelect,
    containerReady,
  ]);

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted">
        <div className="text-center p-4">
          <p className="text-red-500">{error}</p>
          <div className="mt-2 text-xs text-muted-foreground max-h-40 overflow-auto">
            {debugInfo.map((info, i) => (
              <div key={i}>{info}</div>
            ))}
          </div>
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
          <div className="mt-2 text-xs text-muted-foreground max-h-40 overflow-auto">
            {debugInfo.map((info, i) => (
              <div key={i}>{info}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapContainerRef}
        className="h-[600px] w-full"
        style={{ minHeight: "600px" }}
      />
      {debugInfo.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-white/80 p-2 rounded text-xs max-w-xs max-h-32 overflow-auto">
          <div className="font-bold">Debug Info:</div>
          {debugInfo.map((info, i) => (
            <div key={i}>{info}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
