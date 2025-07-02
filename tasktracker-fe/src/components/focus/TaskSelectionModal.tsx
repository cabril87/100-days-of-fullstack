'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search,
  Target,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/helpers/utils/utils';
import { toast } from 'sonner';

// Enterprise types
import type {
  TaskItem,
  FocusSuggestion,
  CreateFocusSessionDTO
} from '@/lib/types/focus';
import type {
  TaskSelectionModalProps
} from '@/lib/types/focus-components';
import type { Task } from '@/lib/types/tasks';

// Enterprise services
import { focusService } from '@/lib/services/focusService';
import { taskService } from '@/lib/services/taskService';

/**
 * Task Selection Modal Component
 * Advanced task selection interface with search, filtering, and AI suggestions
 * Optimized for focus session workflow
 */
export default function TaskSelectionModal({
  open,
  onOpenChange,
  onTaskSelect,
  userId,
  className
}: TaskSelectionModalProps) {
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [suggestions, setSuggestions] = useState<FocusSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'all' | 'search'>('suggestions');

  // ============================================================================
  // DATA TRANSFORMATION - ENTERPRISE PATTERNS
  // ============================================================================

  /**
   * Convert Task (from taskService) to TaskItem (for focus system)
   * Following enterprise patterns for data transformation
   */
  const transformTaskToTaskItem = useCallback((task: Task): TaskItem => {
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      dueDate: task.dueDate,
      estimatedMinutes: task.estimatedTimeMinutes || 25,
      isCompleted: task.isCompleted || false,
      categoryName: task.categoryName || 'General',
      // Required properties for TaskItem interface
      status: task.status?.toString() || (task.isCompleted ? 'completed' : 'not_started'),
      createdAt: task.createdAt,
      userId: task.userId,
      progressPercentage: 0 // Default for focus sessions
    };
  }, []);

  // ============================================================================
  // DATA LOADING - REAL API INTEGRATION
  // ============================================================================

  const loadSuggestions = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🤖 TaskSelection: Loading focus suggestions from real API...');
      const taskSuggestions = await focusService.getFocusSuggestions();
      // Transform TaskItem[] to FocusSuggestion[] format
      const focusSuggestions: FocusSuggestion[] = taskSuggestions.map(task => ({
        task,
        reason: 'high_priority',
        score: 0.8,
        estimatedFocusTime: task.estimatedMinutes || 25
      }));
      setSuggestions(focusSuggestions);
      console.log('✅ TaskSelection: Real suggestions loaded');
    } catch (error) {
      console.error('❌ TaskSelection: Failed to load suggestions:', error);
      setError('Failed to load task suggestions');
      // Fallback to empty suggestions (no mock data)
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadAllTasks = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      console.log('📋 TaskSelection: Loading all tasks from real API...');
      
      // Use real taskService API - get recent tasks (includes all accessible tasks)
      const apiTasks = await taskService.getRecentTasks(50); // Get up to 50 tasks
      
      // DEBUG: Log what tasks are available for this user
      console.log('🔍 TaskSelection: Available tasks for user:', apiTasks);
      console.log('🔍 TaskSelection: Task IDs available:', apiTasks.map(t => `ID: ${t.id}, Title: "${t.title}"`));
      
      // Transform from Task[] to TaskItem[] with proper mapping
      const transformedTasks: TaskItem[] = apiTasks.map(transformTaskToTaskItem);
      
      setTasks(transformedTasks);
      console.log(`✅ TaskSelection: Loaded ${transformedTasks.length} real tasks from API`);
    } catch (error) {
      console.error('❌ TaskSelection: Failed to load tasks:', error);
      setError('Failed to load tasks');
      // Fallback to empty array (no mock data)
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, transformTaskToTaskItem]);

  // Load data when modal opens
  useEffect(() => {
    if (open && userId) {
      loadSuggestions();
      loadAllTasks();
    }
  }, [open, userId, loadSuggestions, loadAllTasks]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTaskSelect = useCallback((task: TaskItem) => {
    setSelectedTask(task);
    setDurationMinutes(task.estimatedMinutes || 25);
  }, []);

  const handleStartSession = useCallback(async () => {
    if (!selectedTask) return;
    
    setIsLoading(true);
    try {
      const createDto: CreateFocusSessionDTO = {
        taskId: selectedTask.id,
        durationMinutes,
        notes: sessionNotes.trim() || undefined,
        forceStart: true
      };
      
      await onTaskSelect(selectedTask, createDto);
      
      // Reset form
      setSelectedTask(null);
      setSessionNotes('');
      setDurationMinutes(25);
      onOpenChange(false);
      
      toast.success(`🎯 Starting focus session: ${selectedTask.title}`);
    } catch (error) {
      console.error('❌ TaskSelection: Failed to start session:', error);
      toast.error('Failed to start focus session');
    } finally {
      setIsLoading(false);
    }
  }, [selectedTask, durationMinutes, sessionNotes, onTaskSelect, onOpenChange]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }, []);

  const isTaskOverdue = useCallback((task: TaskItem): boolean => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  }, []);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTaskList = useCallback((taskList: TaskItem[]) => (
    <div className="space-y-2">
      {taskList.map((task) => (
        <button
          key={task.id}
          onClick={() => handleTaskSelect(task)}
          className={cn(
            "w-full p-4 rounded-lg border text-left transition-all duration-200",
            "hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            selectedTask?.id === task.id && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">
                  {task.title}
                </h4>
                {isTaskOverdue(task) && (
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
              </div>
              
              {task.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                  {task.priority}
                </Badge>
                
                {task.estimatedMinutes && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {task.estimatedMinutes}m
                  </Badge>
                )}
                
                {task.categoryName && (
                  <Badge variant="outline" className="text-xs">
                    {task.categoryName}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <Target className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </button>
      ))}
    </div>
  ), [handleTaskSelect, selectedTask, getPriorityColor, isTaskOverdue]);

  const renderSuggestions = useCallback(() => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <TrendingUp className="h-4 w-4" />
        <span>AI-powered focus recommendations</span>
      </div>
      
      {suggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No suggestions available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleTaskSelect(suggestion.task)}
              className={cn(
                "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md",
                selectedTask?.id === suggestion.task.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* ✅ AI SUGGESTION BADGE */}
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <Badge className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-300">
                      {suggestion.reason.replace('_', ' ').toUpperCase()} SUGGESTION
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Score: {Math.round(suggestion.score * 100)}%
                    </Badge>
                  </div>

                  {/* ✅ TASK INFORMATION */}
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {suggestion.task.title}
                    </h4>
                    {isTaskOverdue(suggestion.task) && (
                      <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  {suggestion.task.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {suggestion.task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={cn("text-xs", getPriorityColor(suggestion.task.priority))}>
                      {suggestion.task.priority}
                    </Badge>
                    
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {suggestion.estimatedFocusTime}m focus
                    </Badge>
                    
                    {suggestion.task.categoryName && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.task.categoryName}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <Target className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  ), [suggestions, selectedTask, handleTaskSelect, getPriorityColor, isTaskOverdue]);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Select Task for Focus Session
          </DialogTitle>
          <DialogDescription>
            Choose a task to focus on. AI suggestions help you pick the most productive options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === 'suggestions'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === 'all'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === 'search'
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              Search
            </button>
          </div>

          {/* Search Input (for search tab) */}
          {activeTab === 'search' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Task List */}
          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {activeTab === 'suggestions' && renderSuggestions()}
                {activeTab === 'all' && renderTaskList(tasks)}
                {activeTab === 'search' && renderTaskList(filteredTasks)}
              </>
            )}
          </ScrollArea>

          {/* Session Configuration */}
          {selectedTask && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Session Configuration</h4>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Selected: <span className="font-medium">{selectedTask.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    min={5}
                    max={180}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-end">
                  <div className="flex gap-1">
                    {[15, 25, 45, 60].map((duration) => (
                      <Button
                        key={duration}
                        variant={durationMinutes === duration ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDurationMinutes(duration)}
                        className="text-xs"
                      >
                        {duration}m
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Session Notes (Optional)
                </label>
                <Textarea
                  placeholder="Add any notes or goals for this focus session..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={2}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={!selectedTask || isLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isLoading ? 'Starting...' : 'Start Focus Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 

