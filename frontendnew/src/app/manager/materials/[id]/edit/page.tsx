'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supplierApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface MaterialCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface MaterialFormData {
  name: string;
  description: string;
  unit: string;
  category: number | null;
  sku: string;
  is_organic: boolean;
  is_active: boolean;
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

export default function EditMaterialPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<MaterialFormData | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch material
        const material = await supplierApi.getMaterialById(String(id));
        // Fetch categories
        const categoriesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/suppliers/material-categories/`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(typeof window !== 'undefined' && localStorage.getItem('access_token')
                ? { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                : {}),
            },
          }
        );
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.results || categoriesData);

        setFormData({
          name: material.name,
          description: material.description,
          unit: material.unit,
          category: material.category ?? null,
          sku: material.sku,
          is_organic: material.is_organic,
          is_active: material.is_active,
        });
      } catch (error) {
        toast.error('Failed to load material');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated && id) {
      loadData();
    }
  }, [id, isAuthenticated]);

  const handleInputChange = (field: keyof MaterialFormData, value: any) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, [field]: value } : prev);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    if (!formData) return false;
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Material name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await supplierApi.updateMaterial(String(id), formData);
      toast.success('Material updated successfully');
      router.push('/manager/materials');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update material');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingData || !formData) {
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => router.push('/manager/materials')} className="mr-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Materials
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Material</h1>
                <p className="text-gray-600">Update material details</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the details for this material</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Material Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category?.toString() || ''} onValueChange={(v) => handleInputChange('category', parseInt(v))}>
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.is_active).map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" rows={3} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(v) => handleInputChange('unit', v)}>
                    <SelectTrigger className={errors.unit ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_UNITS.map((u) => (
                        <SelectItem key={u.value} value={u.value}>
                          {u.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.unit && <p className="text-sm text-red-600 mt-1">{errors.unit}</p>}
                </div>
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" value={formData.sku} onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())} />
                  {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="is_organic"
                    checked={formData.is_organic}
                    onChange={(e) => handleInputChange('is_organic', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="is_organic">Organic</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end mt-6">
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}


