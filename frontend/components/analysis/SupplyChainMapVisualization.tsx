"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import type {
  RawMaterial,
  Supplier,
  Warehouse,
} from "@/lib/data-collection-utils";
import EnhancedMapComponent from "./EnhancedMapComponent";

interface SupplyChainMapVisualizationProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
  warehouses: Warehouse[];
}

export default function SupplyChainMapVisualization({
  suppliers,
  materials,
  warehouses,
}: SupplyChainMapVisualizationProps) {
  const hasData = suppliers.length > 0 && warehouses.length > 0;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Geographic Map</h3>
          <p className="text-muted-foreground">
            Visualize your supply chain network geographically
          </p>
        </div>

        {!hasData ? (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>No data available</AlertTitle>
            <AlertDescription>
              Please add suppliers and warehouses to visualize your supply chain
              network.
            </AlertDescription>
          </Alert>
        ) : (
          <EnhancedMapComponent
            suppliers={suppliers}
            materials={materials}
            warehouses={warehouses}
          />
        )}
      </CardContent>
    </Card>
  );
}
