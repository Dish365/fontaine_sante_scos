'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Building2, Calculator, Leaf, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Material {
  id: number;
  name: string;
  description: string;
  unit: string;
  category_name: string;
  sku: string;
  is_organic: boolean;
}

interface SupplierMaterial {
  id: number;
  supplier: {
    id: number;
    name: string;
    city: string;
    state_province: string;
    country: string;
  };
  material_name: string;
  material_unit: string;
  base_cost_per_unit: number;
  currency_code: string;
  currency_symbol: string;
  tax_region_name: string;
  tax_included: boolean;
  lead_time: number;
  minimum_order_quantity: number;
  maximum_order_quantity: number | null;
  current_price: number;
  price_with_tax: number;
  available_discounts: Array<{
    min_qty: number;
    max_qty: number | null;
    price: number;
    discount_pct: number | null;
  }>;
}

interface PricingAnalysis {
  material_id: number;
  material_name: string;
  supplier_count: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  price_range: number;
  suppliers: Array<{
    supplier_id: number;
    supplier_name: string;
    price: number;
    price_with_tax: number;
    lead_time: number;
    min_quantity: number;
    currency: string;
  }>;
}

interface TaxCalculation {
  quantity: number;
  unit_price: number;
  subtotal: number;
  total_with_tax: number;
  currency: string;
  tax_breakdown: {
    gst_amount: number;
    pst_amount: number;
    hst_amount: number;
    total_tax: number;
    tax_type: string;
    tax_region: string;
  };
  lead_time_days: number;
  minimum_order_quantity: number;
  maximum_order_quantity: number | null;
}

export default function MaterialPricingAnalysisPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<Material | null>(null);
  const [pricingAnalysis, setPricingAnalysis] = useState<PricingAnalysis | null>(null);
  const [supplierMaterials, setSupplierMaterials] = useState<SupplierMaterial[]>([]);
  const [isDataLoading, setDataLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierMaterial | null>(null);
  const [calculationQuantity, setCalculationQuantity] = useState<number>(1);
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'price_with_tax' | 'lead_time'>('price');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/manager/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && materialId) {
      fetchMaterialData();
      fetchPricingAnalysis();
      fetchSupplierMaterials();
    }
  }, [isAuthenticated, materialId]);

  const fetchMaterialData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/materials/${materialId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaterial(data);
      } else {
        toast.error('Failed to fetch material data');
      }
    } catch (error) {
      console.error('Error fetching material:', error);
      toast.error('Network error while fetching material data');
    }
  };

  const fetchPricingAnalysis = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/materials/${materialId}/pricing-analysis/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPricingAnalysis(data);
      } else {
        toast.error('Failed to fetch pricing analysis');
      }
    } catch (error) {
      console.error('Error fetching pricing analysis:', error);
      toast.error('Network error while fetching pricing analysis');
    }
  };

  const fetchSupplierMaterials = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/materials/${materialId}/suppliers/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSupplierMaterials(data);
      } else {
        toast.error('Failed to fetch supplier materials');
      }
    } catch (error) {
      console.error('Error fetching supplier materials:', error);
      toast.error('Network error while fetching supplier materials');
    } finally {
      setDataLoading(false);
    }
  };

  const calculatePrice = async (supplierMaterial: SupplierMaterial, quantity: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/suppliers/supplier-materials/${supplierMaterial.id}/calculate-price/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        setTaxCalculation(data);
      } else {
        toast.error('Failed to calculate price');
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      toast.error('Network error while calculating price');
    }
  };

  const getSortedSupplierMaterials = () => {
    return [...supplierMaterials].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.current_price - b.current_price;
        case 'price_with_tax':
          return a.price_with_tax - b.price_with_tax;
        case 'lead_time':
          return a.lead_time - b.lead_time;
        default:
          return 0;
      }
    });
  };

  const getPriceChangeIndicator = (price: number, avgPrice: number) => {
    const percentage = ((price - avgPrice) / avgPrice) * 100;
    if (Math.abs(percentage) < 5) return null;
    
    return percentage > 0 ? (
      <div className="flex items-center text-red-600">
        <TrendingUp className="h-3 w-3 mr-1" />
        +{percentage.toFixed(1)}%
      </div>
    ) : (
      <div className="flex items-center text-green-600">
        <TrendingDown className="h-3 w-3 mr-1" />
        {percentage.toFixed(1)}%
      </div>
    );
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
                onClick={() => router.push('/manager/materials')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Materials
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pricing Analysis</h1>
                <p className="text-gray-600">
                  {material?.name} - Compare prices across suppliers
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Material Overview */}
        {material && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Material Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-600">{material.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <p className="text-gray-600">{material.sku}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Unit:</span>
                  <Badge className="bg-blue-100 text-blue-800">{material.unit}</Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <Badge className={material.is_organic ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {material.is_organic ? (
                      <>
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </>
                    ) : (
                      'Conventional'
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pricing Summary */}
        {pricingAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Minimum Price</CardDescription>
                <CardTitle className="text-2xl font-bold text-green-600">
                  ${pricingAnalysis.min_price.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Average Price</CardDescription>
                <CardTitle className="text-2xl font-bold text-blue-600">
                  ${pricingAnalysis.avg_price.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Maximum Price</CardDescription>
                <CardTitle className="text-2xl font-bold text-red-600">
                  ${pricingAnalysis.max_price.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Price Range</CardDescription>
                <CardTitle className="text-2xl font-bold text-purple-600">
                  ${pricingAnalysis.price_range.toFixed(2)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Sorting Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Supplier Comparison</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Base Price</SelectItem>
                    <SelectItem value="price_with_tax">Price with Tax</SelectItem>
                    <SelectItem value="lead_time">Lead Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Supplier Materials List */}
        {isDataLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : supplierMaterials.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
              <p className="text-gray-600">This material is not available from any suppliers yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {getSortedSupplierMaterials().map((supplierMaterial) => (
              <Card key={supplierMaterial.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {supplierMaterial.supplier.name}
                        </h3>
                        <div className="ml-2 flex items-center text-sm text-gray-500">
                          <MapPin className="h-3 w-3 mr-1" />
                          {supplierMaterial.supplier.city}, {supplierMaterial.supplier.state_province}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Base Price:</span>
                          <div className="text-lg font-semibold text-blue-600">
                            {supplierMaterial.currency_symbol}{supplierMaterial.current_price.toFixed(2)}
                            <span className="text-sm text-gray-500">/{supplierMaterial.material_unit}</span>
                          </div>
                          {pricingAnalysis && getPriceChangeIndicator(
                            supplierMaterial.current_price,
                            pricingAnalysis.avg_price
                          )}
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Price with Tax:</span>
                          <div className="text-lg font-semibold text-green-600">
                            {supplierMaterial.currency_symbol}{supplierMaterial.price_with_tax.toFixed(2)}
                            <span className="text-sm text-gray-500">/{supplierMaterial.material_unit}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {supplierMaterial.tax_region_name}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Lead Time:</span>
                          <div className="flex items-center text-orange-600">
                            <Clock className="h-4 w-4 mr-1" />
                            {supplierMaterial.lead_time} days
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Min Order:</span>
                          <div className="text-gray-600">
                            {supplierMaterial.minimum_order_quantity} {supplierMaterial.material_unit}
                          </div>
                        </div>
                      </div>

                      {/* Volume Discounts */}
                      {supplierMaterial.available_discounts.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <span className="text-sm font-medium text-gray-700">Volume Discounts:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {supplierMaterial.available_discounts.map((discount, index) => (
                              <Badge key={index} className="bg-purple-100 text-purple-800">
                                {discount.min_qty}+ {supplierMaterial.material_unit}: {supplierMaterial.currency_symbol}{discount.price.toFixed(2)}
                                {discount.discount_pct && ` (-${discount.discount_pct}%)`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6">
                      <Button
                        onClick={() => {
                          setSelectedSupplier(supplierMaterial);
                          calculatePrice(supplierMaterial, calculationQuantity);
                        }}
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Price
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Price Calculator */}
        {selectedSupplier && taxCalculation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Price Calculation - {selectedSupplier.supplier.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{taxCalculation.quantity} {selectedSupplier.material_unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">{selectedSupplier.currency_symbol}{taxCalculation.unit_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">{selectedSupplier.currency_symbol}{taxCalculation.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-lg font-semibold">Total with Tax:</span>
                      <span className="text-lg font-semibold text-green-600">
                        {selectedSupplier.currency_symbol}{taxCalculation.total_with_tax.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tax Breakdown</h4>
                  <div className="space-y-2">
                    {taxCalculation.tax_breakdown.gst_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">GST:</span>
                        <span className="font-medium">{selectedSupplier.currency_symbol}{taxCalculation.tax_breakdown.gst_amount.toFixed(2)}</span>
                      </div>
                    )}
                    {taxCalculation.tax_breakdown.pst_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PST:</span>
                        <span className="font-medium">{selectedSupplier.currency_symbol}{taxCalculation.tax_breakdown.pst_amount.toFixed(2)}</span>
                      </div>
                    )}
                    {taxCalculation.tax_breakdown.hst_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">HST:</span>
                        <span className="font-medium">{selectedSupplier.currency_symbol}{taxCalculation.tax_breakdown.hst_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total Tax:</span>
                      <span className="font-semibold">{selectedSupplier.currency_symbol}{taxCalculation.tax_breakdown.total_tax.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Tax Type: {taxCalculation.tax_breakdown.tax_type} ({taxCalculation.tax_breakdown.tax_region})
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
} 