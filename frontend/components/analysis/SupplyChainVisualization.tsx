import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import SupplyChainMapVisualization from "./SupplyChainMapVisualization";
import { RawMaterial } from "@/lib/data-collection-utils";
import { Supplier, Warehouse } from "@/types/types";
import warehousesData from "@/data/warehouses.json";

interface SupplyChainVisualizationProps {
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
}

export function SupplyChainVisualization({
  rawMaterials,
  suppliers,
  warehouses = warehousesData, // Provide default warehouses data
}: SupplyChainVisualizationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supply Chain Map</CardTitle>
        <CardDescription>
          Visualize your supply chain network including suppliers, warehouses,
          and materials
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rawMaterials.length === 0 || suppliers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Complete data entry to generate your supply chain map</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Total Suppliers
                  </CardTitle>
                  <div className="text-2xl font-bold">{suppliers.length}</div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Raw Materials
                  </CardTitle>
                  <div className="text-2xl font-bold">
                    {rawMaterials.length}
                  </div>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium">
                    Warehouses
                  </CardTitle>
                  <div className="text-2xl font-bold">{warehouses.length}</div>
                </CardHeader>
              </Card>
            </div>

            {/* Map Visualization */}
            <div className="border rounded-md">
              <div className="p-4 border-b">
                <h3 className="font-medium">Network Visualization</h3>
                <p className="text-sm text-muted-foreground">
                  Showing supplier locations, transport routes, and warehouses
                </p>
              </div>
              <SupplyChainMapVisualization
                suppliers={suppliers}
                materials={rawMaterials}
                warehouses={warehouses}
              />
              <div className="p-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Connections
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
