'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, DollarSign, Percent, AlertTriangle } from 'lucide-react';
import { Supplier, SupplierMaterial } from '../types/supplier';

interface MaterialsFormProps {
  supplier: Supplier;
  updateSupplier: (updates: Partial<Supplier>) => void;
}

export default function MaterialsForm({ supplier, updateSupplier }: MaterialsFormProps) {
  const handleInputChange = (field: keyof Supplier, value: string | number) => {
    updateSupplier({ [field]: value });
  };

  const handleMaterialChange = (index: number, field: keyof SupplierMaterial, value: string | number) => {
    const updatedMaterials = [...(supplier.materials || [])];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      [field]: value
    };
    updateSupplier({ materials: updatedMaterials });
  };

  const addMaterial = () => {
    const newMaterial: SupplierMaterial = {
      material_name: '',
      unit_price: 0,
      minimum_order: 0,
      lead_time: 0,
      quality_rating: 0,
      notes: ''
    };
    updateSupplier({
      materials: [...(supplier.materials || []), newMaterial]
    });
  };

  const removeMaterial = (index: number) => {
    const updatedMaterials = [...(supplier.materials || [])];
    updatedMaterials.splice(index, 1);
    updateSupplier({ materials: updatedMaterials });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {(supplier.materials || []).map((material, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Material {index + 1}</h3>
              <button
                onClick={() => removeMaterial(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`material_name_${index}`}>Material Name *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={`material_name_${index}`}
                    value={material.material_name}
                    onChange={(e) => handleMaterialChange(index, 'material_name', e.target.value)}
                    placeholder="Enter material name"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`unit_price_${index}`}>Unit Price ($) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={`unit_price_${index}`}
                    type="number"
                    step="0.01"
                    value={material.unit_price}
                    onChange={(e) => handleMaterialChange(index, 'unit_price', parseFloat(e.target.value))}
                    placeholder="Enter unit price"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`minimum_order_${index}`}>Minimum Order Quantity *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={`minimum_order_${index}`}
                    type="number"
                    value={material.minimum_order}
                    onChange={(e) => handleMaterialChange(index, 'minimum_order', parseInt(e.target.value))}
                    placeholder="Enter minimum order quantity"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lead_time_${index}`}>Lead Time (days) *</Label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={`lead_time_${index}`}
                    type="number"
                    value={material.lead_time}
                    onChange={(e) => handleMaterialChange(index, 'lead_time', parseInt(e.target.value))}
                    placeholder="Enter lead time"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`quality_rating_${index}`}>Quality Rating (1-5) *</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={`quality_rating_${index}`}
                    type="number"
                    min="1"
                    max="5"
                    value={material.quality_rating}
                    onChange={(e) => handleMaterialChange(index, 'quality_rating', parseInt(e.target.value))}
                    placeholder="Enter quality rating"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`material_notes_${index}`}>Notes</Label>
              <Textarea
                id={`material_notes_${index}`}
                value={material.notes}
                onChange={(e) => handleMaterialChange(index, 'notes', e.target.value)}
                placeholder="Enter any additional notes about this material"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addMaterial}
        className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Material
      </button>
    </div>
  );
} 