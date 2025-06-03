'use client';

/**
 * Task Lazy Loader Component
 * Loads task details on demand with skeleton states and background prefetching
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Clock, 
  User, 
  Calendar, 
  AlertCircle, 
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskLazyLoaderProps {
  taskId: number;
  taskSummary?: Partial<Task>; // Basic task info for immediate display
  expanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
  enablePrefetch?: boolean;
  className?: string;
  variant?: 'compact' | 'detailed' | 'card';
}

interface TaskDetailCache {
  [taskId: number]: {
    data: Task;
    timestamp: number;
    isLoading: boolean;
  };
}

// Global cache for task details (shared across components)
const taskDetailCache: TaskDetailCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function TaskLazyLoader({
  taskId,
  taskSummary,
  expanded = false,
  onToggleExpanded,
  enablePrefetch = true,
  className = '',
  variant = 'detailed'
}: TaskLazyLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [taskDetails, setTaskDetails] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const observerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);

  // Check cache for task details
  const getCachedTask = useCallback((id: number): Task | null => {
    const cached = taskDetailCache[id];
    if (!cached) return null;
    
    // Check if cache is stale
    const isStale = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isStale) {
      delete taskDetailCache[id];
      return null;
    }
    
    return cached.data;
  }, []);

  // Load task details
  const loadTaskDetails = useCallback(async (id: number, force: boolean = false) => {
    // Check cache first unless forced
    if (!force) {
      const cached = getCachedTask(id);
      if (cached) {
        setTaskDetails(cached);
        return cached;
      }
    }
    
    // Prevent duplicate requests
    if (taskDetailCache[id]?.isLoading) {
      return null;
    }
    
    taskDetailCache[id] = {
      ...taskDetailCache[id],
      isLoading: true
    } as any;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await taskService.getTaskById(id);
      
      if (response.data) {
        const task = response.data;
        
        // Cache the result
        taskDetailCache[id] = {
          data: task,
          timestamp: Date.now(),
          isLoading: false
        };
        
        setTaskDetails(task);
        return task;
      } else {
        throw new Error(response.error || 'Failed to load task details');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load task details';
      setError(errorMsg);
      console.error('Failed to load task details:', err);
      
      // Mark loading as complete in cache
      if (taskDetailCache[id]) {
        taskDetailCache[id].isLoading = false;
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getCachedTask]);

  // Handle expand/collapse
  const handleToggleExpanded = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggleExpanded?.(newExpanded);
    
    // Load details when expanding
    if (newExpanded && !taskDetails && !hasLoadedRef.current) {
      loadTaskDetails(taskId);
      hasLoadedRef.current = true;
    }
  }, [isExpanded, taskDetails, taskId, loadTaskDetails, onToggleExpanded]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!enablePrefetch || !observerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoadedRef.current && !taskDetails) {
            // Load task details when component comes into view
            loadTaskDetails(taskId);
            hasLoadedRef.current = true;
          }
        });
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before component is visible
        threshold: 0.1
      }
    );
    
    observer.observe(observerRef.current);
    
    return () => observer.disconnect();
  }, [taskId, enablePrefetch, taskDetails, loadTaskDetails]);

  // Load on mount if expanded
  useEffect(() => {
    if (isExpanded && !taskDetails && !hasLoadedRef.current) {
      loadTaskDetails(taskId);
      hasLoadedRef.current = true;
    }
  }, [isExpanded, taskDetails, taskId, loadTaskDetails]);

  // Get display data (use cache or summary)
  const displayData = taskDetails || taskSummary;

  // Render skeleton for loading state
  const renderSkeleton = () => {
    if (variant === 'compact') {
      return (
        <div className="flex items-center space-x-2 p-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      );
    }
    
    return (
      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render compact view
  const renderCompact = () => {
    if (!displayData) return renderSkeleton();
    
    return (
      <div className={cn(
        "flex items-center space-x-2 p-2 hover:bg-accent/50 rounded transition-colors",
        className
      )}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleToggleExpanded}
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
        
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">
            {displayData.title}
          </span>
        </div>
        
        {displayData.priority && (
          <Badge variant="secondary" className="text-xs">
            {displayData.priority}
          </Badge>
        )}
        
        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>
    );
  };

  // Render detailed view
  const renderDetailed = () => {
    if (!displayData) return renderSkeleton();
    
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {displayData.title}
                </h3>
                {displayData.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {displayData.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-2">
                {displayData.priority && (
                  <Badge 
                    variant={
                      displayData.priority === 'High' ? 'destructive' :
                      displayData.priority === 'Medium' ? 'default' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {displayData.priority}
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleToggleExpanded}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Basic Info */}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              {displayData.assignee && (
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{displayData.assignee}</span>
                </div>
              )}
              
              {displayData.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(displayData.dueDate), 'MMM dd')}</span>
                </div>
              )}
              
              {displayData.estimatedHours && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{displayData.estimatedHours}h</span>
                </div>
              )}
            </div>
            
            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t pt-3 space-y-2">
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : taskDetails ? (
                  <div className="space-y-2 text-xs">
                    {taskDetails.category && (
                      <div>
                        <span className="font-medium">Category:</span> {taskDetails.category}
                      </div>
                    )}
                    
                    {taskDetails.tags && taskDetails.tags.length > 0 && (
                      <div>
                        <span className="font-medium">Tags:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {taskDetails.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {taskDetails.createdAt && (
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {format(new Date(taskDetails.createdAt), 'MMM dd, yyyy')}
                      </div>
                    )}
                    
                    {taskDetails.updatedAt && (
                      <div>
                        <span className="font-medium">Updated:</span>{' '}
                        {format(new Date(taskDetails.updatedAt), 'MMM dd, yyyy')}
                      </div>
                    )}
                  </div>
                ) : error ? (
                  <div className="flex items-center space-x-2 text-red-500 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => loadTaskDetails(taskId, true)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render card view
  const renderCard = () => {
    return (
      <div ref={observerRef} className={cn("w-full", className)}>
        {variant === 'compact' ? renderCompact() : renderDetailed()}
      </div>
    );
  };

  return renderCard();
}

// Utility function to clear task cache
export const clearTaskDetailCache = () => {
  Object.keys(taskDetailCache).forEach(key => {
    delete taskDetailCache[parseInt(key)];
  });
};

// Utility function to update task in cache
export const updateTaskInCache = (taskId: number, updatedTask: Task) => {
  if (taskDetailCache[taskId]) {
    taskDetailCache[taskId] = {
      data: updatedTask,
      timestamp: Date.now(),
      isLoading: false
    };
  }
};

// Utility function to remove task from cache
export const removeTaskFromCache = (taskId: number) => {
  delete taskDetailCache[taskId];
};

export default TaskLazyLoader; 