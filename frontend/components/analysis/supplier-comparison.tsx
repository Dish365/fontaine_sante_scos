"use client";

import { useMemo } from "react";
import { Supplier, RawMaterial } from "@/lib/data-collection-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  TrendingUp,
  Award,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Progress } from "@/components/ui/progress";

interface SupplierComparisonProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
}

// Calculate material coverage with null checks
const calculateMaterialCoverage = (supplier: Supplier, materials: RawMaterial[]) => {
  if (!supplier?.materials || !materials?.length) return 0;
  
  const coveredMaterials = supplier.materials.filter((materialId) =>
    materials.some((material) => material.id === materialId)
  );
  
  return (coveredMaterials.length / materials.length) * 100;
};

export function SupplierComparison({
  suppliers,
  materials,
}: SupplierComparisonProps) {
  if (!suppliers?.length || !materials?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Please select suppliers and materials to compare</p>
      </div>
    );
  }

  // Calculate comparative metrics
  const comparativeMetrics = useMemo(() => {
    return suppliers.map((supplier) => {
      // Calculate material coverage
      const materialCoverage = calculateMaterialCoverage(supplier, materials);

      // Calculate certification score (example calculation)
      const certificationScore = supplier.certifications.length * 20; // 20 points per certification, max 100

      // Calculate production capacity score (example calculation)
      const capacityScore = Math.random() * 40 + 60; // 60-100 for demo

      // Calculate transportation score (example calculation)
      const transportationScore = Math.random() * 40 + 60; // 60-100 for demo

      return {
        name: supplier.name,
        materialCoverage,
        certificationScore,
        capacityScore,
        transportationScore,
        overallScore:
          (materialCoverage +
            certificationScore +
            capacityScore +
            transportationScore) /
          4,
      };
    });
  }, [suppliers, materials]);

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    return suppliers.map((supplier) => {
      const metrics = comparativeMetrics.find((m) => m.name === supplier.name);
      return {
        name: supplier.name,
        "Material Coverage": metrics?.materialCoverage || 0,
        "Certification Score": metrics?.certificationScore || 0,
        "Production Capacity": metrics?.capacityScore || 0,
        "Transportation Efficiency": metrics?.transportationScore || 0,
      };
    });
  }, [suppliers, comparativeMetrics]);

  return (
    <div className="space-y-6">
      {/* Overall Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            Overall Supplier Comparison
          </CardTitle>
          <CardDescription>
            Compare suppliers across key performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativeMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="materialCoverage"
                  name="Material Coverage"
                  fill="#22c55e"
                />
                <Bar
                  dataKey="certificationScore"
                  name="Certification Score"
                  fill="#3b82f6"
                />
                <Bar
                  dataKey="capacityScore"
                  name="Production Capacity"
                  fill="#f59e0b"
                />
                <Bar
                  dataKey="transportationScore"
                  name="Transportation Score"
                  fill="#6366f1"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Performance Radar Analysis
          </CardTitle>
          <CardDescription>
            Multi-dimensional analysis of supplier capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis domain={[0, 100]} />
                {suppliers.map((supplier, index) => (
                  <Radar
                    key={supplier.id}
                    name={supplier.name}
                    dataKey={supplier.name}
                    stroke={
                      index === 0
                        ? "#22c55e"
                        : index === 1
                        ? "#3b82f6"
                        : "#f59e0b"
                    }
                    fill={
                      index === 0
                        ? "#22c55e"
                        : index === 1
                        ? "#3b82f6"
                        : "#f59e0b"
                    }
                    fillOpacity={0.3}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((supplier, index) => {
          const metrics = comparativeMetrics.find(
            (m) => m.name === supplier.name
          );
          return (
            <Card key={supplier.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {supplier.name}
                </CardTitle>
                <CardDescription>Detailed performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Material Coverage
                    </span>
                    <Badge variant="outline">
                      {metrics?.materialCoverage.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={metrics?.materialCoverage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Certification Score
                    </span>
                    <Badge variant="outline">
                      {metrics?.certificationScore.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress
                    value={metrics?.certificationScore}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Production Capacity
                    </span>
                    <Badge variant="outline">
                      {metrics?.capacityScore.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={metrics?.capacityScore} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Transportation Score
                    </span>
                    <Badge variant="outline">
                      {metrics?.transportationScore.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress
                    value={metrics?.transportationScore}
                    className="h-2"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Score</span>
                    <Badge>{metrics?.overallScore.toFixed(1)}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
