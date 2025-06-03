'use client';

/**
 * Kanban Performance Hook
 * Provides performance optimizations for large Kanban boards
 */

import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { Task } from '@/lib/types/task';
import { BoardColumn } from '@/lib/types/board';
import { KanbanFilter, KanbanSort } from '@/lib/types/kanban';

interface PerformanceMetrics {
  renderTime: number;
  filterTime: number;
  sortTime: number;
  totalTasks: number;
  visibleTasks: number;
}

interface VirtualScrollConfig {
  containerHeight: number;
  itemHeight: number;
  overscan: number;
}

interface OptimisticUpdate<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'move';
  data: T;
  timestamp: number;
  rollback?: () => void;
}

export function useKanbanPerformance(
  tasks: Task[],
  columns: BoardColumn[],
  filter: KanbanFilter,
  sort: KanbanSort,
  virtualScrollConfig?: VirtualScrollConfig
) {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    filterTime: 0,
    sortTime: 0,
    totalTasks: 0,
    visibleTasks: 0,
  });

  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate[]>([]);
  const lastRenderTime = useRef<number>(0);
  const filterCache = useRef<Map<string, Task[]>>(new Map());
  const sortCache = useRef<Map<string, Task[]>>(new Map());

  // Memoized filtered tasks with performance tracking
  const filteredTasks = useMemo(() => {
    const startTime = performance.now();
    
    // Create cache key for filtering
    const filterKey = JSON.stringify(filter);
    
    // Check cache first
    if (filterCache.current.has(filterKey)) {
      const cached = filterCache.current.get(filterKey)!;
      const filterTime = performance.now() - startTime;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        filterTime,
        totalTasks: tasks.length,
        visibleTasks: cached.length,
      }));
      
      return cached;
    }
    
    let filteredTasks = [...tasks];
    
    // Apply search filter
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (filter.status && filter.status.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        filter.status!.includes(task.status)
      );
    }
    
    // Apply priority filter
    if (filter.priority && filter.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        task.priority && filter.priority!.includes(task.priority)
      );
    }
    
    // Apply assignee filter
    if (filter.assignee && filter.assignee.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        task.assignedToName && filter.assignee!.includes(task.assignedToName)
      );
    }
    
    // Apply due date filter
    if (filter.dueDate) {
      const { from, to } = filter.dueDate;
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        
        if (from && taskDate < new Date(from)) return false;
        if (to && taskDate > new Date(to)) return false;
        
        return true;
      });
    }
    
    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        task.tags?.some(tag => filter.tags!.includes(tag))
      );
    }
    
    const filterTime = performance.now() - startTime;
    
    // Cache the result (limit cache size to prevent memory leaks)
    if (filterCache.current.size > 50) {
      const firstKey = filterCache.current.keys().next().value;
      if (firstKey) {
        filterCache.current.delete(firstKey);
      }
    }
    filterCache.current.set(filterKey, filteredTasks);
    
    setPerformanceMetrics(prev => ({
      ...prev,
      filterTime,
      totalTasks: tasks.length,
      visibleTasks: filteredTasks.length,
    }));
    
    return filteredTasks;
  }, [tasks, filter]);

  // Memoized sorted tasks with performance tracking
  const sortedTasks = useMemo(() => {
    const startTime = performance.now();
    
    // Create cache key for sorting
    const sortKey = `${JSON.stringify(sort)}_${filteredTasks.length}`;
    
    // Check cache first
    if (sortCache.current.has(sortKey)) {
      const cached = sortCache.current.get(sortKey)!;
      const sortTime = performance.now() - startTime;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        sortTime,
      }));
      
      return cached;
    }
    
    const sorted = [...filteredTasks].sort((a, b) => {
      const { field, direction } = sort;
      let aValue: string | number | Date;
      let bValue: string | number | Date;
      
      switch (field) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'priority':
          const priorityMap = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
          aValue = priorityMap[a.priority as keyof typeof priorityMap] || 0;
          bValue = priorityMap[b.priority as keyof typeof priorityMap] || 0;
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    const sortTime = performance.now() - startTime;
    
    // Cache the result (limit cache size to prevent memory leaks)
    if (sortCache.current.size > 50) {
      const firstKey = sortCache.current.keys().next().value;
      if (firstKey) {
        sortCache.current.delete(firstKey);
      }
    }
    sortCache.current.set(sortKey, sorted);
    
    setPerformanceMetrics(prev => ({
      ...prev,
      sortTime,
    }));
    
    return sorted;
  }, [filteredTasks, sort]);

  // Group tasks by column with memoization
  const tasksByColumn = useMemo(() => {
    const startTime = performance.now();
    
    const grouped: Record<number, Task[]> = {};
    
    // Initialize all columns with empty arrays
    columns.forEach(column => {
      grouped[column.id] = [];
    });

    // Group sorted tasks by their status mapped to columns
    sortedTasks.forEach(task => {
      const column = columns.find(col => {
        const mappedStatus = col.mappedStatus;
        const taskStatus = task.status;
        
        if (typeof mappedStatus === 'string' && typeof taskStatus === 'string') {
          return mappedStatus.toLowerCase() === taskStatus.toLowerCase();
        }
        
        return mappedStatus === taskStatus;
      });
      
      if (column) {
        grouped[column.id].push(task);
      } else {
        // Default to first column if no mapping found
        const firstColumn = columns[0];
        if (firstColumn) {
          grouped[firstColumn.id].push(task);
        }
      }
    });

    const renderTime = performance.now() - startTime;
    lastRenderTime.current = renderTime;
    
    setPerformanceMetrics(prev => ({
      ...prev,
      renderTime,
    }));

    return grouped;
  }, [sortedTasks, columns]);

  // Virtual scrolling calculations
  const getVirtualScrollData = useCallback((columnTasks: Task[], scrollTop: number = 0) => {
    if (!virtualScrollConfig) {
      return {
        visibleStartIndex: 0,
        visibleEndIndex: columnTasks.length - 1,
        visibleTasks: columnTasks,
        totalHeight: columnTasks.length * 100, // Default item height
        offsetY: 0,
      };
    }

    const { containerHeight, itemHeight, overscan } = virtualScrollConfig;
    
    const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleEndIndex = Math.min(
      columnTasks.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    const visibleTasks = columnTasks.slice(visibleStartIndex, visibleEndIndex + 1);
    const totalHeight = columnTasks.length * itemHeight;
    const offsetY = visibleStartIndex * itemHeight;

    return {
      visibleStartIndex,
      visibleEndIndex,
      visibleTasks,
      totalHeight,
      offsetY,
    };
  }, [virtualScrollConfig]);

  // Optimistic updates management
  const addOptimisticUpdate = useCallback((update: Omit<OptimisticUpdate, 'timestamp'>) => {
    const optimisticUpdate: OptimisticUpdate = {
      ...update,
      timestamp: Date.now(),
    };
    
    setOptimisticUpdates(prev => [...prev, optimisticUpdate]);
    
    // Auto-remove after 30 seconds (fallback)
    setTimeout(() => {
      setOptimisticUpdates(prev => prev.filter(u => u.id !== update.id));
    }, 30000);
  }, []);

  const removeOptimisticUpdate = useCallback((updateId: string) => {
    setOptimisticUpdates(prev => prev.filter(u => u.id !== updateId));
  }, []);

  const rollbackOptimisticUpdate = useCallback((updateId: string) => {
    const update = optimisticUpdates.find(u => u.id === updateId);
    if (update?.rollback) {
      update.rollback();
    }
    removeOptimisticUpdate(updateId);
  }, [optimisticUpdates, removeOptimisticUpdate]);

  // Performance monitoring
  const getPerformanceReport = useCallback(() => {
    return {
      ...performanceMetrics,
      lastRenderTime: lastRenderTime.current,
      cacheHitRate: {
        filter: filterCache.current.size,
        sort: sortCache.current.size,
      },
      optimisticUpdatesCount: optimisticUpdates.length,
    };
  }, [performanceMetrics, optimisticUpdates.length]);

  // Clear caches when needed
  const clearCaches = useCallback(() => {
    filterCache.current.clear();
    sortCache.current.clear();
  }, []);

  // Effect to clean up old optimistic updates
  useEffect(() => {
    const now = Date.now();
    const expiredUpdates = optimisticUpdates.filter(update => 
      now - update.timestamp > 30000 // 30 seconds
    );
    
    if (expiredUpdates.length > 0) {
      setOptimisticUpdates(prev => 
        prev.filter(update => now - update.timestamp <= 30000)
      );
    }
  }, [optimisticUpdates]);

  return {
    // Processed data
    filteredTasks,
    sortedTasks,
    tasksByColumn,
    
    // Virtual scrolling
    getVirtualScrollData,
    
    // Optimistic updates
    optimisticUpdates,
    addOptimisticUpdate,
    removeOptimisticUpdate,
    rollbackOptimisticUpdate,
    
    // Performance monitoring
    performanceMetrics,
    getPerformanceReport,
    clearCaches,
  };
} 