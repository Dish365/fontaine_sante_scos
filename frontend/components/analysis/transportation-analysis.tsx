"use client";

import { useMemo } from "react";
import { Supplier as BaseSupplier, RawMaterial as BaseRawMaterial } from "@/types/types";
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
import supplierMaterialPricingData from "@/data/supplier-material-pricing.json";

// Add legacy data type support
interface Supplier extends Omit<BaseSupplier, 'materials' | 'transportMode'> {
  materials?: string[];
  material_id?: string[];
  transportMode?: string | string[];
  transportationDetails: string;
}

interface RawMaterial extends Omit<BaseRawMaterial, 'id' | 'economicData'> {
  id?: string;
  material_id?: string;
  economicData?: {
    unitCost: number;
    transportationCost: number;
    storageCost: number;
    totalCostPerUnit: number;
    taxRate?: number;
    tariffRate?: number;
    leadTime?: number;
    paymentTerms?: string;
    currency?: string;
  };
}

interface MaterialPricing {
  id: string;
  supplierId: string;
  materialId: string;
  unitPrice: number;
  currency: string;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  quantityUnit: string;
  leadTimeInDays: number;
  discountThreshold: number;
  discountRate: number;
  taxRate: number;
  customsRate: number;
}

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
    console.log('Calculating metrics with:', { suppliers, materials, supplierMaterialPricingData });
    
    const metrics = suppliers.map((supplier) => {
      // Handle both transportationDetails and transportMode
      const transportDetails = supplier.transportationDetails || 
        (Array.isArray(supplier.transportMode) ? supplier.transportMode.join(", ") : supplier.transportMode || "");
      
      console.log('Processing supplier:', {
        name: supplier.name,
        id: supplier.id,
        materials: supplier.materials,
        material_id: supplier.material_id,
        transportDetails
      });

      const modes = transportDetails
        .split(",")
        .map((mode) => mode.trim())
        .filter((mode): mode is TransportMode =>
          TRANSPORT_MODES.includes(mode as TransportMode)
        );

      // Handle both materials and material_id arrays
      const supplierMaterialIds = supplier.materials || supplier.material_id || [];
      
      console.log('Supplier material IDs:', supplierMaterialIds);
      
      // Calculate transportation cost
      const supplierMaterials = materials.filter((m) => {
        const materialId = m.id || m.material_id;
        const isIncluded = materialId && supplierMaterialIds.includes(materialId);
        console.log('Checking material:', {
          materialId,
          name: m.name,
          isIncluded,
          economicData: m.economicData
        });
        return isIncluded;
      });

      console.log('Matched materials:', supplierMaterials);

      // Get pricing data for this supplier
      const supplierPricing = (supplierMaterialPricingData as MaterialPricing[]).filter(
        (pricing) => pricing.supplierId === supplier.id
      );

      console.log('Supplier pricing data:', supplierPricing);

      // Calculate costs using pricing data
      let materialCost = 0;
      let transportationCost = 0;
      let storageCost = 0;

      supplierMaterials.forEach((material) => {
        const materialId = material.id || material.material_id;
        const pricing = supplierPricing.find((p) => p.materialId === materialId);
        
        if (pricing) {
          const quantity = material.quantity || pricing.minOrderQuantity;
          const basePrice = pricing.unitPrice * quantity;
          
          // Apply discount if quantity meets threshold
          const discountedPrice = quantity >= pricing.discountThreshold
            ? basePrice * (1 - pricing.discountRate)
            : basePrice;
          
          // Add tax and customs
          const priceWithTax = discountedPrice * (1 + pricing.taxRate);
          const finalPrice = priceWithTax * (1 + (pricing.customsRate || 0));
          
          materialCost += finalPrice;
          
          // Estimate transportation and storage costs
          const estimatedTransportCost = finalPrice * 0.1; // 10% of material cost
          const estimatedStorageCost = finalPrice * 0.05; // 5% of material cost
          
          transportationCost += estimatedTransportCost;
          storageCost += estimatedStorageCost;
        } else {
          // Fallback to economic data if no pricing found
          materialCost += (material.economicData?.unitCost || 0) * (material.quantity || 0);
          transportationCost += material.economicData?.transportationCost || 0;
          storageCost += (material.economicData?.storageCost || 0) * (material.quantity || 0);
        }
      });

      const metricResult = {
        name: supplier.name,
        transportationCost: transportationCost || 0,
        materialCost: materialCost || 0,
        storageCost: storageCost || 0,
        totalCost: (transportationCost + materialCost + storageCost) || 0,
        ...TRANSPORT_MODES.reduce((acc, mode) => {
          acc[mode] = modes.includes(mode) ? 1 : 0;
          return acc;
        }, {} as Record<TransportMode, number>)
      };

      console.log('Final metrics for supplier:', metricResult);
      return metricResult;
    });

    console.log('All transport metrics:', metrics);
    return metrics;
  }, [suppliers, materials]);

  // Calculate totals
  const totals = useMemo(() => {
    const result = transportMetrics.reduce((acc, metric) => ({
      materialCost: (acc.materialCost || 0) + metric.materialCost,
      transportationCost: (acc.transportationCost || 0) + metric.transportationCost,
      storageCost: (acc.storageCost || 0) + metric.storageCost,
      totalCost: (acc.totalCost || 0) + metric.totalCost
    }), {
      materialCost: 0,
      transportationCost: 0,
      storageCost: 0,
      totalCost: 0
    });
    
    console.log('Calculated totals:', result);
    return result;
  }, [transportMetrics]);

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
      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Material Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.materialCost === 0 ? "$0.00" : 
               `$${totals.materialCost.toLocaleString(undefined, {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2
               })}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transportation Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.transportationCost === 0 ? "$0.00" : 
               `$${totals.transportationCost.toLocaleString(undefined, {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2
               })}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Storage Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.storageCost === 0 ? "$0.00" : 
               `$${totals.storageCost.toLocaleString(undefined, {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2
               })}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totals.totalCost === 0 ? "$0.00" : 
               `$${totals.totalCost.toLocaleString(undefined, {
                 minimumFractionDigits: 2,
                 maximumFractionDigits: 2
               })}`}
            </div>
          </CardContent>
        </Card>
      </div>

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
                    value === 0 ? "$0.00" : 
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
                  stackId="costs"
                />
                <Bar
                  dataKey="transportationCost"
                  name="Transportation Cost"
                  fill="#3b82f6"
                  stackId="costs"
                />
                <Bar
                  dataKey="storageCost"
                  name="Storage Cost"
                  fill="#f59e0b"
                  stackId="costs"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis by Supplier */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis by Supplier</CardTitle>
          <CardDescription>Detailed cost breakdown per supplier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Supplier Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Material Cost
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Transportation Cost
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Storage Cost
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Total Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {transportMetrics.map((metric, index) => (
                  <tr
                    key={index}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle">{metric.name}</td>
                    <td className="p-4 align-middle">
                      {metric.materialCost === 0
                        ? "$0.00"
                        : `$${metric.materialCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                    </td>
                    <td className="p-4 align-middle">
                      {metric.transportationCost === 0
                        ? "$0.00"
                        : `$${metric.transportationCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                    </td>
                    <td className="p-4 align-middle">
                      {metric.storageCost === 0
                        ? "$0.00"
                        : `$${metric.storageCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                    </td>
                    <td className="p-4 align-middle">
                      {metric.totalCost === 0
                        ? "$0.00"
                        : `$${metric.totalCost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
