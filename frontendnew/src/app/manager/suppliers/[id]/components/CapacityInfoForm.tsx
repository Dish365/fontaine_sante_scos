'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Factory, Package, Clock, AlertTriangle } from 'lucide-react';
import { Supplier } from '../types/supplier';

interface CapacityInfoFormProps {
  supplier: Supplier;
  updateSupplier: (updates: Partial<Supplier>) => void;
}

export default function CapacityInfoForm({ supplier, updateSupplier }: CapacityInfoFormProps) {
  const handleInputChange = (field: keyof Supplier, value: string | number) => {
    updateSupplier({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="production_capacity">Production Capacity (units/year) *</Label>
          <div className="relative">
            <Factory className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="production_capacity"
              type="number"
              value={supplier.production_capacity}
              onChange={(e) => handleInputChange('production_capacity', parseInt(e.target.value))}
              placeholder="Enter production capacity"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="current_utilization">Current Utilization (%) *</Label>
          <div className="relative">
            <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="current_utilization"
              type="number"
              min="0"
              max="100"
              value={supplier.current_utilization}
              onChange={(e) => handleInputChange('current_utilization', parseInt(e.target.value))}
              placeholder="Enter current utilization"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead_time">Lead Time (days) *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="lead_time"
              type="number"
              value={supplier.lead_time}
              onChange={(e) => handleInputChange('lead_time', parseInt(e.target.value))}
              placeholder="Enter lead time"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quality_issues">Quality Issues (last 12 months) *</Label>
          <div className="relative">
            <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="quality_issues"
              type="number"
              value={supplier.quality_issues}
              onChange={(e) => handleInputChange('quality_issues', parseInt(e.target.value))}
              placeholder="Enter number of quality issues"
              className="pl-10"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="capacity_notes">Additional Notes</Label>
        <Textarea
          id="capacity_notes"
          value={supplier.capacity_notes}
          onChange={(e) => handleInputChange('capacity_notes', e.target.value)}
          placeholder="Enter any additional notes about capacity"
          rows={3}
        />
      </div>
    </div>
  );
} 