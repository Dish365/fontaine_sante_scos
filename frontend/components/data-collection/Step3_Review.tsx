import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowLeft,
  Check,
  BarChart,
} from "lucide-react";
import { RawMaterial } from "@/lib/data-collection-utils";
import { SupplierMaterialPricing, Supplier } from "@/types/types";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimplifiedSupplierPricing } from "@/types/json-types";

// Interface for simplified pricing fields when accessing from the SupplierMaterialPricing
interface SimplifiedPricingFields {
  price: number;
  currency: string;
  leadTime: string;
  leadTimeUnit: string;
  moq: number;
  unit: string;
}

interface Step3ReviewProps {
  rawMaterial: RawMaterial | null;
  suppliers: Supplier[];
  supplierPricing: SupplierMaterialPricing[];
  onReset: () => void;
  onComplete: () => void;
  onPrevious: () => void;
  onNext: (step: number) => void;
}

export function Step3Review({
  rawMaterial,
  suppliers,
  supplierPricing,
  // onReset not used but kept in props for consistency
  onComplete,
  onPrevious,
  onNext,
}: Step3ReviewProps) {
  // No need to filter suppliers here since they're already filtered in the parent component
  const selectedSuppliers = suppliers;

  // Helper function to convert string or Date to Date
  const toDate = (value: string | Date | undefined): Date => {
    if (!value) return new Date();
    return typeof value === 'string' ? new Date(value) : value;
  };

  // Convert supplier pricing to our simplified format if needed
  const simplifiedPricing: SimplifiedSupplierPricing[] = supplierPricing.map(pricing => {
    // Use type assertion for properties that may not exist in the original type
    const pricingWithDefaults: SimplifiedSupplierPricing = {
      id: pricing.id || '',
      supplierId: pricing.supplierId || '',
      materialId: pricing.materialId || '',
      price: (pricing as unknown as SimplifiedPricingFields).price || 0,
      currency: (pricing as unknown as SimplifiedPricingFields).currency || 'USD',
      leadTime: (pricing as unknown as SimplifiedPricingFields).leadTime || '0',
      leadTimeUnit: (pricing as unknown as SimplifiedPricingFields).leadTimeUnit || 'days',
      moq: (pricing as unknown as SimplifiedPricingFields).moq || 0,
      unit: (pricing as unknown as SimplifiedPricingFields).unit || rawMaterial?.unit || 'kg',
      createdAt: toDate(pricing.createdAt),
      updatedAt: toDate(pricing.updatedAt)
    };
    
    return pricingWithDefaults;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Review & Confirm</CardTitle>
          <CardDescription>
            Review all collected information before finalizing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="h-[600px] pr-4">
            {/* Material Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Raw Material Details</h3>
              <Card>
                <CardContent className="pt-6">
                  {rawMaterial && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Name
                        </p>
                        <p className="text-lg">{rawMaterial.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Type
                        </p>
                        <p className="text-lg">{rawMaterial.type}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Quantity
                        </p>
                        <p className="text-lg">
                          {rawMaterial.quantity} {rawMaterial.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Description
                        </p>
                        <p className="text-lg">
                          {rawMaterial.description || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            {/* Suppliers Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Associated Suppliers ({selectedSuppliers.length})
              </h3>
              <div className="grid gap-4">
                {selectedSuppliers.map((supplier) => (
                  <Card key={supplier.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Name
                          </p>
                          <p className="text-lg">{supplier.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Location
                          </p>
                          <p className="text-lg">{supplier.location.address}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Transport Modes
                          </p>
                          <p className="text-lg">
                            {supplier.transportMode || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Certifications
                          </p>
                          <p className="text-lg">
                            {supplier.certifications?.join(", ") || "N/A"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Pricing Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Supplier Pricing ({simplifiedPricing.length})
              </h3>
              <div className="grid gap-4">
                {simplifiedPricing.map((pricing) => (
                  <Card key={pricing.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Supplier
                          </p>
                          <p className="text-lg">
                            {suppliers.find((s) => s.id === pricing.supplierId)
                              ?.name || "Unknown Supplier"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Price
                          </p>
                          <p className="text-lg">
                            {formatCurrency(pricing.price, pricing.currency)}{" "}
                            per {pricing.unit || rawMaterial?.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Lead Time
                          </p>
                          <p className="text-lg">
                            {pricing.leadTime} {pricing.leadTimeUnit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            MOQ
                          </p>
                          <p className="text-lg">
                            {pricing.moq} {pricing.unit || rawMaterial?.unit}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => onNext(3)}
                className="flex items-center gap-2"
              >
                <BarChart className="h-4 w-4" />
                Visualize Supply Chain
              </Button>
              <Button onClick={onComplete} className="flex items-center gap-2">
                Complete
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
