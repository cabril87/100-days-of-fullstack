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

import React, { useState, useEffect, useMemo } from 'react';
import { TaskItemStatus, Task, UpdateTaskDTO, TaskPriority, TaskItemResponseDTO, TaskApiResponseType, FlexibleApiResponse } from '../../lib/types/task';
import { taskService } from '../../lib/services/taskService';
import { apiClient } from '../../lib/config/api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Target,
  Calendar,
  Star,
  Tag,
  ArrowRight,
  Loader2,
  Minus,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils/utils';
import { format } from 'date-fns';
import { CreateTaskModal } from './CreateTaskModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { Skeleton } from '../ui/skeleton';

interface QuestSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
  defaultStatus?: TaskItemStatus;
  boardId: number;
}

export const QuestSelectionModal: React.FC<QuestSelectionModalProps> = ({
  open,
  onClose,
  onTaskCreated,
  defaultStatus = TaskItemStatus.Pending,
  boardId
}) => {
  const [mode, setMode] = useState<'selection' | 'create'>('selection');
  const [tasks, setTasks] = useState<TaskItemResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unassigned' | 'assigned'>('unassigned');
  const [filterPriority, setFilterPriority] = useState<'all' | TaskPriority>('all');

  // Load tasks when modal opens
  useEffect(() => {
    if (open && mode === 'selection') {
      loadTasks();
    }
  }, [open, mode]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      // Get tasks directly from API without conversion to preserve boardId
      const result = await apiClient.get<TaskApiResponseType>(`/v1/taskitems?pageSize=100`);
      
      let apiTasks: TaskItemResponseDTO[] = [];
      
      if (Array.isArray(result)) {
        // Direct array response (unwrapped) - cast to unknown first then to our type
        apiTasks = result as unknown as TaskItemResponseDTO[];
      } else if (result && typeof result === 'object') {
        // Check for wrapped response patterns
        const flexibleResponse = result as FlexibleApiResponse;
        
        if ('data' in result && Array.isArray(result.data)) {
          apiTasks = result.data as unknown as TaskItemResponseDTO[];
        } else if (flexibleResponse.items && Array.isArray(flexibleResponse.items)) {
          apiTasks = flexibleResponse.items as unknown as TaskItemResponseDTO[];
        } else if (flexibleResponse.tasks && Array.isArray(flexibleResponse.tasks)) {
          apiTasks = flexibleResponse.tasks as unknown as TaskItemResponseDTO[];
        }
      }
      
      // Convert API response to our expected format
      const convertedTasks: TaskItemResponseDTO[] = apiTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status || 'NotStarted',
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        categoryId: task.categoryId,
        categoryName: task.categoryName,
        userId: task.userId,
        tags: task.tags,
        estimatedMinutes: task.estimatedMinutes,
        actualMinutes: task.actualMinutes,
        pointsValue: task.pointsValue,
        boardId: task.boardId, // This is the key property we need!
        assignedToUserId: task.assignedToUserId,
        assignedToUserName: task.assignedToUserName
      }));
      
      setTasks(convertedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter (board assignment)
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'unassigned' && !task.boardId) ||
        (filterStatus === 'assigned' && task.boardId);

      // Priority filter
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const handleAssignTaskToBoard = async (task: TaskItemResponseDTO) => {
    try {
      setAssigningTaskId(task.id);
      
      // Update the existing task to assign it to the board
      // This prevents duplication by modifying the existing task rather than creating a new one
      const updateData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        pointsValue: task.pointsValue || 0,
        categoryId: task.categoryId,
        estimatedTimeMinutes: task.estimatedMinutes,
        assignedToUserId: task.assignedToUserId,
        version: 1
      };

      // Use the backend's task update endpoint to assign to board
      await taskService.updateTask(task.id, {
        ...updateData,
        boardId: boardId,
        status: defaultStatus
      } as UpdateTaskDTO & { boardId: number; status: TaskItemStatus }); // Type assertion for board-specific fields
      
      toast.success('🎯 Quest assigned to board!', {
        description: `"${task.title}" has been added to your board`,
      });

      // Refresh tasks list to show updated assignment status
      await loadTasks();
      onTaskCreated();
    } catch (error) {
      console.error('Error assigning task to board:', error);
      toast.error('Failed to assign quest to board');
    } finally {
      setAssigningTaskId(null);
    }
  };

  const handleUnassignTaskFromBoard = async (task: TaskItemResponseDTO) => {
    try {
      setAssigningTaskId(task.id);
      
      const updateData = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        pointsValue: task.pointsValue || 0,
        categoryId: task.categoryId,
        estimatedTimeMinutes: task.estimatedMinutes,
        assignedToUserId: task.assignedToUserId,
        version: 1
      };

      // Remove board assignment
      await taskService.updateTask(task.id, {
        ...updateData,
        boardId: undefined // Remove board assignment
      } as UpdateTaskDTO & { boardId?: number });
      
      toast.success('📋 Quest removed from board', {
        description: `"${task.title}" is now available for other boards`,
      });

      // Refresh tasks list
      await loadTasks();
      onTaskCreated();
    } catch (error) {
      console.error('Error unassigning task from board:', error);
      toast.error('Failed to remove quest from board');
    } finally {
      setAssigningTaskId(null);
    }
  };

  const handleCreateNew = () => {
    setMode('create');
  };

  const handleTaskCreatedFromModal = () => {
    setMode('selection');
    onTaskCreated();
  };

  const handleBackToSelection = () => {
    setMode('selection');
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.Low: return 'text-green-600 bg-green-50 border-green-200';
      case TaskPriority.Medium: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case TaskPriority.High: return 'text-orange-600 bg-orange-50 border-orange-200';
      case TaskPriority.Urgent: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'notstarted':
      case 'not started': return 'text-gray-600 bg-gray-50';
      case 'inprogress':
      case 'in progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'onhold':
      case 'on hold': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'notstarted':
      case 'not started': return 'To Do';
      case 'inprogress':
      case 'in progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'onhold':
      case 'on hold': return 'On Hold';
      default: return status;
    }
  };

  if (mode === 'create') {
    return (
      <CreateTaskModal
        open={open}
        onClose={() => setMode('selection')}
        onTaskCreated={handleTaskCreatedFromModal}
        defaultStatus={defaultStatus}
        boardId={boardId}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-emerald-500" />
            <span>
              {mode === 'selection' ? 'Add Quest to Board' : 'Create New Quest'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {mode === 'selection' 
              ? 'Select existing tasks from your quest log or create new ones. Tasks can be assigned to multiple boards.'
              : 'Create a new quest that will be added to this board and appear in your main task list.'
            }
          </DialogDescription>
        </DialogHeader>

        {mode === 'selection' ? (
          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Search and Filters */}
            <div className="flex-shrink-0 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search quests by title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={(value: 'all' | 'unassigned' | 'assigned') => setFilterStatus(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tasks</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="assigned">On Boards</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={(value: 'all' | TaskPriority) => setFilterPriority(value as 'all' | TaskPriority)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value={TaskPriority.Low}>Low</SelectItem>
                      <SelectItem value={TaskPriority.Medium}>Medium</SelectItem>
                      <SelectItem value={TaskPriority.High}>High</SelectItem>
                      <SelectItem value={TaskPriority.Urgent}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {filteredTasks.length} of {tasks.length} quests
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-teal-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quest
                </Button>
              </div>
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">No quests found</h3>
                      <p className="text-gray-600 mt-1">
                        {searchQuery 
                          ? `No quests match "${searchQuery}". Try adjusting your search or filters.`
                          : 'No quests available. Create your first quest to get started!'
                        }
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateNew}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Quest
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 leading-tight">
                              {task.title}
                            </h3>
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge className={cn("text-xs", getPriorityColor(task.priority))}>
                                {task.priority}
                              </Badge>
                              <Badge variant="secondary" className={cn("text-xs", getStatusColor(task.status))}>
                                {getStatusLabel(task.status)}
                              </Badge>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {task.pointsValue && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>{task.pointsValue} pts</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>
                              </div>
                            )}
                            {task.boardId && (
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>On board</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {task.boardId ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnassignTaskFromBoard(task)}
                              disabled={assigningTaskId === task.id}
                              className="border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                              {assigningTaskId === task.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                              <span className="ml-2">Remove</span>
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleAssignTaskToBoard(task)}
                              disabled={assigningTaskId === task.id}
                              size="sm"
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                            >
                              {assigningTaskId === task.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              <span className="ml-2">Add to Board</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <CreateTaskModal
              open={true}
              onClose={handleBackToSelection}
              onTaskCreated={handleTaskCreatedFromModal}
              defaultStatus={defaultStatus}
              boardId={boardId}
            />
          </div>
        )}

        <DialogFooter className="flex-shrink-0">
          {mode === 'selection' ? (
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                💡 Tip: Tasks assigned to boards will still appear in your main task list
              </div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <Button variant="outline" onClick={handleBackToSelection}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Selection
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 