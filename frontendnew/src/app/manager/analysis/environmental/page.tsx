'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, Leaf, Droplet, Trash2, Wind, Factory, Package, Truck, CheckCircle, Info, RefreshCw, AlertTriangle } from "lucide-react";
import { EnvironmentalMetricsGrid } from './components/EnvironmentalCharts';
import wsService from '@/lib/websocket';

// FastAPI Base URL
const FASTAPI_BASE_URL = "http://localhost:8001";

interface SupplierEnvironmentalAnalysis {
  supplier_id: number;
  supplier_name: string;
  environmental_score: number;
  carbon_footprint: number;
  sustainability_level: string;
  impact_breakdown: {
    energy: {
      consumption: number;
      renewable_percentage: number;
      impact_score: number;
    };
    water: {
      usage: number;
      impact_score: number;
    };
    waste: {
      generated: number;
      recycling_rate: number;
      impact_score: number;
    };
    emissions: {
      direct_emissions: number;
      impact_score: number;
    };
  };
  certifications: string[];
  recommendations: string[];
  transport_mode: string;
  material_count: number;
  metrics: {
    energy_consumption: number;
    water_usage: number;
    waste_generated: number;
    recycling_rate: number;
    renewable_energy: number;
  };
}

interface EnvironmentalAnalysisData {
  success: boolean;
  analysis_parameters: {
    order_volume: number;
    include_materials: boolean;
    include_transport: boolean;
  };
  overall_statistics: {
    total_suppliers_analyzed: number;
    average_score: number;
    best_score: number;
    worst_score: number;
    total_carbon_footprint: number;
    total_energy_consumption: number;
  };
  supplier_analyses: SupplierEnvironmentalAnalysis[];
  recommendations: {
    top_performer: SupplierEnvironmentalAnalysis | null;
    improvement_opportunities: string[];
  };
}

interface EnvironmentalSummary {
  success: boolean;
  summary: {
    total_suppliers: number;
    certification_distribution: Record<string, number>;
    environmental_statistics: {
      average_carbon_footprint: number;
      average_renewable_energy: number;
      total_certified_suppliers: number;
    };
    transportation_distribution: Record<string, number>;
  };
}

export default function EnvironmentalAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<EnvironmentalAnalysisData | null>(null);
  const [summaryData, setSummaryData] = useState<EnvironmentalSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Analysis parameters
  const [orderVolume, setOrderVolume] = useState<number>(1000);
  const [includeMaterials, setIncludeMaterials] = useState<boolean>(true);
  const [includeTransport, setIncludeTransport] = useState<boolean>(true);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [chartType, setChartType] = useState<'emissions' | 'energy' | 'water' | 'waste'>('emissions');

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('🚀 Starting environmental analysis...');
    
    try {
      // First test basic connectivity
      console.log('Testing FastAPI connection...');
      setDebugInfo(prev => prev + '\n🔌 Testing FastAPI connection...');
      
      const params = new URLSearchParams({
        order_volume: orderVolume.toString(),
        include_materials: includeMaterials.toString(),
        include_transport: includeTransport.toString()
      });

      const analysisUrl = `${FASTAPI_BASE_URL}/environmental/analyze-suppliers?${params}`;
      console.log('Fetching analysis data from:', analysisUrl);
      setDebugInfo(prev => prev + `\n📊 Fetching analysis data with order volume: ${orderVolume}`);
      
      const response = await fetch(analysisUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Analysis failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Analysis data received:', data);
      
      setDebugInfo(prev => prev + `\n✅ Analysis complete: ${data.supplier_analyses?.length || 0} suppliers analyzed`);
      setDebugInfo(prev => prev + `\n📈 Overall stats: Avg score ${data.overall_statistics?.average_score?.toFixed(1) || 'N/A'}`);
      
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch analysis data';
      setError(errorMsg);
      setDebugInfo(prev => prev + `\n❌ Analysis error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    setSummaryLoading(true);
    try {
      console.log('Fetching summary data from:', `${FASTAPI_BASE_URL}/environmental/analysis-summary`);
      setDebugInfo(prev => prev + '\n📋 Fetching summary data...');
      
      const response = await fetch(`${FASTAPI_BASE_URL}/environmental/analysis-summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Summary failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Summary data received:', data);
      setDebugInfo(prev => prev + `\n✅ Summary loaded: ${data.summary?.total_suppliers || 0} suppliers`);
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setDebugInfo(prev => prev + `\n❌ Summary error: ${error}`);
    } finally {
      setSummaryLoading(false);
    }
  };

      useEffect(() => {
      // Initial data fetch
      fetchSummaryData();
      fetchAnalysisData();

      // Connect to WebSocket
      wsService.connect();

      // Subscribe to environmental updates
      const handleEnvironmentalUpdate = (data: any) => {
        setSummaryData(data);
        setDebugInfo(prev => prev + '\n📡 Received real-time update');
      };

      wsService.subscribe('environmental_update', handleEnvironmentalUpdate);

      // Start receiving updates
      wsService.send('subscribe_updates', {});

      const cleanup = () => {
        wsService.unsubscribe('environmental_update', handleEnvironmentalUpdate);
        wsService.disconnect();
      };

      return cleanup;
  }, []);

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-CA', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading && summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Analyzing supplier environmental impact...</p>
          {debugInfo && (
            <div className="mt-4 p-3 bg-muted rounded text-left text-sm max-w-md">
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Environmental Impact Analysis</h1>
        <div className="flex gap-2">
          <Button onClick={fetchAnalysisData} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Debug Information */}
      {debugInfo && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            <pre className="text-xs whitespace-pre-wrap max-h-32 overflow-y-auto">{debugInfo}</pre>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Content will be implemented in the next part */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analysis</TabsTrigger>
          <TabsTrigger value="impact">Impact Breakdown</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaryData?.summary.total_suppliers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analysisData?.overall_statistics.total_suppliers_analyzed || 0} analyzed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Leaf className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(analysisData?.overall_statistics.average_score || 0)}`}>
                  {(analysisData?.overall_statistics.average_score || 0).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Environmental performance score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
                <Wind className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analysisData?.overall_statistics.total_carbon_footprint || 0)} t
                </div>
                <p className="text-xs text-muted-foreground">
                  Total CO2e emissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certified Suppliers</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaryData?.summary.environmental_statistics.total_certified_suppliers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  With environmental certifications
                </p>
              </CardContent>
            </Card>
          </div>

          {analysisData?.recommendations.top_performer && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Top Environmental Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {analysisData.recommendations.top_performer.supplier_name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={getScoreBadgeVariant(analysisData.recommendations.top_performer.environmental_score)}>
                        Score: {analysisData.recommendations.top_performer.environmental_score.toFixed(1)}
                      </Badge>
                      <Badge variant="outline">
                        {analysisData.recommendations.top_performer.sustainability_level}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Carbon Footprint</p>
                    <p className="text-xl font-bold">
                      {formatNumber(analysisData.recommendations.top_performer.carbon_footprint)} t CO2e
                    </p>
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Renewable Energy: </span>
                      <span className="font-medium">{formatNumber(analysisData.recommendations.top_performer.metrics.renewable_energy)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Certification Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryData && (
                  <div className="space-y-4">
                    {Object.entries(summaryData.summary.certification_distribution).map(([cert, count]) => (
                      <div key={cert} className="flex items-center justify-between">
                        <span className="text-sm">{cert || 'No Certification'}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary h-2 rounded-full">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ 
                                width: `${(count / summaryData.summary.total_suppliers) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transportation Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryData && (
                  <div className="space-y-4">
                    {Object.entries(summaryData.summary.transportation_distribution).map(([mode, count]) => (
                      <div key={mode} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{mode}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary h-2 rounded-full">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ 
                                width: `${(count / summaryData.summary.total_suppliers) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="space-y-4">
            {/* Analysis Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Supplier Environmental Analysis
                  {analysisData && (
                    <Badge variant="outline">
                      {analysisData.supplier_analyses.length} suppliers available
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Analysis Parameters</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label htmlFor="orderVolume">Order Volume</Label>
                        <Input
                          id="orderVolume"
                          type="number"
                          value={orderVolume}
                          onChange={(e) => setOrderVolume(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="includeMaterials"
                          checked={includeMaterials}
                          onChange={(e) => setIncludeMaterials(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="includeMaterials">Include Materials</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="includeTransport"
                          checked={includeTransport}
                          onChange={(e) => setIncludeTransport(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="includeTransport">Include Transport</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={fetchAnalysisData} 
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Update Analysis
                    </Button>
                    <Select value={chartType} onValueChange={(value: 'emissions' | 'energy' | 'water' | 'waste') => setChartType(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emissions">Emissions Chart</SelectItem>
                        <SelectItem value="energy">Energy Usage</SelectItem>
                        <SelectItem value="water">Water Usage</SelectItem>
                        <SelectItem value="waste">Waste Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Supplier Comparison Chart */}
                {analysisData && analysisData.supplier_analyses.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-4">Environmental Performance Comparison</h4>
                    <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                      {chartType === 'emissions' && (
                        <div className="w-full h-full flex items-end justify-around p-4">
                          {analysisData.supplier_analyses.slice(0, 6).map((supplier) => (
                            <div key={supplier.supplier_id} className="flex flex-col items-center">
                              <div 
                                className="bg-green-500 w-8 rounded-t"
                                style={{ height: `${(supplier.environmental_score / 100) * 200}px` }}
                              />
                              <span className="text-xs mt-2 text-center max-w-16 truncate">
                                {supplier.supplier_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {supplier.environmental_score.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Other chart types will be implemented similarly */}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supplier List */}
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading supplier analysis...</p>
              </div>
            ) : !analysisData || analysisData.supplier_analyses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Suppliers Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No supplier analysis data is available.
                  </p>
                  <Button onClick={fetchAnalysisData} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Analysis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {analysisData.supplier_analyses.map((supplier) => (
                  <Card 
                    key={supplier.supplier_id} 
                    className="transition-all hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {supplier.supplier_name}
                            <Badge variant={getScoreBadgeVariant(supplier.environmental_score)}>
                              {supplier.environmental_score.toFixed(1)}
                            </Badge>
                            <Badge variant="outline">
                              {supplier.sustainability_level}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {supplier.transport_mode}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {supplier.material_count} materials
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {formatNumber(supplier.carbon_footprint)} t CO2e
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Carbon Footprint
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Impact Metrics */}
                        <div>
                          <h4 className="font-medium mb-3 text-base">Environmental Metrics</h4>
                          <div className="grid md:grid-cols-4 gap-4">
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-medium">Energy Usage</span>
                                <Badge variant="outline">{formatNumber(supplier.metrics.energy_consumption)} kWh</Badge>
                              </div>
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground">Renewable Energy</div>
                                <Progress value={supplier.metrics.renewable_energy} className="h-2 mt-1" />
                              </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-medium">Water Usage</span>
                                <Badge variant="outline">{formatNumber(supplier.metrics.water_usage)} m³</Badge>
                              </div>
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground">Impact Score</div>
                                <Progress value={supplier.impact_breakdown.water.impact_score * 100} className="h-2 mt-1" />
                              </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-medium">Waste Generated</span>
                                <Badge variant="outline">{formatNumber(supplier.metrics.waste_generated)} kg</Badge>
                              </div>
                              <div className="mt-2">
                                <div className="text-xs text-muted-foreground">Recycling Rate</div>
                                <Progress value={supplier.metrics.recycling_rate} className="h-2 mt-1" />
                              </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-medium">Certifications</span>
                                <Badge variant="outline">{supplier.certifications.length}</Badge>
                              </div>
                              <div className="mt-2 text-xs">
                                {supplier.certifications.map((cert, idx) => (
                                  <Badge key={idx} variant="secondary" className="mr-1 mb-1">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Recommendations */}
                        {supplier.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <div className="grid md:grid-cols-2 gap-2">
                              {supplier.recommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="impact">
          <div className="space-y-4">
            {/* Overall Impact Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
                  <Wind className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analysisData?.overall_statistics.total_carbon_footprint || 0)} t
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total CO2e emissions across all suppliers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Energy Consumption</CardTitle>
                  <Factory className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(analysisData?.overall_statistics.total_energy_consumption || 0)} kWh
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total energy usage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Renewable Energy</CardTitle>
                  <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(summaryData?.summary.environmental_statistics.average_renewable_energy || 0)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average renewable energy usage
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certified Suppliers</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryData?.summary.environmental_statistics.total_certified_suppliers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    With environmental certifications
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Environmental Metrics Grid */}
            {analysisData && <EnvironmentalMetricsGrid data={analysisData} />}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {/* General Recommendations */}
            {analysisData?.recommendations.improvement_opportunities.map((opportunity, index) => (
              <Alert key={index}>
                <Leaf className="h-4 w-4" />
                <AlertTitle>Environmental Improvement Opportunity</AlertTitle>
                <AlertDescription>{opportunity}</AlertDescription>
              </Alert>
            ))}

            {/* Top Performer Highlight */}
            {analysisData?.recommendations.top_performer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Best Environmental Practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        {analysisData.recommendations.top_performer.supplier_name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default">
                          Score: {analysisData.recommendations.top_performer.environmental_score.toFixed(1)}
                        </Badge>
                        <Badge variant="outline">
                          {analysisData.recommendations.top_performer.sustainability_level}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Carbon Footprint:</span>
                            <span className="font-medium">
                              {formatNumber(analysisData.recommendations.top_performer.carbon_footprint)} t CO2e
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Renewable Energy:</span>
                            <span className="font-medium">
                              {formatNumber(analysisData.recommendations.top_performer.metrics.renewable_energy)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recycling Rate:</span>
                            <span className="font-medium">
                              {formatNumber(analysisData.recommendations.top_performer.metrics.recycling_rate)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Best Practices</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <span>High renewable energy adoption</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <span>Efficient waste management system</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                            <span>Strong environmental certifications</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Supplier-Specific Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier-Specific Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analysisData?.supplier_analyses.map(supplier => (
                    <div key={supplier.supplier_id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{supplier.supplier_name}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant={getScoreBadgeVariant(supplier.environmental_score)}>
                              Score: {supplier.environmental_score.toFixed(1)}
                            </Badge>
                            <Badge variant="outline">
                              {supplier.sustainability_level}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">Carbon Footprint</span>
                          <p className="font-medium">{formatNumber(supplier.carbon_footprint)} t CO2e</p>
                        </div>
                      </div>

                      {/* Impact Areas */}
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Energy Efficiency</div>
                          <Progress 
                            value={100 - (supplier.impact_breakdown.energy.impact_score * 100)} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Water Management</div>
                          <Progress 
                            value={100 - (supplier.impact_breakdown.water.impact_score * 100)} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Waste Reduction</div>
                          <Progress 
                            value={supplier.metrics.recycling_rate} 
                            className="h-2" 
                          />
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2">
                        {supplier.recommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Environmental Action Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Short-term Actions (0-6 months)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Implement basic environmental monitoring systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Start supplier environmental assessment program</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Establish baseline metrics for all suppliers</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Medium-term Goals (6-18 months)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Develop supplier environmental certification program</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Implement renewable energy transition plan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Optimize transportation routes for emissions reduction</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Long-term Strategy (18+ months)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Achieve 50% reduction in supply chain carbon footprint</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Establish closed-loop recycling systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span>Develop industry-leading environmental standards</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 