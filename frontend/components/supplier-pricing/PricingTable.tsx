import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SupplierMaterialPricing } from "@/types/types";
import { PricingDetails } from "./PricingDetails";
import { Edit2, Pencil, Trash2 } from "lucide-react";

interface PricingTableProps {
  pricingData: SupplierMaterialPricing[];
  onEdit: (pricing: SupplierMaterialPricing) => void;
  onDelete: (id: string) => void;
}

export function PricingTable({
  pricingData,
  onEdit,
  onDelete,
}: PricingTableProps) {
  const [selectedPricing, setSelectedPricing] =
    useState<SupplierMaterialPricing | null>(null);

  if (!pricingData || pricingData.length === 0) {
    return (
      <div className="text-center py-6 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No pricing data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Material Pricing</CardTitle>
          <CardDescription>
            Manage pricing information for materials from this supplier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit Price</TableHead>
                <TableHead>MOQ</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(pricingData) &&
                pricingData.map((pricing) => (
                  <TableRow key={pricing.id}>
                    <TableCell>
                      {formatCurrency(pricing.unitPrice, pricing.currency)}
                    </TableCell>
                    <TableCell>{pricing.minOrderQuantity}</TableCell>
                    <TableCell>{pricing.leadTime} days</TableCell>
                    <TableCell>
                      {pricing.isPreferred ? (
                        <Badge>Preferred</Badge>
                      ) : (
                        <Badge variant="secondary">Alternative</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(pricing)}
                        className="mr-2"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(pricing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPricing && (
        <PricingDetails
          pricing={selectedPricing}
          onClose={() => setSelectedPricing(null)}
        />
      )}
    </div>
  );
}
