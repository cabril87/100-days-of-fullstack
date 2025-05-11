'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/tasks/TaskList';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useTasks } from '@/lib/providers/TaskProvider';
import { Task } from '@/lib/types/task';
import Link from 'next/link';

export default function TasksPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, login } = useAuth();
  const { tasks: taskList, loading: tasksLoading, error: taskError, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState<boolean>(false);
  
  useEffect(() => {
    // Only fetch tasks when user is authenticated
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);
  
  // Reset delete error when tasks change
  useEffect(() => {
    setDeleteError(null);
    setIsAuthError(false);
  }, [taskList]);
  
  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/auth/login?redirect=/tasks');
    return null;
  }

  if (authLoading || tasksLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        // Force refresh the task list to ensure UI is in sync with backend
        fetchTasks();
      } else {
        console.error('TasksPage: Failed to delete task. Task provider returned false.');
        
        // Check if this appears to be an auth error
        const authErrorPattern = /auth|token|login|unauthorized|authentication/i;
        const errorString = taskError || '';
        
        if (authErrorPattern.test(errorString)) {
          setIsAuthError(true);
          setDeleteError('Authentication error. Please sign in again.');
        } else {
          setDeleteError('Failed to delete task. Please try refreshing the page.');
        }
      }
    } catch (err) {
      console.error('TasksPage: Exception deleting task:', err);
      setDeleteError('An error occurred while deleting the task.');
    }
  };

  const handleEdit = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };

  // Render an empty state when there are no tasks
  const renderEmptyState = () => {
    return (
      <div className="text-center py-10 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-600 mb-2">No tasks found</h3>
        <p className="text-gray-500 mb-4">Create your first task to get started</p>
        <Link 
          href="/tasks/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Task
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-black">All Tasks</h1>
          <button
            onClick={() => {
              console.log('Manual refresh requested');
              fetchTasks();
            }}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Refresh tasks"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
          </button>
        </div>
        <Link 
          href="/tasks/new" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Task
        </Link>
      </div>
      
      {taskError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {taskError}
        </div>
      )}
      
      {deleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <div>
            {deleteError}
            {!isAuthError && (
              <button 
                onClick={() => fetchTasks()} 
                className="ml-2 underline"
              >
                Refresh now
              </button>
            )}
          </div>
          {isAuthError && (
            <button 
              onClick={() => router.push('/auth/login?redirect=/tasks')} 
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
            >
              Sign in again
            </button>
          )}
        </div>
      )}
      
      {taskList.length === 0 ? renderEmptyState() : (
        <TaskList 
          tasks={taskList} 
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
} 