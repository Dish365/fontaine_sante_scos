'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EconomicAnalysisPage() {
  const [supplierData, setSupplierData] = useState({
    supplier_id: '',
    volume: '',
    capacity: '',
    material_cost: '',
    transportation_cost: '',
    labor_cost: '',
    overhead_cost: '',
    tax_rate: '0.15'
  });

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const totalCost = parseFloat(supplierData.material_cost) + parseFloat(supplierData.transportation_cost) + 
                       parseFloat(supplierData.labor_cost) + parseFloat(supplierData.overhead_cost);
      const volume = parseFloat(supplierData.volume);
      const capacity = parseFloat(supplierData.capacity);
      const taxRate = parseFloat(supplierData.tax_rate);
      
      const costPerUnit = totalCost / volume;
      const roi = ((capacity * costPerUnit) - totalCost) / totalCost * 100;
      const score = Math.max(0, Math.min(100, 100 * (1 - (totalCost / (capacity * costPerUnit)))));
      
      setAnalysisResults({
        score: score,
        total_cost: totalCost,
        cost_per_unit: costPerUnit,
        roi: roi,
        tax_amount: totalCost * taxRate,
        cost_breakdown: {
          material: parseFloat(supplierData.material_cost),
          transportation: parseFloat(supplierData.transportation_cost),
          labor: parseFloat(supplierData.labor_cost),
          overhead: parseFloat(supplierData.overhead_cost)
        },
        recommendations: score < 30 ? 
          ['Consider renegotiating supplier contracts', 'Look for alternative suppliers with better pricing', 'Optimize transportation routes to reduce costs'] :
          score < 60 ?
          ['Review and optimize inventory management', 'Consider bulk purchasing for better rates', 'Evaluate automation opportunities'] :
          ['Maintain current cost structure', 'Focus on quality improvements', 'Consider long-term contracts']
      });
      setIsLoading(false);
    }, 1500);
  };

  const mockHistoricalData = [
    { month: 'Jan', cost: 85000, roi: 12.5 },
    { month: 'Feb', cost: 82000, roi: 15.2 },
    { month: 'Mar', cost: 88000, roi: 11.8 },
    { month: 'Apr', cost: 79000, roi: 18.3 },
    { month: 'May', cost: 84000, roi: 14.7 },
    { month: 'Jun', cost: 77000, roi: 19.8 }
  ];

  const supplierComparison = [
    { name: 'Supplier A', cost: 75000, quality: 92, delivery: 98, score: 88 },
    { name: 'Supplier B', cost: 82000, quality: 88, delivery: 95, score: 85 },
    { name: 'Supplier C', cost: 78000, quality: 95, delivery: 92, score: 91 },
    { name: 'Supplier D', cost: 85000, quality: 85, delivery: 90, score: 80 }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Economic Analysis</h1>
            <p className="text-gray-600">Cost optimization and financial impact assessment</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Cost Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Supplier Comparison</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Cost Data</CardTitle>
                <CardDescription>Enter supplier information for economic analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier_id">Supplier ID</Label>
                    <Input
                      id="supplier_id"
                      value={supplierData.supplier_id}
                      onChange={(e) => setSupplierData({...supplierData, supplier_id: e.target.value})}
                      placeholder="SUP001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="volume">Volume (units)</Label>
                    <Input
                      id="volume"
                      type="number"
                      value={supplierData.volume}
                      onChange={(e) => setSupplierData({...supplierData, volume: e.target.value})}
                      placeholder="1000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity (units)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={supplierData.capacity}
                      onChange={(e) => setSupplierData({...supplierData, capacity: e.target.value})}
                      placeholder="1200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.01"
                      value={supplierData.tax_rate}
                      onChange={(e) => setSupplierData({...supplierData, tax_rate: e.target.value})}
                      placeholder="0.15"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Cost Breakdown</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="material_cost">Material Cost ($)</Label>
                      <Input
                        id="material_cost"
                        type="number"
                        value={supplierData.material_cost}
                        onChange={(e) => setSupplierData({...supplierData, material_cost: e.target.value})}
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="transportation_cost">Transportation Cost ($)</Label>
                      <Input
                        id="transportation_cost"
                        type="number"
                        value={supplierData.transportation_cost}
                        onChange={(e) => setSupplierData({...supplierData, transportation_cost: e.target.value})}
                        placeholder="8000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="labor_cost">Labor Cost ($)</Label>
                      <Input
                        id="labor_cost"
                        type="number"
                        value={supplierData.labor_cost}
                        onChange={(e) => setSupplierData({...supplierData, labor_cost: e.target.value})}
                        placeholder="15000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="overhead_cost">Overhead Cost ($)</Label>
                      <Input
                        id="overhead_cost"
                        type="number"
                        value={supplierData.overhead_cost}
                        onChange={(e) => setSupplierData({...supplierData, overhead_cost: e.target.value})}
                        placeholder="7000"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Economic Score'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>Economic performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResults ? (
                  <div className="space-y-6">
                    {/* Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {analysisResults.score.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">Economic Score</p>
                      <Progress value={analysisResults.score} className="mt-2" />
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          ${analysisResults.total_cost.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">Total Cost</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${analysisResults.cost_per_unit.toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-600">Cost per Unit</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisResults.roi.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-600">ROI</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          ${analysisResults.tax_amount.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">Tax Amount</p>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                      <div className="space-y-2">
                        {Object.entries(analysisResults.cost_breakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 capitalize">{key}</span>
                            <span className="font-medium">${(value as number).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {analysisResults.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>Enter supplier data and click Calculate to view analysis results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Comparison</CardTitle>
              <CardDescription>Compare economic performance across suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Supplier</th>
                      <th className="text-right p-4">Cost</th>
                      <th className="text-right p-4">Quality Score</th>
                      <th className="text-right p-4">Delivery Rate</th>
                      <th className="text-right p-4">Overall Score</th>
                      <th className="text-center p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierComparison.map((supplier, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{supplier.name}</td>
                        <td className="p-4 text-right">${supplier.cost.toLocaleString()}</td>
                        <td className="p-4 text-right">{supplier.quality}%</td>
                        <td className="p-4 text-right">{supplier.delivery}%</td>
                        <td className="p-4 text-right font-bold">{supplier.score}</td>
                        <td className="p-4 text-center">
                          <Badge variant={supplier.score >= 85 ? 'default' : 'secondary'}>
                            {supplier.score >= 85 ? 'Excellent' : 'Good'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Trends</CardTitle>
              <CardDescription>Track economic performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Cost Trends</h4>
                    <div className="space-y-3">
                      {mockHistoricalData.map((data, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">{data.month}</span>
                          <div className="text-right">
                            <div className="font-medium">${data.cost.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Cost</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">ROI Trends</h4>
                    <div className="space-y-3">
                      {mockHistoricalData.map((data, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">{data.month}</span>
                          <div className="text-right">
                            <div className="font-medium">{data.roi}%</div>
                            <div className="text-sm text-gray-500">ROI</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization</CardTitle>
              <CardDescription>Identify opportunities for cost reduction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Optimization Opportunities</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900">Transportation Optimization</h5>
                        <p className="text-sm text-blue-700 mt-1">Potential savings: $12,000/year</p>
                        <p className="text-xs text-blue-600 mt-2">Optimize routes and consolidate shipments</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-900">Volume Discounts</h5>
                        <p className="text-sm text-green-700 mt-1">Potential savings: $8,500/year</p>
                        <p className="text-xs text-green-600 mt-2">Negotiate better rates for larger volumes</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900">Process Automation</h5>
                        <p className="text-sm text-purple-700 mt-1">Potential savings: $15,000/year</p>
                        <p className="text-xs text-purple-600 mt-2">Reduce labor costs through automation</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Implementation Roadmap</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Immediate Actions</h5>
                          <p className="text-sm text-gray-600">Renegotiate contracts, optimize routes</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Short-term (3-6 months)</h5>
                          <p className="text-sm text-gray-600">Implement automation, bulk purchasing</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">3</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Long-term (6+ months)</h5>
                          <p className="text-sm text-gray-600">Strategic partnerships, technology upgrades</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 