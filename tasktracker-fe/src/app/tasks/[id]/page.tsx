'use client';

import { notFound } from 'next/navigation';
import TaskDetails from '@/components/tasks/TaskDetails';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useParams } from 'next/navigation';

export default function TaskDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  
  if (!user) {
    return <div>Please log in to view task details.</div>;
  }

  const taskId = params?.id ? parseInt(params.id as string, 10) : null;
  
  if (!taskId || isNaN(taskId)) {
    notFound();
  }

  return <TaskDetails taskId={taskId} user={user} />;
} 