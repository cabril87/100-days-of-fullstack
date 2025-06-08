import { ProtectedPagePattern } from '@/lib/auth/auth-config';
import { FamilyDTO, DashboardStats } from '@/lib/types';
import { Task, TaskStats } from '@/lib/types/task';
import Dashboard from '@/components/dashboard/Dashboard';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/dashboard');
  
  // Server-side data fetching for better performance
  const family: FamilyDTO | null = null;
  const stats: DashboardStats = {
    tasksCompleted: 0,
    activeGoals: 0,
    focusTime: 0,
    totalPoints: 0,
    familyMembers: 0,
    familyTasks: 0,
    familyPoints: 0,
    streakDays: 0,
    totalFamilies: 0
  };
  const recentTasks: Task[] = [];
  const taskStats: TaskStats = {
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    overdueTasks: 0,
    tasksCompleted: 0,
    tasksCompletedThisWeek: 0,
    activeGoals: 0,
    focusTimeToday: 0,
    streakDays: 0,
    totalPoints: 0
  };

  // Temporarily disable server-side data fetching to prevent 404s without auth
  // Client-side components will handle data loading with proper authentication
  console.debug('Server-side data fetching disabled - client will handle data loading')

  const initialData = { family, stats, recentTasks, taskStats };

  // Pass server-fetched data to client component
  return <Dashboard user={session} initialData={initialData} />;
} 