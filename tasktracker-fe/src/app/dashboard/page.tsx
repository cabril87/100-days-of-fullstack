'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { useTasks } from '@/lib/providers/TaskProvider';
import { FocusMode } from '@/components/focus/FocusMode';
import { FocusStats } from '@/components/focus/FocusStats';
import { FocusHistory } from '@/components/focus/FocusHistory';
import Link from 'next/link';
import { Task } from '@/lib/types/task';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useFamily } from '@/lib/providers/FamilyContext';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { tasks: allTasks, loading: tasksLoading, error, fetchTasks } = useTasks();
  const { currentFamily, isLoading: familyLoading } = useFamily();
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

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(task => task.status === 'todo').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);
  
  const dueSoonTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= sevenDaysLater && task.status !== 'done';
  });

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
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-brand-navy-dark mb-2">Dashboard</h1>
        <p className="text-gray-600 text-xl">
          Welcome back, {user?.displayName || user?.username || 'User'}
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 bg-white/50 backdrop-blur-sm p-1 rounded-full border border-gray-200">
          <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-brand-navy data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="focus" className="rounded-full data-[state=active]:bg-brand-navy data-[state=active]:text-white">Focus Mode</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full data-[state=active]:bg-brand-navy data-[state=active]:text-white">Analytics</TabsTrigger>
          <TabsTrigger value="history" className="rounded-full data-[state=active]:bg-brand-navy data-[state=active]:text-white">Focus History</TabsTrigger>
          <TabsTrigger value="family" className="rounded-full data-[state=active]:bg-brand-navy data-[state=active]:text-white">Family</TabsTrigger>
          <TabsTrigger value="upcoming" className="rounded-full data-[state=active]:bg-brand-navy data-[state=active]:text-white">Upcoming Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="apple-card">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-1 text-brand-navy-dark">Task Completion</h3>
                <p className="text-gray-600 text-sm">Overall progress</p>
              </div>
              <div className="text-3xl font-bold text-brand-navy-dark mb-2">{taskStats.completionRate}%</div>
              <Progress value={taskStats.completionRate} className="h-2 mb-2 bg-gray-100" />
              <div className="text-sm text-gray-600">
                {taskStats.completed} of {taskStats.total} tasks completed
              </div>
            </div>
            
            <div className="apple-card">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-1 text-brand-navy-dark">Due Soon</h3>
                <p className="text-gray-600 text-sm">Tasks due in the next 3 days</p>
              </div>
              <div className="text-3xl font-bold text-brand-navy-dark mb-2">{taskStats.dueSoon}</div>
              <div className="text-sm text-gray-600 mb-4">
                {taskStats.dueSoon > 0 ? 
                  <span className="text-brand-beige font-medium">Requires attention</span> : 
                  <span className="text-green-600 font-medium">No urgent tasks</span>
                }
              </div>
              <Link href="/tasks" className="text-brand-navy hover:text-brand-navy-dark text-sm font-medium">
                View all tasks
          </Link>
            </div>
            
            <div className="apple-card">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-1 text-brand-navy-dark">Overdue</h3>
                <p className="text-gray-600 text-sm">Tasks past their due date</p>
              </div>
              <div className="text-3xl font-bold text-brand-navy-dark mb-2">{taskStats.overdue}</div>
              <div className="text-sm text-gray-600 mb-4">
                {taskStats.overdue > 0 ? 
                  <span className="text-brand-navy-dark font-medium">Action needed!</span> : 
                  <span className="text-green-600 font-medium">All caught up</span>
                }
              </div>
              <Link href="/tasks" className="text-brand-navy hover:text-brand-navy-dark text-sm font-medium">
                View all tasks
          </Link>
        </div>
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
          <FocusStats />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <FocusHistory />
        </TabsContent>
        
        <TabsContent value="family" className="space-y-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-navy-dark">Family Dashboard</h2>
            <Button onClick={() => router.push('/family/create')}>
              Create New Family
            </Button>
          </div>
          {currentFamily ? (
            <Card>
              <CardHeader>
                <CardTitle>{currentFamily.name}</CardTitle>
                <CardDescription>Family Dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Members</h3>
                    <div className="grid gap-4">
                      {currentFamily.members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center">
                            {member.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium">{member.username}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => router.push('/family/invite')}>
                  Invite Members
                </Button>
                <Button variant="outline" onClick={() => router.push('/family/settings')}>
                  Settings
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Family Selected</CardTitle>
                <CardDescription>Create a new family or select an existing one</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">You haven't created or joined any families yet.</p>
                <Button 
                  onClick={() => router.push('/family/create')}
                  className="w-full"
                >
                  Create Your First Family
                </Button>
              </CardContent>
            </Card>
          )}
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
  );
} 