'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Supplier } from './types/supplier';
import { supplierApi } from '@/lib/api';
import BasicInfoForm from './components/BasicInfoForm';
import CapacityInfoForm from './components/CapacityInfoForm';
import TransportationForm from './components/TransportationForm';
import EnvironmentalForm from './components/EnvironmentalForm';
import MaterialsForm from './components/MaterialsForm';

const steps = [
  { id: 'basic', title: 'Basic Information' },
  { id: 'capacity', title: 'Capacity Information' },
  { id: 'transportation', title: 'Transportation Details' },
  { id: 'environmental', title: 'Environmental Information' },
  { id: 'materials', title: 'Materials & Pricing' }
];

export default function UpdateSupplierPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const data = await supplierApi.getSupplierById(String(id));
        setSupplier(data as Supplier);
      } catch (error) {
        console.error('Error fetching supplier:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    if (id) {
      fetchSupplier();
    }
  }, [id]);

  const handleSave = async () => {
    if (!supplier) return;

    setIsSaving(true);
    try {
      await supplierApi.updateSupplier(String(id), supplier);
      router.push('/manager/suppliers');
    } catch (error) {
      console.error('Error updating supplier:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSupplier = (updates: Partial<Supplier>) => {
    setSupplier(prev => prev ? { ...prev, ...updates } : null);
  };

  if (isDataLoading || !supplier) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Update Supplier</h1>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span
                key={step.id}
                className="text-sm text-gray-600"
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        <Card className="p-6">
          {currentStep === 0 && (
            <BasicInfoForm supplier={supplier} updateSupplier={updateSupplier} />
          )}
          {currentStep === 1 && (
            <CapacityInfoForm supplier={supplier} updateSupplier={updateSupplier} />
          )}
          {currentStep === 2 && (
            <TransportationForm supplier={supplier} updateSupplier={updateSupplier} />
          )}
          {currentStep === 3 && (
            <EnvironmentalForm supplier={supplier} updateSupplier={updateSupplier} />
          )}
          {currentStep === 4 && (
            <MaterialsForm supplier={supplier} updateSupplier={updateSupplier} />
          )}
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(prev => prev + 1)}
            disabled={currentStep === steps.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 