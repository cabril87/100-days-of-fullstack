'use client';

/**
 * Real-time Collaboration Bar Component
 * Shows online users, real-time activities, and connection status
 */

import React from 'react';

// Types
import { BoardEvent } from '@/lib/types/signalr';

// Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icons
import {
  Wifi,
  WifiOff,
  Users,
  Activity,
  Eye,
  MousePointer,
  Move,
  Clock
} from 'lucide-react';

// Utils
import { formatDistanceToNow } from 'date-fns';

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: {
    x: number;
    y: number;
    columnId?: string;
    taskId?: number;
  };
  activity?: {
    type: 'viewing' | 'editing' | 'moving' | 'idle';
    target?: string;
    timestamp: number;
  };
}

interface LiveActivity {
  id: string;
  userId: string;
  userName: string;
  type: 'task_moved' | 'task_created' | 'task_updated' | 'user_joined' | 'user_left';
  description: string;
  timestamp: number;
  metadata?: {
    taskId?: number;
    taskTitle?: string;
    fromColumn?: string;
    toColumn?: string;
  };
}

interface RealtimeCollaborationBarProps {
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  recentActivities: LiveActivity[];
  currentUserId: string;
  onReconnect?: () => void;
  className?: string;
}

export function RealtimeCollaborationBar({
  isConnected,
  onlineUsers,
  recentActivities,
  currentUserId,
  onReconnect,
  className = ''
}: RealtimeCollaborationBarProps) {
  // Filter out current user from online users
  const otherUsers = onlineUsers.filter(user => user.id !== currentUserId);
  
  // Get recent activities (last 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const recentLiveActivities = recentActivities
    .filter(activity => activity.timestamp > fiveMinutesAgo)
    .slice(0, 5);

  // Get activity icon
  const getActivityIcon = (type: LiveActivity['type']) => {
    switch (type) {
      case 'task_moved':
        return <Move className="h-3 w-3" />;
      case 'task_created':
        return <Activity className="h-3 w-3" />;
      case 'task_updated':
        return <Activity className="h-3 w-3" />;
      case 'user_joined':
        return <Users className="h-3 w-3" />;
      case 'user_left':
        return <Users className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  // Get user activity color
  const getUserActivityColor = (activity?: OnlineUser['activity']) => {
    if (!activity) return 'bg-gray-400';
    
    switch (activity.type) {
      case 'editing':
        return 'bg-green-400';
      case 'moving':
        return 'bg-blue-400';
      case 'viewing':
        return 'bg-yellow-400';
      case 'idle':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className={`flex items-center gap-4 p-3 bg-muted/30 border-b ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Live</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Disconnected</span>
            {onReconnect && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onReconnect}
                className="h-6 px-2 text-xs"
              >
                Reconnect
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Online Users */}
      {otherUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {otherUsers.slice(0, 5).map((user) => (
              <TooltipProvider key={user.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Avatar className="h-8 w-8 border-2 border-background">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Activity indicator */}
                      <div 
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getUserActivityColor(user.activity)}`}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div className="font-medium">{user.name}</div>
                      {user.activity && (
                        <div className="text-xs text-muted-foreground capitalize">
                          {user.activity.type}
                          {user.activity.target && ` • ${user.activity.target}`}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {otherUsers.length > 5 && (
              <Badge variant="secondary" className="h-8 w-8 rounded-full p-0 text-xs">
                +{otherUsers.length - 5}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {recentLiveActivities.length > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Recent activity:</span>
          </div>
          
          <div className="flex items-center gap-2 max-w-md overflow-hidden">
            {recentLiveActivities.slice(0, 3).map((activity) => (
              <TooltipProvider key={activity.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-1 bg-background rounded text-xs">
                      {getActivityIcon(activity.type)}
                      <span className="truncate max-w-32">
                        {activity.description}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div className="font-medium">{activity.userName}</div>
                      <div>{activity.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </div>
                      {activity.metadata && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {activity.metadata.taskTitle && (
                            <div>Task: {activity.metadata.taskTitle}</div>
                          )}
                          {activity.metadata.fromColumn && activity.metadata.toColumn && (
                            <div>
                              Moved from {activity.metadata.fromColumn} to {activity.metadata.toColumn}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            {recentLiveActivities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{recentLiveActivities.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Cursor Tracking Indicators */}
      {otherUsers.some(user => user.cursor) && (
        <div className="flex items-center gap-1">
          <MousePointer className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {otherUsers.filter(user => user.cursor).length} active
          </span>
        </div>
      )}
    </div>
  );
} 