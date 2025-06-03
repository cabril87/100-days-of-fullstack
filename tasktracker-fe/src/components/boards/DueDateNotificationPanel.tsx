'use client';

/**
 * Due Date Notification Panel Component
 * Manages due date notifications and reminders for tasks
 */

import React, { useState, useCallback, useEffect } from 'react';

// Types
import { Board } from '@/lib/types/board';
import { Task } from '@/lib/types/task';
import { 
  DueDateNotificationSettings,
  TaskNotification,
  DueDateNotificationPanelProps 
} from '@/lib/types/notification';

// Components
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Icons
import {
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Mail,
  Smartphone,
  Settings
} from 'lucide-react';

// Utils
import { formatDistanceToNow, isAfter, isBefore, addDays, addHours } from 'date-fns';

export function DueDateNotificationPanel({
  board,
  tasks,
  settings,
  notifications,
  onUpdateSettings,
  onAcknowledgeNotification,
  onSnoozeNotification,
  isOpen,
  onClose
}: DueDateNotificationPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState<DueDateNotificationSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local settings with props
  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  // Update local setting and mark as changed
  const updateSetting = useCallback((key: keyof DueDateNotificationSettings, value: unknown) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  // Save settings
  const handleSaveSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      await onUpdateSettings(localSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [localSettings, onUpdateSettings]);

  // Reset settings
  const handleResetSettings = useCallback(() => {
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  // Get tasks with upcoming due dates
  const getUpcomingTasks = useCallback(() => {
    const now = new Date();
    const nextWeek = addDays(now, 7);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return isAfter(dueDate, now) && isBefore(dueDate, nextWeek);
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks]);

  // Get overdue tasks
  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return isBefore(dueDate, now) && task.status !== 'done';
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
  }, [tasks]);

  // Get task priority color
  const getTaskPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle acknowledge notification
  const handleAcknowledge = useCallback(async (notificationId: string) => {
    try {
      await onAcknowledgeNotification(notificationId);
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
    }
  }, [onAcknowledgeNotification]);

  // Handle snooze notification
  const handleSnooze = useCallback(async (notificationId: string, hours: number) => {
    try {
      const snoozeUntil = addHours(new Date(), hours).toISOString();
      await onSnoozeNotification(notificationId, snoozeUntil);
    } catch (error) {
      console.error('Failed to snooze notification:', error);
    }
  }, [onSnoozeNotification]);

  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();
  const activeNotifications = notifications.filter(n => !n.acknowledged && !n.sentAt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Due Date Notifications
          </DialogTitle>
          <DialogDescription>
            Manage notifications and reminders for task due dates
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Active Notifications
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Upcoming Due Dates
                    </CardTitle>
                    <CardDescription>
                      Tasks due in the next 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {upcomingTasks.length > 0 ? (
                      upcomingTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getTaskPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Due {formatDistanceToNow(new Date(task.dueDate!), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming due dates
                      </p>
                    )}
                    {upcomingTasks.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{upcomingTasks.length - 5} more tasks
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Overdue Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Overdue Tasks
                    </CardTitle>
                    <CardDescription>
                      Tasks that have passed their due date
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {overdueTasks.length > 0 ? (
                      overdueTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 border border-red-200 rounded bg-red-50">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getTaskPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <span className="text-xs text-red-600">
                                Overdue by {formatDistanceToNow(new Date(task.dueDate!))}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No overdue tasks!
                        </p>
                      </div>
                    )}
                    {overdueTasks.length > 5 && (
                      <p className="text-xs text-red-600 text-center">
                        +{overdueTasks.length - 5} more overdue tasks
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Active Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Notifications</CardTitle>
                  <CardDescription>
                    Notifications waiting to be sent or acknowledged
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeNotifications.length > 0 ? (
                    activeNotifications.map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={notification.type === 'overdue' ? 'destructive' : 'default'}>
                              {notification.type}
                            </Badge>
                            <span className="font-medium">{notification.task.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Scheduled for {new Date(notification.scheduledAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSnooze(notification.id, 1)}
                          >
                            Snooze 1h
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcknowledge(notification.id)}
                          >
                            Acknowledge
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        No pending notifications
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure when and how you receive due date notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Due Date Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for upcoming and overdue tasks
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.enabled}
                      onCheckedChange={(checked) => updateSetting('enabled', checked)}
                    />
                  </div>

                  {localSettings.enabled && (
                    <>
                      <div>
                        <Label>Reminder Times</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          When to send reminders before due date
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 4, 8, 24, 48].map((hours) => (
                            <Button
                              key={hours}
                              variant={localSettings.reminderTimes.includes(hours) ? "default" : "outline"}
                              size="sm"
                              onClick={() => {
                                const newTimes = localSettings.reminderTimes.includes(hours)
                                  ? localSettings.reminderTimes.filter(h => h !== hours)
                                  : [...localSettings.reminderTimes, hours].sort((a, b) => a - b);
                                updateSetting('reminderTimes', newTimes);
                              }}
                            >
                              {hours}h before
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Overdue Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Send notifications for overdue tasks
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.overdueNotifications}
                          onCheckedChange={(checked) => updateSetting('overdueNotifications', checked)}
                        />
                      </div>

                      <div>
                        <Label>Notification Channels</Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          How you want to receive notifications
                        </p>
                        <div className="space-y-2">
                          {[
                            { key: 'email' as const, label: 'Email', icon: Mail },
                            { key: 'push' as const, label: 'Push Notifications', icon: Smartphone },
                            { key: 'in-app' as const, label: 'In-App Notifications', icon: Bell }
                          ].map(({ key, label, icon: Icon }) => (
                            <div key={key} className="flex items-center gap-3">
                              <Switch
                                checked={localSettings.channels.includes(key)}
                                onCheckedChange={(checked) => {
                                  const newChannels = checked
                                    ? [...localSettings.channels, key]
                                    : localSettings.channels.filter(c => c !== key);
                                  updateSetting('channels', newChannels);
                                }}
                              />
                              <Icon className="h-4 w-4" />
                              <Label>{label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="mr-auto">
              Unsaved changes
            </Badge>
          )}
          
          {hasChanges && (
            <Button variant="outline" onClick={handleResetSettings}>
              Reset
            </Button>
          )}
          
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {hasChanges && (
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 