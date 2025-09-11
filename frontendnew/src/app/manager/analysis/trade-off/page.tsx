'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Scale, Target, User, Mail, MapPin, Truck, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TradeoffAnalysisPage() {
  const router = useRouter();
  const [tradeoffData, setTradeoffData] = useState({
    economic_score: '',
    quality_score: '',
    environmental_score: '',
    weights: {
      economic: 0.4,
      quality: 0.3,
      environmental: 0.3
    }
  });

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleWeightChange = (dimension: string, value: number) => {
    const newWeights = { ...tradeoffData.weights, [dimension]: value };
    
    // Normalize weights to sum to 1
    const total = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
    if (total > 0) {
      Object.keys(newWeights).forEach(key => {
        newWeights[key as keyof typeof newWeights] = newWeights[key as keyof typeof newWeights] / total;
      });
    }
    
    setTradeoffData({ ...tradeoffData, weights: newWeights });
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    // Clear previous results to avoid cached display
    setAnalysisResults(null);
    
    try {
      // Prepare data for API call
      const payload = {
        economic_score: parseFloat(tradeoffData.economic_score) || 0,
        quality_score: parseFloat(tradeoffData.quality_score) || 0,
        environmental_score: parseFloat(tradeoffData.environmental_score) || 0,
        weights: tradeoffData.weights
      };

      // Call FastAPI backend
      console.log('Calling FastAPI trade-off endpoint with payload:', payload);
      const response = await fetch('http://localhost:8001/tradeoff/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('FastAPI response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('FastAPI response data:', result);
      console.log('Supplier recommendations:', result.supplier_recommendations);
      
      // Check if we got real data
      if (result.supplier_recommendations && result.supplier_recommendations.length > 0) {
        const firstSupplier = result.supplier_recommendations[0];
        if (firstSupplier.name.includes('(Fallback)')) {
          console.warn('⚠️ Still getting fallback data from FastAPI');
        } else {
          console.log('✅ Got real supplier data from FastAPI');
        }
      }
      
      setAnalysisResults(result);
    } catch (error) {
      console.error('Error calling tradeoff assessment API:', error);
      // Fallback to mock data if API fails
      const mockResult = {
        overall_score: 75.5,
        balanced_score: 73.2,
        risk_level: 'Medium',
        risk_assessment: 'Medium risk with acceptable performance, some improvement needed',
        tradeoff_matrix: {
          economic: {
            score: parseFloat(tradeoffData.economic_score) || 70,
            weight: tradeoffData.weights.economic,
            weighted_score: (parseFloat(tradeoffData.economic_score) || 70) * tradeoffData.weights.economic
          },
          quality: {
            score: parseFloat(tradeoffData.quality_score) || 80,
            weight: tradeoffData.weights.quality,
            weighted_score: (parseFloat(tradeoffData.quality_score) || 80) * tradeoffData.weights.quality
          },
          environmental: {
            score: parseFloat(tradeoffData.environmental_score) || 75,
            weight: tradeoffData.weights.environmental,
            weighted_score: (parseFloat(tradeoffData.environmental_score) || 75) * tradeoffData.weights.environmental
          }
        },
        recommendations: [
          'Check API connection',
          'Verify backend is running on port 8001',
          'Focus on balanced performance optimization'
        ],
        supplier_recommendations: [
          {
            id: 1,
            name: 'GreenTech Supplies',
            contact_person: 'John Smith',
            email: 'john@greentech.com',
            city: 'Montreal',
            transportation_mode: 'road',
            environmental_certification: 'iso14001',
            current_capacity: 5000.0,
            economic_score: 85.5,
            quality_score: 78.2,
            environmental_score: 92.1,
            overall_match_score: 85.3,
            match_reason: 'Excellent match with strong economic alignment and environmental goals alignment'
          },
          {
            id: 2,
            name: 'EcoFarm Solutions',
            contact_person: 'Maria Garcia',
            email: 'maria@ecofarm.com',
            city: 'Toronto',
            transportation_mode: 'rail',
            environmental_certification: 'carbon_neutral',
            current_capacity: 8000.0,
            economic_score: 72.8,
            quality_score: 88.5,
            environmental_score: 95.0,
            overall_match_score: 82.1,
            match_reason: 'Good match with quality standards match and environmental goals alignment'
          },
          {
            id: 3,
            name: 'Quality Foods Ltd',
            contact_person: 'David Chen',
            email: 'david@qualityfoods.com',
            city: 'Vancouver',
            transportation_mode: 'mixed',
            environmental_certification: 'green_business',
            current_capacity: 12000.0,
            economic_score: 88.2,
            quality_score: 91.7,
            environmental_score: 68.4,
            overall_match_score: 79.8,
            match_reason: 'Good match with strong economic alignment and quality standards match'
          }
        ]
      };
      setAnalysisResults(mockResult);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/manager/dashboard')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Trade-off Analysis</h1>
        </div>
      </div>

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Trade-off Assessment</TabsTrigger>
          <TabsTrigger value="matrix">Trade-off Matrix</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Recommendations</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Performance Scores
                </CardTitle>
                <CardDescription>Enter scores for each dimension (0-100)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Inputs */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="economic_score">Economic Score</Label>
                    <Input
                      id="economic_score"
                      type="number"
                      min="0"
                      max="100"
                      value={tradeoffData.economic_score}
                      onChange={(e) => setTradeoffData({...tradeoffData, economic_score: e.target.value})}
                      placeholder="75"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quality_score">Quality Score</Label>
                    <Input
                      id="quality_score"
                      type="number"
                      min="0"
                      max="100"
                      value={tradeoffData.quality_score}
                      onChange={(e) => setTradeoffData({...tradeoffData, quality_score: e.target.value})}
                      placeholder="85"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="environmental_score">Environmental Score</Label>
                    <Input
                      id="environmental_score"
                      type="number"
                      min="0"
                      max="100"
                      value={tradeoffData.environmental_score}
                      onChange={(e) => setTradeoffData({...tradeoffData, environmental_score: e.target.value})}
                      placeholder="70"
                    />
                  </div>
                </div>

                <Separator />

                {/* Weight Configuration */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Importance Weights</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Economic ({(tradeoffData.weights.economic * 100).toFixed(0)}%)</Label>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={tradeoffData.weights.economic}
                        onChange={(e) => handleWeightChange('economic', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Quality ({(tradeoffData.weights.quality * 100).toFixed(0)}%)</Label>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={tradeoffData.weights.quality}
                        onChange={(e) => handleWeightChange('quality', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <Label>Environmental ({(tradeoffData.weights.environmental * 100).toFixed(0)}%)</Label>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={tradeoffData.weights.environmental}
                        onChange={(e) => handleWeightChange('environmental', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Trade-off Analysis'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analysis Results
                </CardTitle>
                <CardDescription>Trade-off performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResults ? (
                  <div className="space-y-6">
                    {/* Overall Scores */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(analysisResults.overall_score)}`}>
                          {analysisResults.overall_score.toFixed(1)}
                        </div>
                        <p className="text-sm text-gray-600">Overall Score</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(analysisResults.balanced_score)}`}>
                          {analysisResults.balanced_score.toFixed(1)}
                        </div>
                        <p className="text-sm text-gray-600">Balanced Score</p>
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="text-center">
                      <Badge className={getRiskColor(analysisResults.risk_level)}>
                        {analysisResults.risk_level} Risk
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">{analysisResults.risk_assessment}</p>
                    </div>

                    {/* Component Scores */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Component Performance</h4>
                      {Object.entries(analysisResults.tradeoff_matrix).map(([dimension, data]: [string, any]) => (
                        <div key={dimension} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex-1">
                            <span className="text-sm font-medium capitalize">{dimension}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={data.score} className="flex-1" />
                              <span className="text-sm text-gray-600">{data.score.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-sm text-gray-500">Weight: {(data.weight * 100).toFixed(0)}%</div>
                            <div className="text-sm font-medium">Score: {data.weighted_score.toFixed(1)}</div>
                          </div>
                        </div>
                      ))}
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
                    <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter performance scores and click Calculate to view trade-off analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade-off Matrix</CardTitle>
              <CardDescription>Detailed performance comparison across dimensions</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResults ? (
                <div className="space-y-6">
                  {/* Performance Radar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(analysisResults.tradeoff_matrix).map(([dimension, data]: [string, any]) => (
                      <div key={dimension} className="p-4 border rounded-lg">
                        <h4 className="font-medium capitalize mb-2">{dimension}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Raw Score:</span>
                            <span className="font-medium">{data.score.toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Weight:</span>
                            <span className="font-medium">{(data.weight * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Weighted Score:</span>
                            <span className="font-medium">{data.weighted_score.toFixed(1)}</span>
                          </div>
                          <Progress value={data.score} className="mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trade-off Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Performance Balance</h4>
                      <div className="space-y-2">
                        {Object.entries(analysisResults.tradeoff_matrix).map(([dimension, data]: [string, any]) => {
                          const isStrong = data.score >= 80;
                          const isWeak = data.score < 60;
                          return (
                            <div key={dimension} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="capitalize">{dimension}</span>
                              <div className="flex items-center gap-2">
                                {isStrong ? (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                ) : isWeak ? (
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Target className="h-4 w-4 text-yellow-500" />
                                )}
                                <Badge variant={isStrong ? 'default' : isWeak ? 'destructive' : 'secondary'}>
                                  {isStrong ? 'Strong' : isWeak ? 'Needs Improvement' : 'Moderate'}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Optimization Potential</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded">
                          <h5 className="font-medium text-blue-900">Best Performance</h5>
                          <p className="text-sm text-blue-700">
                            {Object.entries(analysisResults.tradeoff_matrix)
                              .reduce((max, [dim, data]: [string, any]) => 
                                data.score > max.score ? { dimension: dim, score: data.score } : max, 
                                { dimension: '', score: 0 }
                              ).dimension.charAt(0).toUpperCase() + 
                              Object.entries(analysisResults.tradeoff_matrix)
                                .reduce((max, [dim, data]: [string, any]) => 
                                  data.score > max.score ? { dimension: dim, score: data.score } : max, 
                                  { dimension: '', score: 0 }
                                ).dimension.slice(1)
                            } dimension shows strongest performance
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded">
                          <h5 className="font-medium text-orange-900">Improvement Area</h5>
                          <p className="text-sm text-orange-700">
                            Focus on {Object.entries(analysisResults.tradeoff_matrix)
                              .reduce((min, [dim, data]: [string, any]) => 
                                data.score < min.score ? { dimension: dim, score: data.score } : min, 
                                { dimension: '', score: 100 }
                              ).dimension} dimension for maximum impact
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Run trade-off analysis to view detailed matrix</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Recommended Suppliers
              </CardTitle>
              <CardDescription>Suppliers that best match your trade-off analysis criteria</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResults?.supplier_recommendations ? (
                <div className="space-y-6">
                  {analysisResults.supplier_recommendations.length > 0 ? (
                    <div className="grid gap-4">
                      {analysisResults.supplier_recommendations.map((supplier: any, index: number) => (
                        <div key={supplier.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                  index === 0 ? 'bg-yellow-500' : 
                                  index === 1 ? 'bg-gray-400' : 
                                  index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                                }`}>
                                  {index + 1}
                                </div>
                                <h3 className="text-lg font-semibold">{supplier.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  {supplier.overall_match_score.toFixed(1)}% Match
                                </Badge>
                                {supplier.name.includes('(Fallback)') && (
                                  <Badge variant="destructive" className="text-xs">
                                    Demo Data
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="h-4 w-4" />
                                    <span>{supplier.contact_person}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <span>{supplier.email}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>{supplier.city}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Truck className="h-4 w-4" />
                                    <span className="capitalize">{supplier.transportation_mode.replace('_', ' ')}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Award className="h-4 w-4" />
                                    <span className="capitalize">{supplier.environmental_certification.replace('_', ' ')}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Capacity: {supplier.current_capacity.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Performance Scores</h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">{supplier.economic_score.toFixed(1)}</div>
                                    <div className="text-xs text-blue-600">Economic</div>
                                  </div>
                                  <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-lg font-bold text-green-600">{supplier.quality_score.toFixed(1)}</div>
                                    <div className="text-xs text-green-600">Quality</div>
                                  </div>
                                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                                    <div className="text-lg font-bold text-emerald-600">{supplier.environmental_score.toFixed(1)}</div>
                                    <div className="text-xs text-emerald-600">Environmental</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-1">Why This Supplier</h4>
                                <p className="text-sm text-gray-600">{supplier.match_reason}</p>
                              </div>
                            </div>
                            
                            <div className="ml-4">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No supplier recommendations available</p>
                      <p className="text-sm">Run trade-off analysis to get supplier recommendations</p>
                    </div>
                  )}
                  
                  {analysisResults.supplier_recommendations.length > 0 && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Recommendation Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-900 mb-2">Top Recommendation</h5>
                          <p className="text-sm text-blue-700">
                            {analysisResults.supplier_recommendations[0]?.name} offers the best overall match 
                            with {analysisResults.supplier_recommendations[0]?.overall_match_score.toFixed(1)}% compatibility.
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h5 className="font-medium text-green-900 mb-2">Selection Criteria</h5>
                          <p className="text-sm text-green-700">
                            Recommendations based on economic performance, quality standards, 
                            environmental impact, and your specified importance weights.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Run trade-off analysis to get supplier recommendations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Strategies</CardTitle>
              <CardDescription>Strategic recommendations for balanced performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Quick Wins</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-900">Economic Optimization</h5>
                        <p className="text-sm text-green-700 mt-1">Cost reduction strategies</p>
                        <ul className="text-xs text-green-600 mt-2 space-y-1">
                          <li>• Negotiate better supplier terms</li>
                          <li>• Optimize transportation routes</li>
                          <li>• Bulk purchasing discounts</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900">Quality Enhancement</h5>
                        <p className="text-sm text-blue-700 mt-1">Quality improvement tactics</p>
                        <ul className="text-xs text-blue-600 mt-2 space-y-1">
                          <li>• Supplier quality audits</li>
                          <li>• Enhanced inspection processes</li>
                          <li>• Quality training programs</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-lg">
                        <h5 className="font-medium text-emerald-900">Environmental Impact</h5>
                        <p className="text-sm text-emerald-700 mt-1">Sustainability initiatives</p>
                        <ul className="text-xs text-emerald-600 mt-2 space-y-1">
                          <li>• Green supplier certification</li>
                          <li>• Carbon footprint reduction</li>
                          <li>• Sustainable packaging</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Strategic Initiatives</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Balanced Scorecard Implementation</h5>
                          <p className="text-sm text-gray-600">Implement comprehensive performance measurement</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Supplier Development Program</h5>
                          <p className="text-sm text-gray-600">Collaborate with suppliers for mutual improvement</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">3</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Continuous Monitoring</h5>
                          <p className="text-sm text-gray-600">Real-time performance tracking and adjustment</p>
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
