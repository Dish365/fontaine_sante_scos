'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Building2, Truck, Leaf, User, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface SupplierFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  min_supply_capacity: string;
  max_supply_capacity: string;
  current_capacity: string;
  transportation_mode: string;
  transportation_details: string;
  environmental_certification: string;
  carbon_footprint: string;
  renewable_energy_usage: string;
  waste_management_policy: string;
  environmental_impact_report: string;
  sustainability_goals: string;
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

export default function NewSupplierPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isSaving, setSaving] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    min_supply_capacity: '',
    max_supply_capacity: '',
    current_capacity: '',
    transportation_mode: 'road',
    transportation_details: '',
    environmental_certification: 'none',
    carbon_footprint: '',
    renewable_energy_usage: '',
    waste_management_policy: '',
    environmental_impact_report: '',
    sustainability_goals: ''
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  const handleInputChange = (field: keyof SupplierFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'contact_person', 'email', 'phone', 'address', 'min_supply_capacity', 'max_supply_capacity', 'current_capacity'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof SupplierFormData].trim()) {
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
      const value = parseFloat(formData[field as keyof SupplierFormData]);
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare data for API
      const apiData = {
        ...formData,
        min_supply_capacity: parseFloat(formData.min_supply_capacity),
        max_supply_capacity: parseFloat(formData.max_supply_capacity),
        current_capacity: parseFloat(formData.current_capacity),
        carbon_footprint: formData.carbon_footprint ? parseFloat(formData.carbon_footprint) : null,
        renewable_energy_usage: formData.renewable_energy_usage ? parseFloat(formData.renewable_energy_usage) : null,
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <p className="text-gray-600">Create a new supplier profile</p>
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
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
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter complete address"
                    className="pl-10"
                    rows={3}
                  />
                </div>
              </div>
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                Configure transportation and logistics details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="transportation_mode">Transportation Mode</Label>
                  <Select
                    value={formData.transportation_mode}
                    onValueChange={(value) => handleInputChange('transportation_mode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transportation mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSPORTATION_MODES.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transportation_details">Transportation Details</Label>
                <Textarea
                  id="transportation_details"
                  value={formData.transportation_details}
                  onChange={(e) => handleInputChange('transportation_details', e.target.value)}
                  placeholder="Enter additional transportation details..."
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
                Environmental certifications and sustainability details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="environmental_impact_report">Environmental Impact Report URL</Label>
                  <Input
                    id="environmental_impact_report"
                    type="url"
                    value={formData.environmental_impact_report}
                    onChange={(e) => handleInputChange('environmental_impact_report', e.target.value)}
                    placeholder="https://example.com/report.pdf"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="waste_management_policy">Waste Management Policy</Label>
                <Textarea
                  id="waste_management_policy"
                  value={formData.waste_management_policy}
                  onChange={(e) => handleInputChange('waste_management_policy', e.target.value)}
                  placeholder="Describe waste management practices..."
                  rows={3}
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
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
      </main>
    </div>
  );
}