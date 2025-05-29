'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Task as TaskComponent } from '@/components/tasks/Task';
import { useAuth } from '@/lib/providers/AuthContext';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { Task } from '@/lib/types/task';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { Brain, XCircle, Play, Clock, Plus, ArrowUpRight, Tag, BookOpen, Filter, FileText, RefreshCw, List, CheckSquare, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/lib/hooks/useToast';
import { Badge } from '@/components/ui/badge';
import { CategoryManager } from '@/components/tasks/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import BulkOperationsMenu from '@/components/tasks/BulkOperationsMenu';
import BatchOperations from '@/components/tasks/BatchOperations';
import { StatsCard } from '@/components/ui/card';

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const { tasks: taskList, loading: tasksLoading, error: taskError, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  const { categories, templates, loading: templatesLoading, getTemplates } = useTemplates();

  // Check for refresh parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true' && user) {
      console.log('Refresh parameter detected, fetching tasks...');
      fetchTasks();
      // Clean up the URL
      router.replace('/tasks', undefined);
    }
  }, [user, fetchTasks, router]);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState<boolean>(false);
  const [pageReady, setPageReady] = useState(false);
  const { showToast } = useToast();

  // Add category filter
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');

  // Add Focus Mode state
  const [focusMode, setFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(25); // Default 25 minutes
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(0);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusInterval, setFocusInterval] = useState<NodeJS.Timeout | null>(null);

  // Add bulk selection states
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  useEffect(() => {
    // Only fetch tasks when user is authenticated
    if (user) {
      fetchTasks();
    }

    // Trigger animation on load
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, fetchTasks]);

  // Add effect to refresh tasks when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Page became visible, refreshing tasks...');
        fetchTasks();
      }
    };

    const handleFocus = () => {
      if (user) {
        console.log('Window focused, refreshing tasks...');
        fetchTasks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, fetchTasks]);

  // Load templates when the page loads
  useEffect(() => {
    if (user && templates.length === 0 && !templatesLoading) {
      // Pre-load templates for quick access
      getTemplates().catch(err => {
        console.error('Failed to load templates:', err);
      });
    }
  }, [user, templates.length, templatesLoading, getTemplates]);

  // Reset delete error when tasks change
  useEffect(() => {
    setDeleteError(null);
    setIsAuthError(false);
  }, [taskList]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/tasks');
    }
  }, [authLoading, user, router]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (focusInterval) {
        clearInterval(focusInterval);
      }
    };
  }, [focusInterval]);

  // Clear any existing mock tasks and add debugging for localStorage
  useEffect(() => {
    // Clear mock tasks from localStorage since we're only using API data now
    localStorage.removeItem('mockTasks');
    console.log('TASKS PAGE: Cleared mock tasks from localStorage');

    const mockTasksJson = localStorage.getItem('mockTasks');
    console.log('TASKS PAGE: Mock tasks in localStorage after clearing:', mockTasksJson);
  }, []); // Run only once on mount

  if (authLoading || tasksLoading) {
    return (
      <div className="flex-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <p className="text-brand-navy-dark dark:text-brand-cream text-sm mt-4">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <p className="text-brand-navy-dark dark:text-brand-cream text-sm mt-4">Please wait...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateTaskStatus(id, status);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    setIsAuthError(false);

    try {
      console.log('TasksPage: Deleting task:', id);
      const success = await deleteTask(id);

      if (success) {
        console.log('TasksPage: Task deleted successfully');
        showToast('Task deleted successfully', 'success');
        // Task is already removed from state in the provider, no need to refresh
      } else {
        console.error('TasksPage: Failed to delete task. Task provider returned false.');

        // Check if this appears to be an auth error
        const authErrorPattern = /auth|token|login|unauthorized|authentication/i;
        const errorString = taskError || '';

        if (authErrorPattern.test(errorString)) {
          setIsAuthError(true);
          setDeleteError('Authentication error. Please sign in again.');
        } else {
          setDeleteError('Failed to delete task. Please try refreshing the page or try again.');
          showToast('Failed to delete task', 'error');

          // Force a refresh after 3 seconds to ensure UI and server are in sync
          setTimeout(() => {
            console.log('TasksPage: Auto-refreshing tasks after deletion failure');
            fetchTasks();
          }, 3000);
        }
      }
    } catch (err) {
      console.error('TasksPage: Exception deleting task:', err);
      setDeleteError('An error occurred while deleting the task. Please try again.');
      showToast('Error deleting task', 'error');

      // Force a refresh to ensure UI and server are in sync
      setTimeout(() => {
        console.log('TasksPage: Auto-refreshing tasks after deletion exception');
        fetchTasks();
      }, 3000);
    }
  };

  const handleEdit = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };

  // Handle starting focus mode
  const startFocusMode = () => {
    setFocusMode(true);
    setFocusTimeRemaining(focusTime * 60); // Convert to seconds
    setFocusStartTime(new Date());

    // Start countdown timer
    const interval = setInterval(() => {
      setFocusTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up
          clearInterval(interval);
          setFocusMode(false);
          setFocusInterval(null);
          showToast('Focus session completed!', 'success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setFocusInterval(interval);
    showToast(`Focus mode started for ${focusTime} minutes`, 'info');
  };

  // Handle stopping focus mode
  const stopFocusMode = () => {
    if (focusInterval) {
      clearInterval(focusInterval);
    }
    setFocusMode(false);
    setFocusInterval(null);
    showToast('Focus mode stopped', 'info');
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate focus duration so far
  const getFocusDuration = () => {
    if (!focusStartTime) return '0:00';
    const elapsed = Math.floor((Date.now() - focusStartTime.getTime()) / 1000);
    return formatTime(elapsed);
  };

  // Filter tasks by category
  const getFilteredTasks = () => {
    if (!selectedCategoryId) return taskList;
    return taskList.filter(task => task.categoryId === selectedCategoryId);
  };

  // Get category name by ID
  const getCategoryName = (categoryId?: number): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Get category color by ID
  const getCategoryColor = (categoryId?: number): string => {
    if (!categoryId) return '#6b7280';
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  // Function to render the Focus Mode meter in header
  const FocusModeHeader = () => {
    if (!focusMode) return null;

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-indigo-600 text-white py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-white" />
          <span className="text-sm font-medium">Focus Mode: {formatTime(focusTimeRemaining)}</span>
        </div>

        <div className="flex-1 mx-6 max-w-xl">
          <div className="h-2 bg-indigo-800/40 rounded-full w-full relative overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 rounded-full"
              style={{ width: `${((focusTime * 60 - focusTimeRemaining) / (focusTime * 60)) * 100}%` }}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-white hover:bg-indigo-700 p-1"
          onClick={stopFocusMode}
        >
          <XCircle className="h-3 w-3 mr-1" />
          End
        </Button>
      </div>
    );
  };

  // Render an empty state when there are no tasks
  const renderEmptyState = () => {
    return (
      <div
        className="py-20 text-center bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg relative overflow-hidden"
        style={{
          animation: 'fadeIn 0.6s ease-out',
        }}
      >
        {/* Show refresh hint if there are stats but no visible tasks */}
        {taskList.length === 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg mx-8">
            <p className="text-blue-700 text-sm">
              💡 <strong>Just created a task?</strong> Click the refresh button (🔄) above if your new task doesn't appear automatically.
            </p>
          </div>
        )}
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full"></div>
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            No tasks found
          </h3>
          <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg leading-relaxed">
            Create your first task to get started with organizing your work and boosting productivity
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/tasks/new"
              className="inline-flex items-center gap-3 py-4 px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold text-lg"
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              Create New Task
            </Link>

            <Link href="/templates">
              <Button
                variant="outline"
                className="flex items-center gap-3 py-4 px-6 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 rounded-xl font-semibold text-lg h-auto"
              >
                <FileText className="h-5 w-5" />
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Stats calculation
  const tasksToShow = getFilteredTasks();
  const completedTasks = tasksToShow.filter(task => task.status === 'completed');
  const completionPercentage = tasksToShow.length > 0 ? (completedTasks.length / tasksToShow.length) * 100 : 0;

  // Quick stats for the header
  const todayTasks = tasksToShow.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  });

  const overdueTasks = tasksToShow.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate < today;
  });

  // Group tasks by category for the categories tab
  const tasksByCategory = taskList.reduce((acc, task) => {
    const categoryId = task.categoryId || 0; // Use 0 for uncategorized
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(task);
    return acc;
  }, {} as Record<number, Task[]>);

  // Get filtered tasks based on current tab and category selection
  const filteredTasks = selectedTab === 'all'
    ? (selectedCategoryId ? taskList.filter(task => task.categoryId === selectedCategoryId) : taskList)
    : taskList.filter(task => {
      if (selectedTab === 'done') return task.status === 'done' || task.status === 'completed';
      if (selectedTab === 'in-progress') return task.status === 'in-progress';
      if (selectedTab === 'todo') return task.status === 'todo' || task.status === 'not-started';
      return true;
    });

  // Handler for toggling selection mode
  const toggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    if (selectionMode) {
      // Clear selections when disabling selection mode
      setSelectedTasks([]);
    }
  };

  // Handler for selecting/deselecting a task
  const toggleTaskSelection = (task: Task) => {
    setSelectedTasks(prev => {
      const isSelected = prev.some(t => t.id === task.id);
      if (isSelected) {
        return prev.filter(t => t.id !== task.id);
      } else {
        return [...prev, task];
      }
    });
  };

  // Handler for clearing all selections
  const clearSelection = () => {
    setSelectedTasks([]);
    if (selectedTasks.length > 0 && selectionMode) {
      setSelectionMode(false);
    }
  };

  // Handler for bulk operation completion
  const handleBulkOperationComplete = () => {
    fetchTasks();
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section with Stats */}
          <div className={`transform transition-all duration-700 ease-out ${pageReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Task Management
              </h1>
              <p className="text-gray-600">
                Stay organized and boost your productivity
              </p>
            </div>

            {/* Gamified Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {/* Total Tasks */}
              <div className="relative bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl shadow-sm">
                      <CheckSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{taskList.length}</div>
                      <div className="text-xs font-bold text-gray-600">Total</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 w-full rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Completed Tasks */}
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                                      <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white/20 rounded-xl shadow-sm backdrop-blur-sm">
                      <CheckSquare className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">{completedTasks.length}</div>
                      <div className="text-xs font-bold text-white/80">Done</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Due Today */}
              <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl shadow-sm">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{todayTasks.length}</div>
                      <div className="text-xs font-bold text-gray-600">Today</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                      style={{ width: `${todayTasks.length > 0 ? (todayTasks.length / taskList.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Overdue */}
              <div className="relative bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-white/20 rounded-xl shadow-sm backdrop-blur-sm">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">{overdueTasks.length}</div>
                      <div className="text-xs font-bold text-white/80">Overdue</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000"
                      style={{ width: `${overdueTasks.length > 0 ? (overdueTasks.length / taskList.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div className="relative bg-gradient-to-br from-white via-amber-50/30 to-orange-50/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl shadow-sm">
                      <Play className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{taskList.filter(t => t.status === 'in-progress').length}</div>
                      <div className="text-xs font-bold text-gray-600">Active</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000"
                      style={{ width: `${taskList.filter(t => t.status === 'in-progress').length > 0 ? (taskList.filter(t => t.status === 'in-progress').length / taskList.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div className="relative bg-gradient-to-br from-white via-gray-50/30 to-slate-50/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 hover:shadow-xl hover:scale-105 transition-all duration-300 group overflow-hidden">
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-gray-400/10 to-slate-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl shadow-sm">
                      <Clock className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">{taskList.filter(t => t.status === 'todo' || t.status === 'not-started').length}</div>
                      <div className="text-xs font-bold text-gray-600">Pending</div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gray-500 to-slate-500 rounded-full transition-all duration-1000"
                      style={{ width: `${taskList.filter(t => t.status === 'todo' || t.status === 'not-started').length > 0 ? (taskList.filter(t => t.status === 'todo' || t.status === 'not-started').length / taskList.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Gamified Progress Card - Thinner but Full Width */}
            <div className="relative bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100/50 mb-8 hover:shadow-2xl transition-all duration-500 overflow-hidden group">
              {/* Enhanced decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-400/10 via-blue-400/10 to-indigo-400/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-indigo-400/5 to-purple-400/5 rounded-full blur-xl animate-pulse"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-xl mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <CheckSquare className="h-6 w-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Productivity Dashboard
                      </h3>
                      <p className="text-sm font-bold text-gray-600">Track your achievement journey</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <span className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {Math.round(completionPercentage)}%
                      </span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                    <div className="text-right bg-gradient-to-r from-white/60 to-gray-50/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-lg">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {completedTasks.length}
                        </span>
                        <span className="text-gray-500 text-lg font-bold"> / {taskList.length}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-600">tasks completed</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                      style={{ width: `${completionPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                      {completionPercentage > 0 && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-sm animate-bounce"></div>
                      )}
                    </div>
                  </div>

                  <div className="text-center bg-gradient-to-r from-white/40 to-gray-50/40 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <p className="text-sm font-bold bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                      {completionPercentage === 100 ? '🎉 All tasks completed! Amazing work!' :
                        completionPercentage >= 80 ? '🔥 Almost there! Keep going!' :
                          completionPercentage >= 50 ? '💪 Great progress! You\'re doing well!' :
                            completionPercentage >= 25 ? '🚀 Getting started! Keep it up!' :
                              '✨ Let\'s begin your productivity journey!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
            <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>

            {/* Page header with gradient accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>

            <div className="pt-6 relative z-10 p-6">
              <div className="flex flex-col gap-6 mb-8">
                {/* Gamified Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="relative">
                    {/* Decorative background for title */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-2xl blur-xl"></div>

                    <h1 className="relative text-4xl font-black tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-xl shadow-lg">
                        <CheckSquare className="h-8 w-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" />
                      </div>
                      My Tasks
                      {taskList.length > 0 && (
                        <div className="relative">
                          <span className="text-lg font-bold ml-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                            {taskList.length} {taskList.length === 1 ? 'task' : 'tasks'}
                          </span>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-sm"></div>
                        </div>
                      )}
                    </h1>
                  </div>

                  {/* Enhanced Controls Row */}
                  <div className="flex items-center gap-3 self-end bg-white/60 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-white/20">
                    {/* Focus Mode Toggle - Icon Only */}
                    {!focusMode ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 w-12 p-0 rounded-2xl bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border-purple-200/50 hover:bg-gradient-to-r hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 hover:scale-110 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                            onClick={startFocusMode}
                          >
                            <Brain className="h-6 w-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Start Focus Mode (25 min timer)</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 w-12 p-0 rounded-2xl bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-300/50 hover:bg-gradient-to-r hover:from-purple-200 hover:to-purple-300 hover:border-purple-400 hover:scale-110 hover:shadow-lg transition-all duration-300 backdrop-blur-sm animate-pulse"
                            onClick={stopFocusMode}
                          >
                            <Clock className="h-6 w-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Focus Mode Active: {formatTime(focusTimeRemaining)} remaining</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Category Manager - Icon Only */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 w-12 p-0 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 border-orange-200/50 hover:bg-gradient-to-r hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 hover:scale-110 hover:shadow-lg transition-all duration-300 backdrop-blur-sm"
                          onClick={() => document.getElementById('category-trigger-button')?.click()}
                        >
                          <Tag className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Manage Categories</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="hidden">
                      <CategoryManager
                        buttonLabel=""
                        buttonVariant="outline"
                        buttonSize="default"
                        buttonId="category-trigger-button"
                        onCategorySelect={setSelectedCategoryId}
                      />
                    </div>

                    {/* Selection Mode Toggle - Enhanced */}
                    <div className="relative">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={selectionMode ? "default" : "outline"}
                            className={`h-12 w-12 p-0 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg backdrop-blur-sm ${selectionMode
                                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600/50 hover:from-purple-700 hover:to-purple-800 shadow-xl animate-pulse"
                                : "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border-purple-200/50 hover:bg-gradient-to-r hover:from-purple-100 hover:to-purple-200 hover:border-purple-300"
                              }`}
                            onClick={toggleSelectionMode}
                          >
                            <CheckSquare className={`h-6 w-6 transition-transform duration-300 ${selectionMode ? 'scale-110 rotate-12' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{selectionMode ? "Exit Selection Mode" : "Enter Selection Mode for Batch Operations"}</p>
                        </TooltipContent>
                      </Tooltip>
                      {selectionMode && selectedTasks.length > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg ring-2 ring-white animate-bounce">
                          {selectedTasks.length}
                        </div>
                      )}
                    </div>

                    {/* Refresh Button - Icon Only */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-12 w-12 p-0 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border-blue-200/50 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 hover:scale-110 hover:shadow-lg transition-all duration-300 backdrop-blur-sm animate-pulse"
                          onClick={() => {
                            console.log('=== MANUAL REFRESH REQUESTED ===');
                            console.log('Current tasks in state:', taskList.length, 'tasks');
                            console.log('Task list:', taskList);
                            const mockTasksJson = localStorage.getItem('mockTasks');
                            console.log('Mock tasks in localStorage:', mockTasksJson);
                            console.log('Calling fetchTasks...');
                            fetchTasks();
                          }}
                        >
                          <RefreshCw className="h-6 w-6" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh Tasks (Click if tasks don't appear)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Selection Mode Controls - Full Width */}
                {selectionMode && (
                  <div
                    className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-lg"
                    style={{
                      animation: 'slideDown 0.3s ease-out'
                    }}
                  >
                    {/* Compact Header Bar */}
                    <div className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-sm border-b border-purple-100">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          <span className="text-lg font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Selection Mode Active
                          </span>
                        </div>
                        <div className="h-6 w-px bg-purple-200"></div>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-sm px-3 py-1 transition-all duration-200">
                          {selectedTasks.length} tasks selected
                        </Badge>
                        {selectedTasks.length > 0 && (
                          <span className="text-sm text-purple-600 animate-in fade-in duration-200 font-medium">
                            Ready for batch operations
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        className="text-purple-600 hover:text-purple-800 h-8 px-3 text-sm hover:bg-purple-100 transition-colors font-medium"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Exit Selection Mode
                      </Button>
                    </div>

                    {/* Batch Operations */}
                    {selectedTasks.length > 0 && (
                      <div className="px-6 py-4">
                        <BatchOperations
                          compact={true}
                          selectedTasks={selectedTasks.map(t => t.id)}
                          onTaskSelectionChange={(taskIds) => {
                            const newSelectedTasks = filteredTasks.filter(task => taskIds.includes(task.id));
                            setSelectedTasks(newSelectedTasks);
                          }}
                          onOperationComplete={handleBulkOperationComplete}
                        />
                      </div>
                    )}

                    {/* Helper text when no tasks selected */}
                    {selectedTasks.length === 0 && (
                      <div className="px-6 py-4 text-center bg-purple-25 border-t border-purple-100">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-purple-600/80 font-medium">
                            Click on tasks below to select them for batch operations
                          </span>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Unified Task Management Hub */}
                <div className="space-y-6">
                  {/* Quick Actions Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* New Task - Primary Action */}
                    <Link
                      href="/tasks/new"
                      className="lg:col-span-2 flex items-center h-[70px] w-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white rounded-2xl hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                    >
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="flex items-center gap-3 px-4 relative z-10">
                        <div className="p-2.5 bg-white/20 rounded-xl shadow-lg">
                          <Plus className="h-6 w-6" />
                        </div>
                        <div>
                          <span className="text-lg font-black">New Task</span>
                          <p className="text-white/80 text-xs">Create a new task</p>
                        </div>
                      </div>
                    </Link>

                    {/* Template Action */}
                    <Link
                      href="/templates/new"
                      className="flex flex-col items-center justify-center h-[70px] bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                    >
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10 text-center">
                        <FileText className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-bold">Template</span>
                      </div>
                    </Link>

                    {/* Advanced Tasks */}
                    <Link
                      href="/tasks/advanced"
                      className="flex flex-col items-center justify-center h-[70px] bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                    >
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 rounded-full blur-lg group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10 text-center">
                        <Settings className="h-5 w-5 mx-auto mb-1" />
                        <span className="text-sm font-bold">Advanced</span>
                      </div>
                    </Link>
                  </div>

                  {/* Unified Task Management Hub */}
                  <div className="relative bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-400/10 via-blue-400/10 to-indigo-400/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10 p-6 bg-gradient-to-r from-white via-blue-50/30 to-cyan-50/30 backdrop-blur-sm border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      {/* Header with Controls */}
                                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-xl shadow-lg">
                              <CheckSquare className="h-6 w-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Task Management Hub
                              </h2>
                              <p className="text-sm font-bold text-gray-600">Organize, filter, and manage your tasks</p>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-sm px-3 py-1.5 font-bold">
                              {taskList.length} total
                            </Badge>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-sm px-3 py-1.5 font-bold">
                              {completedTasks.length} done
                            </Badge>
                            {overdueTasks.length > 0 && (
                              <Badge variant="secondary" className="bg-red-100 text-red-700 text-sm px-3 py-1.5 font-bold animate-pulse">
                                {overdueTasks.length} overdue
                              </Badge>
                            )}
                          </div>
                        </div>

                      {/* Enhanced Gamified Status Tabs */}
                      <div className="bg-gradient-to-r from-white/60 via-blue-50/30 to-purple-50/30 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-3 mb-6 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-xl"></div>
                        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>

                        <Tabs
                          value={selectedTab}
                          onValueChange={setSelectedTab}
                          className="w-full relative z-10"
                        >
                          <TabsList className="bg-white/60 backdrop-blur-sm p-1 gap-1 rounded-xl border border-white/20 shadow-sm w-full grid grid-cols-4">
                            <TabsTrigger
                              value="all"
                              className="rounded-lg px-3 py-2 font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/80"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                                <span className="text-xs font-bold">All</span>
                                <Badge variant="secondary" className="bg-current/20 text-current text-xs px-1.5 py-0.5 ml-1">
                                  {taskList.length}
                                </Badge>
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="todo"
                              className="rounded-lg px-3 py-2 font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/80"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                                <span className="text-xs font-bold">To Do</span>
                                <Badge variant="secondary" className="bg-current/20 text-current text-xs px-1.5 py-0.5 ml-1">
                                  {taskList.filter(t => t.status === 'todo' || t.status === 'not-started').length}
                                </Badge>
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="in-progress"
                              className="rounded-lg px-3 py-2 font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/80"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                                <span className="text-xs font-bold">Active</span>
                                <Badge variant="secondary" className="bg-current/20 text-current text-xs px-1.5 py-0.5 ml-1">
                                  {taskList.filter(t => t.status === 'in-progress').length}
                                </Badge>
                              </div>
                            </TabsTrigger>
                            <TabsTrigger
                              value="done"
                              className="rounded-lg px-3 py-2 font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/80"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-current opacity-60"></div>
                                <span className="text-xs font-bold">Done</span>
                                <Badge variant="secondary" className="bg-current/20 text-current text-xs px-1.5 py-0.5 ml-1">
                                  {completedTasks.length}
                                </Badge>
                              </div>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                                              {/* Enhanced Filters & Controls */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                          {/* Category Filter */}
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <Tag className="h-4 w-4 text-purple-600" />
                              Category Filter
                            </label>
                          <Select
                            value={selectedCategoryId?.toString() || 'all'}
                            onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : parseInt(value))}
                          >
                            <SelectTrigger className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:border-purple-300/50 transition-all duration-300">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                                  All Categories
                                </div>
                              </SelectItem>
                              {categories.map(category => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                      {taskList.filter(t => t.categoryId === category.id).length}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                                                  {/* Sort Options */}
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <ArrowUpRight className="h-4 w-4 text-blue-600" />
                              Sort By
                            </label>
                          <Select defaultValue="created">
                            <SelectTrigger className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:border-indigo-300/50 transition-all duration-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem key="created" value="created">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  Date Created
                                </div>
                              </SelectItem>
                              <SelectItem key="due" value="due">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  Due Date
                                </div>
                              </SelectItem>
                              <SelectItem key="priority" value="priority">
                                <div className="flex items-center gap-2">
                                  <ArrowUpRight className="h-3 w-3" />
                                  Priority
                                </div>
                              </SelectItem>
                              <SelectItem key="status" value="status">
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="h-3 w-3" />
                                  Status
                                </div>
                              </SelectItem>
                              <SelectItem key="title" value="title">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3 w-3" />
                                  Title (A-Z)
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                                                  {/* Batch Operations Toggle */}
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                              <CheckSquare className="h-4 w-4 text-indigo-600" />
                              Batch Operations
                            </label>
                                                      <Button
                              variant={selectionMode ? "default" : "outline"}
                              onClick={toggleSelectionMode}
                              className={`w-full transition-all duration-300 ${
                                selectionMode
                                  ? "bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700 shadow-lg hover:shadow-xl"
                                  : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
                              }`}
                            >
                            {selectionMode ? (
                              <div className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4" />
                                <span>Exit Selection Mode</span>
                                {selectedTasks.length > 0 && (
                                  <Badge variant="secondary" className="bg-white/20 text-white">
                                    {selectedTasks.length}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <CheckSquare className="h-4 w-4" />
                                <span>Enable Selection Mode</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>

                                              {/* Quick Templates Section */}
                        {templates.length > 0 && (
                          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl border border-gray-200">
                            <h3 className="text-sm font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2 mb-3">
                              <FileText className="h-4 w-4 text-purple-600" />
                              Quick Templates
                            </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {templates.slice(0, 3).map((template, index) => {
                              // Ensure unique key with fallback
                              const templateKey = template.id ? `template-${template.id}` : `template-index-${index}`;
                              return (
                                <Link
                                  key={templateKey}
                                  href={`/tasks/new?templateId=${template.id}`}
                                  className="flex items-center h-[45px] w-full bg-gradient-to-r from-white via-gray-50 to-white text-gray-800 rounded-lg hover:from-purple-50 hover:via-blue-50 hover:to-indigo-50 hover:text-purple-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden group border border-gray-200/50 hover:border-purple-200"
                                >
                                  <div
                                    className="absolute left-0 top-0 w-1 h-full rounded-l-lg"
                                    style={{ backgroundColor: getCategoryColor(template.categoryId) }}
                                  />
                                  <div className="flex items-center gap-2 px-3 relative z-10 w-full">
                                    <div
                                      className="p-1.5 rounded-lg shadow-sm"
                                      style={{
                                        backgroundColor: `${getCategoryColor(template.categoryId)}20`,
                                        color: getCategoryColor(template.categoryId)
                                      }}
                                    >
                                      <FileText className="h-3 w-3" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-xs font-bold truncate block">{template.title}</span>
                                    </div>
                                    <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                                                        {templates.length > 3 && (
                                <div className="mt-2 text-center">
                                  <Link href="/templates">
                                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                                      View All {templates.length} Templates
                                      <ArrowUpRight className="h-3 w-3 ml-1" />
                                    </Button>
                                  </Link>
                                </div>
                              )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>





              {taskError && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 shadow-sm"
                  style={{
                    animation: 'slideDown 0.3s ease-out',
                    boxShadow: '0 4px 12px -6px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {taskError}
                  </div>
                </div>
              )}

              {deleteError && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex justify-between items-center shadow-sm"
                  style={{
                    animation: 'slideDown 0.3s ease-out',
                    boxShadow: '0 4px 12px -6px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {deleteError}
                    {!isAuthError && (
                      <button
                        onClick={() => fetchTasks()}
                        className="ml-3 text-red-700 underline font-medium hover:text-red-800"
                      >
                        Refresh now
                      </button>
                    )}
                  </div>
                  {isAuthError && (
                    <button
                      onClick={() => router.push('/auth/login?redirect=/tasks')}
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-1.5 rounded-full hover:shadow-md transition-all"
                    >
                      Sign in again
                    </button>
                  )}
                </div>
              )}

              {filteredTasks.length === 0 ? renderEmptyState() : (
                <div className="relative bg-gradient-to-br from-white via-purple-50/10 to-blue-50/10 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400/5 via-blue-400/5 to-indigo-400/5 rounded-full blur-xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-pink-400/5 rounded-full blur-xl"></div>
                  
                  <div className="relative z-10 p-6 bg-gradient-to-r from-white via-gray-50/30 to-slate-50/30 backdrop-blur-sm border border-gray-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    {/* Task List Header */}
                                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 rounded-xl shadow-md">
                            <List className="h-5 w-5 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" />
                          </div>
                          <div>
                            <h2 className="text-xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              Your Tasks
                            </h2>
                            <p className="text-sm font-bold text-gray-600">
                              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} 
                              {selectedTab !== 'all' && ` • ${selectedTab.replace('-', ' ')}`}
                              {selectedCategoryId && ` • ${getCategoryName(selectedCategoryId)}`}
                            </p>
                          </div>
                        </div>

                      {/* Active Filters Display */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {selectedTab !== 'all' && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-1 font-bold ${
                              selectedTab === 'todo' ? 'bg-orange-100 text-orange-700' :
                              selectedTab === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                              selectedTab === 'done' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {selectedTab === 'todo' ? 'To Do' : 
                             selectedTab === 'in-progress' ? 'In Progress' : 
                             selectedTab === 'done' ? 'Completed' : selectedTab}
                          </Badge>
                        )}
                        
                        {selectedCategoryId && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 text-xs px-2 py-1 font-bold"
                            style={{
                              backgroundColor: `${getCategoryColor(selectedCategoryId)}15`,
                              color: getCategoryColor(selectedCategoryId),
                              borderColor: `${getCategoryColor(selectedCategoryId)}40`
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getCategoryColor(selectedCategoryId) }}
                            />
                            {getCategoryName(selectedCategoryId)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 ml-1 hover:bg-white/20 p-0"
                              onClick={() => setSelectedCategoryId(null)}
                            >
                              <XCircle className="h-2.5 w-2.5" />
                            </Button>
                          </Badge>
                        )}

                        {selectionMode && selectedTasks.length > 0 && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-2 py-1 font-bold animate-pulse">
                            {selectedTasks.length} selected
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Task List */}
                    <div className="space-y-3">
                      {filteredTasks.map((task, index) => {
                        // Ensure unique key by combining task.id with index as fallback
                        const taskKey = task.id ? `task-${task.id}` : `task-index-${index}`;
                        return (
                          <div
                            key={taskKey}
                            className={`transform transition-all duration-300 ${
                              pageReady ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                            }`}
                            style={{ 
                              transitionDelay: `${Math.min(index * 50, 300)}ms`,
                              animation: pageReady ? `slideInUp 0.4s ease-out ${Math.min(index * 0.05, 0.3)}s both` : 'none'
                            }}
                          >
                            <TaskComponent
                              task={task}
                              onStatusChange={handleStatusChange}
                              onDelete={handleDelete}
                              onEdit={handleEdit}
                              showCategories={true}
                              selectionMode={selectionMode}
                              isSelected={selectedTasks.some(t => t.id === task.id)}
                              onToggleSelection={() => toggleTaskSelection(task)}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Task List Footer */}
                    {filteredTasks.length > 5 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Showing all {filteredTasks.length} tasks
                          </div>
                          <div className="flex items-center gap-2">
                            {selectionMode && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const allVisible = filteredTasks.every(task => selectedTasks.some(t => t.id === task.id));
                                  if (allVisible) {
                                    // Deselect all visible tasks
                                    setSelectedTasks(prev => prev.filter(t => !filteredTasks.some(ft => ft.id === t.id)));
                                  } else {
                                    // Select all visible tasks
                                    const newSelections = filteredTasks.filter(task => !selectedTasks.some(t => t.id === task.id));
                                    setSelectedTasks(prev => [...prev, ...newSelections]);
                                  }
                                }}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              >
                                {filteredTasks.every(task => selectedTasks.some(t => t.id === task.id)) ? 'Deselect All' : 'Select All'}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                            >
                              Back to Top
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Focus Mode header that appears when active */}
          <FocusModeHeader />

          {/* Enhanced Styles for animations and effects */}
          <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideDown {
            from { 
              opacity: 0; 
              transform: translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }

          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0, 0, 0);
            }
            40%, 43% {
              transform: translate3d(0, -8px, 0);
            }
            70% {
              transform: translate3d(0, -4px, 0);
            }
            90% {
              transform: translate3d(0, -2px, 0);
            }
          }

          .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          .animate-bounce {
            animation: bounce 1s infinite;
          }

          /* Custom scrollbar for better UX */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: rgba(243, 244, 246, 0.5);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #8b5cf6, #3b82f6);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #7c3aed, #2563eb);
          }
        `}</style>
        </div>
      </div>
    </TooltipProvider>
  );
} 