'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Leaf, Droplets, Recycle, AlertCircle } from 'lucide-react';
import { Supplier } from '../types/supplier';

interface EnvironmentalFormProps {
  supplier: Supplier;
  updateSupplier: (updates: Partial<Supplier>) => void;
}

export default function EnvironmentalForm({ supplier, updateSupplier }: EnvironmentalFormProps) {
  const handleInputChange = (field: keyof Supplier, value: string | number) => {
    updateSupplier({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="carbon_footprint">Carbon Footprint (kg CO2e/year) *</Label>
          <div className="relative">
            <Leaf className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="carbon_footprint"
              type="number"
              value={supplier.carbon_footprint}
              onChange={(e) => handleInputChange('carbon_footprint', parseInt(e.target.value))}
              placeholder="Enter carbon footprint"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="water_usage">Water Usage (m³/year) *</Label>
          <div className="relative">
            <Droplets className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="water_usage"
              type="number"
              value={supplier.water_usage}
              onChange={(e) => handleInputChange('water_usage', parseInt(e.target.value))}
              placeholder="Enter water usage"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="waste_generation">Waste Generation (tons/year) *</Label>
          <div className="relative">
            <Recycle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="waste_generation"
              type="number"
              step="0.1"
              value={supplier.waste_generation}
              onChange={(e) => handleInputChange('waste_generation', parseFloat(e.target.value))}
              placeholder="Enter waste generation"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="environmental_incidents">Environmental Incidents (last 12 months) *</Label>
          <div className="relative">
            <AlertCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="environmental_incidents"
              type="number"
              value={supplier.environmental_incidents}
              onChange={(e) => handleInputChange('environmental_incidents', parseInt(e.target.value))}
              placeholder="Enter number of incidents"
              className="pl-10"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="environmental_certifications">Environmental Certifications</Label>
        <Textarea
          id="environmental_certifications"
          value={supplier.environmental_certifications}
          onChange={(e) => handleInputChange('environmental_certifications', e.target.value)}
          placeholder="List environmental certifications (e.g., ISO 14001, LEED)"
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="environmental_notes">Additional Notes</Label>
        <Textarea
          id="environmental_notes"
          value={supplier.environmental_notes}
          onChange={(e) => handleInputChange('environmental_notes', e.target.value)}
          placeholder="Enter any additional notes about environmental impact"
          rows={3}
        />
      </div>
    </div>
  );
} 