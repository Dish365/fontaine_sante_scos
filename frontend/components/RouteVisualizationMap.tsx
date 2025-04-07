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
  testMode?: {
    enabled: boolean;
    routes?: Array<{
      id: string;
      mode: string;
      start: { lat: number; lng: number };
      end: { lat: number; lng: number };
      waypoints: { lat: number; lng: number }[];
    }>;
    currentPositions: { [key: string]: { lat: number; lng: number } };
  };
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
  testMode = { enabled: false, currentPositions: {} }
}: RouteVisualizationMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [debug, setDebug] = useState<string>("");
  const [dataReady, setDataReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [visibleModes, setVisibleModes] = useState<{ [key: string]: boolean }>({
    train: true,
    truck: true,
    ship: true,
    airplane: true
  });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const routeLinesRef = useRef<Polyline[]>([]);
  const testMarkerRef = useRef<{ [key: string]: Marker }>({});
  const testRouteRef = useRef<{ [key: string]: Polyline }>({});
  const cssLoadedRef = useRef<boolean>(false);

  // Initialize testMarkerRef
  useEffect(() => {
    testMarkerRef.current = {};
  }, []);

  // Load Leaflet CSS only once when component mounts
  useEffect(() => {
    if (!cssLoadedRef.current && typeof window !== 'undefined') {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
      cssLoadedRef.current = true;
    }
    setIsClient(true);
  }, []);

  // Check data readiness
  useEffect(() => {
    if (!testMode.enabled) {
      const hasValidRoutes = routes && routes.length > 0;
      const hasValidSuppliers = suppliers && suppliers.length > 0;
      const hasValidWarehouses = warehouses && warehouses.length > 0;
      const isDataReady = hasValidRoutes && hasValidSuppliers && hasValidWarehouses;
      setDataReady(isDataReady);
      setDebug(`Routes: ${hasValidRoutes ? routes.length : "none"}, 
                Suppliers: ${hasValidSuppliers ? suppliers.length : "none"}, 
                Warehouses: ${hasValidWarehouses ? warehouses.length : "none"}, 
                Data Ready: ${isDataReady}`);
    } else {
      setDataReady(true);
      setDebug('Test mode enabled');
    }
  }, [routes, suppliers, warehouses, testMode.enabled]);

  // Initialize map
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;
    
    // Allow initialization in test mode regardless of data readiness
    if (!testMode.enabled && !dataReady) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Ensure proper cleanup before initializing
        if (mapInstanceRef.current) {
          // Clean up test mode markers and routes
          Object.values(testMarkerRef.current).forEach(marker => {
            if (marker) marker.remove();
          });
          testMarkerRef.current = {};

          Object.values(testRouteRef.current).forEach(route => {
            if (route) route.remove();
          });
          testRouteRef.current = {};

          // Clean up real data markers and routes
          markersRef.current.forEach(marker => {
            if (marker) marker.remove();
          });
          markersRef.current = [];

          routeLinesRef.current.forEach(route => {
            if (route) route.remove();
          });
          routeLinesRef.current = [];

          // Remove the map instance
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;

          // Wait a brief moment to ensure cleanup is complete
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        const container = mapContainerRef.current;
        if (!container || !isMounted) return;

        // Clear any existing content
        container.innerHTML = '';

        // Ensure container has proper dimensions
        container.style.width = '100%';
        container.style.height = '100%';

        // Create map instance
        const map = L.map(container, {
          center: [45.5017, -73.5673], // Default to Montreal
          zoom: 4,
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
        });

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          minZoom: 2,
        }).addTo(map);

        if (isMounted) {
          mapInstanceRef.current = map;
          
          // Force multiple redraws to ensure proper rendering
          const redrawMap = () => {
            if (isMounted && map) {
              map.invalidateSize();
              setMapLoaded(true);
            }
          };

          redrawMap();
          setTimeout(redrawMap, 100);
          setTimeout(redrawMap, 500);

          if (testMode.enabled && testMode.routes && map) {
            // Test mode visualization code
            testMode.routes.forEach(route => {
              const allPoints = [route.start, ...route.waypoints, route.end];
              const color = TRANSPORT_MODES[route.mode as keyof typeof TRANSPORT_MODES]?.color || '#94a3b8';
              
              try {
                // Add route path with style based on transport mode
                const routeLine = L.polyline(allPoints, {
                  color: color,
                  weight: 3,
                  opacity: 0.7,
                  dashArray: route.mode === 'airplane' ? '5, 5' : '',
                });

                if (visibleModes[route.mode]) {
                  routeLine.addTo(map);
                }
                
                testRouteRef.current[route.id] = routeLine;

                // Add markers for each point
                allPoints.forEach((point, index) => {
                  const isStart = index === 0;
                  const isEnd = index === allPoints.length - 1;
                  const isWaypoint = !isStart && !isEnd;
                  
                  const markerIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `
                      <div style="
                        background-color: ${isStart ? '#3b82f6' : isEnd ? '#ef4444' : '#6366f1'};
                        width: ${isWaypoint ? '12' : '16'}px;
                        height: ${isWaypoint ? '12' : '16'}px;
                        border-radius: 50%;
                        border: ${isWaypoint ? '2' : '3'}px solid white;
                        box-shadow: 0 0 ${isWaypoint ? '4' : '5'}px rgba(0,0,0,0.${isWaypoint ? '4' : '5'});
                      "></div>
                    `,
                    iconSize: [isWaypoint ? 12 : 16, isWaypoint ? 12 : 16],
                    iconAnchor: [isWaypoint ? 6 : 8, isWaypoint ? 6 : 8],
                  });

                  if (map) {
                    const marker = L.marker([point.lat, point.lng], { icon: markerIcon });
                    if (visibleModes[route.mode]) {
                      marker.addTo(map);
                    }
                    const markerId = `${route.id}-${index}`;
                    testMarkerRef.current[markerId] = marker;
                  }
                });
              } catch (error) {
                console.error('Error adding route or markers:', error);
              }
            });
          } else if (dataReady) {
            // Real data visualization code...
            // Create marker icons
            const supplierIcon = L.divIcon({
              className: 'custom-div-icon',
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

            const warehouseIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `
                <div style="
                  background-color: #ef4444;
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

            // Add supplier markers
            suppliers.forEach(supplier => {
              if (supplier.location) {
                const coords = getCoordinates(supplier.location as LocationCoordinates);
                if (coords[0] && coords[1]) {
                  const marker = L.marker([coords[0], coords[1]], { icon: supplierIcon })
                    .addTo(map)
                    .bindTooltip(supplier.name, { permanent: false })
                    .bindPopup(`
                      <div class="p-2">
                        <h3 class="font-bold">${supplier.name}</h3>
                        <p class="text-sm text-muted-foreground">Supplier</p>
                        <div class="mt-2">
                          <p class="text-xs text-muted-foreground">Location:</p>
                          <p class="text-xs">${supplier.location?.address || 'N/A'}</p>
                        </div>
                      </div>
                    `);
                  markersRef.current.push(marker);
                }
              }
            });

            // Add warehouse markers
            warehouses.forEach(warehouse => {
              if (warehouse.location) {
                const coords = getCoordinates(warehouse.location as LocationCoordinates);
                if (coords[0] && coords[1]) {
                  const marker = L.marker([coords[0], coords[1]], { icon: warehouseIcon })
                    .addTo(map)
                    .bindTooltip(warehouse.name, { permanent: false })
                    .bindPopup(`
                      <div class="p-2">
                        <h3 class="font-bold">${warehouse.name}</h3>
                        <p class="text-sm text-muted-foreground">Warehouse</p>
                        <div class="mt-2">
                          <p class="text-xs">Capacity: ${warehouse.capacity} ${warehouse.capacityUnit}</p>
                          <p class="text-xs">Utilization: ${warehouse.utilizationRate}%</p>
                          <p class="text-xs">Operating Hours: ${warehouse.operatingHours}</p>
                        </div>
                      </div>
                    `);
                  markersRef.current.push(marker);
                }
              }
            });

            // Add route lines
            routes.forEach(route => {
              const supplier = suppliers.find(s => s.id === route.supplierId);
              const warehouse = warehouses.find(w => w.id === route.warehouseId);

              if (supplier?.location && warehouse?.location) {
                const supplierCoords = getCoordinates(supplier.location as LocationCoordinates);
                const warehouseCoords = getCoordinates(warehouse.location as LocationCoordinates);

                if (supplierCoords[0] && supplierCoords[1] && warehouseCoords[0] && warehouseCoords[1]) {
                  const transportMode = route.transport.mode;
                  const color = TRANSPORT_MODES[transportMode as keyof typeof TRANSPORT_MODES]?.color || '#94a3b8';

                  const routeLine = L.polyline([supplierCoords, warehouseCoords], {
                    color: color,
                    weight: 3,
                    opacity: 0.7,
                    dashArray: transportMode === 'airplane' ? '5, 5' : '',
                  })
                    .addTo(map)
                    .bindPopup(`
                      <div class="p-2">
                        <h3 class="font-bold">Route Details</h3>
                        <p class="text-sm">From: ${supplier.name}</p>
                        <p class="text-sm">To: ${warehouse.name}</p>
                        <div class="mt-2">
                          <p class="text-xs">Distance: ${route.transport.distance} km</p>
                          <p class="text-xs">Time: ${route.transport.timeTaken.value} ${route.transport.timeTaken.unit}</p>
                          <p class="text-xs">Cost: $${route.transport.cost.toLocaleString()}</p>
                        </div>
                      </div>
                    `);

                  routeLine.on('click', () => {
                    setSelectedRoute(route);
                  });

                  routeLinesRef.current.push(routeLine);
                }
              }
            });

            // Fit bounds to show all markers
            const validPoints = [
              ...suppliers.map(s => getCoordinates(s.location as LocationCoordinates)),
              ...warehouses.map(w => getCoordinates(w.location as LocationCoordinates))
            ]
            .filter((coords): coords is [number, number] => 
              coords[0] !== null && coords[1] !== null
            );

            if (validPoints.length > 0) {
              const bounds = L.latLngBounds(validPoints);
              map.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 8
              });
            }
          }
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        if (isMounted) {
          setMapLoaded(false);
        }
      }
    };

    // Initialize the map
    initMap();

    // Cleanup function
    return () => {
      isMounted = false;

      // Ensure all timeouts are cleared
      const cleanup = async () => {
        if (mapInstanceRef.current) {
          // Clean up test mode markers and routes
          Object.values(testMarkerRef.current).forEach(marker => {
            if (marker) marker.remove();
          });
          testMarkerRef.current = {};

          Object.values(testRouteRef.current).forEach(route => {
            if (route) route.remove();
          });
          testRouteRef.current = {};

          // Clean up real data markers and routes
          markersRef.current.forEach(marker => {
            if (marker) marker.remove();
          });
          markersRef.current = [];

          routeLinesRef.current.forEach(route => {
            if (route) route.remove();
          });
          routeLinesRef.current = [];

          // Remove the map instance
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;

          // Clear the container
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = '';
          }
        }
      };

      cleanup();
    };
  }, [isClient, dataReady, testMode.enabled, testMode.routes]);

  // Move the visibility effect outside the main initialization
  useEffect(() => {
    if (!mapInstanceRef.current || !testMode?.enabled || !testMode?.routes) return;

    const map = mapInstanceRef.current;

    // Update route lines visibility
    Object.entries(testRouteRef.current).forEach(([routeId, routeLine]) => {
      const route = testMode.routes?.find(r => r.id === routeId);
      if (route && routeLine) {
        if (visibleModes[route.mode]) {
          routeLine.addTo(map);
        } else {
          routeLine.remove();
        }
      }
    });

    // Update markers visibility
    Object.entries(testMarkerRef.current).forEach(([markerId, marker]) => {
      const [routeId] = markerId.split('-');
      const route = testMode.routes?.find(r => r.id === routeId);
      if (route && marker) {
        if (visibleModes[route.mode]) {
          marker.addTo(map);
        } else {
          marker.remove();
        }
      }
    });
  }, [visibleModes, testMode?.enabled, testMode?.routes]);

  // Helper function to get coordinates from location object
  const getCoordinates = (location: LocationCoordinates): [number, number] | [null, null] => {
    if (location.coordinates.lat !== undefined && location.coordinates.lng !== undefined) {
      return [location.coordinates.lat, location.coordinates.lng];
    }
    if (location.coordinates.latitude !== undefined && location.coordinates.longitude !== undefined) {
      return [location.coordinates.latitude, location.coordinates.longitude];
    }
    return [null, null];
  };

  // Update test marker position with transport icon
  useEffect(() => {
    const map = mapInstanceRef.current;
    const positions = testMode?.currentPositions;
    const routes = testMode?.routes;
    
    if (!map || !testMode?.enabled || !positions || !routes) return;

    const updateMarkers = async () => {
      if (!mapInstanceRef.current || !isClient) return;

      try {
        const L = (await import('leaflet')).default;
        const map = mapInstanceRef.current;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        suppliers.forEach(supplier => {
          const coords = getCoordinates(supplier.location);
          if (coords[0] !== null && coords[1] !== null && map) {
            const marker = L.marker(coords as [number, number])
              .addTo(map)
              .bindTooltip(supplier.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -10]
              });
            markersRef.current.push(marker);
          }
        });

        warehouses.forEach(warehouse => {
          const coords = getCoordinates(warehouse.location);
          if (coords[0] !== null && coords[1] !== null && map) {
            const marker = L.marker(coords as [number, number])
              .addTo(map)
              .bindTooltip(warehouse.name, {
                permanent: false,
                direction: 'top',
                offset: [0, -10]
              });
            markersRef.current.push(marker);
          }
        });
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    };

    updateMarkers();
  }, [testMode?.currentPositions, testMode?.enabled, testMode?.routes]);

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

  // If data is not ready yet and we're not in test mode, show loading placeholder
  if (!dataReady && !testMode.enabled) {
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
      style={{ minHeight: "600px", position: "relative" }}
    >
      {testMode?.enabled && (
        <Card className="absolute top-4 left-4 w-64 shadow-lg z-[2000]">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="font-semibold mb-3">Transport Modes</h3>
              {Object.entries(TRANSPORT_MODES).map(([mode, details]) => (
                <div key={mode} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`mode-${mode}`}
                    checked={visibleModes[mode]}
                    onChange={(e) => {
                      setVisibleModes(prev => ({
                        ...prev,
                        [mode]: e.target.checked
                      }));
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`mode-${mode}`}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <span className="w-4 h-4">
                      {React.createElement(details.icon, {
                        size: 16,
                        color: details.color
                      })}
                    </span>
                    <span>{details.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {debug && (
        <div className="absolute top-2 left-2 z-[2000] bg-white/80 p-2 rounded text-xs">
          <div className="font-bold">Debug:</div>
          <div>{debug}</div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full absolute inset-0"
        style={{ minHeight: "600px", zIndex: 1 }}
      />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50" style={{ zIndex: 2 }}>
          <div className="flex flex-col items-center gap-2 bg-background p-4 rounded-md shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Initializing map...</p>
          </div>
        </div>
      )}

      {/* Route details panel */}
      {selectedRoute && (
        <Card className="absolute bottom-4 right-4 w-64 shadow-lg" style={{ zIndex: 1000 }}>
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
