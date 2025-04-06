"use client";

import React, { useState, useEffect } from "react";
import { useLocalData } from "@/hooks/useLocalData";
import { Route } from "@/types/types";
import RouteVisualizationMap from "./RouteVisualizationMap";
import RouteStatistics from "./RouteStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface RouteVisualizationProps {
  useTestData?: boolean;
  testRoutes?: Array<{
    id: string;
    mode: string;
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
    waypoints: { lat: number; lng: number }[];
  }>;
}

export default function RouteVisualization({ useTestData = false, testRoutes = [] }: RouteVisualizationProps) {
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const { suppliers, warehouses, routes, loading } = useLocalData();
  const [currentPositions, setCurrentPositions] = useState<{ [key: string]: { lat: number; lng: number } }>({});
  const [animationFrames, setAnimationFrames] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (routes.length > 0) {
      setFilteredRoutes(routes);
    }
  }, [routes]);

  // Handle real-time route animation when test data is enabled
  useEffect(() => {
    if (useTestData && testRoutes.length > 0) {
      const steps: { [key: string]: number } = {};
      const frames: { [key: string]: number } = {};
      
      testRoutes.forEach(route => {
        steps[route.id] = 0;
      });

      const animate = (routeId: string) => {
        const route = testRoutes.find(r => r.id === routeId);
        if (!route) return;

        const allPoints = [route.start, ...route.waypoints, route.end];
        
        if (steps[routeId] < allPoints.length - 1) {
          const startPoint = allPoints[steps[routeId]];
          const endPoint = allPoints[steps[routeId] + 1];
          const progress = 0;
          
          const interpolate = (progress: number) => {
            const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * progress;
            const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * progress;
            
            setCurrentPositions(prev => ({
              ...prev,
              [routeId]: { lat, lng }
            }));
            
            if (progress < 1) {
              const frame = requestAnimationFrame(() => 
                interpolate(progress + 0.01)
              );
              frames[routeId] = frame;
              setAnimationFrames(prev => ({ ...prev, [routeId]: frame }));
            } else {
              steps[routeId]++;
              animate(routeId);
            }
          };
          
          interpolate(progress);
        } else {
          // Reset animation
          steps[routeId] = 0;
          animate(routeId);
        }
      };

      // Start animation for each route
      testRoutes.forEach(route => {
        animate(route.id);
      });

      return () => {
        // Cleanup all animation frames
        Object.values(frames).forEach(frame => {
          cancelAnimationFrame(frame);
        });
      };
    }
  }, [useTestData, testRoutes]);

  const handleFilterChange = (newFilteredRoutes: Route[]) => {
    setFilteredRoutes(newFilteredRoutes);
  };

  // Show loading state only if we're not using test data and data is still loading
  if (!useTestData && loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  // Show no routes message only if we're not using test data and there are no routes
  if (!useTestData && routes.length === 0) {
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
                routes={useTestData ? [] : filteredRoutes}
                suppliers={useTestData ? [] : suppliers}
                warehouses={useTestData ? [] : warehouses}
                testMode={{
                  enabled: useTestData,
                  routes: testRoutes,
                  currentPositions
                }}
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
