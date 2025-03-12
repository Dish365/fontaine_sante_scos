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
  Leaf,
  Droplets,
  Mountain,
  TreePine,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Scale,
  AlertTriangle,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Progress } from "@/components/ui/progress";

interface MaterialAnalysisProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
}

export function MaterialAnalysis({
  suppliers,
  materials,
}: MaterialAnalysisProps) {
  // Calculate quality metrics
  const qualityMetrics = useMemo(() => {
    return materials.map((material) => {
      // Example quality calculations (these would be based on real data in production)
      const defectRate = Math.random() * 5; // 0-5%
      const qualityScore = 100 - defectRate * 5; // Convert defect rate to quality score
      const consistencyScore = Math.random() * 20 + 80; // 80-100%
      const durabilityScore = Math.random() * 20 + 80; // 80-100%

      return {
        name: material.name,
        defectRate,
        qualityScore,
        consistencyScore,
        durabilityScore,
      };
    });
  }, [materials]);

  // Calculate environmental metrics
  const environmentalMetrics = useMemo(() => {
    return materials.map((material) => {
      // Example environmental impact calculations
      const carbonFootprint = Math.random() * 100; // CO2 equivalent
      const waterUsage = Math.random() * 1000; // Liters per unit
      const landUse = Math.random() * 10; // Square meters per unit
      const biodiversityImpact = Math.random() * 100; // Impact score

      return {
        name: material.name,
        metrics: {
          carbonFootprint,
          waterUsage,
          landUse,
          biodiversityImpact,
        },
      };
    });
  }, [materials]);

  // Calculate usage patterns
  const usagePatterns = useMemo(() => {
    return materials.map((material) => {
      const supplierCount = suppliers.filter((s) =>
        s.materials.includes(material.name)
      ).length;

      // Example usage calculations
      const monthlyUsage = Math.random() * 1000 + 500; // Units per month
      const reorderFrequency = Math.random() * 10 + 5; // Days
      const wastageRate = Math.random() * 5; // Percentage

      return {
        name: material.name,
        supplierCount,
        monthlyUsage,
        reorderFrequency,
        wastageRate,
      };
    });
  }, [materials, suppliers]);

  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select materials to view analysis
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quality Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Material Quality Analysis
          </CardTitle>
          <CardDescription>
            Quality metrics and defect rates for materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="qualityScore"
                    name="Quality Score"
                    fill="#22c55e"
                  />
                  <Bar
                    dataKey="defectRate"
                    name="Defect Rate (%)"
                    fill="#ef4444"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {qualityMetrics.map((metric) => (
                <div key={metric.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{metric.name}</span>
                    <Badge
                      variant={
                        metric.defectRate < 2 ? "default" : "destructive"
                      }
                    >
                      {metric.defectRate.toFixed(1)}% defects
                    </Badge>
                  </div>
                  <Progress value={metric.qualityScore} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Consistency: {metric.consistencyScore.toFixed(1)}%
                    </span>
                    <span>
                      Durability: {metric.durabilityScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Environmental Impact Analysis
          </CardTitle>
          <CardDescription>
            Environmental metrics for each material
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {environmentalMetrics.map((metric) => (
              <div
                key={metric.name}
                className="border rounded-lg p-4 space-y-4"
              >
                <h3 className="font-medium">{metric.name}</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[metric.metrics]}>
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="name"
                        tickFormatter={(value) =>
                          value.charAt(0).toUpperCase() + value.slice(1)
                        }
                      />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Impact"
                        dataKey="value"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Carbon Footprint</p>
                      <p className="text-sm text-muted-foreground">
                        {metric.metrics.carbonFootprint.toFixed(1)} CO2e
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Water Usage</p>
                      <p className="text-sm text-muted-foreground">
                        {metric.metrics.waterUsage.toFixed(1)} L
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mountain className="h-4 w-4 text-orange-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Land Use</p>
                      <p className="text-sm text-muted-foreground">
                        {metric.metrics.landUse.toFixed(1)} m²
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TreePine className="h-4 w-4 text-emerald-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Biodiversity Impact</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {metric.metrics.biodiversityImpact.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            Material Usage Patterns
          </CardTitle>
          <CardDescription>
            Analysis of material consumption and supplier distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usagePatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="monthlyUsage"
                  name="Monthly Usage"
                  fill="#3b82f6"
                />
                <Bar
                  yAxisId="right"
                  dataKey="supplierCount"
                  name="Supplier Count"
                  fill="#22c55e"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {usagePatterns.map((pattern) => (
              <div
                key={pattern.name}
                className="border rounded-lg p-4 space-y-2"
              >
                <h4 className="font-medium">{pattern.name}</h4>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Monthly Usage:
                    </span>
                    <span>{pattern.monthlyUsage.toFixed(0)} units</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Reorder Frequency:
                    </span>
                    <span>{pattern.reorderFrequency.toFixed(1)} days</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Wastage Rate:</span>
                    <span>{pattern.wastageRate.toFixed(1)}%</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Suppliers:</span>
                    <span>{pattern.supplierCount}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
