import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, ArrowRight, BarChart4 } from "lucide-react";
import { RawMaterial } from "@/lib/data-collection-utils";
import { SupplierMaterialPricing } from "@/lib/types";
import { PricingForm } from "@/components/supplier-pricing/PricingForm";
import { PricingTable } from "@/components/supplier-pricing/PricingTable";

interface Step4Props {
  currentMaterial: RawMaterial | null;
  isAddingPricing: boolean;
  editingPricing: SupplierMaterialPricing | null;
  supplierPricing: SupplierMaterialPricing[];
  selectedExistingSupplierIds: string[];
  onAddPricing: () => void;
  onEditPricing: (pricing: SupplierMaterialPricing) => void;
  onDeletePricing: (id: string) => void;
  onPricingSubmit: (
    data: Omit<SupplierMaterialPricing, "id" | "createdAt" | "updatedAt">
  ) => void;
  onPricingCancel: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step4MaterialPricing({
  currentMaterial,
  isAddingPricing,
  editingPricing,
  supplierPricing,
  selectedExistingSupplierIds,
  onAddPricing,
  onEditPricing,
  onDeletePricing,
  onPricingSubmit,
  onPricingCancel,
  onBack,
  onNext,
}: Step4Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
              4
            </span>
            Material Pricing
          </CardTitle>
          <CardDescription>
            Manage pricing information for {currentMaterial?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isAddingPricing || editingPricing ? (
            !currentMaterial ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  No material selected. Please select a material before adding
                  pricing.
                </AlertDescription>
              </Alert>
            ) : (
              <PricingForm
                initialData={editingPricing || undefined}
                supplierId={selectedExistingSupplierIds[0]}
                materialId={currentMaterial.id}
                onSubmit={editingPricing ? onEditPricing : onPricingSubmit}
                onCancel={onPricingCancel}
              />
            )
          ) : (
            <div className="space-y-5">
              <Alert className="bg-blue-50 border-blue-200">
                <BarChart4 className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">
                  Supplier-Specific Pricing
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  Manage supplier-specific pricing details for this raw
                  material.
                </AlertDescription>
              </Alert>

              {supplierPricing.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <div className="mb-4 text-muted-foreground">
                    No pricing information added yet
                  </div>
                  <Button onClick={onAddPricing} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Pricing
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-end">
                    <Button onClick={onAddPricing} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Pricing
                    </Button>
                  </div>
                  <PricingTable
                    pricingData={supplierPricing}
                    onEdit={onEditPricing}
                    onDelete={onDeletePricing}
                  />
                </>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-5">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
