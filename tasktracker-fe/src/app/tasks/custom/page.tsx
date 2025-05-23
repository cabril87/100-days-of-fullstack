'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/lib/providers/TaskProvider';
import { Task } from '@/lib/types/task';
import { TaskList } from '@/components/tasks/TaskList';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';

export default function CustomTasksPage() {
  const router = useRouter();
  const { tasks, loading, error, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  const { showToast } = useToast();
  
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  const [pageReady, setPageReady] = useState(false);
  
  // Filter tasks to only include those without templateId
  useEffect(() => {
    if (tasks.length > 0) {
      const nonTemplateTasksArray = tasks.filter(task => !task.templateId);
      setCustomTasks(nonTemplateTasksArray);
    }
  }, [tasks]);
  
  // Load tasks
  useEffect(() => {
    fetchTasks();
    
    // Trigger animation on load
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchTasks]);
  
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateTaskStatus(id, status);
    } catch (err) {
      console.error('Failed to update task status:', err);
      showToast('Failed to update task status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await deleteTask(id);
      
      if (success) {
        showToast('Task deleted successfully', 'success');
      } else {
        showToast('Failed to delete task', 'error');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      showToast('Error deleting task', 'error');
    }
  };

  const handleEdit = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };
  
  if (loading) {
    return (
      <div className="flex-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <p className="text-sm mt-4">Loading your custom tasks...</p>
        </div>
      </div>
    );
  }
  
  // Render an empty state when there are no custom tasks
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
          <BookOpen className="h-24 w-24 text-gray-300 dark:text-gray-700" />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-white/50 dark:to-black/20 rounded-full"></div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent mb-3">No custom tasks found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">Create tasks without using templates to see them here</p>
        <div className="flex justify-center">
          <Link 
            href="/tasks/new" 
            className="btn-primary inline-flex items-center gap-2 py-3 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 text-lg"
            style={{
              background: 'linear-gradient(to right, var(--navy-dark), var(--navy))',
              transform: 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)'
            }}
          >
            Create New Task
          </Link>
        </div>
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
        <div className="absolute -top-36 -right-36 w-96 h-96 bg-emerald-500 opacity-[0.03] rounded-full blur-3xl dark:opacity-[0.05]"></div>
        <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-emerald-700 opacity-[0.05] rounded-full blur-3xl dark:opacity-[0.03]"></div>
        
        {/* Page header with gradient accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-t-xl"></div>
        
        <div className="pt-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 -ml-3 gap-2" asChild>
                <Link href="/tasks">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Tasks
                </Link>
              </Button>
              
              <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-500 tracking-tight">
                My Custom Tasks
                {customTasks.length > 0 && (
                  <span className="text-sm font-normal ml-3 text-gray-500 dark:text-gray-400 align-middle bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded-full">
                    {customTasks.length} {customTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}
              </h1>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {customTasks.length === 0 ? renderEmptyState() : (
            <TaskList 
              tasks={customTasks} 
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={handleEdit}
              showCategories={true}
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
      `}</style>
    </div>
  );
} 