"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Route, Supplier, Warehouse } from "@/types/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Ship, Plane, Train, Loader2 } from "lucide-react";

// Create a map component that loads only on the client side
const MapWithNoSSR = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-md overflow-hidden relative flex items-center justify-center bg-muted">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading map component...</p>
      </div>
    </div>
  ),
});

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

export default function RouteVisualizationMap({
  routes,
  suppliers,
  warehouses,
}: RouteVisualizationMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getTransportModeDetails = (mode: string) => {
    return (
      TRANSPORT_MODES[mode as keyof typeof TRANSPORT_MODES] || {
        color: "#94a3b8",
        name: "Unknown",
        icon: Truck,
      }
    );
  };

  const getSupplierById = (id: string) => {
    return suppliers.find((s) => s.id === id);
  };

  const getWarehouseById = (id: string) => {
    return warehouses.find((w) => w.id === id);
  };

  // If not on client side yet, show loading placeholder
  if (!isClient) {
    return (
      <div className="h-[600px] w-full rounded-md overflow-hidden relative flex items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Initializing map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] w-full rounded-md overflow-hidden relative">
      <MapWithNoSSR
        routes={routes}
        suppliers={suppliers}
        warehouses={warehouses}
        transportModes={TRANSPORT_MODES}
        onRouteSelect={setSelectedRoute}
      />

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
