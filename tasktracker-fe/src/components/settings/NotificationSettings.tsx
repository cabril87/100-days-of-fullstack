'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  Clock, 
  Save,
  VolumeX
} from 'lucide-react';
import { 
  NotificationPreferencesFormData 
} from '@/lib/schemas/settings';
import { 
  notificationPreferencesSchema 
} from '@/lib/schemas/settings';
import { notificationService } from '@/lib/services/notificationService';
import {
  DashboardCardSkeleton
} from '@/components/ui/skeletons/common-ui-skeletons';
import {
  SettingsSectionSkeleton
} from '@/components/ui/skeletons/settings-profile-skeletons';

import { NotificationSettingsContentProps } from '@/lib/types/settings';

export default function NotificationSettingsContent({ user }: NotificationSettingsContentProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('email');
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Notification stats from API
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
      
      // Real API calls using the notification service
      const [settings, stats] = await Promise.all([
        notificationService.getSettings(),
        notificationService.getStats()
      ]);
      
      // Update form with loaded settings
      form.reset(settings);
      setNotificationStats(stats);
      
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to load notification settings' 
      });
      
      // Set default stats on error
      setNotificationStats(null);
      
    } finally {
      setIsLoading(false);
      setIsLoadingStats(false);
    }
  }, [user, form]);

  useEffect(() => {
    if (user) {
      loadNotificationSettings();
    }
  }, [user, loadNotificationSettings]);

  // Save settings handler
  const onSaveSettings = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const formData = form.getValues();
      
      // Convert form data to complete NotificationSettingsDTO format
      const settingsData = {
        emailNotifications: {
          ...formData.emailNotifications,
          systemUpdates: formData.emailNotifications.securityAlerts
        },
        pushNotifications: {
          ...formData.pushNotifications,
          quietHours: false
        },
        notificationSchedule: {
          ...formData.notificationSchedule,
          weekendsOnly: false,
          customDays: []
        },
        familyNotifications: {
          childTaskUpdates: formData.emailNotifications.familyActivity || formData.pushNotifications.familyActivity,
          permissionRequests: formData.emailNotifications.securityAlerts || formData.pushNotifications.securityAlerts,
          achievementSharing: formData.emailNotifications.achievementAlerts || formData.pushNotifications.achievementAlerts,
          emergencyAlerts: formData.emailNotifications.securityAlerts || formData.pushNotifications.securityAlerts,
          parentalControlChanges: formData.emailNotifications.securityAlerts || formData.pushNotifications.securityAlerts
        }
      };
      
      // Use the notification service to save settings
      await notificationService.updateSettings(settingsData);
      
      setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
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
      await notificationService.sendTestNotification();
      
      setMessage({ 
        type: 'success', 
        text: `Test ${type === 'email' ? 'email' : 'push notification'} sent successfully!` 
      });
    } catch (error) {
      console.error(`Failed to send test ${type} notification:`, error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : `Failed to send test ${type} notification` 
      });
    }
  };

  // Clear all notifications handler
  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      setMessage({ type: 'success', text: 'All notifications cleared successfully!' });
      
      // Refresh stats
      loadNotificationSettings();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      setMessage({ type: 'error', text: 'Failed to clear notifications' });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          <SettingsSectionSkeleton 
            sectionTitle="Notification Settings"
            itemCount={6}
            showToggles={true}
            showDropdowns={true}
          />
          <DashboardCardSkeleton 
            cardCount={4}
            showStats={true}
            hasProgressBars={false}
            showCharts={false}
          />
          <DashboardCardSkeleton 
            cardCount={3}
            showStats={false}
            hasProgressBars={false}
            showCharts={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Notification Settings
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage how and when you receive notifications
            </p>
          </div>
          <Bell className="h-8 w-8 text-purple-500" />
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Notification Stats */}
        {isLoadingStats ? (
          <DashboardCardSkeleton 
            cardCount={1}
            showStats={true}
            hasProgressBars={false}
            showCharts={false}
          />
        ) : notificationStats && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-500" />
                Notification Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{notificationStats.totalSent}</div>
                  <div className="text-sm text-muted-foreground">Total Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{notificationStats.unreadCount}</div>
                  <div className="text-sm text-muted-foreground">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{notificationStats.thisWeek}</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{notificationStats.deliveryRate}%</div>
                  <div className="text-sm text-muted-foreground">Delivery Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Settings */}
        <Form {...form}>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-500" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure which email notifications you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="emailNotifications.taskReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Task Reminders</FormLabel>
                          <FormDescription>
                            Get reminded about upcoming and overdue tasks
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Achievement Alerts</FormLabel>
                          <FormDescription>
                            Celebrate your accomplishments and milestones
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Family Activity</FormLabel>
                          <FormDescription>
                            Stay updated on your family members&apos; progress
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Security Alerts</FormLabel>
                          <FormDescription>
                            Important security and account notifications
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Weekly Digest</FormLabel>
                          <FormDescription>
                            Weekly summary of your activity and progress
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Marketing Emails</FormLabel>
                          <FormDescription>
                            Product updates, tips, and promotional content
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

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => sendTestNotification('email')}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Send Test Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Push Notifications Tab */}
            <TabsContent value="push" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-green-500" />
                    Push Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure push notifications for instant updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="pushNotifications.taskReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Task Reminders</FormLabel>
                          <FormDescription>
                            Push notifications for task deadlines
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Achievement Alerts</FormLabel>
                          <FormDescription>
                            Instant notifications for achievements and rewards
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Family Activity</FormLabel>
                          <FormDescription>
                            Push notifications for family member updates
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Security Alerts</FormLabel>
                          <FormDescription>
                            Critical security notifications
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
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Immediate Alerts</FormLabel>
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

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => sendTestNotification('push')}
                      className="flex items-center gap-2"
                    >
                      <Smartphone className="h-4 w-4" />
                      Send Test Push
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Notification Schedule
                  </CardTitle>
                  <CardDescription>
                    Set your preferred notification times and timezone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="notificationSchedule.startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            When to start sending notifications
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
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            When to stop sending notifications
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
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                            <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Your local timezone for scheduling notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            onClick={onSaveSettings}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={clearAllNotifications}
            className="flex items-center gap-2"
          >
            <VolumeX className="h-4 w-4" />
            Clear All Notifications
          </Button>
        </div>
      </div>
    </div>
  );
} 
