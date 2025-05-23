'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, Target, User, Calendar, 
  Activity, Award, Check, Users,
  Info, Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FamilyActivityDTO } from '@/lib/services/familyActivityService';

interface ActivityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: FamilyActivityDTO | null;
}

export default function ActivityDetailModal({
  isOpen,
  onClose,
  activity
}: ActivityDetailModalProps) {
  if (!activity) return null;

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      "MemberJoined": "Member Joined",
      "MemberLeft": "Member Left", 
      "MemberRoleChanged": "Role Changed",
      "InvitationSent": "Invitation Sent",
      "InvitationAccepted": "Invitation Accepted",
      "InvitationDeclined": "Invitation Declined",
      "TaskCreated": "Task Created",
      "TaskAssigned": "Task Assigned",
      "TaskCompleted": "Task Completed",
      "TaskDeleted": "Task Deleted",
      "EventCreated": "Event Created",
      "EventUpdated": "Event Updated",
      "EventCancelled": "Event Cancelled",
      "AchievementEarned": "Achievement Earned",
      "ProgressUpdate": "Progress Updated",
      "FamilyCreated": "Family Created",
      "FamilyUpdated": "Family Updated",
      "FamilyDeleted": "Family Deleted"
    };
    
    return labels[actionType] || actionType;
  };

  const getActionTypeBadgeColor = (actionType: string) => {
    if (actionType.includes("Member")) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (actionType.includes("Invitation")) return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    if (actionType.includes("Task")) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (actionType.includes("Event")) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    if (actionType.includes("Achievement")) return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    if (actionType.includes("Family")) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  };

  const getActionTypeIcon = (actionType: string) => {
    if (actionType.includes("Member")) return <Users className="h-5 w-5" />;
    if (actionType.includes("Invitation")) return <User className="h-5 w-5" />;
    if (actionType.includes("Task")) return <Check className="h-5 w-5" />;
    if (actionType.includes("Event")) return <Calendar className="h-5 w-5" />;
    if (actionType.includes("Achievement")) return <Award className="h-5 w-5" />;
    if (actionType.includes("Family")) return <Users className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: format(date, "EEEE, MMMM d, yyyy"),
      time: format(date, "h:mm:ss a"),
      relative: format(date, "PPpp")
    };
  };

  const timestamp = formatTimestamp(activity.timestamp);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getActionTypeIcon(activity.actionType)}
            Activity Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about this family activity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Actor Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  {activity.actorAvatarUrl ? (
                    <AvatarImage src={activity.actorAvatarUrl} alt={activity.actorDisplayName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                      {activity.actorDisplayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {activity.actorDisplayName}
                    </h3>
                    <Badge className={cn("flex items-center gap-1", getActionTypeBadgeColor(activity.actionType))}>
                      {getActionTypeIcon(activity.actionType)}
                      {getActionTypeLabel(activity.actionType)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {activity.actorName}
                  </p>
                  
                  {activity.description && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamp Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">When</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="text-gray-900 dark:text-gray-100">{timestamp.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time:</span>
                  <span className="text-gray-900 dark:text-gray-100">{timestamp.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Full:</span>
                  <span className="text-gray-900 dark:text-gray-100">{timestamp.relative}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Information */}
          {activity.targetId && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Target</h4>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {(activity.targetDisplayName || activity.targetName || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {activity.targetDisplayName || activity.targetName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Target User ID: {activity.targetId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Technical Details</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Activity ID:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{activity.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Family ID:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{activity.familyId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Actor ID:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{activity.actorId}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {activity.entityType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Entity Type:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{activity.entityType}</span>
                    </div>
                  )}
                  {activity.entityId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Entity ID:</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{activity.entityId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Action Type:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">{activity.actionType}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Additional Information</h4>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(activity.metadata, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 