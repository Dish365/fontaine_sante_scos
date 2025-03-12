"use client";

import { useState, useEffect } from "react";
import { useDataCollection } from "@/hooks/useDataCollection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, LineChart, PieChart, Download, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SupplierComparison } from "@/components/analysis/supplier-comparison";
import { CostAnalysis } from "@/components/analysis/cost-analysis";
import { TransportationAnalysis } from "@/components/analysis/transportation-analysis";
import { MaterialAnalysis } from "@/components/analysis/material-analysis";
import { MultiSelect, Option } from "@/components/ui/multi-select";

export default function AnalysisPage() {
  const {
    suppliers,
    rawMaterials,
    loadingSuppliers,
    loadingRawMaterials,
    fetchSuppliers,
    fetchRawMaterials,
  } = useDataCollection();
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState<
    "suppliers" | "costs" | "transportation" | "materials"
  >("suppliers");

  const [supplierOptions, setSupplierOptions] = useState<Option[]>([]);
  const [materialOptions, setMaterialOptions] = useState<Option[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchSuppliers(), fetchRawMaterials()]);
        // After fetching, set supplier options
        if (suppliers.length > 0) {
          setSupplierOptions(
            suppliers.map((supplier) => ({
              value: supplier.id,
              label: `${supplier.name} (${supplier.location.address})`,
            }))
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [fetchSuppliers, fetchRawMaterials]);

  // Convert suppliers and materials to options format when data changes
  useEffect(() => {
    if (suppliers.length > 0) {
      setSupplierOptions(
        suppliers.map((supplier) => ({
          value: supplier.id,
          label: supplier.name,
        }))
      );
    }

    if (rawMaterials.length > 0) {
      setMaterialOptions(
        rawMaterials.map((material) => ({
          value: material.id,
          label: material.name,
        }))
      );
    }
  }, [suppliers, rawMaterials]);

  return (
    <div className="container mx-auto py-8 max-w-7xl pl-[280px] md:pl-[80px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supply Chain Analysis
          </h1>
          <p className="text-muted-foreground">
            Analyze and compare suppliers, costs, and materials across your
            supply chain
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Parameters</CardTitle>
              <CardDescription>Select items to analyze</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Analysis Type</label>
                <Select
                  value={analysisType}
                  onValueChange={(value: typeof analysisType) =>
                    setAnalysisType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suppliers">
                      Supplier Comparison
                    </SelectItem>
                    <SelectItem value="costs">Cost Analysis</SelectItem>
                    <SelectItem value="transportation">
                      Transportation Analysis
                    </SelectItem>
                    <SelectItem value="materials">Material Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Suppliers</label>
                {loadingSuppliers ? (
                  <div className="text-sm text-muted-foreground">
                    Loading suppliers...
                  </div>
                ) : (
                  <MultiSelect
                    options={supplierOptions}
                    selected={selectedSuppliers}
                    onChange={setSelectedSuppliers}
                    placeholder="Select suppliers..."
                    emptyMessage="No suppliers found."
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Materials</label>
                {loadingRawMaterials ? (
                  <div className="text-sm text-muted-foreground">
                    Loading materials...
                  </div>
                ) : (
                  <MultiSelect
                    options={materialOptions}
                    selected={selectedMaterials}
                    onChange={setSelectedMaterials}
                    placeholder="Select materials..."
                    emptyMessage="No materials found."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>
                Quick overview of selected items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Selected Suppliers</p>
                  <p className="text-2xl font-bold">
                    {selectedSuppliers.length}
                  </p>
                  {selectedSuppliers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedSuppliers.map((id) => {
                        const supplier = suppliers.find((s) => s.id === id);
                        return supplier ? (
                          <Badge key={id} variant="outline" className="text-xs">
                            {supplier.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Selected Materials</p>
                  <p className="text-2xl font-bold">
                    {selectedMaterials.length}
                  </p>
                  {selectedMaterials.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedMaterials.map((id) => {
                        const material = rawMaterials.find((m) => m.id === id);
                        return material ? (
                          <Badge key={id} variant="outline" className="text-xs">
                            {material.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                Detailed analysis based on selected parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger
                    value="chart"
                    className="flex items-center gap-2"
                  >
                    <BarChart className="h-4 w-4" />
                    Chart View
                  </TabsTrigger>
                  <TabsTrigger
                    value="table"
                    className="flex items-center gap-2"
                  >
                    <LineChart className="h-4 w-4" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger
                    value="summary"
                    className="flex items-center gap-2"
                  >
                    <PieChart className="h-4 w-4" />
                    Summary View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart" className="mt-4">
                  {analysisType === "suppliers" && (
                    <SupplierComparison
                      suppliers={suppliers.filter((s) =>
                        selectedSuppliers.includes(s.id)
                      )}
                      materials={rawMaterials.filter((m) =>
                        selectedMaterials.includes(m.id)
                      )}
                    />
                  )}
                  {analysisType === "costs" && (
                    <CostAnalysis
                      suppliers={suppliers.filter((s) =>
                        selectedSuppliers.includes(s.id)
                      )}
                      materials={rawMaterials.filter((m) =>
                        selectedMaterials.includes(m.id)
                      )}
                    />
                  )}
                  {analysisType === "transportation" && (
                    <TransportationAnalysis
                      suppliers={suppliers.filter((s) =>
                        selectedSuppliers.includes(s.id)
                      )}
                      materials={rawMaterials.filter((m) =>
                        selectedMaterials.includes(m.id)
                      )}
                    />
                  )}
                  {analysisType === "materials" && (
                    <MaterialAnalysis
                      suppliers={suppliers.filter((s) =>
                        selectedSuppliers.includes(s.id)
                      )}
                      materials={rawMaterials.filter((m) =>
                        selectedMaterials.includes(m.id)
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="table" className="mt-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Table view coming soon</p>
                  </div>
                </TabsContent>

                <TabsContent value="summary" className="mt-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Summary view coming soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
