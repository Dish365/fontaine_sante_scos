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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart4, ArrowRight, Loader2 } from "lucide-react";
import { RawMaterial } from "@/lib/data-collection-utils";
import economicMetricsData from "@/data/economic-metrics.json";

interface Step3Props {
  currentMaterial: RawMaterial | null;
  isSubmitting: boolean;
  errors: Record<string, string>;
  economicData: {
    taxRate: string;
    tariffRate: string;
    unitCost: string;
    transportationCost: string;
    storageCost: string;
    leadTime: string;
    discountType: "percentage" | "fixed";
    discountValue: string;
    discountThresholdType: "quantity" | "value";
    discountThreshold: string;
    paymentTerms: string;
    currency: string;
  };
  onDataChange: (field: string, value: string) => void;
  onBack: () => void;
  onComplete: () => void;
}

export function Step3EconomicMetrics({
  currentMaterial,
  isSubmitting,
  errors,
  economicData,
  onDataChange,
  onBack,
  onComplete,
}: Step3Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
              3
            </span>
            Economic Metrics
          </CardTitle>
          <CardDescription>
            Add comprehensive economic data for {currentMaterial?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <BarChart4 className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Economic Data</AlertTitle>
              <AlertDescription className="text-blue-700">
                Add general economic information for the raw material.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {/* Tax & Tariff Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="taxRate" className="text-sm font-medium">
                    Tax Rate (%)
                  </label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={economicData.taxRate}
                    onChange={(e) => onDataChange("taxRate", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="tariffRate" className="text-sm font-medium">
                    Tariff Rate (%)
                  </label>
                  <Input
                    id="tariffRate"
                    type="number"
                    value={economicData.tariffRate}
                    onChange={(e) => onDataChange("tariffRate", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Cost Structure Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="unitCost" className="text-sm font-medium">
                      Unit Cost
                    </label>
                    <Input
                      id="unitCost"
                      type="number"
                      value={economicData.unitCost}
                      onChange={(e) => onDataChange("unitCost", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="currency" className="text-sm font-medium">
                      Currency
                    </label>
                    <Select
                      value={economicData.currency}
                      onValueChange={(value) => onDataChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {economicMetricsData.currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Discount Fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Discount Type
                      </label>
                      <Select
                        value={economicData.discountType}
                        onValueChange={(value) =>
                          onDataChange("discountType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {economicMetricsData.discountTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Payment Terms
                      </label>
                      <Select
                        value={economicData.paymentTerms}
                        onValueChange={(value) =>
                          onDataChange("paymentTerms", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select terms" />
                        </SelectTrigger>
                        <SelectContent>
                          {economicMetricsData.paymentTerms.map((term) => (
                            <SelectItem key={term.value} value={term.value}>
                              {term.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-5">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onComplete} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
