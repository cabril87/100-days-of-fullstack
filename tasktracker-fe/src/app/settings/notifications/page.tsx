'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  Clock, 
  Users, 
  Shield, 
  Settings2,
  Save,
  Volume2,
  VolumeX,
  Calendar,
  Globe,
  CheckCircle,
  AlertTriangle,
  Star,
  Heart,
  Zap
} from 'lucide-react';
import { 
  NotificationPreferencesFormData 
} from '@/lib/schemas/settings';
import { 
  notificationPreferencesSchema 
} from '@/lib/schemas/settings';
import {
  DashboardCardSkeleton
} from '@/components/ui/skeletons/common-ui-skeletons';
import {
  SettingsSectionSkeleton
} from '@/components/ui/skeletons/settings-profile-skeletons';

export default function NotificationSettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('email');
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Notification stats from API (no mock data)
  const [notificationStats, setNotificationStats] = useState<{
    totalSent: number;
    unreadCount: number;
    thisWeek: number;
    deliveryRate: number;
  } | null>(null);

  // Form setup
  const form = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      emailNotifications: {
        taskReminders: true,
        achievementAlerts: true,
        familyActivity: true,
        securityAlerts: true,
        weeklyDigest: false,
        marketingEmails: false
      },
      pushNotifications: {
        taskReminders: true,
        achievementAlerts: true,
        familyActivity: false,
        securityAlerts: true,
        immediateAlerts: true
      },
      notificationSchedule: {
        startTime: '08:00',
        endTime: '22:00',
        timezone: 'America/New_York'
      }
    }
  });

  // Load notification settings
  const loadNotificationSettings = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setIsLoadingStats(true);
      
      // Real API calls - will be implemented when backend is ready
      // const [settings, stats] = await Promise.all([
      //   notificationService.getSettings(),
      //   notificationService.getStats()
      // ]);
      // form.reset(settings);
      // setNotificationStats(stats);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For now, no stats until API is implemented
      setNotificationStats(null);
      
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to load notification settings' 
      });
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotificationSettings();
    }
  }, [isAuthenticated, user, loadNotificationSettings]);

  // Save settings handler
  const onSaveSettings = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Real API call - will be implemented when backend is ready
      // await notificationService.updateSettings(data);
      
      // For now, just show success message
      setMessage({ type: 'success', text: 'Notification settings saved! Settings will be applied when the notification API is implemented.' });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save notification settings' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test notification handler
  const sendTestNotification = async (type: 'email' | 'push') => {
    try {
      // Real API call - will be implemented when backend is ready
      // await notificationService.sendTestNotification(type);
      
      setMessage({ 
        type: 'success', 
        text: `Test ${type === 'email' ? 'email' : 'push notification'} will be sent when the notification API is implemented.` 
      });
    } catch (error) {
      console.error(`Failed to send test ${type} notification:`, error);
      setMessage({ 
        type: 'error', 
        text: `Failed to send test ${type} notification` 
      });
    }
  };

  // Clear all notifications handler
  const clearAllNotifications = async () => {
    try {
      // Real API call - will be implemented when backend is ready
      // await notificationService.clearAllNotifications();
      
      setMessage({ type: 'success', text: 'All notifications will be cleared when the notification API is implemented.' });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      setMessage({ type: 'error', text: 'Failed to clear notifications' });
    }
  };

  // Loading skeleton
  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header Skeleton */}
        <div>
          <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
        </div>
        
        {/* Stats Cards Skeleton */}
        <DashboardCardSkeleton 
          cardCount={4}
          showStats={true}
          hasProgressBars={false}
          showCharts={false}
          variant="gamified"
        />
        
        {/* Settings Form Skeleton */}
        <SettingsSectionSkeleton
          sectionTitle="Notification Preferences"
          itemCount={8}
          showToggles={true}
          showDropdowns={false}
          variant="gamified"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notification Settings
          {notificationStats && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {notificationStats.unreadCount} unread
            </Badge>
          )}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure notification preferences and delivery schedules
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoadingStats || !notificationStats ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="ml-4 flex-1">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Real stats
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Bell className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
                    <p className="text-2xl font-bold">{notificationStats.totalSent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                    <p className="text-2xl font-bold">{notificationStats.thisWeek}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
                    <p className="text-2xl font-bold">{notificationStats.deliveryRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                    <p className="text-2xl font-bold">{notificationStats.unreadCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Notification Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Customize how and when you receive notifications
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveSettings)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="push" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Push
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule
                  </TabsTrigger>
                </TabsList>

                {/* Email Notifications Tab */}
                <TabsContent value="email" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Email Notifications</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => sendTestNotification('email')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Test Email
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="emailNotifications.taskReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Task Reminders
                            </FormLabel>
                            <FormDescription>
                              Get reminders about upcoming and overdue tasks
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
                      control={form.control}
                      name="emailNotifications.achievementAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-600" />
                              Achievement Alerts
                            </FormLabel>
                            <FormDescription>
                              Notifications when you or family members earn achievements
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
                      control={form.control}
                      name="emailNotifications.familyActivity"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              Family Activity
                            </FormLabel>
                            <FormDescription>
                              Updates about family member task completions and progress
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
                      control={form.control}
                      name="emailNotifications.securityAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Shield className="h-4 w-4 text-red-600" />
                              Security Alerts
                            </FormLabel>
                            <FormDescription>
                              Important security notifications and login alerts
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
                      control={form.control}
                      name="emailNotifications.weeklyDigest"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-purple-600" />
                              Weekly Digest
                            </FormLabel>
                            <FormDescription>
                              Weekly summary of your family&apos;s progress and achievements
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
                      control={form.control}
                      name="emailNotifications.marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Heart className="h-4 w-4 text-pink-600" />
                              Product Updates
                            </FormLabel>
                            <FormDescription>
                              News about new features and product improvements
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
                  </div>
                </TabsContent>

                {/* Push Notifications Tab */}
                <TabsContent value="push" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Push Notifications</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => sendTestNotification('push')}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Send Test Push
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="pushNotifications.taskReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Task Reminders
                            </FormLabel>
                            <FormDescription>
                              Push notifications for task deadlines and reminders
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
                      control={form.control}
                      name="pushNotifications.achievementAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-600" />
                              Achievement Alerts
                            </FormLabel>
                            <FormDescription>
                              Instant push notifications for new achievements
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
                      control={form.control}
                      name="pushNotifications.familyActivity"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              Family Activity
                            </FormLabel>
                            <FormDescription>
                              Push notifications for family member activities
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
                      control={form.control}
                      name="pushNotifications.securityAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Shield className="h-4 w-4 text-red-600" />
                              Security Alerts
                            </FormLabel>
                            <FormDescription>
                              Critical security notifications (cannot be disabled)
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
                      control={form.control}
                      name="pushNotifications.immediateAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Zap className="h-4 w-4 text-orange-600" />
                              Immediate Alerts
                            </FormLabel>
                            <FormDescription>
                              High-priority notifications that bypass quiet hours
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
                  </div>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-6">
                  <h3 className="text-lg font-semibold">Notification Schedule</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="notificationSchedule.startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            Start Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            When to start sending notifications each day
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notificationSchedule.endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <VolumeX className="h-4 w-4" />
                            End Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            When to stop sending notifications each day
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notificationSchedule.timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          Timezone
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your local timezone for notification scheduling
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
                      Quiet Hours Active
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Non-urgent notifications will be silenced outside of your scheduled hours. 
                      Security alerts and immediate notifications will still be delivered.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline"
                  onClick={clearAllNotifications}
                  className="flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Clear All Notifications
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 