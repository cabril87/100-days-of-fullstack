'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
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
  Eye,
  Cookie,
  Settings as SettingsIcon,
  TrendingUp
} from 'lucide-react';
import { MFASetupWizard } from '@/components/mfa/MFASetupWizard';
import { MFAStatusCardContainer } from '@/components/mfa/MFAStatusCard';
import { SecurityQuestionSetupForm } from '@/components/auth/SecurityQuestionSetupForm';
import { 
  SecurityLevel,
  SecurityDashboardDTO,
  AdminDashboardResponseDTO,
  UserSecurityOverviewDTO
} from '@/lib/types/auth';
import { 
  securitySettingsSchema,
  SecuritySettingsFormData
} from '@/lib/schemas/settings';
import { SecuritySettingsContentProps } from '@/lib/types/system';
import { securityService, SecurityServiceError } from '@/lib/services/securityService';
import { cookieConsentService } from '@/lib/services/cookieConsentService';
import type { CookieConsentPreferences } from '@/lib/types/ui';

// Client component that handles search params
function SecuritySettingsContentInner({ user, initialData }: SecuritySettingsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [terminatingSessionIds, setTerminatingSessionIds] = useState<Set<number>>(new Set());
  
  // Get tab from URL or default to 'overview'
  const [activeTab, setActiveTab] = useState('overview');

  // State for data (initialized from server)
  const [securityDashboard, setSecurityDashboard] = useState(initialData.securityDashboard);
  const [sessions, setSessions] = useState(initialData.sessions);
  const [devices, setDevices] = useState(initialData.devices);

  // MFA State Management
  const [showMFASetupWizard, setShowMFASetupWizard] = useState(false);
  
  // Cookie Consent State Management
  const [cookiePreferences, setCookiePreferences] = useState<CookieConsentPreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  const securityForm = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      mfaEnabled: initialData.mfaStatus.enabled,
      sessionTimeout: 480, // 8 hours
      trustedDevicesEnabled: true,
      loginNotifications: true,
      dataExportRequest: false,
    },
  });

  // Initialize security service and load cookie preferences
  useEffect(() => {
    securityService.initialize(user.role);
    loadCookiePreferences();
  }, [user.role]);

  // Load current cookie preferences
  const loadCookiePreferences = async () => {
    try {
      const consentState = cookieConsentService.getConsent();
      if (consentState && consentState.preferences) {
        setCookiePreferences(consentState.preferences);
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    }
  };

  // MFA Event Handlers
  const handleMFASetup = (): void => {
    setShowMFASetupWizard(true);
  };

  const handleMFASetupComplete = (backupCodes: string[]): void => {
    securityForm.setValue('mfaEnabled', true);
    setMessage({
      type: 'success',
      text: `MFA enabled successfully! ${backupCodes.length} backup codes generated.`
    });
  };

  const handleMFAStatusChange = (isEnabled: boolean): void => {
    securityForm.setValue('mfaEnabled', isEnabled);
  };

  // Cookie Consent Management
  const handleCookiePreferenceChange = async (category: keyof CookieConsentPreferences, enabled: boolean) => {
    if (category === 'necessary') return; // Can't disable necessary cookies
    
    const newPreferences: CookieConsentPreferences = {
      ...cookiePreferences,
      [category]: enabled
    };
    
    setCookiePreferences(newPreferences);
    
    // Save to service
    try {
      cookieConsentService.setConsent(newPreferences);
      setMessage({
        type: 'success',
        text: `Cookie preferences updated. ${enabled ? 'Enabled' : 'Disabled'} ${category} cookies.`
      });
      
      // Reload page if functional cookies were changed (affects device tracking)
      if (category === 'functional') {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save cookie preferences. Please try again.'
      });
    }
  };

  const handleResetCookieConsent = () => {
    cookieConsentService.resetConsent();
    setCookiePreferences(cookieConsentService.getDefaultPreferences());
    setMessage({
      type: 'success',
      text: 'Cookie consent reset. Please refresh the page to see changes.'
    });
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  // Load additional security data if needed
  const loadSecuritySettings = useCallback(async () => {
    if (!user) return;
    
    try {
      const settings = await securityService.getSecuritySettings(user.id);
      securityForm.reset(settings);
    } catch {
      console.debug('Security settings not available, using defaults');
      securityForm.reset({
        mfaEnabled: initialData.mfaStatus.enabled,
        sessionTimeout: 480,
        trustedDevicesEnabled: true,
        loginNotifications: true,
        dataExportRequest: false
      });
    }
  }, [user, securityForm, initialData.mfaStatus.enabled]);

  // Enhanced session loading with debug info
  const loadSessionsAndDevices = useCallback(async () => {
    if (!user) return;
    
    console.log('🔍 Loading sessions and devices for user:', user.id);
    
    try {
      // Try to load fresh session data
      console.log('📱 Calling getActiveSessions API...');
      const freshSessions = await securityService.getActiveSessions(user.id);
      console.log('📱 Fresh sessions API response:', freshSessions);
      console.log('📱 Sessions array check:', Array.isArray(freshSessions), 'Length:', freshSessions?.length || 'N/A');
      setSessions(Array.isArray(freshSessions) ? freshSessions : []);
      
      // Try to load fresh device data  
      console.log('💻 Calling getUserDevices API...');
      const freshDevices = await securityService.getUserDevices(user.id);
      console.log('💻 User ID being used:', user.id);
      console.log('💻 Fresh devices API response:', freshDevices);
      
      let extractedDevices = [];
      
      if (Array.isArray(freshDevices) && freshDevices.length > 0) {
        console.log('💻 Using devices from dedicated API:', freshDevices.length);
        extractedDevices = freshDevices;
      } else {
        console.log('💻 Devices API returned empty, extracting from sessions...');
        
        // Extract unique devices from sessions
        const deviceMap = new Map();
        
                 freshSessions.forEach(session => {
           if (session.deviceId) {
             const deviceKey = session.deviceId;
             
             // Extract browser and OS from user agent or use session properties if available
             const sessionAny = session as typeof session & { browser?: string; operatingSystem?: string };
             const browser = sessionAny.browser || 'Unknown Browser';
             const operatingSystem = sessionAny.operatingSystem || 'Unknown OS';
             
             if (!deviceMap.has(deviceKey)) {
               deviceMap.set(deviceKey, {
                 id: session.deviceId,
                 name: session.deviceName || `${browser} on ${operatingSystem}`,
                 type: session.deviceType?.toLowerCase() || 'unknown',
                 browser: browser,
                 operatingSystem: operatingSystem,
                 isTrusted: session.isTrusted || false,
                 isCurrentDevice: sessionAny.isCurrentDevice || false,
                 lastSeenAt: session.lastActivityAt,
                 firstSeenAt: session.createdAt,
                 location: session.location || null,
                 ipAddress: session.ipAddress,
                 sessionCount: 1,
                 sessions: [session]
               });
             } else {
               // Update existing device with latest info
               const existingDevice = deviceMap.get(deviceKey);
               existingDevice.sessionCount++;
               existingDevice.sessions.push(session);
               // Update last seen if this session is more recent
               if (new Date(session.lastActivityAt) > new Date(existingDevice.lastSeenAt)) {
                 existingDevice.lastSeenAt = session.lastActivityAt;
                 existingDevice.isTrusted = session.isTrusted || false;
                 existingDevice.isCurrentDevice = sessionAny.isCurrentDevice || false;
               }
             }
           }
         });
        
        extractedDevices = Array.from(deviceMap.values());
        console.log('💻 Extracted devices from sessions:', extractedDevices.length);
        console.log('💻 Device details:', extractedDevices.map(d => ({
          id: d.id,
          name: d.name,
          type: d.type,
          trusted: d.isTrusted,
          sessions: d.sessionCount
        })));
      }
      
      setDevices(extractedDevices);
      
      // Try to load fresh security dashboard data
      console.log('🛡️ Calling getSecurityDashboard API...');
      const freshDashboard = await securityService.getSecurityDashboard();
      console.log('🛡️ Fresh security dashboard API response:', freshDashboard);
      
      if (freshDashboard) {
        console.log('🛡️ Processing security dashboard response...');
        
        // Type guard function to check if it's an admin dashboard
        const isAdminDashboard = (obj: unknown): obj is AdminDashboardResponseDTO => {
          return typeof obj === 'object' && obj !== null && 'overview' in obj;
        };
        
        // Type guard function to check if it's a standard dashboard
        const isStandardDashboard = (obj: unknown): obj is SecurityDashboardDTO => {
          return typeof obj === 'object' && obj !== null && 'securityLevel' in obj;
        };
        
        // Type guard function to check if it's a user overview
        const isUserOverview = (obj: unknown): obj is UserSecurityOverviewDTO => {
          return typeof obj === 'object' && obj !== null && 'securityScore' in obj && !('securityLevel' in obj);
        };
        
        // Check if this is an admin dashboard response with overview
        if (isAdminDashboard(freshDashboard)) {
          console.log('🛡️ Admin dashboard format detected');
          console.log('🛡️ Admin security dashboard details:', {
            securityScore: freshDashboard.overview.securityScore,
            securityStatus: freshDashboard.overview.securityStatus,
            activeUsers24h: freshDashboard.overview.activeUsers24h,
            sessionsCount: freshDashboard.sessionManagement?.activeSessions?.length || 0
          });
          
          // Convert admin dashboard to SecurityDashboardDTO format
          const dashboardData: SecurityDashboardDTO = {
            securityScore: freshDashboard.overview.securityScore || 0,
            securityLevel: freshDashboard.overview.securityScore >= 80 ? SecurityLevel.HIGH : 
                          freshDashboard.overview.securityScore >= 60 ? SecurityLevel.MEDIUM : SecurityLevel.LOW,
            activeSessions: freshDashboard.sessionManagement?.activeSessions || [],
            trustedDevices: [],
            recentEvents: [],
            recommendations: [],
            lastSecurityScan: freshDashboard.lastUpdated || new Date().toISOString()
          };
          setSecurityDashboard(dashboardData);
          
        } else if (isStandardDashboard(freshDashboard)) {
          // Standard SecurityDashboardDTO format
          console.log('🛡️ Standard security dashboard format');
          setSecurityDashboard(freshDashboard);
          
        } else if (isUserOverview(freshDashboard)) {
          // UserSecurityOverviewDTO format  
          console.log('🛡️ User security overview format');
          console.log('🛡️ User security overview details:', {
            securityScore: freshDashboard.securityScore,
            mfaEnabled: freshDashboard.mfaEnabled,
            trustedDevicesCount: freshDashboard.trustedDevicesCount
          });
          
          // Convert to SecurityDashboardDTO format for consistency
          const dashboardData: SecurityDashboardDTO = {
            securityScore: freshDashboard.securityScore || 0,
            securityLevel: freshDashboard.securityScore >= 80 ? SecurityLevel.HIGH : 
                          freshDashboard.securityScore >= 60 ? SecurityLevel.MEDIUM : SecurityLevel.LOW,
            activeSessions: [],
            trustedDevices: [],
            recentEvents: [],
            recommendations: [],
            lastSecurityScan: new Date().toISOString()
          };
          setSecurityDashboard(dashboardData);
          
        } else {
          console.log('🛡️ Unknown dashboard format, using fallback');
          // Fallback dashboard
          const dashboardData: SecurityDashboardDTO = {
            securityScore: 0,
            securityLevel: SecurityLevel.LOW,
            activeSessions: [],
            trustedDevices: [],
            recentEvents: [],
            recommendations: [],
            lastSecurityScan: new Date().toISOString()
          };
          setSecurityDashboard(dashboardData);
        }
      } else {
        console.log('🛡️ No security dashboard data received');
      }
      
    } catch (error) {
      console.error('❌ Failed to load sessions/devices/security:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.substring(0, 200)
        });
      }
      // Keep using initial data if fresh loading fails
    }
  }, [user]);

  useEffect(() => {
    loadSecuritySettings();
    loadSessionsAndDevices(); // Load fresh data on mount
  }, [loadSecuritySettings, loadSessionsAndDevices]);

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

  // Session termination with optimistic updates
  const handleTerminateSession = async (sessionId: number, sessionToken: string) => {
    console.log(`🗑️ Terminating session: ${sessionId} Token: ${sessionToken}`);
    
    try {
      setTerminatingSessionIds(prev => new Set([...prev, sessionId]));
      
      // Call the termination API
      await securityService.terminateSession(sessionToken);
      console.log('✅ Session termination API call succeeded');
      console.log('⚠️ KNOWN BACKEND BUG: API may return success but not actually delete session from database');
      
      // OPTIMISTIC UPDATE: Immediately remove session from UI
      console.log('🔄 Applying optimistic update - removing session from UI');
      setSessions(prevSessions => {
        const updated = prevSessions.filter(session => session.id !== sessionId);
        console.log(`📱 Sessions after optimistic removal: ${updated.length} sessions remaining`);
        return updated;
      });
      
      // Also reload sessions after a delay to verify backend state
      console.log('🔄 Scheduling backend verification reload in 2 seconds...');
      setTimeout(async () => {
        try {
          console.log('🔄 Verification reload: fetching sessions from backend');
          await loadSessionsAndDevices();
        } catch (error) {
          console.error('❌ Verification reload failed:', error);
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Session termination failed:', error);
      
      // Show error to user
      if (error instanceof Error) {
        alert(`Failed to terminate session: ${error.message}`);
      } else {
        alert('Failed to terminate session. Please try again.');
      }
    } finally {
      setTerminatingSessionIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const toggleDeviceTrust = async (deviceId: string, trusted: boolean) => {
    console.log(`🔄 Toggling device trust: ${deviceId} to ${trusted}`);
    
    try {
      const device = devices.find(d => d.id === deviceId);
      console.log('🔍 Device found:', device);
      
      // Try to update device trust - check if device exists first
      try {
        await securityService.updateDeviceTrust(deviceId, trusted, device?.name || undefined, user.id);
        console.log('✅ Device trust updated via API');
      } catch (deviceError: unknown) {
        const error = deviceError as { statusCode?: number; message?: string };
        if (error?.statusCode === 404 && error?.message?.includes('Device') && error?.message?.includes('not found')) {
          console.log('⚠️ Device not found in backend, this is expected for devices extracted from sessions');
          
          // Device doesn't exist in device management system yet
          // This is a known architecture limitation where:
          // 1. Sessions track devices automatically
          // 2. Device management system requires explicit device registration
          // 3. We need to implement device auto-registration from sessions
          
          setMessage({ 
            type: 'error', 
            text: `Device "${device?.name}" is tracked in sessions but not yet registered in device management. This feature requires backend enhancement to auto-register devices from active sessions.` 
          });
          return;
        } else {
          throw deviceError;
        }
      }

      // Update local device state
      setDevices(devices.map(d => d.id === deviceId ? { ...d, isTrusted: trusted } : d));
      
      // Also update sessions that belong to this device
      setSessions(sessions.map(s => s.deviceId === deviceId ? { ...s, isTrusted: trusted } : s));
      
      setMessage({ type: 'success', text: `Device "${device?.name}" ${trusted ? 'trusted' : 'untrusted'} successfully` });
      
      console.log('🔄 Reloading sessions and devices to verify changes...');
      // Reload data to verify changes
      setTimeout(() => {
        loadSessionsAndDevices();
      }, 1000);
      
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Settings</TabsTrigger>
          <TabsTrigger value="security-questions">Security Questions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="cookies">Privacy</TabsTrigger>
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
              {/* Comprehensive MFA Management */}
              <div className="space-y-6">
                <MFAStatusCardContainer 
                  onSetupMFA={handleMFASetup}
                  onMFAStatusChange={handleMFAStatusChange}
                />
              </div>

              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6 mt-6">
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

        {/* Security Questions */}
        <TabsContent value="security-questions" className="space-y-6">
          <SecurityQuestionSetupForm
            userAgeGroup={(user?.ageGroup as unknown as 'Child' | 'Teen' | 'Adult') || 'Adult'}
            showAgeAppropriate={true}
            isUpdate={true}
            onSuccess={() => {
              setMessage({
                type: 'success',
                text: 'Security questions updated successfully!'
              });
            }}
          />
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Active Sessions ({sessions.length})
                  </CardTitle>
                  <CardDescription>
                    Manage where you&apos;re signed in across devices
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSessionsAndDevices}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Sessions Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This could mean session tracking isn&apos;t working properly or you&apos;re not logged in with session tracking enabled.
                  </p>
                  <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto">
                    <p><strong>Debug Info:</strong></p>
                    <p>User ID: {user?.id}</p>
                    <p>User Role: {user?.role}</p>
                    <p>Initial Sessions: {initialData.sessions.length}</p>
                    <p>Current Sessions: {sessions.length}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={loadSessionsAndDevices}
                    className="mt-4"
                  >
                    Try Refresh
                  </Button>
                </div>
              ) : (
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
                          onClick={() => handleTerminateSession(session.id, session.sessionToken)}
                          disabled={terminatingSessionIds.has(session.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          {terminatingSessionIds.has(session.id) ? (
                            <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trusted Devices */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Trusted Devices ({devices.length})
                  </CardTitle>
                  <CardDescription>
                    Devices you&apos;ve marked as trusted for faster sign-ins
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSessionsAndDevices}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="text-center py-8">
                  <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Devices Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Device tracking may not be enabled or working properly.
                  </p>
                  <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto">
                    <p><strong>Debug Info:</strong></p>
                    <p>User ID: {user?.id}</p>
                    <p>User Role: {user?.role}</p>
                    <p>Initial Devices: {initialData.devices.length}</p>
                    <p>Current Devices: {devices.length}</p>
                    <p><strong>Check browser console for API details</strong></p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={loadSessionsAndDevices}
                    >
                      Refresh Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('🔧 Manual device debug trigger');
                        console.log('🔧 Current devices state:', devices);
                        console.log('🔧 Initial devices data:', initialData.devices);
                        console.log('🔧 User info:', { id: user?.id, role: user?.role });
                        console.log('🔧 Security service mode:', { 
                          isAdminMode: securityService.isAdminMode, 
                          userRole: securityService.userRole 
                        });
                        
                        // Check cookie consent status
                        console.log('🍪 Cookie Consent Debug:');
                        console.log('🍪 Document cookies:', document.cookie);
                        console.log('🍪 LocalStorage consent:', localStorage.getItem('tasktracker_cookie_consent'));
                        console.log('🍪 SessionStorage consent:', sessionStorage.getItem('cookie-consent'));
                        
                        // Check if functional cookies are allowed using our service
                        const consentState = cookieConsentService.getConsent();
                        console.log('🍪 Consent state:', consentState);
                        const hasFunctionalConsent = cookieConsentService.hasFunctionalConsent();
                        console.log('🍪 Has functional consent:', hasFunctionalConsent);
                        
                        if (!hasFunctionalConsent) {
                          console.log('⚠️ DEVICE TRACKING DISABLED: Functional cookies are not enabled');
                          console.log('⚠️ To enable device tracking:');
                          console.log('   1. Go to Cookies tab in Security Settings');
                          console.log('   2. Enable "Functional Cookies"');
                          console.log('   3. Refresh the page');
                        }
                        
                        // Device fingerprint check
                        console.log('🔍 Device Fingerprint Check:');
                        console.log('🔍 User Agent:', navigator.userAgent);
                        console.log('🔍 Screen:', `${screen.width}x${screen.height}`);
                        console.log('🔍 Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
                        console.log('🔍 Language:', navigator.language);
                        console.log('🔍 Platform:', navigator.platform);
                      }}
                    >
                      Debug Info
                    </Button>
                  </div>
                </div>
              ) : (
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
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cookie Consent Management */}
        <TabsContent value="cookies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Cookie Preferences
              </CardTitle>
              <CardDescription>
                Manage your cookie consent and privacy preferences. 
                <strong className="text-purple-600"> Functional cookies are required for device tracking and security features.</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cookie Categories */}
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium">Necessary Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Essential for the website to function properly
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                    Examples: Authentication, security, basic functionality
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <SettingsIcon className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium">Functional Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Enable device tracking and personalized experiences
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.functional}
                        onChange={(e) => handleCookiePreferenceChange('functional', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                    Examples: Device fingerprinting, preferences, trusted devices
                  </p>
                  {cookiePreferences.functional && (
                    <div className="mt-2 ml-8 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300">
                      ✅ Device tracking enabled - Security features fully functional
                    </div>
                  )}
                  {!cookiePreferences.functional && (
                    <div className="mt-2 ml-8 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-700 dark:text-orange-300">
                      ⚠️ Device tracking disabled - Some security features may not work properly
                    </div>
                  )}
                </div>

                {/* Analytics Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Analytics Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Help us improve our services
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.analytics}
                        onChange={(e) => handleCookiePreferenceChange('analytics', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                    Examples: Page views, user behavior, performance metrics
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-orange-600" />
                      <div>
                        <h4 className="font-medium">Marketing Cookies</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Personalized advertisements and content
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.marketing}
                        onChange={(e) => handleCookiePreferenceChange('marketing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                    Examples: Ad targeting, social media integration, tracking pixels
                  </p>
                </div>
              </div>

              {/* Cookie Management Actions */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Reset Cookie Consent</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Clear all cookie preferences and show consent banner again
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                    onClick={handleResetCookieConsent}
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset Consent
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Cookie Information
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    We use cookies to enhance your experience and provide essential security features.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a 
                      href="/privacy" 
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                    <a 
                      href="/cookies" 
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cookie Policy
                    </a>
                  </div>
                </div>
              </div>

              {/* Privacy Controls Section */}
              <div className="border-t pt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Privacy Controls
                </h4>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MFA Setup Wizard */}
      <MFASetupWizard 
        isOpen={showMFASetupWizard}
        onClose={() => setShowMFASetupWizard(false)}
        onComplete={handleMFASetupComplete}
      />
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
export default function SecuritySettingsContent(props: SecuritySettingsContentProps) {
  return (
    <Suspense fallback={<SecuritySettingsLoading />}>
      <SecuritySettingsContentInner {...props} />
    </Suspense>
  );
} 
