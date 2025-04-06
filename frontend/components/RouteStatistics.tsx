"use client";

import React, { useState } from "react";
import { Route } from "@/types/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Ship,
  Plane,
  Train,
  Zap,
  Clock,
  DollarSign,
  Route as RouteIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

interface RouteStatisticsProps {
  routes: Route[];
  onFilterChange: (filteredRoutes: Route[]) => void;
}

export default function RouteStatistics({
  routes,
  onFilterChange,
}: RouteStatisticsProps) {
  const [filterMode, setFilterMode] = useState<string | null>(null);
  const [filterWarehouse, setFilterWarehouse] = useState<string | null>(null);
  const [filterSupplier, setFilterSupplier] = useState<string | null>(null);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>(routes);

  // Get unique warehouses and suppliers
  const uniqueWarehouses = Array.from(
    new Set(routes.map((r) => r.warehouseId))
  );
  const uniqueSuppliers = Array.from(new Set(routes.map((r) => r.supplierId)));
  const uniqueModes = Array.from(new Set(routes.map((r) => r.transport.mode)));

  // Apply filters
  const applyFilters = () => {
    let newFilteredRoutes = [...routes];

    if (filterMode) {
      newFilteredRoutes = newFilteredRoutes.filter(
        (r) => r.transport.mode === filterMode
      );
    }

    if (filterWarehouse) {
      newFilteredRoutes = newFilteredRoutes.filter(
        (r) => r.warehouseId === filterWarehouse
      );
    }

    if (filterSupplier) {
      newFilteredRoutes = newFilteredRoutes.filter(
        (r) => r.supplierId === filterSupplier
      );
    }

    setFilteredRoutes(newFilteredRoutes);
    onFilterChange(newFilteredRoutes);
  };

  // Handle filter changes
  const handleModeChange = (value: string) => {
    setFilterMode(value === "all" ? null : value);
    setTimeout(applyFilters, 0);
  };

  const handleWarehouseChange = (value: string) => {
    setFilterWarehouse(value === "all" ? null : value);
    setTimeout(applyFilters, 0);
  };

  const handleSupplierChange = (value: string) => {
    setFilterSupplier(value === "all" ? null : value);
    setTimeout(applyFilters, 0);
  };

  // Calculate statistics using filtered routes
  const calculateTotalDistance = () => {
    return filteredRoutes.reduce(
      (total, route) => total + route.transport.distance,
      0
    );
  };

  const calculateTotalCO2 = () => {
    return filteredRoutes.reduce(
      (total, route) =>
        total + route.transport.environmentalImpact.co2Emissions,
      0
    );
  };

  const calculateTotalCost = () => {
    return filteredRoutes.reduce(
      (total, route) => total + route.transport.cost,
      0
    );
  };

  const calculateAverageTime = () => {
    if (filteredRoutes.length === 0) return 0;
    const totalTime = filteredRoutes.reduce(
      (total, route) => total + route.transport.timeTaken.value,
      0
    );
    return totalTime / filteredRoutes.length;
  };

  // Prepare chart data using filtered routes
  const prepareTransportModeData = () => {
    const modeCount: Record<string, number> = {};
    filteredRoutes.forEach((route) => {
      const mode = route.transport.mode;
      modeCount[mode] = (modeCount[mode] || 0) + 1;
    });

    return Object.entries(modeCount).map(([mode, count]) => ({
      name: mode.charAt(0).toUpperCase() + mode.slice(1),
      value: count,
      color:
        TRANSPORT_MODES[mode as keyof typeof TRANSPORT_MODES]?.color ||
        "#94a3b8",
    }));
  };

  const prepareEmissionsData = () => {
    return filteredRoutes.map((route) => ({
      name: route.id,
      emissions: route.transport.environmentalImpact.co2Emissions,
      color:
        TRANSPORT_MODES[route.transport.mode as keyof typeof TRANSPORT_MODES]
          ?.color || "#94a3b8",
    }));
  };

  const prepareCostData = () => {
    return filteredRoutes.map((route) => ({
      name: route.id,
      cost: route.transport.cost,
      color:
        TRANSPORT_MODES[route.transport.mode as keyof typeof TRANSPORT_MODES]
          ?.color || "#94a3b8",
    }));
  };

  // Update filtered routes when routes prop changes
  React.useEffect(() => {
    setFilteredRoutes(routes);
  }, [routes]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Distance
                </p>
                <p className="text-2xl font-bold">
                  {calculateTotalDistance().toFixed(2)} km
                </p>
              </div>
              <RouteIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total CO2 Emissions
                </p>
                <p className="text-2xl font-bold">
                  {calculateTotalCO2().toFixed(2)} kg
                </p>
              </div>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Cost
                </p>
                <p className="text-2xl font-bold">
                  ${calculateTotalCost().toFixed(2)}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Average Time
                </p>
                <p className="text-2xl font-bold">
                  {calculateAverageTime().toFixed(1)} hrs
                </p>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Route Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transport Mode</label>
              <Select
                value={filterMode || "all"}
                onValueChange={handleModeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Transport Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transport Modes</SelectItem>
                  {uniqueModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Warehouse</label>
              <Select
                value={filterWarehouse || "all"}
                onValueChange={handleWarehouseChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {uniqueWarehouses.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <Select
                value={filterSupplier || "all"}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {uniqueSuppliers.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Transport Mode Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareTransportModeData()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {prepareTransportModeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CO2 Emissions by Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareEmissionsData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="emissions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost by Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareCostData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cost" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
