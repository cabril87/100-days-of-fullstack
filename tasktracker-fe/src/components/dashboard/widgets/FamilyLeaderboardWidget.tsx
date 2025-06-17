'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 * 
 * Family Leaderboard Widget
 * Enterprise-style family leaderboard with engaging animations and family-friendly competition
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Crown, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  Target,
  Calendar,
  Award,
  Sparkles,
  Medal,
  Zap
} from 'lucide-react';
import { EnterpriseGamificationWidgetProps } from '@/lib/types/enterprise-gamification';

interface LeaderboardMember {
  userId: number;
  memberName: string;
  ageGroup: 'child' | 'teen' | 'adult';
  score: number;
  rank: number;
  previousRank?: number;
  trend: 'up' | 'down' | 'same';
  avatar?: string;
  badge?: string;
  weeklyGrowth: number;
  achievements: number;
  streak: number;
}

interface FamilyLeaderboardWidgetProps extends EnterpriseGamificationWidgetProps {
  familyMembers?: LeaderboardMember[];
  currentUserId?: number;
  showTrends?: boolean;
  showAchievements?: boolean;
  enableCelebrations?: boolean;
}

export function FamilyLeaderboardWidget({
  familyId,
  userId,
  familyMembers = [],
  currentUserId,
  className = '',
  isCompact = false,
  showTrends = true,
  showAchievements = true,
  enableCelebrations = true,
  theme = 'colorful',
  animationsEnabled = true,
  realTimeUpdates = true
}: FamilyLeaderboardWidgetProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');
  const [celebratingMember, setCelebratingMember] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Use actual data from props - no mock data
  const displayMembers = familyMembers || [];

  // Get rank colors and styles
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20',
          border: 'border-yellow-300 dark:border-yellow-600',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: <Crown className="h-5 w-5 text-yellow-600" />
        };
      case 2:
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20',
          border: 'border-gray-300 dark:border-gray-600',
          text: 'text-gray-800 dark:text-gray-200',
          icon: <Medal className="h-5 w-5 text-gray-600" />
        };
      case 3:
        return {
          bg: 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20',
          border: 'border-orange-300 dark:border-orange-600',
          text: 'text-orange-800 dark:text-orange-200',
          icon: <Award className="h-5 w-5 text-orange-600" />
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10',
          border: 'border-blue-200 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200',
          icon: <Star className="h-4 w-4 text-blue-600" />
        };
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: 'up' | 'down' | 'same', previousRank?: number) => {
    if (!previousRank) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'same':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get age group badge
  const getAgeGroupBadge = (ageGroup: 'child' | 'teen' | 'adult') => {
    const styles = {
      child: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      teen: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      adult: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
    };
    
    return (
      <Badge variant="secondary" className={`text-xs ${styles[ageGroup]}`}>
        {ageGroup === 'child' ? '👶' : ageGroup === 'teen' ? '🧒' : '👨‍👩‍👧‍👦'} {ageGroup}
      </Badge>
    );
  };

  // Celebrate member achievement
  const celebrateMember = (memberId: number) => {
    if (!enableCelebrations) return;
    
    setCelebratingMember(memberId);
    setTimeout(() => setCelebratingMember(null), 3000);
  };

  // Calculate family stats
  const familyStats = {
    totalPoints: displayMembers.reduce((sum, member) => sum + member.score, 0),
    totalAchievements: displayMembers.reduce((sum, member) => sum + member.achievements, 0),
    averageStreak: Math.round(displayMembers.reduce((sum, member) => sum + member.streak, 0) / displayMembers.length),
    topPerformer: displayMembers[0]?.memberName || 'No data'
  };

  return (
    <Card className={`${className} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Family Leaderboard
          {realTimeUpdates && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          )}
        </CardTitle>
        
        {!isCompact && (
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="text-center p-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {familyStats.totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Family Points</div>
            </div>
            <div className="text-center p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {familyStats.averageStreak}
              </div>
              <div className="text-xs text-muted-foreground">Avg Streak</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {!isCompact && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs">
                <Target className="h-3 w-3 mr-1" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="all_time" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" />
                All Time
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-3 mt-4">
              {displayMembers.map((member, index) => {
                const rankStyle = getRankStyle(member.rank);
                const isCurrentUser = member.userId === currentUserId;
                const isCelebrating = celebratingMember === member.userId;
                
                return (
                  <div
                    key={member.userId}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-500
                      ${rankStyle.bg} ${rankStyle.border}
                      ${isCurrentUser ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
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

                    <div className="flex items-center justify-between">
                      {/* Left: Rank & Member Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {rankStyle.icon}
                          <span className={`font-bold text-lg ${rankStyle.text}`}>
                            #{member.rank}
                          </span>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {member.memberName}
                              {member.badge && <span className="ml-1">{member.badge}</span>}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1">
                            {getAgeGroupBadge(member.ageGroup)}
                            {showTrends && getTrendIcon(member.trend, member.previousRank)}
                          </div>
                        </div>
                      </div>

                      {/* Right: Score & Stats */}
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {member.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          points
                        </div>
                        
                        {!isCompact && (
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            {showAchievements && (
                              <span className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {member.achievements}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {member.streak}d
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Weekly Growth Progress */}
                    {!isCompact && member.weeklyGrowth > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Weekly Growth</span>
                          <span>+{member.weeklyGrowth}%</span>
                        </div>
                        <Progress 
                          value={Math.min(member.weeklyGrowth, 100)} 
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Celebration Button */}
                    {member.rank === 1 && !isCelebrating && enableCelebrations && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => celebrateMember(member.userId)}
                      >
                        🎉
                      </Button>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        )}

        {/* Compact Mode */}
        {isCompact && (
          <div className="space-y-2">
            {displayMembers.slice(0, 3).map((member) => {
              const rankStyle = getRankStyle(member.rank);
              const isCurrentUser = member.userId === currentUserId;
              
              return (
                <div
                  key={member.userId}
                  className={`
                    flex items-center justify-between p-2 rounded-lg
                    ${rankStyle.bg} ${rankStyle.border} border
                    ${isCurrentUser ? 'ring-1 ring-blue-400' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {rankStyle.icon}
                    <span className="font-medium text-sm">
                      {member.memberName}
                    </span>
                    {member.badge && <span>{member.badge}</span>}
                  </div>
                  <div className="font-bold text-sm">
                    {member.score.toLocaleString()}
                  </div>
                </div>
              );
            })}
            
            {displayMembers.length > 3 && (
              <div className="text-center text-xs text-muted-foreground pt-2">
                +{displayMembers.length - 3} more members
              </div>
            )}
          </div>
        )}

        {/* Family Motivation Message */}
        {!isCompact && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
              🌟 Keep it up, {familyStats.topPerformer} is leading the way!
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">
              Family teamwork makes the dream work! 👨‍👩‍👧‍👦
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          </div>
        )}

        {/* No Data State */}
        {displayMembers.length === 0 && !isLoading && (
          <div className="text-center py-8 space-y-3">
            <div className="text-4xl opacity-50">👨‍👩‍👧‍👦</div>
            <div className="text-sm text-muted-foreground">
              No family members found
            </div>
            <div className="text-xs text-muted-foreground">
              Invite family members to start competing!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 