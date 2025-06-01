'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Activity, Calendar } from 'lucide-react';

export interface ProductivityDataPoint {
  date: string;
  tasksCompleted: number;
  timeSpent: number;
  efficiency: number;
  focusTime: number;
  breaks: number;
  productivity: number;
  week?: string;
  month?: string;
  day?: string;
}

interface ProductivityChartProps {
  data: ProductivityDataPoint[];
  isLoading: boolean;
  theme?: 'light' | 'dark';
  height?: number;
  chartType?: 'line' | 'area' | 'bar' | 'composed';
  showComparison?: boolean;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

const CHART_COLORS = {
  light: {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    background: '#FFFFFF',
    text: '#374151',
    grid: '#E5E7EB'
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#34D399',
    tertiary: '#FBBF24',
    quaternary: '#F87171',
    background: 'transparent',
    text: '#F3F4F6',
    grid: '#374151'
  }
};

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  data,
  isLoading,
  theme = 'light',
  height = 400,
  chartType = 'composed',
  showComparison = true,
  timeRange = 'week'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'time' | 'efficiency'>('overview');
  const colors = CHART_COLORS[theme];

  // Process and aggregate data based on time range
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Add trend calculations
    return sortedData.map((item, index) => {
      const prevItem = index > 0 ? sortedData[index - 1] : null;
      return {
        ...item,
        productivityTrend: prevItem ? item.productivity - prevItem.productivity : 0,
        efficiencyTrend: prevItem ? item.efficiency - prevItem.efficiency : 0,
        tasksTrend: prevItem ? item.tasksCompleted - prevItem.tasksCompleted : 0
      };
    });
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!processedData.length) return null;

    const totalTasks = processedData.reduce((sum, item) => sum + item.tasksCompleted, 0);
    const totalTime = processedData.reduce((sum, item) => sum + item.timeSpent, 0);
    const avgProductivity = processedData.reduce((sum, item) => sum + item.productivity, 0) / processedData.length;
    const avgEfficiency = processedData.reduce((sum, item) => sum + item.efficiency, 0) / processedData.length;
    
    const bestDay = processedData.reduce((best, current) => 
      current.productivity > best.productivity ? current : best
    );
    
    const worstDay = processedData.reduce((worst, current) => 
      current.productivity < worst.productivity ? current : worst
    );

    return {
      totalTasks,
      totalTime,
      avgProductivity: Math.round(avgProductivity),
      avgEfficiency: Math.round(avgEfficiency),
      bestDay,
      worstDay,
      improvement: processedData.length > 1 ? 
        processedData[processedData.length - 1].productivity - processedData[0].productivity : 0
    };
  }, [processedData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-4 rounded-lg border shadow-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {entry.name.includes('Time') && ' hrs'}
              {entry.name.includes('Tasks') && ' tasks'}
              {(entry.name.includes('Efficiency') || entry.name.includes('Productivity')) && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-500'}>
            Loading productivity analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <Activity className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-white/30' : 'text-gray-300'}`} />
          <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-500'}>
            No productivity data available
          </p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}>
            Complete some tasks to see your productivity trends
          </p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <ComposedChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="date" 
                stroke={colors.text}
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke={colors.text} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="tasksCompleted" fill={colors.primary} name="Tasks Completed" />
              <Line type="monotone" dataKey="productivity" stroke={colors.secondary} name="Productivity %" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'time':
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <AreaChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="date" 
                stroke={colors.text}
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke={colors.text} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="timeSpent" 
                stackId="1" 
                stroke={colors.primary} 
                fill={colors.primary}
                fillOpacity={0.6}
                name="Work Time (hrs)"
              />
              <Area 
                type="monotone" 
                dataKey="focusTime" 
                stackId="1" 
                stroke={colors.secondary} 
                fill={colors.secondary}
                fillOpacity={0.6}
                name="Focus Time (hrs)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'efficiency':
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="date" 
                stroke={colors.text}
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke={colors.text} fontSize={12} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke={colors.primary} 
                strokeWidth={3}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Efficiency %"
              />
              <Line 
                type="monotone" 
                dataKey="productivity" 
                stroke={colors.tertiary} 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Productivity %"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default: // overview
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <ComposedChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="date" 
                stroke={colors.text}
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis yAxisId="left" stroke={colors.text} fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke={colors.text} fontSize={12} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="tasksCompleted" fill={colors.primary} name="Tasks" />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="productivity" 
                stroke={colors.secondary} 
                strokeWidth={3}
                name="Productivity %"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="efficiency" 
                stroke={colors.tertiary} 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Efficiency %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Calendar className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>Total Tasks</span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalTasks}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Activity className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>Avg Productivity</span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stats.avgProductivity}%
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <TrendingUp className={`h-4 w-4 ${stats.improvement >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>Improvement</span>
            </div>
            <div className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.improvement > 0 ? '+' : ''}{stats.improvement.toFixed(1)}%
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <BarChart3 className={`h-4 w-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>Efficiency</span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stats.avgEfficiency}%
            </div>
          </div>
        </div>
      )}

      {/* Chart Navigation */}
      <div className="flex space-x-1 mb-4">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'tasks', label: 'Tasks', icon: Calendar },
          { key: 'time', label: 'Time', icon: Activity },
          { key: 'efficiency', label: 'Efficiency', icon: TrendingUp }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? theme === 'dark'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                : theme === 'dark'
                ? 'text-white/70 hover:bg-white/10 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className={`rounded-lg p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        {renderChart()}
      </div>

      {/* Insights */}
      {stats && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            📊 Key Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>
              <p>• Best performance: {new Date(stats.bestDay.date).toLocaleDateString()} ({stats.bestDay.productivity}%)</p>
              <p>• Total time tracked: {stats.totalTime.toFixed(1)} hours</p>
            </div>
            <div className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>
              <p>• {stats.improvement >= 0 ? 'Improving' : 'Declining'} trend: {Math.abs(stats.improvement).toFixed(1)}%</p>
              <p>• Average daily tasks: {(stats.totalTasks / processedData.length).toFixed(1)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 