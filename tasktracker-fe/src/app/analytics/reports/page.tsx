'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  AnalyticsDashboard, 
  ProductivityHeatmap, 
  AdvancedFilterBuilder, 
  DataExportDialog,
  ExportHistory
} from '@/components/analytics';
import type { FilterCriteria } from '@/lib/types/analytics';
import type { CreateSavedFilterRequest } from '@/lib/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BarChart3Icon, 
  FilterIcon, 
  DownloadIcon,
  HistoryIcon,
  TrendingUpIcon,
  CalendarIcon
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentFilter, setCurrentFilter] = useState<FilterCriteria | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/analytics/reports');
    }
  }, [authLoading, user, router]);

  // Handle filter application
  const handleFilterApply = (criteria: FilterCriteria) => {
    setCurrentFilter(criteria);
    console.log('Applied filter:', criteria);
    // Here you would typically update your analytics data based on the filter
  };

  // Handle filter save
  const handleFilterSave = (filter: CreateSavedFilterRequest) => {
    console.log('Saved filter:', filter);
    // Show success message or update UI
  };

  // Handle export completion
  const handleExportComplete = (exportId: number) => {
    console.log('Export completed:', exportId);
    // Switch to export history tab to show the new export
    setActiveTab('exports');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/analytics">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Reports</h1>
              <p className="text-gray-500">
                Comprehensive analytics and reporting dashboard
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {currentFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FilterIcon className="h-3 w-3" />
                  Filter Active
                </Badge>
              )}
              
              <Button
                onClick={() => setShowExportDialog(true)}
                variant="outline"
                size="sm"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3Icon className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" />
              Exports
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <AnalyticsDashboard 
              theme="light"
              showExportControls={true}
              autoRefresh={true}
              refreshInterval={300}
            />
          </TabsContent>

          {/* Productivity Heatmap Tab */}
          <TabsContent value="heatmap" className="space-y-6">
            <div className="grid gap-6">
              <ProductivityHeatmap 
                theme="light"
                period="month"
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Heatmap Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">9-11 AM</div>
                      <div className="text-sm text-gray-600">Peak Productivity Hours</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">Tuesday</div>
                      <div className="text-sm text-gray-600">Most Productive Day</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">73%</div>
                      <div className="text-sm text-gray-600">Average Productivity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Advanced Filters Tab */}
          <TabsContent value="filters" className="space-y-6">
            <AdvancedFilterBuilder
              onFilterApply={handleFilterApply}
              onFilterSave={handleFilterSave}
            />
            
            {currentFilter && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Filter Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(currentFilter, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Export History Tab */}
          <TabsContent value="exports" className="space-y-6">
            <ExportHistory 
              onExportDownload={(exportId) => {
                console.log('Downloaded export:', exportId);
              }}
            />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-green-800">Productivity Trend Up</div>
                        <div className="text-sm text-green-700">
                          Your productivity has increased by 15% compared to last month. 
                          Keep up the great work!
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-blue-800">Peak Performance Time</div>
                        <div className="text-sm text-blue-700">
                          You&apos;re most productive between 9-11 AM. Consider scheduling 
                          important tasks during this time.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-orange-800">Weekend Activity</div>
                        <div className="text-sm text-orange-700">
                          You have 23% task completion on weekends. Consider reducing 
                          weekend work for better work-life balance.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Time Management</Badge>
                      <span className="text-sm">
                        Schedule complex tasks during your peak hours (9-11 AM)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Work-Life Balance</Badge>
                      <span className="text-sm">
                        Reduce weekend task load to improve overall well-being
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Productivity</Badge>
                      <span className="text-sm">
                        Consider time-blocking for focused work sessions
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Dialog */}
        <DataExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          onExportComplete={handleExportComplete}
        />
      </div>
    </div>
  );
} 