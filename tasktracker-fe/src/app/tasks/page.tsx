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
  const [pageReady, setPageReady] = useState(false);
  
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
      <div className="flex-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-navy mb-4"></div>
          <p className="text-brand-navy-dark dark:text-brand-cream text-sm">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-navy mb-4"></div>
          <p className="text-brand-navy-dark dark:text-brand-cream text-sm">Please wait...</p>
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
        <h3 className="text-2xl font-medium text-brand-navy-dark dark:text-brand-cream mb-3">No tasks found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">Create your first task to get started with organizing your work</p>
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
      </div>
    );
  };

  return (
    <div 
      className={`max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 transition-opacity duration-500 ease-in-out ${pageReady ? 'opacity-100' : 'opacity-0'}`}
      style={{ 
        transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)'
      }}
    >
      <div className="apple-card relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-36 -right-36 w-96 h-96 bg-brand-navy opacity-[0.03] rounded-full blur-3xl dark:opacity-[0.05]"></div>
        <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-brand-beige opacity-[0.05] rounded-full blur-3xl dark:opacity-[0.03]"></div>
        
        {/* Page header with gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-navy-dark to-brand-navy rounded-t-xl"></div>
        
        <div className="pt-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h1 className="text-3xl font-bold text-brand-navy-dark dark:text-cream tracking-tight">
              My Tasks
              {taskList.length > 0 && (
                <span className="text-sm font-normal ml-3 text-gray-500 dark:text-gray-400 align-middle bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                  {taskList.length} {taskList.length === 1 ? 'task' : 'tasks'}
                </span>
              )}
            </h1>
            
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              console.log('Manual refresh requested');
              fetchTasks();
            }}
                className="icon-button text-brand-navy hover:bg-brand-navy/10 dark:text-brand-beige dark:hover:bg-brand-beige/10"
            aria-label="Refresh tasks"
                style={{ transition: 'all 0.2s ease' }}
          >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
          </button>
        <Link 
          href="/tasks/new" 
                className="btn-primary"
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
            </div>
      </div>
      
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