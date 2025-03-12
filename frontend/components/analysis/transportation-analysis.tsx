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
  Truck,
  Ship,
  Plane,
  Train,
  MapPin,
  Clock,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Progress } from "@/components/ui/progress";

interface TransportationAnalysisProps {
  suppliers: Supplier[];
  materials: RawMaterial[];
}

const TRANSPORT_MODES = ["Truck", "Rail", "Ship", "Air"] as const;
type TransportMode = (typeof TRANSPORT_MODES)[number];

const TRANSPORT_ICONS = {
  Truck: Truck,
  Rail: Train,
  Ship: Ship,
  Air: Plane,
};

const TRANSPORT_COLORS = {
  Truck: "#22c55e",
  Rail: "#3b82f6",
  Ship: "#f59e0b",
  Air: "#ef4444",
};

export function TransportationAnalysis({
  suppliers,
  materials,
}: TransportationAnalysisProps) {
  // Calculate transportation metrics
  const transportMetrics = useMemo(() => {
    return suppliers.map((supplier) => {
      const modes = supplier.transportationDetails
        .split(",")
        .map((mode) => mode.trim())
        .filter((mode): mode is TransportMode =>
          TRANSPORT_MODES.includes(mode as TransportMode)
        );

      // Calculate mode-specific metrics
      const modeMetrics = TRANSPORT_MODES.reduce((acc, mode) => {
        acc[mode] = modes.includes(mode) ? 1 : 0;
        return acc;
      }, {} as Record<TransportMode, number>);

      // Calculate transportation cost
      const supplierMaterials = materials.filter((m) =>
        supplier.materials.includes(m.name)
      );
      const transportationCost = supplierMaterials.reduce(
        (total, material) =>
          total + (material.economicData?.transportationCost || 0),
        0
      );

      return {
        name: supplier.name,
        transportationCost,
        ...modeMetrics,
      };
    });
  }, [suppliers, materials]);

  // Calculate mode distribution
  const modeDistribution = useMemo(() => {
    const distribution = TRANSPORT_MODES.map((mode) => {
      const count = transportMetrics.reduce(
        (sum, metric) => sum + (metric[mode] || 0),
        0
      );
      return {
        name: mode,
        value: count,
      };
    });

    return distribution;
  }, [transportMetrics]);

  // Calculate efficiency metrics
  const efficiencyMetrics = useMemo(() => {
    return suppliers.map((supplier) => {
      const modes = supplier.transportationDetails
        .split(",")
        .map((mode) => mode.trim())
        .filter((mode): mode is TransportMode =>
          TRANSPORT_MODES.includes(mode as TransportMode)
        );

      // Example efficiency calculations (these would be based on real data in a production environment)
      const reliability = Math.random() * 40 + 60; // 60-100%
      const costEfficiency = Math.random() * 40 + 60; // 60-100%
      const speed = Math.random() * 40 + 60; // 60-100%
      const sustainability = Math.random() * 40 + 60; // 60-100%
      const flexibility = Math.random() * 40 + 60; // 60-100%

      return {
        name: supplier.name,
        modes,
        metrics: {
          reliability,
          costEfficiency,
          speed,
          sustainability,
          flexibility,
        },
      };
    });
  }, [suppliers]);

  if (suppliers.length === 0 || materials.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select suppliers and materials to view transportation analysis
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transportation Mode Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Transportation Mode Distribution
          </CardTitle>
          <CardDescription>
            Analysis of transportation modes across suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.name}
                  >
                    {modeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TRANSPORT_COLORS[entry.name as TransportMode]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {TRANSPORT_MODES.map((mode) => {
                const count = transportMetrics.reduce(
                  (sum, metric) => sum + (metric[mode] || 0),
                  0
                );
                const percentage = (count / suppliers.length) * 100;
                const Icon = TRANSPORT_ICONS[mode];

                return (
                  <div key={mode} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{mode}</span>
                      </div>
                      <Badge variant="outline">
                        {count} supplier{count !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {percentage.toFixed(1)}% of suppliers use {mode}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transportation Efficiency Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChartIcon className="h-5 w-5" />
            Transportation Efficiency Analysis
          </CardTitle>
          <CardDescription>
            Performance metrics for each supplier's transportation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {efficiencyMetrics.map((metric) => (
              <div
                key={metric.name}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{metric.name}</h3>
                  <div className="flex gap-1">
                    {metric.modes.map((mode) => {
                      const Icon = TRANSPORT_ICONS[mode];
                      return (
                        <Badge
                          key={mode}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Icon className="h-3 w-3" />
                          {mode}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

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
                        name="Metrics"
                        dataKey="value"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(metric.metrics).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm capitalize">{key}</span>
                        <span className="text-sm font-medium">
                          {value.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={value} className="h-1" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transportation Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Transportation Cost Analysis
          </CardTitle>
          <CardDescription>
            Cost comparison across transportation modes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transportMetrics}>
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
                  dataKey="transportationCost"
                  name="Transportation Cost"
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
