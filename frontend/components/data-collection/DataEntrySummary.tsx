import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RawMaterial, Supplier } from "@/types/types";
import {
  ArrowLeft,
  Truck,
  Train,
  Ship,
  Plane,
  Building2,
  Factory,
  Leaf,
} from "lucide-react";

// Import data from JSON files
import materialsData from "@/data/materials.json";
import suppliersData from "@/data/suppliers.json";
import warehousesData from "@/data/warehouses.json";
import routesData from "@/data/routes.json";

interface DataEntrySummaryProps {
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  onReturnToDataEntry: () => void;
}

interface RouteData {
  route_id: string;
  transport: {
    mode: string;
    environmental_impact?: {
      co2_emissions: number;
      unit: string;
    };
  };
}

interface WarehouseData {
  warehouse_id: string;
  name: string;
  utilizationRate: number;
}

interface MaterialData {
  material_id: string;
  name: string;
  type: string;
  description: string;
  unit: string;
  supplier_id: string[];
}

interface SupplierData {
  supplier_id: string;
  name: string;
}

export function DataEntrySummary({
  rawMaterials,
  suppliers,
  onReturnToDataEntry,
}: DataEntrySummaryProps) {
  // Use the imported data for statistics, but log the props for debugging
  console.log("Props received:", {
    rawMaterialsCount: rawMaterials.length,
    suppliersCount: suppliers.length,
  });

  // Use the imported data for statistics
  const materialCount = materialsData.length;
  const supplierCount = suppliersData.length;
  const warehouseCount = warehousesData.length;
  const routeCount = routesData.length;

  // Calculate transport mode distribution
  const transportModes: Record<string, number> = {};
  (routesData as RouteData[]).forEach((route) => {
    const mode = route.transport.mode;
    transportModes[mode] = (transportModes[mode] || 0) + 1;
  });

  // Calculate total CO2 emissions
  const totalCO2 = (routesData as RouteData[]).reduce((sum: number, route) => {
    return sum + (route.transport.environmental_impact?.co2_emissions || 0);
  }, 0);

  // Get warehouse utilization
  const warehouseUtilization =
    (warehousesData as WarehouseData[]).reduce((sum: number, warehouse) => {
      return sum + (warehouse.utilizationRate || 0);
    }, 0) / warehousesData.length;

  // Get transport mode icon
  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "truck":
        return <Truck className="h-4 w-4" />;
      case "train":
        return <Train className="h-4 w-4" />;
      case "ship":
        return <Ship className="h-4 w-4" />;
      case "airplane":
        return <Plane className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Data Entry Summary</h2>
        <Button
          variant="outline"
          onClick={onReturnToDataEntry}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Data Entry
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Factory className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">{materialCount}</h3>
              <p className="text-muted-foreground">Raw Materials</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">{supplierCount}</h3>
              <p className="text-muted-foreground">Suppliers</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">{warehouseCount}</h3>
              <p className="text-muted-foreground">Warehouses</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Truck className="h-8 w-8 text-primary mb-2" />
              <h3 className="text-2xl font-bold">{routeCount}</h3>
              <p className="text-muted-foreground">Transport Routes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Materials and Suppliers */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Raw Materials & Suppliers</CardTitle>
            <CardDescription>
              Overview of materials and their associated suppliers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {(materialsData as MaterialData[]).map((material) => (
                  <div
                    key={material.material_id}
                    className="border rounded-md p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{material.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {material.type}
                        </p>
                      </div>
                      <Badge>{material.unit}</Badge>
                    </div>
                    <p className="text-sm mb-2">{material.description}</p>

                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-2">
                        Associated Suppliers:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {material.supplier_id &&
                          material.supplier_id.map((id: string) => {
                            const supplier = (
                              suppliersData as SupplierData[]
                            ).find((s) => s.supplier_id === id);
                            return supplier ? (
                              <Badge key={id} variant="outline">
                                {supplier.name}
                              </Badge>
                            ) : (
                              <Badge key={id} variant="outline">
                                ID: {id}
                              </Badge>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Transport & Environmental Impact */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transport & Environmental Impact</CardTitle>
            <CardDescription>
              Transport modes and environmental metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">
                  Transport Mode Distribution
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(transportModes).map(([mode, count]) => (
                    <div
                      key={mode}
                      className="flex items-center gap-2 border rounded-md p-3"
                    >
                      {getTransportIcon(mode)}
                      <div className="flex-1">
                        <p className="font-medium capitalize">{mode}</p>
                        <p className="text-sm text-muted-foreground">
                          {count} routes
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Environmental Impact</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      <span>Total CO₂ Emissions</span>
                    </div>
                    <Badge variant="outline">
                      {totalCO2.toLocaleString()} kg CO₂e
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      <span>Warehouse Utilization</span>
                    </div>
                    <Badge variant="outline">
                      {warehouseUtilization.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
