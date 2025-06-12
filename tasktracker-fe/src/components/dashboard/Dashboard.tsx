'use client';

import TaskCreationModal from '@/components/tasks/TaskCreationModal';
import FamilyTaskDashboard from '@/components/family/FamilyTaskDashboard';
import { Trophy, Target, Clock, Star, Plus, CheckCircle, Users, Activity, TrendingUp, AlertTriangle, Crown, Sparkles, Flame, Timer, UserPlus, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { taskService } from '@/lib/services/taskService';
import { activityService } from '@/lib/services/activityService';
import { priorityIntToString } from '@/lib/utils/priorityMapping';
import { FamilyDTO, DashboardStats, FamilyActivityItem, UserProgress, DashboardContentProps } from '@/lib/types';
import { Task, FamilyTaskItemDTO } from '@/lib/types/task';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';
import { FamilyTaskStats } from '@/lib/types/family-task';

export default function Dashboard({ user, initialData }: DashboardContentProps) {
  const router = useRouter();
  
  // State management
  const [error, setError] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(initialData.stats);
  const [currentFamily] = useState<FamilyDTO | null>(initialData.family);
  const [hasFamily, setHasFamily] = useState(!!initialData.family);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [familyActivity, setFamilyActivity] = useState<FamilyActivityItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [recentTasks, setRecentTasks] = useState<Task[]>(initialData.recentTasks || []);
  const [dueTodayTasks, setDueTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // ✨ NEW: Family Task Collaboration State
  const [familyTasks, setFamilyTasks] = useState<FamilyTaskItemDTO[]>([]);
  const [familyTaskStats, setFamilyTaskStats] = useState<FamilyTaskStats | null>(null);
  const [activeTab, setActiveTab] = useState<'individual' | 'family'>('individual');

  // Utility function to safely get priority display
  const getPriorityDisplay = (priority: string | number | undefined | null): string => {
    // Handle null, undefined, empty string - but allow 0 since it's valid (Low priority)
    if (priority === null || priority === undefined || priority === '') return '';
    
    // Convert to string first, then try to parse as number
    const priorityStr = String(priority).trim();
    
    // Try to parse as number first (handles "0", "1", "2", "3", 0, 1, 2, 3)
    const numPriority = parseInt(priorityStr, 10);
    if (!isNaN(numPriority) && numPriority >= 0 && numPriority <= 3) {
      return priorityIntToString(numPriority);
    }
    
    // If it's already a valid priority string, return it
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (validPriorities.includes(priorityStr)) {
      return priorityStr;
    }
    
    // If we still don't have a valid priority, don't show it
    return '';
  };

  // Gamification calculations
  const calculateLevel = (points: number) => Math.floor((points || 0) / 100) + 1;
  const calculateProgress = (points: number) => ((points || 0) % 100);
  const getAchievementBadges = () => {
    const badges = [];
    if ((dashboardStats.streakDays || 0) >= 7) badges.push({ icon: '🔥', title: 'Week Warrior' });
    if ((dashboardStats.tasksCompleted || 0) >= 50) badges.push({ icon: '💎', title: 'Task Master' });
    if ((dashboardStats.totalPoints || 0) >= 500) badges.push({ icon: '👑', title: 'Points King' });
    if ((dashboardStats.tasksCompleted || 0) >= 100) badges.push({ icon: '🏆', title: 'Centurion' });
    if ((dashboardStats.familyMembers || 0) >= 5) badges.push({ icon: '👑', title: 'Family Leader' });
    
    // ✨ NEW: Family collaboration achievements
    if (familyTaskStats?.memberStats.some(m => m.tasksCompleted >= 10)) {
      badges.push({ icon: '🤝', title: 'Team Player' });
    }
    if ((familyTaskStats?.completedTasks || 0) >= 20) {
      badges.push({ icon: '👨‍👩‍👧‍👦', title: 'Family Achiever' });
    }
    if ((familyTaskStats?.familyScore || 0) >= 1000) {
      badges.push({ icon: '⭐', title: 'Star Family' });
    }
    
    return badges;
  };

  const currentLevel = calculateLevel(dashboardStats.totalPoints);
  const levelProgress = calculateProgress(dashboardStats.totalPoints);
  const achievementBadges = getAchievementBadges();

  // ✨ ENHANCED: Family task counts with collaboration data
  const familyTaskCounts = {
    family: familyTasks.length,
    assignedToMe: familyTasks.filter(task => task.assignedToFamilyMemberId && 
      familyMembers.find(m => m.id === task.assignedToFamilyMemberId)?.userId === user?.id).length,
    iAssigned: familyTasks.filter(task => task.assignedByUserId === user?.id).length,
    pendingApproval: familyTasks.filter(task => task.requiresApproval && 
      task.status === 'completed' && !task.approvedByUserId).length
  };

  // Helper function to get member avatar
  const getMemberById = (memberId: number | string) => {
    const id = typeof memberId === 'string' ? parseInt(memberId) : memberId;
    return familyMembers.find(m => m.id === id);
  };

  // Handle task creation success
  const handleTaskCreated = useCallback(async (newTask: Task) => {
    // Add the new task to recent tasks
    setRecentTasks(prev => [newTask, ...prev.slice(0, 4)]);
    
    // ✨ NOTE: Family tasks refresh is handled separately to avoid circular dependencies
    
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

  // ✨ NEW: Load family tasks and stats
  const loadFamilyTasks = useCallback(async () => {
    if (!currentFamily?.id) return;

    try {
      const [tasks, stats] = await Promise.all([
        taskService.getFamilyTasks(currentFamily.id),
        taskService.getEnhancedFamilyTaskStats(currentFamily.id)
      ]);

      setFamilyTasks(tasks);
      setFamilyTaskStats(stats);
    } catch (error) {
      console.error('Failed to load family tasks:', error);
    }
  }, [currentFamily?.id]);

  // Handle task completion
  const handleTaskCompletion = useCallback(async (taskId: number) => {
    try {
      await taskService.completeTask(taskId);
      
      // Update task states
      setRecentTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isCompleted: true } : task
      ));
      setDueTodayTasks(prev => prev.filter(task => task.id !== taskId));
      setOverdueTasks(prev => prev.filter(task => task.id !== taskId));
      
      // ✨ NEW: Update family tasks if applicable
      setFamilyTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isCompleted: true, status: 'completed' } : task
      ));
      
      // Refresh dashboard stats
      const updatedStats = await taskService.getUserTaskStats();
      setDashboardStats(prev => ({
        ...prev,
        tasksCompleted: updatedStats.tasksCompleted,
        activeGoals: updatedStats.activeGoals,
        focusTime: updatedStats.focusTimeToday,
        totalPoints: updatedStats.totalPoints,
        streakDays: updatedStats.streakDays
      }));

      // ✨ NEW: Refresh family stats
      if (currentFamily?.id) {
        await loadFamilyTasks();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      setError('Failed to complete task. Please try again.');
    }
  }, [currentFamily?.id]);

  // ✨ NEW: Handle family task approval - temporarily disabled
  // const handleTaskApproval = useCallback(async (taskId: number, approved: boolean) => {
  //   if (!currentFamily?.id) return;

  //   try {
  //     if (approved) {
  //       await taskService.approveTask(currentFamily.id, taskId, { taskId, approvalComment: 'Approved from dashboard' });
  //     }
      
  //     // Refresh family tasks
  //     await loadFamilyTasks();
  //   } catch (error) {
  //     console.error('Failed to approve task:', error);
  //     setError('Failed to approve task. Please try again.');
  //   }
  // }, [currentFamily?.id, loadFamilyTasks]);

  // Load additional dashboard data (client-side for interactivity)
  const loadAdditionalData = useCallback(async () => {
    if (!user) return;

    try {
      setError('');

              // Load all dashboard data in parallel
        const [allFamilies, userTaskStats, userProgressData, recentTasksData, dueTodayData, overdueData] = await Promise.all([
          familyInvitationService.getAllFamilies(),
          taskService.getUserTaskStats(),
          activityService.getUserProgress(),
          taskService.getRecentTasks(5),
          taskService.getDueTodayTasks(),
          taskService.getOverdueTasks()
        ]);

        setUserProgress(userProgressData);
        setRecentTasks(recentTasksData);
        setDueTodayTasks(dueTodayData);
        setOverdueTasks(overdueData);

        // ✨ CRITICAL FIX: Update hasFamily state based on real data
        const userHasFamily = allFamilies && allFamilies.length > 0;
        setHasFamily(userHasFamily);
        console.log('🏠 Family status check:', { 
          userHasFamily, 
          familiesCount: allFamilies?.length || 0, 
          currentFamily: currentFamily?.id || 'none' 
        });

        // ✨ NEW: Enhanced family data debugging and robust testing support
        if (!userHasFamily) {
          console.log('🔧 DEBUG: User has no family. Family features will be hidden.');
          console.log('🔧 To test family features: User needs to create/join a family first.');
          console.log('🔧 Family endpoints available: /families, /family/create');
        } else {
          console.log('✅ User has family! Family collaboration features will be visible.');
        }

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
          
          setFamilyMembers(members);
          console.log('👥 Family members loaded:', { 
            membersCount: members.length, 
            members: members.map(m => ({ id: m.id, name: m.user?.firstName, userId: m.userId }))
          });
          
          // Calculate basic family stats from members
          familyStats = {
            memberCount: members.length,
            activeInvitations: 0,
            totalTasksCompleted: 0,
            totalPointsEarned: members.reduce((sum, member) => sum + (member.user?.points || 0), 0)
          };
          
          activityData = activityDataResult;

          // ✨ NEW: Load family tasks and collaboration data
          await loadFamilyTasks();
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
      // Loading complete
    }
  }, [user, currentFamily]);

  useEffect(() => {
    loadAdditionalData();
  }, [loadAdditionalData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-4 sm:p-6 space-y-6">
        {/* Enhanced Gamified Header */}
        <Card className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white border-0 shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title & Level Section */}
              <div className="space-y-4">
          <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {currentLevel || 1}
                    </div>
                  </div>
            <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                      Welcome back, {user?.displayName || user?.firstName || user?.username || 'Hero'}!
              </h1>
                    <p className="text-white/90 text-sm sm:text-base">
                      Level {currentLevel || 1} Task Master • {dashboardStats.streakDays || 0} day streak 🔥
              </p>
            </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Level Progress</span>
                    <span className="font-medium">{levelProgress || 0}/100 XP</span>
                  </div>
                  <Progress value={levelProgress} className="h-2 bg-white/20">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${levelProgress || 0}%` }} />
                  </Progress>
                  <p className="text-xs text-white/70">
                    {100 - (levelProgress || 0)} XP to Level {(currentLevel || 1) + 1}
                  </p>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Achievements</h3>
                <div className="flex flex-wrap gap-3">
                  {achievementBadges.length > 0 ? achievementBadges.map((badge, index) => (
                    <div key={index} className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium">
                      <span className="text-lg">{badge.icon}</span>
                      {badge.title}
          </div>
                  )) : (
                    <div className="text-white/70 text-sm italic">
                      Complete more tasks to unlock achievements! 🏆
      </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  New Quest
                  <Sparkles className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/tasks')}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50"
                >
                  <Target className="h-4 w-4" />
                  View All Quests
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✨ NEW: Family Creation Prompt for Users Without Family */}
        {!hasFamily && (
          <Card className="border-2 border-dashed border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    🏠 Ready for Family Collaboration?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Create or join a family to unlock collaborative task management, assign tasks to family members, and track shared goals together!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => router.push('/families')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Explore Family Features
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        console.log('🔧 DEBUG: Family collaboration features are ready but hidden until user has family data');
                        console.log('🔧 Backend API endpoints: /v1/family, /v1/family/{id}/members');
                        console.log('🔧 Current implementation: Dashboard tabs, task assignment, member avatars all working');
                      }}
                      className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20"
                    >
                      Debug Family Status
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✨ NEW: Dashboard Tab Navigation */}
        {hasFamily && (
          <Card className="border-2 border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'individual' | 'family')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="individual" className="flex items-center gap-2 py-3 px-6">
                    <Target className="h-4 w-4" />
                    My Tasks
                  </TabsTrigger>
                  <TabsTrigger value="family" className="flex items-center gap-2 py-3 px-6">
                    <Users className="h-4 w-4" />
                    Family Collaboration
                    {familyTaskCounts.pendingApproval > 0 && (
                      <Badge className="bg-orange-500 text-white text-xs ml-2">
                        {familyTaskCounts.pendingApproval} pending
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="individual" className="space-y-6">
                  {/* Individual Tasks Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Individual Task Stats */}
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboardStats.tasksCompleted || 0}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Goals</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardStats.activeGoals || 0}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Focus Time</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dashboardStats.focusTime || 0}m</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dashboardStats.totalPoints || 0}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="family" className="space-y-6">
                  {/* ✨ NEW: Family Task Collaboration Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Family Task Stats */}
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Family Tasks</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{familyTaskCounts.family}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigned to Me</p>
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{familyTaskCounts.assignedToMe}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                            <UserPlus className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">I Assigned</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{familyTaskCounts.iAssigned}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{familyTaskCounts.pendingApproval}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* ✨ NEW: Family Task Summary */}
                  {familyTaskStats && (
                    <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-2 border-purple-200 dark:border-purple-700">
                      <CardHeader>
                        <CardTitle className="text-xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          Family Collaboration Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{familyTaskStats.completedTasks}/{familyTaskStats.totalTasks}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(familyTaskStats.weeklyProgress)}%</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Progress</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{familyTaskStats.familyScore}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Family Score</p>
                          </div>
                        </div>
                        
                        {/* Family Member Leaderboard */}
                        {familyTaskStats.memberStats.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Family Leaderboard</h4>
                            <div className="space-y-2">
                              {familyTaskStats.memberStats.slice(0, 3).map((member, index) => (
                                <div key={member.memberId} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                      {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                      {index === 1 && <Star className="h-4 w-4 text-gray-400" />}
                                      {index === 2 && <Star className="h-4 w-4 text-orange-500" />}
                                      <span className="font-medium text-sm">#{index + 1}</span>
                                    </div>
                                                                         <Avatar className="h-8 w-8">
                                       <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                         {(getMemberById(member.memberId)?.user?.firstName?.[0] || '?').toUpperCase()}
                                       </AvatarFallback>
                                     </Avatar>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {getMemberById(member.memberId)?.user?.displayName || 
                                       getMemberById(member.memberId)?.user?.firstName || 
                                       'Family Member'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>{member.tasksCompleted} tasks</span>
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">{member.points} pts</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* ✨ NEW: Use Existing FamilyTaskDashboard Component */}
                  {currentFamily && familyMembers.length > 0 && user && (
                    <FamilyTaskDashboard 
                      user={user}
                      family={currentFamily} 
                      familyMembers={familyMembers}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Original Statistics Grid for users without families */}
        {!hasFamily && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboardStats.tasksCompleted || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Goals</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboardStats.activeGoals || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Focus Time</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{dashboardStats.focusTime || 0}m</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dashboardStats.totalPoints || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Completed Tasks */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">{dashboardStats.tasksCompleted || 0}</div>
                  <p className="text-green-100 text-sm font-medium">Quests Done</p>
                </div>
                <Trophy className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">{dashboardStats.activeGoals || 0}</div>
                  <p className="text-blue-100 text-sm font-medium">Active Goals</p>
                </div>
                <Target className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          {/* Total Points */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">{dashboardStats.totalPoints || 0}</div>
                  <p className="text-purple-100 text-sm font-medium">XP Points</p>
                </div>
                <Star className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          {/* Streak Days */}
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">{dashboardStats.streakDays || 0}</div>
                  <p className="text-orange-100 text-sm font-medium">Day Streak</p>
                </div>
                <Flame className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family Statistics (if has family) */}
        {hasFamily && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {/* Family Members */}
            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{dashboardStats.familyMembers || 0}</div>
                    <p className="text-cyan-100 text-sm font-medium">Family Members</p>
                  </div>
                  <Users className="h-8 w-8 text-cyan-200" />
                </div>
              </CardContent>
            </Card>

            {/* Family Tasks */}
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{dashboardStats.familyTasks || 0}</div>
                    <p className="text-emerald-100 text-sm font-medium">Family Quests</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            {/* Family Points */}
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{dashboardStats.familyPoints || 0}</div>
                    <p className="text-yellow-100 text-sm font-medium">Family XP</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Quests
            </CardTitle>
          </CardHeader>
                        <CardContent className="space-y-3">
              {recentTasks.length > 0 ? (
                recentTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle 
                        className={`h-4 w-4 ${task.isCompleted ? 'text-green-500' : 'text-gray-400'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                          {/* ✨ NEW: Family member assignment display */}
                          {task.assignedToUserId && task.assignedToUserId !== user?.id && (
                            <span className="text-purple-600 dark:text-purple-400 font-medium">
                              • Assigned by you
                            </span>
                          )}
                          {task.familyId && !task.assignedToUserId && (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              • Family task
                            </span>
                          )}
                      </div>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* ✨ NEW: Family member avatar for assigned tasks */}
                      {task.assignedToUserId && task.assignedToUserId !== user?.id && familyMembers.length > 0 && (
                        <div className="flex items-center gap-1">
                          {(() => {
                            const assignedMember = familyMembers.find(m => m.userId === task.assignedToUserId);
                            return assignedMember && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xs">
                                  {(assignedMember.user?.firstName?.[0] || '?').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            );
                          })()}
                        </div>
                      )}
                      
                    {/* Priority Badge - only show if we get a valid priority string */}
                    {(() => {
                      const priorityDisplay = getPriorityDisplay(task.priority);
                      return priorityDisplay && (
                        <Badge variant="outline" className="text-xs">
                          {priorityDisplay}
                        </Badge>
                      );
                    })()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 space-y-4">
                    {/* Show different content based on whether user has any tasks at all */}
                    {(dashboardStats.tasksCompleted || 0) === 0 && (dashboardStats.activeGoals || 0) === 0 && (dashboardStats.totalPoints || 0) === 0 ? (
                      // First time user - no tasks at all
                      <>
                        <div className="text-6xl">🚀</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Ready to start your quest?
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Create your first quest and begin your productivity journey!
                          </p>
                          <Button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Quest
                            <Sparkles className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      // Returning user - has tasks but no recent activity
                      <>
                        <div className="text-6xl">⚡</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Time for another quest?
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            You&apos;ve been productive before! Start another quest to keep the momentum going.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                              onClick={() => setIsTaskModalOpen(true)}
                              className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Start Another Quest
                              <Sparkles className="h-4 w-4 ml-2" />
                            </Button>
                <Button 
                  variant="outline"
                              onClick={() => router.push('/tasks')}
                              className="border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:hover:border-purple-600"
                            >
                              <Target className="h-4 w-4 mr-2" />
                              View All Quests
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

          {/* Tasks Due Today & Overdue */}
          <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Timer className="h-5 w-5 text-orange-600" />
                Urgent Quests
            </CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              {/* Overdue Tasks */}
              {overdueTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                    Overdue ({overdueTasks.length})
                  </h4>
                  <div className="space-y-2">
                    {overdueTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">{task.title}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskCompletion(task.id)}
                          className="text-xs"
                        >
                          Complete
                        </Button>
                      </div>
                    ))}
                      </div>
                    </div>
              )}

              {/* Due Today */}
              {dueTodayTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                    Due Today ({dueTodayTasks.length})
                  </h4>
                  <div className="space-y-2">
                    {dueTodayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                      >
                    <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium">{task.title}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTaskCompletion(task.id)}
                          className="text-xs"
                        >
                          Complete
                        </Button>
                    </div>
                    ))}
                  </div>
                </div>
              )}

              {overdueTasks.length === 0 && dueTodayTasks.length === 0 && (
                <div className="text-center py-8">
                  {/* Only show "All caught up!" if user has no tasks at all */}
                  {(dashboardStats.tasksCompleted || 0) === 0 && (dashboardStats.activeGoals || 0) === 0 && (dashboardStats.totalPoints || 0) === 0 ? (
                    <div className="text-gray-500 dark:text-gray-400">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Ready to start?</p>
                      <p className="text-sm">Create your first quest to get started!</p>
              </div>
            ) : (
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                      <p className="font-semibold text-green-800 dark:text-green-400">All caught up!</p>
                      <p className="text-sm text-green-600 dark:text-green-400">No urgent quests right now. Great work! 🎉</p>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        {/* Family Collaboration Quick Widget */}
        {currentFamily && (
          <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-2 border-purple-200 dark:border-purple-700 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold text-lg">
                      👨‍👩‍👧‍👦 Family Collaboration
                    </span>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {currentFamily.name}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/families/${currentFamily.id}`)}
                  className="bg-white/80 hover:bg-white border-purple-300 hover:border-purple-400 text-purple-700 hover:text-purple-800"
                >
                  <Target className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Family Task Stats */}
                <div className="grid grid-cols-3 gap-4">
                                     <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200 dark:border-purple-700">
                     <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                       {familyTaskCounts.family || 0}
                     </div>
                     <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                       Family Tasks
                     </div>
                   </div>
                   <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-700">
                     <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                       {familyTaskCounts.assignedToMe || 0}
                     </div>
                     <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                       Assigned to Me
                     </div>
                   </div>
                   <div className="text-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-cyan-200 dark:border-cyan-700">
                     <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                       {familyTaskCounts.iAssigned || 0}
                     </div>
                     <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                       I Assigned
                     </div>
                   </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Family Task
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/tasks?tab=family')}
                    className="flex-1 bg-white/80 hover:bg-white border-purple-300 hover:border-purple-400"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View All Family Tasks
                  </Button>
                </div>

                {/* Recent Family Activity Preview */}
                {recentTasks.filter(task => task.familyId || task.assignedToUserId).slice(0, 2).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Family Tasks</h4>
                    {recentTasks.filter(task => task.familyId || task.assignedToUserId).slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-white/70 dark:bg-gray-700/70 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-colors cursor-pointer"
                        onClick={() => router.push(`/tasks/${task.id}`)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-3 h-3 rounded-full ${task.isCompleted ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{task.title}</p>
                            {task.assignedToUserName && (
                              <p className="text-xs text-gray-500">
                                Assigned to: {task.assignedToUserName}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={`text-xs ${task.isCompleted ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {task.isCompleted ? '✅ Done' : '⏳ Active'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Feed */}
        {familyActivity.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Activity className="h-5 w-5 text-green-600" />
                {hasFamily ? 'Family Activity' : 'Your Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-3">
                {familyActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp?.toString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Creation Modal */}
                    {user && (
                      <TaskCreationModal 
                        user={user}
                        family={currentFamily}
                        onTaskCreated={handleTaskCreated}
            isOpen={isTaskModalOpen}
            onOpenChange={setIsTaskModalOpen}
            editingTask={null}
          />
        )}
      </div>
    </div>
  );
} 