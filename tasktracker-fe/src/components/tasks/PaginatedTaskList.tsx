'use client';

/**
 * Paginated Task List Component
 * Combines pagination, lazy loading, and infinite scroll with performance optimization
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Task } from '@/lib/types/task';
import { useTaskPagination, TaskFilter, TaskSort } from '@/lib/hooks/useTaskPagination';
import { TaskLazyLoader } from './TaskLazyLoader';
import { usePerformanceMonitor } from '@/lib/hooks/usePerformanceMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Loader2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Settings,
  TrendingUp,
  Database,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginatedTaskListProps {
  boardId?: number;
  columnId?: number;
  className?: string;
  variant?: 'grid' | 'list' | 'compact';
  enableInfiniteScroll?: boolean;
  enablePrefetching?: boolean;
  enableVirtualization?: boolean;
  initialPageSize?: number;
  maxCachePages?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  showPerformanceMetrics?: boolean;
  onTaskSelect?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
}

interface TaskSkeleton {
  id: number;
  title: string;
  priority?: string;
  assignee?: string;
}

export function PaginatedTaskList({
  boardId,
  columnId,
  className = '',
  variant = 'list',
  enableInfiniteScroll = true,
  enablePrefetching = true,
  enableVirtualization = false,
  initialPageSize = 20,
  maxCachePages = 10,
  showFilters = true,
  showPagination = true,
  showPerformanceMetrics = false,
  onTaskSelect,
  onTaskUpdate,
  onTaskDelete
}: PaginatedTaskListProps) {
  
  // State for filters and sorting
  const [filters, setFilters] = useState<TaskFilter>({});
  const [sort, setSort] = useState<TaskSort>({ field: 'createdAt', direction: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>(variant);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Performance monitoring
  const { 
    metrics, 
    recordUpdate, 
    updateVirtualScrollMetrics, 
    isPerformanceGood, 
    hasWarnings,
    getOptimizationSuggestions 
  } = usePerformanceMonitor({
    componentName: 'PaginatedTaskList',
    enableMemoryMonitoring: true,
    enableRenderMonitoring: true,
    enableWarnings: true
  });

  // Task pagination hook
  const {
    tasks,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    loadMore,
    hasMore,
    refresh,
    updateTask,
    removeTask,
    addTask,
    pageSize,
    setPageSize,
    cacheSize,
    clearCache
  } = useTaskPagination({
    boardId,
    columnId,
    initialPageSize,
    enableInfiniteScroll,
    enablePrefetching,
    maxCachePages,
    filters: { ...filters, search: searchQuery },
    sort
  });

  // Refs for infinite scroll and intersection observer
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const virtualScrollRef = useRef<HTMLDivElement>(null);

  // Record component updates for performance monitoring
  useEffect(() => {
    recordUpdate();
  });

  // Update virtual scroll metrics
  useEffect(() => {
    if (enableVirtualization && tasks.length > 0) {
      const visibleItems = Math.min(tasks.length, Math.ceil(400 / 120)); // Estimate visible items
      updateVirtualScrollMetrics(visibleItems, tasks.length, 0);
    }
  }, [tasks.length, enableVirtualization, updateVirtualScrollMetrics]);

  // Infinite scroll intersection observer
  useEffect(() => {
    if (!enableInfiniteScroll || !loadMoreRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        });
      },
      { threshold: 0.1 }
    );
    
    observer.observe(loadMoreRef.current);
    
    return () => observer.disconnect();
  }, [enableInfiniteScroll, hasMore, isLoadingMore, loadMore]);

  // Handle search input changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((field: string) => {
    setSort(prev => ({
      field: field as any,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof TaskFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle task interactions
  const handleTaskClick = useCallback((task: Task) => {
    onTaskSelect?.(task);
  }, [onTaskSelect]);

  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    updateTask(updatedTask);
    onTaskUpdate?.(updatedTask);
  }, [updateTask, onTaskUpdate]);

  const handleTaskDelete = useCallback((taskId: number) => {
    removeTask(taskId);
    onTaskDelete?.(taskId);
  }, [removeTask, onTaskDelete]);

  // Render task item
  const renderTaskItem = useCallback((task: Task, index: number) => {
    const taskSummary: TaskSkeleton = {
      id: task.id,
      title: task.title,
      priority: task.priority,
      assignee: task.assignee
    };

    return (
      <div
        key={task.id}
        className={cn(
          "transition-all duration-200 hover:shadow-sm",
          viewMode === 'grid' && "min-h-[200px]",
          viewMode === 'list' && "min-h-[80px]",
          viewMode === 'compact' && "min-h-[40px]"
        )}
        onClick={() => handleTaskClick(task)}
      >
        <TaskLazyLoader
          taskId={task.id}
          taskSummary={taskSummary}
          variant={viewMode === 'compact' ? 'compact' : 'detailed'}
          enablePrefetch={enablePrefetching}
          className="cursor-pointer"
        />
      </div>
    );
  }, [viewMode, enablePrefetching, handleTaskClick]);

  // Render loading skeletons
  const renderLoadingSkeletons = useCallback((count: number = 5) => {
    return Array.from({ length: count }, (_, index) => (
      <div key={`skeleton-${index}`} className="space-y-3">
        {viewMode === 'compact' ? (
          <div className="flex items-center space-x-2 p-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    ));
  }, [viewMode]);

  // Render filters
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="space-y-4 border-b pb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick filters and controls */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            {/* Sort controls */}
            <Select value={sort.field} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange(sort.field)}
            >
              {sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            {/* Advanced filters toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* View mode controls */}
            <div className="flex border rounded">
              <Button
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-l-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>

            {/* Page size selector */}
            {!enableInfiniteScroll && (
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Advanced filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => handleFilterChange('status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.priority || ''} 
              onValueChange={(value) => handleFilterChange('priority', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Assignee..."
              value={filters.assigneeId?.toString() || ''}
              onChange={(e) => handleFilterChange('assigneeId', e.target.value ? parseInt(e.target.value) : undefined)}
            />

            <Button
              variant="outline"
              onClick={() => setFilters({})}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render performance metrics
  const renderPerformanceMetrics = () => {
    if (!showPerformanceMetrics) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Performance Metrics
            {!isPerformanceGood && (
              <Badge variant="destructive" className="ml-2 text-xs">
                Issues Detected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="font-medium">Frame Rate</div>
              <div className={cn(
                "text-lg font-bold",
                metrics.renderMetrics.frameRate < 30 ? "text-red-500" : "text-green-500"
              )}>
                {metrics.renderMetrics.frameRate}fps
              </div>
            </div>
            
            <div>
              <div className="font-medium">Memory Usage</div>
              <div className={cn(
                "text-lg font-bold",
                metrics.memoryUsage.percentage > 80 ? "text-red-500" : "text-green-500"
              )}>
                {Math.round(metrics.memoryUsage.percentage)}%
              </div>
            </div>
            
            <div>
              <div className="font-medium">Cache Size</div>
              <div className="text-lg font-bold flex items-center">
                <Database className="h-4 w-4 mr-1" />
                {cacheSize}
              </div>
            </div>
            
            <div>
              <div className="font-medium">Tasks Loaded</div>
              <div className="text-lg font-bold">
                {tasks.length}/{pagination.totalItems}
              </div>
            </div>
          </div>

          {hasWarnings && (
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Performance issues detected. Consider enabling virtualization or reducing page size.
              </AlertDescription>
            </Alert>
          )}

          {enableVirtualization && (
            <div className="mt-2 flex items-center text-xs text-green-600">
              <Zap className="h-3 w-3 mr-1" />
              Virtual scrolling enabled - optimized for {tasks.length} tasks
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render pagination controls
  const renderPagination = () => {
    if (!showPagination || enableInfiniteScroll) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
          {pagination.totalItems} tasks
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={!pagination.hasPreviousPage}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={!pagination.hasPreviousPage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!pagination.hasNextPage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={!pagination.hasNextPage}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className={cn("space-y-4", className)}>
      {renderPerformanceMetrics()}
      {renderFilters()}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Task list */}
      <div
        ref={listRef}
        className={cn(
          "space-y-3",
          viewMode === 'grid' && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-0",
          viewMode === 'compact' && "space-y-1"
        )}
      >
        {tasks.map((task, index) => renderTaskItem(task, index))}
        
        {isLoading && renderLoadingSkeletons()}
      </div>

      {/* Infinite scroll loading indicator */}
      {enableInfiniteScroll && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isLoadingMore ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading more tasks...</span>
            </div>
          ) : hasMore ? (
            <Button variant="outline" onClick={loadMore}>
              Load More Tasks
            </Button>
          ) : tasks.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              All {pagination.totalItems} tasks loaded
            </span>
          ) : null}
        </div>
      )}

      {renderPagination()}
    </div>
  );
}

export default PaginatedTaskList; 