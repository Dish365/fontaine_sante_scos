'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Building2, Truck, Leaf, User, Mail, Phone, MapPin, Search, Check, X, Package, DollarSign, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddressComponent {
  street_number: string;
  street_name: string;
  unit_suite: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  country_code: string;
}

interface AddressSuggestion {
  display_name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  components: AddressComponent;
}

interface MaterialPricing {
  material_id: number;
  material_name: string;
  material_unit: string;
  base_cost_per_unit: string;
  currency_id: number;
  tax_region_id: number;
  tax_included: boolean;
  lead_time: string;
  minimum_order_quantity: string;
  maximum_order_quantity: string;
  notes: string;
}

interface Material {
  id: number;
  name: string;
  unit: string;
  category_name: string;
  is_organic: boolean;
  sku: string;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface TaxRegion {
  id: number;
  name: string;
  country: string;
  province_state: string;
  total_tax_rate: number;
  tax_type: string;
}

interface SupplierFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  
  // Structured address fields
  street_number: string;
  street_name: string;
  unit_suite: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  country_code: string;
  
  // Capacity and business info
  min_supply_capacity: string;
  max_supply_capacity: string;
  current_capacity: string;
  transportation_mode: string;
  transportation_modes: string[];
  transportation_details: string;
  
  // Environmental info
  environmental_certification: string;
  carbon_footprint: string;
  renewable_energy_usage: string;
  waste_management_policy: string;
  environmental_impact_report: string;
  sustainability_goals: string;
  
  // Material assignments
  materials: MaterialPricing[];
  
  // Geocoding options
  auto_geocode: boolean;
}

const TRANSPORTATION_MODES = [
  { value: 'road', label: 'Road Transport' },
  { value: 'rail', label: 'Rail Transport' },
  { value: 'air', label: 'Air Transport' },
  { value: 'sea', label: 'Sea Transport' },
  { value: 'mixed', label: 'Mixed Transport' }
];

const ENVIRONMENTAL_CERTIFICATIONS = [
  { value: 'none', label: 'No Certification' },
  { value: 'iso14001', label: 'ISO 14001' },
  { value: 'iso50001', label: 'ISO 50001' },
  { value: 'green_business', label: 'Green Business Certification' },
  { value: 'carbon_neutral', label: 'Carbon Neutral Certified' }
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

export default function NewSupplierPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Loading and form states
  const [isSaving, setSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  // Address suggestion states
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  
  // Data states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [taxRegions, setTaxRegions] = useState<TaxRegion[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  
  // Form data state
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    
    // Address fields
    street_number: '',
    street_name: '',
    unit_suite: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'Canada',
    country_code: 'CA',
    
    // Capacity fields
    min_supply_capacity: '',
    max_supply_capacity: '',
    current_capacity: '',
    transportation_mode: 'road',
    transportation_modes: ['road'],
    transportation_details: '',
    
    // Environmental fields
    environmental_certification: 'none',
    carbon_footprint: '',
    renewable_energy_usage: '',
    waste_management_policy: '',
    environmental_impact_report: '',
    sustainability_goals: '',
    
    // Material assignments
    materials: [],
    
    // Geocoding
    auto_geocode: true
  });

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const baseUrl = 'http://localhost:8000/api/suppliers';
      
      const [materialsRes, currenciesRes, taxRegionsRes] = await Promise.all([
        fetch(`${baseUrl}/materials/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/currencies/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${baseUrl}/tax-regions/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (materialsRes.ok && currenciesRes.ok && taxRegionsRes.ok) {
        const [materialsData, currenciesData, taxRegionsData] = await Promise.all([
          materialsRes.json(),
          currenciesRes.json(),
          taxRegionsRes.json()
        ]);

        setMaterials(materialsData.results || materialsData);
        setCurrencies(currenciesData.results || currenciesData);
        setTaxRegions(taxRegionsData.results || taxRegionsData);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Address geocoding with OpenStreetMap
  const geocodeAddress = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/geocode/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address: query,
          country_code: formData.country_code
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  }, [formData.country_code]);

  // Handle address search
  const handleAddressSearch = (query: string) => {
    setAddressSearchQuery(query);
    setShowSuggestions(true);
    
    // Debounce the geocoding request
    const timeoutId = setTimeout(() => {
      geocodeAddress(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Select address from suggestions
  const selectAddress = (suggestion: AddressSuggestion) => {
    const components = suggestion.components;
    
    setFormData(prev => ({
      ...prev,
      street_number: components.street_number || '',
      street_name: components.street_name || '',
      city: components.city || '',
      state_province: components.state_province || '',
      postal_code: components.postal_code || '',
      country: components.country || 'Canada',
      country_code: components.country_code || 'CA'
    }));
    
    setAddressSearchQuery(suggestion.formatted_address);
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Input change handler
  const handleInputChange = (field: keyof SupplierFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle transportation mode selection
  const handleTransportationModeChange = (mode: string, isChecked: boolean) => {
    setFormData(prev => {
      let newModes = [...prev.transportation_modes];
      
      if (isChecked) {
        // Add mode if not already present
        if (!newModes.includes(mode)) {
          newModes.push(mode);
        }
      } else {
        // Remove mode
        newModes = newModes.filter(m => m !== mode);
      }
      
      // Ensure at least one mode is selected
      if (newModes.length === 0) {
        newModes = ['road']; // Default fallback
      }
      
      // Update primary transportation_mode to the first selected
      const primaryMode = newModes[0];
      
      return {
        ...prev,
        transportation_modes: newModes,
        transportation_mode: primaryMode
      };
    });
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = ['name', 'contact_person', 'email', 'phone', 'street_name', 'city', 'state_province', 'postal_code', 'min_supply_capacity', 'max_supply_capacity', 'current_capacity'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof SupplierFormData]) {
        toast.error(`${field.replace('_', ' ')} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Numeric validation for capacity fields
    const numericFields = ['min_supply_capacity', 'max_supply_capacity', 'current_capacity'];
    for (const field of numericFields) {
      const value = parseFloat(formData[field as keyof SupplierFormData] as string);
      if (isNaN(value) || value < 0) {
        toast.error(`${field.replace('_', ' ')} must be a valid positive number`);
        return false;
      }
    }

    // Capacity validation
    const minCapacity = parseFloat(formData.min_supply_capacity);
    const maxCapacity = parseFloat(formData.max_supply_capacity);
    const currentCapacity = parseFloat(formData.current_capacity);

    if (maxCapacity < minCapacity) {
      toast.error('Maximum capacity must be greater than or equal to minimum capacity');
      return false;
    }

    if (currentCapacity > maxCapacity) {
      toast.error('Current capacity cannot exceed maximum capacity');
      return false;
    }

    return true;
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare data for API
      const apiData = {
        name: formData.name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        street_number: formData.street_number,
        street_name: formData.street_name,
        unit_suite: formData.unit_suite,
        city: formData.city,
        state_province: formData.state_province,
        postal_code: formData.postal_code,
        country: formData.country,
        country_code: formData.country_code,
        min_supply_capacity: parseFloat(formData.min_supply_capacity),
        max_supply_capacity: parseFloat(formData.max_supply_capacity),
        current_capacity: parseFloat(formData.current_capacity),
        transportation_mode: formData.transportation_mode,
        transportation_modes: formData.transportation_modes,
        transportation_details: formData.transportation_details,
        environmental_certification: formData.environmental_certification,
        carbon_footprint: formData.carbon_footprint ? parseFloat(formData.carbon_footprint) : null,
        renewable_energy_usage: formData.renewable_energy_usage ? parseFloat(formData.renewable_energy_usage) : null,
        waste_management_policy: formData.waste_management_policy,
        environmental_impact_report: formData.environmental_impact_report,
        sustainability_goals: formData.sustainability_goals,
        materials_data: formData.materials.map(m => ({
          material_id: m.material_id,
          base_cost_per_unit: parseFloat(m.base_cost_per_unit) || 0,
          currency_id: m.currency_id,
          tax_region_id: m.tax_region_id,
          tax_included: m.tax_included,
          lead_time: parseInt(m.lead_time) || 0,
          minimum_order_quantity: parseFloat(m.minimum_order_quantity) || 1,
          maximum_order_quantity: m.maximum_order_quantity ? parseFloat(m.maximum_order_quantity) : null,
          notes: m.notes
        })),
        auto_geocode: formData.auto_geocode
      };

      const response = await fetch('http://localhost:8000/api/suppliers/suppliers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Supplier created successfully!');
        router.push('/manager/suppliers');
      } else {
        const errorData = await response.json();
        console.error('Supplier creation failed:', errorData);
        
        // Handle specific field errors
        if (errorData.email) {
          toast.error(`Email: ${errorData.email[0]}`);
        } else if (errorData.name) {
          toast.error(`Name: ${errorData.name[0]}`);
        } else {
          toast.error('Failed to create supplier. Please check your input.');
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add material to supplier
  const addMaterial = (materialId: number) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    const newMaterialPricing: MaterialPricing = {
      material_id: materialId,
      material_name: material.name,
      material_unit: material.unit,
      base_cost_per_unit: '',
      currency_id: currencies.find(c => c.code === 'CAD')?.id || 1,
      tax_region_id: taxRegions.find(t => t.country === 'CA')?.id || 1,
      tax_included: false,
      lead_time: '7',
      minimum_order_quantity: '1',
      maximum_order_quantity: '',
      notes: ''
    };

    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, newMaterialPricing]
    }));
    
    setSelectedMaterials(prev => [...prev, materialId]);
  };

  // Remove material from supplier
  const removeMaterial = (materialId: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.material_id !== materialId)
    }));
    
    setSelectedMaterials(prev => prev.filter(id => id !== materialId));
  };

  // Update material pricing
  const updateMaterialPricing = (materialId: number, field: keyof MaterialPricing, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map(m =>
        m.material_id === materialId ? { ...m, [field]: value } : m
      )
    }));
  };

  if (isLoading || isLoadingData) {
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/manager/suppliers')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Add New Supplier</h1>
                <p className="text-gray-600">Create a new supplier profile with material assignments</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/manager/suppliers')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Creating...' : 'Create Supplier'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the basic details for the supplier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contact_person"
                      value={formData.contact_person}
                      onChange={(e) => handleInputChange('contact_person', e.target.value)}
                      placeholder="Enter contact person name"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              </CardContent>
            </Card>

            {/* Address Information with OpenStreetMap Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </CardTitle>
                <CardDescription>
                  Enter address details with automatic geocoding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address Search */}
              <div className="space-y-2">
                  <Label htmlFor="addressSearch">Address Search</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="addressSearch"
                      value={addressSearchQuery}
                      onChange={(e) => handleAddressSearch(e.target.value)}
                      placeholder="Start typing address for suggestions..."
                    className="pl-10"
                    />
                    {isGeocoding && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Address Suggestions */}
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => selectAddress(suggestion)}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {suggestion.formatted_address}
                          </div>
                          <div className="text-xs text-gray-500">
                            {suggestion.display_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Structured Address Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="street_number">Street Number</Label>
                    <Input
                      id="street_number"
                      value={formData.street_number}
                      onChange={(e) => handleInputChange('street_number', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="street_name">Street Name *</Label>
                    <Input
                      id="street_name"
                      value={formData.street_name}
                      onChange={(e) => handleInputChange('street_name', e.target.value)}
                      placeholder="Main Street"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit_suite">Unit/Suite</Label>
                    <Input
                      id="unit_suite"
                      value={formData.unit_suite}
                      onChange={(e) => handleInputChange('unit_suite', e.target.value)}
                      placeholder="Suite 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Toronto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state_province">Province/State *</Label>
                    <Select
                      value={formData.state_province}
                      onValueChange={(value) => handleInputChange('state_province', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {CANADIAN_PROVINCES.map((province) => (
                          <SelectItem key={province.value} value={province.value}>
                            {province.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code *</Label>
                    <Input
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      placeholder="M5V 3A4"
                    />
                  </div>
                </div>

                {/* Auto-geocoding option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto_geocode"
                    checked={formData.auto_geocode}
                    onChange={(e) => handleInputChange('auto_geocode', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="auto_geocode" className="text-sm">
                    Automatically geocode address for mapping
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-8">
            {/* Material Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Material Assignment
                </CardTitle>
                <CardDescription>
                  Assign materials to this supplier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Material Selection */}
                <div className="space-y-2">
                  <Label>Available Materials</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {materials.filter(m => !selectedMaterials.includes(m.id)).map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={() => addMaterial(material.id)}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">{material.name}</div>
                          <div className="text-xs text-gray-500">
                            {material.category_name} • {material.unit}
                            {material.is_organic && <Badge variant="outline" className="ml-2">Organic</Badge>}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Materials */}
                {formData.materials.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Materials ({formData.materials.length})</Label>
                    <div className="space-y-2">
                      {formData.materials.map((material) => (
                        <div key={material.material_id} className="p-3 border rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium">{material.material_name}</div>
                              <div className="text-xs text-gray-500">Unit: {material.material_unit}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMaterial(material.material_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Quick pricing setup */}
                          <div className="mt-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Price per unit</Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                                  <Input
                                    value={material.base_cost_per_unit}
                                    onChange={(e) => updateMaterialPricing(material.material_id, 'base_cost_per_unit', e.target.value)}
                                    placeholder="0.00"
                                    className="pl-6 text-xs"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Lead time (days)</Label>
                                <div className="relative">
                                  <Clock className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                                  <Input
                                    value={material.lead_time}
                                    onChange={(e) => updateMaterialPricing(material.material_id, 'lead_time', e.target.value)}
                                    placeholder="7"
                                    className="pl-6 text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
                )}
            </CardContent>
          </Card>

          {/* Capacity Information */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity Information</CardTitle>
              <CardDescription>
                Specify the supplier's capacity details
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="min_supply_capacity">Minimum Capacity *</Label>
                  <Input
                    id="min_supply_capacity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_supply_capacity}
                    onChange={(e) => handleInputChange('min_supply_capacity', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_supply_capacity">Maximum Capacity *</Label>
                  <Input
                    id="max_supply_capacity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.max_supply_capacity}
                    onChange={(e) => handleInputChange('max_supply_capacity', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_capacity">Current Available *</Label>
                  <Input
                    id="current_capacity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.current_capacity}
                    onChange={(e) => handleInputChange('current_capacity', e.target.value)}
                    placeholder="0.00"
                  />
              </div>
            </CardContent>
          </Card>

          {/* Transportation Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Transportation
              </CardTitle>
              <CardDescription>
                  Select multiple transportation modes (primary mode will be first selected)
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Transportation Modes *</Label>
                  <div className="grid grid-cols-1 gap-3">
                      {TRANSPORTATION_MODES.map((mode) => (
                      <div key={mode.value} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`transport_${mode.value}`}
                          checked={formData.transportation_modes.includes(mode.value)}
                          onChange={(e) => handleTransportationModeChange(mode.value, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor={`transport_${mode.value}`} className="text-sm font-medium">
                          {mode.label}
                          {formData.transportation_modes[0] === mode.value && (
                            <Badge variant="outline" className="ml-2 text-xs">Primary</Badge>
                          )}
                        </Label>
                      </div>
                    ))}
                </div>
                  <p className="text-xs text-gray-500">
                    Selected modes: {formData.transportation_modes.length} 
                    {formData.transportation_modes.length > 0 && (
                      <span className="ml-1">
                        ({formData.transportation_modes.map(mode => 
                          TRANSPORTATION_MODES.find(m => m.value === mode)?.label
                        ).join(', ')})
                      </span>
                    )}
                  </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transportation_details">Transportation Details</Label>
                <Textarea
                  id="transportation_details"
                  value={formData.transportation_details}
                  onChange={(e) => handleInputChange('transportation_details', e.target.value)}
                    placeholder="Enter additional details about transportation methods, capabilities, restrictions, etc..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Environmental Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Leaf className="h-5 w-5 mr-2" />
                Environmental Information
              </CardTitle>
              <CardDescription>
                  Environmental certifications and sustainability
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="environmental_certification">Environmental Certification</Label>
                  <Select
                    value={formData.environmental_certification}
                    onValueChange={(value) => handleInputChange('environmental_certification', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVIRONMENTAL_CERTIFICATIONS.map((cert) => (
                        <SelectItem key={cert.value} value={cert.value}>
                          {cert.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbon_footprint">Carbon Footprint (metric tons CO2e)</Label>
                  <Input
                    id="carbon_footprint"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.carbon_footprint}
                    onChange={(e) => handleInputChange('carbon_footprint', e.target.value)}
                    placeholder="Annual carbon footprint"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewable_energy_usage">Renewable Energy Usage (%)</Label>
                  <Input
                    id="renewable_energy_usage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.renewable_energy_usage}
                    onChange={(e) => handleInputChange('renewable_energy_usage', e.target.value)}
                    placeholder="Percentage of renewable energy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sustainability_goals">Sustainability Goals</Label>
                <Textarea
                  id="sustainability_goals"
                  value={formData.sustainability_goals}
                  onChange={(e) => handleInputChange('sustainability_goals', e.target.value)}
                  placeholder="Describe sustainability goals and targets..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

          {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
            <Button
              variant="outline"
              onClick={() => router.push('/manager/suppliers')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Creating...' : 'Create Supplier'}
            </Button>
        </div>
      </main>
    </div>
  );
}