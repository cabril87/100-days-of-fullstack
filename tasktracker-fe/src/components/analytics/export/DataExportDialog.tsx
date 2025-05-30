'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { dataExportService } from '@/lib/services/analytics';
import type { CreateExportRequest } from '@/lib/services/analytics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, DownloadIcon, AlertCircleIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DataExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportComplete?: (exportId: number) => void;
}

export const DataExportDialog: React.FC<DataExportDialogProps> = ({
  open,
  onOpenChange,
  onExportComplete
}) => {
  const [exportType, setExportType] = useState<string>('json');
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [includeCharts, setIncludeCharts] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

  // Calculate estimated file size when parameters change
  React.useEffect(() => {
    const calculateEstimate = async () => {
      try {
        const request: CreateExportRequest = {
          exportType,
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          filters: {
            includeCharts,
            includeMetadata
          }
        };

        const size = await dataExportService.getExportSizeEstimate(request);
        setEstimatedSize(size);
      } catch (err) {
        console.error('Failed to estimate export size:', err);
        setEstimatedSize(null);
      }
    };

    if (open && startDate && endDate) {
      calculateEstimate();
    }
  }, [exportType, startDate, endDate, includeCharts, includeMetadata, open]);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      const request: CreateExportRequest = {
        exportType,
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        filters: {
          includeCharts,
          includeMetadata
        }
      };

      // Validate the request
      const validation = dataExportService.validateExportRequest(request);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      const exportRequest = await dataExportService.createExportRequest(request);
      
      if (onExportComplete) {
        onExportComplete(exportRequest.id);
      }

      onOpenChange(false);
      
      // Reset form
      setExportType('json');
      setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      setEndDate(new Date());
      setIncludeCharts(false);
      setIncludeMetadata(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create export');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown';
    return dataExportService.formatFileSize(bytes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DownloadIcon className="h-5 w-5" />
            Export Analytics Data
          </DialogTitle>
          <DialogDescription>
            Configure your data export settings. The export will be processed in the background.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={exportType} onValueChange={setExportType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON - Structured data format</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV - Spreadsheet compatible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">Excel - Full formatting support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF - Report format with charts</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date" className="text-xs text-gray-500">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-xs text-gray-500">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="include-charts" className="text-sm">
                  Include charts and visualizations
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-metadata"
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <Label htmlFor="include-metadata" className="text-sm">
                  Include metadata and timestamps
                </Label>
              </div>
            </div>
          </div>

          {/* Estimated File Size */}
          {estimatedSize && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <AlertCircleIcon className="h-4 w-4" />
                <span>Estimated file size: {formatFileSize(estimatedSize)}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-red-800">
                <AlertCircleIcon className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading || !startDate || !endDate}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Export...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Start Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataExportDialog; 