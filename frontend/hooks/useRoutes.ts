import { useLocalData } from "./useLocalData";
import { v4 as uuidv4 } from "uuid";
import type { Route } from "@/types/types";

/**
 * Hook for working with route data (uses local JSON data)
 */
export function useRoutes() {
  const { routes, loading, error } = useLocalData();

  // Add a new route (in-memory only)
  const addRoute = async (route: Omit<Route, "id">): Promise<Route> => {
    try {
      // Create a new route with ID
      const newRoute: Route = {
        ...route,
        id: `route-${uuidv4()}`,
      };

      return newRoute;
    } catch (err) {
      console.error("Error adding route:", err);
      throw new Error("Failed to add route");
    }
  };

  // Update an existing route (in-memory only)
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
