import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import routesData from "@/data/routes.json";
import type { Route } from "@/types/types";
import { JsonRoute, convertJsonToRoute } from "@/types/json-types";

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load routes from JSON data
    try {
      // Convert JSON format to app format
      const jsonRoutes = routesData as unknown as JsonRoute[];
      const convertedRoutes = jsonRoutes.map(convertJsonToRoute);
      setRoutes(convertedRoutes);
      setLoading(false);
    } catch (err) {
      console.error("Error loading routes:", err);
      setError("Failed to load routes");
      setLoading(false);
    }
  }, []);

  const addRoute = async (route: Omit<Route, "id">): Promise<Route> => {
    try {
      // Create a new route with ID
      const newRoute: Route = {
        ...route,
        id: `route-${uuidv4()}`,
      };

      // Update state
      setRoutes((prev) => [...prev, newRoute]);

      // Would save to JSON here in a real implementation
      // const jsonRoute = convertRouteToJson(newRoute);
      // await saveToJsonFile(jsonRoute);

      return newRoute;
    } catch (err) {
      console.error("Error adding route:", err);
      throw new Error("Failed to add route");
    }
  };

  const updateRoute = async (
    id: string,
    updates: Partial<Route>
  ): Promise<Route> => {
    try {
      // Find route to update
      const routeIndex = routes.findIndex((r) => r.id === id);
      if (routeIndex === -1) {
        throw new Error(`Route with id ${id} not found`);
      }

      // Create updated route
      const updatedRoute = {
        ...routes[routeIndex],
        ...updates,
      };

      // Update state
      const updatedRoutes = [...routes];
      updatedRoutes[routeIndex] = updatedRoute;
      setRoutes(updatedRoutes);

      // Would save to JSON here in a real implementation
      // const jsonRoute = convertRouteToJson(updatedRoute);
      // await updateJsonFile(jsonRoute);

      return updatedRoute;
    } catch (err) {
      console.error("Error updating route:", err);
      throw new Error("Failed to update route");
    }
  };

  // Get routes by warehouse
  const getRoutesByWarehouse = (warehouseId: string): Route[] => {
    return routes.filter((route) => route.warehouseId === warehouseId);
  };

  // Get routes by supplier
  const getRoutesBySupplier = (supplierId: string): Route[] => {
    return routes.filter((route) => route.supplierId === supplierId);
  };

  // Get routes by transport mode
  const getRoutesByTransportMode = (mode: string): Route[] => {
    return routes.filter((route) => route.transport.mode === mode);
  };

  // Calculate total environmental impact for a set of routes
  const calculateTotalEnvironmentalImpact = (routeIds: string[]): number => {
    return routes
      .filter((route) => routeIds.includes(route.id))
      .reduce(
        (total, route) =>
          total + route.transport.environmentalImpact.co2Emissions,
        0
      );
  };

  // Calculate average transport cost
  const calculateAverageTransportCost = (): number => {
    if (routes.length === 0) return 0;
    const totalCost = routes.reduce(
      (sum, route) => sum + route.transport.cost,
      0
    );
    return totalCost / routes.length;
  };

  return {
    routes,
    loading,
    error,
    addRoute,
    updateRoute,
    getRoutesByWarehouse,
    getRoutesBySupplier,
    getRoutesByTransportMode,
    calculateTotalEnvironmentalImpact,
    calculateAverageTransportCost,
  };
}
