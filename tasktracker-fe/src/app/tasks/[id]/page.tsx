'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Task } from '@/lib/types/task';
import { Task as TaskComponent } from '@/components/tasks/Task';
import { TaskModal } from '@/components/tasks/TaskModal';
import Link from 'next/link';

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getTask } = useTasks();
  const { user, isLoading: authLoading } = useAuth();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const taskData = await getTask(id as string);
        if (taskData) {
          setTask(taskData);
        } else {
          setError('Task not found');
        }
      } catch (err) {
        setError('Failed to load task');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, getTask]);
  
  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push(`/auth/login?redirect=/tasks/${id}`);
    return null;
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/tasks" className="text-blue-600 hover:underline">
          ← Back to Tasks
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Task not found or has been deleted.</p>
          <Link href="/tasks" className="text-blue-600 hover:underline">
            ← Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <Link href="/tasks" className="text-blue-600 hover:underline">
          ← Back to Tasks
        </Link>
      </div>
      
      <TaskComponent 
        task={task} 
        onEdit={() => setIsEditModalOpen(true)}
        onStatusChange={() => {}}
        onDelete={() => {}} 
      />
      
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        title="Edit Task"
        onSuccess={() => {
          setIsEditModalOpen(false);
          // Refresh task data
          getTask(id as string).then(updatedTask => {
            if (updatedTask) setTask(updatedTask);
          });
        }}
      />
    </div>
  );
} 