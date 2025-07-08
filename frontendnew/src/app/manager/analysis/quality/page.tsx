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

export default function QualityAnalysisPage() {
  const [qualityData, setQualityData] = useState({
    material_id: '',
    defect_rate: '',
    customer_satisfaction: '',
    compliance_score: '',
    process_efficiency: '',
    measurements: {
      tensile_strength: '',
      durability: '',
      purity: '',
      consistency: ''
    },
    standards: {
      tensile_strength: '500',
      durability: '95',
      purity: '99.5',
      consistency: '90'
    },
    certification_status: [] as string[],
    audit_history: []
  });

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const certificationOptions = [
    'ISO9001',
    'ISO14001',
    'ISO45001',
    'Six Sigma',
    'HACCP',
    'GMP'
  ];

  const handleCertificationChange = (certification: string, checked: boolean) => {
    const current = qualityData.certification_status;
    if (checked) {
      setQualityData({
        ...qualityData,
        certification_status: [...current, certification]
      });
    } else {
      setQualityData({
        ...qualityData,
        certification_status: current.filter(c => c !== certification)
      });
    }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const measurements = qualityData.measurements;
      const standards = qualityData.standards;
      
      // Calculate compliance for each metric
      const compliance = {};
      Object.keys(measurements).forEach(metric => {
        const value = parseFloat(measurements[metric as keyof typeof measurements]);
        const standard = parseFloat(standards[metric as keyof typeof standards]);
        compliance[metric as keyof typeof compliance] = value >= standard;
      });
      
      // Calculate overall quality score
      const qualityScore = Object.values(compliance).filter(Boolean).length / Object.values(compliance).length * 100;
      
      // Calculate risk level
      const defectRate = parseFloat(qualityData.defect_rate);
      const customerSatisfaction = parseFloat(qualityData.customer_satisfaction);
      const complianceScore = parseFloat(qualityData.compliance_score);
      const processEfficiency = parseFloat(qualityData.process_efficiency);
      
      const riskScore = (
        (100 - defectRate) * 0.3 +
        customerSatisfaction * 0.3 +
        complianceScore * 0.2 +
        processEfficiency * 0.2
      );
      
      const riskLevel = riskScore >= 80 ? 'Low' : riskScore >= 60 ? 'Medium' : 'High';
      
      // Identify improvement areas
      const improvementAreas = [];
      if (defectRate > 5) improvementAreas.push('Defect rate reduction');
      if (customerSatisfaction < 80) improvementAreas.push('Customer satisfaction improvement');
      if (complianceScore < 90) improvementAreas.push('Compliance enhancement');
      if (processEfficiency < 85) improvementAreas.push('Process efficiency optimization');
      
      const certificationStatus = {
        ISO9001: qualityData.certification_status.includes('ISO9001'),
        ISO14001: qualityData.certification_status.includes('ISO14001'),
        ISO45001: qualityData.certification_status.includes('ISO45001')
      };
      
      setAnalysisResults({
        quality_score: qualityScore,
        compliance_details: compliance,
        risk_level: riskLevel,
        risk_score: riskScore,
        improvement_areas: improvementAreas,
        certification_status: certificationStatus,
        overall_score: qualityScore,
        recommendations: qualityScore < 70 ? 
          ['Implement quality control measures', 'Review supplier standards', 'Increase inspection frequency'] :
          ['Maintain current quality standards', 'Continue monitoring', 'Consider advanced quality certifications'],
        audit_summary: {
          status: 'Recent audits completed',
          total_audits: 3,
          last_audit_date: '2024-01-15',
          average_score: 87.5,
          major_findings: ['Documentation incomplete', 'Process deviation observed']
        }
      });
      setIsLoading(false);
    }, 1500);
  };

  const qualityMetrics = [
    {
      name: 'Defect Rate',
      value: 2.3,
      unit: '%',
      target: 3.0,
      status: 'good',
      trend: 'improving'
    },
    {
      name: 'Customer Satisfaction',
      value: 92,
      unit: '%',
      target: 90,
      status: 'excellent',
      trend: 'stable'
    },
    {
      name: 'First Pass Yield',
      value: 96.8,
      unit: '%',
      target: 95,
      status: 'excellent',
      trend: 'improving'
    },
    {
      name: 'Process Capability',
      value: 1.67,
      unit: 'Cpk',
      target: 1.33,
      status: 'excellent',
      trend: 'stable'
    },
    {
      name: 'Supplier Quality Rating',
      value: 88,
      unit: '%',
      target: 85,
      status: 'good',
      trend: 'improving'
    },
    {
      name: 'Audit Score',
      value: 94,
      unit: '%',
      target: 90,
      status: 'excellent',
      trend: 'stable'
    }
  ];

  const auditHistory = [
    {
      date: '2024-01-15',
      type: 'Internal',
      score: 92,
      status: 'Passed',
      findings: 3,
      major_issues: 0
    },
    {
      date: '2023-10-22',
      type: 'External',
      score: 88,
      status: 'Passed',
      findings: 5,
      major_issues: 1
    },
    {
      date: '2023-07-18',
      type: 'Supplier',
      score: 85,
      status: 'Passed',
      findings: 7,
      major_issues: 2
    },
    {
      date: '2023-04-12',
      type: 'Internal',
      score: 90,
      status: 'Passed',
      findings: 4,
      major_issues: 0
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">✅</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Analysis</h1>
            <p className="text-gray-600">Quality metrics and supplier performance evaluation</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Quality Assessment</TabsTrigger>
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="audits">Audit History</TabsTrigger>
          <TabsTrigger value="improvement">Improvement Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Data</CardTitle>
                <CardDescription>Enter quality metrics and measurements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="material_id">Material ID</Label>
                    <Input
                      id="material_id"
                      value={qualityData.material_id}
                      onChange={(e) => setQualityData({...qualityData, material_id: e.target.value})}
                      placeholder="MAT001"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="defect_rate">Defect Rate (%)</Label>
                      <Input
                        id="defect_rate"
                        type="number"
                        step="0.1"
                        value={qualityData.defect_rate}
                        onChange={(e) => setQualityData({...qualityData, defect_rate: e.target.value})}
                        placeholder="2.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_satisfaction">Customer Satisfaction (%)</Label>
                      <Input
                        id="customer_satisfaction"
                        type="number"
                        value={qualityData.customer_satisfaction}
                        onChange={(e) => setQualityData({...qualityData, customer_satisfaction: e.target.value})}
                        placeholder="92"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="compliance_score">Compliance Score (%)</Label>
                      <Input
                        id="compliance_score"
                        type="number"
                        value={qualityData.compliance_score}
                        onChange={(e) => setQualityData({...qualityData, compliance_score: e.target.value})}
                        placeholder="88"
                      />
                    </div>
                    <div>
                      <Label htmlFor="process_efficiency">Process Efficiency (%)</Label>
                      <Input
                        id="process_efficiency"
                        type="number"
                        value={qualityData.process_efficiency}
                        onChange={(e) => setQualityData({...qualityData, process_efficiency: e.target.value})}
                        placeholder="85"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Quality Measurements</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tensile_strength">Tensile Strength (MPa)</Label>
                      <Input
                        id="tensile_strength"
                        type="number"
                        value={qualityData.measurements.tensile_strength}
                        onChange={(e) => setQualityData({
                          ...qualityData,
                          measurements: {...qualityData.measurements, tensile_strength: e.target.value}
                        })}
                        placeholder="520"
                      />
                      <p className="text-xs text-gray-500 mt-1">Standard: ≥500 MPa</p>
                    </div>
                    <div>
                      <Label htmlFor="durability">Durability (%)</Label>
                      <Input
                        id="durability"
                        type="number"
                        value={qualityData.measurements.durability}
                        onChange={(e) => setQualityData({
                          ...qualityData,
                          measurements: {...qualityData.measurements, durability: e.target.value}
                        })}
                        placeholder="97"
                      />
                      <p className="text-xs text-gray-500 mt-1">Standard: ≥95%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purity">Purity (%)</Label>
                      <Input
                        id="purity"
                        type="number"
                        step="0.1"
                        value={qualityData.measurements.purity}
                        onChange={(e) => setQualityData({
                          ...qualityData,
                          measurements: {...qualityData.measurements, purity: e.target.value}
                        })}
                        placeholder="99.8"
                      />
                      <p className="text-xs text-gray-500 mt-1">Standard: ≥99.5%</p>
                    </div>
                    <div>
                      <Label htmlFor="consistency">Consistency (%)</Label>
                      <Input
                        id="consistency"
                        type="number"
                        value={qualityData.measurements.consistency}
                        onChange={(e) => setQualityData({
                          ...qualityData,
                          measurements: {...qualityData.measurements, consistency: e.target.value}
                        })}
                        placeholder="93"
                      />
                      <p className="text-xs text-gray-500 mt-1">Standard: ≥90%</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Quality Certifications</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {certificationOptions.map((cert) => (
                      <div key={cert} className="flex items-center space-x-2">
                        <Checkbox
                          id={cert}
                          checked={qualityData.certification_status.includes(cert)}
                          onCheckedChange={(checked) => handleCertificationChange(cert, checked as boolean)}
                        />
                        <Label htmlFor={cert} className="text-sm">{cert}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleCalculate} 
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Quality Score'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Assessment Results</CardTitle>
                <CardDescription>Quality performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResults ? (
                  <div className="space-y-6">
                    {/* Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {analysisResults.quality_score.toFixed(1)}
                      </div>
                      <p className="text-sm text-gray-600">Quality Score</p>
                      <Progress value={analysisResults.quality_score} className="mt-2" />
                      <Badge 
                        variant={analysisResults.risk_level === 'Low' ? 'default' : 'destructive'}
                        className="mt-2"
                      >
                        {analysisResults.risk_level} Risk
                      </Badge>
                    </div>

                    {/* Compliance Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Compliance Status</h4>
                      <div className="space-y-2">
                        {Object.entries(analysisResults.compliance_details).map(([metric, compliant]) => (
                          <div key={metric} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm capitalize">{metric.replace('_', ' ')}</span>
                            <Badge variant={compliant ? 'default' : 'destructive'}>
                              {compliant ? 'Compliant' : 'Non-compliant'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk Assessment */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisResults.risk_score.toFixed(1)}
                        </div>
                        <p className="text-sm text-gray-600">Risk Score</p>
                        <p className="text-xs text-gray-500">Higher is better</p>
                      </div>
                    </div>

                    {/* Improvement Areas */}
                    {analysisResults.improvement_areas.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Improvement Areas</h4>
                        <div className="space-y-2">
                          {analysisResults.improvement_areas.map((area: string, index: number) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm text-gray-600">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                      <div className="space-y-2">
                        {analysisResults.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm text-gray-600">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Enter quality data and click Calculate to view assessment results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Metrics Dashboard</CardTitle>
              <CardDescription>Key performance indicators and quality measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {qualityMetrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{metric.name}</h4>
                      <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Target: {metric.target}{metric.unit}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${metric.trend === 'improving' ? 'bg-green-500' : metric.trend === 'declining' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs text-gray-500">{metric.trend}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit History</CardTitle>
              <CardDescription>Quality audit results and compliance history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-right p-4">Score</th>
                      <th className="text-center p-4">Status</th>
                      <th className="text-right p-4">Findings</th>
                      <th className="text-right p-4">Major Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditHistory.map((audit, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-4">{new Date(audit.date).toLocaleDateString()}</td>
                        <td className="p-4">{audit.type}</td>
                        <td className="p-4 text-right font-medium">{audit.score}%</td>
                        <td className="p-4 text-center">
                          <Badge variant={audit.status === 'Passed' ? 'default' : 'destructive'}>
                            {audit.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">{audit.findings}</td>
                        <td className="p-4 text-right">
                          <span className={audit.major_issues > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {audit.major_issues}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Improvement Plans</CardTitle>
              <CardDescription>Action items and improvement initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Active Improvement Projects</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h5 className="font-medium text-blue-900">Process Standardization</h5>
                        <p className="text-sm text-blue-700 mt-1">Status: In Progress</p>
                        <p className="text-xs text-blue-600 mt-2">Standardize manufacturing processes to reduce variation</p>
                        <div className="mt-2">
                          <Progress value={65} className="h-2" />
                          <p className="text-xs text-blue-600 mt-1">65% Complete</p>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium text-green-900">Quality Training Program</h5>
                        <p className="text-sm text-green-700 mt-1">Status: Planned</p>
                        <p className="text-xs text-green-600 mt-2">Enhance staff training on quality procedures</p>
                        <div className="mt-2">
                          <Progress value={25} className="h-2" />
                          <p className="text-xs text-green-600 mt-1">25% Complete</p>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900">Equipment Calibration</h5>
                        <p className="text-sm text-purple-700 mt-1">Status: Completed</p>
                        <p className="text-xs text-purple-600 mt-2">Calibrate all measurement equipment</p>
                        <div className="mt-2">
                          <Progress value={100} className="h-2" />
                          <p className="text-xs text-purple-600 mt-1">100% Complete</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Upcoming Initiatives</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">Q2</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Supplier Quality Audit</h5>
                          <p className="text-sm text-gray-600">Comprehensive supplier quality assessment</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">Q3</div>
                        <div>
                          <h5 className="font-medium text-gray-900">ISO 9001 Certification</h5>
                          <p className="text-sm text-gray-600">Pursue ISO 9001 quality management certification</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">Q4</div>
                        <div>
                          <h5 className="font-medium text-gray-900">Quality Dashboard Implementation</h5>
                          <p className="text-sm text-gray-600">Deploy real-time quality monitoring dashboard</p>
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