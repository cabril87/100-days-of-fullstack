'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Circle, Clock, Calendar, MoreVertical, Trash2, Edit, Plus, Sparkles, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TaskCreationModal from './TaskCreationModal';
import ErrorModal from '@/components/ui/ErrorModal';
import { TasksPageContentProps, Task, TaskStats } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import { formatDistance } from 'date-fns';

export default function TasksPageContent({ user, initialData }: TasksPageContentProps) {
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks || []);
  const [stats, setStats] = useState<TaskStats>(initialData.stats);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: Record<string, unknown>;
    type?: 'error' | 'warning' | 'info';
    showDetails?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    showDetails: false
  });

  // Check if this is a fallback user (not actually authenticated)
  const isFallbackUser = user && user.id === 0 && user.email === 'loading@example.com';

  // Helper function to show error modal
  const showErrorModal = (
    title: string, 
    message: string, 
    details?: Record<string, unknown>, 
    type: 'error' | 'warning' | 'info' = 'error',
    showDetails: boolean = false
  ) => {
    setErrorModal({
      isOpen: true,
      title,
      message,
      details,
      type,
      showDetails
    });
  };

  // Load tasks on component mount
  useEffect(() => {
    // If it's a fallback user, try to load tasks to verify authentication
    if (isFallbackUser) {
      console.log('🔍 Fallback user detected, verifying authentication...');
    }
    loadTasks();
  }, [isFallbackUser]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const [recentTasks, taskStats] = await Promise.all([
        taskService.getRecentTasks(50), // Load more tasks for full view
        taskService.getUserTaskStats()
      ]);
      setTasks(recentTasks);
      setStats(taskStats);

      console.log('✅ Tasks loaded successfully:', recentTasks.length, 'tasks');
    } catch (error: unknown) {
      console.error('Failed to load tasks:', error);

      // Check if it's an authentication error
      const errorObj = error as { statusCode?: number; message?: string };
      if (errorObj?.statusCode === 401 || errorObj?.message?.includes('unauthorized')) {
        console.log('🔐 Authentication error detected, redirecting to login...');
        setAuthError('Please log in to view your tasks');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth/login?redirect=/tasks';
        }, 1000);
      } else {
        setAuthError('Failed to load tasks. Please try refreshing the page.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    console.log('🎯 Tasks handleTaskCreated called with:', newTask);

    if (newTask && newTask.id) {
      // Add the new task to the top of the list optimistically
      setTasks(prev => [newTask, ...prev]);
      console.log('✅ Task added to local state with ID:', newTask.id);
    }

    setShowTaskModal(false); // Close modal after task creation

    // ENHANCED VERIFICATION: Multi-method approach for robust task verification
    setTimeout(async () => {
      console.log(`🔍 Verifying task ${newTask.id} creation...`);
      
      let taskExists = false;
      let verificationMethod = '';
      let debugInfo: Record<string, unknown> = {};
      
      try {
        // Method 1: Direct task fetch (most reliable)
        console.log('🔍 Method 1: Direct task fetch...');
        const directTask = await taskService.getTaskById(newTask.id);
        if (directTask && directTask.id === newTask.id) {
          taskExists = true;
          verificationMethod = 'direct fetch';
          console.log('✅ Method 1: Direct fetch successful - task exists');
        } else {
          console.log('❌ Method 1: Direct fetch failed or returned null');
          
          // Method 2: Check in recent tasks list
          console.log('🔍 Method 2: Checking recent tasks...');
          const verificationTasks = await taskService.getRecentTasks(50);
          const createdTaskExists = verificationTasks.find(t => t.id === newTask.id);
          
          debugInfo = {
            taskId: newTask.id,
            taskTitle: newTask.title,
            userId: user?.id,
            totalTasksInDB: verificationTasks.length,
            taskIdsInDB: verificationTasks.map(t => t.id),
            recentTaskTitles: verificationTasks.slice(0, 5).map(t => ({ id: t.id, title: t.title }))
          };

          if (createdTaskExists) {
            taskExists = true;
            verificationMethod = 'recent tasks list';
            console.log('✅ Method 2: Found in recent tasks list');
          } else {
            console.log('❌ Method 2: Not found in recent tasks list');
            
            // Method 3: Refresh user stats to check database connection
            console.log('🔍 Method 3: Checking database connectivity...');
            try {
              const updatedStats = await taskService.getUserTaskStats();
              console.log('📊 Database connectivity check - stats retrieved:', updatedStats);
              verificationMethod = 'database connectivity verified, but task not found';
            } catch (statsError) {
              console.log('❌ Method 3: Database connectivity issues:', statsError);
              verificationMethod = 'database connectivity failed';
            }
          }
        }

        if (!taskExists) {
          console.warn(`⚠️ VERIFICATION WARNING: Task ${newTask.id} not found via ${verificationMethod}`);
          console.warn('⚠️ This could indicate:');
          console.warn('  1. Database transaction timing (normal with high concurrency)');
          console.warn('  2. Temporary backend caching issues');
          console.warn('  3. Database replication lag');
          console.warn('  4. Authentication context mismatch');
          
          // Remove the task from local state to prevent inconsistency
          setTasks(prev => prev.filter(t => t.id !== newTask.id));

          showErrorModal(
            'Task Creation Verification Issue',
            `Task creation appeared successful but verification failed. This is usually a temporary timing issue. Please refresh the page to see if the task was actually created.`,
            {
              ...debugInfo,
              verificationMethod,
              suggestion: 'Refresh the page to check if the task was actually created',
              technicalNote: 'This commonly occurs due to database transaction timing or caching'
            },
            'warning', // Changed from 'error' to 'warning' since this might be a timing issue
            true
          );
        } else {
          console.log(`✅ VERIFICATION PASSED: Task ${newTask.id} confirmed via ${verificationMethod}`);
          // Refresh stats now that we've confirmed the task exists
          try {
            const updatedStats = await taskService.getUserTaskStats();
            setStats(updatedStats);
          } catch (statsError) {
            console.log('Warning: Could not refresh stats after task creation:', statsError);
          }
        }
      } catch (verificationError) {
        console.error('🚨 Verification process failed:', verificationError);
        // Keep the task in the UI since we can't verify either way
        console.log('🔄 Keeping task in UI due to verification failure');
      }
    }, 3000); // Increased to 3 seconds for better database transaction timing
  };

  const handleOpenTaskModal = () => {
    setShowTaskModal(true);
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await taskService.completeTask(taskId);
      // Update task in local state
      setTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, isCompleted: true, completedAt: new Date() }
          : task
      ));
      // Refresh stats
      const updatedStats = await taskService.getUserTaskStats();
      setStats(updatedStats);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    console.log(`🗑️ Attempting to delete task ${taskId}`);

    try {
      // Call the delete API
      await taskService.deleteTask(taskId);
      console.log(`✅ Delete API returned success for task ${taskId}`);

      // Only remove from local state if API call succeeds
      setTasks(prev => prev.filter(task => task.id !== taskId));
      console.log(`🔄 Removed task ${taskId} from local state`);

      // Refresh stats
      const updatedStats = await taskService.getUserTaskStats();
      setStats(updatedStats);

      // VERIFICATION: Reload tasks after a longer delay to allow database commit
      setTimeout(async () => {
        console.log(`🔍 Verifying task ${taskId} deletion...`);
        try {
          // Force fresh data by bypassing any potential cache
          const verificationTasks = await taskService.getRecentTasks(50);
          const deletedTaskStillExists = verificationTasks.find(t => t.id === taskId);

          if (deletedTaskStillExists) {
            console.error(`🚨 BACKEND DELETION FAILED: Task ${taskId} still exists in database!`);
            console.error(`🚨 Re-adding task to local state...`);

            // Re-add the task to local state since deletion failed
            setTasks(prev => {
              // Only add if not already present
              if (!prev.find(t => t.id === taskId)) {
                return [deletedTaskStillExists, ...prev];
              }
              return prev;
            });

            showErrorModal(
              'Task Deletion Failed',
              `The backend returned "success" but the task wasn't actually deleted from the database. This is a backend issue - the DELETE endpoint needs to be fixed to actually delete tasks. The task has been restored to your list.`,
              {
                taskId: taskId
              },
              'error',
              true
            );
          } else {
            console.log(`✅ Task ${taskId} successfully deleted from database`);
          }
        } catch (verificationError) {
          console.error('Failed to verify task deletion:', verificationError);
        }
      }, 2500); // 2.5 second delay to allow full database transaction commit

    } catch (error) {
      console.error(`❌ Failed to delete task ${taskId}:`, error);
      
      // Enhanced error handling with specific error types
      let errorTitle = 'Failed to Delete Task';
      let errorMessage = `Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`;
      let errorType: 'error' | 'warning' = 'error';
      
      if (error instanceof Error) {
        if (error.message.includes('not found') || error.message.includes('not owned')) {
          errorTitle = 'Task Not Found';
          errorMessage = 'The task you tried to delete was not found or you don&apos;t have permission to delete it. It may have already been deleted.';
          errorType = 'warning';
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          errorTitle = 'Authentication Required';
          errorMessage = 'You need to be logged in to delete tasks. Please refresh the page and try again.';
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          errorTitle = 'Permission Denied';
          errorMessage = 'You don&apos;t have permission to delete this task.';
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorTitle = 'Server Error';
          errorMessage = 'There was a server error while deleting the task. Please try again in a moment.';
        }
      }
      
      showErrorModal(
        errorTitle,
        errorMessage,
        { 
          taskId,
          originalError: error instanceof Error ? error.message : String(error)
        },
        errorType,
        true
      );
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'completed' && task.isCompleted) ||
      (filterStatus === 'pending' && !task.isCompleted);
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
      {/* Authentication Error Alert */}
      {authError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-red-600 text-xl">🔐</div>
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">Authentication Required</h3>
              <p className="text-red-600 dark:text-red-400 text-sm">{authError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
            Manage your tasks and boost productivity
          </p>
        </div>
        {user && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={loadTasks}
              disabled={isLoading}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <TaskCreationModal
              user={user}
              family={null} // TODO: Add family context when available
              onTaskCreated={handleTaskCreated}
              isOpen={showTaskModal}
              onOpenChange={setShowTaskModal}
            />
          </div>
        )}
      </div>

      {/* Task Stats - Mobile Optimized Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters - Mobile Optimized */}
      <Card>
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search Bar - Full Width on Mobile */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 sm:h-10"
              />
            </div>

            {/* Filters - Stack on Mobile, Row on Desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px] h-11 sm:h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full sm:w-[150px] h-11 sm:h-10">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List - Mobile Optimized Cards */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="text-center text-gray-500">Loading tasks...</div>
            </CardContent>
          </Card>
        ) : filteredTasks.length === 0 ? (
          tasks.length === 0 ? (
            // Empty state with clickable area for task creation
            <Card
              className="border-dashed border-2 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 hover:from-purple-100 hover:via-blue-100 hover:to-cyan-100 dark:hover:from-purple-800/30 dark:hover:via-blue-800/30 dark:hover:to-cyan-800/30 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 group"
              onClick={handleOpenTaskModal}
            >
              <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 px-4 sm:px-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <div className="text-2xl sm:text-3xl text-white animate-pulse">🎯</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl font-semibold mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                      No tasks yet!
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                      Create your first task to get started with productivity tracking
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white rounded-full font-medium text-sm group-hover:from-purple-700 group-hover:via-blue-700 group-hover:to-cyan-700 transition-all duration-300 shadow-md group-hover:shadow-lg">
                      <Plus className="h-4 w-4 animate-bounce" />
                      <span>Click to create your first task</span>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Filtered empty state (non-clickable)
            <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="text-center space-y-2">
                  <div className="text-gray-500 text-base sm:text-lg">
                    🔍 No tasks match your filters
                  </div>
                  <p className="text-gray-400 text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className={`transition-all hover:shadow-md ${task.isCompleted ? 'opacity-75' : ''
              }`}>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    {/* Completion Toggle - Touch Friendly */}
                    <button
                      onClick={() => !task.isCompleted && handleCompleteTask(task.id)}
                      className="mt-1 flex-shrink-0 p-1 -m-1 touch-manipulation"
                      disabled={task.isCompleted}
                    >
                      {task.isCompleted ? (
                        <CheckCircle className="h-5 w-5 sm:h-5 sm:w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 sm:h-5 sm:w-5 text-gray-400 hover:text-blue-600" />
                      )}
                    </button>

                    {/* Task Content - Mobile Optimized */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className={`font-semibold text-sm sm:text-base ${task.isCompleted
                            ? 'line-through text-gray-500'
                            : 'text-gray-900 dark:text-white'
                          }`}>
                          {task.title}
                        </h3>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                            {getPriorityIcon(task.priority)} {task.priority}
                          </Badge>
                          {task.pointsValue && (
                            <Badge variant="outline" className="text-purple-600 text-xs">
                              ⭐ {task.pointsValue} pts
                            </Badge>
                          )}
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Task Meta - Mobile Stacked */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="truncate">Due {formatDistance(new Date(task.dueDate), new Date(), { addSuffix: true })}</span>
                          </div>
                        )}
                        {task.estimatedTimeMinutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimatedTimeMinutes}m
                          </div>
                        )}
                        {task.completedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span className="truncate">Completed {formatDistance(new Date(task.completedAt), new Date(), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>

                      {/* Tags - Mobile Optimized */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                          {task.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{task.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu - Touch Friendly */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 touch-manipulation">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="h-10">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 h-10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Points Summary - Mobile Optimized */}
      {stats.totalPoints > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                🏆 {stats.totalPoints} Points
              </div>
              <p className="text-purple-700 dark:text-purple-300 text-sm mt-1">
                Keep completing tasks to earn more points and level up!
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onOpenChange={(open) => setErrorModal(prev => ({ ...prev, isOpen: open }))}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
        type={errorModal.type}
        showDetails={errorModal.showDetails}
      />
    </div>
  );
} 