"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalysisTable } from "./AnalysisTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";

interface CostAnalysisProps {
  suppliers: any[];
  rawMaterials: any[];
}

interface CostMetrics {
  supplierId: string;
  supplierName: string;
  materialCost: number;
  transportationCost: number;
  storageCost: number;
  totalCost: number;
}

const columns: ColumnDef<CostMetrics>[] = [
  {
    accessorKey: "supplierName",
    header: "Supplier Name",
  },
  {
    accessorKey: "materialCost",
    header: "Material Cost",
    cell: ({ row }) => formatCurrency(row.getValue("materialCost")),
  },
  {
    accessorKey: "transportationCost",
    header: "Transportation Cost",
    cell: ({ row }) => formatCurrency(row.getValue("transportationCost")),
  },
  {
    accessorKey: "storageCost",
    header: "Storage Cost",
    cell: ({ row }) => formatCurrency(row.getValue("storageCost")),
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => formatCurrency(row.getValue("totalCost")),
  },
];

export function CostAnalysis({ suppliers, rawMaterials }: CostAnalysisProps) {
  const costMetrics = useMemo(() => {
    return suppliers.map((supplier) => {
      const supplierMaterials = rawMaterials.filter(
        (material) => material.supplierId === supplier.id
      );

      const materialCost = supplierMaterials.reduce(
        (total, material) => total + material.price * material.quantity,
        0
      );

      const transportationCost = supplierMaterials.reduce(
        (total, material) => total + material.transportationCost,
        0
      );

      const storageCost = supplierMaterials.reduce(
        (total, material) => total + material.storageCost,
        0
      );

      const totalCost = materialCost + transportationCost + storageCost;

      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        materialCost,
        transportationCost,
        storageCost,
        totalCost,
      };
    });
  }, [suppliers, rawMaterials]);

  const totalMetrics = useMemo(() => {
    return costMetrics.reduce(
      (totals, metrics) => ({
        materialCost: totals.materialCost + metrics.materialCost,
        transportationCost:
          totals.transportationCost + metrics.transportationCost,
        storageCost: totals.storageCost + metrics.storageCost,
        totalCost: totals.totalCost + metrics.totalCost,
      }),
      { materialCost: 0, transportationCost: 0, storageCost: 0, totalCost: 0 }
    );
  }, [costMetrics]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Material Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMetrics.materialCost)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transportation Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMetrics.transportationCost)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Storage Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMetrics.storageCost)}
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
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis by Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalysisTable
            columns={columns}
            data={costMetrics}
            searchKey="supplierName"
          />
        </CardContent>
      </Card>
    </div>
  );
}
