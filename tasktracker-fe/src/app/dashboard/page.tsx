'use client';

import { useAuth } from '@/lib/providers/AuthProvider';
import { StatsCard, StatsCardSkeleton } from '@/components/gamification/StatsCard';
import { GamificationBadges, GamificationBadgesSkeleton } from '@/components/gamification/GamificationBadges';
import { Trophy, Target, Clock, Star, Plus, CheckCircle, Users, Activity, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { taskService } from '@/lib/services/taskService';
import { activityService } from '@/lib/services/activityService';
import { FamilyDTO, DashboardStats, FamilyActivityItem, UserProgress } from '@/lib/types';
import { DashboardCardSkeleton } from '@/components/ui/skeletons/common-ui-skeletons';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    tasksCompleted: 0,
    activeGoals: 0,
    focusTime: 0,
    totalPoints: 0,
    familyMembers: 0,
    familyTasks: 0,
    familyPoints: 0,
    streakDays: 0,
    totalFamilies: 0
  });
  const [currentFamily, setCurrentFamily] = useState<FamilyDTO | null>(null);
  const [hasFamily, setHasFamily] = useState(false);
  const [familyActivity, setFamilyActivity] = useState<FamilyActivityItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');

      // Load all dashboard data in parallel
      const [allFamilies, family, userTaskStats, userProgressData] = await Promise.all([
        familyInvitationService.getAllFamilies(),
        familyInvitationService.getUserFamily(),
        taskService.getUserTaskStats(),
        activityService.getUserProgress()
      ]);

      setCurrentFamily(family);
      setHasFamily(!!family);
      setUserProgress(userProgressData);

      let familyStats = {
        memberCount: 0,
        activeInvitations: 0,
        totalTasksCompleted: 0,
        totalPointsEarned: 0
      };

      let activityData: FamilyActivityItem[] = [];

      if (family?.id) {
        // Load family-specific data only if user has a family with valid ID
        try {
          const [members, activityDataResult] = await Promise.all([
            familyInvitationService.getFamilyMembers(family.id),
            activityService.getFamilyActivity(family.id, 5)
          ]);
          
          // Calculate basic family stats from members
          familyStats = {
            memberCount: members.length,
            activeInvitations: 0,
            totalTasksCompleted: 0,
            totalPointsEarned: members.reduce((sum, member) => sum + (member.user?.points || 0), 0)
          };
          
          activityData = activityDataResult;
        } catch (error) {
          console.warn('Failed to load some family data:', error);
          // If family activity fails with 401, it means user doesn't have permission
          // Fall back to user activity
          try {
            activityData = await activityService.getUserActivity(5);
          } catch (fallbackError) {
            console.warn('Failed to load user activity as fallback:', fallbackError);
          }
        }
      } else {
        // Load user activity if no family
        try {
          activityData = await activityService.getUserActivity(5);
        } catch (error) {
          console.warn('Failed to load user activity:', error);
        }
      }

      setFamilyActivity(activityData);

      // Update dashboard stats with real data
      setDashboardStats({
        tasksCompleted: userTaskStats?.tasksCompletedThisWeek || 0,
        activeGoals: userTaskStats?.activeGoals || 0,
        focusTime: userTaskStats?.focusTimeToday || 0,
        totalPoints: userTaskStats?.totalPoints || 0,
        familyMembers: familyStats?.memberCount || 0,
        familyTasks: familyStats?.totalTasksCompleted || 0,
        familyPoints: familyStats?.totalPointsEarned || 0,
        streakDays: userTaskStats?.streakDays || 0,
        // Add total families count from getAllFamilies()
        totalFamilies: allFamilies?.length || 0
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, loadDashboardData]);

  // Show loading state
  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
          </div>
          <GamificationBadgesSkeleton />
        </div>
        
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCardSkeleton variant="blue" />
          <StatsCardSkeleton variant="emerald" />
          <StatsCardSkeleton variant="amber" />
          <StatsCardSkeleton variant="purple" />
        </div>
        
        {/* Family Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCardSkeleton variant="blue" />
          <StatsCardSkeleton variant="green" />
          <StatsCardSkeleton variant="purple" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCardSkeleton 
            cardCount={2}
            showStats={false}
            hasProgressBars={false}
            showCharts={false}
            variant="default"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.displayName || user?.firstName || user?.username || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {hasFamily 
                  ? `Here's your productivity overview and family progress`
                  : `Here's your productivity overview - consider creating or joining a family!`
                }
              </p>
            </div>
            
            {/* User Progress Level */}
            {userProgress && (
              <div className="hidden lg:block bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Level {userProgress.currentLevel}
                  </span>
                </div>
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${userProgress.experiencePercentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {userProgress.pointsToNextLevel} pts to next level
                </p>
              </div>
            )}
          </div>
        </div>

        <GamificationBadges 
          user={user} 
          streakDays={dashboardStats.streakDays} 
          achievements={userProgress?.achievements.length || 0}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Tasks Completed"
          value={dashboardStats.tasksCompleted.toString()}
          subtitle="this week"
          icon={Trophy}
          variant="blue"
        />
        <StatsCard
          title="Active Goals"
          value={dashboardStats.activeGoals.toString()}
          subtitle="in progress"
          icon={Target}
          variant="emerald"
        />
        <StatsCard
          title="Focus Time"
          value={`${dashboardStats.focusTime}h`}
          subtitle="today"
          icon={Clock}
          variant="amber"
        />
        <StatsCard
          title="Total Points"
          value={(dashboardStats.totalPoints || 0).toLocaleString()}
          subtitle="lifetime"
          icon={Star}
          variant="purple"
        />
      </div>

      {/* Family Stats (if user has family) */}
      {hasFamily && currentFamily && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-indigo-200 dark:border-indigo-800">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Families</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalFamilies}</p>
                  <p className="text-xs text-gray-500">total joined</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Family Members</p>
                  <p className="text-2xl font-bold">{dashboardStats.familyMembers}</p>
                  <p className="text-xs text-gray-500">in {currentFamily.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Family Tasks</p>
                  <p className="text-2xl font-bold">{dashboardStats.familyTasks}</p>
                  <p className="text-xs text-gray-500">completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Family Points</p>
                  <p className="text-2xl font-bold">{(dashboardStats.familyPoints || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">total earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Show family count even if user doesn't have a current family but belongs to families */}
      {!hasFamily && dashboardStats.totalFamilies > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your Families</p>
                    <p className="text-2xl font-bold">{dashboardStats.totalFamilies}</p>
                    <p className="text-xs text-gray-500">families joined</p>
                  </div>
                </div>
                <Button 
                  onClick={() => router.push('/families')}
                  variant="outline"
                  size="sm"
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                >
                  View All Families
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump into your most important tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button className="flex items-center justify-between w-full" variant="outline">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create New Task</span>
                </div>
                <span className="text-sm text-gray-500">+10 pts</span>
              </Button>
              
              <Button className="flex items-center justify-between w-full" variant="outline">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>Set Weekly Goal</span>
                </div>
                <span className="text-sm text-gray-500">+25 pts</span>
              </Button>
              
              {hasFamily && (
                <Button 
                  className="flex items-center justify-between w-full" 
                  variant="outline"
                  onClick={() => router.push('/settings/family')}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Manage Family</span>
                  </div>
                  <span className="text-sm text-gray-500">→</span>
                </Button>
              )}
              
              {!hasFamily && (
                <Button 
                  className="flex items-center justify-between w-full bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
                  variant="outline"
                  onClick={() => router.push('/settings/family')}
                >
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Users className="h-4 w-4" />
                    <span>Create or Join Family</span>
                  </div>
                  <span className="text-sm text-blue-500">+50 pts</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Family Activity or User Activity */}
        {hasFamily ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Family Activity
              </CardTitle>
              <CardDescription>
                What your family members have been up to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {familyActivity.length > 0 ? (
                <div className="space-y-4">
                  {familyActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'task_completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {activity.type === 'goal_achieved' && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {activity.type === 'member_joined' && <Users className="h-4 w-4 text-blue-500" />}
                        {activity.type === 'points_earned' && <Star className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'family_created' && <Users className="h-4 w-4 text-green-500" />}
                        {activity.type === 'invitation_sent' && <Plus className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.memberName}</span>{' '}
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                          {activity.points && (
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                              +{activity.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 py-8">
                  No recent family activity yet. Start completing tasks to see activity here!
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Your Recent Activity
              </CardTitle>
              <CardDescription>
                Track your personal productivity progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {familyActivity.length > 0 ? (
                <div className="space-y-4">
                  {familyActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
                      <div className="flex-shrink-0 mt-1">
                        {activity.type === 'task_completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {activity.type === 'goal_achieved' && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {activity.type === 'points_earned' && <Star className="h-4 w-4 text-purple-500" />}
                        {activity.type === 'family_created' && <Users className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.memberName}</span>{' '}
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                          {activity.points && (
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                              +{activity.points} pts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-4 py-8">
                  <div className="text-4xl">🚀</div>
                  <div>
                    <h3 className="font-semibold mb-2">Ready to get started?</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Create your first task or set up a family to begin your productivity journey!
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create First Task
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/settings/family')}>
                        <Users className="h-4 w-4 mr-2" />
                        Set Up Family
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 