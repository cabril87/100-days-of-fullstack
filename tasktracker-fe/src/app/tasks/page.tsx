import { requireAuth, serverApiCall } from '@/lib/utils/serverAuth';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';
import { Task, TaskCategory, TaskStats } from '@/lib/types/task';
import TasksPageContent from './TasksPageContent';

export default async function TasksPage() {
  // Server-side authentication - redirect if not authenticated
  const user = await requireAuth();
  
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
  
  try {
    // Fetch user tasks (when backend is implemented)
    try {
      const tasksData = await serverApiCall<Task[]>('/api/v1/tasks/user');
      initialData.tasks = tasksData;
    } catch {
      console.debug('Tasks API not yet implemented');
    }
    
    // Fetch task categories (when backend is implemented)
    try {
      const categoriesData = await serverApiCall<TaskCategory[]>('/api/v1/tasks/categories');
      initialData.categories = categoriesData;
    } catch {
      console.debug('Task categories API not yet implemented');
    }
    
    // Fetch task statistics (when backend is implemented)
    try {
      const statsData = await serverApiCall<TaskStats>('/api/v1/tasks/stats');
      initialData.stats = statsData;
    } catch {
      console.debug('Task stats API not yet implemented');
    }
  } catch {
    console.debug('Task data fetch error, using defaults');
    // Continue with empty data - component will show placeholder
  }
  
  // Pass server-fetched data to client component
  return <TasksPageContent user={user} initialData={initialData} />;
} 