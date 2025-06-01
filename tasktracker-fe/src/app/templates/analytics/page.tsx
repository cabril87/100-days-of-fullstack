'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/lib/providers/TemplateProvider';
import { useGamification } from '@/lib/providers/GamificationProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  Users,
  Download,
  Eye,
  Filter,
  Calendar,
  Target,
  Award,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface TemplateAnalytics {
  id: number;
  name: string;
  category: string;
  usageCount: number;
  successRate: number;
  averageCompletionTime: number;
  rating: number;
  downloads: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  lastUsed: string;
  createdAt: string;
}

export default function TemplateAnalyticsPage() {
  const router = useRouter();
  const { userProgress } = useGamification();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'usage' | 'success' | 'rating' | 'recent'>('usage');
  const [isLoading, setIsLoading] = useState(false);

  // Mock analytics data
  const [analyticsData, setAnalyticsData] = useState<TemplateAnalytics[]>([
    {
      id: 1,
      name: "Morning Productivity Routine",
      category: "Productivity",
      usageCount: 156,
      successRate: 92,
      averageCompletionTime: 25,
      rating: 4.8,
      downloads: 2547,
      trend: 'up',
      trendPercentage: 15,
      lastUsed: "2024-01-15",
      createdAt: "2023-12-01"
    },
    {
      id: 2,
      name: "Weekly Planning Template",
      category: "Planning",
      usageCount: 89,
      successRate: 87,
      averageCompletionTime: 45,
      rating: 4.6,
      downloads: 1823,
      trend: 'up',
      trendPercentage: 8,
      lastUsed: "2024-01-14",
      createdAt: "2023-11-15"
    },
    {
      id: 3,
      name: "Daily Exercise Routine",
      category: "Health",
      usageCount: 67,
      successRate: 78,
      averageCompletionTime: 35,
      rating: 4.3,
      downloads: 1456,
      trend: 'down',
      trendPercentage: 5,
      lastUsed: "2024-01-13",
      createdAt: "2023-10-20"
    }
  ]);

  const overviewStats = {
    totalTemplates: 12,
    totalUsage: 892,
    averageSuccessRate: 87,
    totalTimesSaved: 24.5,
    topPerformingTemplate: "Morning Productivity Routine",
    mostUsedCategory: "Productivity"
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === 'up') {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else if (trend === 'down') {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    }
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const filteredAndSortedData = analyticsData
    .filter(item => selectedCategory === 'all' || item.category.toLowerCase() === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'success':
          return b.successRate - a.successRate;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/templates">
              <Button variant="ghost" className="gap-2 -ml-4 hover:bg-white/50">
                <ArrowLeft className="h-4 w-4" />
                Back to Templates
              </Button>
            </Link>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Template Analytics
              </h1>
              <p className="text-gray-600 mt-1">Track performance and optimize your templates</p>
            </div>
          </div>
          
          <Button 
            onClick={refreshData}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.totalTemplates}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.totalUsage.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.averageSuccessRate}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.totalTimesSaved}h</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="productivity">Productivity</option>
                <option value="planning">Planning</option>
                <option value="health">Health</option>
                <option value="work">Work</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="usage">Most Used</option>
                <option value="success">Highest Success Rate</option>
                <option value="rating">Highest Rated</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Analytics Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Template Performance</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map((template) => (
                  <motion.tr
                    key={template.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{template.usageCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={cn(
                          "flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          template.successRate >= 90 ? "bg-green-100 text-green-800" :
                          template.successRate >= 80 ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        )}>
                          {template.successRate >= 90 ? <CheckCircle2 className="h-3 w-3 mr-1" /> :
                           template.successRate >= 80 ? <AlertCircle className="h-3 w-3 mr-1" /> :
                           <Info className="h-3 w-3 mr-1" />}
                          {template.successRate}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{template.averageCompletionTime}m</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{template.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={cn("flex items-center", getTrendColor(template.trend))}>
                        {getTrendIcon(template.trend, template.trendPercentage)}
                        <span className="text-sm ml-1">{template.trendPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.lastUsed).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              Top Performers
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">Most Used</span>
                <span className="text-sm text-green-700">{overviewStats.topPerformingTemplate}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Best Category</span>
                <span className="text-sm text-blue-700">{overviewStats.mostUsedCategory}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/templates/builder')}
              >
                Create New Template
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/templates/automation')}
              >
                Setup Automation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 