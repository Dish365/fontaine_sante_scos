'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

export default function EnvironmentalAnalysisPage() {
  const [environmentalData, setEnvironmentalData] = useState({
    energy_consumption: '',
    water_usage: '',
    waste_generated: '',
    carbon_emissions: '',
    recycling_rate: '',
    renewable_energy_usage: '',
    environmental_certifications: [] as string[]
  });

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const certificationOptions = [
    'ISO14001',
    'ISO50001',
    'LEED',
    'Energy Star',
    'Carbon Trust',
    'Green Seal'
  ];

  const handleCertificationChange = (certification: string, checked: boolean) => {
    const current = environmentalData.environmental_certifications;
    if (checked) {
      setEnvironmentalData({
        ...environmentalData,
        environmental_certifications: [...current, certification]
      });
    } else {
      setEnvironmentalData({
        ...environmentalData,
        environmental_certifications: current.filter(c => c !== certification)
      });
    }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const energyConsumption = parseFloat(environmentalData.energy_consumption);
      const waterUsage = parseFloat(environmentalData.water_usage);
      const wasteGenerated = parseFloat(environmentalData.waste_generated);
      const carbonEmissions = parseFloat(environmentalData.carbon_emissions);
      const recyclingRate = parseFloat(environmentalData.recycling_rate);
      const renewableEnergyUsage = parseFloat(environmentalData.renewable_energy_usage);
      
      // Calculate carbon footprint (metric tons CO2e)
      const carbonFootprint = (
        energyConsumption * 0.5 +
        waterUsage * 0.298 +
        wasteGenerated * 2.53 +
        carbonEmissions
      ) / 1000;
      
      // Calculate sustainability score
      const energyScore = 100 * (1 - Math.min(1, energyConsumption / 1000));
      const waterScore = 100 * (1 - Math.min(1, waterUsage / 100));
      const wasteScore = 100 * (1 - Math.min(1, wasteGenerated / 50));
      const emissionsScore = 100 * (1 - Math.min(1, carbonEmissions / 100));
      
      const sustainabilityScore = (
        energyScore * 0.25 +
        waterScore * 0.2 +
        wasteScore * 0.2 +
        emissionsScore * 0.2 +
        recyclingRate * 0.1 +
        renewableEnergyUsage * 0.05
      );
      
      const sustainabilityLevel = sustainabilityScore >= 80 ? 'High' : sustainabilityScore >= 60 ? 'Medium' : 'Low';
      
      setAnalysisResults({
        environmental_score: sustainabilityScore,
        carbon_footprint: carbonFootprint,
        sustainability_level: sustainabilityLevel,
        impact_breakdown: {
          energy: {
            consumption: energyConsumption,
            renewable_percentage: renewableEnergyUsage,
            impact_score: energyConsumption / 1000
          },
          water: {
            usage: waterUsage,
            impact_score: waterUsage / 100
          },
          waste: {
            generated: wasteGenerated,
            recycling_rate: recyclingRate,
            impact_score: wasteGenerated / 50
          },
          emissions: {
            direct_emissions: carbonEmissions,
            impact_score: carbonEmissions / 100
          }
        },
        certification_status: {
          ISO14001: environmentalData.environmental_certifications.includes('ISO14001'),
          ISO50001: environmentalData.environmental_certifications.includes('ISO50001'),
          LEED: environmentalData.environmental_certifications.includes('LEED')
        },
        recommendations: sustainabilityScore < 60 ? 
          ['Implement energy efficiency measures', 'Optimize water usage and implement recycling', 'Enhance waste reduction programs', 'Develop carbon reduction strategies'] :
          ['Maintain current sustainability practices', 'Continue monitoring and improvement', 'Consider additional certifications'],
        compliance_status: {
          energy_compliance: energyConsumption <= 800,
          water_compliance: waterUsage <= 80,
          waste_compliance: wasteGenerated <= 40,
          emissions_compliance: carbonEmissions <= 80
        }
      });
      setIsLoading(false);
    }, 1500);
  };

  const impactCategories = [
    {
      name: 'Global Warming Potential',
      value: 2.4,
      unit: 'kg CO2-eq',
      status: 'good',
      trend: 'decreasing'
    },
    {
      name: 'Ozone Depletion',
      value: 1.2e-7,
      unit: 'kg CFC-11-eq',
      status: 'excellent',
      trend: 'stable'
    },
    {
      name: 'Acidification',
      value: 0.012,
      unit: 'kg SO2-eq',
      status: 'good',
      trend: 'decreasing'
    },
    {
      name: 'Eutrophication',
      value: 0.008,
      unit: 'kg N-eq',
      status: 'fair',
      trend: 'increasing'
    },
    {
      name: 'Land Use',
      value: 1.8,
      unit: 'm²·year',
      status: 'good',
      trend: 'stable'
    },
    {
      name: 'Water Depletion',
      value: 0.15,
      unit: 'm³',
      status: 'excellent',
      trend: 'decreasing'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">🌱</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Environmental Analysis</h1>
            <p className="text-gray-600">Carbon footprint and sustainability metrics</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Impact Assessment</TabsTrigger>
          <TabsTrigger value="footprint">Carbon Footprint</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="certification">Certification</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Environmental Data</CardTitle>
                <CardDescription>Enter environmental impact data for analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="energy_consumption">Energy Consumption (kWh)</Label>
                    <Input
                      id="energy_consumption"
                      type="number"
                      value={environmentalData.energy_consumption}
                      onChange={(e) => setEnvironmentalData({...environmentalData, energy_consumption: e.target.value})}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="water_usage">Water Usage (m³)</Label>
                    <Input
                      id="water_usage"
                      type="number"
                      value={environmentalData.water_usage}
                      onChange={(e) => setEnvironmentalData({...environmentalData, water_usage: e.target.value})}
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="waste_generated">Waste Generated (kg)</Label>
                    <Input
                      id="waste_generated"
                      type="number"
                      value={environmentalData.waste_generated}
                      onChange={(e) => setEnvironmentalData({...environmentalData, waste_generated: e.target.value})}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbon_emissions">Direct Carbon Emissions (kg CO2e)</Label>
                    <Input
                      id="carbon_emissions"
                      type="number"
                      value={environmentalData.carbon_emissions}
                      onChange={(e) => setEnvironmentalData({...environmentalData, carbon_emissions: e.target.value})}
                      placeholder="80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recycling_rate">Recycling Rate (%)</Label>
                    <Input
                      id="recycling_rate"
                      type="number"
                      max="100"
                      value={environmentalData.recycling_rate}
                      onChange={(e) => setEnvironmentalData({...environmentalData, recycling_rate: e.target.value})}
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <Label htmlFor="renewable_energy_usage">Renewable Energy (%)</Label>
                    <Input
                      id="renewable_energy_usage"
                      type="number"
                      max="100"
                      value={environmentalData.renewable_energy_usage}
                      onChange={(e) => setEnvironmentalData({...environmentalData, renewable_energy_usage: e.target.value})}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div>
                  <Label>Environmental Certifications</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {certificationOptions.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={cert}
                          checked={environmentalData.environmental_certifications.includes(cert)}
                          onCheckedChange={(checked) => handleCertificationChange(cert, checked as boolean)}
                        />
                        <Label htmlFor={cert} className="text-sm">{cert}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Environmental Impact'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Sustainability Assessment</CardTitle>
                <CardDescription>Environmental performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResults ? (
                  <div className="space-y-6">
                    {/* Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {analysisResults.environmental_score.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">Environmental Score</p>
                      <Progress value={analysisResults.environmental_score} className="mt-2" />
                      <Badge 
                        variant={analysisResults.sustainability_level === 'High' ? 'default' : 'secondary'}
                        className="mt-2"
                      >
                        {analysisResults.sustainability_level} Sustainability
                      </Badge>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analysisResults.carbon_footprint.toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-600">Tonnes CO2e</p>
                        <p className="text-xs text-gray-500">Carbon Footprint</p>
                      </div>
                    </div>

                    {/* Impact Breakdown */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Impact Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-blue-900">Energy</span>
                            <span className="text-xs text-blue-600">
                              {analysisResults.impact_breakdown.energy.renewable_percentage}% renewable
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-blue-900">
                              {analysisResults.impact_breakdown.energy.consumption} kWh
                            </div>
                            <div className="text-xs text-blue-600">
                              Impact: {(analysisResults.impact_breakdown.energy.impact_score * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
                          <span className="text-sm font-medium text-cyan-900">Water</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-cyan-900">
                              {analysisResults.impact_breakdown.water.usage} m³
                            </div>
                            <div className="text-xs text-cyan-600">
                              Impact: {(analysisResults.impact_breakdown.water.impact_score * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-orange-900">Waste</span>
                            <span className="text-xs text-orange-600">
                              {analysisResults.impact_breakdown.waste.recycling_rate}% recycled
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-orange-900">
                              {analysisResults.impact_breakdown.waste.generated} kg
                            </div>
                            <div className="text-xs text-orange-600">
                              Impact: {(analysisResults.impact_breakdown.waste.impact_score * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <span className="text-sm font-medium text-red-900">Emissions</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-red-900">
                              {analysisResults.impact_breakdown.emissions.direct_emissions} kg CO2e
                            </div>
                            <div className="text-xs text-red-600">
                              Impact: {(analysisResults.impact_breakdown.emissions.impact_score * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {analysisResults.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p>Enter environmental data and click Calculate to view assessment results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="footprint" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Impact Categories</CardTitle>
              <CardDescription>Comprehensive environmental impact assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {impactCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.value} {category.unit}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={category.status === 'excellent' ? 'default' : 'secondary'}>
                        {category.status}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <svg 
                          className={`w-4 h-4 ${category.trend === 'decreasing' ? 'text-green-500' : category.trend === 'increasing' ? 'text-red-500' : 'text-gray-400'}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {category.trend === 'decreasing' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0l-7 7m7-7v18" />
                          ) : category.trend === 'increasing' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7 7m0 0l7-7m-7 7V3" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          )}
                        </svg>
                        <span className="text-xs text-gray-500">{category.trend}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Compliance</CardTitle>
              <CardDescription>Regulatory compliance status and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResults ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-900">Energy Compliance</span>
                        <Badge variant={analysisResults.compliance_status.energy_compliance ? 'default' : 'destructive'}>
                          {analysisResults.compliance_status.energy_compliance ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-600 mt-2">Energy consumption within regulatory limits</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-blue-900">Water Compliance</span>
                        <Badge variant={analysisResults.compliance_status.water_compliance ? 'default' : 'destructive'}>
                          {analysisResults.compliance_status.water_compliance ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-600 mt-2">Water usage within regulatory limits</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-orange-900">Waste Compliance</span>
                        <Badge variant={analysisResults.compliance_status.waste_compliance ? 'default' : 'destructive'}>
                          {analysisResults.compliance_status.waste_compliance ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <p className="text-sm text-orange-600 mt-2">Waste generation within regulatory limits</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-red-900">Emissions Compliance</span>
                        <Badge variant={analysisResults.compliance_status.emissions_compliance ? 'default' : 'destructive'}>
                          {analysisResults.compliance_status.emissions_compliance ? 'Compliant' : 'Non-compliant'}
                        </Badge>
                      </div>
                      <p className="text-sm text-red-600 mt-2">Emissions within regulatory limits</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Run environmental assessment to view compliance status</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Certifications</CardTitle>
              <CardDescription>Current certifications and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {analysisResults ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Certifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(analysisResults.certification_status).map(([cert, status]) => (
                        <div key={cert} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{cert}</span>
                          <Badge variant={status ? 'default' : 'secondary'}>
                            {status ? 'Certified' : 'Not Certified'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recommended Certifications</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-900">ISO 14001</h5>
                        <p className="text-sm text-green-600 mt-1">Environmental Management System standard</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900">ISO 50001</h5>
                        <p className="text-sm text-blue-600 mt-1">Energy Management System standard</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900">LEED Certification</h5>
                        <p className="text-sm text-purple-600 mt-1">Leadership in Energy and Environmental Design</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Run environmental assessment to view certification status</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 