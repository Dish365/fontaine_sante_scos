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
  Loader2,
  RefreshCw,
  Navigation,
  Info
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
  'hub': 'Regional Hub',
  'consolidation': 'Consolidation Center',
  'retail': 'Retail Store',
  'manufacturing': 'Manufacturing Facility'
};

export default function WarehouseDetails({ warehouse, onEdit, onClose }: WarehouseDetailsProps) {
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<any>(null);
  const [geocodeError, setGeocodeError] = useState<{
    message: string;
    suggestions: string[];
    addressTried: string;
  } | null>(null);
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddressForGeocoding = () => {
    const addressParts = [];
    
    if (warehouse.street_number && warehouse.street_name) {
      let streetAddress = `${warehouse.street_number} ${warehouse.street_name}`;
      if (warehouse.unit_suite) {
        streetAddress += `, ${warehouse.unit_suite}`;
      }
      addressParts.push(streetAddress);
    }
    
    if (warehouse.city) {
      addressParts.push(warehouse.city);
    }
    
    if (warehouse.state_province) {
      addressParts.push(warehouse.state_province);
    }
    
    if (warehouse.postal_code) {
      addressParts.push(warehouse.postal_code);
    }
    
    if (warehouse.country) {
      addressParts.push(warehouse.country);
    }
    
    return addressParts.join(', ');
  };

  const handleReGeocode = async () => {
    const address = formatAddressForGeocoding();
    
    if (!address) {
      toast({
        title: "Error",
        description: "Cannot geocode - address information is incomplete",
        variant: "destructive"
      });
      return;
    }

    setGeocoding(true);
    setGeocodeResult(null);
    setGeocodeError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Re-geocoding address:', address);

      const response = await fetch('http://localhost:8000/api/suppliers/geocode/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          country_code: warehouse.country_code
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setGeocodeResult(responseData);
        setGeocodeError(null);
        toast({
          title: "Success",
          description: "Address re-verified successfully",
        });
      } else {
        // Handle improved error response from backend
        const errorMessage = responseData.error || responseData.message || "Failed to geocode address";
        const suggestions = responseData.suggestions || [];
        const addressTried = responseData.address_tried || address;
        
        setGeocodeError({
          message: errorMessage,
          suggestions: suggestions,
          addressTried: addressTried
        });
        
        toast({
          title: "Address Verification Failed",
          description: responseData.message || errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error re-geocoding address:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      
      setGeocodeError({
        message: errorMessage,
        suggestions: [
          "Check your internet connection",
          "Verify the address format",
          "Try again in a moment"
        ],
        addressTried: address
      });
      
      toast({
        title: "Error",
        description: `Failed to re-verify address: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setGeocoding(false);
    }
  };

  const clearGeocodeResults = () => {
    setGeocodeResult(null);
    setGeocodeError(null);
  };

  const getGeocodingStatusBadge = () => {
    if (geocodeResult) {
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Recently Verified
        </Badge>
      );
    }
    
    if (geocodeError) {
      return (
        <Badge variant="outline" className="text-red-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          Verification Failed
        </Badge>
      );
    }
    
    if (warehouse.has_valid_coordinates) {
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-orange-600">
        <AlertCircle className="h-3 w-3 mr-1" />
        Not Verified
      </Badge>
    );
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
            {getGeocodingStatusBadge()}
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
                  <p className="text-sm">{(warehouse.storage_capacity || 0).toLocaleString()} m³</p>
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
                        style={{ width: `${Math.max(0, Math.min(100, warehouse.current_utilization || 0))}%` }}
                      />
                    </div>
                    <Badge className={getUtilizationColor(warehouse.utilization_status)}>
                      {warehouse.current_utilization || 0}%
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

              {warehouse.storage_capacity && warehouse.current_utilization !== null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Used Capacity</p>
                  <p className="text-sm">
                    {Math.round((warehouse.storage_capacity || 0) * ((warehouse.current_utilization || 0) / 100)).toLocaleString()} m³
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
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Geocoding Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {geocodeResult ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Recently Verified</span>
                    </>
                  ) : geocodeError ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600">Verification Failed</span>
                    </>
                  ) : warehouse.has_valid_coordinates ? (
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

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReGeocode}
                  disabled={geocoding}
                >
                  {geocoding ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4 mr-2" />
                  )}
                  {geocoding ? 'Verifying...' : 'Re-verify'}
                </Button>
                
                {warehouse.map_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={warehouse.map_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Map
                    </a>
                  </Button>
                )}
              </div>
            </div>

                         {/* Recent geocoding results */}
             {geocodeResult && (
               <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                 <div className="flex items-center space-x-2 text-green-800 mb-2">
                   <CheckCircle className="h-4 w-4" />
                   <span className="font-medium">Recently Verified</span>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={clearGeocodeResults}
                   >
                     <RefreshCw className="h-4 w-4" />
                   </Button>
                 </div>
                 <div className="space-y-1 text-sm text-green-700">
                   <p><strong>Formatted Address:</strong> {geocodeResult.formatted_address || 'N/A'}</p>
                   <p><strong>Coordinates:</strong> {(geocodeResult.latitude || 0).toFixed(6)}, {(geocodeResult.longitude || 0).toFixed(6)}</p>
                   <p><strong>Confidence:</strong> {Math.round((geocodeResult.confidence || 0) * 100)}%</p>
                 </div>
               </div>
             )}

                         {geocodeError && (
               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                 <div className="flex items-center space-x-2 text-red-800 mb-2">
                   <AlertCircle className="h-4 w-4" />
                   <span className="font-medium">Verification Failed</span>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={clearGeocodeResults}
                   >
                     <RefreshCw className="h-4 w-4" />
                   </Button>
                 </div>
                 <p className="text-sm text-red-700 mb-3">{geocodeError.message}</p>
                 {geocodeError.suggestions.length > 0 && (
                   <div className="text-sm text-red-700 mb-3">
                     <p className="font-medium mb-1">Suggestions:</p>
                     <ul className="list-disc list-inside space-y-1">
                       {geocodeError.suggestions.map((suggestion: string, index: number) => (
                         <li key={index}>{suggestion}</li>
                       ))}
                     </ul>
                   </div>
                 )}
                 {geocodeError.addressTried && (
                   <div className="p-2 bg-red-100 rounded text-xs text-red-600">
                     <strong>Address tried:</strong> {geocodeError.addressTried}
                   </div>
                 )}
               </div>
             )}

            {/* Existing coordinates */}
            {warehouse.has_valid_coordinates && warehouse.latitude !== null && warehouse.longitude !== null && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Coordinates</p>
                  <p className="text-sm">
                    {warehouse.latitude.toFixed(6)}, {warehouse.longitude.toFixed(6)}
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
                <p className="text-sm">{formatDateTime(warehouse.geocoded_at)}</p>
              </div>
            )}

            {/* Address preview for geocoding */}
            <div className="mt-3 p-3 bg-gray-50 border rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Address Format for Geocoding:</p>
              <p className="text-sm text-gray-800">{formatAddressForGeocoding()}</p>
            </div>
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
            <span className="text-sm font-medium">{warehouse.nearby_suppliers || 0}</span>
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
          
          {!warehouse.has_valid_coordinates && (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <Info className="h-4 w-4" />
              <span className="text-sm">
                Geocoding required for accurate supplier distance calculations and routing optimization.
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 