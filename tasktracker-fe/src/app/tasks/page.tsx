import { getServerSession } from '@/lib/auth/auth-config';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';
import { Task, TaskCategory, TaskStats } from '@/lib/types/tasks';
import Tasks from '@/components/tasks/Tasks';

export default async function TasksPage() {
  // Try to get session without redirecting
  const session = await getServerSession();
  
  // Create a fallback user object for client-side auth with all required User properties
  const fallbackUser = session || {
    id: 0,
    email: 'loading@example.com',
    username: 'loading',
    role: 'RegularUser' as const,
    firstName: 'Loading',
    lastName: 'User',
    displayName: 'Loading User',
    avatarUrl: null,
    ageGroup: 2, // Adult
    createdAt: new Date().toISOString(),
    isActive: true,
    points: 0,
    isFamilyAdmin: false
  };
  
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
  
  console.debug('Tasks page: Server session =', session ? 'found' : 'not found', '- client will handle auth validation');
  
  // Pass server-fetched data to client component
  // Client component will handle auth validation and redirect if needed
  return <Tasks user={fallbackUser} initialData={initialData} />;
} 

