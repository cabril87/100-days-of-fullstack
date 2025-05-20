'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Home,
  User,
  CheckCircle2,
  Calendar,
  Settings,
  X,
  Eye,
  Clock,
  CircleOff
} from 'lucide-react';
import { Notification, notificationService } from '@/lib/services/notificationService';
import { familyService } from '@/lib/services/familyService';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/lib/hooks/useToast';
import Link from 'next/link';

export interface FamilyBasic {
  id: string;
  name: string;
}

export default function FamilyNotificationHub() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [families, setFamilies] = useState<FamilyBasic[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadFamilies();
    loadNotifications();
  }, []);

  useEffect(() => {
    if (selectedFamily) {
      // In a real implementation, we would filter notifications by family
      // For now, we're just using the client-side filtering
    }
  }, [selectedFamily]);

  async function loadFamilies() {
    try {
      const response = await familyService.getAllFamilies();
      if (response.data) {
        // Transform to simplified format for the dropdown
        const familiesData = response.data.map(f => ({
          id: f.id.toString(),
          name: f.name
        }));
        setFamilies(familiesData);
        
        // Auto-select the first family if available
        if (familiesData.length > 0 && !selectedFamily) {
          setSelectedFamily(familiesData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading families:', error);
    }
  }

  async function loadNotifications() {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications();
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
      showToast(
        "Notification marked as read",
        "default"
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast(
        "Failed to mark notification as read",
        "destructive"
      );
    }
  }

  function getFilteredNotifications() {
    if (!selectedFamily && selectedFilter !== "all") {
      return [];
    }

    let filtered = [...notifications];

    // Filter by family if selected
    if (selectedFamily) {
      filtered = filtered.filter(n => 
        n.data?.familyId === selectedFamily
      );
    }

    // Apply type filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(n => n.type === selectedFilter);
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'invitation':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'role_change':
        return <Settings className="h-4 w-4 text-purple-500" />;
      case 'task_assignment':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'task_completion':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'family_update':
        return <Home className="h-4 w-4 text-indigo-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  }

  function getNotificationTypeLabel(type: string) {
    switch (type) {
      case 'invitation':
        return 'Invitation';
      case 'role_change':
        return 'Role Change';
      case 'task_assignment':
        return 'Task Assignment';
      case 'task_completion':
        return 'Task Completed';
      case 'family_update':
        return 'Family Update';
      default:
        return 'Notification';
    }
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Family Notification Hub</CardTitle>
              <CardDescription>
                Stay updated with your family activities
              </CardDescription>
            </div>
            <Link href="/notifications/preferences">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Family</label>
              <Select
                value={selectedFamily || ""}
                onValueChange={(value) => setSelectedFamily(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {families.map((family) => (
                    <SelectItem key={family.id} value={family.id}>
                      {family.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Filter</label>
              <Select
                value={selectedFilter}
                onValueChange={(value) => setSelectedFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter notifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Notifications</SelectItem>
                  <SelectItem value="invitation">Invitations</SelectItem>
                  <SelectItem value="task_assignment">Task Assignments</SelectItem>
                  <SelectItem value="task_completion">Completed Tasks</SelectItem>
                  <SelectItem value="role_change">Role Changes</SelectItem>
                  <SelectItem value="family_update">Family Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="all">
                All
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ScrollArea className="h-[400px] mt-2">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex space-x-4 p-3 rounded-lg border">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : getFilteredNotifications().length > 0 ? (
                  <div className="space-y-3">
                    {getFilteredNotifications().map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border ${
                          !notification.isRead
                            ? "bg-muted/50 border-muted-foreground/20"
                            : "bg-card"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10">
                                {getNotificationIcon(notification.type)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-medium leading-none">
                                  {notification.title}
                                  {!notification.isRead && (
                                    <Badge variant="default" className="ml-2 bg-blue-500">
                                      New
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {getNotificationTypeLabel(notification.type)}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm mt-2">{notification.message}</p>
                            <div className="flex items-center justify-end gap-2 mt-3">
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  Mark as read
                                </Button>
                              )}
                              {notification.data?.taskId && (
                                <Link href={`/tasks/${notification.data.taskId}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    View Task
                                  </Button>
                                </Link>
                              )}
                              {notification.data?.familyId && 
                                notification.type !== "invitation" && (
                                <Link href={`/family/${notification.data.familyId}`}>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Home className="h-3.5 w-3.5 mr-1" />
                                    View Family
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <CircleOff className="h-10 w-10 text-muted-foreground mb-2" />
                    <h4 className="text-lg font-medium">No notifications</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedFilter !== "all" || selectedFamily
                        ? "Try changing your filters"
                        : "You're all caught up!"}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="unread">
              <ScrollArea className="h-[400px] mt-2">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex space-x-4 p-3 rounded-lg border">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : getFilteredNotifications().filter(n => !n.isRead).length > 0 ? (
                  <div className="space-y-3">
                    {getFilteredNotifications()
                      .filter(n => !n.isRead)
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 rounded-lg border bg-muted/50 border-muted-foreground/20"
                        >
                          <div className="flex items-start gap-3">
                            <div className="shrink-0">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10">
                                  {getNotificationIcon(notification.type)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-sm font-medium leading-none">
                                    {notification.title}
                                    <Badge variant="default" className="ml-2 bg-blue-500">
                                      New
                                    </Badge>
                                  </h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                  </p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {getNotificationTypeLabel(notification.type)}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm mt-2">{notification.message}</p>
                              <div className="flex items-center justify-end gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  Mark as read
                                </Button>
                                {notification.data?.taskId && (
                                  <Link href={`/tasks/${notification.data.taskId}`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Eye className="h-3.5 w-3.5 mr-1" />
                                      View Task
                                    </Button>
                                  </Link>
                                )}
                                {notification.data?.familyId && 
                                  notification.type !== "invitation" && (
                                  <Link href={`/family/${notification.data.familyId}`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs"
                                    >
                                      <Home className="h-3.5 w-3.5 mr-1" />
                                      View Family
                                    </Button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                    <h4 className="text-lg font-medium">All caught up!</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have no unread notifications
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadNotifications}
            disabled={loading}
          >
            <Bell className="h-4 w-4 mr-2" />
            Refresh Notifications
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 