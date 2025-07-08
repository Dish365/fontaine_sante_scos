'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AnalysisPage() {
  const analysisCards = [
    {
      id: 'economic',
      title: 'Economic Analysis',
      description: 'Cost optimization and financial impact assessment',
      color: 'blue',
      icon: '💰',
      href: '/manager/analysis/economic',
      features: ['Cost Breakdown', 'ROI Analysis', 'Supplier Comparison', 'Financial Optimization']
    },
    {
      id: 'environmental',
      title: 'Environmental Analysis',
      description: 'Carbon footprint and sustainability metrics',
      color: 'green',
      icon: '🌱',
      href: '/manager/analysis/environmental',
      features: ['Carbon Footprint', 'Sustainability Score', 'Impact Assessment', 'Compliance Check']
    },
    {
      id: 'quality',
      title: 'Quality Analysis',
      description: 'Quality metrics and supplier performance evaluation',
      color: 'purple',
      icon: '✅',
      href: '/manager/analysis/quality',
      features: ['Quality Score', 'Compliance Status', 'Risk Assessment', 'Audit Summary']
    },
    {
      id: 'transportation',
      title: 'Transportation Analysis',
      description: 'Logistics optimization and route efficiency',
      color: 'orange',
      icon: '🚚',
      href: '/manager/analysis/transportation',
      features: ['Route Optimization', 'Emission Calculation', 'Efficiency Score', 'Cost Analysis']
    },
    {
      id: 'tradeoff',
      title: 'Trade-off Analysis',
      description: 'Multi-criteria decision making and optimization',
      color: 'red',
      icon: '⚖️',
      href: '/manager/analysis/tradeoff',
      features: ['Balanced Scoring', 'Risk Assessment', 'Optimization Matrix', 'Decision Support']
    },
    {
      id: 'monitoring',
      title: 'Real-time Monitoring',
      description: 'Live metrics and KPI tracking dashboard',
      color: 'teal',
      icon: '📊',
      href: '/manager/analysis/monitoring',
      features: ['Live Dashboard', 'KPI Tracking', 'Performance Metrics', 'Alert Integration']
    },
    {
      id: 'comparative',
      title: 'Comparative Analysis',
      description: 'Side-by-side supplier and scenario comparison',
      color: 'indigo',
      icon: '🔄',
      href: '/manager/analysis/comparative',
      features: ['Supplier Comparison', 'Scenario Analysis', 'Benchmarking', 'Ranking System']
    },
    {
      id: 'alerts',
      title: 'Alert Systems',
      description: 'Automated alerts for critical thresholds and anomalies',
      color: 'rose',
      icon: '🚨',
      href: '/manager/analysis/alerts',
      features: ['Threshold Alerts', 'Anomaly Detection', 'Notification System', 'Alert Configuration']
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
      green: 'from-green-50 to-emerald-100 border-green-200 text-green-900',
      purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900',
      orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900',
      red: 'from-red-50 to-red-100 border-red-200 text-red-900',
      teal: 'from-teal-50 to-teal-100 border-teal-200 text-teal-900',
      indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-900',
      rose: 'from-rose-50 to-rose-100 border-rose-200 text-rose-900'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconBgClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-emerald-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      teal: 'from-teal-500 to-teal-600',
      indigo: 'from-indigo-500 to-indigo-600',
      rose: 'from-rose-500 to-rose-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis</h1>
        <p className="text-gray-600">Advanced analytics and monitoring tools</p>
      </div>

      {/* Analysis Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {analysisCards.map((card) => (
          <Link key={card.id} href={card.href}>
            <Card className={`hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br ${getColorClasses(card.color)} overflow-hidden group cursor-pointer`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-12 -mt-12"></div>
              <CardHeader className="relative pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getIconBgClasses(card.color)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg`}>
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className={`text-lg font-bold ${card.color === 'rose' ? 'text-rose-900' : ''}`}>
                      {card.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm opacity-80">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {card.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm opacity-75">
                      <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-current/10">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      Available
                    </Badge>
                    <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Analyses</p>
              <p className="text-2xl font-bold text-blue-900">8</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Data Sources</p>
              <p className="text-2xl font-bold text-green-900">12</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Reports Generated</p>
              <p className="text-2xl font-bold text-purple-900">247</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 