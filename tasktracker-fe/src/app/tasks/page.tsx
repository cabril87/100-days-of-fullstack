'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/tasks/TaskList';
import { useAuth } from '@/lib/providers/AuthContext';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { Task } from '@/lib/types/task';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { Brain, XCircle, Play, Clock, Plus, ArrowUpRight, Tag, BookOpen, Filter, FileText, RefreshCw, List, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/lib/hooks/useToast';
import { Badge } from '@/components/ui/badge';
import { CategoryManager } from '@/components/tasks/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BulkOperationsMenu from '@/components/tasks/BulkOperationsMenu';
import { StatsCard } from '@/components/ui/card';

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const { tasks: taskList, loading: tasksLoading, error: taskError, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  const { categories, templates, loading: templatesLoading, getTemplates } = useTemplates();
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section with Stats */}
        <div className={`transform transition-all duration-700 ease-out ${
          pageReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Task Management
            </h1>
            <p className="text-gray-600">
              Stay organized and boost your productivity
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">{tasksToShow.length}</div>
                  <div className="text-white/80 text-sm font-medium">Total Tasks</div>
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 w-full rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">{completedTasks.length}</div>
                  <div className="text-white/80 text-sm font-medium">Completed</div>
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/40 rounded-full transition-all duration-1000"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">{todayTasks.length}</div>
                  <div className="text-white/80 text-sm font-medium">Due Today</div>
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/40 rounded-full transition-all duration-1000"
                  style={{ width: `${todayTasks.length > 0 ? (todayTasks.length / tasksToShow.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">{overdueTasks.length}</div>
                  <div className="text-white/80 text-sm font-medium">Overdue</div>
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/40 rounded-full transition-all duration-1000"
                  style={{ width: `${overdueTasks.length > 0 ? (overdueTasks.length / tasksToShow.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            {/* Decorative gradient elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl mr-4">
                  <CheckSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Task Completion Progress
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Track your productivity journey</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {Math.round(completionPercentage)}%
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-700">
                      {completedTasks.length}
                    </span>
                    <span className="text-gray-500 text-lg"> / {tasksToShow.length}</span>
                    <p className="text-sm text-gray-600 mt-1">tasks completed</p>
                  </div>
                </div>
                
                <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${completionPercentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
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
              {/* Header Row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                My Tasks
                {taskList.length > 0 && (
                  <span className="text-sm font-normal ml-3 text-gray-500 align-middle bg-gray-100 px-2 py-1 rounded-full">
                    {taskList.length} {taskList.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </h1>
                
                {/* Controls Row */}
                <div className="flex items-center gap-3 self-end">
                  {/* Focus Mode Toggle - Icon Only */}
                  {!focusMode ? (
                    <Button 
                      variant="outline" 
                      className="h-10 w-10 p-0 rounded-full bg-white text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                      onClick={startFocusMode}
                      title="Start Focus Mode"
                    >
                      <Brain className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="h-10 w-10 p-0 rounded-full bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200 hover:border-purple-400"
                      onClick={stopFocusMode}
                      title={`Focus Mode: ${formatTime(focusTimeRemaining)}`}
                    >
                      <Clock className="h-5 w-5" />
                    </Button>
                  )}

                  {/* Category Manager - Icon Only */}
                  <Button 
                    variant="outline" 
                    className="h-10 w-10 p-0 rounded-full bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                    onClick={() => document.getElementById('category-trigger-button')?.click()}
                    title="Manage Categories"
                  >
                    <Tag className="h-5 w-5" />
                  </Button>
                  <div className="hidden">
                    <CategoryManager 
                      buttonLabel=""
                      buttonVariant="outline"
                      buttonSize="default"
                      buttonId="category-trigger-button"
                      onCategorySelect={setSelectedCategoryId}
                    />
                  </div>

                  {/* Refresh Button - Icon Only */}
                  <Button
                    variant="outline"
                    className="h-10 w-10 p-0 rounded-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => {
                      console.log('Manual refresh requested');
                      fetchTasks();
                    }}
                    title="Refresh Tasks"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Action Row (New Task + New Template + Templates) */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-3">
          <Link 
            href="/tasks/new" 
                    className="flex items-center justify-center h-[120px] md:w-[180px] bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-white/20 p-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                      </div>
                      <span className="text-lg font-medium">New Task</span>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/templates/new" 
                    className="flex items-center justify-center h-[50px] md:w-[180px] bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">New Template</span>
                    </div>
                  </Link>

                  <Link 
                    href="/tasks/custom" 
                    className="flex items-center justify-center h-[50px] md:w-[180px] bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <List className="h-5 w-5" />
                      <span className="font-medium">My Custom Tasks</span>
                    </div>
                  </Link>
                </div>
                
                {/* Robust Template Grid */}
                <div className="flex-1 md:max-w-2xl">
                  <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg mr-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        Quick Templates
                      </h3>
                      <Link href="/templates" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">
                        View All
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                    
                    {templatesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 animate-spin rounded-full border-2 border-dotted border-blue-500"></div>
                          <span className="mt-2 text-sm text-gray-500">Loading templates...</span>
                        </div>
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-12">
                        <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4">
                          <FileText className="h-8 w-8 text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-4 font-medium">No templates available</p>
                        <Link href="/templates">
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm">
                            Create Template
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {templates.slice(0, 6).map(template => (
                            <a
                              key={template.id}
                              href={`/tasks/new?templateId=${template.id}`}
                              className="group p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-200 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all duration-300 bg-white flex flex-col h-full cursor-pointer relative overflow-hidden"
                            >
                              {/* Gradient accent bar */}
                              <div 
                                className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
                                style={{ 
                                  background: `linear-gradient(to right, ${getCategoryColor(template.categoryId)}, ${getCategoryColor(template.categoryId)}aa)`
                                }}
                              />
                              
                              <div className="flex items-start mb-2">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2 mt-1 flex-shrink-0 shadow-sm" 
                                  style={{ backgroundColor: getCategoryColor(template.categoryId) }}
                                />
                                <div className="min-w-0 flex-1">
                                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                                    {template.title}
                                  </span>
                                </div>
                              </div>
                              
                              {template.description && (
                                <p className="text-xs text-gray-600 group-hover:text-gray-700 line-clamp-2 mb-2 flex-1">
                                  {template.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-500 font-medium">
                                  {getCategoryName(template.categoryId)}
                                </span>
                                <ArrowUpRight className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              </div>
                            </a>
                          ))}
                        </div>
                        <Link href="/templates" className="w-full block">
                          <Button 
                            variant="outline" 
                            className="w-full text-sm border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 font-medium transition-all"
                            size="sm"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View All Templates ({templates.length})
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
        </div>
            
            {/* Task Statistics */}
            {taskList.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Total Tasks Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl group-hover:from-blue-200 group-hover:to-blue-300 transition-all">
                      <CheckSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Total Tasks</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{taskList.length}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 w-full rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* Completed Tasks Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-xl"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                      <CheckSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Completed</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">{completedTasks.length}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(completionPercentage)}% completion rate</p>
                  </div>
                </div>
                
                {/* In Progress Tasks Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-medium text-gray-600 mb-1">In Progress</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">{taskList.length - completedTasks.length}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(taskList.length - completedTasks.length) > 0 ? ((taskList.length - completedTasks.length) / taskList.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Active tasks</p>
                  </div>
                </div>
                
                {/* Pending Tasks Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-t-xl"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl group-hover:from-gray-200 group-hover:to-gray-300 transition-all">
                      <XCircle className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="text-right">
                      <h3 className="text-sm font-medium text-gray-600 mb-1">Pending</h3>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">{taskList.length - completedTasks.length}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full transition-all duration-1000"
                        style={{ width: `${(taskList.length - completedTasks.length) > 0 ? ((taskList.length - completedTasks.length) / taskList.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Filter and Category Selection */}
            {taskList.length > 0 && (
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                  <Tabs
                    value={selectedTab}
                    onValueChange={setSelectedTab}
                    className="w-full sm:w-auto"
                  >
                    <TabsList className="bg-transparent p-0 gap-1">
                      <TabsTrigger 
                        value="all" 
                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        All Tasks
                      </TabsTrigger>
                      <TabsTrigger 
                        value="todo"
                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        To Do
                      </TabsTrigger>
                      <TabsTrigger 
                        value="in-progress"
                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        In Progress
                      </TabsTrigger>
                      <TabsTrigger 
                        value="done"
                        className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        Completed
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select
                    value={selectedCategoryId?.toString() || 'all'}
                    onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : parseInt(value))}
                  >
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id.toString()}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCategoryId(null)}
                    disabled={!selectedCategoryId}
                    className="h-10 w-10"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
        
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
        
            {selectedTasks.length === 0 ? renderEmptyState() : (
              <div>
                {/* Display category filter badge if selected */}
                {selectedCategoryId && (
                  <div className="mb-4 flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Filtered by:</span>
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-1"
                      style={{ 
                        backgroundColor: `${getCategoryColor(selectedCategoryId)}20`,
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
                        className="h-4 w-4 ml-1 hover:bg-white/20"
                        onClick={() => setSelectedCategoryId(null)}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                )}
                
        <TaskList 
                tasks={filteredTasks} 
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={handleEdit}
                showCategories={true}
                selectionMode={selectionMode}
                selectedTasks={selectedTasks}
                onToggleSelection={toggleTaskSelection}
        />
              </div>
        )}
          </div>
        </div>
        
        {/* Focus Mode header that appears when active */}
        <FocusModeHeader />

        {/* Styles for animations */}
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
        `}</style>
      </div>
    </div>
  );
} 