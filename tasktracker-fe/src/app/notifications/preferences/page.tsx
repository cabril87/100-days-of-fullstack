'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Settings, 
  ArrowLeft,
  Save,
  RefreshCw,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  MessageSquare,
  Users,
  Trophy,
  Target,
  Star,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationPreferences {
  // Global settings
  enableGlobalNotifications: boolean;
  enableSounds: boolean;
  soundVolume: number;
  enableVibration: boolean;
  
  // Delivery methods
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  
  // Notification types
  enableTaskNotifications: boolean;
  enableReminderNotifications: boolean;
  enableFamilyNotifications: boolean;
  enableGamificationNotifications: boolean;
  enableSystemNotifications: boolean;
  
  // Gamification specific
  enableAchievementNotifications: boolean;
  enableLevelUpNotifications: boolean;
  enableBadgeNotifications: boolean;
  enableStreakNotifications: boolean;
  enableChallengeNotifications: boolean;
  enableRewardNotifications: boolean;
  
  // Timing
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  
  // Frequency
  digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  maxNotificationsPerHour: number;
}

export default function NotificationPreferencesPage(): React.ReactElement {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    // Global settings
    enableGlobalNotifications: true,
    enableSounds: true,
    soundVolume: 50,
    enableVibration: true,
    
    // Delivery methods
    enablePushNotifications: true,
    enableEmailNotifications: false,
    enableSmsNotifications: false,
    
    // Notification types
    enableTaskNotifications: true,
    enableReminderNotifications: true,
    enableFamilyNotifications: true,
    enableGamificationNotifications: true,
    enableSystemNotifications: true,
    
    // Gamification specific
    enableAchievementNotifications: true,
    enableLevelUpNotifications: true,
    enableBadgeNotifications: true,
    enableStreakNotifications: true,
    enableChallengeNotifications: true,
    enableRewardNotifications: true,
    
    // Timing
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    
    // Frequency
    digestFrequency: 'immediate',
    maxNotificationsPerHour: 10
  });

  useEffect(() => {
    // Load preferences from localStorage or API
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      
      showToast('Notification preferences saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      showToast('Failed to save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setPreferences({
      enableGlobalNotifications: true,
      enableSounds: true,
      soundVolume: 50,
      enableVibration: true,
      enablePushNotifications: true,
      enableEmailNotifications: false,
      enableSmsNotifications: false,
      enableTaskNotifications: true,
      enableReminderNotifications: true,
      enableFamilyNotifications: true,
      enableGamificationNotifications: true,
      enableSystemNotifications: true,
      enableAchievementNotifications: true,
      enableLevelUpNotifications: true,
      enableBadgeNotifications: true,
      enableStreakNotifications: true,
      enableChallengeNotifications: true,
      enableRewardNotifications: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      digestFrequency: 'immediate',
      maxNotificationsPerHour: 10
    });
    showToast('Preferences reset to defaults', 'info');
  };

  const PreferenceToggle = ({ 
    id, 
    label, 
    description, 
    checked, 
    onChange, 
    icon,
    disabled = false 
  }: {
    id: string;
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: React.ReactNode;
    disabled?: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mt-0.5">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {label}
          </Label>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/notifications/center"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Notification Preferences
              </h1>
              <p className="text-gray-600 mt-1">
                Customize how and when you receive notifications
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <div className="pt-6 relative z-10">
            <Tabs defaultValue="general" className="w-full">
              <div className="px-6 pb-4 border-b border-gray-100">
                <TabsList className="grid w-full max-w-2xl grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="types">Types</TabsTrigger>
                  <TabsTrigger value="gamification">Gamification</TabsTrigger>
                  <TabsTrigger value="timing">Timing</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="general" className="mt-0">
                <div className="p-6 space-y-6">
                  {/* Global Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-blue-600" />
                        Global Settings
                      </CardTitle>
                      <CardDescription>
                        Master controls for all notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PreferenceToggle
                        id="enableGlobalNotifications"
                        label="Enable All Notifications"
                        description="Master switch to enable or disable all notifications"
                        checked={preferences.enableGlobalNotifications}
                        onChange={(checked) => handlePreferenceChange('enableGlobalNotifications', checked)}
                        icon={<Bell className="h-4 w-4" />}
                      />
                      
                      <PreferenceToggle
                        id="enableSounds"
                        label="Sound Notifications"
                        description="Play sounds when notifications arrive"
                        checked={preferences.enableSounds}
                        onChange={(checked) => handlePreferenceChange('enableSounds', checked)}
                        icon={preferences.enableSounds ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                      
                      {preferences.enableSounds && (
                        <div className="ml-12 space-y-2">
                          <Label>Sound Volume</Label>
                          <Slider
                            value={[preferences.soundVolume]}
                            onValueChange={(value) => handlePreferenceChange('soundVolume', value[0])}
                            max={100}
                            step={10}
                            className="w-full"
                            disabled={!preferences.enableGlobalNotifications}
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Quiet</span>
                            <span>{preferences.soundVolume}%</span>
                            <span>Loud</span>
                          </div>
                        </div>
                      )}
                      
                      <PreferenceToggle
                        id="enableVibration"
                        label="Vibration"
                        description="Vibrate device for notifications (mobile only)"
                        checked={preferences.enableVibration}
                        onChange={(checked) => handlePreferenceChange('enableVibration', checked)}
                        icon={<Smartphone className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                    </CardContent>
                  </Card>

                  {/* Delivery Methods */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        Delivery Methods
                      </CardTitle>
                      <CardDescription>
                        Choose how you want to receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PreferenceToggle
                        id="enablePushNotifications"
                        label="Push Notifications"
                        description="Receive notifications directly in your browser or app"
                        checked={preferences.enablePushNotifications}
                        onChange={(checked) => handlePreferenceChange('enablePushNotifications', checked)}
                        icon={<Bell className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                      
                      <PreferenceToggle
                        id="enableEmailNotifications"
                        label="Email Notifications"
                        description="Receive notifications via email"
                        checked={preferences.enableEmailNotifications}
                        onChange={(checked) => handlePreferenceChange('enableEmailNotifications', checked)}
                        icon={<Mail className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                      
                      <PreferenceToggle
                        id="enableSmsNotifications"
                        label="SMS Notifications"
                        description="Receive notifications via text message"
                        checked={preferences.enableSmsNotifications}
                        onChange={(checked) => handlePreferenceChange('enableSmsNotifications', checked)}
                        icon={<MessageSquare className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="types" className="mt-0">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-purple-600" />
                        Notification Types
                      </CardTitle>
                      <CardDescription>
                        Control which types of notifications you receive
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PreferenceToggle
                        id="enableTaskNotifications"
                        label="Task Notifications"
                        description="Notifications about task assignments, completions, and updates"
                        checked={preferences.enableTaskNotifications}
                        onChange={(checked) => handlePreferenceChange('enableTaskNotifications', checked)}
                        icon={<CheckCircle className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                      
                      <PreferenceToggle
                        id="enableReminderNotifications"
                        label="Reminder Notifications"
                        description="Notifications for upcoming tasks and deadlines"
                        checked={preferences.enableReminderNotifications}
                        onChange={(checked) => handlePreferenceChange('enableReminderNotifications', checked)}
                        icon={<Clock className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                      
                      <PreferenceToggle
                        id="enableFamilyNotifications"
                        label="Family Notifications"
                        description="Notifications about family activities and updates"
                        checked={preferences.enableFamilyNotifications}
                        onChange={(checked) => handlePreferenceChange('enableFamilyNotifications', checked)}
                        icon={<Users className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                      
                      <PreferenceToggle
                        id="enableSystemNotifications"
                        label="System Notifications"
                        description="Important system updates and announcements"
                        checked={preferences.enableSystemNotifications}
                        onChange={(checked) => handlePreferenceChange('enableSystemNotifications', checked)}
                        icon={<Info className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="gamification" className="mt-0">
                <div className="p-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-600" />
                        Gamification Notifications
                      </CardTitle>
                      <CardDescription>
                        Control notifications for achievements, rewards, and progress
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PreferenceToggle
                        id="enableGamificationNotifications"
                        label="All Gamification Notifications"
                        description="Master switch for all gamification-related notifications"
                        checked={preferences.enableGamificationNotifications}
                        onChange={(checked) => handlePreferenceChange('enableGamificationNotifications', checked)}
                        icon={<Trophy className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                      
                      <div className="ml-4 space-y-4 border-l-2 border-gray-200 pl-4">
                        <PreferenceToggle
                          id="enableAchievementNotifications"
                          label="Achievement Unlocked"
                          description="When you unlock new achievements"
                          checked={preferences.enableAchievementNotifications}
                          onChange={(checked) => handlePreferenceChange('enableAchievementNotifications', checked)}
                          icon={<Trophy className="h-4 w-4" />}
                          disabled={!preferences.enableGlobalNotifications || !preferences.enableGamificationNotifications}
                        />
                        
                        <PreferenceToggle
                          id="enableLevelUpNotifications"
                          label="Level Up"
                          description="When you reach a new level"
                          checked={preferences.enableLevelUpNotifications}
                          onChange={(checked) => handlePreferenceChange('enableLevelUpNotifications', checked)}
                          icon={<Star className="h-4 w-4" />}
                          disabled={!preferences.enableGlobalNotifications || !preferences.enableGamificationNotifications}
                        />
                        
                        <PreferenceToggle
                          id="enableBadgeNotifications"
                          label="Badge Earned"
                          description="When you earn new badges"
                          checked={preferences.enableBadgeNotifications}
                          onChange={(checked) => handlePreferenceChange('enableBadgeNotifications', checked)}
                          icon={<Target className="h-4 w-4" />}
                          disabled={!preferences.enableGlobalNotifications || !preferences.enableGamificationNotifications}
                        />
                        
                        <PreferenceToggle
                          id="enableStreakNotifications"
                          label="Streak Updates"
                          description="Daily login streaks and task completion streaks"
                          checked={preferences.enableStreakNotifications}
                          onChange={(checked) => handlePreferenceChange('enableStreakNotifications', checked)}
                          icon={<Zap className="h-4 w-4" />}
                          disabled={!preferences.enableGlobalNotifications || !preferences.enableGamificationNotifications}
                        />
                        
                        <PreferenceToggle
                          id="enableChallengeNotifications"
                          label="Challenge Progress"
                          description="Updates on challenge completion and progress"
                          checked={preferences.enableChallengeNotifications}
                          onChange={(checked) => handlePreferenceChange('enableChallengeNotifications', checked)}
                          icon={<Target className="h-4 w-4" />}
                          disabled={!preferences.enableGlobalNotifications || !preferences.enableGamificationNotifications}
                        />
                        
                        <PreferenceToggle
                          id="enableRewardNotifications"
                          label="Rewards Available"
                          description="When new rewards become available or are redeemed"
                          checked={preferences.enableRewardNotifications}
                          onChange={(checked) => handlePreferenceChange('enableRewardNotifications', checked)}
                          icon={<Star className="h-4 w-4" />}
                          disabled={!preferences.enableGlobalNotifications || !preferences.enableGamificationNotifications}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timing" className="mt-0">
                <div className="p-6 space-y-6">
                  {/* Quiet Hours */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        Quiet Hours
                      </CardTitle>
                      <CardDescription>
                        Set times when you don't want to receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PreferenceToggle
                        id="quietHoursEnabled"
                        label="Enable Quiet Hours"
                        description="Suppress notifications during specified hours"
                        checked={preferences.quietHoursEnabled}
                        onChange={(checked) => handlePreferenceChange('quietHoursEnabled', checked)}
                        icon={<Clock className="h-4 w-4" />}
                        disabled={!preferences.enableGlobalNotifications}
                      />
                      
                      {preferences.quietHoursEnabled && (
                        <div className="ml-12 grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <input
                              type="time"
                              value={preferences.quietHoursStart}
                              onChange={(e) => handlePreferenceChange('quietHoursStart', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={!preferences.enableGlobalNotifications}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <input
                              type="time"
                              value={preferences.quietHoursEnd}
                              onChange={(e) => handlePreferenceChange('quietHoursEnd', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={!preferences.enableGlobalNotifications}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Frequency Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-green-600" />
                        Frequency Settings
                      </CardTitle>
                      <CardDescription>
                        Control how often you receive notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Notification Digest</Label>
                        <Select 
                          value={preferences.digestFrequency} 
                          onValueChange={(value: any) => handlePreferenceChange('digestFrequency', value)}
                          disabled={!preferences.enableGlobalNotifications}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="hourly">Hourly Digest</SelectItem>
                            <SelectItem value="daily">Daily Digest</SelectItem>
                            <SelectItem value="weekly">Weekly Digest</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Choose how frequently to receive notification summaries
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Maximum Notifications Per Hour</Label>
                        <Slider
                          value={[preferences.maxNotificationsPerHour]}
                          onValueChange={(value) => handlePreferenceChange('maxNotificationsPerHour', value[0])}
                          min={1}
                          max={50}
                          step={1}
                          className="w-full"
                          disabled={!preferences.enableGlobalNotifications || preferences.digestFrequency !== 'immediate'}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1</span>
                          <span>{preferences.maxNotificationsPerHour} notifications/hour</span>
                          <span>50</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Limit the number of notifications you receive per hour
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Save Button (Fixed at bottom) */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
 