"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import RouteVisualization from "@/components/RouteVisualization";

export default function VisualizationPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Supply Chain Route Visualization
          </h1>
          <p className="text-muted-foreground">
            View and analyze routes between suppliers and warehouses
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/data-collection")}>
          Back to Data Collection
        </Button>
      </div>

      <RouteVisualization />
    </div>
  );
}
