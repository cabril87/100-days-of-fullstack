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
import { TaskItemStatus, UpdateTaskDTO, TaskPriority, TaskItemResponseDTO, CreateTaskItemDTO } from '@/lib/types/tasks';
import { taskService } from '../../lib/services/taskService';
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
import { Card } from '../ui/card';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Target,
  Star,
  Loader2,
  Clock,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/helpers/utils/utils';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

import type { QuestSelectionModalProps } from '@/lib/props/components/boards.props';


interface DuplicateTaskInfo {
  task: TaskItemResponseDTO;
  duplicateCount: number;
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
  
  // Duplicate handling state
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateTaskInfo, setDuplicateTaskInfo] = useState<DuplicateTaskInfo | null>(null);

  // Load tasks when modal opens
  useEffect(() => {
    if (open && mode === 'selection') {
      loadTasks();
    }
  }, [open, mode]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Get user's recent tasks as the main source
      const recentTasks = await taskService.getRecentTasks(100); // Get a larger number to have more options
      
      // Convert to TaskItemResponseDTO format
      const convertedTasks: TaskItemResponseDTO[] = recentTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.isCompleted ? 'Completed' : 'NotStarted',
        priority: task.priority as TaskPriority,
        dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
        createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
        updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
        completedAt: task.completedAt instanceof Date ? task.completedAt.toISOString() : task.completedAt,
        categoryId: task.categoryId,
        categoryName: task.categoryName,
        userId: task.userId,
        tags: task.tags,
        estimatedMinutes: task.estimatedTimeMinutes,
        actualMinutes: task.actualTimeMinutes,
        pointsValue: task.pointsValue,
        boardId: undefined, // Will be set if task is on a board
        assignedToUserId: task.assignedToUserId,
        assignedToUserName: task.assignedToUserName,
        taskSource: 'individual'
      }));
      
      setTasks(convertedTasks);
      console.log(`✅ QuestSelectionModal: Loaded ${convertedTasks.length} tasks`);
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

  // Check if task is already on a board and get duplicate count
  const checkForDuplicates = async (task: TaskItemResponseDTO): Promise<DuplicateTaskInfo> => {
    // Count how many tasks with similar titles exist on boards
    const similarTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(task.title.toLowerCase()) && 
      t.boardId && 
      t.id !== task.id
    );
    
    return {
      task,
      duplicateCount: similarTasks.length
    };
  };

  // Handle board assignment with duplicate detection
  const handleAssignTaskToBoard = async (task: TaskItemResponseDTO) => {
    try {
      setAssigningTaskId(task.id);
      
      // Check if task is already on this board (simple check first)
      if (task.boardId === boardId) {
        toast.info('Quest is already on this board');
        setAssigningTaskId(null);
        return;
      }
      
      // If task is on a different board, show duplicate options
      if (task.boardId && task.boardId !== boardId) {
        const duplicateInfo = await checkForDuplicates(task);
        setDuplicateTaskInfo(duplicateInfo);
        setShowDuplicateDialog(true);
        setAssigningTaskId(null);
        return;
      }

      // Task is not on any board, proceed with direct assignment
      await assignTaskDirectly(task);
      
    } catch (error) {
      console.error('Error assigning task to board:', error);
      toast.error('Failed to assign quest to board');
      setAssigningTaskId(null);
    }
  };

  // Assign task directly to board
  const assignTaskDirectly = async (task: TaskItemResponseDTO) => {
    try {
      // Fetch the complete existing task first
      const existingTask = await taskService.getTaskById(task.id);
      if (!existingTask) {
        throw new Error(`Task with ID ${task.id} not found`);
      }

      // Create a complete TaskItemDTO with all required fields
      const updateTaskDto: UpdateTaskDTO = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        pointsValue: task.pointsValue || 0,
        categoryId: task.categoryId,
        estimatedTimeMinutes: task.estimatedMinutes,
        assignedToUserId: task.assignedToUserId,
        version: existingTask.version || 1, // Use existing version
        // Add board assignment fields - this is the key update
        boardId: boardId,
        status: defaultStatus
      };

      console.log('🎯 Assigning task to board:', {
        taskId: task.id,
        boardId,
        status: defaultStatus,
        existingVersion: existingTask.version,
        updateData: updateTaskDto
      });

      // Update the task with board assignment
      await taskService.updateTask(task.id, updateTaskDto);
      
      toast.success('🎯 Quest assigned to board!', {
        description: `"${task.title}" has been added to your board`,
      });

      // Refresh tasks list to show updated assignment status
      await loadTasks();
      onTaskCreated(); // This will trigger a full reload of the task list
    } catch (error) {
      console.error('Error assigning task to board:', error);
      toast.error('Failed to assign quest to board');
    } finally {
      setAssigningTaskId(null);
    }
  };

  // Create a duplicate task on the board
  const createDuplicateTask = async (originalTask: TaskItemResponseDTO, duplicateCount: number) => {
    try {
      setAssigningTaskId(originalTask.id);

      // Generate new title with duplicate count
      const duplicateTitle = `${originalTask.title} (${duplicateCount + 1})`;

      // Create new task with duplicate title
      const createTaskDto: CreateTaskItemDTO = {
        title: duplicateTitle,
        description: originalTask.description || '',
        priority: originalTask.priority,
        status: defaultStatus,
        dueDate: originalTask.dueDate,
        points: originalTask.pointsValue || 0,
        tags: originalTask.tags?.map(tag => tag.name) || [],
        boardId: boardId,
        categoryId: originalTask.categoryId,
        estimatedTimeMinutes: originalTask.estimatedMinutes,
      };

      console.log('🎯 Creating duplicate task:', createTaskDto);

      // Create the new task using the board's create endpoint
      await taskService.createTask(createTaskDto);
      
      toast.success('🎯 Duplicate quest created on board!', {
        description: `"${duplicateTitle}" has been added to your board`,
      });

      // Refresh tasks list and close dialogs
      await loadTasks();
      onTaskCreated();
      setShowDuplicateDialog(false);
      setDuplicateTaskInfo(null);
      
    } catch (error) {
      console.error('Error creating duplicate task:', error);
      toast.error('Failed to create duplicate quest');
    } finally {
      setAssigningTaskId(null);
    }
  };

  // Handle duplicate dialog actions
  const handleDuplicateDialogAction = async (action: 'move' | 'duplicate' | 'cancel') => {
    if (!duplicateTaskInfo) return;

    switch (action) {
      case 'move':
        // Move the task from its current board to this board
        await assignTaskDirectly(duplicateTaskInfo.task);
        setShowDuplicateDialog(false);
        setDuplicateTaskInfo(null);
        break;

      case 'duplicate':
        // Create a duplicate with numbered title
        await createDuplicateTask(duplicateTaskInfo.task, duplicateTaskInfo.duplicateCount);
        break;

      case 'cancel':
        setShowDuplicateDialog(false);
        setDuplicateTaskInfo(null);
        setAssigningTaskId(null);
        break;
    }
  };

  const handleCreateNew = () => {
    setMode('create');
  };

  const handleTaskCreatedFromModal = () => {
    setMode('selection');
    onTaskCreated();
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
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-2 border-transparent bg-clip-padding shadow-2xl shadow-purple-500/20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-200/50 via-blue-200/50 to-indigo-200/50 dark:from-purple-700/50 dark:via-blue-700/50 dark:to-indigo-700/50 rounded-lg -z-10"></div>
          
          <DialogHeader className="flex-shrink-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-6 -m-6 mb-4 rounded-t-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-blue-600/90 to-indigo-600/90 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <DialogTitle className="flex items-center space-x-3 text-2xl font-bold">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shadow-lg">
                  <Target className="h-6 w-6" />
                </div>
                <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  🎯 Add Quest to Board
                </span>
              </DialogTitle>
              <DialogDescription className="text-purple-100 text-lg mt-2 font-medium">
                🚀 Select existing quests from your adventure log or forge new ones. Quests can be deployed across multiple boards!
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search and filter controls */}
            <div className="flex-shrink-0 space-y-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="🔍 Search your quest archive..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-white/90 border-2 border-purple-200 focus:border-purple-400 dark:bg-gray-800/90 dark:border-purple-700"
                  />
                </div>
                <Button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 h-12"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quest
                </Button>
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
            <div className="flex-shrink-0 grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-600">{filteredTasks.length}</div>
                <div className="text-sm text-gray-600">Available Quests</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-600">{filteredTasks.filter(t => !t.boardId).length}</div>
                <div className="text-sm text-gray-600">Unassigned</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4 border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-600">{filteredTasks.filter(t => t.boardId).length}</div>
                <div className="text-sm text-gray-600">On Boards</div>
              </div>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quests found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try adjusting your search or filters' : 'Create your first quest to get started!'}
                  </p>
                  <Button onClick={handleCreateNew} className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Quest
                  </Button>
                </div>
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
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              👤 Personal
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            onClick={() => handleAssignTaskToBoard(task)}
                            disabled={assigningTaskId === task.id}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          >
                            {assigningTaskId === task.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : task.boardId ? (
                              <Copy className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span className="ml-2">
                              {task.boardId ? 'Duplicate' : 'Add to Board'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                💡 Tip: Tasks assigned to boards will still appear in your main task list
              </div>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Task Dialog */}
      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Quest Already on Board</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                <strong>&quot;{duplicateTaskInfo?.task.title}&quot;</strong> is already assigned to a board.
              </p>
              {duplicateTaskInfo && duplicateTaskInfo.duplicateCount > 0 && (
                <p className="text-sm text-gray-600">
                  There are already {duplicateTaskInfo.duplicateCount} similar quest(s) on boards.
                </p>
              )}
              <p className="text-sm font-medium">What would you like to do?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel onClick={() => handleDuplicateDialogAction('cancel')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDuplicateDialogAction('move')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Move to This Board
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleDuplicateDialogAction('duplicate')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Copy className="h-4 w-4 mr-2" />
              Create Duplicate ({duplicateTaskInfo ? duplicateTaskInfo.duplicateCount + 1 : 1})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 
