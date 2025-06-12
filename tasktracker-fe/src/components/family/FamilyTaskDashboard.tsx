'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  Star,
  Trophy,
  Zap,
  Target,
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Heart,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { FamilyTaskDashboardProps } from '@/lib/types/component-props';
import { 
  FamilyTaskStats, 
  FamilyDashboardTab 
} from '@/lib/types/family-task';
import { familyTaskDashboardService } from '@/lib/services/familyTaskDashboardService';

export default function FamilyTaskDashboard({ family, familyMembers = [] }: FamilyTaskDashboardProps) {
  const [familyStats, setFamilyStats] = useState<FamilyTaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FamilyDashboardTab>('overview');

  // Load family task statistics from real API
  const loadFamilyTaskStats = useCallback(async () => {
    if (!family?.id) {
      console.warn('No family ID available for loading stats');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`📊 Loading real family task stats for family ${family.id}`);
      
      // Use real API service - NO MOCK DATA
      const stats = await familyTaskDashboardService.getFamilyTaskStats(
        family.id, 
        familyMembers
      );
      
      console.log('✅ Real family stats loaded:', stats);
      setFamilyStats(stats);
      
    } catch (error) {
      console.error('❌ Failed to load family task stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load family data');
      // Don't set mock data on error - show proper error handling
    } finally {
      setIsLoading(false);
    }
  }, [family?.id, familyMembers]);

  useEffect(() => {
    if (family?.id) {
      loadFamilyTaskStats();
    }
  }, [family?.id, loadFamilyTaskStats]);

  if (!family) {
    return (
      <div className="space-y-6">
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            Join or create a family to see the family task collaboration dashboard!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-24 bg-gray-200 rounded w-full"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load family task data: {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => loadFamilyTaskStats()}
          variant="outline"
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!familyStats) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            Unable to load family task data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getFamilyCompletionRate = () => {
    if (familyStats.totalTasks === 0) return 0;
    return Math.round((familyStats.completedTasks / familyStats.totalTasks) * 100);
  };

  // Helper functions for the dashboard
  const getMemberRankings = () => {
    return [...familyStats.memberStats].sort((a, b) => b.points - a.points);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Family Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-border bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-purple-600">{familyStats.totalTasks}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-border bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{familyStats.completedTasks}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-border bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Family Score</p>
                <p className="text-2xl font-bold text-amber-600">{familyStats.familyScore}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-border bg-white/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Progress</p>
                <p className="text-2xl font-bold text-blue-600">{familyStats.weeklyProgress}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Family Progress Overview */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            Family Progress Overview
          </CardTitle>
          <CardDescription>
            Your family&apos;s task completion rate and overall performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Completion Rate</span>
                <span className="text-sm text-gray-500">{getFamilyCompletionRate()}%</span>
              </div>
              <Progress value={getFamilyCompletionRate()} className="h-3" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Tasks Completed</p>
                  <p className="text-sm text-green-600">{familyStats.completedTasks} this week</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Pending Tasks</p>
                  <p className="text-sm text-amber-600">{familyStats.totalTasks - familyStats.completedTasks} remaining</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="gradient-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Recent Family Achievements
          </CardTitle>
          <CardDescription>
            Celebrating your family&apos;s recent accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {familyStats.recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-purple-600">Unlocked by {achievement.unlockedBy}</p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  +{achievement.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLeaderboardTab = () => (
    <Card className="gradient-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-600" />
          Family Leaderboard
        </CardTitle>
        <CardDescription>
          See how everyone is performing this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {getMemberRankings().map((member, index) => (
              <div key={member.memberId} className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {index < 3 ? <Trophy className="h-4 w-4" /> : index + 1}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-lg">{member.name}</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{member.role}</p>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{member.tasksCompleted}/{member.tasksTotal}</span>
                  </div>
                  <Progress value={member.completionRate} className="h-3" />
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-purple-600">{member.points} pts</p>
                  <p className="text-sm text-gray-500">Level {member.level}</p>
                </div>
                
                {member.streak > 0 && (
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    🔥 {member.streak} day streak
                  </Badge>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderGoalsTab = () => (
    <div className="space-y-6">
      {familyStats.sharedGoals.map((goal) => (
        <Card key={goal.id} className="gradient-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                {goal.title}
              </span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                🎁 {goal.reward} pts reward
              </Badge>
            </CardTitle>
            <CardDescription>{goal.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">{goal.progress}/{goal.target}</span>
                </div>
                <Progress value={(goal.progress / goal.target) * 100} className="h-3" />
              </div>
              
              {goal.deadline && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {goal.deadline.toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {goal.participants.length} family member{goal.participants.length !== 1 ? 's' : ''} participating
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderAchievementsTab = () => (
    <Card className="gradient-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          Family Achievements
        </CardTitle>
        <CardDescription>
          All the amazing things your family has accomplished together
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {familyStats.recentAchievements.map((achievement) => (
            <div key={achievement.id} className="p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-lg border">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-600">By {achievement.unlockedBy}</span>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with Family Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-purple-600" />
            {family.name} Task Dashboard
          </h2>
          <p className="text-gray-600">
            {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''} • 
            {familyStats.completedTasks} tasks completed
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-purple-300 text-purple-700">
            <Zap className="h-3 w-3 mr-1" />
            {familyStats.familyScore} Family Points
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { key: 'goals', label: 'Shared Goals', icon: Target },
            { key: 'achievements', label: 'Achievements', icon: Award }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as FamilyDashboardTab)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === key
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'leaderboard' && renderLeaderboardTab()}
      {activeTab === 'goals' && renderGoalsTab()}
      {activeTab === 'achievements' && renderAchievementsTab()}
    </div>
  );
} 