"use client";

import { useMemo } from "react";
import { Supplier, RawMaterial } from "@/lib/data-collection-utils-browser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Truck,
  Package,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
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
} from "recharts";

interface CostAnalysisProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
}

export function CostAnalysis({ suppliers, materials }: CostAnalysisProps) {
  // Calculate cost metrics
  const costMetrics = useMemo(() => {
    return suppliers.map((supplier) => {
      // Get relevant materials for this supplier
      const supplierMaterials = materials.filter((m) =>
        supplier.materials.includes(m.name)
      );

      // Calculate total material cost
      const materialCost = supplierMaterials.reduce(
        (total, material) => total + (material.economicData?.unitCost || 0),
        0
      );

      // Calculate transportation cost (example calculation)
      const transportationCost = supplierMaterials.reduce(
        (total, material) =>
          total + (material.economicData?.transportationCost || 0),
        0
      );

      // Calculate storage cost
      const storageCost = supplierMaterials.reduce(
        (total, material) => total + (material.economicData?.storageCost || 0),
        0
      );

      // Calculate total cost
      const totalCost = materialCost + transportationCost + storageCost;

      return {
        name: supplier.name,
        materialCost,
        transportationCost,
        storageCost,
        totalCost,
      };
    });
  }, [suppliers, materials]);

  // Calculate cost distribution
  const costDistribution = useMemo(() => {
    const totalMaterialCost = costMetrics.reduce(
      (sum, metric) => sum + metric.materialCost,
      0
    );
    const totalTransportationCost = costMetrics.reduce(
      (sum, metric) => sum + metric.transportationCost,
      0
    );
    const totalStorageCost = costMetrics.reduce(
      (sum, metric) => sum + metric.storageCost,
      0
    );

    return [
      { name: "Material Cost", value: totalMaterialCost },
      { name: "Transportation Cost", value: totalTransportationCost },
      { name: "Storage Cost", value: totalStorageCost },
    ];
  }, [costMetrics]);

  // Calculate material cost trends
  const materialCostTrends = useMemo(() => {
    return materials.map((material) => ({
      name: material.name,
      unitCost: material.economicData?.unitCost || 0,
      transportCost: material.economicData?.transportationCost || 0,
      storageCost: material.economicData?.storageCost || 0,
    }));
  }, [materials]);

  if (suppliers.length === 0 || materials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select suppliers and materials to view cost analysis
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            Total Cost Comparison
          </CardTitle>
          <CardDescription>
            Compare total costs across suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `$${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
                <Legend />
                <Bar
                  dataKey="materialCost"
                  name="Material Cost"
                  fill="#22c55e"
                  stackId="a"
                />
                <Bar
                  dataKey="transportationCost"
                  name="Transportation Cost"
                  fill="#3b82f6"
                  stackId="a"
                />
                <Bar
                  dataKey="storageCost"
                  name="Storage Cost"
                  fill="#f59e0b"
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Cost Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of different cost components
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.name}
                  >
                    {costDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? "#22c55e"
                            : index === 1
                            ? "#3b82f6"
                            : "#f59e0b"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `$${value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Material Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Material Cost Analysis
            </CardTitle>
            <CardDescription>Cost breakdown by material</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={materialCostTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      `$${value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="unitCost"
                    name="Unit Cost"
                    stroke="#22c55e"
                  />
                  <Line
                    type="monotone"
                    dataKey="transportCost"
                    name="Transport Cost"
                    stroke="#3b82f6"
                  />
                  <Line
                    type="monotone"
                    dataKey="storageCost"
                    name="Storage Cost"
                    stroke="#f59e0b"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cost Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {costMetrics.map((metric) => (
                <div
                  key={metric.name}
                  className="space-y-4 p-4 border rounded-lg"
                >
                  <h3 className="font-medium">{metric.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Material Cost
                      </span>
                      <Badge variant="outline">
                        $
                        {metric.materialCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Transportation Cost
                      </span>
                      <Badge variant="outline">
                        $
                        {metric.transportationCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Storage Cost
                      </span>
                      <Badge variant="outline">
                        $
                        {metric.storageCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Cost</span>
                      <Badge>
                        $
                        {metric.totalCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
