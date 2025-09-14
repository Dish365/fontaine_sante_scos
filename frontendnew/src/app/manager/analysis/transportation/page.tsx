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
import { Checkbox } from '@/components/ui/checkbox';

export default function TransportationAnalysisPage() {
  const [transportData, setTransportData] = useState({
    distance: '',
    volume: '',
    load_factor: '',
    transport_mode: '',
    vehicle_type: '',
    fuel_type: '',
    return_trip: false
  });

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const transportModes = [
    { value: 'truck', label: 'Truck' },
    { value: 'train', label: 'Train' },
    { value: 'ship', label: 'Ship' },
    { value: 'plane', label: 'Plane' }
  ];

  const vehicleTypes = [
    { value: 'small_truck', label: 'Small Truck' },
    { value: 'medium_truck', label: 'Medium Truck' },
    { value: 'large_truck', label: 'Large Truck' },
    { value: 'electric_vehicle', label: 'Electric Vehicle' },
    { value: 'hybrid_vehicle', label: 'Hybrid Vehicle' }
  ];

  const fuelTypes = [
    { value: 'diesel', label: 'Diesel' },
    { value: 'petrol', label: 'Petrol' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'biodiesel', label: 'Biodiesel' },
    { value: 'cng', label: 'CNG' }
  ];

  const emissionFactors = {
    truck: 0.15,
    train: 0.03,
    ship: 0.02,
    plane: 0.25
  };

  const vehicleMultipliers = {
    small_truck: 1.0,
    medium_truck: 1.5,
    large_truck: 2.0,
    electric_vehicle: 0.3,
    hybrid_vehicle: 0.6
  };

  const fuelMultipliers = {
    diesel: 1.0,
    petrol: 1.1,
    electric: 0.2,
    hybrid: 0.5,
    biodiesel: 0.7,
    cng: 0.8
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const distance = parseFloat(transportData.distance);
      const volume = parseFloat(transportData.volume);
      const loadFactor = parseFloat(transportData.load_factor);
      
      // Get emission factors
      const baseFactor = emissionFactors[transportData.transport_mode as keyof typeof emissionFactors] || 0.15;
      const vehicleMultiplier = vehicleMultipliers[transportData.vehicle_type as keyof typeof vehicleMultipliers] || 1.0;
      const fuelMultiplier = fuelMultipliers[transportData.fuel_type as keyof typeof fuelMultipliers] || 1.0;
      
      // Calculate emissions
      const baseEmissions = distance * baseFactor * volume;
      const adjustedEmissions = baseEmissions * vehicleMultiplier * fuelMultiplier;
      const loadFactorImpact = 1 + (1 - loadFactor) * 0.2;
      let totalEmissions = adjustedEmissions * loadFactorImpact;
      
      if (transportData.return_trip) {
        totalEmissions *= 2;
      }
      
      const emissionsPerKm = totalEmissions / distance;
      const emissionsPerVolume = totalEmissions / volume;
      
      // Calculate efficiency score
      const kmScore = Math.max(0, 100 * (1 - emissionsPerKm / 2));
      const volumeScore = Math.max(0, 100 * (1 - emissionsPerVolume / 5));
      const loadScore = loadFactor * 100;
      const efficiencyScore = (kmScore * 0.4 + volumeScore * 0.4 + loadScore * 0.2);
      
      // Generate recommendations
      const recommendations = [];
      if (efficiencyScore < 70) {
        if (transportData.transport_mode === 'truck') {
          if (['small_truck', 'medium_truck'].includes(transportData.vehicle_type)) {
            recommendations.push('Consider using larger trucks for better efficiency');
          }
          if (['diesel', 'petrol'].includes(transportData.fuel_type)) {
            recommendations.push('Consider switching to electric or hybrid vehicles');
          }
        }
        if (loadFactor < 0.8) {
          recommendations.push('Optimize load factor to reduce empty space');
        }
        if (emissionsPerKm > 1.5) {
          recommendations.push('Consider alternative transport modes for long distances');
        }
        if (emissionsPerVolume > 3) {
          recommendations.push('Optimize packaging to reduce volume requirements');
        }
      }
      
      setAnalysisResults({
        total_emissions: totalEmissions,
        emissions_per_km: emissionsPerKm,
        emissions_per_volume: emissionsPerVolume,
        transport_efficiency_score: efficiencyScore,
        recommendations: recommendations,
        emission_breakdown: {
          base_emissions: baseEmissions,
          vehicle_impact: baseEmissions * (vehicleMultiplier - 1),
          fuel_impact: baseEmissions * (fuelMultiplier - 1),
          load_factor_impact: baseEmissions * (loadFactorImpact - 1)
        }
      });
      setIsLoading(false);
    }, 1500);
  };

  const routeComparison = [
    {
      route: 'Direct Route',
      distance: 450,
      time: '6h 30m',
      cost: 1200,
      emissions: 85.2,
      efficiency: 88
    },
    {
      route: 'Highway Route',
      distance: 520,
      time: '5h 45m',
      cost: 1350,
      emissions: 95.8,
      efficiency: 85
    },
    {
      route: 'Scenic Route',
      distance: 480,
      time: '7h 15m',
      cost: 1280,
      emissions: 89.6,
      efficiency: 82
    },
    {
      route: 'Economic Route',
      distance: 465,
      time: '6h 45m',
      cost: 1150,
      emissions: 87.3,
      efficiency: 90
    }
  ];

  const transportModeComparison = [
    {
      mode: 'Truck',
      cost: 1200,
      time: '6h 30m',
      emissions: 85.2,
      flexibility: 'High',
      score: 85
    },
    {
      mode: 'Train',
      cost: 800,
      time: '8h 15m',
      emissions: 45.6,
      flexibility: 'Medium',
      score: 88
    },
    {
      mode: 'Ship',
      cost: 600,
      time: '2 days',
      emissions: 32.4,
      flexibility: 'Low',
      score: 82
    },
    {
      mode: 'Plane',
      cost: 2500,
      time: '2h 30m',
      emissions: 156.8,
      flexibility: 'High',
      score: 75
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">🚚</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transportation Analysis</h1>
            <p className="text-gray-600">Logistics optimization and route efficiency</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">Emission Analysis</TabsTrigger>
          <TabsTrigger value="routes">Route Optimization</TabsTrigger>
          <TabsTrigger value="modes">Transport Modes</TabsTrigger>
          <TabsTrigger value="optimization">Cost Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Transportation Data</CardTitle>
                <CardDescription>Enter transportation details for emission analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="distance">Distance (km)</Label>
                      <Input
                        id="distance"
                        type="number"
                        value={transportData.distance}
                        onChange={(e) => setTransportData({...transportData, distance: e.target.value})}
                        placeholder="500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="volume">Volume (m³)</Label>
                      <Input
                        id="volume"
                        type="number"
                        value={transportData.volume}
                        onChange={(e) => setTransportData({...transportData, volume: e.target.value})}
                        placeholder="20"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="load_factor">Load Factor</Label>
                    <Input
                      id="load_factor"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={transportData.load_factor}
                      onChange={(e) => setTransportData({...transportData, load_factor: e.target.value})}
                      placeholder="0.8"
                    />
                    <p className="text-xs text-gray-500 mt-1">Value between 0 and 1 (0.8 = 80% full)</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="transport_mode">Transport Mode</Label>
                    <Select value={transportData.transport_mode} onValueChange={(value) => setTransportData({...transportData, transport_mode: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {transportModes.map((mode) => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {transportData.transport_mode === 'truck' && (
                    <>
                      <div>
                        <Label htmlFor="vehicle_type">Vehicle Type</Label>
                        <Select value={transportData.vehicle_type} onValueChange={(value) => setTransportData({...transportData, vehicle_type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="fuel_type">Fuel Type</Label>
                        <Select value={transportData.fuel_type} onValueChange={(value) => setTransportData({...transportData, fuel_type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            {fuelTypes.map((fuel) => (
                              <SelectItem key={fuel.value} value={fuel.value}>
                                {fuel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="return_trip"
                      checked={transportData.return_trip}
                      onCheckedChange={(checked) => setTransportData({...transportData, return_trip: checked as boolean})}
                    />
                    <Label htmlFor="return_trip">Include return trip</Label>
                  </div>
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Transportation Impact'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Transportation Analysis Results</CardTitle>
                <CardDescription>Emission calculations and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResults ? (
                  <div className="space-y-6">
                    {/* Efficiency Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {analysisResults.transport_efficiency_score.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">Efficiency Score</p>
                      <Progress value={analysisResults.transport_efficiency_score} className="mt-2" />
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {analysisResults.total_emissions.toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-600">kg CO2e</p>
                        <p className="text-xs text-gray-500">Total Emissions</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">
                            {analysisResults.emissions_per_km.toFixed(3)}
                          </div>
                          <p className="text-sm text-gray-600">kg CO2e/km</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-xl font-bold text-green-600">
                            {analysisResults.emissions_per_volume.toFixed(3)}
                          </div>
                          <p className="text-sm text-gray-600">kg CO2e/m³</p>
                        </div>
                      </div>
                    </div>

                    {/* Emission Breakdown */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Emission Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Base Emissions</span>
                          <span className="font-medium">{analysisResults.emission_breakdown.base_emissions.toFixed(2)} kg CO2e</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Vehicle Impact</span>
                          <span className="font-medium">{analysisResults.emission_breakdown.vehicle_impact.toFixed(2)} kg CO2e</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Fuel Impact</span>
                          <span className="font-medium">{analysisResults.emission_breakdown.fuel_impact.toFixed(2)} kg CO2e</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Load Factor Impact</span>
                          <span className="font-medium">{analysisResults.emission_breakdown.load_factor_impact.toFixed(2)} kg CO2e</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {analysisResults.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                        <div className="space-y-2">
                          {analysisResults.recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-600">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Enter transportation data and click Calculate to view analysis results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Comparison</CardTitle>
              <CardDescription>Compare different routes for optimal transportation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Route</th>
                      <th className="text-right p-4">Distance (km)</th>
                      <th className="text-right p-4">Time</th>
                      <th className="text-right p-4">Cost ($)</th>
                      <th className="text-right p-4">Emissions (kg CO2e)</th>
                      <th className="text-right p-4">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeComparison.map((route, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{route.route}</td>
                        <td className="p-4 text-right">{route.distance}</td>
                        <td className="p-4 text-right">{route.time}</td>
                        <td className="p-4 text-right">${route.cost}</td>
                        <td className="p-4 text-right">{route.emissions}</td>
                        <td className="p-4 text-right">
                          <Badge variant={route.efficiency >= 88 ? 'default' : 'secondary'}>
                            {route.efficiency}%
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

        <TabsContent value="modes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transport Mode Comparison</CardTitle>
              <CardDescription>Compare different transportation modes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Mode</th>
                      <th className="text-right p-4">Cost ($)</th>
                      <th className="text-right p-4">Time</th>
                      <th className="text-right p-4">Emissions (kg CO2e)</th>
                      <th className="text-center p-4">Flexibility</th>
                      <th className="text-right p-4">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transportModeComparison.map((mode, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{mode.mode}</td>
                        <td className="p-4 text-right">${mode.cost}</td>
                        <td className="p-4 text-right">{mode.time}</td>
                        <td className="p-4 text-right">{mode.emissions}</td>
                        <td className="p-4 text-center">
                          <Badge variant={mode.flexibility === 'High' ? 'default' : 'secondary'}>
                            {mode.flexibility}
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-bold">{mode.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Optimization</CardTitle>
              <CardDescription>Identify opportunities for transportation cost savings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Optimization Opportunities</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900">Route Optimization</h5>
                        <p className="text-sm text-blue-700 mt-1">Potential savings: $15,000/year</p>
                        <p className="text-xs text-blue-600 mt-2">Optimize routes using AI-powered routing</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-900">Load Optimization</h5>
                        <p className="text-sm text-green-700 mt-1">Potential savings: $8,500/year</p>
                        <p className="text-xs text-green-600 mt-2">Improve load factor from 75% to 90%</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900">Mode Switching</h5>
                        <p className="text-sm text-purple-700 mt-1">Potential savings: $25,000/year</p>
                        <p className="text-xs text-purple-600 mt-2">Use rail for long-distance shipments</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Implementation Plan</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">1</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Immediate (0-3 months)</h5>
                          <p className="text-sm text-gray-600">Optimize existing routes, improve load planning</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">2</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Short-term (3-6 months)</h5>
                          <p className="text-sm text-gray-600">Implement route optimization software</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">3</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Long-term (6+ months)</h5>
                          <p className="text-sm text-gray-600">Explore alternative transport modes</p>
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