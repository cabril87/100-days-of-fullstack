import { requireRole, serverApiCall } from '@/lib/utils/serverAuth';
import { AdminStats, AdminActivityItem, AdminSystemMetrics } from '@/lib/types/admin';
import AdminDashboardContent from './AdminDashboardContent';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Server-side authentication with role validation - redirect if not global admin
  const user = await requireRole('GlobalAdmin');
  
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
      const adminStats = await serverApiCall<AdminStats>('/api/v1/admin/stats');
      initialData.stats = adminStats;
    } catch {
      console.debug('Admin stats API not yet implemented');
    }
    
    // Fetch recent admin activity
    try {
      const activity = await serverApiCall<AdminActivityItem[]>('/api/v1/admin/activity');
      initialData.recentActivity = activity;
    } catch {
      console.debug('Admin activity API not yet implemented');
    }
    
    // Fetch system metrics
    try {
      const metrics = await serverApiCall<AdminSystemMetrics>('/api/v1/admin/system-metrics');
      initialData.systemMetrics = metrics;
    } catch {
      console.debug('System metrics API not yet implemented');
    }
  } catch {
    console.debug('Admin data fetch error, using defaults');
    // Continue with default data
  }
  
  // Pass server-fetched data to client component
  return <AdminDashboardContent user={user} initialData={initialData} />;
} 