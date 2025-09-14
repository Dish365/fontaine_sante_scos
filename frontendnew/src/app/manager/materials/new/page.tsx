'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Save, X, Leaf, Building2, Plus, Trash2, Calculator, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface MaterialCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  city: string;
  state_province: string;
  country: string;
  is_active: boolean;
  transportation_modes: string[];
  environmental_certification: string;
}

interface TaxRegion {
  id: number;
  name: string;
  country: string;
  province_state: string;
  tax_type: string;
  gst_rate: number;
  pst_rate: number;
  hst_rate: number;
  total_tax_rate: number;
  is_active: boolean;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

interface TaxBreakdown {
  subtotal: number;
  gst_amount: number;
  pst_amount: number;
  hst_amount: number;
  total_tax: number;
  total_with_tax: number;
  tax_type: string;
}

interface SupplierAssignment {
  supplier_id: number;
  supplier_name: string;
  supplier_location: string;
  base_cost_per_unit: number;
  minimum_order_quantity: number;
  lead_time: number;
  currency_id: number;
  currency_code: string;
  tax_region_id: number;
  tax_region_name: string;
  tax_included: boolean;
  tax_breakdown?: TaxBreakdown;
  price_with_tax?: number;
}

interface MaterialFormData {
  name: string;
  description: string;
  unit: string;
  category: number | null;
  sku: string;
  is_organic: boolean;
  is_active: boolean;
  supplier_assignments: SupplierAssignment[];
}

const MATERIAL_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'ton', label: 'Tons' },
  { value: 'L', label: 'Liters (L)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'piece', label: 'Pieces' },
  { value: 'box', label: 'Boxes' },
  { value: 'bag', label: 'Bags' },
  { value: 'm³', label: 'Cubic Meters (m³)' },
];

export default function NewMaterialPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [taxRegions, setTaxRegions] = useState<TaxRegion[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculatingTax, setIsCalculatingTax] = useState<boolean[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    description: '',
    unit: '',
    category: null,
    sku: '',
    is_organic: false,
    is_active: true,
    supplier_assignments: [],
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
      fetchSuppliers();
      fetchTaxRegions();
      fetchCurrencies();
    }
  }, [isAuthenticated]);

  // Debug: Monitor suppliers state changes
  useEffect(() => {
    console.log('🔄 Suppliers state updated:', suppliers);
    console.log('🔄 Suppliers count in state:', suppliers.length);
  }, [suppliers]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/suppliers/material-categories/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || data);
      } else {
        toast.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Network error while fetching categories');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      console.log('🔍 Fetching suppliers with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://localhost:8000/api/suppliers/suppliers/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Suppliers API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Raw suppliers data:', data);
        
        const allSuppliers = data.results || data;
        console.log('📋 All suppliers:', allSuppliers);
        console.log('📋 All suppliers count:', allSuppliers.length);
        
        const activeSuppliers = allSuppliers.filter((s: Supplier) => s.is_active);
        console.log('✅ Active suppliers:', activeSuppliers);
        console.log('✅ Active suppliers count:', activeSuppliers.length);
        
        setSuppliers(activeSuppliers);
      } else {
        console.error('❌ Failed to fetch suppliers, status:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        toast.error('Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('💥 Error fetching suppliers:', error);
      toast.error('Network error while fetching suppliers');
    }
  };

  const fetchTaxRegions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/suppliers/tax-regions/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTaxRegions((data.results || data).filter((tr: TaxRegion) => tr.is_active));
      } else {
        toast.error('Failed to fetch tax regions');
      }
    } catch (error) {
      console.error('Error fetching tax regions:', error);
      toast.error('Network error while fetching tax regions');
    }
  };

  const fetchCurrencies = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/suppliers/currencies/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrencies((data.results || data).filter((c: Currency) => c.is_active));
      } else {
        toast.error('Failed to fetch currencies');
      }
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast.error('Network error while fetching currencies');
    }
  };

  const calculateTaxBreakdown = async (assignment: SupplierAssignment, assignmentIndex: number) => {
    if (!assignment.base_cost_per_unit || !assignment.tax_region_id || assignment.tax_included) {
      return;
    }

    setIsCalculatingTax(prev => {
      const newArray = [...prev];
      newArray[assignmentIndex] = true;
      return newArray;
    });

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/suppliers/calculate-tax/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: assignment.base_cost_per_unit,
          tax_region_id: assignment.tax_region_id,
          include_duties: false,
        }),
      });

      if (response.ok) {
        const taxData = await response.json();
        const breakdown: TaxBreakdown = {
          subtotal: parseFloat(taxData.subtotal),
          gst_amount: parseFloat(taxData.gst_amount),
          pst_amount: parseFloat(taxData.pst_amount),
          hst_amount: parseFloat(taxData.hst_amount),
          total_tax: parseFloat(taxData.total_tax),
          total_with_tax: parseFloat(taxData.total_with_tax),
          tax_type: taxData.tax_type,
        };

        updateSupplierAssignment(assignmentIndex, 'tax_breakdown', breakdown);
        updateSupplierAssignment(assignmentIndex, 'price_with_tax', breakdown.total_with_tax);
      } else {
        console.error('Failed to calculate tax');
        toast.error('Failed to calculate tax breakdown');
      }
    } catch (error) {
      console.error('Error calculating tax:', error);
      toast.error('Network error while calculating tax');
    } finally {
      setIsCalculatingTax(prev => {
        const newArray = [...prev];
        newArray[assignmentIndex] = false;
        return newArray;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Material name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    } else if (!/^[A-Z0-9_-]+$/i.test(formData.sku)) {
      newErrors.sku = 'SKU can only contain letters, numbers, hyphens, and underscores';
    }

    // Validate supplier assignments (only validate if there are any fields filled)
    formData.supplier_assignments.forEach((assignment, index) => {
      // Only validate if user has started filling this assignment
      const hasAnyData = assignment.supplier_id > 0 || assignment.base_cost_per_unit > 0 || assignment.currency_id > 0;
      
      if (hasAnyData) {
        if (!assignment.supplier_id) {
          newErrors[`supplier_${index}_supplier`] = 'Supplier selection is required';
        }
        if (!assignment.base_cost_per_unit || assignment.base_cost_per_unit <= 0) {
          newErrors[`supplier_${index}_cost`] = 'Cost per unit must be greater than 0';
        }
        if (!assignment.minimum_order_quantity || assignment.minimum_order_quantity <= 0) {
          newErrors[`supplier_${index}_quantity`] = 'Minimum order quantity must be greater than 0';
        }
        if (assignment.lead_time < 0) {
          newErrors[`supplier_${index}_lead_time`] = 'Lead time cannot be negative';
        }
        if (!assignment.currency_id) {
          newErrors[`supplier_${index}_currency`] = 'Currency selection is required';
        }
        // Tax region is optional - user can skip it
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      
      // First create the material
      const materialResponse = await fetch('http://localhost:8000/api/suppliers/materials/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          unit: formData.unit,
          category: formData.category,
          sku: formData.sku,
          is_organic: formData.is_organic,
          is_active: formData.is_active,
        }),
      });

      if (!materialResponse.ok) {
        const errorData = await materialResponse.json();
        if (errorData.detail) {
          toast.error(errorData.detail);
        } else {
          // Handle field-specific errors
          const fieldErrors: Record<string, string> = {};
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors[field] = errorData[field][0];
            } else {
              fieldErrors[field] = errorData[field];
            }
          });
          setErrors(fieldErrors);
          toast.error('Please fix the errors below');
        }
        return;
      }

      const materialData = await materialResponse.json();
      
      // Create supplier assignments (only for valid assignments)
      const validAssignments = formData.supplier_assignments.filter(assignment => 
        assignment.supplier_id > 0 && 
        assignment.currency_id > 0 && 
        assignment.base_cost_per_unit > 0
      );

      console.log('📋 Creating supplier assignments:', validAssignments);

      if (validAssignments.length > 0) {
        const supplierAssignmentPromises = validAssignments.map(async (assignment) => {
          const payload: any = {
            supplier: assignment.supplier_id,
            material: materialData.id,
            base_cost_per_unit: assignment.base_cost_per_unit,
            minimum_order_quantity: assignment.minimum_order_quantity,
            lead_time: assignment.lead_time,
            currency: assignment.currency_id,
            tax_included: assignment.tax_included,
            is_active: true,
          };

          // Only include tax_region if it's selected
          if (assignment.tax_region_id > 0) {
            payload.tax_region = assignment.tax_region_id;
          }

          console.log('📤 Sending supplier assignment:', payload);

          const supplierMaterialResponse = await fetch('http://localhost:8000/api/suppliers/supplier-materials/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!supplierMaterialResponse.ok) {
            const errorData = await supplierMaterialResponse.json();
            console.error('❌ Error creating supplier assignment:', errorData);
            toast.error(`Failed to assign material to ${assignment.supplier_name}: ${JSON.stringify(errorData)}`);
            throw new Error(`Failed to create assignment for ${assignment.supplier_name}`);
          } else {
            const responseData = await supplierMaterialResponse.json();
            console.log('✅ Successfully created supplier assignment:', responseData);
          }
        });

        await Promise.all(supplierAssignmentPromises);
      }

      toast.success('Material created successfully with supplier assignments');
      router.push('/manager/materials');
    } catch (error) {
      console.error('Error creating material:', error);
      toast.error('Network error while creating material');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof MaterialFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateSKU = () => {
    const baseSKU = formData.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 8);
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const newSKU = `${baseSKU}-${randomSuffix}`;
    handleInputChange('sku', newSKU);
  };

  const addSupplierAssignment = () => {
    const newAssignment: SupplierAssignment = {
      supplier_id: 0,
      supplier_name: '',
      supplier_location: '',
      base_cost_per_unit: 0,
      minimum_order_quantity: 1,
      lead_time: 7,
      currency_id: currencies.find(c => c.code === 'CAD')?.id || 1,
      currency_code: 'CAD',
      tax_region_id: 0,
      tax_region_name: '',
      tax_included: false,
    };
    
    setFormData(prev => ({
      ...prev,
      supplier_assignments: [...prev.supplier_assignments, newAssignment],
    }));

    // Initialize tax calculation state for new assignment
    setIsCalculatingTax(prev => [...prev, false]);
  };

  const removeSupplierAssignment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supplier_assignments: prev.supplier_assignments.filter((_, i) => i !== index),
    }));

    // Remove tax calculation state
    setIsCalculatingTax(prev => prev.filter((_, i) => i !== index));
  };

  const updateSupplierAssignment = (index: number, field: keyof SupplierAssignment, value: any) => {
    setFormData(prev => ({
      ...prev,
      supplier_assignments: prev.supplier_assignments.map((assignment, i) => 
        i === index ? { ...assignment, [field]: value } : assignment
      ),
    }));

    // Clear related errors
    if (errors[`supplier_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`supplier_${index}_${field}`]: '' }));
    }

    // Trigger tax calculation when relevant fields change
    const assignment = formData.supplier_assignments[index];
    if ((field === 'base_cost_per_unit' || field === 'tax_region_id') && assignment) {
      const updatedAssignment = { ...assignment, [field]: value };
      if (updatedAssignment.base_cost_per_unit > 0 && updatedAssignment.tax_region_id > 0 && !updatedAssignment.tax_included) {
        setTimeout(() => calculateTaxBreakdown(updatedAssignment, index), 500); // Debounce
      }
    }
  };

  const handleSupplierChange = (index: number, supplierId: string) => {
    const supplier = suppliers.find(s => s.id === parseInt(supplierId));
    if (supplier) {
      updateSupplierAssignment(index, 'supplier_id', supplier.id);
      updateSupplierAssignment(index, 'supplier_name', supplier.name);
      updateSupplierAssignment(index, 'supplier_location', `${supplier.city}, ${supplier.state_province}`);
      
      // Auto-select tax region based on supplier location
      const supplierTaxRegion = taxRegions.find(tr => 
        tr.province_state === supplier.state_province && tr.country === 'CA'
      );
      if (supplierTaxRegion) {
        updateSupplierAssignment(index, 'tax_region_id', supplierTaxRegion.id);
        updateSupplierAssignment(index, 'tax_region_name', supplierTaxRegion.name);
      }
    }
  };

  const handleCurrencyChange = (index: number, currencyId: string) => {
    const currency = currencies.find(c => c.id === parseInt(currencyId));
    if (currency) {
      updateSupplierAssignment(index, 'currency_id', currency.id);
      updateSupplierAssignment(index, 'currency_code', currency.code);
    }
  };

  const handleTaxRegionChange = (index: number, taxRegionId: string) => {
    const taxRegion = taxRegions.find(tr => tr.id === parseInt(taxRegionId));
    if (taxRegion) {
      updateSupplierAssignment(index, 'tax_region_id', taxRegion.id);
      updateSupplierAssignment(index, 'tax_region_name', taxRegion.name);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/manager/materials')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Materials
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Material</h1>
                <p className="text-gray-600">Create a new raw material entry with supplier pricing</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the basic details for the material
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Material Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter material name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category?.toString() || ''}
                      onValueChange={(value) => handleInputChange('category', parseInt(value))}
                    >
                      <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(cat => cat.is_active).map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter detailed description"
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unit of Measurement *</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => handleInputChange('unit', value)}
                    >
                      <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_UNITS.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.unit && (
                      <p className="text-sm text-red-600 mt-1">{errors.unit}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                        placeholder="Enter SKU"
                        className={errors.sku ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateSKU}
                        disabled={!formData.name}
                      >
                        Generate
                      </Button>
                    </div>
                    {errors.sku && (
                      <p className="text-sm text-red-600 mt-1">{errors.sku}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Material Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Material Properties</CardTitle>
                <CardDescription>
                  Set additional properties for the material
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_organic"
                      checked={formData.is_organic}
                      onChange={(e) => handleInputChange('is_organic', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="is_organic" className="flex items-center">
                      <Leaf className="h-4 w-4 mr-1 text-green-600" />
                      This is an organic material
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="is_active">
                      Material is active and available for use
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Supplier Assignments
                </CardTitle>
                <CardDescription>
                  Assign this material to suppliers with comprehensive pricing and tax information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.supplier_assignments.map((assignment, index) => (
                    <div key={index} className="p-6 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-lg">Supplier Assignment {index + 1}</h4>
                          {assignment.supplier_name && (
                            <p className="text-sm text-gray-600">{assignment.supplier_name} • {assignment.supplier_location}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSupplierAssignment(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Supplier Selection */}
                        <div className="md:col-span-2 lg:col-span-1">
                          <Label>Supplier *</Label>
                          <Select
                            value={assignment.supplier_id.toString()}
                            onValueChange={(value) => handleSupplierChange(index, value)}
                          >
                            <SelectTrigger className={errors[`supplier_${index}_supplier`] ? 'border-red-500' : ''}>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{supplier.name}</span>
                                    <span className="text-xs text-gray-500">{supplier.city}, {supplier.state_province}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`supplier_${index}_supplier`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`supplier_${index}_supplier`]}</p>
                          )}
                        </div>

                        {/* Currency */}
                        <div>
                          <Label>Currency *</Label>
                          <Select
                            value={assignment.currency_id.toString()}
                            onValueChange={(value) => handleCurrencyChange(index, value)}
                          >
                            <SelectTrigger className={errors[`supplier_${index}_currency`] ? 'border-red-500' : ''}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.id} value={currency.id.toString()}>
                                  {currency.symbol} {currency.code} - {currency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`supplier_${index}_currency`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`supplier_${index}_currency`]}</p>
                          )}
                        </div>

                        {/* Tax Region */}
                        <div>
                          <Label>Tax Region *</Label>
                          <Select
                            value={assignment.tax_region_id.toString()}
                            onValueChange={(value) => handleTaxRegionChange(index, value)}
                          >
                            <SelectTrigger className={errors[`supplier_${index}_tax_region`] ? 'border-red-500' : ''}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {taxRegions.map((taxRegion) => (
                                <SelectItem key={taxRegion.id} value={taxRegion.id.toString()}>
                                  <div className="flex flex-col">
                                    <span>{taxRegion.name}</span>
                                    <span className="text-xs text-gray-500">{taxRegion.tax_type} - {(taxRegion.total_tax_rate * 100).toFixed(1)}%</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`supplier_${index}_tax_region`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`supplier_${index}_tax_region`]}</p>
                          )}
                        </div>

                        {/* Cost per Unit */}
                        <div>
                          <Label>Cost per Unit *</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={assignment.base_cost_per_unit}
                              onChange={(e) => updateSupplierAssignment(index, 'base_cost_per_unit', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className={errors[`supplier_${index}_cost`] ? 'border-red-500' : ''}
                            />
                            <span className="absolute right-3 top-2 text-gray-500">
                              {assignment.currency_code}
                            </span>
                          </div>
                          {errors[`supplier_${index}_cost`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`supplier_${index}_cost`]}</p>
                          )}
                        </div>

                        {/* Minimum Order Quantity */}
                        <div>
                          <Label>Min. Order Quantity *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={assignment.minimum_order_quantity}
                            onChange={(e) => updateSupplierAssignment(index, 'minimum_order_quantity', parseInt(e.target.value) || 1)}
                            placeholder="1"
                            className={errors[`supplier_${index}_quantity`] ? 'border-red-500' : ''}
                          />
                          {errors[`supplier_${index}_quantity`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`supplier_${index}_quantity`]}</p>
                          )}
                        </div>

                        {/* Lead Time */}
                        <div>
                          <Label>Lead Time (days) *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={assignment.lead_time}
                            onChange={(e) => updateSupplierAssignment(index, 'lead_time', parseInt(e.target.value) || 1)}
                            placeholder="7"
                            className={errors[`supplier_${index}_lead_time`] ? 'border-red-500' : ''}
                          />
                          {errors[`supplier_${index}_lead_time`] && (
                            <p className="text-sm text-red-600 mt-1">{errors[`supplier_${index}_lead_time`]}</p>
                          )}
                        </div>
                      </div>

                      {/* Tax Settings & Breakdown */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Tax Settings */}
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <input
                                type="checkbox"
                                id={`tax_included_${index}`}
                                checked={assignment.tax_included}
                                onChange={(e) => updateSupplierAssignment(index, 'tax_included', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <Label htmlFor={`tax_included_${index}`}>
                                Price includes tax
                              </Label>
                            </div>
                            
                            {assignment.base_cost_per_unit > 0 && assignment.tax_region_id > 0 && !assignment.tax_included && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => calculateTaxBreakdown(assignment, index)}
                                disabled={isCalculatingTax[index]}
                                className="w-full"
                              >
                                <Calculator className="h-4 w-4 mr-2" />
                                {isCalculatingTax[index] ? 'Calculating...' : 'Calculate Tax'}
                              </Button>
                            )}
                          </div>

                          {/* Tax Breakdown */}
                          {assignment.tax_breakdown && !assignment.tax_included && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h5 className="font-medium text-sm mb-2 flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Tax Breakdown ({assignment.tax_breakdown.tax_type})
                              </h5>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal:</span>
                                  <span>{assignment.currency_code} {assignment.tax_breakdown.subtotal.toFixed(2)}</span>
                                </div>
                                {assignment.tax_breakdown.gst_amount > 0 && (
                                  <div className="flex justify-between">
                                    <span>GST:</span>
                                    <span>{assignment.currency_code} {assignment.tax_breakdown.gst_amount.toFixed(2)}</span>
                                  </div>
                                )}
                                {assignment.tax_breakdown.pst_amount > 0 && (
                                  <div className="flex justify-between">
                                    <span>PST/QST:</span>
                                    <span>{assignment.currency_code} {assignment.tax_breakdown.pst_amount.toFixed(2)}</span>
                                  </div>
                                )}
                                {assignment.tax_breakdown.hst_amount > 0 && (
                                  <div className="flex justify-between">
                                    <span>HST:</span>
                                    <span>{assignment.currency_code} {assignment.tax_breakdown.hst_amount.toFixed(2)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium pt-1 border-t">
                                  <span>Total with Tax:</span>
                                  <span>{assignment.currency_code} {assignment.tax_breakdown.total_with_tax.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSupplierAssignment}
                    className="w-full"
                    disabled={suppliers.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Supplier Assignment
                  </Button>
                  
                  {suppliers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No active suppliers available. Please add suppliers first.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    * Required fields
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/manager/materials')}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Creating...' : 'Create Material'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
} 