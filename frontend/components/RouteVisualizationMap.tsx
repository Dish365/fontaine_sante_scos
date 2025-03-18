"use client";

import React, { useState, useEffect, useRef } from "react";
import { Route, Supplier, Warehouse } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Ship, Plane, Train, Loader2 } from "lucide-react";
import type {
  Map as LeafletMap,
  Marker,
  FeatureGroup,
  Polyline,
} from "leaflet";

// Transport mode definitions
const TRANSPORT_MODES = {
  truck: {
    color: "#3b82f6",
    name: "Truck",
    icon: Truck,
  },
  train: {
    color: "#10b981",
    name: "Train",
    icon: Train,
  },
  ship: {
    color: "#6366f1",
    name: "Ship",
    icon: Ship,
  },
  airplane: {
    color: "#f59e0b",
    name: "Air",
    icon: Plane,
  },
};

interface RouteVisualizationMapProps {
  routes: Route[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
}

interface LocationCoordinates {
  coordinates: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
  };
}

export default function RouteVisualizationMap({
  routes,
  suppliers,
  warehouses,
}: RouteVisualizationMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [debug, setDebug] = useState<string>("");
  const [dataReady, setDataReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const routeLinesRef = useRef<Polyline[]>([]);

  // Check if we're on the client side and if data is ready
  useEffect(() => {
    setIsClient(true);

    // Log data for debugging
    console.log("RouteVisualizationMap - Routes:", routes);
    console.log("RouteVisualizationMap - Suppliers:", suppliers);
    console.log("RouteVisualizationMap - Warehouses:", warehouses);

    // Check if data is valid
    const hasValidRoutes = routes && routes.length > 0;
    const hasValidSuppliers = suppliers && suppliers.length > 0;
    const hasValidWarehouses = warehouses && warehouses.length > 0;

    // Only set data ready when all data is available
    const isDataReady =
      hasValidRoutes && hasValidSuppliers && hasValidWarehouses;
    setDataReady(isDataReady);

    setDebug(`Routes: ${hasValidRoutes ? routes.length : "none"}, 
              Suppliers: ${hasValidSuppliers ? suppliers.length : "none"}, 
              Warehouses: ${hasValidWarehouses ? warehouses.length : "none"}, 
              Data Ready: ${isDataReady}`);
  }, [routes, suppliers, warehouses]);

  // Initialize the map when data is ready and we're on the client
  useEffect(() => {
    if (!isClient || !dataReady || !mapContainerRef.current) return;

    // Clean up function to remove the map
    const cleanupMap = () => {
      if (mapInstanceRef.current) {
        console.log("Cleaning up map...");

        // Remove the map
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
        routeLinesRef.current = [];
      }
    };

    // Clean up any existing map
    cleanupMap();

    const initMap = async () => {
      try {
        console.log("Initializing map...");
        setMapLoaded(false);

        // Import Leaflet
        const L = await import("leaflet");

        // Add Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        // Wait for CSS to load
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Create map instance
        if (!mapContainerRef.current) {
          throw new Error("Map container not found");
        }

        // Create the map
        const map = L.map(mapContainerRef.current, {
          center: [45.5017, -73.5673], // Montreal
          zoom: 4,
          zoomControl: true,
        });
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Helper function to get coordinates
        const getCoordinates = (
          location: LocationCoordinates
        ): [number, number] => {
          if (!location || !location.coordinates) {
            console.error("Invalid location object:", location);
            return [0, 0];
          }

          const coords = location.coordinates;

          // Debug the coordinates
          console.log("Raw coordinates:", coords);

          // Check for lat/lng or latitude/longitude
          const lat =
            coords.latitude !== undefined ? coords.latitude : coords.lat;
          const lng =
            coords.longitude !== undefined ? coords.longitude : coords.lng;

          // Validate coordinates
          if (!lat || !lng) {
            console.error("Invalid coordinates:", coords);
            return [0, 0];
          }

          console.log("Processed coordinates:", [lat, lng]);
          return [lat, lng];
        };

        // Create custom marker icons
        const createCustomIcon = (color: string) => {
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

        // Debug supplier data
        console.log("Supplier data:", suppliers);
        suppliers.forEach((supplier) => {
          console.log(`Supplier ${supplier.name} location:`, supplier.location);
          if (supplier.location && supplier.location.coordinates) {
            console.log(`Coordinates:`, supplier.location.coordinates);
          }
        });

        // Add supplier markers
        const supplierMarkers: Marker[] = [];
        console.log(
          "Adding supplier markers for",
          suppliers.length,
          "suppliers"
        );

        // Create a standard blue icon for suppliers
        const defaultIcon = L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        // Add markers with a direct approach
        suppliers.forEach((supplier, index) => {
          console.log(
            `Processing supplier ${index + 1}/${suppliers.length}: ${
              supplier.name
            }`
          );

          // Skip suppliers with invalid location data
          if (!supplier.location?.coordinates) {
            console.error(
              `No valid location data for supplier ${supplier.name}`
            );
            return;
          }

          // Get coordinates directly from the supplier object
          const coords = supplier.location.coordinates;
          // Use type assertion to handle potential different coordinate formats
          const lat = coords.lat || 0;
          const lng = coords.lng || 0;

          console.log(
            `Direct coordinates for ${supplier.name}: [${lat}, ${lng}]`
          );

          if (lat && lng) {
            try {
              // Add the marker to the map
              const marker = L.marker([lat, lng], {
                icon: defaultIcon,
                title: supplier.name,
                zIndexOffset: 1000, // Ensure supplier markers are on top
              })
                .addTo(map)
                .bindPopup(
                  `<b>Supplier:</b> ${supplier.name}<br><b>Location:</b> ${supplier.location.address}`
                );

              supplierMarkers.push(marker);
              console.log(
                `Successfully added marker for ${supplier.name} at [${lat}, ${lng}]`
              );
            } catch (error) {
              console.error(`Error adding marker for ${supplier.name}:`, error);
            }
          } else {
            console.error(
              `Invalid coordinates for supplier ${supplier.name}: [${lat}, ${lng}]`
            );
          }
        });

        // Add a timeout to ensure markers are added after map is fully initialized
        setTimeout(() => {
          console.log("Re-adding supplier markers after timeout");
          suppliers.forEach((supplier) => {
            if (supplier.location?.coordinates) {
              const lat = supplier.location.coordinates.lat;
              const lng = supplier.location.coordinates.lng;

              if (lat && lng) {
                try {
                  // Create a larger, more visible marker
                  const largeIcon = L.divIcon({
                    className: "custom-div-icon",
                    html: `
                      <div style="
                        background-color: #3b82f6;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 0 5px rgba(0,0,0,0.5);
                      "></div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  });

                  const marker = L.marker([lat, lng], {
                    icon: largeIcon,
                    title: supplier.name,
                    zIndexOffset: 2000, // Ensure these markers are on top of everything
                  })
                    .addTo(map)
                    .bindPopup(`<b>Supplier:</b> ${supplier.name}`);

                  supplierMarkers.push(marker);
                  console.log(`Added backup marker for ${supplier.name}`);
                } catch (error) {
                  console.error(
                    `Error adding backup marker for ${supplier.name}:`,
                    error
                  );
                }
              }
            }
          });
        }, 500);

        // Add warehouse markers
        const warehouseMarkers: Marker[] = [];
        warehouses.forEach((warehouse) => {
          if (warehouse.location && warehouse.location.coordinates) {
            const [lat, lng] = getCoordinates(
              warehouse.location as LocationCoordinates
            );

            if (lat && lng) {
              const marker = L.marker([lat, lng], {
                icon: createCustomIcon("#ef4444"),
                title: warehouse.name,
              })
                .addTo(map)
                .bindPopup(`<b>Warehouse:</b> ${warehouse.name}`);

              warehouseMarkers.push(marker);
            }
          }
        });

        // Add curved route lines instead of straight lines
        const routeLines: Polyline[] = [];
        routes.forEach((route) => {
          console.log("Processing route:", route);

          // Check for both id and supplier_id
          const supplier = suppliers.find(
            (s) =>
              s.id === route.supplierId ||
              s.id === route.supplierId.replace("supplier-", "")
          );

          const warehouse = warehouses.find((w) => w.id === route.warehouseId);

          console.log("Found supplier for route:", supplier?.name);
          console.log("Found warehouse for route:", warehouse?.name);

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
              const transportMode = route.transport.mode;
              const color =
                TRANSPORT_MODES[transportMode as keyof typeof TRANSPORT_MODES]
                  ?.color || "#94a3b8";

              // Create a curved line between points
              // Calculate midpoint and offset it to create a curve
              const midX = (supplierCoords[0] + warehouseCoords[0]) / 2;
              const midY = (supplierCoords[1] + warehouseCoords[1]) / 2;

              // Calculate perpendicular offset for the control point
              const dx = warehouseCoords[0] - supplierCoords[0];
              const dy = warehouseCoords[1] - supplierCoords[1];
              const distance = Math.sqrt(dx * dx + dy * dy);

              // Offset more for longer distances
              const offsetFactor = Math.min(0.2, distance / 50);

              // Create control point perpendicular to the line
              const controlX = midX - dy * offsetFactor;
              const controlY = midY + dx * offsetFactor;

              // Create a curved path using a quadratic Bezier curve approximation
              const curvePoints = [];
              const steps = 20; // Number of points to approximate the curve

              for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                // Quadratic Bezier curve formula
                const x =
                  (1 - t) * (1 - t) * supplierCoords[0] +
                  2 * (1 - t) * t * controlX +
                  t * t * warehouseCoords[0];
                const y =
                  (1 - t) * (1 - t) * supplierCoords[1] +
                  2 * (1 - t) * t * controlY +
                  t * t * warehouseCoords[1];
                curvePoints.push([x, y]);
              }

              // Create the polyline with the curved path
              const routeLine = L.polyline(curvePoints as [number, number][], {
                color: color,
                weight: 3,
                opacity: 0.7,
                dashArray: transportMode === "airplane" ? "5, 5" : "",
                smoothFactor: 1,
              })
                .addTo(map)
                .bindPopup(
                  `<b>Route:</b> ${supplier.name} to ${warehouse.name}<br>
                  <b>Transport:</b> ${
                    TRANSPORT_MODES[
                      transportMode as keyof typeof TRANSPORT_MODES
                    ]?.name || "Unknown"
                  }<br>
                  <b>Distance:</b> ${route.transport.distance} km`
                );

              // Add click handler for route selection
              routeLine.on("click", () => {
                setSelectedRoute(route);
              });

              routeLines.push(routeLine);
            }
          } else {
            console.error("Missing location data for route:", {
              routeId: route.id,
              supplierId: route.supplierId,
              warehouseId: route.warehouseId,
              supplierFound: !!supplier,
              warehouseFound: !!warehouse,
              supplierHasLocation: !!supplier?.location,
              warehouseHasLocation: !!warehouse?.location,
            });
          }
        });

        // Store route lines for cleanup
        routeLinesRef.current = routeLines;

        // Store markers for cleanup
        markersRef.current = [...supplierMarkers, ...warehouseMarkers];

        // Fit bounds to show all markers
        if (supplierMarkers.length > 0 || warehouseMarkers.length > 0) {
          const allMarkers = [...supplierMarkers, ...warehouseMarkers];
          const featureGroup = L.featureGroup(allMarkers) as FeatureGroup;
          const bounds = featureGroup.getBounds();
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Force a redraw
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
            setMapLoaded(true);
            console.log("Map initialized successfully");
          }
        }, 200);
      } catch (error) {
        console.error("Error initializing map:", error);
        setMapLoaded(false);
      }
    };

    // Initialize the map
    initMap();

    // Cleanup on unmount
    return cleanupMap;
  }, [isClient, dataReady, routes, suppliers, warehouses]);

  const getSupplierById = (id: string) => {
    return suppliers.find((s) => s.id === id);
  };

  const getWarehouseById = (id: string) => {
    return warehouses.find((w) => w.id === id);
  };

  const getTransportModeDetails = (mode: string) => {
    return (
      TRANSPORT_MODES[mode as keyof typeof TRANSPORT_MODES] || {
        color: "#94a3b8",
        name: "Unknown",
        icon: Truck,
      }
    );
  };

  // If not on client side yet, show loading placeholder
  if (!isClient) {
    return (
      <div className="h-[600px] w-full rounded-md overflow-hidden relative flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing client...</p>
        </div>
      </div>
    );
  }

  // If data is not ready yet, show loading placeholder
  if (!dataReady) {
    return (
      <div className="h-[600px] w-full rounded-md overflow-hidden relative flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading route data...</p>
          {debug && (
            <div className="mt-2 text-xs text-muted-foreground">
              <div>{debug}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[600px] w-full rounded-md overflow-hidden relative"
      style={{ minHeight: "600px" }}
    >
      {debug && (
        <div className="absolute top-2 left-2 z-[2000] bg-white/80 p-2 rounded text-xs">
          <div className="font-bold">Debug:</div>
          <div>{debug}</div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        style={{ minHeight: "600px" }}
      />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="flex flex-col items-center gap-2 bg-background p-4 rounded-md shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Initializing map...</p>
          </div>
        </div>
      )}

      {/* Route details panel */}
      {selectedRoute && (
        <Card className="absolute bottom-4 right-4 w-64 shadow-lg z-[1000] bg-background">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Route Details</h3>
                <Badge variant="outline">
                  {getTransportModeDetails(selectedRoute.transport.mode).name}
                </Badge>
              </div>

              <div className="text-sm space-y-1">
                <div>
                  <span className="text-muted-foreground">From:</span>{" "}
                  {getSupplierById(selectedRoute.supplierId)?.name}
                </div>
                <div>
                  <span className="text-muted-foreground">To:</span>{" "}
                  {getWarehouseById(selectedRoute.warehouseId)?.name}
                </div>
                <div>
                  <span className="text-muted-foreground">Distance:</span>{" "}
                  {selectedRoute.transport.distance} km
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>{" "}
                  {selectedRoute.transport.timeTaken.value}{" "}
                  {selectedRoute.transport.timeTaken.unit}
                </div>
                <div>
                  <span className="text-muted-foreground">Cost:</span> $
                  {selectedRoute.transport.cost.toLocaleString()}
                </div>
                <div>
                  <span className="text-muted-foreground">CO₂ Emissions:</span>{" "}
                  {selectedRoute.transport.environmentalImpact.co2Emissions}{" "}
                  {selectedRoute.transport.environmentalImpact.unit}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
