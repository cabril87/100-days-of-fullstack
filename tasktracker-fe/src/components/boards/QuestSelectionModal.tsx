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
import { TaskItemStatus, UpdateTaskDTO, TaskPriority, TaskItemResponseDTO, TaskApiResponseType, FlexibleApiResponse, CreateTaskItemDTO } from '../../lib/types/task';
import { taskService } from '../../lib/services/taskService';
import { familyInvitationService } from '../../lib/services/familyInvitationService';
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
import { Card } from '../ui/card';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Target,
  Star,
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
      console.log('🔍 QuestSelectionModal: Loading tasks from multiple sources...');
      
      // First, check if user is in a family
      let userFamily = null;
      try {
        userFamily = await familyInvitationService.getUserFamily();
        if (userFamily) {
          console.log('🏠 QuestSelectionModal: User is in family:', `Family ID ${userFamily.id} - "${userFamily.name}"`);
        } else {
          console.log('🏠 QuestSelectionModal: User has no family (normal for new users)');
        }
      } catch (error: unknown) {
        // Handle both API errors and structured responses gracefully
        const errorObj = error as { status?: number; statusCode?: number; message?: string };
        if (errorObj?.status === 404 || errorObj?.statusCode === 404 || errorObj?.message?.includes('No family found')) {
          console.log('🆕 QuestSelectionModal: New user with no family - this is completely normal');
        } else {
          console.log('⚠️ QuestSelectionModal: Family check failed:', errorObj?.message || 'Unknown error');
        }
        userFamily = null; // Ensure it's null for new users
      }

      // Fetch tasks from multiple sources
      const familyTasksPromise = userFamily 
        ? taskService.getFamilyTasks(userFamily.id).catch((error) => {
            console.log('⚠️ QuestSelectionModal: Failed to fetch family tasks:', error.message);
            return [];
          })
        : Promise.resolve([]);

      const [individualTasks, familyTasks] = await Promise.allSettled([
        // Individual user tasks
        apiClient.get<TaskApiResponseType>(`/v1/taskitems?pageSize=100`),
        // Family tasks (only if user is in a family)
        familyTasksPromise
      ]);
      
      let allTasks: TaskItemResponseDTO[] = [];
      
      // Process individual tasks
      if (individualTasks.status === 'fulfilled') {
        const result = individualTasks.value;
        let apiTasks: TaskItemResponseDTO[] = [];
        
        if (Array.isArray(result)) {
          apiTasks = result as unknown as TaskItemResponseDTO[];
        } else if (result && typeof result === 'object') {
          const flexibleResponse = result as FlexibleApiResponse;
          
          if ('data' in result && Array.isArray(result.data)) {
            apiTasks = result.data as unknown as TaskItemResponseDTO[];
          } else if (flexibleResponse.items && Array.isArray(flexibleResponse.items)) {
            apiTasks = flexibleResponse.items as unknown as TaskItemResponseDTO[];
          } else if (flexibleResponse.tasks && Array.isArray(flexibleResponse.tasks)) {
            apiTasks = flexibleResponse.tasks as unknown as TaskItemResponseDTO[];
          }
        }
        
        // Convert individual tasks to our expected format
        const convertedIndividualTasks: TaskItemResponseDTO[] = apiTasks.map(task => ({
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
          boardId: task.boardId,
          assignedToUserId: task.assignedToUserId,
          assignedToUserName: task.assignedToUserName,
          taskSource: 'individual' // Add source identifier
        }));
        
        allTasks = [...allTasks, ...convertedIndividualTasks];
        console.log(`✅ QuestSelectionModal: Loaded ${convertedIndividualTasks.length} individual tasks`);
      }
      
      // Process family tasks
      if (familyTasks.status === 'fulfilled' && Array.isArray(familyTasks.value)) {
        // Convert family tasks to TaskItemResponseDTO format
        const convertedFamilyTasks: TaskItemResponseDTO[] = familyTasks.value.map(familyTask => ({
          id: familyTask.id,
          title: familyTask.title,
          description: familyTask.description || '',
          status: familyTask.status || 'NotStarted',
          priority: familyTask.priority as TaskPriority, // Type cast to TaskPriority enum
          dueDate: familyTask.dueDate,
          createdAt: familyTask.createdAt,
          updatedAt: familyTask.updatedAt,
          completedAt: familyTask.completedAt,
          categoryId: undefined, // Family tasks may not have category
          categoryName: undefined,
          userId: familyTask.userId, // Use userId instead of createdByUserId
          tags: [], // Family tasks might not have tags in the same format
          estimatedMinutes: familyTask.estimatedTimeMinutes,
          actualMinutes: familyTask.actualTimeMinutes,
          pointsValue: familyTask.pointsValue,
          boardId: undefined, // Family tasks won't have boardId initially
          assignedToUserId: familyTask.assignedToFamilyMemberId,
          assignedToUserName: familyTask.assignedToFamilyMember?.user?.username, // Access through navigation property
          taskSource: 'family' // Add source identifier
        }));
        
        // Filter out duplicates (tasks that might exist in both individual and family lists)
        const uniqueFamilyTasks = convertedFamilyTasks.filter(familyTask => 
          !allTasks.some(task => task.id === familyTask.id)
        );
        
        allTasks = [...allTasks, ...uniqueFamilyTasks];
        console.log(`✅ QuestSelectionModal: Loaded ${uniqueFamilyTasks.length} unique family tasks (${convertedFamilyTasks.length} total)`);
      }
      
      console.log(`🎯 QuestSelectionModal: Total ${allTasks.length} tasks available for board assignment`);
      setTasks(allTasks);
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
      
      // Update the existing task to assign it to the board (no duplication)
      const updateTaskDto: UpdateTaskDTO & { boardId?: number; status?: TaskItemStatus } = {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        pointsValue: task.pointsValue || 0,
        categoryId: task.categoryId,
        estimatedTimeMinutes: task.estimatedMinutes,
        assignedToUserId: task.assignedToUserId,
        // Add board assignment fields
        boardId: boardId,
        status: defaultStatus
      };

      // Update the task with board assignment using regular updateTask
      await taskService.updateTask(task.id, updateTaskDto as UpdateTaskDTO);
      
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

  // Note: We no longer need unassign functionality since we create new tasks on boards
  // instead of updating existing tasks. This allows the same quest to exist on multiple boards.

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
                {mode === 'selection' ? '🎯 Add Quest to Board' : '✨ Create New Quest'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-purple-100 text-lg mt-2 font-medium">
              {mode === 'selection' 
                ? '🚀 Select existing quests from your adventure log or forge new ones. Quests can be deployed across multiple boards!'
                : '⚡ Create an epic new quest that will be added to this board and appear in your main quest log.'
              }
            </DialogDescription>
          </div>
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
                <div>
                  <span>
                    Showing {filteredTasks.length} of {tasks.length} quests
                    {searchQuery && ` matching "${searchQuery}"`}
                  </span>
                  {tasks.length > 0 && tasks.every(task => task.taskSource === 'individual') && (
                    <div className="text-xs text-blue-600 mt-1">
                      💡 Tip: Join or create a family to access shared family tasks!
                    </div>
                  )}
                </div>
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
                            {task.taskSource && (
                              <div className="flex items-center space-x-1">
                                <Badge variant="outline" className={cn(
                                  "text-xs",
                                  task.taskSource === 'individual' && "bg-blue-50 text-blue-700 border-blue-200",
                                  task.taskSource === 'family' && "bg-purple-50 text-purple-700 border-purple-200",
                                  task.taskSource === 'assigned' && "bg-green-50 text-green-700 border-green-200"
                                )}>
                                  {task.taskSource === 'individual' && '👤 Personal'}
                                  {task.taskSource === 'family' && '👨‍👩‍👧‍👦 Family'}
                                  {task.taskSource === 'assigned' && '📋 Assigned'}
                                </Badge>
                              </div>
                            )}
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
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                            <span className="ml-2">Add to Board</span>
                          </Button>
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