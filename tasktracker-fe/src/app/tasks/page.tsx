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
  const { user, isLoading: authLoading } = useAuth();
  const { tasks: taskList, loading: tasksLoading, error: taskError, fetchTasks, updateTaskStatus, deleteTask } = useTasks();
  
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);
  
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
    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleEdit = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">All Tasks</h1>
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
      
      <TaskList 
        tasks={taskList} 
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </div>
  );
} 