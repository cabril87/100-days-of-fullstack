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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  CheckCircle, 
  Trophy, 
  Star, 
  Clock, 
  UserPlus, 
  Target,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useMainHubConnection } from '@/lib/hooks/useSignalRConnection';
import { FamilyActivityItem } from '@/lib/types/celebrations';

interface FamilyActivityStreamProps {
  userId: number;
  familyId?: number;
  className?: string;
  maxDisplay?: number;
}

export function FamilyActivityStream({ 
  userId, 
  familyId, 
  className = '', 
  maxDisplay = 8 
}: FamilyActivityStreamProps) {
  const [activities, setActivities] = useState<FamilyActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Connect to SignalR for real-time updates
  const { isConnected } = useMainHubConnection({
    onTaskCompleted: (event) => {
      addActivity({
        type: 'task_completed',
        userId: event.userId,
        userName: 'Family Member', // Will be populated from API
        title: 'Task Completed',
        description: `Completed a task and earned ${event.pointsEarned} points`,
        points: event.pointsEarned,
        timestamp: new Date(event.timestamp)
      });
    },
    
    onAchievementUnlocked: (event) => {
      addActivity({
        type: 'achievement_unlocked',
        userId: event.userId,
        userName: 'Family Member',
        title: 'Achievement Unlocked!',
        description: `Unlocked "${event.achievementName}"`,
        points: event.points,
        timestamp: new Date(event.timestamp)
      });
    },
    
    onPointsEarned: (event) => {
      if (event.points >= 20) { // Only show significant point gains
        addActivity({
          type: 'points_earned',
          userId: event.userId,
          userName: 'Family Member',
          title: 'Points Earned',
          description: event.reason,
          points: event.points,
          timestamp: new Date(event.timestamp)
        });
      }
    },
    
    onStreakUpdated: (event) => {
      if (event.isNewRecord || event.currentStreak % 7 === 0) {
        addActivity({
          type: 'streak_updated',
          userId: event.userId,
          userName: 'Family Member',
          title: event.isNewRecord ? 'New Streak Record!' : 'Streak Milestone',
          description: `${event.currentStreak} day productivity streak!`,
          timestamp: new Date(event.timestamp)
        });
      }
    }
  });

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

  // Load initial family activity
  useEffect(() => {
    const loadFamilyActivity = async () => {
      if (!familyId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch recent family activity from API
        const response = await fetch(`/api/v1/families/${familyId}/activity`, {
          credentials: 'include'
        });

        if (response.ok) {
          const activityData = await response.json();
          
          // Transform API data to our format
          const transformedActivities: FamilyActivityItem[] = activityData.map((item: { id?: string; activityType?: string; userId: number; userName?: string; userAvatar?: string; title?: string; description?: string; points?: number; timestamp?: string; familyId?: number }) => ({
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
            userId: userId,
            userName: 'You',
            title: 'Achievement Unlocked!',
            description: 'Early Bird - Complete tasks before 9 AM',
            points: 25,
            timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          },
          {
            id: 'sample-2',
            type: 'task_completed',
            userId: userId + 1,
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
    <Card className={`${className} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          Family Activity
          {/* Real-time connection indicator */}
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
        </CardTitle>
        {familyId && (
          <Badge variant="outline" className="text-xs">
            Live Feed
          </Badge>
        )}
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
              <ArrowRight className="h-3 w-3" />
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