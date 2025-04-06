"use client";

import React, { useState } from "react";
import {
  Filter,
  PlusCircle,
  Download,
  Database,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDataCollection } from "@/hooks/useDataCollection";
import { DataCollectionSteps } from "./DataCollectionSteps";
import { DataEntrySummary } from "./DataEntrySummary";
import { Card } from "@/components/ui/card";

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

  const switchToSummary = () => {
    setActiveTab("summary");
  };

  return (
    <Card className="w-full">
      <div className="space-y-6 p-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Data Collection & Mapping
          </h1>
          <p className="text-muted-foreground">
            Phase 1: Create a comprehensive inventory of raw materials and map
            your entire supply chain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={resetForm}>
            <PlusCircle className="h-4 w-4" /> Add Material
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="data-entry" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Data Entry
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Data Entry Summary
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
              onSwitchToVisualization={switchToSummary}
            />
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <DataEntrySummary
              rawMaterials={rawMaterials}
              suppliers={suppliers}
              onReturnToDataEntry={() => setActiveTab("data-entry")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
