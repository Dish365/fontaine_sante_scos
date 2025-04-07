"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocalData } from "@/hooks/useLocalData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Progress } from "@/components/ui/progress";

// Add mock data
const mockData = {
  suppliers: [
    {
      id: "1",
      name: "Test Supplier 1",
      location: { 
        address: "123 Test St, Test City",
        coordinates: { lat: 48.8566, lng: 2.3522 }
      },
      quality: { 
        score: 85,
        certifications: ["ISO 9001", "ISO 14001"],
        lastAudit: "2024-03-15"
      },
      environmentalData: {
        carbonFootprint: 150,
        energyEfficiency: "High",
        wasteManagement: "Excellent",
        waterUsage: 1000,
        emissions: 500,
      },
      economicData: {
        foundedYear: 2010,
        annualRevenue: 5000000,
        employeeCount: 250,
        materialCosts: 50000,
        transportationCosts: 15000,
        storageCosts: 8000,
        totalCost: 73000,
        costPerUnit: 73,
      },
      materials: ["1", "2", "3"],
      certifications: ["ISO 9001", "ISO 14001"],
      transportMode: "truck",
      distance: 150,
      productionCapacity: "1000 units/day",
      leadTime: 5,
      reliability: 0.95,
      transportationDetails: "Standard truck delivery with temperature control",
      contactInfo: {
        name: "John Doe",
        email: "john@test1.com",
        phone: "123-456-7890",
      },
      operatingHours: "8:00-17:00",
      performanceHistory: "Consistent performance with average score of 86",
      riskScore: 0.15,
    },
    {
      id: "2",
      name: "Test Supplier 2",
      location: { 
        address: "456 Test Ave, Test Town",
        coordinates: { lat: 51.5074, lng: -0.1278 }
      },
      quality: { 
        score: 92,
        certifications: ["ISO 9001"],
        lastAudit: "2024-03-10"
      },
      environmentalData: {
        carbonFootprint: 120,
        energyEfficiency: "Medium",
        wasteManagement: "Good",
        waterUsage: 800,
        emissions: 400,
      },
      economicData: {
        foundedYear: 2015,
        annualRevenue: 3500000,
        employeeCount: 180,
        materialCosts: 55000,
        transportationCosts: 16000,
        storageCosts: 8500,
        totalCost: 79500,
        costPerUnit: 79.5,
      },
      materials: ["1", "2"],
      certifications: ["ISO 9001"],
      transportMode: "train",
      distance: 300,
      productionCapacity: "800 units/day",
      leadTime: 7,
      reliability: 0.98,
      transportationDetails: "Rail transport with specialized containers",
      contactInfo: {
        name: "Jane Smith",
        email: "jane@test2.com",
        phone: "234-567-8901",
      },
      operatingHours: "7:00-16:00",
      performanceHistory: "Excellent performance with improving trend",
      riskScore: 0.08,
    },
    {
      id: "3",
      name: "Test Supplier 3",
      location: { 
        address: "789 Test Blvd, Test Village",
        coordinates: { lat: 40.7128, lng: -74.0060 }
      },
      quality: { 
        score: 65,
        certifications: [],
        lastAudit: "2024-03-01"
      },
      environmentalData: {
        carbonFootprint: 180,
        energyEfficiency: "Low",
        wasteManagement: "Fair",
        waterUsage: 1200,
        emissions: 600,
      },
      economicData: {
        foundedYear: 2005,
        annualRevenue: 2800000,
        employeeCount: 150,
        materialCosts: 48000,
        transportationCosts: 14000,
        storageCosts: 7500,
        totalCost: 69500,
        costPerUnit: 69.5,
      },
      materials: ["2", "3"],
      certifications: [],
      transportMode: "ship",
      distance: 500,
      productionCapacity: "600 units/day",
      leadTime: 10,
      reliability: 0.85,
      transportationDetails: "Ocean freight with refrigerated containers",
      contactInfo: {
        name: "Bob Wilson",
        email: "bob@test3.com",
        phone: "345-678-9012",
      },
      operatingHours: "9:00-18:00",
      performanceHistory: "Below average performance with stability issues",
      riskScore: 0.35,
    },
  ],
  rawMaterials: [
    {
      id: "1",
      name: "Test Material 1",
      quantity: 150,
      unit: "kg",
      cost: 100,
      quality: { 
        score: 90,
        defectRate: 0.02,
        consistencyScore: 0.95,
      },
      environmentalImpact: { carbonFootprint: 50 },
      type: "Raw",
      description: "Test material 1 description",
      suppliers: ["1", "2"],
      environmentalData: {
        carbonFootprint: 50,
        waterUsage: 200,
        wasteGeneration: 10,
        landUse: 500,
        biodiversityImpact: "Low",
      },
      economicData: {
        unitCost: 100,
        transportationCost: 20,
        storageCost: 10,
        totalCostPerUnit: 130,
        taxRate: 0.1,
        tariffRate: 0.05,
        leadTime: 5,
        paymentTerms: "Net 30",
        currency: "USD",
      },
    },
    {
      id: "2",
      name: "Test Material 2",
      quantity: 80,
      unit: "kg",
      cost: 150,
      quality: { 
        score: 85,
        defectRate: 0.03,
        consistencyScore: 0.92,
      },
      environmentalImpact: { carbonFootprint: 40 },
      type: "Processed",
      description: "Test material 2 description",
      suppliers: ["1", "2", "3"],
      environmentalData: {
        carbonFootprint: 40,
        waterUsage: 150,
        wasteGeneration: 8,
        landUse: 300,
        biodiversityImpact: "Medium",
      },
      economicData: {
        unitCost: 150,
        transportationCost: 25,
        storageCost: 15,
        totalCostPerUnit: 190,
        taxRate: 0.1,
        tariffRate: 0.05,
        leadTime: 7,
        paymentTerms: "Net 30",
        currency: "USD",
      },
    },
    {
      id: "3",
      name: "Test Material 3",
      quantity: 200,
      unit: "kg",
      cost: 80,
      quality: { 
        score: 75,
        defectRate: 0.05,
        consistencyScore: 0.88,
      },
      environmentalImpact: { carbonFootprint: 60 },
      type: "Raw",
      description: "Test material 3 description",
      suppliers: ["1", "3"],
      environmentalData: {
        carbonFootprint: 60,
        waterUsage: 250,
        wasteGeneration: 15,
        landUse: 800,
        biodiversityImpact: "High",
      },
      economicData: {
        unitCost: 80,
        transportationCost: 15,
        storageCost: 8,
        totalCostPerUnit: 103,
        taxRate: 0.1,
        tariffRate: 0.05,
        leadTime: 5,
        paymentTerms: "Net 30",
        currency: "USD",
      },
    },
  ],
};

export default function AnalysisPage() {
  const router = useRouter();
  const { suppliers, rawMaterials, loading } = useLocalData();
  const [useTestData, setUseTestData] = useState(false);

  // Memoize the data object to prevent unnecessary recreations
  const data = useMemo(() => 
    useTestData ? mockData : {
      suppliers,
      rawMaterials,
    },
    [useTestData, suppliers, rawMaterials]
  );

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [analysisType, setAnalysisType] = useState<
    "suppliers" | "costs" | "transportation" | "materials"
  >("suppliers");

  const [supplierOptions, setSupplierOptions] = useState<Option[]>([]);
  const [materialOptions, setMaterialOptions] = useState<Option[]>([]);

  // Convert suppliers and materials to options format when data changes
  useEffect(() => {
    if (data.suppliers?.length > 0) {
      setSupplierOptions(
        data.suppliers.map((supplier) => ({
          value: supplier.id,
          label: `${supplier.name} (${supplier.location.address})`,
        }))
      );
    }

    if (data.rawMaterials?.length > 0) {
      setMaterialOptions(
        data.rawMaterials.map((material) => ({
          value: material.id,
          label: `${material.name} (${material.unit})`,
        }))
      );
    }
  }, [data.suppliers, data.rawMaterials]);

  const getFilteredData = () => {
    const filteredSuppliers =
      data.suppliers?.filter((s) => selectedSuppliers.includes(s.id)) || [];
    const filteredMaterials =
      data.rawMaterials?.filter((m) => selectedMaterials.includes(m.id)) || [];
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="test-data"
                  checked={useTestData}
                  onCheckedChange={(checked) => setUseTestData(checked as boolean)}
                />
                <Label htmlFor="test-data">Use Test Data</Label>
              </div>
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
                            const supplier = data.suppliers.find((s) => s.id === id);
                            return supplier ? (
                              <Badge key={id} variant="secondary">
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
                            const material = data.rawMaterials.find((m) => m.id === id);
                            return material ? (
                              <Badge key={id} variant="secondary">
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
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Detailed Analysis Table</CardTitle>
                            <CardDescription>
                              Comprehensive data view for selected items
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="relative w-full overflow-auto">
                              <table className="w-full caption-bottom text-sm">
                                <thead>
                                  <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                      Name
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                      Quality Score
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                      Carbon Footprint
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                      Cost
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium">
                                      Risk Score
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {analysisType === "suppliers" && data.suppliers
                                    .filter(s => selectedSuppliers.includes(s.id))
                                    .map((supplier) => (
                                      <tr
                                        key={supplier.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                      >
                                        <td className="p-4 align-middle">{supplier.name}</td>
                                        <td className="p-4 align-middle">{supplier.quality.score}</td>
                                        <td className="p-4 align-middle">
                                          {supplier.environmentalData.carbonFootprint} kg CO2
                                        </td>
                                        <td className="p-4 align-middle">
                                          ${supplier.economicData.totalCost.toLocaleString()}
                                        </td>
                                        <td className="p-4 align-middle">
                                          {(supplier.riskScore * 100).toFixed(1)}%
                                        </td>
                                      </tr>
                                    ))}
                                  {analysisType === "materials" && data.rawMaterials
                                    .filter(m => selectedMaterials.includes(m.id))
                                    .map((material) => (
                                      <tr
                                        key={material.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                      >
                                        <td className="p-4 align-middle">{material.name}</td>
                                        <td className="p-4 align-middle">{material.quality.score}</td>
                                        <td className="p-4 align-middle">
                                          {material.environmentalData.carbonFootprint} kg CO2
                                        </td>
                                        <td className="p-4 align-middle">
                                          ${material.economicData.totalCostPerUnit.toLocaleString()}
                                        </td>
                                        <td className="p-4 align-middle">
                                          {(material.quality.defectRate * 100).toFixed(1)}%
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="summary" className="mt-4">
                      <div className="space-y-6">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Average Quality Score
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {analysisType === "suppliers"
                                  ? (data.suppliers
                                      .filter(s => selectedSuppliers.includes(s.id))
                                      .reduce((acc, s) => acc + s.quality.score, 0) / 
                                      selectedSuppliers.length).toFixed(1)
                                  : (data.rawMaterials
                                      .filter(m => selectedMaterials.includes(m.id))
                                      .reduce((acc, m) => acc + m.quality.score, 0) / 
                                      selectedMaterials.length).toFixed(1)}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Total Carbon Footprint
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {analysisType === "suppliers"
                                  ? data.suppliers
                                      .filter(s => selectedSuppliers.includes(s.id))
                                      .reduce((acc, s) => acc + s.environmentalData.carbonFootprint, 0)
                                  : data.rawMaterials
                                      .filter(m => selectedMaterials.includes(m.id))
                                      .reduce((acc, m) => acc + m.environmentalData.carbonFootprint, 0)} kg CO2
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Total Cost
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                ${analysisType === "suppliers"
                                  ? data.suppliers
                                      .filter(s => selectedSuppliers.includes(s.id))
                                      .reduce((acc, s) => acc + s.economicData.totalCost, 0)
                                      .toLocaleString()
                                  : data.rawMaterials
                                      .filter(m => selectedMaterials.includes(m.id))
                                      .reduce((acc, m) => acc + m.economicData.totalCostPerUnit * m.quantity, 0)
                                      .toLocaleString()}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">
                                Average Risk Score
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {(analysisType === "suppliers"
                                  ? data.suppliers
                                      .filter(s => selectedSuppliers.includes(s.id))
                                      .reduce((acc, s) => acc + s.riskScore, 0) / 
                                      selectedSuppliers.length
                                  : data.rawMaterials
                                      .filter(m => selectedMaterials.includes(m.id))
                                      .reduce((acc, m) => acc + m.quality.defectRate, 0) / 
                                      selectedMaterials.length) * 100}%
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>Performance Distribution</CardTitle>
                            <CardDescription>
                              Distribution of quality scores across selected items
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {analysisType === "suppliers" && data.suppliers
                                .filter(s => selectedSuppliers.includes(s.id))
                                .map((supplier) => (
                                  <div key={supplier.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">{supplier.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {supplier.quality.score}%
                                      </span>
                                    </div>
                                    <Progress value={supplier.quality.score} className="h-2" />
                                  </div>
                                ))}
                              {analysisType === "materials" && data.rawMaterials
                                .filter(m => selectedMaterials.includes(m.id))
                                .map((material) => (
                                  <div key={material.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">{material.name}</span>
                                      <span className="text-sm text-muted-foreground">
                                        {material.quality.score}%
                                      </span>
                                    </div>
                                    <Progress value={material.quality.score} className="h-2" />
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
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
