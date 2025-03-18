"use client";

import { useState, useEffect } from "react";
import { useLocalData } from "@/hooks/useLocalData";
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
import {
  BarChart,
  LineChart,
  PieChart,
  Download,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SupplierComparison } from "@/components/analysis/supplier-comparison";
import { CostAnalysis } from "@/components/analysis/cost-analysis";
import { TransportationAnalysis } from "@/components/analysis/transportation-analysis";
import { MaterialAnalysis } from "@/components/analysis/material-analysis";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import { useRouter } from "next/navigation";

export default function AnalysisPage() {
  const router = useRouter();
  const { suppliers, rawMaterials, loading } = useLocalData();

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState<
    "suppliers" | "costs" | "transportation" | "materials"
  >("suppliers");

  const [supplierOptions, setSupplierOptions] = useState<Option[]>([]);
  const [materialOptions, setMaterialOptions] = useState<Option[]>([]);

  // Convert suppliers and materials to options format when data changes
  useEffect(() => {
    if (suppliers?.length > 0) {
      setSupplierOptions(
        suppliers.map((supplier) => ({
          value: supplier.id,
          label: `${supplier.name} (${supplier.location.address})`,
        }))
      );
    }

    if (rawMaterials?.length > 0) {
      setMaterialOptions(
        rawMaterials.map((material) => ({
          value: material.id,
          label: `${material.name} (${material.unit})`,
        }))
      );
    }
  }, [suppliers, rawMaterials]);

  const getFilteredData = () => {
    const filteredSuppliers =
      suppliers?.filter((s) => selectedSuppliers.includes(s.id)) || [];
    const filteredMaterials =
      rawMaterials?.filter((m) => selectedMaterials.includes(m.id)) || [];
    return { filteredSuppliers, filteredMaterials };
  };

  const renderAnalysisContent = () => {
    const { filteredSuppliers, filteredMaterials } = getFilteredData();

    // Don't render if no items are selected
    if (selectedSuppliers.length === 0 || selectedMaterials.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <p>Please select both suppliers and materials to view the analysis</p>
        </div>
      );
    }

    switch (analysisType) {
      case "suppliers":
        return (
          <SupplierComparison
            suppliers={filteredSuppliers}
            materials={filteredMaterials}
          />
        );
      case "costs":
        return (
          <CostAnalysis
            suppliers={filteredSuppliers}
            rawMaterials={filteredMaterials}
          />
        );
      case "transportation":
        return (
          <TransportationAnalysis
            suppliers={filteredSuppliers}
            materials={filteredMaterials}
          />
        );
      case "materials":
        return <MaterialAnalysis rawMaterials={filteredMaterials} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-background relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-fit"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Supply Chain Analysis
              </h1>
              <p className="text-muted-foreground">
                Analyze and compare suppliers, costs, and materials across your
                supply chain
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
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
                        <SelectItem value="materials">
                          Material Analysis
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Suppliers
                    </label>
                    {loading ? (
                      <div className="text-sm text-muted-foreground">
                        Loading suppliers...
                      </div>
                    ) : (
                      <MultiSelect
                        options={supplierOptions}
                        selected={selectedSuppliers}
                        onChange={setSelectedSuppliers}
                        placeholder="Select suppliers..."
                        noOptionsMessage="No suppliers found."
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Materials
                    </label>
                    {loading ? (
                      <div className="text-sm text-muted-foreground">
                        Loading materials...
                      </div>
                    ) : (
                      <MultiSelect
                        options={materialOptions}
                        selected={selectedMaterials}
                        onChange={setSelectedMaterials}
                        placeholder="Select materials..."
                        noOptionsMessage="No materials found."
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
                              <Badge
                                key={id}
                                variant="outline"
                                className="text-xs"
                              >
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
                            const material = rawMaterials.find(
                              (m) => m.id === id
                            );
                            return material ? (
                              <Badge
                                key={id}
                                variant="outline"
                                className="text-xs"
                              >
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
            <div className="lg:col-span-9">
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
                      {renderAnalysisContent()}
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
      </div>
    </main>
  );
}
