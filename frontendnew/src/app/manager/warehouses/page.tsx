'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WarehouseForm from '@/components/warehouses/WarehouseForm';
import WarehouseDetails from '@/components/warehouses/WarehouseDetails';
import { 
  Search, 
  Plus, 
  MapPin, 
  Building2, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Edit,
  Eye,
  Navigation,
  Phone,
  Mail,
  Package,
  ArrowLeft
} from 'lucide-react';

// Types based on backend serializer
interface Warehouse {
  id: number;
  name: string;
  code: string;
  warehouse_type: string;
  description: string;
  street_number: string;
  street_name: string;
  unit_suite: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  country_code: string;
  full_address: string;
  latitude: number | null;
  longitude: number | null;
  coordinates: [number, number] | null;
  has_valid_coordinates: boolean;
  address_formatted: string;
  address_validated: boolean;
  geocoding_source: string;
  geocoded_at: string | null;
  storage_capacity: number | null;
  current_utilization: number | null;
  utilization_status: string;
  manager_name: string;
  manager_email: string;
  manager_phone: string;
  map_url: string | null;
  is_active: boolean;
  is_primary: boolean;
  nearby_suppliers: number;
  created_at: string;
  updated_at: string;
}

interface WarehouseFormData {
  name: string;
  code: string;
  warehouse_type: string;
  description: string;
  street_number: string;
  street_name: string;
  unit_suite: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  country_code: string;
  storage_capacity: number | null;
  current_utilization: number | null;
  manager_name: string;
  manager_email: string;
  manager_phone: string;
  is_active: boolean;
  is_primary: boolean;
}

const WAREHOUSE_TYPES = [
  { value: 'distribution', label: 'Distribution Center' },
  { value: 'fulfillment', label: 'Fulfillment Center' },
  { value: 'storage', label: 'Storage Facility' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'cross_dock', label: 'Cross-Dock Facility' },
  { value: 'hub', label: 'Regional Hub' }
];

const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' }
];

export default function WarehousesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Simple toast implementation
  const toast = (options: { title: string; description: string; variant?: string }) => {
    if (options.variant === 'destructive') {
      alert(`Error: ${options.title}\n${options.description}`);
    } else {
      alert(`${options.title}\n${options.description}`);
    }
  };

  // Form state
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    code: '',
    warehouse_type: 'distribution',
    description: '',
    street_number: '',
    street_name: '',
    unit_suite: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'Canada',
    country_code: 'CA',
    storage_capacity: null,
    current_utilization: null,
    manager_name: '',
    manager_email: '',
    manager_phone: '',
    is_active: true,
    is_primary: false
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/suppliers/warehouses/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setWarehouses(data.results || data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch warehouses",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/suppliers/warehouses/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newWarehouse = await response.json();
        setWarehouses([...warehouses, newWarehouse]);
        setShowCreateDialog(false);
        resetForm();
        toast({
          title: "Success",
          description: "Warehouse created successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to create warehouse",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating warehouse:', error);
      toast({
        title: "Error",
        description: "Failed to create warehouse",
        variant: "destructive"
      });
    }
  };

  const handleUpdateWarehouse = async () => {
    if (!selectedWarehouse) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/warehouses/${selectedWarehouse.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedWarehouse = await response.json();
        setWarehouses(warehouses.map(w => w.id === selectedWarehouse.id ? updatedWarehouse : w));
        setShowEditDialog(false);
        setSelectedWarehouse(null);
        resetForm();
        toast({
          title: "Success",
          description: "Warehouse updated successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to update warehouse",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast({
        title: "Error",
        description: "Failed to update warehouse",
        variant: "destructive"
      });
    }
  };

  const handleGeocodeWarehouse = async (warehouse: Warehouse) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/warehouses/${warehouse.id}/geocode/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setWarehouses(warehouses.map(w => w.id === warehouse.id ? result.warehouse : w));
          toast({
            title: "Success",
            description: "Address geocoded successfully",
          });
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error geocoding warehouse:', error);
      toast({
        title: "Error",
        description: "Failed to geocode address",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      warehouse_type: 'distribution',
      description: '',
      street_number: '',
      street_name: '',
      unit_suite: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'Canada',
      country_code: 'CA',
      storage_capacity: null,
      current_utilization: null,
      manager_name: '',
      manager_email: '',
      manager_phone: '',
      is_active: true,
      is_primary: false
    });
  };

  const openEditDialog = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      code: warehouse.code,
      warehouse_type: warehouse.warehouse_type,
      description: warehouse.description,
      street_number: warehouse.street_number,
      street_name: warehouse.street_name,
      unit_suite: warehouse.unit_suite,
      city: warehouse.city,
      state_province: warehouse.state_province,
      postal_code: warehouse.postal_code,
      country: warehouse.country,
      country_code: warehouse.country_code,
      storage_capacity: warehouse.storage_capacity,
      current_utilization: warehouse.current_utilization,
      manager_name: warehouse.manager_name,
      manager_email: warehouse.manager_email,
      manager_phone: warehouse.manager_phone,
      is_active: warehouse.is_active,
      is_primary: warehouse.is_primary
    });
    setShowEditDialog(true);
  };

  const openDetailsDialog = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setShowDetailsDialog(true);
  };

  // Filter warehouses
  const filteredWarehouses = (warehouses || []).filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.manager_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || warehouse.warehouse_type === selectedType;
    const matchesProvince = !selectedProvince || warehouse.state_province === selectedProvince;
    const matchesActive = !showActiveOnly || warehouse.is_active;
    
    return matchesSearch && matchesType && matchesProvince && matchesActive;
  });

  const getUtilizationColor = (status: string) => {
    switch (status) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading warehouses...</p>
        </div>
      </div>
    );
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
                <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
                <p className="text-gray-600">Manage warehouse locations, capacity, and operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Warehouse
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Warehouse</DialogTitle>
                  </DialogHeader>
                  <WarehouseForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleCreateWarehouse}
                    onCancel={() => {
                      setShowCreateDialog(false);
                      resetForm();
                    }}
                    loading={loading}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                          <div className="text-2xl font-bold">{warehouses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
                                  {(warehouses || []).filter(w => w.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(warehouses || []).filter(w => w.current_utilization !== null).length > 0
                ? Math.round(
                    (warehouses || [])
                      .filter(w => w.current_utilization !== null)
                      .reduce((sum, w) => sum + (w.current_utilization || 0), 0) /
                    (warehouses || []).filter(w => w.current_utilization !== null).length
                  )
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all facilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geocoded Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(warehouses || []).filter(w => w.has_valid_coordinates).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {(warehouses || []).filter(w => !w.has_valid_coordinates).length} need geocoding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nearby Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(warehouses || []).reduce((sum, w) => sum + (w.nearby_suppliers || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total in proximity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Search & Filter Warehouses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Input
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedType('')}
                  className="px-2"
                >
                  ×
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="All Provinces" />
                </SelectTrigger>
                <SelectContent>
                  {CANADIAN_PROVINCES.map(province => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProvince && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProvince('')}
                  className="px-2"
                >
                  ×
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activeOnly"
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="activeOnly" className="text-sm font-medium">
                Active Only
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredWarehouses.length} of {warehouses?.length || 0} warehouses
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse) => (
          <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{warehouse.code}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {warehouse.is_primary && (
                    <Badge variant="secondary">Primary</Badge>
                  )}
                  <Badge variant={warehouse.is_active ? "default" : "secondary"}>
                    {warehouse.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Type and Location */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-sm">
                  {WAREHOUSE_TYPES.find(t => t.value === warehouse.warehouse_type)?.label}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <p className="text-sm">{warehouse.city}, {warehouse.state_province}</p>
                  {warehouse.has_valid_coordinates ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                  )}
                </div>
              </div>

              {/* Capacity and Utilization */}
              {warehouse.storage_capacity && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                  <p className="text-sm">{(warehouse.storage_capacity || 0).toLocaleString()} m³</p>
                </div>
              )}

              {warehouse.current_utilization !== null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, warehouse.current_utilization || 0))}%` }}
                      />
                    </div>
                    <Badge className={getUtilizationColor(warehouse.utilization_status)}>
                      {warehouse.current_utilization || 0}%
                    </Badge>
                  </div>
                </div>
              )}

              {/* Manager Info */}
              {warehouse.manager_name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Manager</p>
                  <p className="text-sm">{warehouse.manager_name}</p>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    {warehouse.manager_email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{warehouse.manager_email}</span>
                      </div>
                    )}
                    {warehouse.manager_phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{warehouse.manager_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Suppliers */}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nearby Suppliers</p>
                <div className="flex items-center space-x-1">
                  <Package className="h-3 w-3" />
                  <p className="text-sm">{warehouse.nearby_suppliers || 0} suppliers within 100km</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDetailsDialog(warehouse)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(warehouse)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {!warehouse.has_valid_coordinates && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGeocodeWarehouse(warehouse)}
                  >
                    <Navigation className="h-3 w-3 mr-1" />
                    Geocode
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedType || selectedProvince
                ? "Try adjusting your search criteria or filters."
                : "Get started by adding your first warehouse."}
            </p>
            {!searchTerm && !selectedType && !selectedProvince && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      {selectedWarehouse && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <WarehouseDetails
              warehouse={selectedWarehouse}
              onEdit={() => {
                setShowDetailsDialog(false);
                openEditDialog(selectedWarehouse);
              }}
              onClose={() => {
                setShowDetailsDialog(false);
                setSelectedWarehouse(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {selectedWarehouse && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Warehouse - {selectedWarehouse.name}</DialogTitle>
            </DialogHeader>
            <WarehouseForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdateWarehouse}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedWarehouse(null);
                resetForm();
              }}
              isEditing={true}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
      </main>
    </div>
  );
} 