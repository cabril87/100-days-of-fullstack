'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  SystemMaintenanceNotification, 
  backgroundServiceService 
} from '@/lib/services/backgroundServiceService';

interface MaintenanceNotificationCardProps {
  notification: SystemMaintenanceNotification;
  onEdit?: (notification: SystemMaintenanceNotification) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function MaintenanceNotificationCard({ 
  notification, 
  onEdit, 
  onDelete,
  showActions = false,
  compact = false 
}: MaintenanceNotificationCardProps): React.ReactElement {
  const priorityInfo = backgroundServiceService.formatPriority(notification.priority);
  
  const getTypeIcon = () => {
    switch (notification.type.toLowerCase()) {
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = () => {
    switch (notification.type.toLowerCase()) {
      case 'emergency':
        return 'border-red-200 bg-red-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'scheduled':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatScheduledTime = (dateString?: string): string => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleString();
  };

  if (compact) {
    return (
      <Card className={`border transition-colors ${getTypeColor()}`}>
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">{priorityInfo.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {notification.type}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{notification.message}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span>{formatRelativeTime(notification.createdAt)}</span>
                {notification.scheduledStart && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatScheduledTime(notification.scheduledStart)}
                  </span>
                )}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${notification.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border transition-all duration-200 ${getTypeColor()}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {getTypeIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-lg">{notification.title}</h3>
                <Badge 
                  variant="outline" 
                  className={`${priorityInfo.color} border-current`}
                >
                  {notification.priority}
                </Badge>
                <Badge variant="secondary">
                  {notification.type}
                </Badge>
                {notification.isActive && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                {notification.message}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatRelativeTime(notification.createdAt)}</span>
                  </div>
                  
                  {notification.scheduledStart && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Scheduled:</span>
                      <span className="font-medium">{formatScheduledTime(notification.scheduledStart)}</span>
                    </div>
                  )}
                  
                  {notification.scheduledEnd && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">End Time:</span>
                      <span className="font-medium">{formatScheduledTime(notification.scheduledEnd)}</span>
                    </div>
                  )}
                </div>

                {notification.affectedServices && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 font-medium">Affected Services:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {notification.affectedServices.split(',').map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${notification.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            {showActions && (
              <div className="flex gap-1 ml-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(notification)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {(notification.scheduledStart || notification.scheduledEnd) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Maintenance Window</span>
            </div>
            <div className="mt-1 text-sm text-blue-700">
              {notification.scheduledStart && notification.scheduledEnd ? (
                <>
                  From {formatScheduledTime(notification.scheduledStart)} 
                  to {formatScheduledTime(notification.scheduledEnd)}
                </>
              ) : notification.scheduledStart ? (
                <>Starting {formatScheduledTime(notification.scheduledStart)}</>
              ) : (
                <>Ending {formatScheduledTime(notification.scheduledEnd)}</>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 