import { ProtectedPagePattern, fetchAuthenticatedData } from '@/lib/auth/auth-config';
  import { AdminStats, AdminActivityItem, AdminSystemMetrics } from '@/lib/types/admin';
  import AdminDashboard from '@/components/admin/AdminDashboard';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Get auth session and redirect if not authenticated (admin check can be done client-side)
  const { session } = await ProtectedPagePattern('/admin');
  
  // Server-side data fetching for admin dashboard
  const initialData = {
    stats: {
      totalUsers: 0,
      totalFamilies: 0,
      activeSessions: 0,
      systemHealth: 'good' as const
    } as AdminStats,
    recentActivity: [] as AdminActivityItem[],
    systemMetrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      diskUsage: 0
    } as AdminSystemMetrics
  };
  
  try {
    // Fetch admin statistics (when backend endpoints are available)
    try {
      const adminStats = await fetchAuthenticatedData<AdminStats>('/v1/admin/stats', initialData.stats);
      if (adminStats) initialData.stats = adminStats;
    } catch {
      console.debug('Admin stats API not yet implemented');
    }
    
    // Fetch recent admin activity
    try {
      const activity = await fetchAuthenticatedData<AdminActivityItem[]>('/v1/admin/activity', []);
      if (activity) initialData.recentActivity = activity;
    } catch {
      console.debug('Admin activity API not yet implemented');
    }
    
    // Fetch system metrics
    try {
      const metrics = await fetchAuthenticatedData<AdminSystemMetrics>('/v1/admin/system-metrics', initialData.systemMetrics);
      if (metrics) initialData.systemMetrics = metrics;
    } catch {
      console.debug('System metrics API not yet implemented');
    }
  } catch {
    console.debug('Admin data fetch error, using defaults');
    // Continue with default data
  }
  
  // Pass server-fetched data to client component
  return <AdminDashboard user={session} initialData={initialData} />;
} 