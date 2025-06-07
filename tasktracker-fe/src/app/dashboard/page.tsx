import { requireAuth, serverApiCall } from '@/lib/utils/serverAuth';
import { FamilyDTO, DashboardStats } from '@/lib/types';
import DashboardContent from './DashboardContent';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Server-side authentication - redirect if not authenticated
  const user = await requireAuth();
  
  // Server-side data fetching for better performance
  let family: FamilyDTO | null = null;
  let stats: DashboardStats = {
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

  try {
    // Fetch family data (handle graceful failure for new users)
    try {
      family = await serverApiCall<FamilyDTO>('/api/v1/family/current-family');
    } catch {
      // Expected for users without families - not an error
      console.debug('User has no family (expected for new users)');
    }

    // Fetch dashboard stats
    try {
      stats = await serverApiCall<DashboardStats>('/api/v1/dashboard/stats');
    } catch {
      console.warn('Failed to load dashboard stats, using defaults');
    }
  } catch {
    console.error('Dashboard data fetch error');
    // Continue with default data - user will see empty state
  }

  const initialData = { family, stats };

  // Pass server-fetched data to client component
  return <DashboardContent user={user} initialData={initialData} />;
} 