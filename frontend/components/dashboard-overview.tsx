"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
  FileText,
  Leaf,
  Percent,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useDataCollection } from "@/hooks/useDataCollection";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--warning)",
  "var(--secondary)",
];

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  time: string;
}

interface EnvironmentalData {
  carbonFootprint: number;
  waterUsage: number;
  wasteGenerated: number;
  renewableEnergyUse: number;
}

export function DashboardOverview() {
  const { suppliers, rawMaterials, fetchSuppliers, fetchRawMaterials } =
    useDataCollection();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchSuppliers(), fetchRawMaterials()]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchSuppliers, fetchRawMaterials]);

  // Calculate metrics from real data
  const calculateMetrics = () => {
    const totalSuppliers = suppliers.length || 1;

    // Calculate average quality score from raw material quality data
    const materialQualityScores = rawMaterials.map(
      (m) => m.quality?.score || 0
    );
    const avgQualityScore =
      materialQualityScores.reduce((acc, score) => acc + score, 0) /
      materialQualityScores.length;

    // Calculate environmental metrics from supplier data
    const environmentalMetrics = suppliers.map((s) => {
      const envData = s.environmentalData;
      return {
        carbonFootprint: envData?.carbonFootprint || 0,
        waterUsage: 0, // Add if available in your data
        wasteGenerated: 0, // Add if available in your data
        renewableEnergyUse: 0, // Add if available in your data
      };
    });

    // Calculate economic metrics from raw materials
    const materialCosts = rawMaterials.map((m) => {
      const ecoData = m.economicData;
      return {
        name: m.name,
        totalCost: (ecoData?.unitCost || 0) * m.quantity,
        transportationCost: ecoData?.transportationCost || 0,
        storageCost: ecoData?.storageCost || 0,
      };
    });

    // Calculate supplier distribution by quality score
    const supplierQualityDistribution = {
      excellent: suppliers.filter((s) => (s.quality || 0) >= 90).length,
      good: suppliers.filter(
        (s) => (s.quality || 0) >= 80 && (s.quality || 0) < 90
      ).length,
      average: suppliers.filter(
        (s) => (s.quality || 0) >= 70 && (s.quality || 0) < 80
      ).length,
      poor: suppliers.filter((s) => (s.quality || 0) < 70).length,
    };

    return {
      qualityScore: avgQualityScore,
      carbonFootprint:
        environmentalMetrics.reduce((acc, e) => acc + e.carbonFootprint, 0) /
        totalSuppliers,
      renewableEnergy:
        environmentalMetrics.reduce((acc, e) => acc + e.renewableEnergyUse, 0) /
        totalSuppliers,
      materialCosts,
      supplierQualityDistribution,
      totalMaterialCost: materialCosts.reduce((acc, m) => acc + m.totalCost, 0),
      totalTransportationCost: materialCosts.reduce(
        (acc, m) => acc + m.transportationCost,
        0
      ),
      totalStorageCost: materialCosts.reduce(
        (acc, m) => acc + m.storageCost,
        0
      ),
    };
  };

  const metrics = calculateMetrics();

  // Generate alerts based on real data
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    // Quality alerts
    rawMaterials.forEach((material) => {
      if (material.quality && material.quality.score < 75) {
        alerts.push({
          id: alerts.length + 1,
          title: "Low Quality Score",
          description: `${material.name} quality score is below threshold (${material.quality.score}/100)`,
          severity: "high",
          time: "Now",
        });
      }
    });

    // Cost alerts
    rawMaterials.forEach((material) => {
      const costPerUnit = material.economicData?.totalCostPerUnit || 0;
      if (costPerUnit > 1000) {
        // Adjust threshold as needed
        alerts.push({
          id: alerts.length + 1,
          title: "High Cost Material",
          description: `${material.name} has a high cost per unit ($${costPerUnit})`,
          severity: "medium",
          time: "Now",
        });
      }
    });

    // Supplier alerts
    suppliers.forEach((supplier) => {
      if (!supplier.certifications || supplier.certifications.length === 0) {
        alerts.push({
          id: alerts.length + 1,
          title: "Missing Certifications",
          description: `${supplier.name} has no certifications recorded`,
          severity: "low",
          time: "Now",
        });
      }
    });

    return alerts;
  };

  const alerts = generateAlerts();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="h-80">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Raw Materials
                </CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{rawMaterials.length}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    Total Materials Tracked
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Suppliers
                </CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    Global Soybean Suppliers
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Quality Score
                </CardTitle>
                <Percent className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.qualityScore.toFixed(1)}/100
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    Average Quality
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Cost
                </CardTitle>
                <Wallet className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${metrics.totalMaterialCost.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-warning flex items-center">
                    <TrendingUp className="mr-1 h-4 w-4" />
                    Total Material Cost
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Material Cost Distribution</CardTitle>
                <CardDescription>
                  Cost breakdown by material type
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.materialCosts}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="totalCost"
                      fill="#3b82f6"
                      name="Total Cost ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quality Distribution</CardTitle>
                <CardDescription>Supplier quality scores</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Excellent (90+)",
                          value: suppliers.filter((s) => (s.quality || 0) >= 90)
                            .length,
                        },
                        {
                          name: "Good (80-90)",
                          value: suppliers.filter(
                            (s) =>
                              (s.quality || 0) >= 80 && (s.quality || 0) < 90
                          ).length,
                        },
                        {
                          name: "Average (70-80)",
                          value: suppliers.filter(
                            (s) =>
                              (s.quality || 0) >= 70 && (s.quality || 0) < 80
                          ).length,
                        },
                        {
                          name: "Poor (<70)",
                          value: suppliers.filter((s) => (s.quality || 0) < 70)
                            .length,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Real-time warnings and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex flex-col space-y-2 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-full ${
                              alert.severity === "high"
                                ? "bg-destructive/20 text-destructive"
                                : alert.severity === "medium"
                                ? "bg-warning/20 text-warning"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <span className="ml-2 font-medium">
                            {alert.title}
                          </span>
                        </div>
                        <Badge
                          variant={
                            alert.severity === "high"
                              ? "destructive"
                              : alert.severity === "medium"
                              ? "default"
                              : "outline"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {alert.time}
                        </span>
                        <Button variant="ghost" size="sm">
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Carbon Footprint</CardTitle>
                <CardDescription>
                  Total emissions across supply chain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12.5 tons CO2e</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500 flex items-center">
                    <ArrowDown className="mr-1 h-4 w-4" />
                    -8.3% from previous quarter
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Water Usage</CardTitle>
                <CardDescription>Total water consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.8M gallons</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500 flex items-center">
                    <ArrowDown className="mr-1 h-4 w-4" />
                    -5.2% from previous quarter
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Land Utilization</CardTitle>
                <CardDescription>Land area impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">450 acres</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-red-500 flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    +2.1% from previous quarter
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Carbon Footprint Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Carbon Footprint Trend</CardTitle>
              <CardDescription>
                Year-to-date carbon emissions (tons CO2e)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", value: 15.2 },
                    { month: "Feb", value: 14.8 },
                    { month: "Mar", value: 14.5 },
                    { month: "Apr", value: 13.9 },
                    { month: "May", value: 13.2 },
                    { month: "Jun", value: 12.5 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip
                    formatter={(value) => [`${value} tons CO2e`, "Carbon"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    name="Carbon Emissions"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Water Usage Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Water Usage Trend</CardTitle>
              <CardDescription>
                Year-to-date water consumption (M gallons)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", value: 2.1 },
                    { month: "Feb", value: 2.0 },
                    { month: "Mar", value: 1.9 },
                    { month: "Apr", value: 1.9 },
                    { month: "May", value: 1.8 },
                    { month: "Jun", value: 1.8 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip
                    formatter={(value) => [`${value}M gallons`, "Water"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    name="Water Usage"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Waste Generation Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Generation Trend</CardTitle>
              <CardDescription>
                Year-to-date waste produced (tons)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", value: 8.3 },
                    { month: "Feb", value: 8.1 },
                    { month: "Mar", value: 7.8 },
                    { month: "Apr", value: 7.5 },
                    { month: "May", value: 7.2 },
                    { month: "Jun", value: 6.9 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip formatter={(value) => [`${value} tons`, "Waste"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f59e0b"
                    name="Waste Generation"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Energy Usage Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Energy Usage Trend</CardTitle>
              <CardDescription>
                Year-to-date energy consumption (MWh)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", value: 245 },
                    { month: "Feb", value: 238 },
                    { month: "Mar", value: 230 },
                    { month: "Apr", value: 225 },
                    { month: "May", value: 218 },
                    { month: "Jun", value: 210 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip formatter={(value) => [`${value} MWh`, "Energy"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    name="Energy Usage"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Land Use Impact Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Land Use Impact Trend</CardTitle>
              <CardDescription>
                Year-to-date land utilization (acres)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", value: 430 },
                    { month: "Feb", value: 432 },
                    { month: "Mar", value: 435 },
                    { month: "Apr", value: 439 },
                    { month: "May", value: 445 },
                    { month: "Jun", value: 450 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip formatter={(value) => [`${value} acres`, "Land"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4b5563"
                    name="Land Utilization"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Toxicity Impact Graph */}
          <Card>
            <CardHeader>
              <CardTitle>Toxicity Impact Trend</CardTitle>
              <CardDescription>
                Year-to-date toxicity impact (comparative toxic units)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", value: 25.6 },
                    { month: "Feb", value: 24.9 },
                    { month: "Mar", value: 24.2 },
                    { month: "Apr", value: 23.8 },
                    { month: "May", value: 23.1 },
                    { month: "Jun", value: 22.5 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip
                    formatter={(value) => [`${value} CTU`, "Toxicity"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#9333ea"
                    name="Toxicity Impact"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="economic" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Annual Savings</CardTitle>
                <CardDescription>
                  Potential savings with optimal supplier selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$48,100</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500 flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    +12.4% from previous assessment
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Average Cost Reduction</CardTitle>
                <CardDescription>
                  Average supplier cost difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">9.7%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500 flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    +1.3% from previous quarter
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Suppliers Compared</CardTitle>
                <CardDescription>Active supplier comparisons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">14</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-blue-500 flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    +3 from previous quarter
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Supplier Cost Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Material Cost Comparison by Supplier</CardTitle>
              <CardDescription>
                Cost comparison for key raw materials across different suppliers
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: "Material A",
                      supplier1: 84500,
                      supplier2: 78200,
                      supplier3: 92300,
                      savings: 14100,
                    },
                    {
                      name: "Material B",
                      supplier1: 56700,
                      supplier2: 61300,
                      supplier3: 52800,
                      savings: 8500,
                    },
                    {
                      name: "Material C",
                      supplier1: 112400,
                      supplier2: 98600,
                      supplier3: 105800,
                      savings: 13800,
                    },
                    {
                      name: "Material D",
                      supplier1: 43200,
                      supplier2: 38700,
                      supplier3: 41500,
                      savings: 4500,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="supplier1" name="Supplier A" fill="#3b82f6" />
                  <Bar dataKey="supplier2" name="Supplier B" fill="#10b981" />
                  <Bar dataKey="supplier3" name="Supplier C" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Potential Cost Savings */}
          <Card>
            <CardHeader>
              <CardTitle>Potential Cost Savings by Material</CardTitle>
              <CardDescription>
                Estimated annual savings by selecting optimal supplier for each
                material
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: "Material A", savings: 14100 },
                    { name: "Material B", savings: 8500 },
                    { name: "Material C", savings: 13800 },
                    { name: "Material D", savings: 4500 },
                    { name: "Material E", savings: 7200 },
                  ]}
                  margin={{ top: 20, right: 30, left: 80, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Annual Savings",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="savings"
                    name="Potential Annual Savings"
                    fill="#22c55e"
                  >
                    <LabelList
                      dataKey="savings"
                      position="right"
                      formatter={(value: number) =>
                        `$${value.toLocaleString()}`
                      }
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cumulative Savings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cumulative Cost Savings Trend</CardTitle>
              <CardDescription>
                Projected cost savings over time with optimal supplier selection
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", value: 0 },
                    { month: "Feb", value: 4008 },
                    { month: "Mar", value: 8175 },
                    { month: "Apr", value: 12340 },
                    { month: "May", value: 16512 },
                    { month: "Jun", value: 20683 },
                    { month: "Jul", value: 24850 },
                    { month: "Aug", value: 29017 },
                    { month: "Sep", value: 33185 },
                    { month: "Oct", value: 37350 },
                    { month: "Nov", value: 41522 },
                    { month: "Dec", value: 48100 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Cumulative Savings",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="Cumulative Savings"
                    activeDot={{ r: 8 }}
                  />
                  <ReferenceLine y={0} stroke="#666" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Optimization Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization Opportunities</CardTitle>
              <CardDescription>
                Material categories with highest potential for cost reduction
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Raw Materials", value: 48100, fill: "#3b82f6" },
                      { name: "Packaging", value: 32600, fill: "#10b981" },
                      { name: "Transportation", value: 24300, fill: "#f59e0b" },
                      { name: "Storage", value: 18700, fill: "#6366f1" },
                      {
                        name: "Quality Control",
                        value: 13500,
                        fill: "#ec4899",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Potential Savings",
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Overall Raw Material Quality</CardTitle>
                <CardDescription>
                  Average quality score across all materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92/100</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500 flex items-center">
                    <ArrowUp className="mr-1 h-4 w-4" />
                    +3.2% from previous quarter
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Defect Rate</CardTitle>
                <CardDescription>Raw material rejection rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.8%</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500 flex items-center">
                    <ArrowDown className="mr-1 h-4 w-4" />
                    -0.5% from previous quarter
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customer Complaints</CardTitle>
                <CardDescription>Current quarter complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="text-green-500 flex items-center">
                    <ArrowDown className="mr-1 h-4 w-4" />
                    -12% from previous quarter
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Supplier Quality Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Quality Performance</CardTitle>
              <CardDescription>
                Aggregated quality scores by supplier
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: "Supplier A", score: 95 },
                    { name: "Supplier B", score: 92 },
                    { name: "Supplier C", score: 88 },
                    { name: "Supplier D", score: 85 },
                    { name: "Supplier E", score: 82 },
                  ]}
                  margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[75, 100]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value}/100`,
                      "Quality Score",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="score" fill="#3b82f6" name="Quality Score">
                    <LabelList
                      dataKey="score"
                      position="right"
                      formatter={(value: number) => `${value}/100`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Raw Material Quality by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Raw Material Quality by Category</CardTitle>
              <CardDescription>
                Quality scores across different material categories
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "Material A", quality: 94 },
                    { name: "Material B", quality: 89 },
                    { name: "Material C", quality: 96 },
                    { name: "Material D", quality: 91 },
                    { name: "Material E", quality: 87 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value}/100`,
                      "Quality Score",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="quality" name="Quality Score" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Customer Complaints Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Complaints Trend</CardTitle>
              <CardDescription>
                Monthly customer complaints related to quality issues
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: "Jan", value: 38 },
                    { month: "Feb", value: 35 },
                    { month: "Mar", value: 31 },
                    { month: "Apr", value: 28 },
                    { month: "May", value: 26 },
                    { month: "Jun", value: 24 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 50]} />
                  <Tooltip
                    formatter={(value: number) => [`${value}`, "Complaints"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    name="Customer Complaints"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quality Issues by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Issues by Type</CardTitle>
              <CardDescription>
                Breakdown of quality issues by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Contamination", value: 38, fill: "#ef4444" },
                      {
                        name: "Specification Deviation",
                        value: 27,
                        fill: "#f59e0b",
                      },
                      { name: "Packaging", value: 18, fill: "#3b82f6" },
                      { name: "Labeling", value: 12, fill: "#10b981" },
                      { name: "Other", value: 5, fill: "#6366f1" },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} issues`, "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quality Consistency by Supplier */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Consistency by Supplier</CardTitle>
              <CardDescription>
                Standard deviation in quality scores (lower is better)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: "Supplier A", deviation: 1.2 },
                    { name: "Supplier B", deviation: 1.8 },
                    { name: "Supplier C", deviation: 3.2 },
                    { name: "Supplier D", deviation: 2.7 },
                    { name: "Supplier E", deviation: 4.1 },
                  ]}
                  margin={{ top: 20, right: 30, left: 100, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 5]} />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip
                    formatter={(value: number) => [
                      `±${value.toFixed(1)}`,
                      "Std Deviation",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="deviation"
                    fill="#9333ea"
                    name="Quality Variability"
                  >
                    <LabelList
                      dataKey="deviation"
                      position="right"
                      formatter={(value: number) => `±${value.toFixed(1)}`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
