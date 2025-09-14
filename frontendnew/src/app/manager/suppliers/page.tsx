'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search, Edit, Trash2, Eye, Building2, Truck, Leaf, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  min_supply_capacity: number;
  max_supply_capacity: number;
  current_capacity: number;
  transportation_mode: string;
  transportation_details: string;
  environmental_certification: string;
  carbon_footprint: number;
  renewable_energy_usage: number;
  waste_management_policy: string;
  environmental_impact_report: string;
  sustainability_goals: string;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

const TRANSPORTATION_MODES = {
  road: 'Road Transport',
  rail: 'Rail Transport',
  air: 'Air Transport',
  sea: 'Sea Transport',
  mixed: 'Mixed Transport'
};

const ENVIRONMENTAL_CERTIFICATIONS = {
  iso14001: 'ISO 14001',
  iso50001: 'ISO 50001',
  green_business: 'Green Business Certification',
  carbon_neutral: 'Carbon Neutral Certified',
  none: 'No Certification'
};

export default function SuppliersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [isDataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSuppliers();
    }
  }, [isAuthenticated]);

  // Keyboard shortcuts for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isDetailModalOpen) {
        if (event.key === 'Escape') {
          setDetailModalOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDetailModalOpen]);

  useEffect(() => {
    // Filter suppliers based on search term
    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/suppliers/suppliers/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.results || data);
      } else {
        toast.error('Failed to fetch suppliers');
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Network error while fetching suppliers');
    } finally {
      setDataLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplierId: number, supplierName: string) => {
    if (!confirm(`Are you sure you want to delete "${supplierName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingSupplier(supplierId);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/suppliers/${supplierId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(`Supplier "${supplierName}" deleted successfully`);
        await fetchSuppliers(); // Refresh the list
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || 'Failed to delete supplier');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast.error('Network error while deleting supplier');
    } finally {
      setDeletingSupplier(null);
    }
  };

  const getTransportationModeBadgeColor = (mode: string) => {
    switch (mode) {
      case 'road': return 'bg-blue-100 text-blue-800';
      case 'rail': return 'bg-green-100 text-green-800';
      case 'air': return 'bg-red-100 text-red-800';
      case 'sea': return 'bg-cyan-100 text-cyan-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationBadgeColor = (cert: string) => {
    switch (cert) {
      case 'iso14001':
      case 'iso50001':
      case 'green_business':
      case 'carbon_neutral':
        return 'bg-green-100 text-green-800';
      case 'none':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Suppliers Management</h1>
                <p className="text-gray-600">
                  Manage your supplier network • {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''} total
                  {searchTerm && filteredSuppliers.length !== suppliers.length && (
                    <span> • {filteredSuppliers.length} matching search</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={fetchSuppliers}
                disabled={isDataLoading}
              >
                {isDataLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button onClick={() => router.push('/manager/suppliers/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search suppliers by name, contact person, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        {isDataLoading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading suppliers...</div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new supplier.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={() => router.push('/manager/suppliers/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first supplier
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {supplier.contact_person}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/manager/suppliers/${supplier.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deletingSupplier === supplier.id}
                      >
                        {deletingSupplier === supplier.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Information */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-3 w-3 mr-2" />
                      {supplier.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-3 w-3 mr-2" />
                      {supplier.phone}
                    </div>
                    <div className="flex items-start text-gray-600">
                      <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Capacity Information */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">
                        {supplier.current_capacity}/{supplier.max_supply_capacity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min((supplier.current_capacity / supplier.max_supply_capacity) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Transportation and Environmental Info */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getTransportationModeBadgeColor(supplier.transportation_mode)}>
                      <Truck className="h-3 w-3 mr-1" />
                      {TRANSPORTATION_MODES[supplier.transportation_mode as keyof typeof TRANSPORTATION_MODES]}
                    </Badge>
                    <Badge className={getCertificationBadgeColor(supplier.environmental_certification)}>
                      <Leaf className="h-3 w-3 mr-1" />
                      {ENVIRONMENTAL_CERTIFICATIONS[supplier.environmental_certification as keyof typeof ENVIRONMENTAL_CERTIFICATIONS]}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                    <span>Orders: {supplier.total_orders || 0}</span>
                    <span>
                      Added: {new Date(supplier.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Supplier Detail Modal */}
      {isDetailModalOpen && selectedSupplier && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDetailModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedSupplier.name}</h2>
                  <p className="text-sm text-gray-600">Supplier ID: {selectedSupplier.id}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setDetailModalOpen(false)}
                  className="text-xl font-bold h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact Person</label>
                    <p className="mt-1">{selectedSupplier.contact_person}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="mt-1">{selectedSupplier.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="mt-1">{selectedSupplier.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="mt-1">{selectedSupplier.address}</p>
                  </div>
                </div>
              </div>

              {/* Capacity Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Capacity Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Minimum Capacity</label>
                    <p className="mt-1">{selectedSupplier.min_supply_capacity}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Maximum Capacity</label>
                    <p className="mt-1">{selectedSupplier.max_supply_capacity}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Available</label>
                    <p className="mt-1">{selectedSupplier.current_capacity}</p>
                  </div>
                </div>
              </div>

              {/* Transportation Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Transportation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transportation Mode</label>
                    <p className="mt-1">
                      {TRANSPORTATION_MODES[selectedSupplier.transportation_mode as keyof typeof TRANSPORTATION_MODES]}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Details</label>
                    <p className="mt-1">{selectedSupplier.transportation_details || 'No details provided'}</p>
                  </div>
                </div>
              </div>

              {/* Environmental Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Environmental Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Certification</label>
                    <p className="mt-1">
                      {ENVIRONMENTAL_CERTIFICATIONS[selectedSupplier.environmental_certification as keyof typeof ENVIRONMENTAL_CERTIFICATIONS]}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Carbon Footprint</label>
                    <p className="mt-1">
                      {selectedSupplier.carbon_footprint ? `${selectedSupplier.carbon_footprint} metric tons CO2e` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Renewable Energy Usage</label>
                    <p className="mt-1">
                      {selectedSupplier.renewable_energy_usage ? `${selectedSupplier.renewable_energy_usage}%` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Environmental Report</label>
                    <p className="mt-1">
                      {selectedSupplier.environmental_impact_report ? (
                        <a href={selectedSupplier.environmental_impact_report} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Report
                        </a>
                      ) : 'No report available'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Waste Management Policy</label>
                    <p className="mt-1">{selectedSupplier.waste_management_policy || 'No policy specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Sustainability Goals</label>
                    <p className="mt-1">{selectedSupplier.sustainability_goals || 'No goals specified'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between border-t pt-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleDeleteSupplier(selectedSupplier.id, selectedSupplier.name);
                  }}
                  disabled={deletingSupplier === selectedSupplier.id}
                >
                  {deletingSupplier === selectedSupplier.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Supplier
                </Button>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setDetailModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setDetailModalOpen(false);
                      router.push(`/manager/suppliers/${selectedSupplier.id}`);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Supplier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 