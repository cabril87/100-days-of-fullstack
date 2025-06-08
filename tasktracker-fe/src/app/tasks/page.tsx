import { ProtectedPagePattern } from '@/lib/auth/auth-config';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';
import { Task, TaskCategory, TaskStats } from '@/lib/types/task';
import Tasks from '@/components/tasks/Tasks';

export default async function TasksPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/tasks');
  
  // Server-side data fetching for better performance
  const initialData = {
    tasks: [] as Task[],
    categories: [] as TaskCategory[],
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      activeTasks: 0,
      overdueTasks: 0
    } as TaskStats
  };
  
  // Temporarily disable server-side data fetching to prevent 404s without auth
  // Client-side components will handle data loading with proper authentication
  console.debug('Server-side data fetching disabled - client will handle data loading')
  
  // Pass server-fetched data to client component
  return <Tasks user={session} initialData={initialData} />;
} 