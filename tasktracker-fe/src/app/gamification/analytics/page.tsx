'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Calendar,
  Clock,
  ArrowLeft,
  Download,
  Filter,
  Eye,
  Target,
  Zap,
  Trophy,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { gamificationService } from '@/lib/services/gamificationService';
import { useToast } from '@/lib/hooks/useToast';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface AnalyticsData {
  pointsOverTime: { date: string; points: number; cumulative: number }[];
  achievementsByCategory: { category: string; count: number; percentage: number }[];
  streakHistory: { date: string; streak: number; isActive: boolean }[];
  activityHeatmap: { date: string; taskCount: number; pointsEarned: number }[];
  performanceMetrics: {
    averagePointsPerDay: number;
    totalActiveDays: number;
    longestStreak: number;
    mostProductiveDay: string;
    mostProductiveHour: number;
    consistency: number;
  };
  goalProgress: { goal: string; current: number; target: number; percentage: number }[];
  comparisonData: {
    familyAverage: number;
    userRank: number;
    totalUsers: number;
    percentile: number;
  };
}

interface TimeRange {
  label: string;
  value: string;
  days: number;
}

export default function AnalyticsPage(): React.ReactElement {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'goals' | 'comparison'>('overview');
  const { showToast } = useToast();

  const timeRanges: TimeRange[] = [
    { label: '7 Days', value: '7d', days: 7 },
    { label: '30 Days', value: '30d', days: 30 },
    { label: '90 Days', value: '90d', days: 90 },
    { label: '1 Year', value: '1y', days: 365 }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Simulate analytics data since we don't have these endpoints yet
      const sampleData: AnalyticsData = {
        pointsOverTime: generatePointsOverTime(),
        achievementsByCategory: [
          { category: 'Productivity', count: 12, percentage: 40 },
          { category: 'Consistency', count: 8, percentage: 27 },
          { category: 'Challenges', count: 6, percentage: 20 },
          { category: 'Social', count: 4, percentage: 13 }
        ],
        streakHistory: generateStreakHistory(),
        activityHeatmap: generateActivityHeatmap(),
        performanceMetrics: {
          averagePointsPerDay: 145,
          totalActiveDays: 25,
          longestStreak: 14,
          mostProductiveDay: 'Tuesday',
          mostProductiveHour: 14,
          consistency: 85
        },
        goalProgress: [
          { goal: 'Daily Check-ins', current: 25, target: 30, percentage: 83 },
          { goal: 'Tasks Completed', current: 180, target: 200, percentage: 90 },
          { goal: 'Points Earned', current: 3500, target: 4000, percentage: 87 },
          { goal: 'Achievements', current: 15, target: 20, percentage: 75 }
        ],
        comparisonData: {
          familyAverage: 2800,
          userRank: 3,
          totalUsers: 156,
          percentile: 92
        }
      };

      setAnalyticsData(sampleData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      showToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generatePointsOverTime = () => {
    const days = timeRanges.find(r => r.value === timeRange)?.days || 30;
    const data = [];
    let cumulative = 0;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const points = Math.floor(Math.random() * 200) + 50;
      cumulative += points;
      
      data.push({
        date: date.toISOString().split('T')[0],
        points,
        cumulative
      });
    }
    
    return data;
  };

  const generateStreakHistory = () => {
    const days = timeRanges.find(r => r.value === timeRange)?.days || 30;
    const data = [];
    let currentStreak = 0;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const isActive = Math.random() > 0.2; // 80% chance of activity
      
      if (isActive) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        streak: currentStreak,
        isActive
      });
    }
    
    return data;
  };

  const generateActivityHeatmap = () => {
    const days = timeRanges.find(r => r.value === timeRange)?.days || 30;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        taskCount: Math.floor(Math.random() * 10),
        pointsEarned: Math.floor(Math.random() * 200) + 50
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
    a.download = `gamification-analytics-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Analytics data exported successfully', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 max-w-6xl">
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

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Complete more tasks to see your analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/gamification"
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Deep insights into your gamification progress
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <button
                onClick={exportData}
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
                title="Export data"
              >
                <Download className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            {(['overview', 'trends', 'goals', 'comparison'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Avg Points/Day</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analyticsData.performanceMetrics.averagePointsPerDay}
                </div>
                <div className="text-sm text-gray-600">
                  +12% from last period
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Active Days</h3>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analyticsData.performanceMetrics.totalActiveDays}
                </div>
                <div className="text-sm text-gray-600">
                  {Math.round((analyticsData.performanceMetrics.totalActiveDays / 30) * 100)}% this month
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Best Streak</h3>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {analyticsData.performanceMetrics.longestStreak}
                </div>
                <div className="text-sm text-gray-600">
                  days in a row
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Consistency</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {analyticsData.performanceMetrics.consistency}%
                </div>
                <div className="text-sm text-gray-600">
                  Excellent rating
                </div>
              </div>
            </div>

            {/* Points Over Time Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600" />
                Points Progress
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.pointsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      formatter={(value: any, name: string) => [
                        `${value} points`, 
                        name === 'points' ? 'Daily Points' : 'Total Points'
                      ]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      name="Total Points"
                    />
                    <Area
                      type="monotone"
                      dataKey="points"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Daily Points"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Achievements by Category */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Achievements by Category
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Bars */}
                <div className="space-y-4">
                  {analyticsData.achievementsByCategory.map((category) => (
                    <div key={category.category} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium text-gray-700">
                        {category.category}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600 w-16 text-right">
                        {category.count} ({category.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.achievementsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.achievementsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={[
                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
                          ][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} achievements`, 'Count']} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Streak History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Streak Trends
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={analyticsData.streakHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      formatter={(value) => [`${value} days`, 'Streak']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="streak"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                      name="Daily Streak"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Activity Heatmap
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={analyticsData.activityHeatmap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                      formatter={(value, name) => [
                        value, 
                        name === 'taskCount' ? 'Tasks Completed' : 'Points Earned'
                      ]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="taskCount" 
                      fill="#10b981" 
                      name="Tasks"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="pointsEarned" 
                      fill="#3b82f6" 
                      name="Points"
                      radius={[2, 2, 0, 0]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Goal Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.goalProgress.map((goal) => (
                  <div key={goal.goal} className="p-4 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">{goal.goal}</h4>
                      <span className="text-sm text-gray-600">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${goal.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-sm text-gray-600 mt-2">
                      {goal.percentage}% complete
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Performance Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-gray-100 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    #{analyticsData.comparisonData.userRank}
                  </div>
                  <div className="text-sm text-gray-600">Your Rank</div>
                  <div className="text-xs text-gray-500">
                    out of {analyticsData.comparisonData.totalUsers} users
                  </div>
                </div>
                
                <div className="text-center p-4 border border-gray-100 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {analyticsData.comparisonData.percentile}%
                  </div>
                  <div className="text-sm text-gray-600">Percentile</div>
                  <div className="text-xs text-gray-500">
                    Better than {analyticsData.comparisonData.percentile}% of users
                  </div>
                </div>
                
                <div className="text-center p-4 border border-gray-100 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {analyticsData.comparisonData.familyAverage}
                  </div>
                  <div className="text-sm text-gray-600">Family Average</div>
                  <div className="text-xs text-gray-500">
                    points per month
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 