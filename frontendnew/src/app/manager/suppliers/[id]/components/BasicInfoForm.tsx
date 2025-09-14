'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Supplier } from '../types/supplier';

interface BasicInfoFormProps {
  supplier: Supplier;
  updateSupplier: (updates: Partial<Supplier>) => void;
}

export default function BasicInfoForm({ supplier, updateSupplier }: BasicInfoFormProps) {
  const handleInputChange = (field: keyof Supplier, value: string) => {
    updateSupplier({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Supplier Name *</Label>
          <Input
            id="name"
            value={supplier.name}
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
              value={supplier.contact_person}
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
              value={supplier.email}
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
              value={supplier.phone}
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
            value={supplier.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter complete address"
            className="pl-10"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
} 