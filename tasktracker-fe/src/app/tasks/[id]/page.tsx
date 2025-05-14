'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useAuth } from '@/lib/providers/AuthContext';
import { Task } from '@/lib/types/task';
import { TaskModal } from '@/components/tasks/TaskModal';
import Link from 'next/link';

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
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const refreshTask = async () => {
    if (!id) return;
    
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
        router.push('/tasks');
      } else {
        setError('Failed to delete task');
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
      setIsDeleting(false);
    }
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

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      <div className="mb-6 flex justify-between items-center">
        <Link 
          href="/tasks" 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Tasks
        </Link>
        <button 
          onClick={refreshTask}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Refresh
        </button>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-black">{task.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Created {formatDate(task.createdAt)}
              {task.updatedAt && task.updatedAt !== task.createdAt && ` • Updated ${formatDate(task.updatedAt)}`}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</h3>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status === 'todo' ? 'To Do' : 
                   task.status === 'in-progress' ? 'In Progress' : 
                   task.status === 'done' ? 'Done' : task.status}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</h3>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority || 'medium')}`}>
                  {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Medium'}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</h3>
              <p className="mt-1 text-sm text-gray-900">{task.dueDate ? formatDate(task.dueDate) : 'Not set'}</p>
            </div>
            
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</h3>
              <p className="mt-1 text-sm text-gray-900">{task.userId}</p>
            </div>
            
            <div className="sm:col-span-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</h3>
              <div className="mt-1 prose prose-blue text-gray-700">
                {task.description ? (
                  <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No description provided</p>
                )}
              </div>
            </div>
          </div>
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