'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FamilyCollaborationChartProps } from '@/lib/props/components/analytics.props';

export function FamilyCollaborationChart({ 
  familyData, 
  timeRange,
  className 
}: FamilyCollaborationChartProps) {
  const { 
    familyOverview,
    memberAnalytics,
    collaborationMetrics 
  } = familyData;

  const maxTasks = Math.max(...memberAnalytics.map(m => m.tasksCompleted));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Family Overview */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-xl font-bold">{familyOverview.activeMembers}</p>
          <p className="text-xs text-muted-foreground">Active Members</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-green-600">{familyOverview.completedTasks}</p>
          <p className="text-xs text-muted-foreground">Tasks Completed</p>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-blue-600">{familyOverview.collaborationScore}</p>
          <p className="text-xs text-muted-foreground">Collaboration Score</p>
        </div>
      </div>

      {/* Collaboration Status */}
      <div className="flex justify-center">
        <Badge 
          variant={familyOverview.collaborationScore > 75 ? 'default' : 
                   familyOverview.collaborationScore > 50 ? 'secondary' : 'destructive'}
          className="text-xs"
        >
          {familyOverview.collaborationScore > 75 && '🤝 Excellent Teamwork'}
          {familyOverview.collaborationScore <= 75 && familyOverview.collaborationScore > 50 && '👍 Good Collaboration'}
          {familyOverview.collaborationScore <= 50 && '💪 Room for Improvement'}
        </Badge>
      </div>

      {/* Member Contributions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Member Contributions ({timeRange})</h4>
        <div className="space-y-2">
          {memberAnalytics
            .sort((a, b) => b.contributionPercentage - a.contributionPercentage)
            .map((member, index) => (
            <div key={member.userId} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{member.username}</span>
                  {index === 0 && <Badge variant="secondary" className="text-xs">🏆 Top Contributor</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">
                  {member.tasksCompleted} tasks • {member.contributionPercentage.toFixed(1)}%
                </div>
              </div>
              <Progress 
                value={member.contributionPercentage} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Task Completion by Member */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Task Completion Comparison</h4>
        <div className="space-y-1">
          {memberAnalytics
            .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
            .map((member) => (
            <div key={member.userId} className="flex items-center gap-2">
              <span className="text-xs w-20 truncate">{member.username}</span>
              <div className="flex-1">
                <Progress 
                  value={maxTasks > 0 ? (member.tasksCompleted / maxTasks) * 100 : 0} 
                  className="h-3"
                />
              </div>
              <span className="text-xs w-8 text-right font-medium">
                {member.tasksCompleted}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Collaboration Metrics */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Collaboration Stats</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">{collaborationMetrics.sharedBoards}</p>
            <p className="text-muted-foreground">Shared Boards</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="font-medium">{collaborationMetrics.collaborativeTasks}</p>
            <p className="text-muted-foreground">Joint Tasks</p>
          </div>
        </div>
      </div>

      {/* Collaboration Insights */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Family Insights</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          {familyOverview.collaborationScore > 80 && (
            <p className="text-green-600">🌟 Outstanding family teamwork!</p>
          )}
          {familyOverview.currentStreak > 7 && (
            <p className="text-blue-600">🔥 Family on a {familyOverview.currentStreak}-day streak!</p>
          )}
          {collaborationMetrics.sharedBoards > 3 && (
            <p className="text-purple-600">📋 Great use of shared boards for collaboration</p>
          )}
          {memberAnalytics.length > 0 && (
            <p>👥 Most active: {memberAnalytics[0]?.username} with {memberAnalytics[0]?.tasksCompleted} tasks</p>
          )}
        </div>
      </div>
    </div>
  );
} 
