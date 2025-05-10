'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { TaskForm } from '@/components/tasks/TaskForm';
import Link from 'next/link';

export default function NewTaskPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    router.push('/auth/login?redirect=/tasks/new');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSubmit = () => {
    router.push('/tasks');
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
        <TaskForm onSubmit={handleSubmit} onCancel={() => router.push('/tasks')} />
      </div>
    </div>
  );
} 