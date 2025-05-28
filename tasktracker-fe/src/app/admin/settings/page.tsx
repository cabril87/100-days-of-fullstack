'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Globe, 
  Lock, 
  Users, 
  Activity,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Server,
  Key,
  Clock
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { adminService, SystemSettings } from '@/lib/services/adminService';
import { useToast } from '@/lib/hooks/useToast';

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.email === 'admin@tasktracker.com' || user?.role === 'Admin';

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await adminService.getSystemSettings();
        
        if (response.data) {
          setSettings(response.data);
        } else {
          setError(response.error || 'Failed to load settings');
          showToast(response.error || 'Failed to load settings', 'error');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchSettings();
    }
  }, [isAdmin, showToast]);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, isLoading, isAdmin, router]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">Settings Not Available</h2>
            <p className="text-gray-600">{error || 'Failed to load system settings.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    if (!settings) return;
    
    setSaveStatus('saving');
    
    try {
      const response = await adminService.updateSystemSettings(settings);
      
      if (response.status === 200) {
        setSaveStatus('success');
        showToast('Settings saved successfully', 'success');
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } else {
        setSaveStatus('error');
        showToast(response.error || 'Failed to save settings', 'error');
      }
    } catch (err) {
      setSaveStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      showToast(errorMessage, 'error');
    }
  };

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
    });
  };

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Saved!
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Error
          </>
        );
      default:
        return (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className={`${
            saveStatus === 'success' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {getSaveButtonContent()}
        </Button>
      </div>

      {/* Status Alert */}
      {settings.system.maintenanceMode && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Maintenance Mode is enabled</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              The system is currently in maintenance mode. Users may experience limited functionality.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure authentication and security policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Two-Factor Authentication</label>
                <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
              </div>
              <Switch
                checked={settings.security.enableTwoFactor}
                onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Session Timeout (minutes)</label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Max Login Attempts</label>
              <Input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Minimum Password Length</label>
              <Input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                min="6"
                max="20"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Password Complexity</label>
                <p className="text-sm text-gray-500">Require special characters and numbers</p>
              </div>
              <Switch
                checked={settings.security.requirePasswordComplexity}
                onCheckedChange={(checked) => updateSetting('security', 'requirePasswordComplexity', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure system notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Email Notifications</label>
                <p className="text-sm text-gray-500">Send notifications via email</p>
              </div>
              <Switch
                checked={settings.notifications.enableEmailNotifications}
                onCheckedChange={(checked) => updateSetting('notifications', 'enableEmailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Push Notifications</label>
                <p className="text-sm text-gray-500">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.notifications.enablePushNotifications}
                onCheckedChange={(checked) => updateSetting('notifications', 'enablePushNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">SMS Notifications</label>
                <p className="text-sm text-gray-500">Send critical alerts via SMS</p>
              </div>
              <Switch
                checked={settings.notifications.enableSMSNotifications}
                onCheckedChange={(checked) => updateSetting('notifications', 'enableSMSNotifications', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Notification Frequency</label>
              <select
                value={settings.notifications.notificationFrequency}
                onChange={(e) => updateSetting('notifications', 'notificationFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly Digest</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-green-600" />
              System Settings
            </CardTitle>
            <CardDescription>
              Configure system behavior and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Maintenance Mode</label>
                <p className="text-sm text-gray-500">Temporarily disable user access</p>
              </div>
              <Switch
                checked={settings.system.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('system', 'maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Debug Mode</label>
                <p className="text-sm text-gray-500">Enable detailed error logging</p>
              </div>
              <Switch
                checked={settings.system.debugMode}
                onCheckedChange={(checked) => updateSetting('system', 'debugMode', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Log Level</label>
              <select
                value={settings.system.logLevel}
                onChange={(e) => updateSetting('system', 'logLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Backup Frequency</label>
              <select
                value={settings.system.backupFrequency}
                onChange={(e) => updateSetting('system', 'backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-medium">Max File Upload Size (MB)</label>
              <Input
                type="number"
                value={settings.system.maxFileUploadSize}
                onChange={(e) => updateSetting('system', 'maxFileUploadSize', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-600" />
              API Settings
            </CardTitle>
            <CardDescription>
              Configure API behavior and rate limiting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Rate Limiting</label>
                <p className="text-sm text-gray-500">Enable API rate limiting</p>
              </div>
              <Switch
                checked={settings.api.rateLimitEnabled}
                onCheckedChange={(checked) => updateSetting('api', 'rateLimitEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">Requests Per Minute</label>
              <Input
                type="number"
                value={settings.api.requestsPerMinute}
                onChange={(e) => updateSetting('api', 'requestsPerMinute', parseInt(e.target.value))}
                min="10"
                max="1000"
                disabled={!settings.api.rateLimitEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">CORS Enabled</label>
                <p className="text-sm text-gray-500">Allow cross-origin requests</p>
              </div>
              <Switch
                checked={settings.api.enableCors}
                onCheckedChange={(checked) => updateSetting('api', 'enableCors', checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="font-medium">API Version</label>
              <Input
                value={settings.api.apiVersion}
                onChange={(e) => updateSetting('api', 'apiVersion', e.target.value)}
                placeholder="v1"
                readOnly
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            System Status
          </CardTitle>
          <CardDescription>
            Current system health and configuration status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Database</p>
                <p className="text-sm text-green-600">Connected</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">API</p>
                <p className="text-sm text-green-600">Operational</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Cache</p>
                <p className="text-sm text-blue-600">85% Full</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 