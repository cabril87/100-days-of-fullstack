'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatsCard, ProgressCard } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { useTasks } from '@/lib/providers/TaskProvider';
import { FocusMode } from '@/components/focus/FocusMode';
import { FocusHistory } from '@/components/focus/FocusHistory';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import Link from 'next/link';
import { Task } from '@/lib/types/task';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
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
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { tasks: allTasks, error, fetchTasks } = useTasks();
  const router = useRouter();
  const { showToast } = useToast();
  
  const tasks = Array.isArray(allTasks) ? allTasks : [];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, fetchTasks]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  // These variables are used in the JSX below, keeping them

  const getTasksDueSoon = (tasks: Task[]) => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate > now && dueDate <= threeDaysFromNow && task.status !== 'done';
    });
  };

  const getOverdueTasks = (tasks: Task[]) => {
    const now = new Date();
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < now && task.status !== 'done';
    });
  };

  const [isLoading, setIsLoading] = useState(true);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    completionRate: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    dueSoon: 0,
    overdue: 0
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchTasks();
      } catch (error) {
        console.error('Error fetching tasks for dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchTasks]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const completed = tasks.filter(task => task.status === 'done').length;
      const inProgress = tasks.filter(task => task.status === 'in-progress').length;
      const todo = tasks.filter(task => task.status === 'todo').length;
      const total = tasks.length;
      
      const highPriority = tasks.filter(task => task.priority === 'high').length;
      const mediumPriority = tasks.filter(task => task.priority === 'medium').length;
      const lowPriority = tasks.filter(task => task.priority === 'low').length;
      
      const dueSoon = getTasksDueSoon(tasks).length;
      const overdue = getOverdueTasks(tasks).length;
      
      setTaskStats({
        total,
        completed,
        inProgress,
        todo,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        highPriority,
        mediumPriority,
        lowPriority,
        dueSoon,
        overdue
      });
    }
  }, [tasks]);

  const statusData = [
    { name: 'To Do', value: taskStats.todo, color: '#3E5879' },
    { name: 'In Progress', value: taskStats.inProgress, color: '#D8C4B6' },
    { name: 'Completed', value: taskStats.completed, color: '#213555' }
  ];

  const priorityData = [
    { name: 'Low', value: taskStats.lowPriority, color: '#3E5879' },
    { name: 'Medium', value: taskStats.mediumPriority, color: '#D8C4B6' },
    { name: 'High', value: taskStats.highPriority, color: '#213555' }
  ];

  const weeklyData = [
    { name: 'Mon', completed: 5, total: 8 },
    { name: 'Tue', completed: 7, total: 10 },
    { name: 'Wed', completed: 4, total: 6 },
    { name: 'Thu', completed: 3, total: 7 },
    { name: 'Fri', completed: 8, total: 12 },
    { name: 'Sat', completed: 2, total: 5 },
    { name: 'Sun', completed: 1, total: 3 }
  ];

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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-4">
            Dashboard
          </h1>
          <p className="text-gray-600 text-xl">
            Welcome back, {user?.displayName || user?.username || 'User'}
          </p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Tasks"
            value={taskStats.total.toString()}
            icon={<CheckSquare className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Completed"
            value={taskStats.completed.toString()}
            icon={<Trophy className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-green-500 to-emerald-600"
            trend={taskStats.completionRate}
            isLoading={isLoading}
          />
          
          <StatsCard
            title="In Progress"
            value={taskStats.inProgress.toString()}
            icon={<Clock className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-amber-500 to-orange-600"
            isLoading={isLoading}
          />
          
          <StatsCard
            title="Due Soon"
            value={taskStats.dueSoon.toString()}
            icon={<AlertTriangle className="h-5 w-5 text-white" />}
            bgColor="bg-gradient-to-br from-red-500 to-red-600"
            isLoading={isLoading}
          />
        </div>

      <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 bg-white/70 backdrop-blur-sm p-1 rounded-full border border-gray-200 shadow-sm">
            <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="focus" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Brain className="h-4 w-4 mr-2" />
              Focus Mode
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="family" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Family
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Target className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          {/* First Row - Task Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ProgressCard
                title="Task Completion"
                currentValue={taskStats.completed}
                maxValue={taskStats.total}
                progress={taskStats.completionRate}
                icon={<Trophy className="h-5 w-5 text-purple-600" />}
                isLoading={isLoading}
              />
              
              <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Target className="h-5 w-5 text-blue-600" />
                    Priority Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">High Priority</span>
                        <span className="text-sm font-medium text-red-600">{taskStats.highPriority}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Medium Priority</span>
                        <span className="text-sm font-medium text-amber-600">{taskStats.mediumPriority}</span>
              </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Low Priority</span>
                        <span className="text-sm font-medium text-green-600">{taskStats.lowPriority}</span>
              </div>
            </div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Urgent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <span className="text-sm font-medium text-red-800">Overdue</span>
                        <span className="text-lg font-bold text-red-600">{taskStats.overdue}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <span className="text-sm font-medium text-amber-800">Due Soon</span>
                        <span className="text-lg font-bold text-amber-600">{taskStats.dueSoon}</span>
              </div>
              </div>
                  )}
                </CardContent>
              </Card>
      </div>

          {/* Second Row - Calendar Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CalendarWidget className="lg:col-span-1 hover:shadow-lg transition-all duration-300 border-gray-200 bg-white/80 backdrop-blur-sm" />
            
            {/* Quick Actions */}
            <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300 border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Target className="h-5 w-5 text-green-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/tasks/create" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    <CheckSquare className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-blue-800">New Task</span>
                  </Link>
                  <Link href="/calendar" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-purple-800">Calendar</span>
                  </Link>
                  <Link href="/focus" className="flex flex-col items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                    <Brain className="h-8 w-8 text-amber-600 mb-2" />
                    <span className="text-sm font-medium text-amber-800">Focus Mode</span>
                  </Link>
                  <Link href="/analytics" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-green-800">Analytics</span>
                  </Link>
                </div>
                </CardContent>
              </Card>
      </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="apple-card">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1 text-brand-navy-dark">Task Status</h3>
                <p className="text-gray-600 text-sm">Distribution by current status</p>
              </div>
              <div className="flex justify-center">
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="apple-card">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-1 text-brand-navy-dark">Task Priority</h3>
                <p className="text-gray-600 text-sm">Distribution by priority level</p>
              </div>
              <div className="flex justify-center">
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          
          {/* Weekly Completion Chart */}
          <div className="apple-card">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-1 text-brand-navy-dark">Weekly Task Completion</h3>
              <p className="text-gray-600 text-sm">Tasks completed vs. total tasks</p>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Tasks" fill="#D8C4B6" />
                  <Bar dataKey="completed" name="Completed" fill="#3E5879" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="focus" className="space-y-6">
          <FocusMode />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Focus Analytics
              </CardTitle>
              <CardDescription>
                Complete focus analytics are now integrated into the Focus Hub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics moved to Focus Hub</h3>
                <p className="text-gray-600 mb-4">
                  All focus analytics, insights, and ML predictions are now unified in the Focus Hub for a better experience.
                </p>
                <Link href="/focus" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300">
                  <Brain className="h-4 w-4" />
                  Go to Focus Hub
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <FocusHistory />
        </TabsContent>
        
          <TabsContent value="family" className="space-y-6">
            {/* Family Calendar Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CalendarWidget className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-white/80 backdrop-blur-sm" />
              
              <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Users className="h-5 w-5 text-purple-600" />
                    Family Hub
                  </CardTitle>
                  <CardDescription>
                    Quick access to family features and coordination
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/family" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                      <Users className="h-8 w-8 text-orange-600 mb-2" />
                      <span className="text-sm font-medium text-orange-800">Family Hub</span>
                    </Link>
                    <Link href="/calendar" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                      <span className="text-sm font-medium text-blue-800">Full Calendar</span>
                    </Link>
                    <Link href="/family/create" className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <Target className="h-8 w-8 text-green-600 mb-2" />
                      <span className="text-sm font-medium text-green-800">Create Family</span>
                    </Link>
                    <Link href="/family/join" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                      <Users className="h-8 w-8 text-purple-600 mb-2" />
                      <span className="text-sm font-medium text-purple-800">Join Family</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Family Features Info */}
            <Card className="hover:shadow-lg transition-all duration-300 border-gray-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Family Coordination Features
                </CardTitle>
                <CardDescription>
                  Available family management and scheduling tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Shared Calendar</h3>
                    <p className="text-sm text-gray-600">Coordinate family schedules and events with smart conflict detection</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Member Management</h3>
                    <p className="text-sm text-gray-600">Add family members and manage roles and permissions</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
                    <p className="text-sm text-gray-600">AI-powered optimal time suggestions and availability tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Tasks due in the next 3 days</CardDescription>
            </CardHeader>
            <CardContent>
              {getTasksDueSoon(tasks).length > 0 ? (
                <div className="space-y-4">
                  {getTasksDueSoon(tasks).map(task => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority ? 
                            task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 
                            'Medium'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span>Due: {new Date(task.dueDate!).toLocaleDateString()}</span>
                        <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
                          View Task
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tasks due in the next 3 days</p>
                  <Link href="/tasks/new" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Create New Task
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Overdue Tasks</CardTitle>
              <CardDescription>Tasks past their due date</CardDescription>
            </CardHeader>
            <CardContent>
              {getOverdueTasks(tasks).length > 0 ? (
                <div className="space-y-4">
                  {getOverdueTasks(tasks).map(task => (
                    <div key={task.id} className="p-4 border rounded-lg border-red-200 bg-red-50">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          Overdue
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                        <span>Due: {new Date(task.dueDate!).toLocaleDateString()}</span>
                        <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
                          View Task
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
                <div className="text-center py-8">
                  <p className="text-green-600">No overdue tasks!</p>
        </div>
      )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
} 