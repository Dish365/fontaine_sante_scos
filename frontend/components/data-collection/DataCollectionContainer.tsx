"use client";

import React, { useState } from "react";
import {
  Filter,
  PlusCircle,
  Download,
  Database,
  BarChart4,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataCollection } from "@/hooks/useDataCollection";
import { DataCollectionSteps } from "./DataCollectionSteps";

export function DataCollectionContainer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState("data-entry");
  const {
    rawMaterials,
    suppliers,
    loadingRawMaterials,
    loadingSuppliers,
    addRawMaterial,
    updateRawMaterial,
    addSupplier,
  } = useDataCollection();

  const resetForm = () => {
    setCurrentStep(1);
    setActiveTab("data-entry");
  };

  const switchToVisualization = () => {
    setActiveTab("visualization");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Data Collection & Mapping
        </h1>
        <p className="text-muted-foreground">
          Phase 1: Create a comprehensive inventory of raw materials and map
          your entire supply chain.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
        <Button className="gap-2" onClick={resetForm}>
          <PlusCircle className="h-4 w-4" /> Add Material
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="data-entry" className="flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Data Entry
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center">
            <BarChart4 className="h-4 w-4 mr-2" />
            Visualization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="data-entry" className="mt-6">
          <DataCollectionSteps
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            rawMaterials={rawMaterials}
            suppliers={suppliers}
            addRawMaterial={addRawMaterial}
            updateRawMaterial={updateRawMaterial}
            loadingRawMaterials={loadingRawMaterials}
            loadingSuppliers={loadingSuppliers}
            addSupplier={addSupplier}
            onSwitchToVisualization={switchToVisualization}
          />
        </TabsContent>

        <TabsContent value="visualization" className="mt-6">
          <div className="text-center p-8 border rounded-md">
            <BarChart4 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">
              Visualization Coming Soon
            </h3>
            <p className="text-muted-foreground mb-4">
              The supply chain visualization feature is under development.
            </p>
            <Button onClick={() => setActiveTab("data-entry")}>
              Return to Data Entry
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
