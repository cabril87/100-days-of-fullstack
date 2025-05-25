'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Trash2,
  CheckCircle,
  Edit3,
  Archive,
  Tag,
  Calendar,
  AlertTriangle,
  Download,
  Upload,
  Copy,
  RefreshCw,
  Settings,
  Filter,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useTasks } from '@/lib/providers/TaskProvider';
import { Task, TaskStatus, TaskPriority } from '@/lib/types/task';
import { apiService } from '@/lib/services/apiService';
import { BatchOperation as BatchOperationType } from '@/lib/types/batch';

interface BatchOperationsProps {
  selectedTasks?: number[];
  onTaskSelectionChange?: (taskIds: number[]) => void;
  onOperationComplete?: () => void;
  compact?: boolean;
}

interface BatchOperation {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  action: (taskIds: number[], params?: any) => Promise<void>;
  requiresParams?: boolean;
  destructive?: boolean;
}

export default function BatchOperations({
  selectedTasks = [],
  onTaskSelectionChange,
  onOperationComplete,
  compact = false
}: BatchOperationsProps) {
  const { tasks, fetchTasks } = useTasks();
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>(selectedTasks);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [operationParams, setOperationParams] = useState<Record<string, any>>({});

  // Update selected tasks when prop changes
  useEffect(() => {
    setSelectedTaskIds(selectedTasks);
  }, [selectedTasks]);

  // Batch operations definitions
  const batchOperations: BatchOperation[] = [
    {
      id: 'complete',
      name: 'Mark as Complete',
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Mark selected tasks as completed',
      action: async (taskIds) => {
        await apiService.put('/v1/batch/tasks/status', {
          taskIds,
          status: 'completed'
        });
      }
    },
    {
      id: 'archive',
      name: 'Archive Tasks',
      icon: <Archive className="h-4 w-4" />,
      description: 'Archive selected tasks',
      action: async (taskIds) => {
        await apiService.put('/v1/batch/tasks/status', {
          taskIds,
          status: 'archived'
        });
      }
    },
    {
      id: 'delete',
      name: 'Delete Tasks',
      icon: <Trash2 className="h-4 w-4" />,
      description: 'Permanently delete selected tasks',
      destructive: true,
      action: async (taskIds) => {
        await apiService.delete(`/v1/batch/tasks?ids=${taskIds.join(',')}`);
      }
    },
    {
      id: 'updatePriority',
      name: 'Update Priority',
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Change priority for selected tasks',
      requiresParams: true,
      action: async (taskIds, params) => {
        await apiService.put('/v1/batch/tasks', 
          taskIds.map(id => ({
            id,
            priority: params.priority
          }))
        );
      }
    },
    {
      id: 'updateCategory',
      name: 'Update Category',
      icon: <Tag className="h-4 w-4" />,
      description: 'Change category for selected tasks',
      requiresParams: true,
      action: async (taskIds, params) => {
        await apiService.put('/v1/batch/tasks',
          taskIds.map(id => ({
            id,
            categoryId: params.categoryId
          }))
        );
      }
    },
    {
      id: 'updateDueDate',
      name: 'Update Due Date',
      icon: <Calendar className="h-4 w-4" />,
      description: 'Change due date for selected tasks',
      requiresParams: true,
      action: async (taskIds, params) => {
        await apiService.put('/v1/batch/tasks',
          taskIds.map(id => ({
            id,
            dueDate: params.dueDate
          }))
        );
      }
    },
    {
      id: 'duplicate',
      name: 'Duplicate Tasks',
      icon: <Copy className="h-4 w-4" />,
      description: 'Create copies of selected tasks',
      action: async (taskIds) => {
        const tasksToClone = tasks.filter(t => taskIds.includes(t.id));
        for (const task of tasksToClone) {
          await apiService.post('/v1/taskitems', {
            ...task,
            id: undefined,
            title: `${task.title} (Copy)`,
            status: 'todo',
            createdAt: undefined,
            updatedAt: undefined
          });
        }
      }
    },
    {
      id: 'export',
      name: 'Export Tasks',
      icon: <Download className="h-4 w-4" />,
      description: 'Export selected tasks to JSON',
      action: async (taskIds) => {
        const selectedTasksData = tasks.filter(t => taskIds.includes(t.id));
        const dataStr = JSON.stringify(selectedTasksData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    }
  ];

  // Handle task selection
  const handleTaskSelection = (taskId: number, checked: boolean) => {
    const newSelection = checked
      ? [...selectedTaskIds, taskId]
      : selectedTaskIds.filter(id => id !== taskId);
    
    setSelectedTaskIds(newSelection);
    onTaskSelectionChange?.(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? tasks.map(t => t.id) : [];
    setSelectedTaskIds(newSelection);
    onTaskSelectionChange?.(newSelection);
  };

  // Execute batch operation
  const executeBatchOperation = async (operation: BatchOperation) => {
    if (selectedTaskIds.length === 0) {
      setError('No tasks selected');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      // If operation requires parameters, validate them
      if (operation.requiresParams && !operationParams[operation.id]) {
        setError(`Please select parameters for ${operation.name}`);
        setIsProcessing(false);
        return;
      }

      // Execute the operation
      await operation.action(selectedTaskIds, operationParams[operation.id]);
      
      setProgress(100);
      setSuccess(`Successfully ${operation.name.toLowerCase()} for ${selectedTaskIds.length} tasks`);
      
      // Refresh tasks and clear selection
      await fetchTasks();
      setSelectedTaskIds([]);
      onTaskSelectionChange?.([]);
      onOperationComplete?.();
      
    } catch (error) {
      console.error('Batch operation error:', error);
      setError(`Failed to ${operation.name.toLowerCase()}. Please try again.`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setSuccess(null);
      }, 3000);
    }
  };

  // Update operation parameters
  const updateOperationParam = (operationId: string, key: string, value: any) => {
    setOperationParams(prev => ({
      ...prev,
      [operationId]: {
        ...prev[operationId],
        [key]: value
      }
    }));
  };

  // If compact mode, render a streamlined version
  if (compact) {
    return (
      <TooltipProvider>
        <div className="space-y-3">
          {/* Quick Actions Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">{selectedTaskIds.length} tasks selected</span>
              <div className="h-4 w-px bg-gray-300"></div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => executeBatchOperation(batchOperations.find(op => op.id === 'complete')!)}
                    disabled={isProcessing || selectedTaskIds.length === 0}
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark selected tasks as completed</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => executeBatchOperation(batchOperations.find(op => op.id === 'archive')!)}
                    disabled={isProcessing || selectedTaskIds.length === 0}
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Archive className="h-3 w-3 mr-1" />
                    Archive
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Archive selected tasks</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => executeBatchOperation(batchOperations.find(op => op.id === 'delete')!)}
                    disabled={isProcessing || selectedTaskIds.length === 0}
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Permanently delete selected tasks</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => executeBatchOperation(batchOperations.find(op => op.id === 'export')!)}
                    disabled={isProcessing || selectedTaskIds.length === 0}
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export selected tasks to JSON file</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => executeBatchOperation(batchOperations.find(op => op.id === 'duplicate')!)}
                    disabled={isProcessing || selectedTaskIds.length === 0}
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create copies of selected tasks</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Advanced Tasks Page Link */}
              <div className="h-4 w-px bg-gray-300 mx-1"></div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/tasks/advanced">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-xs bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Advanced
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go to Advanced Tasks Page with more features</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Advanced Operations (Open by default) */}
          <details className="group" open>
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
              <span>Advanced Operations</span>
              <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </summary>
            
            <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Priority Update */}
                <div className="flex items-center gap-2">
                  <Select
                    value={operationParams['updatePriority']?.priority || ''}
                    onValueChange={(value) => updateOperationParam('updatePriority', 'priority', value)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => executeBatchOperation(batchOperations.find(op => op.id === 'updatePriority')!)}
                        disabled={isProcessing || selectedTaskIds.length === 0 || !operationParams['updatePriority']?.priority}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Update priority for selected tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Due Date Update */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="h-7 px-2 text-xs border rounded-md flex-1"
                    value={operationParams['updateDueDate']?.dueDate || ''}
                    onChange={(e) => updateOperationParam('updateDueDate', 'dueDate', e.target.value)}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => executeBatchOperation(batchOperations.find(op => op.id === 'updateDueDate')!)}
                        disabled={isProcessing || selectedTaskIds.length === 0 || !operationParams['updateDueDate']?.dueDate}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Update due date for selected tasks</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </details>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 py-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <AlertDescription className="text-xs text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        </div>
      </TooltipProvider>
    );
  }

  // Original full layout for non-compact mode
  return (
    <div className="space-y-6">
      {/* Task Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Task Selection
          </CardTitle>
          <CardDescription>
            Select tasks to perform batch operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Select All Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedTaskIds.length === tasks.length && tasks.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({tasks.length} tasks)
              </label>
              {selectedTaskIds.length > 0 && (
                <Badge variant="secondary">
                  {selectedTaskIds.length} selected
                </Badge>
              )}
            </div>

            <Separator />

            {/* Task List with Selection */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    checked={selectedTaskIds.includes(task.id)}
                    onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Badge variant="outline">
                        {task.status}
                      </Badge>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: task.priority === 'high' ? '#ef4444' : 
                                      task.priority === 'medium' ? '#f59e0b' : '#10b981' 
                        }}
                      >
                        {task.priority || 'medium'}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-xs">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No tasks available
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Batch Operations
          </CardTitle>
          <CardDescription>
            Perform actions on selected tasks ({selectedTaskIds.length} selected)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Operation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchOperations.map(operation => (
              <div
                key={operation.id}
                className={`border rounded-lg p-4 space-y-3 ${operation.destructive ? 'border-red-200' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-2">
                  {operation.icon}
                  <h4 className="font-medium">{operation.name}</h4>
                </div>
                <p className="text-sm text-gray-500">{operation.description}</p>

                {/* Operation Parameters */}
                {operation.requiresParams && (
                  <div className="space-y-2">
                    {operation.id === 'updatePriority' && (
                      <Select
                        value={operationParams[operation.id]?.priority || ''}
                        onValueChange={(value) => updateOperationParam(operation.id, 'priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {operation.id === 'updateCategory' && (
                      <Select
                        value={operationParams[operation.id]?.categoryId || ''}
                        onValueChange={(value) => updateOperationParam(operation.id, 'categoryId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Work</SelectItem>
                          <SelectItem value="2">Personal</SelectItem>
                          <SelectItem value="3">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {operation.id === 'updateDueDate' && (
                      <input
                        type="date"
                        className="w-full p-2 border rounded-md"
                        value={operationParams[operation.id]?.dueDate || ''}
                        onChange={(e) => updateOperationParam(operation.id, 'dueDate', e.target.value)}
                      />
                    )}
                  </div>
                )}

                <Button
                  onClick={() => executeBatchOperation(operation)}
                  disabled={isProcessing || selectedTaskIds.length === 0}
                  variant={operation.destructive ? 'destructive' : 'default'}
                  size="sm"
                  className="w-full"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    operation.icon
                  )}
                  {operation.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing batch operation...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Batch Operation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recent Operations
          </CardTitle>
          <CardDescription>
            History of recent batch operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Operation history will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 