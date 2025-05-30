/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Timer,
  Activity,
  Filter,
  Download,
  Settings,
  Search,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWidget: (widgetType: string) => void;
}

interface WidgetTemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'charts' | 'metrics' | 'filters' | 'exports';
  size: { width: number; height: number };
  configuration: Record<string, any>;
  isPremium?: boolean;
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  // Chart Widgets
  {
    id: 'task-trend-chart',
    type: 'task-trend-chart',
    title: 'Task Trend Chart',
    description: 'Line chart showing task completion trends over time',
    icon: LineChart,
    category: 'charts',
    size: { width: 6, height: 4 },
    configuration: {
      chartType: 'line',
      timeRange: '30d',
      showAverage: true
    }
  },
  {
    id: 'productivity-heatmap',
    type: 'productivity-heatmap',
    title: 'Productivity Heatmap',
    description: 'Heatmap visualization of productivity patterns',
    icon: Activity,
    category: 'charts',
    size: { width: 8, height: 6 },
    configuration: {
      granularity: 'hour',
      colorScheme: 'blue'
    }
  },
  {
    id: 'category-pie-chart',
    type: 'category-pie-chart',
    title: 'Category Distribution',
    description: 'Pie chart showing task distribution by category',
    icon: PieChart,
    category: 'charts',
    size: { width: 4, height: 4 },
    configuration: {
      showLegend: true,
      showPercentages: true
    }
  },
  {
    id: 'family-comparison-chart',
    type: 'family-comparison-chart',
    title: 'Family Comparison',
    description: 'Bar chart comparing family member productivity',
    icon: Users,
    category: 'charts',
    size: { width: 6, height: 4 },
    configuration: {
      metric: 'tasksCompleted',
      timeRange: '7d'
    }
  },
  {
    id: 'timeline-chart',
    type: 'timeline-chart',
    title: 'Task Timeline',
    description: 'Timeline visualization of task completion patterns',
    icon: Calendar,
    category: 'charts',
    size: { width: 8, height: 3 },
    configuration: {
      groupBy: 'day',
      showMilestones: true
    }
  },
  {
    id: 'radar-chart',
    type: 'radar-chart',
    title: 'Performance Radar',
    description: 'Multi-dimensional performance analysis',
    icon: Target,
    category: 'charts',
    size: { width: 5, height: 5 },
    configuration: {
      metrics: ['speed', 'quality', 'consistency', 'collaboration']
    },
    isPremium: true
  },

  // Metrics Widgets
  {
    id: 'completion-rate',
    type: 'completion-rate',
    title: 'Completion Rate',
    description: 'Current task completion rate percentage',
    icon: TrendingUp,
    category: 'metrics',
    size: { width: 3, height: 2 },
    configuration: {
      timeRange: '7d',
      showTrend: true
    }
  },
  {
    id: 'daily-average',
    type: 'daily-average',
    title: 'Daily Average',
    description: 'Average tasks completed per day',
    icon: BarChart3,
    category: 'metrics',
    size: { width: 3, height: 2 },
    configuration: {
      period: 'week',
      showComparison: true
    }
  },
  {
    id: 'focus-time',
    type: 'focus-time',
    title: 'Focus Time',
    description: 'Total focus session time today',
    icon: Timer,
    category: 'metrics',
    size: { width: 3, height: 2 },
    configuration: {
      showGoal: true,
      format: 'hours'
    }
  },

  // Filter Widgets
  {
    id: 'quick-filters',
    type: 'quick-filters',
    title: 'Quick Filters',
    description: 'Quick access to common filter presets',
    icon: Filter,
    category: 'filters',
    size: { width: 4, height: 2 },
    configuration: {
      presets: ['today', 'week', 'overdue', 'priority']
    }
  },
  {
    id: 'advanced-search',
    type: 'advanced-search',
    title: 'Advanced Search',
    description: 'Advanced search and filtering interface',
    icon: Search,
    category: 'filters',
    size: { width: 6, height: 3 },
    configuration: {
      fields: ['title', 'category', 'assignee', 'dueDate']
    }
  },

  // Export Widgets
  {
    id: 'export-panel',
    type: 'export-panel',
    title: 'Export Panel',
    description: 'Quick export options for dashboard data',
    icon: Download,
    category: 'exports',
    size: { width: 4, height: 3 },
    configuration: {
      formats: ['pdf', 'csv', 'json'],
      includeCharts: true
    }
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Widgets' },
  { id: 'charts', label: 'Charts' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'filters', label: 'Filters' },
  { id: 'exports', label: 'Exports' }
];

export function WidgetLibrary({ open, onOpenChange, onAddWidget }: WidgetLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredWidgets = WIDGET_TEMPLATES.filter(widget => {
    const matchesSearch = widget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddWidget = (widget: WidgetTemplate) => {
    onAddWidget(widget.type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Widget Library</DialogTitle>
          <DialogDescription>
            Choose widgets to add to your dashboard. Drag and drop or click to add.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search widgets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {CATEGORIES.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredWidgets.map(widget => (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    onAdd={() => handleAddWidget(widget)}
                  />
                ))}
              </div>

              {filteredWidgets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No widgets found matching your criteria.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface WidgetCardProps {
  widget: WidgetTemplate;
  onAdd: () => void;
}

function WidgetCard({ widget, onAdd }: WidgetCardProps) {
  const Icon = widget.icon;

  return (
    <Card className="group hover:shadow-md transition-shadow cursor-pointer relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">{widget.title}</CardTitle>
          </div>
          {widget.isPremium && (
            <Badge variant="secondary" className="text-xs">
              Premium
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          {widget.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {widget.size.width}×{widget.size.height}
          </Badge>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onAdd}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>

      {/* Click overlay */}
      <div
        className="absolute inset-0 bg-transparent cursor-pointer"
        onClick={onAdd}
      />
    </Card>
  );
} 