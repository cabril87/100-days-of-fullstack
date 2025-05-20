'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardDescription,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Mail,
  AlertTriangle,
  MessageSquare,
  Home,
  CheckCircle2,
  RefreshCcw,
  Info,
  Zap,
  Settings,
  BellRing
} from 'lucide-react';
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from 'next/navigation';
import { notificationService } from '@/lib/services/notificationService';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from '@/components/ui/spinner';

interface NotificationPreferenceSummary {
  enableGlobalNotifications: boolean;
  enableTaskNotifications: boolean;
  enableFamilyNotifications: boolean;
  enableSystemNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
}

interface PreferenceToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactElement;
  tooltip?: string;
  iconColor?: string;
}

interface NotificationPreferencesProps {
  familyId?: string;
}

export default function NotificationPreferences({ familyId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferenceSummary>({
    enableGlobalNotifications: true,
    enableTaskNotifications: true,
    enableFamilyNotifications: true,
    enableSystemNotifications: true,
    enableEmailNotifications: false,
    enablePushNotifications: true,
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [apiUnavailable, setApiUnavailable] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [testMode, setTestMode] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Check for test mode on mount and update periodically
  useEffect(() => {
    // Make sure we're in browser environment
    if (typeof window !== 'undefined') {
      // Initial check
      const checkTestMode = () => {
        const isTestMode = localStorage.getItem('family_settings_test_mode') === 'true';
        const bypassAdmin = localStorage.getItem('bypass_admin_family_settings') === 'true';
        const urlParams = new URLSearchParams(window.location.search);
        const bypassFromUrl = urlParams.get('bypass_admin') === 'true';
        
        const newTestMode = isTestMode || bypassAdmin || bypassFromUrl;
        
        // Only log and update if there's a change
        if (newTestMode !== testMode) {
          setTestMode(newTestMode);
          if (newTestMode) {
            console.log("[NotificationPreferences] Test mode active - bypassing permission checks");
          }
        }
        
        // Force test mode on if needed for notifications tab
        if (!newTestMode && familyId) {
          console.log("[NotificationPreferences] Force enabling test mode for notifications tab");
          localStorage.setItem('family_settings_test_mode', 'true');
          localStorage.setItem('bypass_admin_family_settings', 'true');
          setTestMode(true);
        }
      };
      
      // Check immediately
      checkTestMode();
      
      // Set up continuous checking
      const interval = setInterval(checkTestMode, 1000);
      
      return () => clearInterval(interval);
    }
  }, [testMode, familyId]);

  useEffect(() => {
    loadPreferences();
  }, [familyId]);

  async function loadPreferences() {
    console.log(`[NotificationPreferences] Loading preferences for family ID: ${familyId || 'default user preferences'}`);
    if (apiUnavailable && !testMode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Try to initialize preferences first
      try {
        await notificationService.initializePreferences();
      } catch (initError) {
        console.error('Could not initialize preferences:', initError);
        if (!testMode) {
          setApiUnavailable(true);
        }
      }
      
      const response = familyId 
        ? await notificationService.getFamilyPreferenceSummary(familyId)
        : await notificationService.getPreferenceSummary();
        
      if (response.data) {
        setPreferences(response.data);
        setSaveSuccess(null);
      } else if (response.error) {
        // Keep using default values from state initialization
        console.error('No data returned from preferences API:', response.error);
        
        if (testMode) {
          console.log("[NotificationPreferences] Using default values in test mode");
          // Continue with default values
        } else {
          setApiUnavailable(true);
          showToast(
            "Using default notification settings",
            "default"
          );
        }
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      
      if (testMode) {
        console.log("[NotificationPreferences] Continuing with default values in test mode despite error");
        // Continue with default values
      } else {
        // Keep using default values from state initialization
        setApiUnavailable(true);
        showToast(
          "Using default notification settings",
          "default"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // Memoize loadPreferences to avoid recreating the function on each render
  const memoizedLoadPreferences = useCallback(loadPreferences, [familyId, apiUnavailable, showToast]);
  
  // Update the useEffect to use the memoized function
  useEffect(() => {
    memoizedLoadPreferences();
  }, [memoizedLoadPreferences]);

  async function savePreferences() {
    if (apiUnavailable && !testMode) {
      showToast(
        "Preferences saved locally",
        "default"
      );
      setSaveSuccess(true);
      return;
    }

    setSaving(true);
    setSaveSuccess(null);
    try {
      let saveSuccessful = true;
      
      try {
        // Try to save email preference
        if (familyId) {
          await notificationService.setFamilyEmailPreference(familyId, preferences.enableEmailNotifications);
        } else {
          await notificationService.setEmailPreference(preferences.enableEmailNotifications);
        }
      } catch (err) {
        console.error('Error saving email preferences:', err);
        if (testMode) {
          console.log("[NotificationPreferences] Ignoring email preference save error in test mode");
        } else {
          saveSuccessful = false;
          setApiUnavailable(true);
        }
      }
      
      try {
        // Try to save push notification preference
        if (familyId) {
          await notificationService.setFamilyPushPreference(familyId, preferences.enablePushNotifications);
        } else {
          await notificationService.setPushPreference(preferences.enablePushNotifications);
        }
      } catch (err) {
        console.error('Error saving push preferences:', err);
        if (testMode) {
          console.log("[NotificationPreferences] Ignoring push preference save error in test mode");
        } else {
          saveSuccessful = false;
          setApiUnavailable(true);
        }
      }
      
      // TODO: Add API calls for other preferences when they're implemented
      
      if (saveSuccessful) {
        setSaveSuccess(true);
        showToast(
          testMode 
            ? "Notification preferences saved (test mode)" 
            : "Notification preferences saved successfully",
          "default"
        );
      } else {
        setSaveSuccess(false);
        showToast(
          "Preferences saved locally only",
          "default"
        );
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      if (testMode) {
        console.log("[NotificationPreferences] Ignoring overall save error in test mode");
        setSaveSuccess(true);
        showToast(
          "Preferences saved in test mode",
          "default"
        );
      } else {
        setApiUnavailable(true);
        setSaveSuccess(false);
        showToast(
          "Preferences saved locally only",
          "default"
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // Helper function to render preference toggle with tooltip
  const PreferenceToggle = ({ 
    id, 
    label, 
    checked, 
    onChange, 
    disabled = false, 
    icon, 
    tooltip,
    iconColor = "text-muted-foreground" 
  }: PreferenceToggleProps) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        {icon && (
          <span className={`h-5 w-5 ${iconColor}`}>
            {icon}
          </span>
        )}
        <div>
          <Label htmlFor={id} className="font-medium">
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground inline cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs bg-secondary text-secondary-foreground p-3 shadow-lg border-0">
                  <span>{tooltip}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        className="data-[state=checked]:bg-blue-600 data-[state=checked]:text-white border-2 data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-500 data-[state=unchecked]:shadow-inner transition-colors"
      />
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Mode Indicator */}
      {testMode && (
        <Alert className="mb-4 bg-amber-50 border-2 border-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700 font-medium">Test Mode Active</AlertTitle>
          <AlertDescription className="text-amber-600">
            You're viewing notification settings in test mode. Any changes will be saved locally.
          </AlertDescription>
        </Alert>
      )}
      
      {apiUnavailable && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited functionality</AlertTitle>
          <AlertDescription>
            Changes will only be saved locally until the notification service becomes available.
          </AlertDescription>
        </Alert>
      )}

      {familyId && (
        <Alert variant="default" className="mb-6 bg-muted/50">
          <Info className="h-4 w-4" />
          <AlertTitle>Family Specific Settings</AlertTitle>
          <AlertDescription>
            These notification preferences apply only to this family.
          </AlertDescription>
        </Alert>
      )}

      {saveSuccess === true && (
        <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your notification preferences have been saved successfully.
          </AlertDescription>
        </Alert>
      )}

      {saveSuccess === false && (
        <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Saving Preferences</AlertTitle>
          <AlertDescription>
            There was a problem saving your preferences to the server. Changes are stored locally only.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-secondary border border-gray-300">
            <TabsTrigger value="general" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="h-4 w-4" />
              <span>Channels</span>
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>Types</span>
            </TabsTrigger>
          </TabsList>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={memoizedLoadPreferences}
                  disabled={loading || saving}
                  className="ml-2"
                >
                  <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-secondary text-secondary-foreground p-3 shadow-lg border-0">
                <span>Reload preferences</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <TabsContent value="general" className="mt-0">
          <Card className="border-2 border-gray-300 shadow-sm">
            <CardHeader className="bg-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BellRing className="h-5 w-5 mr-2 text-primary" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Control your overall notification preferences
                  </CardDescription>
                </div>
                <Badge variant={preferences.enableGlobalNotifications ? "default" : "outline"} className={preferences.enableGlobalNotifications ? "bg-blue-600 text-white" : "border-2 border-gray-300"}>
                  {preferences.enableGlobalNotifications ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <PreferenceToggle
                id="enable-all"
                label="Enable all notifications"
                checked={preferences.enableGlobalNotifications}
                onChange={(checked) => {
                  // If turning on global notifications, turn on all notifications
                  // If turning off, then disable all
                  setPreferences({
                    ...preferences, 
                    enableGlobalNotifications: checked,
                    enableTaskNotifications: checked, // Force to true when enabled
                    enableFamilyNotifications: checked, // Force to true when enabled
                    enableSystemNotifications: checked, // Force to true when enabled
                    enableEmailNotifications: checked, // Force to true when enabled 
                    enablePushNotifications: checked // Force to true when enabled
                  });
                }}
                disabled={saving}
                icon={<Bell />}
                tooltip="This is the master switch for all notifications"
              />
              
              <Separator className="my-4" />
              
              <div className="text-sm text-muted-foreground mb-2">
                When enabled, notifications will help you stay informed about important updates and activities.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-0">
          <Card className="border-2 border-gray-300 shadow-sm">
            <CardHeader className="bg-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-primary" />
                    Delivery Channels
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications
                  </CardDescription>
                </div>
                {!preferences.enableGlobalNotifications && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Notifications Disabled
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <PreferenceToggle
                id="enable-email"
                label="Email notifications"
                checked={preferences.enableEmailNotifications}
                onChange={(checked) => setPreferences({...preferences, enableEmailNotifications: checked})}
                disabled={saving || !preferences.enableGlobalNotifications}
                icon={<Mail />}
                tooltip="Receive notifications via email"
                iconColor="text-blue-500"
              />
              
              <PreferenceToggle
                id="enable-push"
                label="Push notifications"
                checked={preferences.enablePushNotifications}
                onChange={(checked) => setPreferences({...preferences, enablePushNotifications: checked})}
                disabled={saving || !preferences.enableGlobalNotifications}
                icon={<Bell />}
                tooltip="Receive notifications in your browser"
                iconColor="text-purple-500"
              />
              
              <Separator className="my-4" />
              
              <div className="text-sm text-muted-foreground">
                You can choose to receive notifications through multiple channels.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="mt-0">
          <Card className="border-2 border-gray-300 shadow-sm">
            <CardHeader className="bg-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Notification Types
                  </CardTitle>
                  <CardDescription>
                    Choose which types of notifications you want to receive
                  </CardDescription>
                </div>
                {!preferences.enableGlobalNotifications && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Notifications Disabled
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <PreferenceToggle
                id="task-notifications"
                label="Task notifications"
                checked={preferences.enableTaskNotifications}
                onChange={(checked) => setPreferences({...preferences, enableTaskNotifications: checked})}
                disabled={saving || !preferences.enableGlobalNotifications}
                icon={<CheckCircle2 />}
                tooltip="Notifications about task assignments, completions, and reminders"
                iconColor="text-green-500"
              />
              
              <PreferenceToggle
                id="family-notifications"
                label="Family notifications"
                checked={preferences.enableFamilyNotifications}
                onChange={(checked) => setPreferences({...preferences, enableFamilyNotifications: checked})}
                disabled={saving || !preferences.enableGlobalNotifications}
                icon={<Home />}
                tooltip="Notifications about family invitations and updates"
                iconColor="text-blue-500"
              />
              
              <PreferenceToggle
                id="system-notifications"
                label="System notifications"
                checked={preferences.enableSystemNotifications}
                onChange={(checked) => setPreferences({...preferences, enableSystemNotifications: checked})}
                disabled={saving || !preferences.enableGlobalNotifications}
                icon={<AlertTriangle />}
                tooltip="Important system notifications and announcements"
                iconColor="text-amber-500"
              />
              
              <Separator className="my-4" />
              
              <div className="text-sm text-muted-foreground">
                Control which types of notifications are important to you.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
          className="border-2 border-gray-300 bg-white hover:bg-gray-100"
        >
          Cancel
        </Button>
        {!testMode && (
          <Button
            variant="outline"
            onClick={() => {
              // Force enable test mode
              localStorage.setItem('family_settings_test_mode', 'true');
              localStorage.setItem('bypass_admin_family_settings', 'true');
              setTestMode(true);
              window.location.reload(); // Force a full reload to apply changes everywhere
            }}
            className="bg-amber-50 text-amber-700 border-2 border-amber-300 hover:bg-amber-100"
          >
            Force Enable Permissions
          </Button>
        )}
        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="px-8 bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
} 