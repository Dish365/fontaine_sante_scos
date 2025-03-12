import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupplierMaterialPricing } from "@/types/types";

interface PricingFormProps {
  initialData?: Partial<SupplierMaterialPricing>;
  supplierId: string;
  materialId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PricingForm({
  initialData,
  supplierId,
  materialId,
  onSubmit,
  onCancel,
}: PricingFormProps) {
  const [formData, setFormData] = React.useState({
    unitPrice: initialData?.unitPrice || "",
    currency: initialData?.currency || "USD",
    minOrderQuantity: initialData?.minOrderQuantity || "",
    leadTime: initialData?.leadTime || "",
    transportCost: initialData?.transportCost || "",
    isPreferred: initialData?.isPreferred || false,
    notes: initialData?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      supplierId,
      materialId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Unit Price</label>
          <Input
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, unitPrice: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <Select
            value={formData.currency}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, currency: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Minimum Order Quantity</label>
          <Input
            type="number"
            value={formData.minOrderQuantity}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                minOrderQuantity: e.target.value,
              }))
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Lead Time (days)</label>
          <Input
            type="number"
            value={formData.leadTime}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, leadTime: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Pricing</Button>
      </div>
    </form>
  );
}
