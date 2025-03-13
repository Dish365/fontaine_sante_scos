"use client";

import React, { useState, useEffect } from "react";
import { useRoutes } from "@/hooks/useRoutes";
import { Route, Supplier, Warehouse } from "@/types/types";
import RouteVisualizationMap from "./RouteVisualizationMap";
import RouteStatistics from "./RouteStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Mock data for suppliers and warehouses
const mockSuppliers: Supplier[] = [
  {
    id: "001",
    name: "Organic Farms Co.",
    location: {
      address: "123 Farm Road, Quebec, Canada",
      coordinates: {
        lat: 45.5017,
        lng: -73.5673,
      },
    },
    materials: ["mat-001", "mat-002"],
    certifications: ["Organic", "Fair Trade"],
    transportMode: "truck, train",
    distance: 450,
    transportationDetails: "Regular shipments via truck and train",
    productionCapacity: "500 tons/month",
    performanceHistory: "Reliable supplier with 98% on-time delivery",
    riskScore: 2,
    quality: {
      score: 4.8,
      certifications: ["ISO 9001", "Organic"],
      lastAudit: "2023-06-15",
    },
    contactInfo: {
      name: "Jean Tremblay",
      email: "jean@organicfarms.ca",
      phone: "+1-514-555-1234",
    },
    economicData: {
      foundedYear: 1998,
      annualRevenue: 12000000,
      employeeCount: 85,
    },
    environmentalData: {
      carbonFootprint: 320,
      wasteManagement: "Composting and recycling program",
      energyEfficiency: "Solar panels installed on 70% of facilities",
    },
  },
  {
    id: "002",
    name: "West Coast Produce",
    location: {
      address: "456 Ocean Drive, Vancouver, Canada",
      coordinates: {
        lat: 49.2827,
        lng: -123.1207,
      },
    },
    materials: ["mat-003", "mat-004"],
    certifications: ["Sustainable Farming"],
    transportMode: "ship, truck",
    distance: 3200,
    transportationDetails: "Ocean freight and local distribution",
    productionCapacity: "350 tons/month",
    performanceHistory: "Good supplier with occasional delays",
    riskScore: 3,
    quality: {
      score: 4.2,
      certifications: ["HACCP"],
      lastAudit: "2023-08-22",
    },
    contactInfo: {
      name: "Sarah Wong",
      email: "sarah@westcoastproduce.ca",
      phone: "+1-604-555-6789",
    },
    economicData: {
      foundedYear: 2005,
      annualRevenue: 8500000,
      employeeCount: 62,
    },
    environmentalData: {
      carbonFootprint: 420,
      wasteManagement: "Zero waste initiative in progress",
      energyEfficiency: "Energy-efficient equipment in all facilities",
    },
  },
];

const mockWarehouses: Warehouse[] = [
  {
    id: "wh-1741526443312-jtx5ovf",
    name: "Toronto Distribution Center",
    location: {
      address: "789 Industrial Parkway, Toronto, Canada",
      coordinates: {
        lat: 43.6532,
        lng: -79.3832,
      },
    },
    capacity: 5000,
    capacityUnit: "pallets",
    utilizationRate: 78,
    handlingCapacity: 200,
    operatingHours: "24/7",
    specialFeatures: ["Cold Storage", "Cross-docking"],
  },
  {
    id: "wh-montreal-001",
    name: "Montreal Logistics Hub",
    location: {
      address: "321 Shipping Lane, Montreal, Canada",
      coordinates: {
        lat: 45.5019,
        lng: -73.5674,
      },
    },
    capacity: 3500,
    capacityUnit: "pallets",
    utilizationRate: 65,
    handlingCapacity: 150,
    operatingHours: "Mon-Sat 6am-10pm",
    specialFeatures: ["Automated Sorting", "Rail Access"],
  },
  {
    id: "wh-vancouver-002",
    name: "Vancouver Port Facility",
    location: {
      address: "987 Harbor Road, Vancouver, Canada",
      coordinates: {
        lat: 49.2827,
        lng: -123.1207,
      },
    },
    capacity: 4200,
    capacityUnit: "pallets",
    utilizationRate: 82,
    handlingCapacity: 180,
    operatingHours: "24/7",
    specialFeatures: ["Port Access", "Customs Clearance"],
  },
];

export default function RouteVisualization() {
  const { routes, loading, error } = useRoutes();
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);

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
          <p className="text-muted-foreground">Loading route data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="text-destructive font-medium">Error loading routes</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Handle case when there are no routes
  if (routes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="font-medium">No routes available</p>
          <p className="text-muted-foreground">Routes data will appear here once available</p>
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
