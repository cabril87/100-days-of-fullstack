'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useTasks } from '@/lib/providers/TaskProvider';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskFormData } from '@/lib/types/task';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Function to sanitize input to only allow alphanumeric and spaces
const sanitizeBasic = (value: string): string => {
  if (!value) return '';
  return value.replace(/[^a-zA-Z0-9 ]/g, '');
};

export default function NewTaskPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { createTask, error: taskProviderError } = useTasks();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Monitor task provider errors
  useEffect(() => {
    if (taskProviderError) {
      setError(taskProviderError);
      setIsSubmitting(false);
    }
  }, [taskProviderError]);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/auth/login?redirect=/tasks/new');
    return null;
  }

  // If successfully created, show feedback and then redirect
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/tasks');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  if (authLoading || isSubmitting) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center">
          <p className="text-lg font-medium">Task created successfully!</p>
          <p className="mt-2">Redirecting to tasks page...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare safe data
      const safeData: TaskFormData = {
        title: sanitizeBasic(data.title).substring(0, 50),
        description: data.description ? sanitizeBasic(data.description).substring(0, 200) : '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        dueDate: data.dueDate
      };
      
      console.log('Creating task:', safeData);
      
      const taskResult = await createTask(safeData);
      
      if (taskResult) {
        console.log('Task created successfully:', taskResult);
        setSuccess(true);
      } else {
        console.error('Task creation returned null or undefined result');
        setError(taskProviderError || 'Unable to create task. Please try again with simpler text.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError('An unexpected error occurred. Please try again with a simpler title and description (no special characters).');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link href="/tasks" className="text-blue-600 hover:underline">
          ← Back to Tasks
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-black">Create New Task</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">For best results, use simple alphanumeric characters in your task title and description.</p>
        </div>
        
        <TaskForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/tasks')} 
        />
      </div>
    </div>
  );
} 