"use client";

import { useState, useEffect, useMemo } from "react";
import { AlertCircle, ArrowUp, TrendingUp, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
  ReferenceLine,
} from "recharts";
import { useLocalData } from "@/hooks/useLocalData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MonthlyData {
  month: string;
  value: number;
}

interface Metrics {
  totalSuppliers: number;
  activeSuppliers: number;
  totalMaterials: number;
  activeMaterials: number;
  carbonFootprint: number;
  renewableEnergy: number;
  totalMaterialCost: number;
  totalTransportationCost: number;
  totalStorageCost: number;
  qualityScore: number;
  supplierQualityDistribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  monthlyData: {
    carbonFootprint: MonthlyData[];
    materialCost: MonthlyData[];
    qualityScore: MonthlyData[];
  };
}

// Add mock data
const mockData = {
  suppliers: [
    {
      id: "1",
      name: "Test Supplier 1",
      quality: { score: 85 },
      environmentalData: {
        carbonFootprint: 150,
        energyEfficiency: "High",
      },
    },
    {
      id: "2",
      name: "Test Supplier 2",
      quality: { score: 92 },
      environmentalData: {
        carbonFootprint: 120,
        energyEfficiency: "Medium",
      },
    },
    {
      id: "3",
      name: "Test Supplier 3",
      quality: { score: 65 },
      environmentalData: {
        carbonFootprint: 180,
        energyEfficiency: "Low",
      },
    },
  ],
  rawMaterials: [
    {
      id: "1",
      name: "Test Material 1",
      quantity: 150,
      unit: "kg",
    },
    {
      id: "2",
      name: "Test Material 2",
      quantity: 80,
      unit: "kg",
    },
    {
      id: "3",
      name: "Test Material 3",
      quantity: 200,
      unit: "kg",
    },
  ],
  economicMetrics: {
    materialCosts: [
      { month: "Jan", amount: 50000 },
      { month: "Feb", amount: 55000 },
      { month: "Mar", amount: 48000 },
      { month: "Apr", amount: 52000 },
    ],
    transportationCosts: [
      { month: "Jan", amount: 15000 },
      { month: "Feb", amount: 16000 },
      { month: "Mar", amount: 14000 },
      { month: "Apr", amount: 15500 },
    ],
    storageCosts: [
      { month: "Jan", amount: 8000 },
      { month: "Feb", amount: 8500 },
      { month: "Mar", amount: 7500 },
      { month: "Apr", amount: 8200 },
    ],
  },
  supplierMaterialPricing: [],
};

export function DashboardOverview() {
  const {
    suppliers,
    rawMaterials,
    economicMetrics,
    supplierMaterialPricing,
    loading,
  } = useLocalData();

  const [useTestData, setUseTestData] = useState(false);

  // Memoize the data object to prevent unnecessary recreations
  const data = useMemo(() => 
    useTestData ? mockData : {
      suppliers,
      rawMaterials,
      economicMetrics,
      supplierMaterialPricing,
    },
    [useTestData, suppliers, rawMaterials, economicMetrics, supplierMaterialPricing]
  );

  const [metrics, setMetrics] = useState<Metrics>(() => ({
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalMaterials: 0,
    activeMaterials: 0,
    carbonFootprint: 0,
    renewableEnergy: 0,
    totalMaterialCost: 0,
    totalTransportationCost: 0,
    totalStorageCost: 0,
    qualityScore: 0,
    supplierQualityDistribution: {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
    },
    monthlyData: {
      carbonFootprint: [],
      materialCost: [],
      qualityScore: [],
    },
  }));

  // Update metrics when data changes
  useEffect(() => {
    if (!data.suppliers || !data.rawMaterials || !data.economicMetrics) return;

    // Basic metrics
    const totalSuppliers = data.suppliers.length;
    const activeSuppliers = data.suppliers.filter(
      (s) => s.quality.score >= 70
    ).length;
    const totalMaterials = data.rawMaterials.length;
    const activeMaterials = data.rawMaterials.filter((m) => m.quantity > 0).length;

    // Environmental metrics
    const carbonFootprint = data.suppliers.reduce(
      (acc, s) => acc + (s.environmentalData?.carbonFootprint || 0),
      0
    );

    const renewableEnergy =
      data.suppliers.reduce(
        (acc, s) =>
          acc +
          (s.environmentalData?.energyEfficiency === "High"
            ? 100
            : s.environmentalData?.energyEfficiency === "Medium"
            ? 50
            : 0),
        0
      ) / (totalSuppliers || 1);

    // Economic metrics
    const totalMaterialCost =
      data.economicMetrics?.materialCosts?.reduce(
        (acc, cost) => acc + cost.amount,
        0
      ) || 0;

    const totalTransportationCost =
      data.economicMetrics?.transportationCosts?.reduce(
        (acc, cost) => acc + cost.amount,
        0
      ) || 0;

    const totalStorageCost =
      data.economicMetrics?.storageCosts?.reduce(
        (acc, cost) => acc + cost.amount,
        0
      ) || 0;

    // Quality metrics
    const qualityScore =
      data.suppliers.reduce((acc, s) => acc + (s.quality?.score || 0), 0) /
      (totalSuppliers || 1);

    // Monthly data calculations
    const monthlyData = {
      carbonFootprint: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toLocaleString("default", {
          month: "short",
        }),
        value: Math.random() * 100,
      })),
      materialCost:
        data.economicMetrics?.materialCosts?.map((cost) => ({
          month: cost.month,
          value: cost.amount,
        })) || [],
      qualityScore: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i).toLocaleString("default", {
          month: "short",
        }),
        value: Math.random() * 100,
      })),
    };

    // Calculate supplier quality distribution
    const supplierQualityDistribution = {
      excellent: data.suppliers.filter((s) => (s.quality?.score || 0) >= 90).length,
      good: data.suppliers.filter(
        (s) => (s.quality?.score || 0) >= 75 && (s.quality?.score || 0) < 90
      ).length,
      average: data.suppliers.filter(
        (s) => (s.quality?.score || 0) >= 60 && (s.quality?.score || 0) < 75
      ).length,
      poor: data.suppliers.filter((s) => (s.quality?.score || 0) < 60).length,
    };

    // Combine all metrics
    const newMetrics: Metrics = {
      totalSuppliers,
      activeSuppliers,
      totalMaterials,
      activeMaterials,
      carbonFootprint,
      renewableEnergy,
      totalMaterialCost,
      totalTransportationCost,
      totalStorageCost,
      qualityScore,
      supplierQualityDistribution,
      monthlyData,
    };

    setMetrics(newMetrics);
  }, [data.suppliers, data.rawMaterials, data.economicMetrics]);

  // Memoize the color array to prevent unnecessary recreations
  const pieColors = ["#3b82f6", "#10b981", "#f59e0b"];

  // Memoize the alerts content to prevent rendering issues
  const alertsContent = useMemo(() => {
    if (!suppliers || !rawMaterials) return null;

    return (
      <div className="space-y-4">
        {suppliers
          .filter((s) => s.quality.score < 70)
          .map((supplier) => (
            <Alert key={supplier.id} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Quality Alert</AlertTitle>
              <AlertDescription>
                Supplier {supplier.name} has a low quality score of{" "}
                {supplier.quality.score.toFixed(1)}
              </AlertDescription>
            </Alert>
          ))}
        {rawMaterials
          .filter((m) => m.quantity < 100)
          .map((material) => (
            <Alert key={material.id}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Low Stock Alert</AlertTitle>
              <AlertDescription>
                {material.name} is running low on stock ({material.quantity}{" "}
                {material.unit} remaining)
              </AlertDescription>
            </Alert>
          ))}
      </div>
    );
  }, [suppliers, rawMaterials]);

  // Memoize chart configurations for better performance
  const chartConfig = useMemo(() => ({
    lineChart: {
      mobile: {
        margin: { top: 10, right: 10, left: 0, bottom: 20 },
        height: 200,
        fontSize: 12,
        strokeWidth: 2,
      },
      desktop: {
        margin: { top: 20, right: 30, left: 20, bottom: 5 },
        height: 300,
        fontSize: 14,
        strokeWidth: 2,
      }
    },
    barChart: {
      mobile: {
        margin: { top: 10, right: 10, left: 0, bottom: 20 },
        height: 200,
        fontSize: 12,
        barSize: 20,
      },
      desktop: {
        margin: { top: 20, right: 30, left: 20, bottom: 5 },
        height: 300,
        fontSize: 14,
        barSize: 30,
      }
    }
  }), []);

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-muted-foreground">
                Monitor your supply chain metrics and performance indicators
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="test-data"
                checked={useTestData}
                onCheckedChange={(checked) => setUseTestData(checked as boolean)}
              />
              <Label htmlFor="test-data">Use Test Data</Label>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[120px]" />
                    <Skeleton className="h-4 w-[80px] mt-4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your supply chain metrics and performance indicators
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="test-data"
          checked={useTestData}
          onCheckedChange={(checked) => setUseTestData(checked as boolean)}
        />
        <Label htmlFor="test-data">Use test data</Label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px] mb-2" />
                <Skeleton className="h-4 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="environmental">Environmental</TabsTrigger>
            <TabsTrigger value="economic">Economic</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Suppliers
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalSuppliers}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.activeSuppliers} active suppliers
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Materials
                  </CardTitle>
                  <ArrowUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.totalMaterials}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.activeMaterials} active materials
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Quality Score
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.qualityScore.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average supplier quality
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Cost
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${metrics.totalMaterialCost.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Material costs
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Monthly Carbon Footprint</CardTitle>
                  <CardDescription>
                    Track your carbon emissions over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.monthlyData.carbonFootprint}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Carbon Footprint"
                        stroke="#16a34a"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Quality Distribution</CardTitle>
                  <CardDescription>
                    Supplier quality score distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Excellent",
                            value: metrics.supplierQualityDistribution.excellent,
                          },
                          {
                            name: "Good",
                            value: metrics.supplierQualityDistribution.good,
                          },
                          {
                            name: "Average",
                            value: metrics.supplierQualityDistribution.average,
                          },
                          {
                            name: "Poor",
                            value: metrics.supplierQualityDistribution.poor,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#16a34a" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#dc2626" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Recent Alerts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Carbon Footprint Alert</AlertTitle>
                  <AlertDescription>
                    Carbon footprint has increased by 5% this month.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Quality Score Alert</AlertTitle>
                  <AlertDescription>
                    2 suppliers have quality scores below threshold.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="environmental" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Carbon Footprint</CardTitle>
                  <CardDescription>
                    Total carbon emissions from suppliers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">
                    {metrics.carbonFootprint.toFixed(1)} tons CO2e
                  </div>
                  <div className="h-[200px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={metrics.monthlyData.carbonFootprint}
                        margin={window.innerWidth < 768 ? 
                          chartConfig.lineChart.mobile.margin : 
                          chartConfig.lineChart.desktop.margin}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                          interval={window.innerWidth < 768 ? 1 : 0}
                        />
                        <YAxis
                          tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                          width={window.innerWidth < 768 ? 30 : 40}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--background)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            fontSize: window.innerWidth < 768 ? 12 : 14,
                          }}
                        />
                        <Legend 
                          wrapperStyle={{
                            fontSize: window.innerWidth < 768 ? 12 : 14,
                            paddingTop: '10px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Carbon Footprint"
                          stroke="var(--primary)"
                          strokeWidth={window.innerWidth < 768 ? 2 : 3}
                          dot={{ r: window.innerWidth < 768 ? 3 : 4 }}
                          activeDot={{ r: window.innerWidth < 768 ? 6 : 8 }}
                        />
                        <ReferenceLine
                          y={metrics.carbonFootprint * 0.8}
                          label={{
                            value: "Target",
                            fontSize: window.innerWidth < 768 ? 12 : 14,
                            position: "right",
                          }}
                          stroke="var(--destructive)"
                          strokeDasharray="3 3"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Renewable Energy Usage</CardTitle>
                  <CardDescription>
                    Percentage of renewable energy used by suppliers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">
                    {metrics.renewableEnergy.toFixed(1)}%
                  </div>
                  <div className="h-[200px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "Solar", value: metrics.renewableEnergy * 0.4 },
                          { name: "Wind", value: metrics.renewableEnergy * 0.35 },
                          { name: "Hydro", value: metrics.renewableEnergy * 0.25 },
                        ]}
                        margin={window.innerWidth < 768 ? 
                          chartConfig.barChart.mobile.margin : 
                          chartConfig.barChart.desktop.margin}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis 
                          dataKey="name"
                          tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                        />
                        <YAxis
                          tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                          width={window.innerWidth < 768 ? 30 : 40}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--background)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            fontSize: window.innerWidth < 768 ? 12 : 14,
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="var(--primary)"
                          radius={[4, 4, 0, 0]}
                          barSize={window.innerWidth < 768 ? 20 : 30}
                        >
                          <LabelList 
                            dataKey="value" 
                            position="top"
                            style={{
                              fontSize: window.innerWidth < 768 ? 12 : 14,
                              fill: 'var(--foreground)',
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="economic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total Material Cost</CardTitle>
                  <CardDescription>
                    Cost breakdown of raw materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-4">
                    ${metrics.totalMaterialCost.toLocaleString()}
                  </div>
                  <div className="h-[200px] md:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={metrics.monthlyData.materialCost}
                        margin={window.innerWidth < 768 ? 
                          chartConfig.lineChart.mobile.margin : 
                          chartConfig.lineChart.desktop.margin}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis 
                          dataKey="month"
                          tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                          interval={window.innerWidth < 768 ? 1 : 0}
                        />
                        <YAxis
                          tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                          width={window.innerWidth < 768 ? 30 : 40}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--background)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            fontSize: window.innerWidth < 768 ? 12 : 14,
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, "Cost"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="var(--primary)"
                          strokeWidth={window.innerWidth < 768 ? 2 : 3}
                          dot={{ r: window.innerWidth < 768 ? 3 : 4 }}
                          activeDot={{ r: window.innerWidth < 768 ? 6 : 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Transportation & Storage Cost</CardTitle>
                  <CardDescription>Logistics cost breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    $
                    {(
                      metrics.totalTransportationCost + metrics.totalStorageCost
                    ).toLocaleString()}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={[
                        {
                          name: "Transportation",
                          value: metrics.totalTransportationCost,
                        },
                        { name: "Storage", value: metrics.totalStorageCost },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6">
                        <LabelList dataKey="value" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Score Trend</CardTitle>
                  <CardDescription>
                    Average supplier quality score over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.qualityScore.toFixed(1)}%
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={[
                        { month: "Jan", value: metrics.qualityScore * 0.95 },
                        { month: "Feb", value: metrics.qualityScore * 0.98 },
                        { month: "Mar", value: metrics.qualityScore * 0.92 },
                        { month: "Apr", value: metrics.qualityScore },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                      <ReferenceLine
                        y={90}
                        label="Target"
                        stroke="red"
                        strokeDasharray="3 3"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quality Distribution</CardTitle>
                  <CardDescription>
                    Supplier quality score distribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={[
                        {
                          name: "Excellent",
                          value: metrics.supplierQualityDistribution.excellent,
                        },
                        {
                          name: "Good",
                          value: metrics.supplierQualityDistribution.good,
                        },
                        {
                          name: "Average",
                          value: metrics.supplierQualityDistribution.average,
                        },
                        {
                          name: "Poor",
                          value: metrics.supplierQualityDistribution.poor,
                        },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981">
                        <LabelList dataKey="value" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
