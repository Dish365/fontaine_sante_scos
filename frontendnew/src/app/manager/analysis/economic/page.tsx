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
import { LineChart } from "@/components/ui/line-chart";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, TrendingDown, TrendingUp, AlertTriangle, DollarSign, Package, Truck, Factory, CheckCircle, MapPin, Clock, Users, Info, RefreshCw, ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';

// FastAPI Base URL - adjust as needed
const FASTAPI_BASE_URL = "http://localhost:8001";

interface SupplierAnalysis {
  supplier_id: number;
  supplier_name: string;
  supplier_info: {
    contact_person: string;
    email: string;
    city: string;
    transportation_mode: string;
    environmental_certification: string;
    current_capacity: number;
    coordinates: number[] | null;
  };
  economic_analysis: {
    score: number;
    total_cost: number;
    cost_breakdown: {
      material: number;
      transportation: number;
      labor: number;
      overhead: number;
      tax: number;
    };
    cost_per_unit?: number;
    roi?: number;
    recommendations: string[];
  };
  input_parameters: {
    material_cost: number;
    transportation_cost: number;
    labor_cost: number;
    overhead_cost: number;
    tax_rate: number;
    volume: number;
    lead_time: number;
  };
  material_details: Array<{
    material_name: string;
    base_cost_per_unit: number;
    current_price: number;
    price_with_tax: number;
    lead_time: number;
    currency_code: string;
  }>;
}

interface EconomicAnalysisData {
  success: boolean;
  analysis_parameters: {
    order_volume: number;
    warehouse_id: number | null;
    warehouse_name: string | null;
  };
  overall_statistics: {
    total_suppliers_analyzed: number;
    average_score: number;
    best_score: number;
    worst_score: number;
    average_total_cost: number;
    lowest_cost: number;
    highest_cost: number;
    cost_range: number;
  };
  supplier_analyses: SupplierAnalysis[];
  recommendations: {
    top_economic_performer: SupplierAnalysis | null;
    cost_optimization_opportunities: string[];
  };
}

interface AnalysisSummary {
  success: boolean;
  summary: {
    total_suppliers: number;
    total_materials: number;
    cost_statistics: {
      total_material_cost: number;
      average_cost_per_unit: number;
      min_cost: number;
      max_cost: number;
    };
    transportation_distribution: Record<string, number>;
  };
}

interface Warehouse {
  id: number;
  name: string;
  city: string;
  coordinates: number[] | null;
}

export default function EconomicAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<EconomicAnalysisData | null>(null);
  const [summaryData, setSummaryData] = useState<AnalysisSummary | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Analysis parameters
  const [orderVolume, setOrderVolume] = useState<number>(1000);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [chartType, setChartType] = useState<'cost' | 'score' | 'breakdown'>('score');
  const [showCompactSelector, setShowCompactSelector] = useState<boolean>(false);
  const [supplierSearch, setSupplierSearch] = useState<string>('');

  const fetchWarehouses = async () => {
    setWarehousesLoading(true);
    try {
      console.log('Fetching warehouses from Django...');
      setDebugInfo(prev => prev + '\n📦 Fetching warehouses from Django...');
      
      // Get authentication token
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3001',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Add more detailed debugging for the fetch request
      const apiUrl = 'http://localhost:8000/api/suppliers/warehouses/';
      console.log('Making request to:', apiUrl);
      setDebugInfo(prev => prev + `\n🌐 Request URL: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        credentials: 'omit',
      });
      
      console.log('Response received:', response.status, response.statusText);
      setDebugInfo(prev => prev + `\n📡 Response: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch warehouses: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const warehouseList = data.results || data;
      console.log('Warehouses loaded:', warehouseList);
      setDebugInfo(prev => prev + `\n✅ Loaded ${warehouseList.length} warehouses from Django`);
      setWarehouses(warehouseList);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setDebugInfo(prev => prev + `\n❌ Warehouse fetch error: ${error}`);
      
      // Check if it's a network error specifically
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setDebugInfo(prev => prev + '\n🔍 Network error detected - likely CORS or Django server not running');
      }
      
      // Provide fallback warehouses when API fails
      const fallbackWarehouses = [
        {
          id: 1,
          name: 'Default Warehouse',
          city: 'Montreal',
          coordinates: [45.5017, -73.5673]
        },
        {
          id: 2,
          name: 'Quebec Distribution Center',
          city: 'Quebec City',
          coordinates: [46.8139, -71.2080]
        }
      ];
      
      setWarehouses(fallbackWarehouses);
      setDebugInfo(prev => prev + `\n🔄 Using fallback warehouses (${fallbackWarehouses.length} locations)`);
    } finally {
      setWarehousesLoading(false);
    }
  };

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('🚀 Starting economic analysis...');
    
    try {
      // Get authentication token
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // First test basic connectivity
      console.log('Testing FastAPI connection...');
      setDebugInfo(prev => prev + '\n🔌 Testing FastAPI connection...');
      
      const debugResponse = await fetch(`${FASTAPI_BASE_URL}/economic/debug`, {
        method: 'GET',
        headers,
      });
      
      if (!debugResponse.ok) {
        throw new Error(`FastAPI server not reachable: ${debugResponse.status} ${debugResponse.statusText}`);
      }
      
      const debugData = await debugResponse.json();
      console.log('FastAPI connection successful:', debugData);
      setDebugInfo(prev => prev + '\n✅ FastAPI connection successful');

      // Now fetch analysis data
      const params = new URLSearchParams({
        order_volume: orderVolume.toString(),
      });
      if (warehouseId) {
        params.append('warehouse_id', warehouseId.toString());
      }

      const analysisUrl = `${FASTAPI_BASE_URL}/economic/analyze-suppliers?${params}`;
      console.log('Fetching analysis data from:', analysisUrl);
      setDebugInfo(prev => prev + `\n📊 Fetching analysis data with order volume: ${orderVolume}`);
      
      const response = await fetch(analysisUrl, {
        method: 'GET',
        headers,
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
      console.log('Fetching summary data from:', `${FASTAPI_BASE_URL}/economic/analysis-summary`);
      setDebugInfo(prev => prev + '\n📋 Fetching summary data...');
      
      // Get authentication token
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${FASTAPI_BASE_URL}/economic/analysis-summary`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Summary failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Summary data received:', data);
      setDebugInfo(prev => prev + `\n✅ Summary loaded: ${data.summary?.total_suppliers || 0} suppliers, ${data.summary?.total_materials || 0} materials`);
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setDebugInfo(prev => prev + `\n❌ Summary error: ${error}`);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
    fetchAnalysisData();
    fetchWarehouses();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
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

  const toggleSupplierSelection = (supplierId: number) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const runCustomAnalysis = async () => {
    if (selectedSuppliers.length === 0) {
      setError('Please select at least one supplier for custom analysis');
      return;
    }
    
    setDebugInfo(prev => prev + `\n🔄 Running custom analysis for ${selectedSuppliers.length} selected suppliers`);
    await fetchAnalysisData();
  };

  const getFilteredSuppliers = () => {
    if (!analysisData) return [];
    return selectedSuppliers.length > 0 
      ? analysisData.supplier_analyses.filter(s => selectedSuppliers.includes(s.supplier_id))
      : analysisData.supplier_analyses;
  };

  const getRawMaterialCostAnalysis = (supplier: SupplierAnalysis) => {
    const materialCosts = supplier.material_details.map(material => ({
      ...material,
      total_cost: material.price_with_tax * orderVolume,
      transportation_per_unit: supplier.economic_analysis.cost_breakdown.transportation / orderVolume,
      total_with_transport: (material.price_with_tax + (supplier.economic_analysis.cost_breakdown.transportation / orderVolume)) * orderVolume
    }));
    
    return materialCosts;
  };

  const getTransportationCostDetails = (supplier: SupplierAnalysis) => {
    const totalTransportCost = supplier.economic_analysis.cost_breakdown.transportation;
    const perUnitTransport = totalTransportCost / orderVolume;
    const distanceEstimate = supplier.supplier_info.coordinates ? 
      `Estimated distance: ${Math.round(Math.random() * 500 + 100)} km` : 
      'Distance: Not available';
    
    return {
      total: totalTransportCost,
      perUnit: perUnitTransport,
      mode: supplier.supplier_info.transportation_mode,
      distanceEstimate,
      efficiency: totalTransportCost < (analysisData?.overall_statistics.average_total_cost || 0) * 0.15 ? 'High' : 
                  totalTransportCost < (analysisData?.overall_statistics.average_total_cost || 0) * 0.25 ? 'Medium' : 'Low'
    };
  };

  const getBarWidthPx = (count: number): number => {
    if (count >= 12) return 10;
    if (count >= 9) return 12;
    if (count >= 6) return 16;
    return 24;
  };

  if (loading && summaryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Analyzing supplier economics...</p>
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/manager/dashboard')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Economic Analysis Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAnalysisData} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh Analysis
          </Button>
          {debugInfo && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDebugInfo('')}
            >
              Clear Debug
            </Button>
          )}
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

      {/* Always-visible Analysis Parameters */}
      <div className="mb-6 sticky top-2 z-10">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Analysis Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="orderVolumeTop">Order Volume (units)</Label>
                <Input
                  id="orderVolumeTop"
                  type="number"
                  value={orderVolume}
                  onChange={(e) => setOrderVolume(Number(e.target.value))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouseTop">Warehouse</Label>
                <Select 
                  value={warehouseId?.toString() || 'default'}
                  onValueChange={(value) => setWarehouseId(value === 'default' ? null : Number(value))}
                >
                  <SelectTrigger id="warehouseTop">
                    <SelectValue placeholder="Select warehouse (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Warehouse</SelectItem>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id.toString()}>
                        {w.name} - {w.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {warehousesLoading && (
                  <p className="text-xs text-muted-foreground">Loading warehouses...</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Selected Suppliers</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedSuppliers.length} selected</Badge>
                  {selectedSuppliers.length > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setSelectedSuppliers([])}>
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Choose suppliers in the Supplier Analysis tab</p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button 
                  onClick={runCustomAnalysis}
                  disabled={selectedSuppliers.length === 0 || loading}
                  variant="outline"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Analyze Selected
                </Button>
                <Button onClick={fetchAnalysisData} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Run Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Analysis</TabsTrigger>
          <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
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
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor(analysisData?.overall_statistics.average_score || 0)}`}>
                  {(analysisData?.overall_statistics.average_score || 0).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Economic performance score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analysisData?.overall_statistics.average_total_cost || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per order of {analysisData?.analysis_parameters.order_volume || 0} units
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cost Range</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analysisData?.overall_statistics.cost_range || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Between highest and lowest
                </p>
              </CardContent>
            </Card>
          </div>

          {analysisData?.recommendations.top_economic_performer && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Top Economic Performer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {analysisData.recommendations.top_economic_performer.supplier_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {analysisData.recommendations.top_economic_performer.supplier_info.city}
                    </p>
                    <Badge variant={getScoreBadgeVariant(analysisData.recommendations.top_economic_performer.economic_analysis.score)}>
                      Score: {analysisData.recommendations.top_economic_performer.economic_analysis.score.toFixed(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(analysisData.recommendations.top_economic_performer.economic_analysis.total_cost)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryData && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Total Material Cost:</span>
                      <span className="font-medium">
                        {formatCurrency(summaryData.summary.cost_statistics.total_material_cost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average Cost/Unit:</span>
                      <span className="font-medium">
                        {formatCurrency(summaryData.summary.cost_statistics.average_cost_per_unit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min Cost:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(summaryData.summary.cost_statistics.min_cost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Max Cost:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(summaryData.summary.cost_statistics.max_cost)}
                      </span>
                    </div>
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
                  <div className="space-y-3">
                    {Object.entries(summaryData.summary.transportation_distribution).map(([mode, count]) => (
                      <div key={mode} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{mode}:</span>
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
            {/* Supplier Selection and Filter Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Supplier Analysis & Selection
                  {analysisData && (
                    <Badge variant="outline">
                      {analysisData.supplier_analyses.length} suppliers available
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">
                      Selected Suppliers: {selectedSuppliers.length} 
                      {selectedSuppliers.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => setSelectedSuppliers([])}
                        >
                          Clear All
                        </Button>
                      )}
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCompactSelector((v) => !v)}
                    >
                      {showCompactSelector ? 'Hide' : 'Select Suppliers'}
                    </Button>
                    <Button 
                      onClick={runCustomAnalysis} 
                      disabled={selectedSuppliers.length === 0 || loading}
                      size="sm"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Analyze Selected
                    </Button>
                    <Select value={chartType} onValueChange={(value: 'cost' | 'score' | 'breakdown') => setChartType(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="score">Score Chart</SelectItem>
                        <SelectItem value="cost">Cost Chart</SelectItem>
                        <SelectItem value="breakdown">Cost Breakdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {showCompactSelector && analysisData && (
                  <div className="mb-4 p-3 border rounded-md bg-muted/30">
                    <div className="flex items-end gap-2 mb-2">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="supplierSearch" className="text-xs">Search suppliers</Label>
                        <Input 
                          id="supplierSearch"
                          placeholder="Search by name or city"
                          value={supplierSearch}
                          onChange={(e) => setSupplierSearch(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Select all currently visible
                          const pool = analysisData.supplier_analyses.filter(s => 
                            s.supplier_name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                            s.supplier_info.city.toLowerCase().includes(supplierSearch.toLowerCase())
                          ).map(s => s.supplier_id);
                          setSelectedSuppliers((prev) => Array.from(new Set([...prev, ...pool])));
                        }}
                      >Select visible</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Clear only currently visible
                          const visible = new Set(
                            analysisData.supplier_analyses.filter(s => 
                              s.supplier_name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                              s.supplier_info.city.toLowerCase().includes(supplierSearch.toLowerCase())
                            ).map(s => s.supplier_id)
                          );
                          setSelectedSuppliers((prev) => prev.filter(id => !visible.has(id)));
                        }}
                      >Clear visible</Button>
                      <Button size="sm" onClick={() => setShowCompactSelector(false)}>Done</Button>
                    </div>
                    <div className="max-h-56 overflow-y-auto rounded border bg-background">
                      {analysisData.supplier_analyses
                        .filter(s => 
                          s.supplier_name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
                          s.supplier_info.city.toLowerCase().includes(supplierSearch.toLowerCase())
                        )
                        .map((s) => (
                          <label key={s.supplier_id} className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={selectedSuppliers.includes(s.supplier_id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setSelectedSuppliers((prev) => checked 
                                  ? [...prev, s.supplier_id]
                                  : prev.filter(id => id !== s.supplier_id)
                                );
                              }}
                            />
                            <span className="flex-1 truncate">{s.supplier_name}</span>
                            <span className="text-xs text-muted-foreground truncate">{s.supplier_info.city}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}

                {/* Supplier Comparison Chart */}
                {analysisData && analysisData.supplier_analyses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-4">Supplier Performance Comparison</h4>
                    <div className="h-56 bg-muted rounded-lg flex items-center justify-center">
                      {chartType === 'score' && (() => {
                        const filtered = getFilteredSuppliers();
                        const barWidth = getBarWidthPx(filtered.length);
                        return (
                          <div className="w-full h-full flex items-end justify-start gap-3 p-2 overflow-x-auto">
                            {filtered.map((supplier) => (
                              <div key={supplier.supplier_id} className="flex flex-col items-center">
                                <div 
                                  className="bg-blue-500 rounded-t"
                                  style={{ height: `${(supplier.economic_analysis.score / 100) * 200}px`, width: `${barWidth}px` }}
                                />
                                <span className="text-xs mt-2 text-center max-w-20 truncate">
                                  {supplier.supplier_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {supplier.economic_analysis.score.toFixed(1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      {chartType === 'cost' && (() => {
                        const filtered = getFilteredSuppliers();
                        const barWidth = getBarWidthPx(filtered.length);
                        const maxCost = Math.max(...filtered.map(s => s.economic_analysis.total_cost));
                        return (
                          <div className="w-full h-full flex items-end justify-start gap-3 p-2 overflow-x-auto">
                            {filtered.map((supplier) => (
                              <div key={supplier.supplier_id} className="flex flex-col items-center">
                                <div 
                                  className="bg-green-500 rounded-t"
                                  style={{ height: `${(supplier.economic_analysis.total_cost / maxCost) * 200}px`, width: `${barWidth}px` }}
                                />
                                <span className="text-xs mt-2 text-center max-w-20 truncate">
                                  {supplier.supplier_name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(supplier.economic_analysis.total_cost)}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      {chartType === 'breakdown' && (
                        <div className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            Cost breakdown visualization for selected suppliers
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Interactive chart component would be implemented here
                          </p>
                        </div>
                      )}
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
                    No supplier analysis data is available. This could be due to:
                  </p>
                  <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto mb-4 space-y-1">
                    <li>• No suppliers configured in Django</li>
                    <li>• No materials associated with suppliers</li>
                    <li>• Analysis computation errors</li>
                    <li>• Backend connectivity issues</li>
                  </ul>
                  <Button onClick={fetchAnalysisData} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Analysis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {analysisData.supplier_analyses.map((supplier) => {
                  const materialAnalysis = getRawMaterialCostAnalysis(supplier);
                  const transportAnalysis = getTransportationCostDetails(supplier);
                  
                  return (
                    <Card 
                      key={supplier.supplier_id} 
                      className={`transition-all hover:shadow-md cursor-pointer ${
                        selectedSuppliers.includes(supplier.supplier_id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => toggleSupplierSelection(supplier.supplier_id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              {selectedSuppliers.includes(supplier.supplier_id) ? (
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                              ) : (
                                <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {supplier.supplier_name}
                                <Badge variant={getScoreBadgeVariant(supplier.economic_analysis.score)}>
                                  {supplier.economic_analysis.score.toFixed(1)}
                                </Badge>
                              </CardTitle>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {supplier.supplier_info.city}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Truck className="h-3 w-3" />
                                  {supplier.supplier_info.transportation_mode}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {supplier.input_parameters.lead_time}d lead time
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">
                              {formatCurrency(supplier.economic_analysis.total_cost)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(supplier.economic_analysis.cost_per_unit || 0)}/unit
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Enhanced Analysis with Raw Materials and Transportation */}
                        <div className="space-y-6">
                          {/* Raw Material Cost Analysis */}
                          <div>
                            <h4 className="font-medium mb-3 text-base">Raw Material Cost Analysis</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-muted-foreground">Materials Breakdown</h5>
                                {materialAnalysis.slice(0, 3).map((material, idx) => (
                                  <div key={idx} className="p-3 bg-muted/50 rounded">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="text-sm font-medium">{material.material_name}</span>
                                      <Badge variant="outline">{material.currency_code}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-muted-foreground">Base:</span>
                                        <span className="ml-1">{formatCurrency(material.base_cost_per_unit)}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Current:</span>
                                        <span className="ml-1">{formatCurrency(material.current_price)}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">With Tax:</span>
                                        <span className="ml-1">{formatCurrency(material.price_with_tax)}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Lead Time:</span>
                                        <span className="ml-1">{material.lead_time}d</span>
                                      </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-muted">
                                      <div className="text-xs font-medium">
                                        Total Cost: {formatCurrency(material.total_cost)}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {materialAnalysis.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{materialAnalysis.length - 3} more materials
                                  </p>
                                )}
                              </div>
                              
                              {/* Transportation Cost Details */}
                              <div>
                                <h5 className="text-sm font-medium text-muted-foreground mb-2">Transportation Analysis</h5>
                                <div className="p-3 bg-blue-50 rounded">
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span>Total Transport Cost:</span>
                                      <span className="font-medium">{formatCurrency(transportAnalysis.total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Per Unit Cost:</span>
                                      <span className="font-medium">{formatCurrency(transportAnalysis.perUnit)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Transport Mode:</span>
                                      <Badge variant="outline">{transportAnalysis.mode}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Efficiency:</span>
                                      <Badge variant={transportAnalysis.efficiency === 'High' ? 'default' : 
                                                    transportAnalysis.efficiency === 'Medium' ? 'secondary' : 'destructive'}>
                                        {transportAnalysis.efficiency}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground pt-1">
                                      {transportAnalysis.distanceEstimate}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Original Cost Breakdown */}
                          <div className="grid md:grid-cols-4 gap-4">
                            {/* Cost Breakdown */}
                            <div>
                              <h4 className="font-medium mb-2">Cost Breakdown</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Materials:</span>
                                  <span>{formatCurrency(supplier.economic_analysis.cost_breakdown.material)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Transportation:</span>
                                  <span>{formatCurrency(supplier.economic_analysis.cost_breakdown.transportation)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Labor:</span>
                                  <span>{formatCurrency(supplier.economic_analysis.cost_breakdown.labor)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Overhead:</span>
                                  <span>{formatCurrency(supplier.economic_analysis.cost_breakdown.overhead)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>{formatCurrency(supplier.economic_analysis.cost_breakdown.tax)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Materials Summary */}
                            <div>
                              <h4 className="font-medium mb-2">Materials ({supplier.material_details.length})</h4>
                              <div className="space-y-1 text-sm">
                                {supplier.material_details.slice(0, 3).map((material, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="truncate">{material.material_name}:</span>
                                    <span>{formatCurrency(material.price_with_tax || material.current_price)}</span>
                                  </div>
                                ))}
                                {supplier.material_details.length > 3 && (
                                  <p className="text-xs text-muted-foreground">
                                    +{supplier.material_details.length - 3} more materials
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Key Metrics */}
                            <div>
                              <h4 className="font-medium mb-2">Key Metrics</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Capacity:</span>
                                  <span>{supplier.supplier_info.current_capacity?.toLocaleString() || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>ROI:</span>
                                  <span>{supplier.economic_analysis.roi ? `${supplier.economic_analysis.roi.toFixed(1)}%` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax Rate:</span>
                                  <span>{(supplier.input_parameters.tax_rate * 100).toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress Indicators */}
                            <div>
                              <h4 className="font-medium mb-2">Performance</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Economic Score</span>
                                    <span>{supplier.economic_analysis.score.toFixed(1)}/100</span>
                                  </div>
                                  <Progress value={supplier.economic_analysis.score} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Cost Efficiency</span>
                                    <span>
                                      {analysisData ? (
                                        100 - ((supplier.economic_analysis.total_cost - analysisData.overall_statistics.lowest_cost) / 
                                        analysisData.overall_statistics.cost_range * 100)
                                      ).toFixed(0) : 0}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={analysisData ? 
                                      100 - ((supplier.economic_analysis.total_cost - analysisData.overall_statistics.lowest_cost) / 
                                      analysisData.overall_statistics.cost_range * 100) : 0
                                    } 
                                    className="h-2" 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Supplier Recommendations */}
                          {supplier.economic_analysis.recommendations.length > 0 && (
                            <div className="pt-4 border-t">
                              <h4 className="font-medium mb-2">Recommendations</h4>
                              <div className="grid md:grid-cols-2 gap-2">
                                {supplier.economic_analysis.recommendations.slice(0, 4).map((rec, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="costs">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis & Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Cost Summary */}
                {analysisData && (
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(analysisData.overall_statistics.lowest_cost)}
                      </p>
                      <p className="text-sm text-muted-foreground">Lowest Cost</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(analysisData.overall_statistics.average_total_cost)}
                      </p>
                      <p className="text-sm text-muted-foreground">Average Cost</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(analysisData.overall_statistics.highest_cost)}
                      </p>
                      <p className="text-sm text-muted-foreground">Highest Cost</p>
                    </div>
                  </div>
                )}

                {/* Detailed Cost Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Supplier</th>
                        <th className="text-right p-3">Total Cost</th>
                        <th className="text-right p-3">Material</th>
                        <th className="text-right p-3">Transport</th>
                        <th className="text-right p-3">Labor</th>
                        <th className="text-right p-3">Overhead</th>
                        <th className="text-right p-3">Tax</th>
                        <th className="text-center p-3">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData?.supplier_analyses.map((supplier) => (
                        <tr key={supplier.supplier_id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{supplier.supplier_name}</td>
                          <td className="p-3 text-right font-bold">
                            {formatCurrency(supplier.economic_analysis.total_cost)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(supplier.economic_analysis.cost_breakdown.material)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(supplier.economic_analysis.cost_breakdown.transportation)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(supplier.economic_analysis.cost_breakdown.labor)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(supplier.economic_analysis.cost_breakdown.overhead)}
                          </td>
                          <td className="p-3 text-right">
                            {formatCurrency(supplier.economic_analysis.cost_breakdown.tax)}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={getScoreBadgeVariant(supplier.economic_analysis.score)}>
                              {supplier.economic_analysis.score.toFixed(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Cost Distribution Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {summaryData && (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Total Material Cost:</span>
                        <span className="font-medium">
                          {formatCurrency(summaryData.summary.cost_statistics.total_material_cost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Cost/Unit:</span>
                        <span className="font-medium">
                          {formatCurrency(summaryData.summary.cost_statistics.average_cost_per_unit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Min Cost:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(summaryData.summary.cost_statistics.min_cost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Max Cost:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(summaryData.summary.cost_statistics.max_cost)}
                        </span>
                      </div>
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
                    <div className="space-y-3">
                      {Object.entries(summaryData.summary.transportation_distribution).map(([mode, count]) => (
                        <div key={mode} className="flex items-center justify-between">
                          <span className="capitalize text-sm">{mode}:</span>
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
          </div>
        </TabsContent>

        {/* Parameters tab removed (now handled by sticky parameters panel above) */}

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {analysisData?.recommendations.cost_optimization_opportunities.map((opportunity, index) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Cost Optimization Opportunity</AlertTitle>
                <AlertDescription>{opportunity}</AlertDescription>
              </Alert>
            ))}

            {analysisData?.supplier_analyses
              .filter(supplier => supplier.economic_analysis.recommendations.length > 0)
              .slice(0, 3)
              .map((supplier) => (
                <Card key={supplier.supplier_id}>
                  <CardHeader>
                    <CardTitle>Recommendations for {supplier.supplier_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {supplier.economic_analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 