import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Building2, 
  User, 
  Package, 
  TrendingUp, 
  Users, 
  Phone, 
  Mail, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Simple toast implementation
const useToast = () => ({
  toast: (options: { title: string; description: string; variant?: string }) => {
    if (options.variant === 'destructive') {
      alert(`Error: ${options.title}\n${options.description}`);
    } else {
      alert(`${options.title}\n${options.description}`);
    }
  }
});

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

interface WarehouseDetailsProps {
  warehouse: Warehouse;
  onEdit: () => void;
  onClose: () => void;
}

const WAREHOUSE_TYPES = {
  'distribution': 'Distribution Center',
  'fulfillment': 'Fulfillment Center',
  'storage': 'Storage Facility',
  'cold_storage': 'Cold Storage',
  'cross_dock': 'Cross-Dock Facility',
  'hub': 'Regional Hub'
};

export default function WarehouseDetails({ warehouse, onEdit, onClose }: WarehouseDetailsProps) {
  const { toast } = useToast();

  const getUtilizationColor = (status: string) => {
    switch (status) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{warehouse.name}</h2>
          <p className="text-muted-foreground">{warehouse.code}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={warehouse.is_active ? "default" : "secondary"}>
              {warehouse.is_active ? "Active" : "Inactive"}
            </Badge>
            {warehouse.is_primary && (
              <Badge variant="outline">Primary Facility</Badge>
            )}
            <Badge variant="outline">
              {WAREHOUSE_TYPES[warehouse.warehouse_type as keyof typeof WAREHOUSE_TYPES]}
            </Badge>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onEdit}>
            Edit Warehouse
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Warehouse Type</p>
              <p className="text-sm">{WAREHOUSE_TYPES[warehouse.warehouse_type as keyof typeof WAREHOUSE_TYPES]}</p>
            </div>
            
            {warehouse.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{warehouse.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">{formatDate(warehouse.created_at)}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-sm">{formatDate(warehouse.updated_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Capacity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Capacity & Utilization</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warehouse.storage_capacity ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Capacity</p>
                <p className="text-sm">{warehouse.storage_capacity.toLocaleString()} m³</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Capacity</p>
                <p className="text-sm text-muted-foreground">Not specified</p>
              </div>
            )}

            {warehouse.current_utilization !== null ? (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Utilization</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${warehouse.current_utilization}%` }}
                    />
                  </div>
                  <Badge className={getUtilizationColor(warehouse.utilization_status)}>
                    {warehouse.current_utilization}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Status: {warehouse.utilization_status}</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Utilization</p>
                <p className="text-sm text-muted-foreground">Not tracked</p>
              </div>
            )}

            {warehouse.storage_capacity && warehouse.current_utilization && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Used Capacity</p>
                <p className="text-sm">
                  {Math.round(warehouse.storage_capacity * (warehouse.current_utilization / 100)).toLocaleString()} m³
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Address & Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Full Address</p>
            <p className="text-sm">{warehouse.full_address}</p>
          </div>

          {/* Address Components */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Street Address</p>
              <p className="text-sm">
                {warehouse.street_number} {warehouse.street_name}
                {warehouse.unit_suite && `, ${warehouse.unit_suite}`}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">City, Province</p>
              <p className="text-sm">{warehouse.city}, {warehouse.state_province}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
              <p className="text-sm">{warehouse.postal_code}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Country</p>
              <p className="text-sm">{warehouse.country}</p>
            </div>
          </div>

          {/* Geocoding Status */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Geocoding Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {warehouse.has_valid_coordinates ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Address Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-orange-600">Not Geocoded</span>
                    </>
                  )}
                </div>
              </div>

              {warehouse.map_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={warehouse.map_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Map
                  </a>
                </Button>
              )}
            </div>

            {warehouse.has_valid_coordinates && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Coordinates</p>
                  <p className="text-sm">
                    {warehouse.latitude?.toFixed(6)}, {warehouse.longitude?.toFixed(6)}
                  </p>
                </div>

                {warehouse.geocoding_source && (
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="text-sm">{warehouse.geocoding_source}</p>
                  </div>
                )}
              </div>
            )}

            {warehouse.geocoded_at && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Last Geocoded</p>
                <p className="text-sm">{formatDate(warehouse.geocoded_at)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manager Information */}
      {(warehouse.manager_name || warehouse.manager_email || warehouse.manager_phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Manager Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warehouse.manager_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manager Name</p>
                <p className="text-sm">{warehouse.manager_name}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warehouse.manager_email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${warehouse.manager_email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {warehouse.manager_email}
                    </a>
                  </div>
                </div>
              )}

              {warehouse.manager_phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={`tel:${warehouse.manager_phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {warehouse.manager_phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supply Chain Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Supply Chain Impact</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Nearby Suppliers</span>
            <span className="text-sm font-medium">{warehouse.nearby_suppliers}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Coverage Area</span>
            <span className="text-sm font-medium">100km radius</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Strategic Location</span>
            <Badge variant={warehouse.is_primary ? "default" : "secondary"}>
              {warehouse.is_primary ? "Primary Hub" : "Secondary Hub"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 