import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplyChainVisualization } from "./SupplyChainVisualization";
import { SupplyChainMap } from "../SupplyChainMap";
import { RawMaterial } from "@/lib/data-collection-utils-browser";
import { Supplier, Warehouse } from "@/lib/types";
import { ArrowLeft, ArrowRight, Save, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Step6VisualizationProps {
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  onPrevious: () => void;
  onComplete: () => void;
}

export function Step6Visualization({
  rawMaterials,
  suppliers,
  warehouses,
  onPrevious,
  onComplete,
}: Step6VisualizationProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Supply Chain Visualization</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onComplete}>
            <Save className="mr-2 h-4 w-4" />
            Complete
          </Button>
        </div>
      </div>

      <Alert className="bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertTitle>Interactive Visualization</AlertTitle>
        <AlertDescription>
          Explore your supply chain through interactive visualizations. The
          geographic map shows supplier locations, transport routes, and
          warehouses. The network diagram displays material flows and
          relationships. Use filters to focus on specific materials or transport
          modes.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="map">Geographic Map</TabsTrigger>
              <TabsTrigger value="network">Network Diagram</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                <p>
                  This map shows the geographic locations of your suppliers,
                  warehouses, and the transportation routes between them. Use
                  the filters to focus on specific materials or transport modes.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Click on markers to view detailed information</li>
                  <li>Toggle layers using the control in the top-right</li>
                  <li>
                    Use the filter button to show specific materials or
                    transport modes
                  </li>
                </ul>
              </div>
              <SupplyChainVisualization
                rawMaterials={rawMaterials}
                suppliers={suppliers}
                warehouses={warehouses}
              />
            </TabsContent>

            <TabsContent value="network" className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                <p>
                  This network diagram shows the relationships between
                  suppliers, materials, and warehouses in your supply chain.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Click on nodes to view detailed information</li>
                  <li>Toggle between horizontal and vertical layouts</li>
                  <li>Zoom and pan to explore the network</li>
                  <li>Colors indicate different transport modes</li>
                </ul>
              </div>
              <div className="border rounded-md">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Supply Chain Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing material flow from suppliers to warehouses
                  </p>
                </div>
                <SupplyChainMap
                  suppliers={suppliers}
                  materials={rawMaterials}
                  warehouses={warehouses}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
