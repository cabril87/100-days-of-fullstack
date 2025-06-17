'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Family Activity Stream Widget
 * Displays real-time family member activities with avatars and live updates.
 * Connects to family and task SignalR events for live activity feed.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  CheckCircle, 
  Trophy, 
  UserPlus, 
  Zap, 
  Star, 
  Target,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useSignalRConnectionManager } from '@/lib/hooks/useSignalRConnectionManager';
import { useSignalRConnectionManagerStub } from '@/lib/hooks/useSignalRConnectionManagerStub';
import { FamilyActivityItem } from '@/lib/types/celebrations';
import { FamilyActivityStreamProps } from '@/lib/types/widget-props';

export function FamilyActivityStream({ 
  userId, 
  familyId, 
  maxDisplay = 5, 
  className = '',
  isConnected: sharedIsConnected
}: FamilyActivityStreamProps) {
  const [activities, setActivities] = useState<FamilyActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add new activity to the feed
  const addActivity = useCallback((newActivity: Omit<FamilyActivityItem, 'id'>) => {
    const activity: FamilyActivityItem = {
      ...newActivity,
      id: `${newActivity.type}-${newActivity.userId}-${Date.now()}`,
      userName: newActivity.userName || 'Family Member',
      userAvatar: newActivity.userAvatar
    };

    setActivities(prev => [activity, ...prev.slice(0, maxDisplay - 1)]);
  }, [maxDisplay]);

  // ✨ Use stub when shared connection is provided to prevent duplicate connections
  const shouldUseLocalConnection = sharedIsConnected === undefined;
  const localConnection = shouldUseLocalConnection 
    ? useSignalRConnectionManager('family-activity-stream', {
        onTaskCompleted: (event: any) => {
          addActivity({
            type: 'task_completed',
            userId: event.userId,
            userName: `User ${event.userId}`, // Use user ID since userName is not available
            title: 'Task Completed',
            description: `Completed a task and earned ${event.pointsEarned} points`,
            points: event.pointsEarned,
            timestamp: new Date(event.timestamp)
          });
        },
        onAchievementUnlocked: (event: any) => {
          addActivity({
            type: 'achievement_unlocked',
            userId: event.userId,
            userName: `User ${event.userId}`, // Use user ID since userName is not available
            title: 'Achievement Unlocked',
            description: `Unlocked "${event.achievementName}" achievement`,
            points: event.points,
            timestamp: new Date(event.timestamp)
          });
        },
        onPointsEarned: (event: any) => {
          addActivity({
            type: 'points_earned',
            userId: event.userId,
            userName: `User ${event.userId}`,
            title: 'Points Earned',
            description: `Earned ${event.points} points for ${event.reason}`,
            points: event.points,
            timestamp: new Date(event.timestamp)
          });
        }
      })
    : useSignalRConnectionManagerStub();
  
  const isConnected = sharedIsConnected !== undefined ? sharedIsConnected : localConnection.isConnected;

  // Load initial family activity
  useEffect(() => {
    const loadFamilyActivity = async () => {
      if (!familyId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch recent family activity from API (correct route)
        const response = await fetch(`http://localhost:5000/api/v1/activity/family/${familyId}/recent`, {
          credentials: 'include'
        });

        if (response.ok) {
          const activityData = await response.json();
          console.log('✅ FamilyActivityStream: Raw API response:', activityData);
          
          // Handle different response formats - ensure we have an array
          const activityArray = Array.isArray(activityData) 
            ? activityData 
            : activityData?.result || activityData?.data || [];
          
          const transformedActivities: FamilyActivityItem[] = activityArray.map((item: { id?: string; activityType?: string; userId: number; userName?: string; userAvatar?: string; title?: string; description?: string; points?: number; timestamp?: string; familyId?: number }) => ({
            id: item.id || `activity-${Date.now()}-${Math.random()}`,
            type: item.activityType || 'task_completed',
            userId: item.userId,
            userName: item.userName || 'Family Member',
            userAvatar: item.userAvatar,
            title: item.title || 'Activity',
            description: item.description || '',
            points: item.points,
            timestamp: new Date(item.timestamp || Date.now()),
            familyId: item.familyId
          }));

          setActivities(transformedActivities.slice(0, maxDisplay));
        }
      } catch (error) {
        console.error('Failed to load family activity:', error);
        
        // Add some sample activities for demo purposes
        const sampleActivities: FamilyActivityItem[] = [
          {
            id: 'sample-1',
            type: 'achievement_unlocked',
            userId: userId || 0,
            userName: 'You',
            title: 'Achievement Unlocked!',
            description: 'Early Bird - Complete tasks before 9 AM',
            points: 25,
            timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          },
          {
            id: 'sample-2',
            type: 'task_completed',
            userId: (userId || 0) + 1,
            userName: 'Family Member',
            title: 'Task Completed',
            description: 'Finished homework and earned points',
            points: 15,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
          }
        ];
        
        setActivities(sampleActivities);
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilyActivity();
  }, [familyId, userId, maxDisplay]);

  // Get activity icon
  const getActivityIcon = (type: FamilyActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'achievement_unlocked':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'member_joined':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'streak_updated':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'points_earned':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - timestamp.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.ceil(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Get user initials for avatar fallback
  const getUserInitials = (userName: string) => {
    return userName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={`${className} transition-all duration-300 hover:shadow-lg border-2 border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
          <div className="p-1 bg-green-100 dark:bg-green-900/20 rounded-full">
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          Family Activity
          {/* Real-time connection indicator */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
        </CardTitle>
        <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-300 dark:border-green-600">
          Live Feed
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* No Family State */}
          {!isLoading && !familyId && (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl opacity-50">👨‍👩‍👧‍👦</div>
              <div className="text-sm text-muted-foreground">
                Join a family to see activity
              </div>
              <Button variant="outline" size="sm">
                Create or Join Family
              </Button>
            </div>
          )}

          {/* No Activities State */}
          {!isLoading && familyId && activities.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl opacity-50">📈</div>
              <div className="text-sm text-muted-foreground">
                No family activity yet
              </div>
              <div className="text-xs text-muted-foreground">
                Complete tasks and achieve milestones to see activity here!
              </div>
            </div>
          )}

          {/* Activity Feed */}
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 hover:shadow-sm transition-all duration-200"
            >
              {/* User Avatar */}
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                <AvatarFallback className="text-xs">
                  {getUserInitials(activity.userName)}
                </AvatarFallback>
              </Avatar>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <span className="font-medium text-sm truncate">
                    {activity.userName === 'You' ? 'You' : activity.userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activity.title}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(activity.timestamp)}</span>
                  </div>
                  
                  {activity.points && (
                    <Badge variant="secondary" className="text-xs">
                      +{activity.points} pts
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* View More Button */}
          {activities.length >= maxDisplay && familyId && (
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2"
              onClick={() => {
                // Navigate to full family activity page
                window.location.href = `/families/${familyId}`;
              }}
            >
              View Full Family Activity
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}

          {/* Connection Status */}
          {!isConnected && !isLoading && (
            <div className="text-xs text-amber-600 dark:text-amber-400 text-center py-2">
              ⚠️ Offline - New activities will appear when reconnected
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 