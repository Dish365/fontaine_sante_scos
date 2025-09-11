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
import { Loader2, Leaf, Droplet, Trash2, Wind, Factory, Package, Truck, CheckCircle, Info, RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { EnvironmentalMetricsGrid } from './components/EnvironmentalCharts';

// FastAPI Base URL
const FASTAPI_BASE_URL = "http://localhost:8001";
// Django API Base URL
const DJANGO_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const router = useRouter();
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
  const [showCompactSelector, setShowCompactSelector] = useState<boolean>(false);
  const [supplierSearch, setSupplierSearch] = useState<string>('');
  const [chartType, setChartType] = useState<'emissions' | 'energy' | 'water' | 'waste'>('emissions');

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    setDebugInfo('🚀 Starting environmental analysis...');
    
    try {
      // 1) Fetch suppliers from Django (source of truth)
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const supplierResp = await fetch(`${DJANGO_API_BASE_URL}/api/suppliers/suppliers/`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!supplierResp.ok) {
        const errText = await supplierResp.text();
        throw new Error(`Failed to fetch suppliers from Django: ${supplierResp.status} ${supplierResp.statusText} - ${errText}`);
      }
      const supplierPayload = await supplierResp.json();
      const suppliers: any[] = supplierPayload.results || supplierPayload;
      setDebugInfo(prev => prev + `\n🏷️ Loaded ${suppliers.length} suppliers from Django`);

      // 2) For each supplier, call FastAPI environmental/assess with mapped parameters
      const basePool = selectedSuppliers.length
        ? suppliers.filter(s => selectedSuppliers.includes(s.id))
        : suppliers;

      const assessments = await Promise.all(
        basePool.map(async (s) => {
          const assessmentInput = {
            energy_consumption: Number(s.energy_consumption || 0),
            water_usage: Number(s.water_usage || 0),
            waste_generated: Number(s.waste_generated || 0),
            carbon_emissions: Number(s.carbon_footprint || 0),
            recycling_rate: Number(s.recycling_rate || 0),
            renewable_energy_usage: Number(s.renewable_energy_usage || 0),
            environmental_certifications: (s.environmental_certification && s.environmental_certification !== 'none')
              ? [String(s.environmental_certification)]
              : [],
          };

          const resp = await fetch(`${FASTAPI_BASE_URL}/environmental/assess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessmentInput),
          });
          if (!resp.ok) {
            const t = await resp.text();
            throw new Error(`FastAPI assess failed for supplier ${s.name || s.id}: ${resp.status} ${resp.statusText} - ${t}`);
          }
          const assessed = await resp.json();

          const supplierAnalysis: SupplierEnvironmentalAnalysis = {
            supplier_id: s.id,
            supplier_name: s.name,
            environmental_score: assessed.environmental_score,
            carbon_footprint: assessed.carbon_footprint,
            sustainability_level: assessed.sustainability_level,
            impact_breakdown: assessed.impact_breakdown || {
              energy: { consumption: assessmentInput.energy_consumption, renewable_percentage: assessmentInput.renewable_energy_usage, impact_score: 0 },
              water: { usage: assessmentInput.water_usage, impact_score: 0 },
              waste: { generated: assessmentInput.waste_generated, recycling_rate: assessmentInput.recycling_rate, impact_score: 0 },
              emissions: { direct_emissions: assessmentInput.carbon_emissions, impact_score: 0 },
            },
            certifications: assessed.certifications || assessmentInput.environmental_certifications,
            recommendations: assessed.recommendations || [],
            transport_mode: s.transportation_mode || 'road',
            material_count: Array.isArray(s.materials_data) ? s.materials_data.length : (Number(s.material_count || 0)),
            metrics: {
              energy_consumption: assessmentInput.energy_consumption,
              water_usage: assessmentInput.water_usage,
              waste_generated: assessmentInput.waste_generated,
              recycling_rate: assessmentInput.recycling_rate,
              renewable_energy: assessmentInput.renewable_energy_usage,
            },
          };
          return supplierAnalysis;
        })
      );

      // 3) Build analysis and summary objects
      const totalSuppliers = assessments.length;
      const scores = assessments.map(a => a.environmental_score);
      const carbonTotals = assessments.map(a => a.carbon_footprint);
      const energyTotals = assessments.map(a => a.metrics.energy_consumption);
      const avgScore = scores.length ? scores.reduce((a,b)=>a+b,0)/scores.length : 0;
      const bestScore = scores.length ? Math.max(...scores) : 0;
      const worstScore = scores.length ? Math.min(...scores) : 0;
      const totalCarbon = carbonTotals.reduce((a,b)=>a+b,0);
      const totalEnergy = energyTotals.reduce((a,b)=>a+b,0);

      const analysis: EnvironmentalAnalysisData = {
        success: true,
        analysis_parameters: {
          order_volume: orderVolume,
          include_materials: includeMaterials,
          include_transport: includeTransport,
        },
        overall_statistics: {
          total_suppliers_analyzed: totalSuppliers,
          average_score: avgScore,
          best_score: bestScore,
          worst_score: worstScore,
          total_carbon_footprint: totalCarbon,
          total_energy_consumption: totalEnergy,
        },
        supplier_analyses: assessments,
        recommendations: {
          top_performer: assessments.length ? assessments.reduce((best, cur) => cur.environmental_score > best.environmental_score ? cur : best, assessments[0]) : null,
          improvement_opportunities: Array.from(new Set(assessments.flatMap(a => a.recommendations))).slice(0, 8),
        },
      };

      // Summary derived from Django suppliers
      const certDist: Record<string, number> = {};
      const transportDist: Record<string, number> = {};
      suppliers.forEach(s => {
        const cert = s.environmental_certification || 'none';
        certDist[cert] = (certDist[cert] || 0) + 1;
        const mode = s.transportation_mode || 'road';
        transportDist[mode] = (transportDist[mode] || 0) + 1;
      });
      const summary: EnvironmentalSummary = {
        success: true,
        summary: {
          total_suppliers: suppliers.length,
          certification_distribution: certDist,
          environmental_statistics: {
            average_carbon_footprint: totalSuppliers ? totalCarbon / totalSuppliers : 0,
            average_renewable_energy: assessments.length ? (assessments.reduce((a,b)=>a + (b.metrics.renewable_energy || 0), 0) / assessments.length) : 0,
            total_certified_suppliers: suppliers.filter(s => s.environmental_certification && s.environmental_certification !== 'none').length,
          },
          transportation_distribution: transportDist,
        },
      };

      setAnalysisData(analysis);
      setSummaryData(summary);
      setDebugInfo(prev => prev + `\n✅ Analysis complete: ${assessments.length} suppliers analyzed`);
      setDebugInfo(prev => prev + `\n📈 Overall stats: Avg score ${avgScore.toFixed(1)}`);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch analysis data';
      setError(errorMsg);
      setDebugInfo(prev => prev + `\n❌ Analysis error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Summary now derived in fetchAnalysisData (from Django suppliers)
  const fetchSummaryData = async () => {
    setSummaryLoading(true);
    try {
      await fetchAnalysisData();
    } finally {
      setSummaryLoading(false);
    }
  };

      useEffect(() => {
      // Initial data fetch (single orchestrated call builds both)
      fetchSummaryData();

      // No WebSockets; no cleanup required
      return () => {};
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/manager/dashboard')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Environmental Impact Analysis</h1>
        </div>
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
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowCompactSelector((v) => !v)}
                    >
                      {showCompactSelector ? 'Hide' : 'Select Suppliers'}
                    </Button>
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

                {showCompactSelector && analysisData && (
                  <div className="mb-4 p-3 border rounded-md bg-muted/30">
                    <div className="flex items-end gap-2 mb-2">
                      <div className="flex-1 space-y-1">
                        <Label htmlFor="supplierSearch" className="text-xs">Search suppliers</Label>
                        <Input 
                          id="supplierSearch"
                          placeholder="Search by name"
                          value={supplierSearch}
                          onChange={(e) => setSupplierSearch(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const visible = analysisData.supplier_analyses
                            .filter(s => s.supplier_name.toLowerCase().includes(supplierSearch.toLowerCase()))
                            .map(s => s.supplier_id);
                          setSelectedSuppliers((prev) => Array.from(new Set([...prev, ...visible])));
                        }}
                      >Select visible</Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const visibleSet = new Set(
                            analysisData.supplier_analyses
                              .filter(s => s.supplier_name.toLowerCase().includes(supplierSearch.toLowerCase()))
                              .map(s => s.supplier_id)
                          );
                          setSelectedSuppliers(prev => prev.filter(id => !visibleSet.has(id)));
                        }}
                      >Clear visible</Button>
                      <Button size="sm" onClick={() => setShowCompactSelector(false)}>Done</Button>
                    </div>
                    <div className="max-h-56 overflow-y-auto rounded border bg-background">
                      {analysisData.supplier_analyses
                        .filter(s => s.supplier_name.toLowerCase().includes(supplierSearch.toLowerCase()))
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
                          </label>
                        ))}
                    </div>
                  </div>
                )}

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