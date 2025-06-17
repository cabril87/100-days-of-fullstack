'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Family Goals & Challenges Widget
 * Enterprise-style goals tracking with family collaboration features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Users, 
  Calendar, 
  Clock,
  Star,
  Trophy,
  CheckCircle,
  AlertCircle,
  Timer,
  Sparkles,
  TrendingUp,
  Flag,
  Award
} from 'lucide-react';
import { EnterpriseGamificationWidgetProps } from '@/lib/types/enterprise-gamification';

interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  type: 'individual' | 'collaborative' | 'family';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  participantNames?: string[];
  completionPercentage: number;
  timeRemaining?: string;
  rewards: Array<{
    type: string;
    value: number | string;
    description: string;
    icon: string;
  }>;
}

interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'seasonal' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  icon: string;
  targetPoints: number;
  currentProgress: number;
  status: 'upcoming' | 'active' | 'completed' | 'failed';
  isOptional: boolean;
  participantNames?: string[];
  progressPercentage: number;
  timeRemaining?: string;
  rewards: Array<{
    type: string;
    value: number | string;
    description: string;
    icon: string;
  }>;
}

interface FamilyGoalsWidgetProps extends EnterpriseGamificationWidgetProps {
  goals?: FamilyGoal[];
  challenges?: FamilyChallenge[];
  showRewards?: boolean;
  showProgress?: boolean;
  enableInteraction?: boolean;
}

export function FamilyGoalsWidget({
  familyId,
  userId,
  goals = [],
  challenges = [],
  className = '',
  isCompact = false,
  showRewards = true,
  showProgress = true,
  enableInteraction = true,
  theme = 'colorful',
  animationsEnabled = true,
  realTimeUpdates = true
}: FamilyGoalsWidgetProps) {
  const [activeTab, setActiveTab] = useState<'goals' | 'challenges'>('goals');
  const [celebratingItem, setCelebratingItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use actual data from props - no mock data
  const displayGoals = goals || [];
  const displayChallenges = challenges || [];

  // Get priority color
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'hard':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'expert':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
    }
  };

  // Get type icon
  const getTypeIcon = (type: 'individual' | 'collaborative' | 'family') => {
    switch (type) {
      case 'individual':
        return <Star className="h-4 w-4" />;
      case 'collaborative':
        return <Users className="h-4 w-4" />;
      case 'family':
        return <Trophy className="h-4 w-4" />;
    }
  };

  // Calculate stats
  const goalStats = {
    active: displayGoals.filter(g => g.status === 'active').length,
    completed: displayGoals.filter(g => g.status === 'completed').length,
    averageProgress: Math.round(
      displayGoals.reduce((sum, goal) => sum + goal.completionPercentage, 0) / displayGoals.length
    )
  };

  const challengeStats = {
    active: displayChallenges.filter(c => c.status === 'active').length,
    completed: displayChallenges.filter(c => c.status === 'completed').length,
    averageProgress: Math.round(
      displayChallenges.reduce((sum, challenge) => sum + challenge.progressPercentage, 0) / displayChallenges.length
    )
  };

  return (
    <Card className={`${className} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Family Goals & Challenges
          {realTimeUpdates && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </CardTitle>
        
        {!isCompact && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="text-center p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {goalStats.active + challengeStats.active}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {Math.round((goalStats.averageProgress + challengeStats.averageProgress) / 2)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Progress</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Goals ({goalStats.active})
            </TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              Challenges ({challengeStats.active})
            </TabsTrigger>
          </TabsList>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-3 mt-4">
            {displayGoals.map((goal) => {
              const isCelebrating = celebratingItem === goal.id;
              const isNearDeadline = goal.dueDate && 
                new Date(goal.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
              
              return (
                <div
                  key={goal.id}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-500
                    ${goal.status === 'completed' 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-600'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/10 dark:to-indigo-900/10 dark:border-blue-700'
                    }
                    ${isCelebrating ? 'scale-105 shadow-lg animate-pulse' : ''}
                    ${animationsEnabled ? 'hover:scale-102' : ''}
                  `}
                >
                  {/* Celebration Effects */}
                  {isCelebrating && (
                    <div className="absolute -top-2 -right-2">
                      <Sparkles className="h-6 w-6 text-yellow-500 animate-spin" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(goal.type)}
                        <h4 className="font-semibold text-sm">{goal.title}</h4>
                        {goal.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {isNearDeadline && goal.status === 'active' && (
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {goal.description}
                      </p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={getPriorityColor(goal.priority)}>
                          {goal.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {goal.type}
                        </Badge>
                        {goal.timeRemaining && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {goal.timeRemaining}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-bold text-lg">
                        {goal.currentValue}/{goal.targetValue}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {goal.unit}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {showProgress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{goal.completionPercentage}%</span>
                      </div>
                      <Progress 
                        value={goal.completionPercentage} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Participants */}
                  {goal.participantNames && goal.participantNames.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">Participants</div>
                      <div className="flex flex-wrap gap-1">
                        {goal.participantNames.map((name, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  {showRewards && goal.rewards.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-muted-foreground mb-2">Rewards</div>
                      <div className="flex flex-wrap gap-2">
                        {goal.rewards.slice(0, 2).map((reward, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 text-xs bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-700"
                          >
                            <span>{reward.icon}</span>
                            <span>{reward.description}</span>
                          </div>
                        ))}
                        {goal.rewards.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{goal.rewards.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-3 mt-4">
            {displayChallenges.map((challenge) => {
              const isCelebrating = celebratingItem === challenge.id;
              
              return (
                <div
                  key={challenge.id}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-500
                    ${challenge.status === 'completed' 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-600'
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 dark:from-purple-900/10 dark:to-pink-900/10 dark:border-purple-700'
                    }
                    ${isCelebrating ? 'scale-105 shadow-lg animate-pulse' : ''}
                    ${animationsEnabled ? 'hover:scale-102' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{challenge.icon}</span>
                        <h4 className="font-semibold text-sm">{challenge.title}</h4>
                        {challenge.status === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {challenge.description}
                      </p>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {challenge.type}
                        </Badge>
                        {challenge.isOptional && (
                          <Badge variant="outline" className="text-xs">
                            Optional
                          </Badge>
                        )}
                        {challenge.timeRemaining && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {challenge.timeRemaining}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="font-bold text-lg">
                        {challenge.currentProgress}/{challenge.targetPoints}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        points
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {showProgress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{challenge.progressPercentage}%</span>
                      </div>
                      <Progress 
                        value={challenge.progressPercentage} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Participants */}
                  {challenge.participantNames && challenge.participantNames.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-muted-foreground mb-1">Participants</div>
                      <div className="flex flex-wrap gap-1">
                        {challenge.participantNames.map((name, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* No Data State */}
        {displayGoals.length === 0 && displayChallenges.length === 0 && !isLoading && (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl opacity-50">🎯</div>
            <div className="text-sm text-muted-foreground">
              No goals or challenges yet
            </div>
            <div className="text-xs text-muted-foreground">
              Create your first family goal to get started!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 