"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import RouteVisualization from "@/components/RouteVisualization";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Test data for real-time route simulation
const TEST_ROUTES = [
  {
    id: "route-1",
    mode: "train",
    start: { lat: 45.5017, lng: -73.5673 }, // Montreal
    end: { lat: 40.7128, lng: -74.0060 },   // New York
    waypoints: [
      { lat: 44.3876, lng: -73.9279 },      // Burlington
      { lat: 42.3601, lng: -71.0589 },      // Boston
    ]
  },
  {
    id: "route-2",
    mode: "ship",
    start: { lat: 44.6488, lng: -63.5752 }, // Halifax
    end: { lat: 45.5017, lng: -73.5673 },   // Montreal
    waypoints: [
      { lat: 46.8139, lng: -71.2080 },      // Quebec City
    ]
  },
  {
    id: "route-3",
    mode: "airplane",
    start: { lat: 43.6532, lng: -79.3832 }, // Toronto
    end: { lat: 42.3601, lng: -71.0589 },   // Boston
    waypoints: []
  },
  {
    id: "route-4",
    mode: "truck",
    start: { lat: 45.4215, lng: -75.6972 }, // Ottawa
    end: { lat: 44.3876, lng: -73.9279 },   // Burlington
    waypoints: [
      { lat: 44.9238, lng: -74.8916 },      // Massena
    ]
  }
];

export default function VisualizationPage() {
  const router = useRouter();
  const [useTestData, setUseTestData] = useState(false);

  return (
    <main className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-fit"
            onClick={() => router.push("/dashboard/data-collection")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Data Collection
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Supply Chain Route Visualization
              </h1>
              <p className="text-muted-foreground">
                View and analyze routes between suppliers and warehouses
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="test-data"
                checked={useTestData}
                onCheckedChange={(checked) => setUseTestData(checked as boolean)}
              />
              <Label htmlFor="test-data">Use Test Data</Label>
            </div>
          </div>

          <Card className="w-full">
            <div className="p-0 sm:p-0">
              <RouteVisualization useTestData={useTestData} testRoutes={TEST_ROUTES} />
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
