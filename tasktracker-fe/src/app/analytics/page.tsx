'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Target,
  Clock,
  CheckCircle,
  ArrowLeft,
  Download,
  Filter,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  taskStats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  timeStats: {
    averageCompletionTime: number;
    mostProductiveHour: number;
    mostProductiveDay: string;
    totalTimeSpent: number;
  };
  trendData: {
    date: string;
    completed: number;
    created: number;
  }[];
  categoryStats: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/analytics');
    }
  }, [authLoading, user, router]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with actual API call
        // For now, generate mock data
        const mockData: AnalyticsData = {
          taskStats: {
            totalTasks: 156,
            completedTasks: 124,
            pendingTasks: 28,
            overdueTasks: 4,
            completionRate: 79.5
          },
          timeStats: {
            averageCompletionTime: 2.5,
            mostProductiveHour: 14,
            mostProductiveDay: 'Tuesday',
            totalTimeSpent: 45.2
          },
          trendData: generateTrendData(),
          categoryStats: [
            { category: 'Work', count: 45, percentage: 28.8 },
            { category: 'Personal', count: 38, percentage: 24.4 },
            { category: 'Health', count: 25, percentage: 16.0 },
            { category: 'Learning', count: 22, percentage: 14.1 },
            { category: 'Family', count: 18, percentage: 11.5 },
            { category: 'Other', count: 8, percentage: 5.1 }
          ]
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const generateTrendData = () => {
    const data = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 10) + 1,
        created: Math.floor(Math.random() * 8) + 2
      });
    }
    
    return data;
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      timeRange,
      analytics: analyticsData
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-analytics-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-300 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Complete more tasks to see your analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Task Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Insights into your productivity and task completion patterns
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <Button
                onClick={exportData}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Completion Rate</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {analyticsData.taskStats.completionRate}%
                  </p>
                  <p className="text-xs text-blue-700">
                    {analyticsData.taskStats.completedTasks} of {analyticsData.taskStats.totalTasks} tasks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Completed Tasks</p>
                  <p className="text-3xl font-bold text-green-900">
                    {analyticsData.taskStats.completedTasks}
                  </p>
                  <p className="text-xs text-green-700">
                    This {timeRange}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-600 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800">Avg. Completion Time</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {analyticsData.timeStats.averageCompletionTime}h
                  </p>
                  <p className="text-xs text-orange-700">
                    Per task
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-800">Most Productive</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {analyticsData.timeStats.mostProductiveDay}
                  </p>
                  <p className="text-xs text-purple-700">
                    at {analyticsData.timeStats.mostProductiveHour}:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-1">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="rounded-lg">Trends</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg">Categories</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-lg">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Task Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Completed</span>
                      <span className="text-sm text-gray-600">{analyticsData.taskStats.completedTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(analyticsData.taskStats.completedTasks / analyticsData.taskStats.totalTasks) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pending</span>
                      <span className="text-sm text-gray-600">{analyticsData.taskStats.pendingTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(analyticsData.taskStats.pendingTasks / analyticsData.taskStats.totalTasks) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Overdue</span>
                      <span className="text-sm text-gray-600">{analyticsData.taskStats.overdueTasks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(analyticsData.taskStats.overdueTasks / analyticsData.taskStats.totalTasks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Time Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Time Spent</span>
                      <span className="text-sm font-bold">{analyticsData.timeStats.totalTimeSpent}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Average per Task</span>
                      <span className="text-sm font-bold">{analyticsData.timeStats.averageCompletionTime}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Most Productive Day</span>
                      <span className="text-sm font-bold">{analyticsData.timeStats.mostProductiveDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Peak Hour</span>
                      <span className="text-sm font-bold">{analyticsData.timeStats.mostProductiveHour}:00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Creation vs Completion Trends</CardTitle>
                <CardDescription>
                  Track how your task creation and completion patterns change over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Categories</CardTitle>
                <CardDescription>
                  Breakdown of your tasks by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.categoryStats.map((category) => (
                    <div key={category.category} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{category.category}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 w-16 text-right">
                        {category.count} ({category.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData.taskStats.completionRate}%
                      </div>
                      <div className="text-sm text-green-700">Overall Completion Rate</div>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(analyticsData.taskStats.completedTasks / 30 * 10) / 10}
                      </div>
                      <div className="text-sm text-blue-700">Tasks per Day (avg)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Productivity Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {Math.round(analyticsData.taskStats.completionRate * 0.85)}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Based on completion rate and consistency
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                        style={{ width: `${Math.round(analyticsData.taskStats.completionRate * 0.85)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 