'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, Building2, MapPin, Users, TrendingUp, Navigation, Star } from 'lucide-react';
import { toast } from 'sonner';

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
  storage_capacity: number;
  current_utilization: number;
  utilization_status: string;
  manager_name: string;
  manager_email: string;
  manager_phone: string;
  map_url: string;
  is_active: boolean;
  is_primary: boolean;
  nearby_suppliers: number;
  created_at: string;
  updated_at: string;
}

const WAREHOUSE_TYPES = {
  distribution: 'Distribution Center',
  fulfillment: 'Fulfillment Center',
  storage: 'Storage Facility',
  cold_storage: 'Cold Storage',
  frozen: 'Frozen Storage',
  dry: 'Dry Goods Storage',
  cross_dock: 'Cross-Docking',
  manufacturing: 'Manufacturing Facility',
};

const UTILIZATION_STATUS_COLORS = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
  Unknown: 'bg-gray-100 text-gray-800',
};

export default function WarehousesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [isDataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [deletingWarehouse, setDeletingWarehouse] = useState<number | null>(null);
  const [geocodingWarehouse, setGeocodingWarehouse] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWarehouses();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Filter warehouses based on search term and filters
    let filtered = warehouses;

    if (searchTerm) {
      filtered = filtered.filter(warehouse =>
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.manager_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(warehouse => warehouse.warehouse_type === selectedType);
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(warehouse => warehouse.country === selectedCountry);
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(warehouse => warehouse.is_active);
      } else if (selectedStatus === 'inactive') {
        filtered = filtered.filter(warehouse => !warehouse.is_active);
      } else if (selectedStatus === 'primary') {
        filtered = filtered.filter(warehouse => warehouse.is_primary);
      }
    }

    setFilteredWarehouses(filtered);
  }, [warehouses, searchTerm, selectedType, selectedCountry, selectedStatus]);

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
        toast.error('Failed to fetch warehouses');
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('Network error while fetching warehouses');
    } finally {
      setDataLoading(false);
    }
  };

  const handleGeocodeWarehouse = async (warehouseId: number, warehouseName: string) => {
    setGeocodingWarehouse(warehouseId);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/warehouses/${warehouseId}/geocode/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Address geocoded successfully for "${warehouseName}"`);
        await fetchWarehouses(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to geocode address');
      }
    } catch (error) {
      console.error('Error geocoding warehouse:', error);
      toast.error('Network error while geocoding address');
    } finally {
      setGeocodingWarehouse(null);
    }
  };

  const handleDeleteWarehouse = async (warehouseId: number, warehouseName: string) => {
    if (!confirm(`Are you sure you want to delete "${warehouseName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingWarehouse(warehouseId);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/warehouses/${warehouseId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`Warehouse "${warehouseName}" deleted successfully`);
        await fetchWarehouses();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to delete warehouse');
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast.error('Network error while deleting warehouse');
    } finally {
      setDeletingWarehouse(null);
    }
  };

  const viewWarehouseDetails = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setDetailModalOpen(true);
  };

  const viewNearbySuppliers = (warehouseId: number) => {
    router.push(`/manager/warehouses/${warehouseId}/nearby-suppliers`);
  };

  const getUtilizationBadgeColor = (status: string) => {
    return UTILIZATION_STATUS_COLORS[status as keyof typeof UTILIZATION_STATUS_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const getWarehouseTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'distribution':
        return 'bg-blue-100 text-blue-800';
      case 'fulfillment':
        return 'bg-green-100 text-green-800';
      case 'storage':
        return 'bg-purple-100 text-purple-800';
      case 'cold_storage':
      case 'frozen':
        return 'bg-cyan-100 text-cyan-800';
      case 'cross_dock':
        return 'bg-orange-100 text-orange-800';
      case 'manufacturing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueCountries = Array.from(new Set(warehouses.map(w => w.country))).sort();

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
                <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
                <p className="text-gray-600">Manage warehouse locations and capacity</p>
              </div>
            </div>
            <Button onClick={() => router.push('/manager/warehouses/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Warehouse
            </Button>
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
              Search & Filter Warehouses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Input
                  placeholder="Search warehouses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(WAREHOUSE_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {uniqueCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                    <SelectItem value="primary">Primary Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing {filteredWarehouses.length} of {warehouses.length} warehouses
            </div>
          </CardContent>
        </Card>

        {/* Warehouses Grid */}
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
        ) : filteredWarehouses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedType !== 'all' || selectedCountry !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first warehouse.'}
              </p>
              <Button onClick={() => router.push('/manager/warehouses/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Warehouse
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWarehouses.map((warehouse) => (
              <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                        {warehouse.is_primary && (
                          <Star className="h-4 w-4 text-yellow-500 ml-2" />
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {warehouse.code} • {warehouse.description}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getWarehouseTypeBadgeColor(warehouse.warehouse_type)}>
                        {WAREHOUSE_TYPES[warehouse.warehouse_type as keyof typeof WAREHOUSE_TYPES] || warehouse.warehouse_type}
                      </Badge>
                      <Badge className={warehouse.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {warehouse.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Location */}
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        {warehouse.full_address || `${warehouse.city}, ${warehouse.state_province}, ${warehouse.country}`}
                      </div>
                    </div>

                    {/* Manager */}
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-600">
                        {warehouse.manager_name}
                      </div>
                    </div>

                    {/* Capacity & Utilization */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-700">Capacity:</span>
                        <div className="text-sm text-gray-600">{warehouse.storage_capacity?.toLocaleString() || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-700">Utilization:</span>
                        <div className="flex items-center">
                          <Badge className={getUtilizationBadgeColor(warehouse.utilization_status)}>
                            {warehouse.utilization_status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Location Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Navigation className="h-3 w-3 mr-1" />
                        {warehouse.has_valid_coordinates ? (
                          <span className="text-green-600">Located</span>
                        ) : (
                          <span className="text-orange-600">Not geocoded</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {warehouse.nearby_suppliers} nearby suppliers
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewWarehouseDetails(warehouse)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/manager/warehouses/${warehouse.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWarehouse(warehouse.id, warehouse.name)}
                        disabled={deletingWarehouse === warehouse.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!warehouse.has_valid_coordinates && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGeocodeWarehouse(warehouse.id, warehouse.name)}
                          disabled={geocodingWarehouse === warehouse.id}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Geocode
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewNearbySuppliers(warehouse.id)}
                      >
                        <Building2 className="h-3 w-3 mr-1" />
                        Suppliers
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Warehouse Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Warehouse Details
            </DialogTitle>
            <DialogDescription>
              Complete information about {selectedWarehouse?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Name:</label>
                    <p className="text-gray-600">{selectedWarehouse.name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Code:</label>
                    <p className="text-gray-600">{selectedWarehouse.code}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Type:</label>
                    <Badge className={getWarehouseTypeBadgeColor(selectedWarehouse.warehouse_type)}>
                      {WAREHOUSE_TYPES[selectedWarehouse.warehouse_type as keyof typeof WAREHOUSE_TYPES] || selectedWarehouse.warehouse_type}
                    </Badge>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Status:</label>
                    <div className="flex items-center space-x-2">
                      <Badge className={selectedWarehouse.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {selectedWarehouse.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {selectedWarehouse.is_primary && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="font-medium text-gray-700">Description:</label>
                  <p className="text-gray-600 mt-1">{selectedWarehouse.description}</p>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Address Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Full Address:</label>
                    <p className="text-gray-600">{selectedWarehouse.full_address || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">City:</label>
                    <p className="text-gray-600">{selectedWarehouse.city}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Province/State:</label>
                    <p className="text-gray-600">{selectedWarehouse.state_province}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Postal Code:</label>
                    <p className="text-gray-600">{selectedWarehouse.postal_code}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Coordinates:</label>
                    <p className="text-gray-600">
                      {selectedWarehouse.has_valid_coordinates ? (
                        <>
                          {selectedWarehouse.latitude?.toFixed(6)}, {selectedWarehouse.longitude?.toFixed(6)}
                          <Badge className="ml-2 bg-green-100 text-green-800">Geocoded</Badge>
                        </>
                      ) : (
                        <>
                          Not available
                          <Badge className="ml-2 bg-orange-100 text-orange-800">Not geocoded</Badge>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Capacity & Manager Information */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Capacity Information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="font-medium text-gray-700">Storage Capacity:</label>
                      <p className="text-gray-600">{selectedWarehouse.storage_capacity?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Current Utilization:</label>
                      <p className="text-gray-600">{selectedWarehouse.current_utilization || 0}%</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Utilization Status:</label>
                      <Badge className={getUtilizationBadgeColor(selectedWarehouse.utilization_status)}>
                        {selectedWarehouse.utilization_status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Manager Information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="font-medium text-gray-700">Manager Name:</label>
                      <p className="text-gray-600">{selectedWarehouse.manager_name}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Email:</label>
                      <p className="text-gray-600">{selectedWarehouse.manager_email}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Phone:</label>
                      <p className="text-gray-600">{selectedWarehouse.manager_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Analytics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Nearby Suppliers:</label>
                    <p className="text-gray-600 flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {selectedWarehouse.nearby_suppliers} within 100km
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Created:</label>
                    <p className="text-gray-600">
                      {new Date(selectedWarehouse.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Button
                  onClick={() => router.push(`/manager/warehouses/${selectedWarehouse.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Warehouse
                </Button>
                <Button
                  variant="outline"
                  onClick={() => viewNearbySuppliers(selectedWarehouse.id)}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  View Nearby Suppliers
                </Button>
                {selectedWarehouse.map_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedWarehouse.map_url, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 