/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { DashboardWidget, DashboardLayout, DashboardPreferences } from '@/lib/types/analytics';

interface DashboardContextType {
  // Widgets
  widgets: DashboardWidget[];
  setWidgets: (widgets: DashboardWidget[]) => void;
  addWidget: (widget: DashboardWidget) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  
  // Layout
  layout: DashboardLayout;
  setLayout: (layout: DashboardLayout) => void;
  
  // Preferences
  preferences: DashboardPreferences;
  setPreferences: (preferences: DashboardPreferences) => void;
  
  // Edit mode
  isEditMode: boolean;
  setIsEditMode: (editMode: boolean) => void;
  
  // Selected widget
  selectedWidget: DashboardWidget | null;
  setSelectedWidget: (widget: DashboardWidget | null) => void;
  
  // Drag and drop state
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  draggedWidget: DashboardWidget | null;
  setDraggedWidget: (widget: DashboardWidget | null) => void;
  
  // Dashboard management
  saveDashboard: () => Promise<void>;
  loadDashboard: (dashboardId: string) => Promise<void>;
  resetDashboard: () => void;
  
  // Widget library
  showWidgetLibrary: boolean;
  setShowWidgetLibrary: (show: boolean) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  // Widgets state
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  
  // Layout state
  const [layout, setLayout] = useState<DashboardLayout>({
    columns: 12,
    rowHeight: 150,
    margin: [10, 10],
    containerPadding: [10, 10],
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState<DashboardPreferences>({
    theme: 'auto',
    autoRefresh: true,
    refreshInterval: 300,
    showTooltips: true,
    animationsEnabled: true,
  });
  
  // UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<DashboardWidget | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Widget management functions
  const addWidget = useCallback((widget: DashboardWidget) => {
    setWidgets(prev => [...prev, widget]);
  }, []);

  const updateWidget = useCallback((id: string, updates: Partial<DashboardWidget>) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id 
          ? { ...widget, ...updates, updatedAt: new Date() }
          : widget
      )
    );
  }, []);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    // Clear selection if the removed widget was selected
    setSelectedWidget(prev => prev?.id === id ? null : prev);
  }, []);

  const duplicateWidget = useCallback((id: string) => {
    setWidgets(prev => {
      const widget = prev.find(w => w.id === id);
      if (!widget) return prev;
      
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
      
      return [...prev, newWidget];
    });
  }, []);

  // Dashboard management functions
  const saveDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would integrate with the dashboard service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Dashboard saved successfully');
    } catch (err) {
      setError('Failed to save dashboard');
      console.error('Save dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async (dashboardId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would integrate with the dashboard service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Dashboard loaded:', dashboardId);
      // setWidgets(loadedWidgets);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error('Load dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetDashboard = useCallback(() => {
    setWidgets([]);
    setSelectedWidget(null);
    setIsDragging(false);
    setDraggedWidget(null);
    setShowWidgetLibrary(false);
    setError(null);
  }, []);

  const value: DashboardContextType = {
    widgets,
    setWidgets,
    addWidget,
    updateWidget,
    removeWidget,
    duplicateWidget,
    layout,
    setLayout,
    preferences,
    setPreferences,
    isEditMode,
    setIsEditMode,
    selectedWidget,
    setSelectedWidget,
    isDragging,
    setIsDragging,
    draggedWidget,
    setDraggedWidget,
    saveDashboard,
    loadDashboard,
    resetDashboard,
    showWidgetLibrary,
    setShowWidgetLibrary,
    isLoading,
    setIsLoading,
    error,
    setError,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
} 