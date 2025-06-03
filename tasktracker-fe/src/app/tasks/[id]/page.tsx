'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useAuth } from '@/lib/providers/AuthContext';
import { Task } from '@/lib/types/task';
import { TaskModal } from '@/components/tasks/TaskModal';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { Brain, XCircle, Play, Clock, ArrowLeft, Edit, Trash2, RefreshCw, CalendarClock, Tag, UserCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/lib/hooks/useToast';
import { Badge } from '@/components/ui/badge';

// Helper to normalize task data from API
const normalizeTaskData = (task: Task): Task => {
  if (!task) return task;
  
  // Normalize status
  let status = task.status;
  if (status === 'NotStarted' as any) status = 'todo';
  else if (status === 'InProgress' as any) status = 'in-progress';
  else if (status === 'Completed' as any) status = 'done';
  
  // Normalize priority
  let priority = task.priority;
  if (typeof priority === 'number') {
    priority = priority === 0 ? 'low' : 
              priority === 1 ? 'medium' : 
              priority === 2 ? 'high' : 'medium';
  }
  
  return {
    ...task,
    status: status as any,
    priority: priority as any
  };
};

// Format a date string for display
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Check if there's a time component other than midnight
    const hasTimeComponent = 
      date.getHours() !== 0 || 
      date.getMinutes() !== 0 || 
      date.getSeconds() !== 0;
    
    // Format with date and time if time component exists
    if (hasTimeComponent) {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
    
    // Otherwise just format the date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    return 'Invalid date';
  }
};

// Get a color for the task status
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'todo': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-amber-100 text-amber-800';
    case 'done': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Get a color for the task priority
const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-orange-100 text-orange-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getTask, fetchTasks, deleteTask } = useTasks();
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Add Focus Mode state
  const [focusMode, setFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(25); // Default 25 minutes
  const [focusTimeRemaining, setFocusTimeRemaining] = useState(0);
  const [focusStartTime, setFocusStartTime] = useState<Date | null>(null);
  const [focusInterval, setFocusInterval] = useState<NodeJS.Timeout | null>(null);

  // Handle special route conflicts - redirect if user navigated to /tasks/create 
  useEffect(() => {
    if (id === 'create') {
      router.replace('/tasks/new');
      return;
    }
  }, [id, router]);

  const refreshTask = async () => {
    if (!id || id === 'create') return;
    
    // Validate that id is a valid number
    const taskId = Number(id);
    if (isNaN(taskId) || taskId <= 0) {
      console.error('TaskDetailPage: Invalid task ID:', id);
      setError('Invalid task ID');
      setLoading(false);
      return;
    }
    
    try {
      console.log('TaskDetailPage: Refreshing task data for id:', id);
      setLoading(true);
      const taskData = await getTask(id as string);
      if (taskData) {
        console.log('TaskDetailPage: Task data received:', taskData);
        
        // Normalize task data to handle API enum values
        const normalizedTask = normalizeTaskData(taskData);
        console.log('TaskDetailPage: Normalized task data:', normalizedTask);
        
        setTask(normalizedTask);
        setError(null);
      } else {
        console.error('TaskDetailPage: Task not found');
        setError('Task not found');
      }
    } catch (err) {
      console.error('TaskDetailPage: Error fetching task:', err);
      setError('Failed to load task');
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    if (!task) return;
    
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      const success = await deleteTask(String(task.id));
      if (success) {
        showToast('Task deleted successfully', 'success');
        router.push('/tasks');
      } else {
        setError('Failed to delete task');
        showToast('Failed to delete task', 'error');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      showToast('Failed to delete task', 'error');
      setIsDeleting(false);
    }
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

  // Initial data fetch
  useEffect(() => {
    refreshTask();
  }, [id, getTask]);
  
  // Refresh task data periodically (every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('TaskDetailPage: Performing periodic refresh');
      refreshTask();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [id, lastRefresh]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/tasks/${id}`);
    }
  }, [authLoading, user, router, id]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (focusInterval) {
        clearInterval(focusInterval);
      }
    };
  }, [focusInterval]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-300 text-red-800 px-6 py-4 rounded-lg shadow mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-3 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
        <div className="flex space-x-4">
          <Link 
            href="/tasks" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Tasks
          </Link>
          <button 
            onClick={refreshTask}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No task found</h3>
          <p className="mt-1 text-sm text-gray-500">This task no longer exists or has been deleted.</p>
          <div className="mt-6">
            <Link
              href="/tasks"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Tasks
          </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Focus Mode header that appears when active */}
      <FocusModeHeader />
      
      <div className="mb-6 flex justify-between items-center">
        <Link 
          href="/tasks" 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Link>
        <div className="flex items-center gap-3">
          {!focusMode ? (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              onClick={startFocusMode}
            >
              <Brain className="h-4 w-4" />
              <span>Focus on this task</span>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 bg-indigo-100 text-indigo-700 border-indigo-300"
              onClick={stopFocusMode}
            >
              <Clock className="h-4 w-4" />
              <span>{formatTime(focusTimeRemaining)}</span>
            </Button>
          )}
          
        <button 
          onClick={refreshTask}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
            <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">{task.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(task.createdAt)}
              {task.updatedAt && task.updatedAt !== task.createdAt && ` • Updated ${formatDate(task.updatedAt)}`}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center"
            >
              {isDeleting ? (
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Status
              </h3>
            <div>
                <Badge className={`${getStatusColor(task.status)}`}>
                  {task.status === 'todo' ? 'To Do' : 
                   task.status === 'in-progress' ? 'In Progress' : 
                   task.status === 'done' ? 'Done' : task.status}
                </Badge>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Priority
              </h3>
            <div>
                <Badge className={`${getPriorityColor(task.priority || 'medium')}`}>
                  {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                </Badge>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <CalendarClock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Due Date
              </h3>
              <p className="text-sm font-medium text-gray-700">{task.dueDate ? formatDate(task.dueDate) : 'Not set'}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                <UserCircle className="h-3.5 w-3.5 mr-1 text-gray-400" />
                User ID
              </h3>
              <p className="text-sm font-medium text-gray-700">{task.id}</p>
            </div>
            
            <div className="sm:col-span-2 bg-white p-6 rounded-lg border border-gray-100">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1 text-gray-400" />
                Description
              </h3>
              <div className="prose prose-blue max-w-none">
                {task.description ? (
                  <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No description provided</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Task progress visualization */}
          {task.status !== 'done' && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Task Progress</h3>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden w-full">
                <div 
                  className={`h-full ${task.status === 'in-progress' ? 'bg-amber-500' : 'bg-blue-500'} transition-all duration-700`}
                  style={{ width: task.status === 'todo' ? '5%' : task.status === 'in-progress' ? '50%' : '100%' }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Not Started</span>
                <span>In Progress</span>
                <span>Completed</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        title="Edit Task"
        onSuccess={() => {
          setIsEditModalOpen(false);
          // Refresh task data and global task list
          refreshTask();
          fetchTasks().catch(err => console.error('Error refreshing tasks list:', err));
        }}
      />
    </div>
  );
} 