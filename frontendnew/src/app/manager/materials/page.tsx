'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, Package, Tag, Building2, DollarSign, TrendingUp, Leaf } from 'lucide-react';
import { toast } from 'sonner';

interface MaterialCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  material_count: number;
  created_at: string;
}

interface Material {
  id: number;
  name: string;
  description: string;
  unit: string;
  category: number;
  category_name: string;
  sku: string;
  is_organic: boolean;
  is_active: boolean;
  supplier_count: number;
  created_at: string;
  updated_at: string;
}

interface MaterialSearchFilters {
  query: string;
  category_id: number | null;
  unit: string;
  is_organic: boolean | null;
  min_suppliers: number | null;
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

export default function MaterialsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [isDataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [organicFilter, setOrganicFilter] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<number | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaterials();
      fetchCategories();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Filter materials based on search term and filters
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category.toString() === selectedCategory);
    }

    if (selectedUnit !== 'all') {
      filtered = filtered.filter(material => material.unit === selectedUnit);
    }

    if (organicFilter !== 'all') {
      filtered = filtered.filter(material => material.is_organic === (organicFilter === 'organic'));
    }

    setFilteredMaterials(filtered);
  }, [materials, searchTerm, selectedCategory, selectedUnit, organicFilter]);

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/suppliers/materials/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaterials(data.results || data);
      } else {
        toast.error('Failed to fetch materials');
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Network error while fetching materials');
    } finally {
      setDataLoading(false);
    }
  };

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

  const handleAdvancedSearch = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const filters: MaterialSearchFilters = {
        query: searchTerm,
        category_id: selectedCategory !== 'all' ? parseInt(selectedCategory) : null,
        unit: selectedUnit !== 'all' ? selectedUnit : '',
        is_organic: organicFilter !== 'all' ? organicFilter === 'organic' : null,
        min_suppliers: null,
      };

      const response = await fetch('http://localhost:8000/api/suppliers/materials/search/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });

      if (response.ok) {
        const data = await response.json();
        setFilteredMaterials(data);
        toast.success(`Found ${data.length} materials matching your criteria`);
      } else {
        toast.error('Failed to perform advanced search');
      }
    } catch (error) {
      console.error('Error performing advanced search:', error);
      toast.error('Network error during search');
    }
  };

  const handleDeleteMaterial = async (materialId: number, materialName: string) => {
    if (!confirm(`Are you sure you want to delete "${materialName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingMaterial(materialId);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/materials/${materialId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`Material "${materialName}" deleted successfully`);
        await fetchMaterials();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to delete material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Network error while deleting material');
    } finally {
      setDeletingMaterial(null);
    }
  };

  const viewMaterialDetails = (material: Material) => {
    setSelectedMaterial(material);
    setDetailModalOpen(true);
  };

  const viewPricingAnalysis = (materialId: number) => {
    router.push(`/manager/materials/${materialId}/pricing-analysis`);
  };

  const viewSuppliers = (materialId: number) => {
    router.push(`/manager/materials/${materialId}/suppliers`);
  };

  const getUnitBadgeColor = (unit: string) => {
    switch (unit) {
      case 'kg':
      case 'lb':
      case 'g':
      case 'ton':
        return 'bg-blue-100 text-blue-800';
      case 'L':
      case 'ml':
        return 'bg-cyan-100 text-cyan-800';
      case 'piece':
      case 'box':
      case 'bag':
        return 'bg-green-100 text-green-800';
      case 'm³':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                onClick={() => router.push('/manager/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
                <p className="text-gray-600">Manage raw materials and their categories</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/manager/materials/categories')}
              >
                <Tag className="h-4 w-4" />
                Manage Categories
              </Button>
              <Button
                onClick={() => router.push('/manager/materials/new')}
              >
                <Plus className="h-4 w-4" />
                Add Material
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search & Filter Materials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name} ({category.material_count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {MATERIAL_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={organicFilter} onValueChange={setOrganicFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="organic">Organic Only</SelectItem>
                    <SelectItem value="conventional">Conventional Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredMaterials.length} of {materials.length} materials
              </div>
              <Button
                variant="outline"
                onClick={handleAdvancedSearch}
                className="ml-4"
              >
                <Search className="h-4 w-4 mr-2" />
                Advanced Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Materials Grid */}
        {isDataLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMaterials.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedUnit !== 'all' || organicFilter !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first material.'}
              </p>
              <Button onClick={() => router.push('/manager/materials/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material) => (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{material.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {material.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {material.is_organic && (
                        <Badge className="bg-green-100 text-green-800">
                          <Leaf className="h-3 w-3 mr-1" />
                          Organic
                        </Badge>
                      )}
                      <Badge className={getUnitBadgeColor(material.unit)}>
                        {material.unit}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">SKU:</span>
                      <div className="text-gray-600">{material.sku}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <div className="text-gray-600">{material.category_name}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Suppliers:</span>
                      <div className="text-gray-600 flex items-center">
                        <Building2 className="h-3 w-3 mr-1" />
                        {material.supplier_count}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <Badge className={material.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {material.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewMaterialDetails(material)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/manager/materials/${material.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMaterial(material.id, material.name)}
                        disabled={deletingMaterial === material.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewSuppliers(material.id)}
                      >
                        <Building2 className="h-3 w-3 mr-1" />
                        Suppliers
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewPricingAnalysis(material.id)}
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Pricing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Material Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Material Details
            </DialogTitle>
            <DialogDescription>
              Complete information about {selectedMaterial?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedMaterial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">Name:</label>
                  <p className="text-gray-600">{selectedMaterial.name}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">SKU:</label>
                  <p className="text-gray-600">{selectedMaterial.sku}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Unit:</label>
                  <Badge className={getUnitBadgeColor(selectedMaterial.unit)}>
                    {selectedMaterial.unit}
                  </Badge>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Category:</label>
                  <p className="text-gray-600">{selectedMaterial.category_name}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Type:</label>
                  <Badge className={selectedMaterial.is_organic ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {selectedMaterial.is_organic ? 'Organic' : 'Conventional'}
                  </Badge>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Status:</label>
                  <Badge className={selectedMaterial.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {selectedMaterial.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="font-medium text-gray-700">Description:</label>
                <p className="text-gray-600 mt-1">{selectedMaterial.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">Suppliers:</label>
                  <p className="text-gray-600 flex items-center">
                    <Building2 className="h-4 w-4 mr-1" />
                    {selectedMaterial.supplier_count}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Created:</label>
                  <p className="text-gray-600">
                    {new Date(selectedMaterial.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Button
                  onClick={() => router.push(`/manager/materials/${selectedMaterial.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Material
                </Button>
                <Button
                  variant="outline"
                  onClick={() => viewSuppliers(selectedMaterial.id)}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View Suppliers
                </Button>
                <Button
                  variant="outline"
                  onClick={() => viewPricingAnalysis(selectedMaterial.id)}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing Analysis
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 