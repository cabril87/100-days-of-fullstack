import { ProtectedPagePattern, fetchAuthenticatedData } from '@/lib/auth/auth-config';

// Force dynamic rendering for cookie-based authentication
export const dynamic = 'force-dynamic';
import { MFAStatusResponse } from '@/lib/types/auth';
import { SecurityDashboardDTO, ExtendedUserSessionDTO, UserDeviceDTO, SecurityLevel } from '@/lib/types/session-management';
import SecuritySettings from '@/components/settings/SecuritySettings';

export default async function SecuritySettingsPage() {
  // Get auth session and redirect if not authenticated
  const { session } = await ProtectedPagePattern('/settings/security');
  
  // Create default security dashboard (avoiding null types per enterprise standards)
  const defaultSecurityDashboard: SecurityDashboardDTO = {
    securityScore: 0,
    securityLevel: SecurityLevel.LOW,
    activeSessions: [],
    trustedDevices: [],
    recentEvents: [],
    recommendations: [],
    lastSecurityScan: new Date().toISOString()
  };

  // Server-side data fetching for better performance
  const initialData = {
    securityDashboard: defaultSecurityDashboard,
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
      const dashboardData = await fetchAuthenticatedData<SecurityDashboardDTO>(
        '/api/v1/securitymonitoring/dashboard',
        defaultSecurityDashboard
      );
      initialData.securityDashboard = dashboardData;
    } catch {
      console.debug('Security dashboard not available, using defaults');
    }
    
    // Fetch user sessions
    if (session?.id) {
      try {
        const sessionData = await fetchAuthenticatedData<ExtendedUserSessionDTO[]>(
          `/api/v1/securitymonitoring/users/${session.id}/sessions`,
          []
        );
        if (sessionData) initialData.sessions = sessionData;
      } catch {
        console.debug('Sessions data not available, using defaults');
      }
    }
    
    // Fetch user devices
    if (session?.id) {
      try {
        const deviceData = await fetchAuthenticatedData<UserDeviceDTO[]>(
          `/api/v1/securitymonitoring/devices/user/${session.id}`,
          []
        );
        if (deviceData) initialData.devices = deviceData;
      } catch {
        console.debug('Device data not available, using defaults');
      }
    }
    
    // Fetch MFA status
    try {
      const mfaData = await fetchAuthenticatedData<MFAStatusResponse>('/v1/auth/mfa/status', {
        enabled: false,
        setupDate: null,
        backupCodesRemaining: 0
      });
      if (mfaData) initialData.mfaStatus = mfaData;
    } catch {
      console.debug('MFA status not available, using defaults');
    }
  } catch (error) {
    console.error('Security data fetch error:', error);
    // Continue with default data - component will show placeholders
  }
  
  // Pass server-fetched data to client component
  return <SecuritySettings user={session} initialData={initialData} />;
} 