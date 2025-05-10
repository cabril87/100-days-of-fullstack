'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Task, TaskFormData } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import Link from 'next/link';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useToast } from '@/lib/hooks/useToast';

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const taskId = typeof params.id === 'string' ? params.id : params.id[0];
        const taskData = await taskService.getTask(taskId);
        setTask(taskData);
        setError(null);
      } catch (err) {
        setError('Failed to load task');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id]);

  const handleSubmit = async (data: TaskFormData) => {
    if (!task) return;
    
    setSubmitting(true);
    try {
      await taskService.updateTask(String(task.id), data);
      showToast('Task updated successfully', 'success');
      router.push(`/tasks/${task.id}`);
    } catch (err) {
      showToast('Failed to update task', 'error');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="mb-6">{error || 'Task not found'}</p>
        <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Edit Task</h1>
      
      <TaskForm 
        task={task}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
} 