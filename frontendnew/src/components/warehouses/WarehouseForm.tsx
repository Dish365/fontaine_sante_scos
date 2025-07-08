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
  Loader2
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
  const { toast } = useToast();

  const handleInputChange = (field: keyof WarehouseFormData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleCountryChange = (country: string) => {
    const countryData = COUNTRIES.find(c => c.value === country);
    setFormData({
      ...formData,
      country: country,
      country_code: countryData?.code || 'CA'
    });
  };

  const handleGeocodeAddress = async () => {
    const address = `${formData.street_number} ${formData.street_name} ${formData.unit_suite}, ${formData.city}, ${formData.state_province}, ${formData.postal_code}, ${formData.country}`.trim();
    
    if (!address) {
      toast({
        title: "Error",
        description: "Please fill in the address fields before geocoding",
        variant: "destructive"
      });
      return;
    }

    setGeocoding(true);
    setGeocodeResult(null);

    try {
      const token = localStorage.getItem('access_token');
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

      if (response.ok) {
        const result = await response.json();
        setGeocodeResult(result);
        toast({
          title: "Success",
          description: "Address geocoded successfully",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to geocode address",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast({
        title: "Error",
        description: "Failed to geocode address",
        variant: "destructive"
      });
    } finally {
      setGeocoding(false);
    }
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

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

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
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="street_number">Street Number</Label>
              <Input
                id="street_number"
                placeholder="123"
                value={formData.street_number}
                onChange={(e) => handleInputChange('street_number', e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="street_name">Street Name</Label>
              <Input
                id="street_name"
                placeholder="Main Street"
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
                placeholder="Montreal"
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
                placeholder="H1A 1A1"
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

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGeocodeAddress}
              disabled={geocoding}
            >
              {geocoding ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Verify Address
            </Button>
          </div>

          {geocodeResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Address Verified Successfully</span>
              </div>
              <p className="text-sm text-green-700">
                <strong>Formatted Address:</strong> {geocodeResult.formatted_address}
              </p>
              <p className="text-sm text-green-700">
                <strong>Coordinates:</strong> {geocodeResult.latitude.toFixed(6)}, {geocodeResult.longitude.toFixed(6)}
              </p>
              <p className="text-sm text-green-700">
                <strong>Confidence:</strong> {Math.round(geocodeResult.confidence * 100)}%
              </p>
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
                placeholder="+1 (514) 555-0123"
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