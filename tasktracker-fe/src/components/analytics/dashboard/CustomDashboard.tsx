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
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Settings, Eye, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardWidget, WidgetConfig } from '@/lib/types/analytics';
import { WidgetLibrary } from '@/components/analytics/dashboard/WidgetLibrary';
import { DashboardLayout } from '@/components/analytics/dashboard/DashboardLayout';
import { WidgetConfig as WidgetConfigComponent } from '@/components/analytics/dashboard/WidgetConfig';

interface CustomDashboardProps {
  dashboardId?: string;
  isEditing?: boolean;
  onSave?: (widgets: DashboardWidget[]) => void;
  className?: string;
}

interface DraggedItem {
  id: string;
  type: string;
  data: any;
}

export function CustomDashboard({
  dashboardId,
  isEditing = false,
  onSave,
  className
}: CustomDashboardProps) {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [previewMode, setPreviewMode] = useState(!isEditing);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (dashboardId) {
      // Load dashboard configuration
      loadDashboard(dashboardId);
    }
  }, [dashboardId]);

  const loadDashboard = async (id: string) => {
    try {
      // Load dashboard widgets from API
      // This would integrate with your dashboard service
      console.log('Loading dashboard:', id);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    if (active.data.current) {
      setDraggedItem(active.data.current as DraggedItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    // Handle dropping widget from library
    if (active.data.current?.type === 'library-widget') {
      const newWidget: DashboardWidget = {
        id: `widget-${Date.now()}`,
        type: active.data.current.widgetType,
        title: active.data.current.title,
        position: { x: 0, y: 0 },
        size: { width: 4, height: 3 },
        configuration: active.data.current.defaultConfig || {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setWidgets(prev => [...prev, newWidget]);
    }
    // Handle reordering existing widgets
    else {
      const oldIndex = widgets.findIndex(widget => widget.id === active.id);
      const newIndex = widgets.findIndex(widget => widget.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        setWidgets(arrayMove(widgets, oldIndex, newIndex));
      }
    }

    setActiveId(null);
    setDraggedItem(null);
  };

  const handleAddWidget = (widgetType: string) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: `New ${widgetType} Widget`,
      position: { x: 0, y: 0 },
      size: { width: 4, height: 3 },
      configuration: {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setWidgets(prev => [...prev, newWidget]);
    setShowWidgetLibrary(false);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId 
          ? { ...widget, ...updates, updatedAt: new Date() }
          : widget
      )
    );
  };

  const handleSave = () => {
    if (onSave) {
      onSave(widgets);
    }
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Dashboard Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Custom Dashboard</h2>
          <Badge variant={previewMode ? "default" : "secondary"}>
            {previewMode ? "Preview" : "Edit"} Mode
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {!previewMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetLibrary(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Widget
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          )}
          
          <Button variant="outline" size="sm" onClick={togglePreviewMode}>
            {previewMode ? (
              <>
                <Settings className="h-4 w-4 mr-1" />
                Edit
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <DashboardLayout
            widgets={widgets}
            isEditing={!previewMode}
            onUpdateWidget={handleUpdateWidget}
            onRemoveWidget={handleRemoveWidget}
            onSelectWidget={setSelectedWidget}
          />
          
          <DragOverlay>
            {activeId && draggedItem ? (
              <Card className="w-64 h-32 opacity-80">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm">
                    {draggedItem.type === 'library-widget' 
                      ? draggedItem.data?.title || 'New Widget'
                      : widgets.find(w => w.id === activeId)?.title || 'Widget'
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="h-16 bg-muted rounded flex items-center justify-center">
                    Drag to position
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <WidgetLibrary
          open={showWidgetLibrary}
          onOpenChange={setShowWidgetLibrary}
          onAddWidget={handleAddWidget}
        />
      )}

      {/* Widget Configuration Panel */}
      {selectedWidget && !previewMode && (
        <WidgetConfigComponent
          widget={selectedWidget}
          open={!!selectedWidget}
          onOpenChange={(open: boolean) => !open && setSelectedWidget(null)}
          onUpdateWidget={(updates: Partial<DashboardWidget>) => 
            handleUpdateWidget(selectedWidget.id, updates)
          }
        />
      )}
    </div>
  );
} 