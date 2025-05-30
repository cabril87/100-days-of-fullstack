/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import { useState, useCallback, useEffect } from 'react';
import { DashboardWidget, DashboardLayout, DashboardPreferences } from '@/lib/types/analytics';

interface UseDashboardBuilderProps {
  dashboardId?: string;
  autoSave?: boolean;
  saveInterval?: number;
}

interface UseDashboardBuilderReturn {
  // Widgets
  widgets: DashboardWidget[];
  addWidget: (widgetType: string, position?: { x: number; y: number }) => void;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => void;
  removeWidget: (id: string) => void;
  duplicateWidget: (id: string) => void;
  moveWidget: (id: string, position: { x: number; y: number }) => void;
  resizeWidget: (id: string, size: { width: number; height: number }) => void;
  
  // Layout
  layout: DashboardLayout;
  updateLayout: (layout: Partial<DashboardLayout>) => void;
  resetLayout: () => void;
  optimizeLayout: () => void;
  
  // Preferences
  preferences: DashboardPreferences;
  updatePreferences: (preferences: Partial<DashboardPreferences>) => void;
  
  // Edit mode
  isEditMode: boolean;
  toggleEditMode: () => void;
  
  // Selection
  selectedWidgetId: string | null;
  selectWidget: (id: string | null) => void;
  
  // Persistence
  saveDashboard: () => Promise<void>;
  loadDashboard: (dashboardId: string) => Promise<void>;
  exportDashboard: () => string;
  importDashboard: (dashboardJson: string) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  
  // State
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
  lastSaved: Date | null;
}

interface DashboardState {
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  preferences: DashboardPreferences;
}

export function useDashboardBuilder({
  dashboardId,
  autoSave = false,
  saveInterval = 30000 // 30 seconds
}: UseDashboardBuilderProps = {}): UseDashboardBuilderReturn {
  
  // State
  const [currentState, setCurrentState] = useState<DashboardState>({
    widgets: [],
    layout: {
      columns: 12,
      rowHeight: 150,
      margin: [10, 10],
      containerPadding: [10, 10]
    },
    preferences: {
      theme: 'auto',
      autoRefresh: true,
      refreshInterval: 300,
      showTooltips: true,
      animationsEnabled: true
    }
  });
  
  const [history, setHistory] = useState<DashboardState[]>([currentState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Save state to history for undo/redo
  const saveToHistory = useCallback((newState: DashboardState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
    setHasUnsavedChanges(true);
  }, [historyIndex]);

  // Update state with history tracking
  const updateState = useCallback((updates: Partial<DashboardState>) => {
    const newState = { ...currentState, ...updates };
    setCurrentState(newState);
    saveToHistory(newState);
  }, [currentState, saveToHistory]);

  // Widget management
  const addWidget = useCallback((widgetType: string, position = { x: 0, y: 0 }) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: `New ${widgetType} Widget`,
      position,
      size: { width: 4, height: 3 },
      configuration: {},
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    updateState({
      widgets: [...currentState.widgets, newWidget]
    });
  }, [currentState.widgets, updateState]);

  const updateWidget = useCallback((id: string, updates: Partial<DashboardWidget>) => {
    updateState({
      widgets: currentState.widgets.map(widget =>
        widget.id === id
          ? { ...widget, ...updates, updatedAt: new Date() }
          : widget
      )
    });
  }, [currentState.widgets, updateState]);

  const removeWidget = useCallback((id: string) => {
    updateState({
      widgets: currentState.widgets.filter(widget => widget.id !== id)
    });
    
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
    }
  }, [currentState.widgets, updateState, selectedWidgetId]);

  const duplicateWidget = useCallback((id: string) => {
    const widget = currentState.widgets.find(w => w.id === id);
    if (!widget) return;

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

    updateState({
      widgets: [...currentState.widgets, newWidget]
    });
  }, [currentState.widgets, updateState]);

  const moveWidget = useCallback((id: string, position: { x: number; y: number }) => {
    updateWidget(id, { position });
  }, [updateWidget]);

  const resizeWidget = useCallback((id: string, size: { width: number; height: number }) => {
    updateWidget(id, { size });
  }, [updateWidget]);

  // Layout management
  const updateLayout = useCallback((layoutUpdates: Partial<DashboardLayout>) => {
    updateState({
      layout: { ...currentState.layout, ...layoutUpdates }
    });
  }, [currentState.layout, updateState]);

  const resetLayout = useCallback(() => {
    updateState({
      layout: {
        columns: 12,
        rowHeight: 150,
        margin: [10, 10],
        containerPadding: [10, 10]
      }
    });
  }, [updateState]);

  const optimizeLayout = useCallback(() => {
    // Simple layout optimization - arrange widgets in a grid
    const optimizedWidgets = currentState.widgets.map((widget, index) => {
      const row = Math.floor(index / 3);
      const col = (index % 3) * 4;
      
      return {
        ...widget,
        position: { x: col, y: row * 3 }
      };
    });

    updateState({ widgets: optimizedWidgets });
  }, [currentState.widgets, updateState]);

  // Preferences management
  const updatePreferences = useCallback((prefUpdates: Partial<DashboardPreferences>) => {
    updateState({
      preferences: { ...currentState.preferences, ...prefUpdates }
    });
  }, [currentState.preferences, updateState]);

  // Edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    if (isEditMode) {
      setSelectedWidgetId(null); // Clear selection when exiting edit mode
    }
  }, [isEditMode]);

  // Selection
  const selectWidget = useCallback((id: string | null) => {
    setSelectedWidgetId(id);
  }, []);

  // Persistence
  const saveDashboard = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    try {
      // This would integrate with the dashboard service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('Dashboard saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save dashboard';
      setError(errorMessage);
      console.error('Save dashboard error:', err);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const loadDashboard = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // This would integrate with the dashboard service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock loaded dashboard data
      const loadedState: DashboardState = {
        widgets: [],
        layout: currentState.layout,
        preferences: currentState.preferences
      };

      setCurrentState(loadedState);
      setHistory([loadedState]);
      setHistoryIndex(0);
      setHasUnsavedChanges(false);
      console.log('Dashboard loaded:', id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      console.error('Load dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentState]);

  const exportDashboard = useCallback(() => {
    return JSON.stringify(currentState, null, 2);
  }, [currentState]);

  const importDashboard = useCallback((dashboardJson: string) => {
    try {
      const importedState = JSON.parse(dashboardJson) as DashboardState;
      setCurrentState(importedState);
      saveToHistory(importedState);
      setHasUnsavedChanges(true);
    } catch (err) {
      setError('Invalid dashboard JSON format');
      console.error('Import dashboard error:', err);
    }
  }, [saveToHistory]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentState(history[newIndex]);
      setHasUnsavedChanges(true);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentState(history[newIndex]);
      setHasUnsavedChanges(true);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Auto-save
  useEffect(() => {
    if (!autoSave || !hasUnsavedChanges) return;

    const timeout = setTimeout(() => {
      saveDashboard();
    }, saveInterval);

    return () => clearTimeout(timeout);
  }, [autoSave, hasUnsavedChanges, saveInterval, saveDashboard]);

  // Load dashboard on mount
  useEffect(() => {
    if (dashboardId) {
      loadDashboard(dashboardId);
    }
  }, [dashboardId, loadDashboard]);

  return {
    widgets: currentState.widgets,
    addWidget,
    updateWidget,
    removeWidget,
    duplicateWidget,
    moveWidget,
    resizeWidget,
    layout: currentState.layout,
    updateLayout,
    resetLayout,
    optimizeLayout,
    preferences: currentState.preferences,
    updatePreferences,
    isEditMode,
    toggleEditMode,
    selectedWidgetId,
    selectWidget,
    saveDashboard,
    loadDashboard,
    exportDashboard,
    importDashboard,
    undo,
    redo,
    canUndo,
    canRedo,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    error,
    lastSaved
  };
} 