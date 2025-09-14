import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { 
  Building2, 
  MapPin, 
  User, 
  Package, 
  Navigation, 
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';

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

interface WarehouseFormProps {
  formData: WarehouseFormData;
  setFormData: (data: WarehouseFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

const WAREHOUSE_TYPES = [
  { value: 'distribution', label: 'Distribution Center' },
  { value: 'fulfillment', label: 'Fulfillment Center' },
  { value: 'storage', label: 'Storage Facility' },
  { value: 'cold_storage', label: 'Cold Storage' },
  { value: 'cross_dock', label: 'Cross-Dock Facility' },
  { value: 'hub', label: 'Regional Hub' },
  { value: 'consolidation', label: 'Consolidation Center' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'manufacturing', label: 'Manufacturing Facility' }
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

const COUNTRIES = [
  { value: 'Canada', code: 'CA', label: 'Canada' },
  { value: 'United States', code: 'US', label: 'United States' }
];

export default function WarehouseForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  loading = false 
}: WarehouseFormProps) {
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<any>(null);
  const [geocodeError, setGeocodeError] = useState<{
    message: string;
    suggestions: string[];
    addressTried: string;
  } | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof WarehouseFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    // Clear geocoding results when address fields change
    if (['street_number', 'street_name', 'unit_suite', 'city', 'state_province', 'postal_code', 'country'].includes(field)) {
      setGeocodeResult(null);
      setGeocodeError(null);
    }
  };

  const handleCountryChange = (country: string) => {
    const countryData = COUNTRIES.find(c => c.value === country);
    setFormData({
      ...formData,
      country: country,
      country_code: countryData?.code || 'CA'
    });
    setGeocodeResult(null);
    setGeocodeError(null);
  };

  const formatAddressForGeocoding = () => {
    const addressParts = [];
    
    // Street address
    if (formData.street_number && formData.street_name) {
      let streetAddress = `${formData.street_number} ${formData.street_name}`;
      if (formData.unit_suite) {
        streetAddress += `, ${formData.unit_suite}`;
      }
      addressParts.push(streetAddress);
    }
    
    // City
    if (formData.city) {
      addressParts.push(formData.city);
    }
    
    // Province/State
    if (formData.state_province) {
      // Use full province name for better geocoding
      const province = CANADIAN_PROVINCES.find(p => p.value === formData.state_province);
      addressParts.push(province?.label || formData.state_province);
    }
    
    // Postal code
    if (formData.postal_code) {
      addressParts.push(formData.postal_code);
    }
    
    // Country
    if (formData.country) {
      addressParts.push(formData.country);
    }
    
    return addressParts.join(', ');
  };

  const validateAddressFields = () => {
    const requiredFields = {
      'Street Name': formData.street_name,
      'City': formData.city,
      'Province/State': formData.state_province
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value?.trim())
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      toast({
        title: "Incomplete Address",
        description: `Please fill in the following fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleGeocodeAddress = async () => {
    if (!validateAddressFields()) {
      return;
    }

    const address = formatAddressForGeocoding();
    
    setGeocoding(true);
    setGeocodeResult(null);
    setGeocodeError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Geocoding address:', address);
      console.log('Country code:', formData.country_code);

      const response = await fetch('http://localhost:8000/api/suppliers/geocode/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          country_code: formData.country_code
        }),
      });

      const responseData = await response.json();
      console.log('Geocoding response:', responseData);

      if (response.ok) {
        setGeocodeResult(responseData);
        setGeocodeError(null);
        toast({
          title: "Success",
          description: "Address verified successfully",
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
      console.error('Error geocoding address:', error);
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
        description: `Failed to verify address: ${errorMessage}`,
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Warehouse name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Warehouse code is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.city.trim()) {
      toast({
        title: "Validation Error",
        description: "City is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.state_province) {
      toast({
        title: "Validation Error",
        description: "Province/State is required",
        variant: "destructive"
      });
      return false;
    }

    if (formData.manager_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.manager_email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (formData.current_utilization !== null && (formData.current_utilization < 0 || formData.current_utilization > 100)) {
      toast({
        title: "Validation Error",
        description: "Current utilization must be between 0 and 100",
        variant: "destructive"
      });
      return false;
    }

    // Validate Canadian postal code format if country is Canada
    if (formData.country_code === 'CA' && formData.postal_code) {
      const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      if (!canadianPostalRegex.test(formData.postal_code)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid Canadian postal code (e.g., K1A 0A6)",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  const isAddressComplete = formData.street_name && formData.city && formData.state_province;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Warehouse Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Montreal Distribution Center"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="code">Warehouse Code *</Label>
              <Input
                id="code"
                placeholder="e.g., MDC-001"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warehouse_type">Warehouse Type</Label>
              <Select
                value={formData.warehouse_type}
                onValueChange={(value) => handleInputChange('warehouse_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse type" />
                </SelectTrigger>
                <SelectContent>
                  {WAREHOUSE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4 pt-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => handleInputChange('is_primary', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_primary">Primary Facility</Label>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the warehouse's purpose and capabilities..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Address Information</span>
            </div>
            {geocodeResult && (
              <Badge variant="outline" className="text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Address Verified
              </Badge>
            )}
            {geocodeError && (
              <Badge variant="outline" className="text-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Verification Failed
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="street_number">Street Number</Label>
              <Input
                id="street_number"
                placeholder="1425"
                value={formData.street_number}
                onChange={(e) => handleInputChange('street_number', e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="street_name">Street Name *</Label>
              <Input
                id="street_name"
                placeholder="10th Avenue"
                value={formData.street_name}
                onChange={(e) => handleInputChange('street_name', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="unit_suite">Unit/Suite</Label>
            <Input
              id="unit_suite"
              placeholder="Unit 100, Suite A (optional)"
              value={formData.unit_suite}
              onChange={(e) => handleInputChange('unit_suite', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Victoria"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="state_province">Province/State *</Label>
              <Select
                value={formData.state_province}
                onValueChange={(value) => handleInputChange('state_province', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {CANADIAN_PROVINCES.map(province => (
                    <SelectItem key={province.value} value={province.value}>
                      {province.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                placeholder="V8X 3X4"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value.toUpperCase())}
              />
            </div>
            
            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country.code} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address preview */}
          <div className="p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm font-medium text-gray-600 mb-1">Address Preview:</p>
            <p className="text-sm text-gray-800">{formatAddressForGeocoding() || 'Please fill in address fields'}</p>
          </div>

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGeocodeAddress}
              disabled={geocoding || !isAddressComplete}
            >
              {geocoding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Verify Address
            </Button>
            
            {(geocodeResult || geocodeError) && (
              <Button
                type="button"
                variant="ghost"
                onClick={clearGeocodeResults}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {!isAddressComplete && (
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
              <Info className="h-4 w-4" />
              <span className="text-sm">Please complete street name, city, and province to verify address</span>
            </div>
          )}

                      {geocodeResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Address Verified Successfully</span>
                </div>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Formatted Address:</strong> {geocodeResult.formatted_address || 'N/A'}</p>
                  <p><strong>Coordinates:</strong> {(geocodeResult.latitude || 0).toFixed(6)}, {(geocodeResult.longitude || 0).toFixed(6)}</p>
                  <p><strong>Confidence:</strong> {Math.round((geocodeResult.confidence || 0) * 100)}%</p>
                </div>
              </div>
            )}

                      {geocodeError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-800 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Address Verification Failed</span>
                </div>
                <p className="text-sm text-red-700 mb-3">{geocodeError.message}</p>
                {geocodeError.suggestions.length > 0 && (
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">Suggestions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {geocodeError.suggestions.map((suggestion: string, index: number) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {geocodeError.addressTried && (
                  <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-600">
                    <strong>Address tried:</strong> {geocodeError.addressTried}
                  </div>
                )}
              </div>
            )}
        </CardContent>
      </Card>

      {/* Capacity Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Capacity Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storage_capacity">Storage Capacity (m³)</Label>
              <Input
                id="storage_capacity"
                type="number"
                placeholder="50000"
                value={formData.storage_capacity || ''}
                onChange={(e) => handleInputChange('storage_capacity', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
            
            <div>
              <Label htmlFor="current_utilization">Current Utilization (%)</Label>
              <Input
                id="current_utilization"
                type="number"
                min="0"
                max="100"
                placeholder="75"
                value={formData.current_utilization || ''}
                onChange={(e) => handleInputChange('current_utilization', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manager Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Manager Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="manager_name">Manager Name</Label>
            <Input
              id="manager_name"
              placeholder="John Smith"
              value={formData.manager_name}
              onChange={(e) => handleInputChange('manager_name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manager_email">Email Address</Label>
              <Input
                id="manager_email"
                type="email"
                placeholder="john.smith@company.com"
                value={formData.manager_email}
                onChange={(e) => handleInputChange('manager_email', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="manager_phone">Phone Number</Label>
              <Input
                id="manager_phone"
                placeholder="+1 (250) 555-0123"
                value={formData.manager_phone}
                onChange={(e) => handleInputChange('manager_phone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {isEditing ? 'Update Warehouse' : 'Create Warehouse'}
        </Button>
      </div>
    </div>
  );
} 