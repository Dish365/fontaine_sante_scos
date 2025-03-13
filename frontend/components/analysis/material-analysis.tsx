"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisTable } from "./AnalysisTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface MaterialAnalysisProps {
  rawMaterials: any[];
}

interface MaterialMetrics {
  materialId: string;
  materialName: string;
  quantity: number;
  price: number;
  totalCost: number;
  carbonFootprint: number;
  waterUsage: number;
  qualityScore: number;
}

const columns: ColumnDef<MaterialMetrics>[] = [
  {
    accessorKey: "materialName",
    header: "Material Name",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => formatNumber(row.getValue("quantity")),
  },
  {
    accessorKey: "price",
    header: "Unit Price",
    cell: ({ row }) => formatCurrency(row.getValue("price")),
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => formatCurrency(row.getValue("totalCost")),
  },
  {
    accessorKey: "carbonFootprint",
    header: "Carbon Footprint",
    cell: ({ row }) =>
      `${formatNumber(row.getValue("carbonFootprint"))} kg CO2e`,
  },
  {
    accessorKey: "waterUsage",
    header: "Water Usage",
    cell: ({ row }) => `${formatNumber(row.getValue("waterUsage"))} L`,
  },
  {
    accessorKey: "qualityScore",
    header: "Quality Score",
    cell: ({ row }) => `${formatNumber(row.getValue("qualityScore"))}%`,
  },
];

export function MaterialAnalysis({ rawMaterials }: MaterialAnalysisProps) {
  const materialMetrics = useMemo(() => {
    return rawMaterials.map((material) => ({
      materialId: material.id,
      materialName: material.name,
      quantity: material.quantity,
      price: material.price,
      totalCost: material.price * material.quantity,
      carbonFootprint: material.carbonFootprint,
      waterUsage: material.waterUsage,
      qualityScore: material.qualityScore,
    }));
  }, [rawMaterials]);

  const totalMetrics = useMemo(() => {
    return materialMetrics.reduce(
      (totals, metrics) => ({
        totalQuantity: totals.totalQuantity + metrics.quantity,
        totalCost: totals.totalCost + metrics.totalCost,
        totalCarbonFootprint:
          totals.totalCarbonFootprint + metrics.carbonFootprint,
        totalWaterUsage: totals.totalWaterUsage + metrics.waterUsage,
        averageQualityScore:
          totals.averageQualityScore +
          metrics.qualityScore / materialMetrics.length,
      }),
      {
        totalQuantity: 0,
        totalCost: 0,
        totalCarbonFootprint: 0,
        totalWaterUsage: 0,
        averageQualityScore: 0,
      }
    );
  }, [materialMetrics]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalMetrics.totalQuantity)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMetrics.totalCost)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Carbon Footprint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalMetrics.totalCarbonFootprint)} kg CO2e
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Water Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalMetrics.totalWaterUsage)} L
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalMetrics.averageQualityScore)}%
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Material Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalysisTable
            columns={columns}
            data={materialMetrics}
            searchKey="materialName"
          />
        </CardContent>
      </Card>
    </div>
  );
}
