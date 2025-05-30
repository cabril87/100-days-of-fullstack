'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { dataExportService } from '@/lib/services/analytics';
import type { DataExportRequest } from '@/lib/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  HistoryIcon, 
  DownloadIcon, 
  TrashIcon, 
  RefreshCwIcon,
  FileIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface ExportHistoryProps {
  className?: string;
  onExportDownload?: (exportId: number) => void;
}

export const ExportHistory: React.FC<ExportHistoryProps> = ({
  className = '',
  onExportDownload
}) => {
  const [exports, setExports] = useState<DataExportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<number | null>(null);

  // Fetch export history
  const fetchExports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const exportHistory = await dataExportService.getExportHistory();
      setExports(exportHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch export history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  // Download export file
  const handleDownload = async (exportId: number) => {
    try {
      setDownloading(exportId);
      
      const exportItem = exports.find(e => e.id === exportId);
      const filename = `export_${exportId}_${exportItem?.exportType || 'data'}_${Date.now()}`;
      
      await dataExportService.downloadAndSaveFile(exportId, filename);
      
      if (onExportDownload) {
        onExportDownload(exportId);
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download export file');
    } finally {
      setDownloading(null);
    }
  };

  // Delete export
  const handleDelete = async (exportId: number) => {
    try {
      await dataExportService.deleteExport(exportId);
      
      // Remove from local state
      setExports(exports.filter(e => e.id !== exportId));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete export');
    }
  };

  // Get status badge color and icon
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return {
          variant: 'default' as const,
          icon: <CheckCircleIcon className="h-3 w-3" />,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'processing':
        return {
          variant: 'secondary' as const,
          icon: <ClockIcon className="h-3 w-3 animate-spin" />,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'failed':
        return {
          variant: 'destructive' as const,
          icon: <XCircleIcon className="h-3 w-3" />,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'pending':
      default:
        return {
          variant: 'outline' as const,
          icon: <ClockIcon className="h-3 w-3" />,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  // Get file type icon
  const getFileTypeIcon = (exportType: string) => {
    switch (exportType.toLowerCase()) {
      case 'json':
        return '📄';
      case 'csv':
        return '📊';
      case 'excel':
        return '📈';
      case 'pdf':
        return '📕';
      default:
        return '📁';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown';
    return dataExportService.formatFileSize(bytes);
  };

  // Calculate relative time
  const getRelativeTime = (date: string): string => {
    const now = new Date();
    const exportDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - exportDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return format(exportDate, 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Export History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading export history: {error}</p>
            <Button onClick={fetchExports} variant="outline" className="mt-4">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5" />
            Export History
          </CardTitle>
          
          <Button onClick={fetchExports} variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {exports.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <FileIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No exports yet</h3>
            <p className="text-sm">
              Your export history will appear here once you create your first export.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {exports.length}
                </div>
                <div className="text-sm text-gray-500">Total Exports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {exports.filter(e => e.status === 'Completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {exports.filter(e => e.status === 'Processing').length}
                </div>
                <div className="text-sm text-gray-500">Processing</div>
              </div>
            </div>

            {/* Export table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Export</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exports.map((exportItem) => {
                    const statusBadge = getStatusBadge(exportItem.status);
                    
                    return (
                      <TableRow key={exportItem.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {getFileTypeIcon(exportItem.exportType)}
                            </span>
                            <div>
                              <div className="font-medium">
                                Export #{exportItem.id}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(exportItem.createdAt), 'MMM dd, HH:mm')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {exportItem.exportType.toUpperCase()}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant={statusBadge.variant}
                            className={`flex items-center gap-1 w-fit ${statusBadge.className}`}
                          >
                            {statusBadge.icon}
                            {exportItem.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatFileSize(exportItem.fileSize)}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <CalendarIcon className="h-3 w-3" />
                            {getRelativeTime(exportItem.createdAt)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* Download button */}
                            <Button
                              onClick={() => handleDownload(exportItem.id)}
                              disabled={exportItem.status !== 'Completed' || downloading === exportItem.id}
                              variant="ghost"
                              size="sm"
                            >
                              {downloading === exportItem.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <DownloadIcon className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {/* Delete button */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Export</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete Export #{exportItem.id}? 
                                    This action cannot be undone and the file will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(exportItem.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportHistory; 