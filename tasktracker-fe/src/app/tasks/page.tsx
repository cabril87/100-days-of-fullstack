'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TaskList } from '@/components/tasks/TaskList';
import { useAuth } from '@/lib/providers/AuthContext';
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
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/tasks');
    }
  }, [authLoading, user, router]);

  if (authLoading || tasksLoading) {
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
        // Task is already removed from state in the provider, no need to refresh
        
        // Optional: Show a success message temporarily
        // We could add this to the component state
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

  // Render an empty state when there are no tasks
  const renderEmptyState = () => {
    return (
      <div className="py-12 text-center bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-xl font-medium text-gray-800 mb-3">No tasks found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">Create your first task to get started with organizing your work</p>
        <Link 
          href="/tasks/new" 
          className="px-6 py-3 bg-brand-navy text-white rounded-full hover:bg-opacity-90 transition-all font-medium inline-flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create New Task
        </Link>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="apple-card">
        <h1 className="text-3xl font-bold mb-8 text-brand-navy-dark">Tasks</h1>
        
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                console.log('Manual refresh requested');
                fetchTasks();
              }}
              className="p-2 rounded-full hover:bg-brand-navy/10 text-brand-navy transition-colors"
              aria-label="Refresh tasks"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
              </svg>
            </button>
          </div>
          <Link 
            href="/tasks/new" 
            className="px-5 py-2.5 bg-brand-navy text-white rounded-full hover:bg-opacity-90 transition-all font-medium"
          >
            Create New Task
          </Link>
        </div>
        
        {taskError && (
          <div className="bg-brand-navy-dark/10 border border-brand-navy-dark/30 text-brand-navy-dark px-4 py-3 rounded-xl mb-6">
            {taskError}
          </div>
        )}
        
        {deleteError && (
          <div className="bg-brand-navy-dark/10 border border-brand-navy-dark/30 text-brand-navy-dark px-4 py-3 rounded-xl mb-6 flex justify-between items-center">
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
                className="bg-brand-navy text-white px-3 py-1 rounded-full hover:bg-opacity-90 text-sm"
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
    </div>
  );
} 