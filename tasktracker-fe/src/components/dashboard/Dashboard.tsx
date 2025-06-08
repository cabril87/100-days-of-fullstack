'use client';

import { StatsCard } from '@/components/gamification/StatsCard';
import { GamificationBadges } from '@/components/gamification/GamificationBadges';
import TaskCreationModal from '@/components/tasks/TaskCreationModal';
import { Trophy, Target, Clock, Star, Plus, CheckCircle, Users, Activity, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { taskService } from '@/lib/services/taskService';
import { activityService } from '@/lib/services/activityService';
import { FamilyDTO, DashboardStats, FamilyActivityItem, UserProgress, DashboardContentProps } from '@/lib/types';
import { Task } from '@/lib/types/task';

export default function Dashboard({ user, initialData }: DashboardContentProps) {
  const router = useRouter();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(initialData.stats);
  const [currentFamily] = useState<FamilyDTO | null>(initialData.family);
  const [hasFamily] = useState(!!initialData.family);
  const [familyActivity, setFamilyActivity] = useState<FamilyActivityItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>(initialData.recentTasks || []);

  // Handle task creation success
  const handleTaskCreated = useCallback(async (newTask: Task) => {
    // Add the new task to recent tasks
    setRecentTasks(prev => [newTask, ...prev.slice(0, 4)]);
    
    // Refresh dashboard stats
    try {
      const updatedStats = await taskService.getUserTaskStats();
      setDashboardStats(prev => ({
        ...prev,
        tasksCompleted: updatedStats.tasksCompleted,
        activeGoals: updatedStats.activeGoals,
        focusTime: updatedStats.focusTimeToday,
        totalPoints: updatedStats.totalPoints,
        streakDays: updatedStats.streakDays
      }));
    } catch (error) {
      console.error('Failed to refresh stats after task creation:', error);
    }
  }, []);

  // Load additional dashboard data (client-side for interactivity)
  const loadAdditionalData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');

      // Load all dashboard data in parallel
      const [allFamilies, userTaskStats, userProgressData] = await Promise.all([
        familyInvitationService.getAllFamilies(),
        taskService.getUserTaskStats(),
        activityService.getUserProgress()
      ]);

      setUserProgress(userProgressData);

      let familyStats = {
        memberCount: 0,
        activeInvitations: 0,
        totalTasksCompleted: 0,
        totalPointsEarned: 0
      };

      let activityData: FamilyActivityItem[] = [];

      if (currentFamily?.id) {
        // Load family-specific data only if user has a family with valid ID
        try {
          const [members, activityDataResult] = await Promise.all([
            familyInvitationService.getFamilyMembers(currentFamily.id),
            activityService.getFamilyActivity(currentFamily.id, 5)
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

      // Update dashboard stats with real data using correct properties
      setDashboardStats(prev => ({
        ...prev,
        tasksCompleted: userTaskStats?.tasksCompletedThisWeek || userTaskStats?.tasksCompleted || prev.tasksCompleted,
        activeGoals: userTaskStats?.activeGoals || prev.activeGoals,
        focusTime: userTaskStats?.focusTimeToday || prev.focusTime,
        totalPoints: userTaskStats?.totalPoints || prev.totalPoints,
        familyMembers: familyStats?.memberCount || prev.familyMembers,
        familyTasks: familyStats?.totalTasksCompleted || prev.familyTasks,
        familyPoints: familyStats?.totalPointsEarned || prev.familyPoints,
        streakDays: userTaskStats?.streakDays || prev.streakDays,
        totalFamilies: allFamilies?.length || 0
      }));

    } catch (error) {
      console.error('Failed to load additional dashboard data:', error);
      // Don't show error for new users - 404s are expected
      if (error instanceof Error && !error.message.includes('404')) {
        setError('Failed to load some dashboard data. Please try refreshing the page.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, currentFamily]);

  useEffect(() => {
    loadAdditionalData();
  }, [loadAdditionalData]);

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

        {user && (
          <GamificationBadges 
            user={user} 
            streakDays={dashboardStats.streakDays} 
            achievements={userProgress?.achievements.length || 0}
          />
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* New User Welcome */}
      {!hasFamily && !isLoading && dashboardStats.totalPoints === 0 && dashboardStats.tasksCompleted === 0 && (
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  Welcome to TaskTracker!
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-4">
                  You're all set up! Let's get you started on your productivity journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  {user && (
                    <TaskCreationModal 
                      user={user}
                      family={currentFamily}
                      onTaskCreated={handleTaskCreated}
                      trigger={
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Task
                        </Button>
                      }
                    />
                  )}
                  <Button variant="outline" onClick={() => router.push('/settings/family')} className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20">
                    <Users className="h-4 w-4 mr-2" />
                    Set Up Family
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Grid - Using correct DashboardStats properties */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Tasks Completed"
          value={(dashboardStats.tasksCompleted || 0).toString()}
          subtitle="this week"
          icon={Trophy}
          variant="blue"
        />
        <StatsCard
          title="Active Goals"
          value={(dashboardStats.activeGoals || 0).toString()}
          subtitle="in progress"
          icon={Target}
          variant="emerald"
        />
        <StatsCard
          title="Focus Time"
          value={`${dashboardStats.focusTime || 0}h`}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {user && (
                <TaskCreationModal 
                  user={user}
                  family={currentFamily}
                  onTaskCreated={handleTaskCreated}
                  trigger={
                    <Button className="flex items-center justify-between w-full" variant="outline">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Create New Task</span>
                      </div>
                      <span className="text-sm text-gray-500">+10 pts</span>
                    </Button>
                  }
                />
              )}
              
              <Button 
                className="flex items-center justify-between w-full" 
                variant="outline"
                onClick={() => router.push('/tasks')}
              >
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>View All Tasks</span>
                </div>
                <span className="text-sm text-gray-500">→</span>
              </Button>
              
              {hasFamily ? (
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
              ) : (
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

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recent Tasks
            </CardTitle>
            <CardDescription>
              Your latest tasks and progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            task.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                            task.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {task.dueDate && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-xs font-medium text-purple-600">
                          {task.pointsValue} pts
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push('/tasks')}
                  >
                    View All Tasks
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="text-4xl">📝</div>
                <div>
                  <h3 className="font-semibold mb-2">No tasks yet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Create your first task to start tracking your productivity!
                  </p>
                  {user && (
                    <TaskCreationModal 
                      user={user}
                      family={currentFamily}
                      onTaskCreated={handleTaskCreated}
                      trigger={
                        <Button className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create First Task
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              {hasFamily ? 'Recent Family Activity' : 'Your Recent Activity'}
            </CardTitle>
            <CardDescription>
              {hasFamily 
                ? 'What your family members have been up to'
                : 'Track your personal productivity progress'
              }
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
                              <div className="text-center space-y-4 py-8">
                <div className="text-4xl">🚀</div>
                <div>
                  <h3 className="font-semibold mb-2">Ready to get started?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {hasFamily 
                      ? 'Start completing tasks to see family activity here!'
                      : 'Create your first task or set up a family to begin your productivity journey!'
                    }
                  </p>
                  {!hasFamily && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 text-sm text-blue-700 dark:text-blue-300">
                      💡 <strong>New user tip:</strong> The TaskTracker works great both solo and with family. 
                      Start with creating tasks to track your personal productivity, then invite family members later!
                    </div>
                  )}
                  <div className="flex justify-center gap-3">
                    {user && (
                      <TaskCreationModal 
                        user={user}
                        family={currentFamily}
                        onTaskCreated={handleTaskCreated}
                        trigger={
                          <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Create First Task
                          </Button>
                        }
                      />
                    )}
                    {!hasFamily && (
                      <Button variant="outline" onClick={() => router.push('/settings/family')}>
                        <Users className="h-4 w-4 mr-2" />
                        Set Up Family
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Loading indicator for additional data */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg">
          Loading additional data...
        </div>
      )}
    </div>
  );
} 