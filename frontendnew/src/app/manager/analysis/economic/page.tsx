'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LineChart } from "@/components/ui/line-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { adminApi } from "@/lib/adminApi";

interface CostAnalysis {
  totalMaterialCost: number;
  averageCostPerUnit: number;
  costTrends: {
    period: string;
    cost: number;
  }[];
  topExpensiveMaterials: {
    name: string;
    cost: number;
    unit: string;
  }[];
  recommendations: {
    type: string;
    description: string;
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
  }[];
}

interface TransportAnalysis {
  totalTransportCost: number;
  costByMode: {
    mode: string;
    cost: number;
    percentage: number;
  }[];
  emissionsData: {
    mode: string;
    emissions: number;
  }[];
}

interface StorageAnalysis {
  totalStorageCost: number;
  utilizationRate: number;
  warehouseCosts: {
    warehouse: string;
    cost: number;
    utilization: number;
  }[];
}

export default function EconomicAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [transportAnalysis, setTransportAnalysis] = useState<TransportAnalysis | null>(null);
  const [storageAnalysis, setStorageAnalysis] = useState<StorageAnalysis | null>(null);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const [costData, transportData, storageData] = await Promise.all([
          adminApi.get('/api/analysis/economic/costs/'),
          adminApi.get('/api/analysis/economic/transport/'),
          adminApi.get('/api/analysis/economic/storage/')
        ]);

        setCostAnalysis(costData.data);
        setTransportAnalysis(transportData.data);
        setStorageAnalysis(storageData.data);
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Economic Analysis Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Material Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(costAnalysis?.totalMaterialCost || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Average per unit: {formatCurrency(costAnalysis?.averageCostPerUnit || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transport Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(transportAnalysis?.totalTransportCost || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Across all transportation modes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((storageAnalysis?.utilizationRate || 0) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Average warehouse utilization
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart 
                  data={costAnalysis?.costTrends || []}
                  xField="period"
                  yField="cost"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Material Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {costAnalysis?.topExpensiveMaterials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{material.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Cost per {material.unit}
                      </p>
                    </div>
                    <Badge variant={index < 3 ? "destructive" : "secondary"}>
                      {formatCurrency(material.cost)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transport Cost Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transportAnalysis?.costByMode.map((mode, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{mode.mode}</span>
                        <span>{formatCurrency(mode.cost)}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${mode.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emissions by Transport Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transportAnalysis?.emissionsData.map((mode, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <span className="font-medium">{mode.mode}</span>
                      <span>{mode.emissions.toFixed(2)} CO₂e</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageAnalysis?.warehouseCosts.map((warehouse, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{warehouse.warehouse}</h3>
                      <Badge>{formatCurrency(warehouse.cost)}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Utilization</span>
                        <span>{(warehouse.utilization * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${warehouse.utilization * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {costAnalysis?.recommendations.map((rec, index) => (
              <Alert key={index} variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {rec.type}
                  <Badge variant={
                    rec.priority === 'high' ? 'destructive' : 
                    rec.priority === 'medium' ? 'default' : 
                    'secondary'
                  }>
                    {rec.priority} priority
                  </Badge>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p>{rec.description}</p>
                  <p className="mt-2 font-medium">
                    Potential savings: {formatCurrency(rec.potentialSavings)}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 