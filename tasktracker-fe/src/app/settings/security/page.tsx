'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Smartphone,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Trash2,
  Download,
  Save,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import { 
  SecurityDashboardSkeleton,
  DeviceListSkeleton
} from '@/components/ui/skeletons/session-management-skeletons';
import { 
  SecurityDashboardDTO,
  ExtendedUserSessionDTO,
  UserDeviceDTO,
  SecurityLevel,
  UserSecurityOverviewDTO
} from '@/lib/types/session-management';
import { 
  securitySettingsSchema,
  SecuritySettingsFormData
} from '@/lib/schemas/settings';
import { securityService, SecurityServiceError } from '@/lib/services/securityService';
import { ApiClientError } from '@/lib/config/api-client';

// Client component that handles search params
function SecuritySettingsContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Get tab from URL or default to 'overview'
  const [activeTab, setActiveTab] = useState('overview');

  // State for real data
  const [securityDashboard, setSecurityDashboard] = useState<SecurityDashboardDTO | null>(null);
  const [sessions, setSessions] = useState<ExtendedUserSessionDTO[]>([]);
  const [devices, setDevices] = useState<UserDeviceDTO[]>([]);

  const securityForm = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      mfaEnabled: false,
      sessionTimeout: 480, // 8 hours
      trustedDevicesEnabled: true,
      loginNotifications: true,
      dataExportRequest: false,
    },
  });

  // Load security data with real API calls
  const loadSecurityData = useCallback(async () => {
    if (!user) return;
    
    // Initialize security service with user role
    securityService.initialize(user.role);
    
    setIsLoading(true);
    try {
      // Load security dashboard data (conditional based on user role)
      try {
        const dashboardData = await securityService.getSecurityDashboard();
        
        // Handle different return types based on user role
        if ('securityLevel' in dashboardData) {
          // Admin user - full SecurityDashboardDTO
          setSecurityDashboard(dashboardData as SecurityDashboardDTO);
        } else {
          // Regular user - UserSecurityOverviewDTO, convert to SecurityDashboardDTO
          const userOverview = dashboardData as UserSecurityOverviewDTO;
          setSecurityDashboard({
            securityScore: userOverview.securityScore,
            securityLevel: userOverview.securityScore >= 80 ? SecurityLevel.HIGH : 
                          userOverview.securityScore >= 60 ? SecurityLevel.MEDIUM : SecurityLevel.LOW,
            activeSessions: [],
            trustedDevices: [],
            recentEvents: [],
            recommendations: [],
            lastSecurityScan: userOverview.lastSecurityScan
          });
        }
      } catch (dashboardError) {
        // Gracefully handle 403 errors for non-admin users
        if (dashboardError instanceof ApiClientError && dashboardError.statusCode === 403) {
          console.log('Security dashboard not accessible (requires admin role)');
          // Set a basic security dashboard for non-admin users
          setSecurityDashboard({
            securityScore: 75,
            securityLevel: SecurityLevel.MEDIUM,
            activeSessions: [],
            trustedDevices: [],
            recentEvents: [],
            recommendations: [],
            lastSecurityScan: new Date().toISOString()
          });
        } else {
          console.warn('Failed to load security dashboard:', dashboardError);
          // Still set basic dashboard to avoid UI errors
          setSecurityDashboard({
            securityScore: 70,
            securityLevel: SecurityLevel.MEDIUM,
            activeSessions: [],
            trustedDevices: [],
            recentEvents: [],
            recommendations: [],
            lastSecurityScan: new Date().toISOString()
          });
        }
      }

      // Load user sessions  
      try {
        const sessionData = await securityService.getActiveSessions(user.id);
        console.debug('Raw session data:', sessionData);
        setSessions(Array.isArray(sessionData) ? sessionData : []);
      } catch (sessionError) {
        // Gracefully handle 403 errors for admin-only endpoints
        if (sessionError instanceof ApiClientError && sessionError.statusCode === 403) {
          console.log('Sessions endpoint not accessible (requires admin role)');
          // Set a single current session for non-admin users
          setSessions([{
            id: 1,
            userId: user.id,
            username: user.username || user.email,
            sessionToken: 'current-session',
            deviceId: 'current-device',
            deviceName: 'Current Browser',
            deviceType: 'Web Browser',
            ipAddress: 'Current IP',
            userAgent: navigator.userAgent || 'Unknown Agent',
            location: 'Current Location', 
            isActive: true,
            isTrusted: true,
            createdAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            isCurrentDevice: true
          }]);
        } else {
          console.warn('Failed to load sessions:', sessionError);
          setSessions([]);
        }
      }

      // Load user devices
      try {
        const deviceData = await securityService.getUserDevices(user.id);
        console.debug('Raw device data:', deviceData);
        setDevices(Array.isArray(deviceData) ? deviceData : []);
      } catch (deviceError) {
        // Gracefully handle 403 errors for admin-only endpoints
        if (deviceError instanceof ApiClientError && deviceError.statusCode === 403) {
          console.log('Devices endpoint not accessible (requires admin role)');
          // Set a single current device for non-admin users
          setDevices([{
            id: 'current-device',
            name: 'Current Device',
            type: 'Web Browser',
            operatingSystem: navigator.platform || 'Unknown OS',
            browser: navigator.userAgent ? navigator.userAgent.split(' ')[0] : 'Unknown Browser',
            ipAddress: 'Current IP',
            location: 'Current Location',
            isTrusted: true,
            isCurrentDevice: true,
            firstSeenAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            sessionCount: 1
          }]);
        } else {
          console.warn('Failed to load devices:', deviceError);
          setDevices([]);
        }
      }

      // Load security settings
      try {
        const settings = await securityService.getSecuritySettings(user.id);
        securityForm.reset(settings);
      } catch (settingsError) {
        // Gracefully handle 403 errors for admin-only endpoints
        if (settingsError instanceof ApiClientError && settingsError.statusCode === 403) {
          console.log('Security settings endpoint not accessible (requires admin role)');
          // Use default security settings for non-admin users
          securityForm.reset({
            mfaEnabled: false,
            sessionTimeout: 30,
            trustedDevicesEnabled: true,
            loginNotifications: true,
            dataExportRequest: false
          });
        } else {
          // Security settings endpoint might not exist yet, use defaults
          console.warn('Security settings not available, using defaults');
          securityForm.reset({
            mfaEnabled: false,
            sessionTimeout: 30,
            trustedDevicesEnabled: true,
            loginNotifications: true,
            dataExportRequest: false
          });
        }
      }

    } catch (error) {
      console.error('Failed to load security data:', error);
      if (error instanceof SecurityServiceError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to load security information' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, securityForm]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadSecurityData();
    }
  }, [isAuthenticated, user, loadSecurityData]);

  // Initialize activeTab from URL on mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'sessions', 'devices', 'privacy'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab changes with URL updates
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`/settings/security?${params.toString()}`, { scroll: false });
  };

  const onSecuritySubmit = async (data: SecuritySettingsFormData): Promise<void> => {
    if (!user) return;
    
    setIsLoading(true);
    setMessage(null);

    try {
      await securityService.updateSecuritySettings(data, user.id);
      setMessage({ type: 'success', text: 'Security settings updated successfully!' });
    } catch (error) {
      console.error('Failed to update security settings:', error);
      if (error instanceof SecurityServiceError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to update security settings' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const terminateSession = async (sessionId: number) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) return;

      await securityService.terminateSession(session.sessionToken);
      
      // Reload sessions from the server to get fresh data
      if (user) {
        const sessionData = await securityService.getActiveSessions(user.id);
        setSessions(Array.isArray(sessionData) ? sessionData : []);
      }
      
      setMessage({ type: 'success', text: 'Session terminated successfully' });
    } catch (error) {
      console.error('Failed to terminate session:', error);
      if (error instanceof SecurityServiceError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to terminate session' });
      }
    }
  };

  const toggleDeviceTrust = async (deviceId: string, trusted: boolean) => {
        try {
      const device = devices.find(d => d.id === deviceId);
      await securityService.updateDeviceTrust(deviceId, trusted, device?.name || undefined);

      // Update local state
      setDevices(devices.map(d => d.id === deviceId ? { ...d, isTrusted: trusted } : d));
      setMessage({ type: 'success', text: `Device ${trusted ? 'trusted' : 'untrusted'} successfully` });
    } catch (error) {
      console.error('Failed to update device trust:', error);
      if (error instanceof SecurityServiceError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to update device trust' });
      }
    }
  };

  const handleDataExport = async () => {
    try {
      await securityService.requestDataExport('complete', 'json');
      setMessage({ type: 'success', text: 'Data export requested successfully. You will receive an email when ready.' });
    } catch (error) {
      console.error('Failed to request data export:', error);
      if (error instanceof SecurityServiceError && error.status === 404) {
        setMessage({ type: 'error', text: 'Data export feature is not available yet. This feature is coming soon!' });
      } else if (error instanceof SecurityServiceError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to request data export' });
      }
    }
  };

  const handleClearActivityLog = async () => {
    if (!user) return;
    
    try {
      await securityService.clearActivityLog(user.id);
      setMessage({ type: 'success', text: 'Activity log cleared successfully' });
    } catch (error) {
      console.error('Failed to clear activity log:', error);
      if (error instanceof SecurityServiceError && error.status === 404) {
        setMessage({ type: 'error', text: 'Clear activity log feature is not available yet. This feature is coming soon!' });
      } else if (error instanceof SecurityServiceError) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to clear activity log' });
      }
    }
  };

  const getSecurityLevelColor = (level: SecurityLevel) => {
    switch (level) {
      case SecurityLevel.LOW: return 'text-red-600 bg-red-50 border-red-200';
      case SecurityLevel.MEDIUM: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case SecurityLevel.HIGH: return 'text-green-600 bg-green-50 border-green-200';
      case SecurityLevel.CRITICAL: return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string | null | undefined) => {
    // Handle null, undefined, or empty strings
    if (!dateString || dateString.trim() === '') {
      console.debug('formatTimeAgo: Empty or null date string');
      return 'Unknown';
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.debug('formatTimeAgo: Invalid date string:', dateString);
      return 'Unknown';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Handle negative time differences (future dates)
    if (diffMs < 0) {
      console.debug('formatTimeAgo: Future date detected:', dateString);
      return 'Just now';
    }
    
    const diffMins = Math.floor(diffMs / 60000);

    // Just now only for current minute (< 1 minute)
    if (diffMins < 1) return 'Just now';
    
    // Minutes ago for 1-59 minutes
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    // If it's today, just show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
    
    // If it's this year, show month/day and time
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // If it's a different year, show full date and time
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Show loading skeleton while checking authentication or loading data
  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="space-y-6">
        <SecurityDashboardSkeleton 
          showScoreCard={true} 
          showRecommendations={true}
          showActivityFeed={false}
          cardCount={3}
        />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
        <DeviceListSkeleton 
          deviceCount={3} 
          showSecurityBadges={true}
          showTrustIndicators={true}
          showActions={true} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Privacy & Security Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account security, sessions, and privacy settings
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Security Dashboard Overview */}
      {securityDashboard && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Overview
            </CardTitle>
            <CardDescription>
              Your account security status and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Security Score */}
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                  <div 
                    className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-blue-500 transform -rotate-90"
                    style={{
                      strokeDasharray: `${securityDashboard.securityScore * 1.26} 126`,
                      strokeDashoffset: 0,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {securityDashboard.securityScore}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security Score</p>
              </div>

              {/* Security Level */}
              <div className="text-center">
                <Badge 
                  className={`text-lg px-4 py-2 mb-3 ${getSecurityLevelColor(securityDashboard.securityLevel || SecurityLevel.MEDIUM)}`}
                >
                  {(securityDashboard.securityLevel || 'MEDIUM').toUpperCase()}
                </Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400">Security Level</p>
              </div>

              {/* Active Sessions */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {sessions.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</p>
              </div>
            </div>

            {/* Recommendations */}
            {securityDashboard.recommendations && securityDashboard.recommendations.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Security Recommendations</h4>
                <div className="space-y-2">
                  {securityDashboard.recommendations.map((rec) => (
                    <div key={rec.id} className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900 dark:text-blue-100">{rec.title}</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{rec.description}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Enable
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Settings Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Settings</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Security Settings */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure your account security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                  <FormField
                    control={securityForm.control}
                    name="mfaEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            Two-Factor Authentication
                          </FormLabel>
                          <FormDescription>
                            Add an extra layer of security with authenticator app
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="sessionTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Timeout (minutes)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timeout duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="240">4 hours</SelectItem>
                            <SelectItem value="480">8 hours</SelectItem>
                            <SelectItem value="1440">24 hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Automatically sign out after period of inactivity
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="trustedDevicesEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            Trusted Devices
                          </FormLabel>
                          <FormDescription>
                            Remember devices to reduce security prompts
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={securityForm.control}
                    name="loginNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">
                            Login Notifications
                          </FormLabel>
                          <FormDescription>
                            Get notified of new sign-ins to your account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage where you&apos;re signed in across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        {session.deviceType === 'mobile' ? (
                          <Smartphone className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Monitor className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {session.deviceName || `${session.deviceType} device`}
                          </span>
                          {session.isCurrentDevice && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {session.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active {formatTimeAgo(session.lastActivityAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.isTrusted && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {!session.isCurrentDevice && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => terminateSession(session.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No active sessions found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trusted Devices */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Trusted Devices
              </CardTitle>
              <CardDescription>
                Devices you&apos;ve marked as trusted for faster sign-ins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        {device.type === 'mobile' ? (
                          <Smartphone className="h-5 w-5 text-green-600" />
                        ) : (
                          <Monitor className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {device.name || `${device.browser} on ${device.operatingSystem}`}
                          </span>
                          {device.isCurrentDevice && (
                            <Badge variant="secondary">This device</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          {device.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {device.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last seen {formatTimeAgo(device.lastSeenAt)}
                          </span>
                          <span>{device.sessionCount} sessions</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDeviceTrust(device.id, !device.isTrusted)}
                        className={device.isTrusted ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                      >
                        {device.isTrusted ? (
                          <>
                            <Unlock className="h-4 w-4 mr-1" />
                            Untrust
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-1" />
                            Trust
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                {devices.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No devices found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Controls */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Controls
              </CardTitle>
              <CardDescription>
                Control your data and account privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Export Your Data</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download a copy of your account data
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2" 
                    onClick={handleDataExport}
                    title="Feature coming soon"
                  >
                    <Download className="h-4 w-4" />
                    Export Data
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Clear Activity Log</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remove your activity history (cannot be undone)
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    onClick={handleClearActivityLog}
                    title="Feature coming soon"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Log
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-900/20">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">Delete Account</p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive" className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Loading component for Suspense fallback
function SecuritySettingsLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>
  );
}

// Main export function with Suspense wrapper
export default function SecuritySettingsPage() {
  return (
    <Suspense fallback={<SecuritySettingsLoading />}>
      <SecuritySettingsContent />
    </Suspense>
  );
} 