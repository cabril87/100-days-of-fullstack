import { requireAuth, serverApiCall } from '@/lib/utils/serverAuth';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';
import { MFAStatusResponse } from '@/lib/types/auth';
import { SecurityDashboardDTO, ExtendedUserSessionDTO, UserDeviceDTO } from '@/lib/types/session-management';
import SecuritySettingsContent from './SecuritySettingsContent';

export default async function SecuritySettingsPage() {
  // Server-side authentication - redirect if not authenticated
  const user = await requireAuth();
  
  // Server-side data fetching for better performance
  const initialData = {
    securityDashboard: null as SecurityDashboardDTO | null,
    sessions: [] as ExtendedUserSessionDTO[],
    devices: [] as UserDeviceDTO[],
    mfaStatus: {
      enabled: false,
      setupDate: null as string | null,
      backupCodesRemaining: 0
    }
  };
  
  try {
    // Fetch security dashboard data
    try {
      const dashboardData = await serverApiCall<SecurityDashboardDTO>('/api/v1/securitymonitoring/dashboard');
      initialData.securityDashboard = dashboardData;
    } catch {
      console.debug('Security dashboard not available, using defaults');
    }
    
    // Fetch user sessions
    try {
      const sessionData = await serverApiCall<ExtendedUserSessionDTO[]>(`/api/v1/securitymonitoring/users/${user.id}/sessions`);
      initialData.sessions = sessionData;
    } catch {
      console.debug('Sessions data not available, using defaults');
    }
    
    // Fetch user devices
    try {
      const deviceData = await serverApiCall<UserDeviceDTO[]>(`/api/v1/securitymonitoring/devices/user/${user.id}`);
      initialData.devices = deviceData;
    } catch {
      console.debug('Device data not available, using defaults');
    }
    
    // Fetch MFA status
    try {
      const mfaData = await serverApiCall<MFAStatusResponse>('/api/v1/auth/mfa/status');
      initialData.mfaStatus = mfaData;
    } catch {
      console.debug('MFA status not available, using defaults');
    }
  } catch (error) {
    console.error('Security data fetch error:', error);
    // Continue with default data - component will show placeholders
  }
  
  // Pass server-fetched data to client component
  return <SecuritySettingsContent user={user} initialData={initialData} />;
} 