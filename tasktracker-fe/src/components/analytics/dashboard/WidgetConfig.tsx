/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Palette,
  Layers,
  BarChart3,
  Save,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardWidget } from '@/lib/types/analytics';

interface WidgetConfigProps {
  widget: DashboardWidget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateWidget: (updates: Partial<DashboardWidget>) => void;
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'slider' | 'color';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

// Configuration schemas for different widget types
const WIDGET_CONFIGS: Record<string, ConfigField[]> = {
  'task-trend-chart': [
    {
      key: 'chartType',
      label: 'Chart Type',
      type: 'select',
      options: [
        { value: 'line', label: 'Line Chart' },
        { value: 'area', label: 'Area Chart' },
        { value: 'bar', label: 'Bar Chart' }
      ],
      description: 'Visual style of the chart'
    },
    {
      key: 'timeRange',
      label: 'Time Range',
      type: 'select',
      options: [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '1y', label: 'Last year' }
      ]
    },
    {
      key: 'showAverage',
      label: 'Show Average Line',
      type: 'boolean',
      description: 'Display average completion line'
    },
    {
      key: 'primaryColor',
      label: 'Primary Color',
      type: 'color'
    }
  ],
  'productivity-heatmap': [
    {
      key: 'granularity',
      label: 'Time Granularity',
      type: 'select',
      options: [
        { value: 'hour', label: 'Hourly' },
        { value: 'day', label: 'Daily' },
        { value: 'week', label: 'Weekly' }
      ]
    },
    {
      key: 'colorScheme',
      label: 'Color Scheme',
      type: 'select',
      options: [
        { value: 'blue', label: 'Blue' },
        { value: 'green', label: 'Green' },
        { value: 'red', label: 'Red' },
        { value: 'purple', label: 'Purple' }
      ]
    },
    {
      key: 'showLabels',
      label: 'Show Value Labels',
      type: 'boolean'
    }
  ],
  'category-pie-chart': [
    {
      key: 'showLegend',
      label: 'Show Legend',
      type: 'boolean'
    },
    {
      key: 'showPercentages',
      label: 'Show Percentages',
      type: 'boolean'
    },
    {
      key: 'donutMode',
      label: 'Donut Style',
      type: 'boolean',
      description: 'Display as donut chart instead of pie'
    }
  ],
  'family-comparison-chart': [
    {
      key: 'metric',
      label: 'Comparison Metric',
      type: 'select',
      options: [
        { value: 'tasksCompleted', label: 'Tasks Completed' },
        { value: 'focusTime', label: 'Focus Time' },
        { value: 'productivity', label: 'Productivity Score' }
      ]
    },
    {
      key: 'timeRange',
      label: 'Time Range',
      type: 'select',
      options: [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' }
      ]
    },
    {
      key: 'showAverage',
      label: 'Show Family Average',
      type: 'boolean'
    }
  ]
};

export function WidgetConfig({ widget, open, onOpenChange, onUpdateWidget }: WidgetConfigProps) {
  const [localConfig, setLocalConfig] = useState(widget.configuration);
  const [localTitle, setLocalTitle] = useState(widget.title);
  const [localSize, setLocalSize] = useState(widget.size);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalConfig(widget.configuration);
    setLocalTitle(widget.title);
    setLocalSize(widget.size);
    setHasChanges(false);
  }, [widget]);

  const configFields = WIDGET_CONFIGS[widget.type] || [];

  const handleConfigChange = (key: string, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    setLocalSize(prev => ({ ...prev, [dimension]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateWidget({
      title: localTitle,
      configuration: localConfig,
      size: localSize,
      updatedAt: new Date()
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(widget.configuration);
    setLocalTitle(widget.title);
    setLocalSize(widget.size);
    setHasChanges(false);
  };

  const renderConfigField = (field: ConfigField) => {
    const value = localConfig[field.key];

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.label}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleConfigChange(field.key, Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );

      case 'boolean':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => handleConfigChange(field.key, checked)}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleConfigChange(field.key, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <Slider
              value={[value || field.min || 0]}
              onValueChange={([newValue]) => handleConfigChange(field.key, newValue)}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground text-center">
              {value || field.min || 0}
            </div>
          </div>
        );

      case 'color':
        return (
          <Input
            type="color"
            value={value || '#3b82f6'}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full h-10"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Widget Configuration
          </SheetTitle>
          <SheetDescription>
            Customize the appearance and behavior of your widget.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Widget Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Widget Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="widget-title">Title</Label>
                <Input
                  id="widget-title"
                  value={localTitle}
                  onChange={(e) => {
                    setLocalTitle(e.target.value);
                    setHasChanges(true);
                  }}
                  placeholder="Widget title"
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">{widget.type}</Badge>
                <Badge variant="secondary">
                  {localSize.width}×{localSize.height}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Tabs */}
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance">
                <Palette className="h-4 w-4 mr-1" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="data">
                <BarChart3 className="h-4 w-4 mr-1" />
                Data
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layers className="h-4 w-4 mr-1" />
                Layout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Visual Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {configFields
                    .filter(field => ['color', 'boolean'].includes(field.type))
                    .map(field => (
                      <div key={field.key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={field.key}>{field.label}</Label>
                          {renderConfigField(field)}
                        </div>
                        {field.description && (
                          <p className="text-xs text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Data Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {configFields
                    .filter(field => ['select', 'text', 'number'].includes(field.type))
                    .map(field => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        {renderConfigField(field)}
                        {field.description && (
                          <p className="text-xs text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Size & Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Width (columns)</Label>
                      <Slider
                        value={[localSize.width]}
                        onValueChange={([value]) => handleSizeChange('width', value)}
                        min={1}
                        max={12}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground text-center">
                        {localSize.width}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Height (rows)</Label>
                      <Slider
                        value={[localSize.height]}
                        onValueChange={([value]) => handleSizeChange('height', value)}
                        min={1}
                        max={8}
                        step={1}
                        className="w-full"
                      />
                      <div className="text-sm text-muted-foreground text-center">
                        {localSize.height}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>

            <Button
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                You have unsaved changes. Click "Save Changes" to apply them.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 