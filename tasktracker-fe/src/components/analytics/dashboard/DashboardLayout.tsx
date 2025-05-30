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
  useSortable,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Settings,
  Trash2,
  Move,
  Maximize2,
  Minimize2,
  Copy,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardWidget } from '@/lib/types/analytics';

// Import chart components
import { ChartRenderer } from '../charts/ChartRenderer';
import { TaskTrendChart } from '../charts/TaskTrendChart';
import { ProductivityHeatmap } from '../charts/ProductivityHeatmap';
import { FamilyComparisonChart } from '../charts/FamilyComparisonChart';
import { CategoryPieChart } from '../charts/CategoryPieChart';
import { TimelineChart } from '../charts/TimelineChart';
import { RadarChart } from '../charts/RadarChart';

interface DashboardLayoutProps {
  widgets: DashboardWidget[];
  isEditing: boolean;
  onUpdateWidget: (widgetId: string, updates: Partial<DashboardWidget>) => void;
  onRemoveWidget: (widgetId: string) => void;
  onSelectWidget: (widget: DashboardWidget) => void;
  className?: string;
}

export function DashboardLayout({
  widgets,
  isEditing,
  onUpdateWidget,
  onRemoveWidget,
  onSelectWidget,
  className
}: DashboardLayoutProps) {
  const [refreshingWidgets, setRefreshingWidgets] = useState<Set<string>>(new Set());

  const handleRefreshWidget = async (widgetId: string) => {
    setRefreshingWidgets(prev => new Set(prev).add(widgetId));
    
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshingWidgets(prev => {
      const newSet = new Set(prev);
      newSet.delete(widgetId);
      return newSet;
    });
  };

  const handleDuplicateWidget = (widget: DashboardWidget) => {
    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (Copy)`,
      position: {
        x: widget.position.x + 1,
        y: widget.position.y + 1
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // This would need to be passed up to the parent component
    console.log('Duplicating widget:', newWidget);
  };

  return (
    <div className={cn('p-4', className)}>
      <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-12 gap-4 auto-rows-min">
          {widgets.map(widget => (
            <DashboardWidgetComponent
              key={widget.id}
              widget={widget}
              isEditing={isEditing}
              isRefreshing={refreshingWidgets.has(widget.id)}
              onUpdate={(updates) => onUpdateWidget(widget.id, updates)}
              onRemove={() => onRemoveWidget(widget.id)}
              onSelect={() => onSelectWidget(widget)}
              onRefresh={() => handleRefreshWidget(widget.id)}
              onDuplicate={() => handleDuplicateWidget(widget)}
            />
          ))}
        </div>
      </SortableContext>

      {widgets.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-lg font-medium mb-2">No widgets added yet</div>
          <div className="text-sm">
            {isEditing 
              ? "Click 'Add Widget' to start building your dashboard"
              : "Switch to edit mode to add widgets"
            }
          </div>
        </div>
      )}
    </div>
  );
}

interface DashboardWidgetComponentProps {
  widget: DashboardWidget;
  isEditing: boolean;
  isRefreshing: boolean;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
  onRemove: () => void;
  onSelect: () => void;
  onRefresh: () => void;
  onDuplicate: () => void;
}

function DashboardWidgetComponent({
  widget,
  isEditing,
  isRefreshing,
  onUpdate,
  onRemove,
  onSelect,
  onRefresh,
  onDuplicate
}: DashboardWidgetComponentProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: widget.id,
    disabled: !isEditing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const getWidgetContent = () => {
    const commonProps = {
      data: [], // This would come from the widget configuration
      isLoading: isRefreshing,
      className: "h-full"
    };

    switch (widget.type) {
      case 'task-trend-chart':
        return <TaskTrendChart {...commonProps} />;
      case 'productivity-heatmap':
        return <ProductivityHeatmap {...commonProps} />;
      case 'family-comparison-chart':
        return <FamilyComparisonChart {...commonProps} />;
      case 'category-pie-chart':
        return <CategoryPieChart {...commonProps} />;
      case 'timeline-chart':
        return <TimelineChart {...commonProps} />;
      case 'radar-chart':
        return <RadarChart {...commonProps} />;
      default:
        return (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-medium">{widget.title}</div>
              <div className="text-sm">Widget type: {widget.type}</div>
            </div>
          </div>
        );
    }
  };

  const gridColumnSpan = isMaximized ? 12 : Math.min(widget.size.width, 12);
  const gridRowSpan = isMaximized ? 'auto' : widget.size.height;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        `col-span-${gridColumnSpan}`,
        isDragging && 'opacity-50 z-50',
        isMaximized && 'fixed inset-4 z-40'
      )}
      {...attributes}
    >
      <Card className={cn(
        'h-full transition-shadow',
        isEditing && 'hover:shadow-md border-dashed',
        isDragging && 'shadow-lg',
        isMaximized && 'h-[calc(100vh-2rem)]'
      )}>
        <CardHeader className="pb-2 flex-row items-start justify-between space-y-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              {widget.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {!widget.isActive && (
                <Badge variant="secondary" className="text-xs">
                  Inactive
                </Badge>
              )}
              {isRefreshing && (
                <Badge variant="outline" className="text-xs">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Refreshing
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMaximize}
                className="h-6 w-6 p-0"
              >
                {isMaximized ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </DropdownMenuItem>
                
                {isEditing && (
                  <>
                    <DropdownMenuItem onClick={onSelect}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={onRemove}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isEditing && (
              <div
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1"
              >
                <Move className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 h-[calc(100%-4rem)] overflow-hidden">
          {getWidgetContent()}
        </CardContent>
      </Card>

      {/* Maximized overlay */}
      {isMaximized && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleMaximize}
        />
      )}
    </div>
  );
} 