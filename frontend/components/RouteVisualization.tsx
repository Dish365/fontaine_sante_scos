"use client";

import React, { useState, useEffect } from "react";
import { useLocalData } from "@/hooks/useLocalData";
import { Route } from "@/types/types";
import RouteVisualizationMap from "./RouteVisualizationMap";
import RouteStatistics from "./RouteStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function RouteVisualization() {
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const { suppliers, warehouses, routes, loading } = useLocalData();

  useEffect(() => {
    if (routes.length > 0) {
      setFilteredRoutes(routes);
    }
  }, [routes]);

  const handleFilterChange = (newFilteredRoutes: Route[]) => {
    setFilteredRoutes(newFilteredRoutes);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="font-medium">No routes available</p>
          <p className="text-muted-foreground">
            Routes data will appear here once available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supply Chain Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <RouteVisualizationMap
                routes={filteredRoutes}
                suppliers={suppliers}
                warehouses={warehouses}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <RouteStatistics
            routes={routes}
            onFilterChange={handleFilterChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
