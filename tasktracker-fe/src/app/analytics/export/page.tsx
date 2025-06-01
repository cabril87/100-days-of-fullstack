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
  DataExportDialog,
  ExportHistory
} from '@/components/analytics';
import type { FilterCriteria } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  DownloadIcon, 
  HistoryIcon,
  FileTextIcon,
  DatabaseIcon,
  CalendarIcon,
  FilterIcon
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsExportPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('export');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [currentFilter] = useState<FilterCriteria | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/analytics/export');
    }
  }, [authLoading, user, router]);

  // Handle export completion
  const handleExportComplete = (exportId: number) => {
    console.log('Export completed:', exportId);
    // Switch to history tab to show the new export
    setActiveTab('history');
  };

  // Sample export formats info
  const exportFormats = [
    {
      name: 'JSON',
      description: 'JavaScript Object Notation - machine readable',
      icon: <DatabaseIcon className="h-6 w-6" />,
      fileType: 'application/json',
      pros: ['Structured data', 'API friendly', 'Lightweight'],
      cons: ['Not human readable'],
      useCase: 'API integration, data processing'
    },
    {
      name: 'CSV',
      description: 'Comma Separated Values - spreadsheet compatible',
      icon: <FileTextIcon className="h-6 w-6" />,
      fileType: 'text/csv',
      pros: ['Excel compatible', 'Human readable', 'Universal support'],
      cons: ['Limited structure', 'No nested data'],
      useCase: 'Excel analysis, reporting'
    },
    {
      name: 'Excel',
      description: 'Microsoft Excel format with charts and formatting',
      icon: <FileTextIcon className="h-6 w-6" />,
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pros: ['Rich formatting', 'Charts included', 'Professional reports'],
      cons: ['Larger file size', 'Proprietary format'],
      useCase: 'Executive reports, presentations'
    },
    {
      name: 'PDF',
      description: 'Portable Document Format - formatted reports',
      icon: <FileTextIcon className="h-6 w-6" />,
      fileType: 'application/pdf',
      pros: ['Print ready', 'Fixed formatting', 'Professional appearance'],
      cons: ['Not editable', 'No raw data access'],
      useCase: 'Reports, archiving, sharing'
    }
  ];

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
              <h1 className="text-3xl font-bold">Data Export Center</h1>
              <p className="text-gray-500">
                Export your analytics data in multiple formats
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
                className="flex items-center gap-2"
              >
                <DownloadIcon className="h-4 w-4" />
                New Export
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              Export Data
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" />
              Export History
            </TabsTrigger>
            <TabsTrigger value="formats" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              Format Guide
            </TabsTrigger>
          </TabsList>

          {/* Export Data Tab */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid gap-6">
              {/* Quick export options */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                      onClick={() => setShowExportDialog(true)}
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                    >
                      <CalendarIcon className="h-6 w-6" />
                      <span className="text-sm">Last 30 Days</span>
                    </Button>
                    <Button
                      onClick={() => setShowExportDialog(true)}
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                    >
                      <DatabaseIcon className="h-6 w-6" />
                      <span className="text-sm">All Tasks</span>
                    </Button>
                    <Button
                      onClick={() => setShowExportDialog(true)}
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                    >
                      <FilterIcon className="h-6 w-6" />
                      <span className="text-sm">Custom Filter</span>
                    </Button>
                    <Button
                      onClick={() => setShowExportDialog(true)}
                      variant="outline"
                      className="h-20 flex flex-col gap-2"
                    >
                      <FileTextIcon className="h-6 w-6" />
                      <span className="text-sm">Analytics Report</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Export statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">156</div>
                      <div className="text-sm text-gray-600">Total Exports</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">2.4GB</div>
                      <div className="text-sm text-gray-600">Data Exported</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">CSV</div>
                      <div className="text-sm text-gray-600">Most Popular</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">23</div>
                      <div className="text-sm text-gray-600">This Month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips and best practices */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Tips & Best Practices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-blue-800">Choose the Right Format</div>
                        <div className="text-sm text-blue-700">
                          Use CSV for spreadsheet analysis, JSON for data processing, PDF for reports
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-green-800">Filter Your Data</div>
                        <div className="text-sm text-green-700">
                          Apply filters before exporting to reduce file size and focus on relevant data
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-orange-800">Schedule Regular Exports</div>
                        <div className="text-sm text-orange-700">
                          Set up automated exports for regular reporting and backup purposes
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Export History Tab */}
          <TabsContent value="history" className="space-y-6">
            <ExportHistory 
              onExportDownload={(exportId) => {
                console.log('Downloaded export:', exportId);
              }}
            />
          </TabsContent>

          {/* Format Guide Tab */}
          <TabsContent value="formats" className="space-y-6">
            <div className="grid gap-6">
              {exportFormats.map((format) => (
                <Card key={format.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {format.icon}
                      <div>
                        <div>{format.name}</div>
                        <div className="text-sm font-normal text-gray-600">
                          {format.description}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Pros */}
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Advantages</h4>
                        <ul className="space-y-1">
                          {format.pros.map((pro, index) => (
                            <li key={index} className="text-sm text-green-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div>
                        <h4 className="font-medium text-red-700 mb-2">Limitations</h4>
                        <ul className="space-y-1">
                          {format.cons.map((con, index) => (
                            <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Use case */}
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2">Best Used For</h4>
                        <p className="text-sm text-blue-600">{format.useCase}</p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {format.fileType}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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