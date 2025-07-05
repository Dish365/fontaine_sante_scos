'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Truck, Route, Fuel, Leaf } from 'lucide-react';
import { Supplier } from '../types/supplier';

interface TransportationFormProps {
  supplier: Supplier;
  updateSupplier: (updates: Partial<Supplier>) => void;
}

export default function TransportationForm({ supplier, updateSupplier }: TransportationFormProps) {
  const handleInputChange = (field: keyof Supplier, value: string | number) => {
    updateSupplier({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="transportation_mode">Primary Transportation Mode *</Label>
          <div className="relative">
            <Truck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="transportation_mode"
              value={supplier.transportation_mode}
              onChange={(e) => handleInputChange('transportation_mode', e.target.value)}
              placeholder="e.g., Road, Rail, Air, Sea"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="distance">Distance (km) *</Label>
          <div className="relative">
            <Route className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="distance"
              type="number"
              value={supplier.distance}
              onChange={(e) => handleInputChange('distance', parseInt(e.target.value))}
              placeholder="Enter distance in kilometers"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuel_efficiency">Fuel Efficiency (L/100km) *</Label>
          <div className="relative">
            <Fuel className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="fuel_efficiency"
              type="number"
              step="0.1"
              value={supplier.fuel_efficiency}
              onChange={(e) => handleInputChange('fuel_efficiency', parseFloat(e.target.value))}
              placeholder="Enter fuel efficiency"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emissions_factor">Emissions Factor (kg CO2e/km) *</Label>
          <div className="relative">
            <Leaf className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="emissions_factor"
              type="number"
              step="0.01"
              value={supplier.emissions_factor}
              onChange={(e) => handleInputChange('emissions_factor', parseFloat(e.target.value))}
              placeholder="Enter emissions factor"
              className="pl-10"
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="transportation_notes">Additional Notes</Label>
        <Textarea
          id="transportation_notes"
          value={supplier.transportation_notes}
          onChange={(e) => handleInputChange('transportation_notes', e.target.value)}
          placeholder="Enter any additional notes about transportation"
          rows={3}
        />
      </div>
    </div>
  );
} 