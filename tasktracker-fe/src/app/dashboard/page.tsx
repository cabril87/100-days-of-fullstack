'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatsCard, ProgressCard } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useFocus } from '@/lib/providers/FocusContext';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { FocusModeManager } from '@/components/focus/FocusModeManager';
import Link from 'next/link';
import { Task } from '@/lib/types/task';
import { 
  CheckSquare, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertTriangle,
  Trophy,
  Brain,
  BarChart3,
  Play,
  PlusCircle,
  FileText,
  Zap,
  Star,
  Flame,
  Award,
  Eye,
  ArrowRight,
  Settings,
  Home,
  RefreshCw,
  Sparkles,
  Activity,
  BookOpen,
  Crown,
  Rocket
} from 'lucide-react';
import { familyService } from '@/lib/services/familyService';
import { templateService } from '@/lib/services/templateService';
import { gamificationService } from '@/lib/services/gamificationService';
import { Family } from '@/lib/types/family';

interface DashboardStats {
  // Tasks
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  dueSoonTasks: number;
  completionRate: number;
  
  // Families
  totalFamilies: number;
  totalFamilyMembers: number;
  familyTasks: number;
  
  // Templates
  totalTemplates: number;
  myTemplates: number;
  templatesUsed: number;
  
  // Focus
  focusStreak: number;
  totalFocusTime: number;
  focusSessionsToday: number;
  
  // Gamification
  currentLevel: number;
  totalPoints: number;
  pointsToNextLevel: number;
  currentStreak: number;
  totalAchievements: number;
  userTier: string;
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { tasks: allTasks, error, fetchTasks } = useTasks();
  const { currentSession, statistics: focusStats } = useFocus();
  const router = useRouter();
  const { showToast } = useToast();
  
  const tasks = Array.isArray(allTasks) ? allTasks : [];

  // Dashboard state
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    dueSoonTasks: 0,
    completionRate: 0,
    totalFamilies: 0,
    totalFamilyMembers: 0,
    familyTasks: 0,
    totalTemplates: 0,
    myTemplates: 0,
    templatesUsed: 0,
    focusStreak: 0,
    totalFocusTime: 0,
    focusSessionsToday: 0,
    currentLevel: 1,
    totalPoints: 0,
    pointsToNextLevel: 100,
    currentStreak: 0,
    totalAchievements: 0,
    userTier: 'bronze'
  });
  
  const [families, setFamilies] = useState<Family[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [gamificationData, setGamificationData] = useState<any>(null);

  // Authentication redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [authLoading, user, router]);

  // Fetch all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch tasks
      await fetchTasks();
      
      // Fetch families
      const familiesResponse = await familyService.getAllFamilies();
      if (familiesResponse.data) {
        setFamilies(familiesResponse.data);
      }
      
      // Fetch gamification data
      try {
        const [userProgress, gamificationStats] = await Promise.all([
          gamificationService.getUserProgress(),
          gamificationService.getGamificationStats()
        ]);
        
        if (userProgress || gamificationStats) {
          setGamificationData({ userProgress, stats: gamificationStats });
        }
      } catch (gamificationError) {
        console.warn('Gamification data not available:', gamificationError);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Failed to load some dashboard data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchTasks, showToast]);

  // Initial data load
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Process data when tasks change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      processTasksData(tasks);
    }
  }, [tasks]);

  // Process families data
  useEffect(() => {
    if (families.length > 0) {
      processFamiliesData(families);
    }
  }, [families]);

  // Process gamification data
  useEffect(() => {
    if (gamificationData) {
      processGamificationData(gamificationData);
    }
  }, [gamificationData]);

  const processTasksData = (tasks: Task[]) => {
    const completed = tasks.filter(task => task.status === 'done').length;
    const inProgress = tasks.filter(task => task.status === 'in-progress').length;
    const total = tasks.length;

    // Calculate overdue and due soon
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    const overdue = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      return new Date(task.dueDate) < now;
    }).length;
    
    const dueSoon = tasks.filter(task => {
      if (!task.dueDate || task.status === 'done') return false;
      const dueDate = new Date(task.dueDate);
      return dueDate > now && dueDate <= threeDaysFromNow;
    }).length;
    
    // Get recent tasks (last 5 updated)
    const recent = [...tasks]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || '').getTime() - new Date(a.updatedAt || a.createdAt || '').getTime())
      .slice(0, 5);
    
    setRecentTasks(recent);
    
    setDashboardStats(prev => ({
      ...prev,
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      dueSoonTasks: dueSoon,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }));
  };

  const processFamiliesData = (families: Family[]) => {
    const totalMembers = families.reduce((sum, family) => 
      sum + (family.members?.length || 0), 0
    );
    
    const familyTasks = families.reduce((sum, family) => 
      sum + (family.members?.reduce((memberSum, member) => 
        memberSum + (member.pendingTasks || 0) + (member.completedTasks || 0), 0) || 0), 0
    );
    
    setDashboardStats(prev => ({
      ...prev,
      totalFamilies: families.length,
      totalFamilyMembers: totalMembers,
      familyTasks
    }));
  };

  const processGamificationData = (data: any) => {
    const userProgress = data.userProgress || {};
    const stats = data.stats || {};
    
    setDashboardStats(prev => ({
      ...prev,
      currentLevel: userProgress.currentLevel || 1,
      totalPoints: userProgress.totalPointsEarned || 0,
      pointsToNextLevel: userProgress.pointsToNextLevel || 100,
      currentStreak: userProgress.currentStreak || 0,
      totalAchievements: stats.achievementsUnlocked || 0,
      userTier: userProgress.currentTier || 'bronze'
    }));
  };

  // Handle error display
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  // Quick action handlers
  const handleQuickCreateTask = () => {
    router.push('/tasks/create');
  };

  const handleQuickStartFocus = () => {
    router.push('/focus');
  };

  const handleQuickViewFamilies = () => {
    router.push('/family');
  };

  const handleQuickViewTemplates = () => {
    router.push('/templates');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-dotted border-purple-500"></div>
            <p className="text-gray-600 text-sm mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Hero Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2">
                  Welcome back, {user?.displayName || user?.username || 'Productivity Champion'}! 
          </h1>
                <p className="text-gray-600 text-lg">
                  Ready to tackle your goals and boost your productivity?
                </p>
                
                {/* Achievement Preview */}
                {gamificationData && (
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full border border-amber-200">
                      <Crown className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">Level {dashboardStats.currentLevel}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full border border-purple-200">
                      <Trophy className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">{dashboardStats.totalPoints} Points</span>
                    </div>
                    {dashboardStats.currentStreak > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full border border-orange-200">
                        <Flame className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">{dashboardStats.currentStreak} day streak</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  onClick={loadDashboardData} 
                  variant="outline" 
                  size="sm"
                  className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-all duration-300"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Button 
                  onClick={handleQuickStartFocus}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Focus
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Tasks"
            value={dashboardStats.inProgressTasks.toString()}
            icon={<Clock className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={dashboardStats.completionRate}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Completed Today"
            value={dashboardStats.completedTasks.toString()}
            icon={<CheckSquare className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
            trend={15}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Focus Sessions"
            value={currentSession ? "1 Active" : "0 Active"}
            icon={<Brain className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
            trend={dashboardStats.focusStreak}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Family Hub"
            value={dashboardStats.totalFamilies.toString()}
            icon={<Users className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-amber-500 to-orange-600"
            trend={dashboardStats.totalFamilyMembers}
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600 opacity-[0.05] rounded-full blur-2xl"></div>
            
            <div className="relative z-10 p-3">
              <TabsList className="grid w-full grid-cols-5 gap-2 bg-transparent h-auto">
                <TabsTrigger 
                  value="overview" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Home className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Overview</div>
                    <div className="text-xs opacity-80">Main dashboard</div>
                  </div>
            </TabsTrigger>
                
                <TabsTrigger 
                  value="tasks" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Tasks</div>
                    <div className="text-xs opacity-80">Manage & track</div>
                  </div>
            </TabsTrigger>
                
                <TabsTrigger 
                  value="focus" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Focus</div>
                    <div className="text-xs opacity-80">Deep work mode</div>
                  </div>
            </TabsTrigger>
                
                <TabsTrigger 
                  value="family" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Family</div>
                    <div className="text-xs opacity-80">Collaborate</div>
                  </div>
            </TabsTrigger>
                
                <TabsTrigger 
                  value="gamification" 
                  className="group relative rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <div className="p-2 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Achievements</div>
                    <div className="text-xs opacity-80">Level up</div>
                  </div>
            </TabsTrigger>
        </TabsList>
            </div>
          </div>
        
          {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Quick Actions */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
                
                <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b relative z-10">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleQuickCreateTask}
                      className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <PlusCircle className="h-6 w-6" />
                      <span className="text-sm font-medium">New Task</span>
                    </Button>
                    
                    <Button 
                      onClick={handleQuickStartFocus}
                      className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Brain className="h-6 w-6" />
                      <span className="text-sm font-medium">Start Focus</span>
                    </Button>
                    
                    <Button 
                      onClick={handleQuickViewTemplates}
                      className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-sm font-medium">Templates</span>
                    </Button>
                    
                    <Button 
                      onClick={handleQuickViewFamilies}
                      className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      <Users className="h-6 w-6" />
                      <span className="text-sm font-medium">Families</span>
                    </Button>
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/calendar">
                        <Calendar className="h-4 w-4 mr-2" />
                        Calendar
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/analytics">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tasks */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
                
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b relative z-10">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                  <div className="space-y-3">
                  {isLoading ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))
                    ) : recentTasks.length > 0 ? (
                      recentTasks.map((task) => (
                        <div key={task.id} className="p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{task.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={task.status === 'done' ? 'default' : 'secondary'} className="text-xs">
                                  {task.status}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {task.priority} priority
                                </span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={`/tasks/${task.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                    </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CheckSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No tasks yet</p>
                        <Button onClick={handleQuickCreateTask} className="mt-2" size="sm">
                          Create your first task
                        </Button>
                      </div>
                    )}
              </div>
                  
                  {recentTasks.length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href="/tasks">
                          View All Tasks
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
            </div>
                  )}
                </CardContent>
              </Card>

              {/* Calendar Widget */}
              <CalendarWidget className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all" />
            </div>

            {/* Progress & Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Task Progress Overview */}
              <ProgressCard
                title="Weekly Progress"
                currentValue={dashboardStats.completedTasks}
                maxValue={dashboardStats.totalTasks}
                progress={dashboardStats.completionRate}
                icon={<Target className="h-5 w-5 text-purple-600" />}
                isLoading={isLoading}
              />

              {/* Urgent Items Alert */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600 opacity-[0.05] rounded-full blur-2xl"></div>
                
                <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-orange-50 border-b relative z-10">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Attention Needed
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 relative z-10">
                    <div className="space-y-4">
                    {dashboardStats.overdueTasks > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{dashboardStats.overdueTasks} overdue tasks</strong> need immediate attention
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {dashboardStats.dueSoonTasks > 0 && (
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{dashboardStats.dueSoonTasks} tasks</strong> are due within 3 days
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {dashboardStats.overdueTasks === 0 && dashboardStats.dueSoonTasks === 0 && (
                      <div className="text-center py-4 text-green-600">
                        <CheckSquare className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-medium">All caught up!</p>
                        <p className="text-sm text-gray-600">No urgent tasks at the moment</p>
                      </div>
                    )}
              </div>
                </CardContent>
              </Card>
      </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Tasks"
                value={dashboardStats.totalTasks.toString()}
                icon={<CheckSquare className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
                isLoading={isLoading}
              />
              
              <StatsCard
                title="In Progress"
                value={dashboardStats.inProgressTasks.toString()}
                icon={<Clock className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-amber-500 to-orange-600"
                isLoading={isLoading}
              />
              
              <StatsCard
                title="Completed"
                value={dashboardStats.completedTasks.toString()}
                icon={<Trophy className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
                trend={dashboardStats.completionRate}
                isLoading={isLoading}
              />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Task Management</h3>
                <Button onClick={handleQuickCreateTask} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
                  <Link href="/tasks">
                    <Eye className="h-6 w-6" />
                    <span>View All</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
                  <Link href="/tasks/create">
                    <PlusCircle className="h-6 w-6" />
                    <span>Create Task</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
                  <Link href="/templates">
                    <BookOpen className="h-6 w-6" />
                    <span>Templates</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
                  <Link href="/analytics">
                    <BarChart3 className="h-6 w-6" />
                    <span>Analytics</span>
                  </Link>
                </Button>
            </div>
          </div>
        </TabsContent>
        
          {/* Focus Tab */}
        <TabsContent value="focus" className="space-y-6">
            <FocusModeManager showTaskDetails={true} showStreakCounter={true} showKeyboardHelp={false} />
        </TabsContent>
        
          {/* Family Tab */}
          <TabsContent value="family" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Active Families"
                value={dashboardStats.totalFamilies.toString()}
                icon={<Users className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
                isLoading={isLoading}
              />
              
              <StatsCard
                title="Total Members"
                value={dashboardStats.totalFamilyMembers.toString()}
                icon={<Users className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
                isLoading={isLoading}
              />
              
              <StatsCard
                title="Family Tasks"
                value={dashboardStats.familyTasks.toString()}
                icon={<CheckSquare className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                isLoading={isLoading}
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Family Hub</h3>
                <Button onClick={handleQuickViewFamilies} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Families
                </Button>
                    </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
                  <Link href="/family">
                    <Users className="h-6 w-6" />
                    <span>All Families</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
                  <Link href="/family/create">
                    <PlusCircle className="h-6 w-6" />
                    <span>Create Family</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
                  <Link href="/family/join">
                    <Users className="h-6 w-6" />
                    <span>Join Family</span>
                  </Link>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
                  <Link href="/family/calendar">
                    <Calendar className="h-6 w-6" />
                    <span>Calendar</span>
                  </Link>
                </Button>
                  </div>
              
              {families.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Your Families</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {families.slice(0, 4).map((family) => (
                      <div key={family.id} className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-green-900">{family.name}</h5>
                            <p className="text-sm text-green-700">{family.members?.length || 0} members</p>
                    </div>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/family/${family.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                  </div>
                    </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        
          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Current Level"
                value={dashboardStats.currentLevel.toString()}
                icon={<Crown className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-amber-500 to-yellow-600"
                isLoading={isLoading}
              />
              
              <StatsCard
                title="Total Points"
                value={dashboardStats.totalPoints.toString()}
                icon={<Star className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
                isLoading={isLoading}
              />
              
              <StatsCard
                title="Achievements"
                value={dashboardStats.totalAchievements.toString()}
                icon={<Trophy className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
                isLoading={isLoading}
              />
              
              <StatsCard
                title="Current Streak"
                value={`${dashboardStats.currentStreak} days`}
                icon={<Flame className="h-5 w-5 text-white" />}
                bgColor="bg-gradient-to-br from-orange-500 to-red-600"
                isLoading={isLoading}
              />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Level Progress</h3>
                <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
                  {dashboardStats.userTier.charAt(0).toUpperCase() + dashboardStats.userTier.slice(1)} Tier
                </Badge>
              </div>
              
                <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Level {dashboardStats.currentLevel}</span>
                  <span className="text-sm text-gray-500">
                    {dashboardStats.totalPoints} / {dashboardStats.totalPoints + dashboardStats.pointsToNextLevel} XP
                        </span>
                </div>
                
                <Progress 
                  value={dashboardStats.pointsToNextLevel > 0 
                    ? (dashboardStats.totalPoints / (dashboardStats.totalPoints + dashboardStats.pointsToNextLevel)) * 100 
                    : 100
                  } 
                  className="h-3"
                />
                
                <p className="text-sm text-gray-600">
                  {dashboardStats.pointsToNextLevel} points needed for next level
                </p>
              </div>
              
              <div className="mt-6 flex gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/gamification">
                    <Trophy className="h-4 w-4 mr-2" />
                    View All Achievements
                  </Link>
                </Button>
                
                <Button variant="outline" className="flex-1" asChild>
                  <Link href="/leaderboard">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Leaderboard
                        </Link>
                </Button>
              </div>
        </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
} 