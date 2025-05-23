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
        className="py-16 text-center bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm dark:bg-white/5 dark:border-white/10"
        style={{
          animation: 'fadeIn 0.6s ease-out',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-white/50 dark:to-black/20 rounded-full"></div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-3">No tasks found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">Create your first task to get started with organizing your work</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/tasks/new" 
          className="btn-primary inline-flex items-center gap-2 py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-lg"
          style={{
            background: 'linear-gradient(to right, var(--navy-dark), var(--navy))',
            transform: 'translateY(0)',
            transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Task
        </Link>
          <div className="mt-2 sm:mt-0 w-full sm:w-auto">
            <Link href="/templates">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                <FileText className="h-4 w-4" />
                <span>Templates</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Calculate task statistics
  const completedTasks = taskList.filter(task => task.status === 'done' || task.status === 'completed').length;
  const inProgressTasks = taskList.filter(task => task.status === 'in-progress').length;
  const pendingTasks = taskList.filter(task => task.status === 'todo' || task.status === 'not-started').length;
  const completionPercentage = taskList.length > 0 ? (completedTasks / taskList.length) * 100 : 0;

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
    <div 
      className={`max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 transition-opacity duration-500 ease-in-out ${pageReady ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'
      }}
    >
      {/* Focus Mode header that appears when active */}
      <FocusModeHeader />

      <div className="apple-card relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-36 -right-36 w-96 h-96 bg-brand-navy opacity-[0.03] rounded-full blur-3xl dark:opacity-[0.05]"></div>
        <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-brand-beige opacity-[0.05] rounded-full blur-3xl dark:opacity-[0.03]"></div>
        
        {/* Page header with gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-navy-dark to-brand-navy rounded-t-xl"></div>
        
        <div className="pt-6 relative z-10">
          <div className="flex flex-col gap-6 mb-8">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold text-brand-navy-dark dark:text-cream tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              My Tasks
              {taskList.length > 0 && (
                <span className="text-sm font-normal ml-3 text-gray-500 dark:text-gray-400 align-middle bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-full">
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
                    className="h-10 w-10 p-0 rounded-full bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                    onClick={startFocusMode}
                    title="Start Focus Mode"
                  >
                    <Brain className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="h-10 w-10 p-0 rounded-full bg-indigo-100 text-indigo-700 border-indigo-300 hover:bg-indigo-200"
                    onClick={stopFocusMode}
                    title={`Focus Mode: ${formatTime(focusTimeRemaining)}`}
                  >
                    <Clock className="h-5 w-5" />
                  </Button>
                )}

                {/* Category Manager - Icon Only */}
                <Button 
                  variant="outline" 
                  className="h-10 w-10 p-0 rounded-full bg-white text-amber-600 border-amber-200 hover:bg-amber-50"
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
                  className="h-10 w-10 p-0 rounded-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
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
                  className="btn-primary flex items-center justify-center h-[120px] md:w-[180px]"
                style={{
                  background: 'linear-gradient(to right, var(--navy-dark), var(--navy))',
                  transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
                }}
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
                  className="btn-secondary flex items-center justify-center h-[50px] md:w-[180px]"
                  style={{
                    background: 'linear-gradient(to right, var(--blue-600), var(--blue-500))',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">New Template</span>
                  </div>
                </Link>

                <Link 
                  href="/tasks/custom" 
                  className="btn-secondary flex items-center justify-center h-[50px] md:w-[180px]"
                  style={{
                    background: 'linear-gradient(to right, var(--emerald-600), var(--emerald-500))',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    <span className="font-medium">My Custom Tasks</span>
                  </div>
                </Link>
              </div>
              
              {/* Robust Template Grid */}
              <div className="flex-1 md:max-w-2xl">
                <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-700 flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-blue-500" />
                      Quick Templates
                    </h3>
                    <Link href="/templates" className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                      View All
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                  
                  {templatesLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner size="sm" className="text-blue-500" />
                      <span className="ml-2 text-sm text-gray-500">Loading templates...</span>
                    </div>
                  ) : templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-10">
                      <FileText className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500 mb-3">No templates available</p>
                      <Link href="/templates">
                        <Button size="sm" variant="outline">Create Template</Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {templates.slice(0, 6).map(template => (
                          <a
                            key={template.id}
                            href={`/tasks/new?templateId=${template.id}`}
                            className="p-2 border border-gray-200 rounded-md hover:shadow-sm hover:border-blue-200 hover:bg-blue-50/20 transition-all bg-white flex flex-col h-full cursor-pointer"
                            style={{ 
                              borderLeft: `3px solid ${getCategoryColor(template.categoryId)}`
                            }}
                          >
                            <div className="flex items-center mb-1">
                              <div 
                                className="w-2 h-2 rounded-full mr-1 flex-shrink-0" 
                                style={{ backgroundColor: getCategoryColor(template.categoryId) }}
                              />
                              <span className="text-xs font-medium truncate text-gray-800">
                                {template.title.length > 18 ? `${template.title.substring(0, 18)}...` : template.title}
                              </span>
                            </div>
                            {template.description && (
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {template.description}
                              </p>
                            )}
                          </a>
                        ))}
                      </div>
                      <Link href="/templates" className="w-full block">
                        <Button 
                          variant="outline" 
                          className="w-full text-xs border-gray-200 hover:border-blue-200 hover:text-blue-700"
                          size="sm"
                        >
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all">
                <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{taskList.length}</p>
                <div className="mt-2">
                  <Progress value={100} className="h-2 bg-blue-100" />
                </div>
              </div>
              
              {/* Completed Tasks Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">{completedTasks}</p>
                <div className="mt-2">
                  <Progress value={completionPercentage} className="h-2 bg-green-100" />
                </div>
              </div>
              
              {/* In Progress Tasks Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all">
                <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">{inProgressTasks}</p>
                <div className="mt-2">
                  <Progress 
                    value={inProgressTasks > 0 ? (inProgressTasks / taskList.length) * 100 : 0} 
                    className="h-2 bg-amber-100" 
                  />
                </div>
              </div>
              
              {/* Pending Tasks Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent">{pendingTasks}</p>
                <div className="mt-2">
                  <Progress 
                    value={pendingTasks > 0 ? (pendingTasks / taskList.length) * 100 : 0} 
                    className="h-2 bg-gray-100" 
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Filter and Category Selection */}
          {taskList.length > 0 && (
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="w-full sm:w-auto"
              >
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="todo">To Do</TabsTrigger>
                  <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                  <TabsTrigger value="done">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
              
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
              className="card-section bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 shadow-sm"
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
              className="card-section bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex justify-between items-center shadow-sm"
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
                    className="ml-3 text-red-700 dark:text-red-400 underline font-medium hover:text-red-800 dark:hover:text-red-300"
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
  );
} 