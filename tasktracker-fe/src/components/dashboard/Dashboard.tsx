'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  CheckCircle, Target, Clock, TrendingUp, Plus, Crown, Sparkles, Users,  Star,
  Trophy,
  UserPlus,
  Zap,
  AlertTriangle,
  Flame,
  Activity,
  Timer
} from 'lucide-react';
import { taskService } from '@/lib/services/taskService';
import { priorityIntToString } from '@/lib/utils/priorityMapping';
import { FamilyDTO, FamilyActivityItem, UserProgress } from '@/lib/types';
import { Task, FamilyTaskItemDTO } from '@/lib/types/task';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';
import { FamilyTaskStats } from '@/lib/types/family-task';
import { FamilyMemberAgeGroup } from '@/lib/types/auth';
// Import components
import TaskCreationModal from '@/components/tasks/TaskCreationModal';
import FamilyTaskDashboard from '@/components/family/FamilyTaskDashboard';
import KidDashboard from '@/components/dashboard/KidDashboard';
import TeenDashboard from '@/components/dashboard/TeenDashboard';
import {
  LivePointsWidget,
  RecentAchievements,
  FamilyActivityStream,
  StreakCounter,
  NotificationStream,
  AnalyticsDashboardWidget,
  FocusModeDashboardWidget
} from '@/components/dashboard/widgets';
import CalendarDashboardWidget from '@/components/dashboard/widgets/CalendarDashboardWidget';
import { useDashboardConnections } from '@/lib/hooks/useDashboardConnections';
import type { 
  DashboardProps, 
  DashboardStats,
  DashboardContentProps 
} from '@/lib/types/component-props/dashboard-props';
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar';
import { Alert, AlertDescription } from '../ui/alert';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { gamificationService } from '@/lib/services/gamificationService';

// ✨ NEW: Dashboard mode types

function Dashboard({ user, initialData }: DashboardProps) {

  // ✨ Optimize renders by memoizing user dependencies
  const userId = useMemo(() => user?.id, [user?.id]);
  const isUserLoaded = useMemo(() => !!user, [user]);
  
  // 🛑 PREVENT EXCESSIVE RENDERS: Stabilize userId dependency
  const stableUserId = useMemo(() => {
    console.log('🎮 Dashboard: stableUserId calculated:', { 
      originalUserId: userId, 
      userObject: user,
      stabilizedUserId: userId 
    });
    return userId;
  }, [userId, user]);
  
  // ✨ Shared dashboard connections to prevent multiple competing SignalR connections
  const dashboardConnectionConfig = useMemo(() => ({
    userId: stableUserId,
    enableLogging: true // Enable logging to debug connection issues
  }), [stableUserId]);
  
  const { isConnected, gamificationData, reconnect } = useDashboardConnections(dashboardConnectionConfig);
  
  // Debug gamification data being passed to widgets (reduced frequency)
  useEffect(() => {
    // Only log when loading state changes to reduce noise
    if (gamificationData.isLoading) {
      console.log('🎮 Dashboard: Gamification loading...');
    } else {
      console.log('🎮 Dashboard: Gamification data for widgets:', {
        isLoading: gamificationData.isLoading,
        currentPoints: gamificationData.currentPoints,
        currentLevel: gamificationData.currentLevel,
        currentStreak: gamificationData.currentStreak,
        totalAchievements: gamificationData.totalAchievements,
        totalBadges: gamificationData.totalBadges,
        isConnected: isConnected
      });
    }
  }, [gamificationData.isLoading, gamificationData.currentPoints, gamificationData.currentLevel, gamificationData.currentStreak, gamificationData.totalAchievements, gamificationData.totalBadges, isConnected]); // Include all used properties

  const router = useRouter();

  // State management
  const [error, setError] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(
    initialData?.stats || {
      tasksCompleted: 0,
      activeGoals: 0,
      focusTime: 0,
      totalPoints: 0,
      streakDays: 0,
      familyMembers: 0,
      familyTasks: 0,
      familyPoints: 0,
      totalFamilies: 0
    }
  );
  const [currentFamily, setCurrentFamily] = useState<FamilyDTO | null>(initialData?.family || null);
  const [hasFamily, setHasFamily] = useState(!!(initialData?.family));
  const [allUserFamilies, setAllUserFamilies] = useState<FamilyDTO[]>(initialData?.family ? [initialData.family] : []);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [familyActivity] = useState<FamilyActivityItem[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [recentTasks, setRecentTasks] = useState<Task[]>(initialData?.recentTasks || []);
  const [dueTodayTasks, setDueTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // ✨ NEW: Family Task Collaboration State
  const [familyTasks, setFamilyTasks] = useState<FamilyTaskItemDTO[]>([]);
  const [familyTaskStats, setFamilyTaskStats] = useState<FamilyTaskStats | null>(null);
  const [activeTab, setActiveTab] = useState<'individual' | 'family'>('individual');

  // ✨ NEW: Permission request state - temporarily disabled
  const [permissionModalOpen] = useState(false);

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
  const familyTaskCounts = useMemo(() => ({
    family: familyTasks.length,
    assignedToMe: familyTasks.filter(task => task.assignedToFamilyMemberId &&
      familyMembers.find(m => m.id === task.assignedToFamilyMemberId)?.userId === user?.id).length,
    iAssigned: familyTasks.filter(task => task.assignedByUserId === user?.id).length,
    pendingApproval: familyTasks.filter(task => task.requiresApproval &&
      task.status === 'completed' && !task.approvedByUserId).length
  }), [familyTasks, familyMembers, user?.id]);

  // Debug family task counts
  useEffect(() => {
    if (hasFamily && currentFamily?.id) {
      console.log('🔍 Family Task Debug:', {
        familyId: currentFamily.id,
        familyName: currentFamily.name,
        familyTasksCount: familyTasks.length,
        familyMembersCount: familyMembers.length,
        userId: user?.id,
        familyTaskCounts,
        familyTasks: familyTasks.map(t => ({ 
          id: t.id, 
          title: t.title, 
          assignedToFamilyMemberId: t.assignedToFamilyMemberId,
          assignedByUserId: t.assignedByUserId,
          familyId: t.familyId 
        })),
        familyMembers: familyMembers.map(m => ({ 
          id: m.id, 
          userId: m.userId, 
          name: m.user?.firstName 
        }))
      });
    }
  }, [hasFamily, currentFamily?.id, currentFamily?.name, familyTasks, familyMembers, familyTaskCounts, user?.id]);

  // Helper function to get member avatar
  const getMemberById = (memberId: number | string) => {
    return familyMembers.find(member => member.id === Number(memberId));
  };

  // ✅ NEW: Helper function to format task titles (Title Case)
  const formatTaskTitle = (title: string): string => {
    if (!title) return '';

    return title
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Handle task creation success
  const handleTaskCreated = useCallback(async (newTask?: Task) => {
    // Add the new task to recent tasks if provided
    if (newTask) {
      setRecentTasks(prev => [newTask, ...prev.slice(0, 4)]);
    }

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
    if (!currentFamily?.id) {
      console.log('⚠️ Cannot load family tasks: No current family ID');
      return;
    }

    try {
      console.log(`📋 Loading family tasks for family ${currentFamily.id} (${currentFamily.name})`);
      
      const [tasks, stats] = await Promise.all([
        taskService.getFamilyTasks(currentFamily.id),
        taskService.getEnhancedFamilyTaskStats(currentFamily.id)
      ]);

      console.log(`✅ Loaded ${tasks.length} family tasks:`, tasks.map(t => ({ 
        id: t.id, 
        title: t.title, 
        assignedToFamilyMemberId: t.assignedToFamilyMemberId,
        assignedByUserId: t.assignedByUserId 
      })));

      setFamilyTasks(tasks);
      setFamilyTaskStats(stats);
    } catch (error) {
      console.error('❌ Failed to load family tasks:', error);
      // Set empty arrays on error to prevent undefined issues
      setFamilyTasks([]);
      setFamilyTaskStats(null);
    }
  }, [currentFamily?.id, currentFamily?.name]);

  // Handle task completion
  const handleTaskCompletion = useCallback(async (taskId: number) => {
    try {
      const taskToComplete = recentTasks.find(t => t.id === taskId) ||
                             dueTodayTasks.find(t => t.id === taskId) ||
                             overdueTasks.find(t => t.id === taskId);

      if (!taskToComplete) {
        console.warn(`Task ${taskId} not found for completion`);
        return;
      }

      console.log(`🎮 Dashboard: Completing task ${taskId}: ${taskToComplete.title}`);

      await taskService.completeTask(taskId);

      // 🎮 REAL-TIME GAMIFICATION INTEGRATION - Process achievements and celebrations
      console.log('🎮 Dashboard: Processing gamification for task completion...', {
        taskId,
        taskTitle: taskToComplete.title,
        taskPoints: taskToComplete.pointsValue,
        taskCategoryId: taskToComplete.categoryId
      });

      const gamificationResult = await gamificationService.processTaskCompletion(taskId, {
        title: taskToComplete.title,
        points: taskToComplete.pointsValue,
        category: taskToComplete.categoryName || 'General'
      });

      console.log('🏆 Dashboard: Gamification processing complete:', {
        pointsEarned: gamificationResult.pointsEarned,
        newAchievements: gamificationResult.newAchievements.length,
        achievementNames: gamificationResult.newAchievements.map(a => a.name),
        levelUp: gamificationResult.levelUp
      });

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

      // Refresh dashboard stats with real gamification data
      const updatedStats = await taskService.getUserTaskStats();
      setDashboardStats(prev => ({
        ...prev,
        tasksCompleted: updatedStats.tasksCompleted,
        activeGoals: updatedStats.activeGoals,
        focusTime: updatedStats.focusTimeToday,
        totalPoints: updatedStats.totalPoints + gamificationResult.pointsEarned,
        streakDays: updatedStats.streakDays
      }));

      // 🎉 Trigger real-time dashboard widget updates via SignalR
      if (gamificationResult.newAchievements.length > 0) {
        console.log('🎯 Dashboard: Broadcasting achievement unlocks to family members...', {
          achievements: gamificationResult.newAchievements.map(a => a.name),
          familyId: currentFamily?.id
        });
      }

      // ✨ NEW: Refresh family stats
      if (currentFamily?.id) {
        await loadFamilyTasks();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      setError('Failed to complete task. Please try again.');
    }
  }, [currentFamily?.id, loadFamilyTasks, recentTasks, dueTodayTasks, overdueTasks]);

  // ✨ NEW: Load recent tasks for dashboard
  const loadRecentTasks = useCallback(async () => {
    if (!userId) return;

    try {
      console.log('📋 Dashboard: Loading recent tasks...');
      const tasks = await taskService.getRecentTasks(10); // Load 10 recent tasks for dashboard
      
      console.log(`✅ Dashboard: Loaded ${tasks.length} recent tasks:`, tasks.map(t => ({ 
        id: t.id, 
        title: t.title, 
        completed: t.isCompleted,
        familyId: t.familyId 
      })));
      
      setRecentTasks(tasks);
      
      // Calculate overdue and due today tasks
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      
      const overdue = tasks.filter(task => 
        !task.isCompleted && 
        task.dueDate && 
        new Date(task.dueDate) < today
      );
      
      const dueToday = tasks.filter(task => 
        !task.isCompleted && 
        task.dueDate && 
        new Date(task.dueDate) >= today && 
        new Date(task.dueDate) < tomorrow
      );
      
      setOverdueTasks(overdue);
      setDueTodayTasks(dueToday);
      
      console.log(`📋 Dashboard: Found ${overdue.length} overdue and ${dueToday.length} due today`);
    } catch (error) {
      console.error('Failed to load recent tasks:', error);
    }
  }, [userId]);

  // ✨ NEW: Load family data including members
  const loadFamilyData = useCallback(async () => {
    if (!currentFamily?.id) return;

    try {
      // Load family members
      const members = await familyInvitationService.getFamilyMembers(currentFamily.id);
      setFamilyMembers(members);
      
      // Update dashboard stats with real family data
      setDashboardStats(prev => ({
        ...prev,
        familyMembers: members.length,
        familyTasks: familyTasks.length
      }));

      console.log(`📊 Loaded ${members.length} family members for dashboard`);
    } catch (error) {
      console.error('Failed to load family data:', error);
    }
  }, [currentFamily?.id, familyTasks.length]);

  // ✨ NEW: Load all user families if not provided in initialData
  const loadUserFamilies = useCallback(async () => {
    if (!userId || allUserFamilies.length > 0) return;

    try {
      console.log('🔍 Dashboard: Loading all user families...');
      
      // Load all families user is part of
      const { familyInvitationService } = await import('@/lib/services/familyInvitationService');
      const allFamilies = await familyInvitationService.getAllFamilies();
      
      if (allFamilies && allFamilies.length > 0) {
        console.log(`✅ Dashboard: Found ${allFamilies.length} families:`, allFamilies.map((f: FamilyDTO) => f.name));
        console.log('📊 Dashboard: Family details:', allFamilies);
        setAllUserFamilies(allFamilies);
        setCurrentFamily(allFamilies[0]); // Set first family as current
        setHasFamily(true);
      } else {
        console.log('ℹ️ Dashboard: User has no families');
        setHasFamily(false);
      }
    } catch (error) {
      console.error('Failed to load user families:', error);
      setHasFamily(false);
    }
  }, [userId, allUserFamilies.length]);

  // ✨ NEW: Enhanced data loading function
  const loadAdditionalData = useCallback(async () => {
    if (!userId) return;

    try {
      // Load all data concurrently for better performance
      await Promise.all([
        // Load user families (if not already loaded)
        loadUserFamilies(),
        // Load recent tasks (this will populate Recent Tasks section)
        loadRecentTasks()
      ]);
      
      // Then load family data if we have a family
      if (currentFamily?.id) {
        console.log(`📊 Dashboard: Loading data for family ${currentFamily.id}`);
        await Promise.all([
          loadFamilyData(),
          loadFamilyTasks()
        ]);
      }
    } catch (error) {
      console.error('Failed to load additional dashboard data:', error);
    }
  }, [userId, currentFamily?.id, loadUserFamilies, loadRecentTasks, loadFamilyData, loadFamilyTasks]);

  useEffect(() => {
    if (!userId || !isUserLoaded) return;
    loadAdditionalData();
  }, [userId, isUserLoaded, loadAdditionalData]);

  // ✨ NEW: Load family tasks when family data changes
  useEffect(() => {
    if (currentFamily?.id && hasFamily) {
      console.log(`🔄 Family changed, loading tasks for family ${currentFamily.id}`);
      loadFamilyTasks();
    }
  }, [currentFamily?.id, hasFamily, loadFamilyTasks]);

  return (
    <div className="space-y-4 px-1">
        {/* Mobile-First Gamified Header */}
        <Card className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white border-0 shadow-xl overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Mobile-First Layout */}
              <div className="lg:hidden space-y-3">
                {/* User Info & Level - Mobile */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white text-purple-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {currentLevel || 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold truncate">
                      Welcome, {user?.displayName || user?.firstName || user?.username || 'Hero'}!
                    </h1>
                    <p className="text-white/90 text-xs">
                      Level {currentLevel || 1} • {dashboardStats.streakDays || 0} day streak 🔥
                    </p>
                  </div>
                </div>
                
                {/* Level Progress - Mobile */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
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
                
                {/* Action Buttons - Mobile */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setIsTaskModalOpen(true)}
                    size="sm"
                    className="flex items-center justify-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 text-xs px-2 py-2"
                  >
                    <Plus className="h-3 w-3" />
                    <span className="font-medium">New</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/tasks')}
                    className="flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-white/30 hover:border-white/50 text-xs px-2 py-2"
                  >
                    <Target className="h-3 w-3" />
                    <span className="font-medium">View</span>
                  </Button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex lg:items-center lg:justify-between gap-8">
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
                      <h1 className="text-3xl font-bold">
                        Welcome back, {user?.displayName || user?.firstName || user?.username || 'Hero'}!
                      </h1>
                      <p className="text-white/90 text-base">
                        Level {currentLevel || 1} Task Master • {dashboardStats.streakDays || 0} day streak 🔥
                      </p>
                    </div>
                  </div>

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
                <div className="space-y-4 min-w-0 max-w-md">
                  <h3 className="text-lg font-semibold">Recent Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {achievementBadges.length > 0 ? achievementBadges.map((badge, index) => (
                      <div key={index} className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium">
                        <span className="text-lg flex-shrink-0">{badge.icon}</span>
                        <span className="truncate">{badge.title}</span>
                      </div>
                    )) : (
                      <div className="text-white/70 text-sm italic">
                        Complete more tasks to unlock achievements! 🏆
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
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
            </div>
          </CardContent>
        </Card>



        {/* Family Creation Prompt */}
        {!hasFamily && (
          <Card className="border-2 border-dashed border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-4 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    🏠 Ready for Family Collaboration?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                    Create or join a family to unlock collaborative task management and shared goals!
                  </p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <Button
                      onClick={() => router.push('/families')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2 text-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      <span>Explore Family Features</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🔧 DEBUG: Family collaboration features are ready but hidden until user has family data');
                        console.log('🔧 Backend API endpoints: /v1/family, /v1/family/{id}/members');
                        console.log('🔧 Current implementation: Dashboard tabs, task assignment, member avatars all working');
                      }}
                      className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-400 dark:hover:bg-purple-900/20 text-sm"
                    >
                      Debug Family Status
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Tab Navigation */}
        {hasFamily && (
          <Card className="border-2 border-purple-200 dark:border-purple-700">
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'individual' | 'family')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 h-auto">
                  <TabsTrigger value="individual" className="flex items-center gap-1 py-2 px-2 text-xs">
                    <Target className="h-3 w-3" />
                    <span>My Tasks</span>
                  </TabsTrigger>
                  <TabsTrigger value="family" className="flex items-center gap-1 py-2 px-2 text-xs">
                    <Users className="h-3 w-3" />
                    <div className="flex items-center gap-1">
                      <span className="hidden sm:inline">Family</span>
                      <span className="sm:hidden">Fam</span>
                      <span className="text-xs opacity-75">({allUserFamilies.length})</span>
                      {familyTaskCounts.pendingApproval > 0 && (
                        <Badge className="bg-orange-500 text-white text-xs px-1 py-0 h-4 min-w-4">
                          {familyTaskCounts.pendingApproval}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="individual" className="space-y-4">
                  {/* Individual Tasks Dashboard */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Individual Task Stats */}
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Completed</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{dashboardStats.tasksCompleted || 0}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Goals</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">{dashboardStats.activeGoals || 0}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Target className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Focus</p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{dashboardStats.focusTime || 0}m</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Points</p>
                            <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{dashboardStats.totalPoints || 0}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Trophy className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="family" className="space-y-4">
                  {/* ✨ NEW: Family Selector Header */}
                  {allUserFamilies.length > 1 && (
                    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span className="font-medium text-sm">Family:</span>
                            <select 
                              value={currentFamily?.id || ''} 
                              onChange={(e) => {
                                const selectedFamily = allUserFamilies.find(f => f.id === parseInt(e.target.value));
                                if (selectedFamily) setCurrentFamily(selectedFamily);
                              }}
                              className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-xs backdrop-blur-sm"
                            >
                              {allUserFamilies.map((family: FamilyDTO) => (
                                <option key={family.id} value={family.id} className="text-gray-800 bg-white">
                                  {family.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="text-xs text-white/90">
                            {allUserFamilies.length} families
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* ✨ NEW: Family Task Collaboration Dashboard */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Family Task Stats */}
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Family</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{familyTaskCounts.family}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">To Me</p>
                            <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{familyTaskCounts.assignedToMe}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserPlus className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">I Made</p>
                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{familyTaskCounts.iAssigned}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Zap className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">Pending</p>
                            <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{familyTaskCounts.pendingApproval}</p>
                          </div>
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-4 w-4 text-white" />
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
                    <>
                    <FamilyTaskDashboard
                      user={user}
                      family={currentFamily}
                      familyMembers={familyMembers}
                    />
                    </>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Completed Tasks */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboardStats.tasksCompleted || 0}</div>
                  <p className="text-green-100 text-xs font-medium">Quests Done</p>
                </div>
                <Trophy className="h-6 w-6 text-green-200" />
              </div>
            </CardContent>
          </Card>

          {/* Active Goals */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboardStats.activeGoals || 0}</div>
                  <p className="text-blue-100 text-xs font-medium">Active Goals</p>
                </div>
                <Target className="h-6 w-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          {/* Total Points */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboardStats.totalPoints || 0}</div>
                  <p className="text-purple-100 text-xs font-medium">XP Points</p>
                </div>
                <Star className="h-6 w-6 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          {/* Streak Days */}
          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboardStats.streakDays || 0}</div>
                  <p className="text-orange-100 text-xs font-medium">Day Streak</p>
                </div>
                <Flame className="h-6 w-6 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family Statistics (if has family) */}
        {hasFamily && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Family Members */}
            <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{dashboardStats.familyMembers || 0}</div>
                    <p className="text-cyan-100 text-xs font-medium">Family Members</p>
                  </div>
                  <Users className="h-6 w-6 text-cyan-200" />
                </div>
              </CardContent>
            </Card>

            {/* Family Tasks */}
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{dashboardStats.familyTasks || 0}</div>
                    <p className="text-emerald-100 text-xs font-medium">Family Quests</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-emerald-200" />
                </div>
              </CardContent>
            </Card>

            {/* Family Points */}
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{dashboardStats.familyPoints || 0}</div>
                    <p className="text-yellow-100 text-xs font-medium">Family XP</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Real-Time Dashboard Widgets */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              🔴 Live Dashboard
            </h2>
            <p className="text-muted-foreground text-xs">
              Real-time updates powered by SignalR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full overflow-hidden">
            <div className="w-full overflow-hidden">
            <LivePointsWidget
              userId={user?.id}
                className="w-full h-full"
              // ✨ Pass shared connection data
              isConnected={isConnected}
              gamificationData={gamificationData}
            />
            </div>

            <div className="w-full overflow-hidden">
            <StreakCounter
              userId={user?.id}
                className="w-full h-full"
              // ✨ Pass shared connection data
              isConnected={isConnected}
              gamificationData={gamificationData}
            />
            </div>

            <div className="w-full overflow-hidden">
            <RecentAchievements
              userId={user?.id}
              maxDisplay={3}
                className="w-full h-full"
              // ✨ Pass shared connection data
              isConnected={isConnected}
              gamificationData={gamificationData}
            />
            </div>

            <div className="w-full overflow-hidden">
            <CalendarDashboardWidget
              userId={user?.id || 0}
              viewMode="advanced"
              events={[]}
              upcomingTasks={recentTasks.slice(0, 5).map(task => ({
                ...task,
                requiresApproval: false, // Default value for missing property
                approvedByUserId: null,
                assignedToFamilyMemberId: task.assignedToUserId,
                assignedByUserId: task.userId || user?.id || 0
              }) as unknown as FamilyTaskItemDTO)}
              stats={{
                totalPoints: dashboardStats.totalPoints || 0,
                completedThisWeek: dashboardStats.tasksCompleted || 0,
                tasksThisWeek: recentTasks.length,
                streakDays: dashboardStats.streakDays || 0,
                upcomingDeadlines: dueTodayTasks.length + overdueTasks.length,
                familyEvents: 0,
                personalEvents: 0,
                achievementsThisMonth: 0
              }}
              onNavigateToCalendar={() => router.push('/calendar')}
              className="w-full h-full"
            />
            </div>

            <div className="w-full overflow-hidden">
            <FamilyActivityStream
              userId={user?.id}
              familyId={currentFamily?.id}
              maxDisplay={4}
                className="w-full h-full"
              // ✨ Pass shared connection data
              isConnected={isConnected}
            />
            </div>

            <div className="w-full overflow-hidden lg:col-span-2 xl:col-span-1">
              <NotificationStream
                maxDisplay={4}
                className="w-full h-full"
                // ✨ Pass shared connection data
                isConnected={isConnected}
              />
            </div>

            <div className="w-full overflow-hidden">
              <AnalyticsDashboardWidget
                userId={user?.id}
                familyId={currentFamily?.id}
                className="w-full h-full"
              />
            </div>

            <div className="w-full overflow-hidden">
              <FocusModeDashboardWidget
                userId={user?.id}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Real-Time Features Info */}
          <Card className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/10 dark:via-blue-900/10 dark:to-purple-900/10 border-2 border-dashed border-green-300 dark:border-green-600">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">
                    {isConnected ? '🚀 Real-Time Active!' : '⚠️ Connection Issue'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {isConnected 
                      ? 'Dashboard updates instantly when tasks are completed or achievements earned!'
                      : 'Widgets showing offline status. Check backend connection.'
                    }
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Debug: isConnected={String(isConnected)}, userId={user?.id}
                    </div>
                  )}
                </div>
                <div className="text-left md:text-right w-full md:w-auto">
                  <div className={`flex items-center gap-1 font-medium text-xs ${
                    isConnected ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      isConnected ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    {isConnected ? 'Live' : 'Offline'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isConnected ? 'SignalR OK' : 'SignalR Down'}
                  </p>
                  {!isConnected && process.env.NODE_ENV === 'development' && (
                    <button 
                      onClick={async () => {
                        console.log('🔄 Manual force reconnect attempt...');
                        try {
                          await reconnect(); // Use the enhanced force reconnect method
                          console.log('✅ Force reconnect completed successfully');
                        } catch (error) {
                          console.error('Force reconnect failed:', error);
                          // Fallback to page reload if force reconnect fails
                          window.location.reload();
                        }
                      }}
                      className="mt-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded"
                    >
                      🔄 Reconnect
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full overflow-hidden">
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
                        <p className="font-medium text-sm truncate">{formatTaskTitle(task.title)}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
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
                    {(dashboardStats.tasksCompleted || 0) === 0 && (dashboardStats.activeGoals || 0) === 0 && (dashboardStats.totalPoints || 0) === 0 ? (
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

          <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Timer className="h-5 w-5 text-orange-600" />
                Urgent Quests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                          <span className="text-sm font-medium">{formatTaskTitle(task.title)}</span>
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
                          <span className="text-sm font-medium">{formatTaskTitle(task.title)}</span>
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

        {currentFamily && (
          <Card className="bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-2 border-purple-200 dark:border-purple-700 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold text-base block truncate">
                      👨‍👩‍👧‍👦 Family
                    </span>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">
                      {currentFamily.name}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/families/${currentFamily.id}`)}
                  className="bg-white/80 hover:bg-white border-purple-300 hover:border-purple-400 text-purple-700 hover:text-purple-800 text-xs px-2 py-1 flex-shrink-0"
                >
                  <Target className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">View</span>
                  <span className="sm:hidden">Go</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="text-lg font-black text-purple-600 dark:text-purple-400">
                      {familyTaskCounts.family || 0}
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Family
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {familyTaskCounts.assignedToMe || 0}
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      To Me
                    </div>
                  </div>
                  <div className="text-center p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-cyan-200 dark:border-cyan-700">
                    <div className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                      {familyTaskCounts.iAssigned || 0}
                    </div>
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      I Made
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => setIsTaskModalOpen(true)}
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-xs py-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Create Family Task</span>
                    <span className="sm:hidden">Create Task</span>
                    <Sparkles className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/tasks?tab=family')}
                    className="w-full bg-white/80 hover:bg-white border-purple-300 hover:border-purple-400 text-xs py-2"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">View All Family Tasks</span>
                    <span className="sm:hidden">View All</span>
                  </Button>
                </div>

                {recentTasks.filter(task => task.familyId || task.assignedToUserId).slice(0, 2).length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recent Family Tasks</h4>
                    {recentTasks.filter(task => task.familyId || task.assignedToUserId).slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 bg-white/70 dark:bg-gray-700/70 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/90 dark:hover:bg-gray-700/90 transition-colors cursor-pointer"
                        onClick={() => router.push(`/tasks/${task.id}`)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-2 h-2 rounded-full ${task.isCompleted ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{formatTaskTitle(task.title)}</p>
                            {task.assignedToUserName && (
                              <p className="text-xs text-gray-500 truncate">
                                To: {task.assignedToUserName}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={`text-xs px-1 py-0 h-4 ${task.isCompleted ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                          {task.isCompleted ? '✅' : '⏳'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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

        {permissionModalOpen && (
          <div>Permission modal placeholder</div>
        )}
    </div>
  );
}

export default memo(Dashboard);

// ✨ NEW: Age-based Dashboard Wrapper Component
export function AgeDashboard({ user, initialData }: DashboardContentProps) {
  // Handle task completion for all age groups
  const handleTaskComplete = useCallback((taskId: number) => {
    // This will be handled by the individual dashboard components
    console.log('Task completed:', taskId);
  }, []);

  // Handle permission requests
  const handlePermissionRequest = useCallback((action: string, description: string) => {
    console.log('Permission requested:', action, description);
    // TODO: Implement actual permission request logic
  }, []);

  // Route to age-appropriate dashboard
  if (!user) {
    return <Dashboard user={user} initialData={initialData} />;
  }

  switch (user.ageGroup) {
    case FamilyMemberAgeGroup.Child:
      return (
        <KidDashboard
          user={user}
          initialData={{
            family: initialData?.family || null,
            stats: initialData?.stats || {
              tasksCompleted: 0,
              activeGoals: 0,
              focusTime: 0,
              totalPoints: 0,
              streakDays: 0,
              familyMembers: 0,
              familyTasks: 0,
              familyPoints: 0,
              totalFamilies: 0
            },
            recentTasks: initialData?.recentTasks || [],
            taskStats: initialData?.taskStats || {
              total: 0,
              completed: 0,
              pending: 0,
              inProgress: 0,
              overdue: 0
            }
          }}
          onTaskComplete={handleTaskComplete}
          onRequestPermission={handlePermissionRequest}
        />
      );

    case FamilyMemberAgeGroup.Teen:
      return (
        <TeenDashboard
          user={user}
          initialData={{
            family: initialData?.family || null,
            stats: initialData?.stats || {
              tasksCompleted: 0,
              activeGoals: 0,
              focusTime: 0,
              totalPoints: 0,
              streakDays: 0,
              familyMembers: 0,
              familyTasks: 0,
              familyPoints: 0,
              totalFamilies: 0
            },
            recentTasks: initialData?.recentTasks || [],
            taskStats: initialData?.taskStats || {
              total: 0,
              completed: 0,
              pending: 0,
              inProgress: 0,
              overdue: 0
            }
          }}
          onTaskComplete={handleTaskComplete}
          onRequestPermission={handlePermissionRequest}
        />
      );

    case FamilyMemberAgeGroup.Adult:
    default:
      return <Dashboard user={user} initialData={initialData} />;
  }
} 
