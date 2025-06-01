'use client';

import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { Clock, Calendar, Sun, Moon, Coffee, Zap, BarChart3, Timer } from 'lucide-react';

export interface TimeDistributionData {
  period: string;
  hours: number;
  tasks: number;
  category?: string;
  productivity?: number;
  focus?: number;
  breaks?: number;
  efficiency?: number;
  date?: string;
  dayOfWeek?: string;
  hourOfDay?: number;
}

interface TimeDistributionChartProps {
  data: TimeDistributionData[];
  isLoading: boolean;
  theme?: 'light' | 'dark';
  height?: number;
  viewType?: 'hourly' | 'daily' | 'weekly' | 'category';
  showProductivity?: boolean;
}

const CHART_COLORS = {
  light: {
    primary: '#3B82F6',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    quaternary: '#EF4444',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    text: '#374151',
    grid: '#E5E7EB'
  },
  dark: {
    primary: '#60A5FA',
    secondary: '#34D399',
    tertiary: '#FBBF24',
    quaternary: '#F87171',
    accent: '#A78BFA',
    background: 'transparent',
    text: '#F3F4F6',
    grid: '#374151'
  }
};

const TIME_PERIODS = {
  morning: { label: 'Morning', icon: Sun, color: '#F59E0B', range: '6AM-12PM' },
  afternoon: { label: 'Afternoon', icon: Sun, color: '#10B981', range: '12PM-6PM' },
  evening: { label: 'Evening', icon: Moon, color: '#8B5CF6', range: '6PM-10PM' },
  night: { label: 'Night', icon: Moon, color: '#3B82F6', range: '10PM-6AM' }
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({
  data,
  isLoading,
  theme = 'light',
  height = 400,
  viewType = 'hourly',
  showProductivity = true
}) => {
  const [activeView, setActiveView] = useState<'distribution' | 'patterns' | 'heatmap' | 'breakdown'>('distribution');
  const colors = CHART_COLORS[theme];

  // Process data based on view type
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    switch (viewType) {
      case 'hourly':
        // Group by hour of day
        const hourlyData = Array.from({ length: 24 }, (_, hour) => {
          const hourData = data.filter(d => d.hourOfDay === hour);
          const totalHours = hourData.reduce((sum, d) => sum + d.hours, 0);
          const totalTasks = hourData.reduce((sum, d) => sum + d.tasks, 0);
          const avgProductivity = hourData.length > 0 
            ? hourData.reduce((sum, d) => sum + (d.productivity || 0), 0) / hourData.length 
            : 0;

          return {
            period: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour < 12 ? 'AM' : 'PM'}`,
            hours: totalHours,
            tasks: totalTasks,
            productivity: Math.round(avgProductivity),
            hourOfDay: hour
          };
        });
        return hourlyData;

      case 'daily':
        // Group by day of week
        return DAYS_OF_WEEK.map(day => {
          const dayData = data.filter(d => d.dayOfWeek === day);
          const totalHours = dayData.reduce((sum, d) => sum + d.hours, 0);
          const totalTasks = dayData.reduce((sum, d) => sum + d.tasks, 0);
          const avgProductivity = dayData.length > 0 
            ? dayData.reduce((sum, d) => sum + (d.productivity || 0), 0) / dayData.length 
            : 0;

          return {
            period: day.substring(0, 3),
            hours: totalHours,
            tasks: totalTasks,
            productivity: Math.round(avgProductivity),
            dayOfWeek: day
          };
        });

      case 'category':
        // Group by category if available
        const categoryMap = new Map();
        data.forEach(d => {
          const category = d.category || 'General';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, { hours: 0, tasks: 0, productivity: [] });
          }
          const existing = categoryMap.get(category);
          existing.hours += d.hours;
          existing.tasks += d.tasks;
          if (d.productivity) existing.productivity.push(d.productivity);
        });

        return Array.from(categoryMap.entries()).map(([category, stats]) => ({
          period: category,
          hours: stats.hours,
          tasks: stats.tasks,
          productivity: stats.productivity.length > 0 
            ? Math.round(stats.productivity.reduce((a: number, b: number) => a + b, 0) / stats.productivity.length)
            : 0,
          category
        }));

      default:
        return data;
    }
  }, [data, viewType]);

  // Calculate time period distribution
  const timeDistribution = useMemo(() => {
    const distribution = Object.keys(TIME_PERIODS).map(period => {
      const periodData = data.filter(d => {
        const hour = d.hourOfDay || 0;
        switch (period) {
          case 'morning': return hour >= 6 && hour < 12;
          case 'afternoon': return hour >= 12 && hour < 18;
          case 'evening': return hour >= 18 && hour < 22;
          case 'night': return hour >= 22 || hour < 6;
          default: return false;
        }
      });

      const totalHours = periodData.reduce((sum, d) => sum + d.hours, 0);
      const totalTasks = periodData.reduce((sum, d) => sum + d.tasks, 0);

      return {
        name: TIME_PERIODS[period as keyof typeof TIME_PERIODS].label,
        value: totalHours,
        tasks: totalTasks,
        color: TIME_PERIODS[period as keyof typeof TIME_PERIODS].color,
        range: TIME_PERIODS[period as keyof typeof TIME_PERIODS].range
      };
    });

    return distribution.filter(d => d.value > 0);
  }, [data]);

  // Calculate peak performance metrics
  const performanceMetrics = useMemo(() => {
    if (!processedData.length) return null;

    const peakHour = processedData.reduce((peak, current) => 
      (current.productivity || 0) > (peak.productivity || 0) ? current : peak
    );

    const mostActiveHour = processedData.reduce((peak, current) => 
      current.tasks > peak.tasks ? current : peak
    );

    const totalHours = processedData.reduce((sum, d) => sum + d.hours, 0);
    const totalTasks = processedData.reduce((sum, d) => sum + d.tasks, 0);
    const avgProductivity = processedData.reduce((sum, d) => sum + (d.productivity || 0), 0) / processedData.length;

    return {
      peakHour,
      mostActiveHour,
      totalHours,
      totalTasks,
      avgProductivity: Math.round(avgProductivity),
      tasksPerHour: totalHours > 0 ? (totalTasks / totalHours).toFixed(1) : '0'
    };
  }, [processedData]);

  // Custom tooltip
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
              {entry.name}: {entry.value}
              {entry.name.includes('Hours') && 'h'}
              {entry.name.includes('Tasks') && ' tasks'}
              {entry.name.includes('Productivity') && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Pie chart label
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}h`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-500'}>
            Loading time analysis...
          </p>
        </div>
      </div>
    );
  }

  if (!processedData.length) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <Clock className={`h-16 w-16 mx-auto mb-4 ${theme === 'dark' ? 'text-white/30' : 'text-gray-300'}`} />
          <p className={theme === 'dark' ? 'text-white/70' : 'text-gray-500'}>
            No time data available
          </p>
          <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/50' : 'text-gray-400'}`}>
            Track your time to see distribution patterns
          </p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (activeView) {
      case 'distribution':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Time Distribution by Period
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div>
              <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {viewType === 'hourly' ? 'Hourly Activity' : viewType === 'daily' ? 'Daily Activity' : 'Category Breakdown'}
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData.slice(0, 12)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis 
                    dataKey="period" 
                    stroke={colors.text}
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke={colors.text} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="hours" fill={colors.primary} name="Hours" />
                  <Bar dataKey="tasks" fill={colors.secondary} name="Tasks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'patterns':
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <ComposedChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
              <XAxis 
                dataKey="period" 
                stroke={colors.text}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis yAxisId="left" stroke={colors.text} fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke={colors.text} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="hours" 
                fill={colors.primary}
                fillOpacity={0.6}
                stroke={colors.primary}
                name="Hours"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="productivity" 
                stroke={colors.tertiary} 
                strokeWidth={3}
                name="Productivity %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'heatmap':
        return (
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-center">
                <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {day.substring(0, 3)}
                </div>
                {Array.from({ length: 24 }, (_, hour) => {
                  const hourData = data.find(d => d.dayOfWeek === day && d.hourOfDay === hour);
                  const intensity = hourData ? Math.min(hourData.hours / 2, 1) : 0;
                  return (
                    <div
                      key={hour}
                      className={`w-4 h-4 mb-1 rounded ${
                        intensity > 0 
                          ? theme === 'dark' 
                            ? 'bg-blue-400' 
                            : 'bg-blue-500'
                          : theme === 'dark'
                          ? 'bg-gray-700'
                          : 'bg-gray-200'
                      }`}
                      style={{ opacity: intensity || 0.1 }}
                      title={`${day} ${hour}:00 - ${hourData?.hours || 0}h`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        );

      case 'breakdown':
        return (
          <ResponsiveContainer width="100%" height={height - 100}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={timeDistribution}>
              <RadialBar
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                dataKey="value"
              />
              <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      {performanceMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Timer className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>Total Hours</span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {performanceMetrics.totalHours.toFixed(1)}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <BarChart3 className={`h-4 w-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>Total Tasks</span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {performanceMetrics.totalTasks}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Zap className={`h-4 w-4 ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>Peak Time</span>
            </div>
            <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {performanceMetrics.peakHour.period}
            </div>
          </div>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2">
              <Coffee className={`h-4 w-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'}`} />
              <span className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-gray-600'}`}>Tasks/Hour</span>
            </div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {performanceMetrics.tasksPerHour}
            </div>
          </div>
        </div>
      )}

      {/* View Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'distribution', label: 'Distribution', icon: Clock },
          { key: 'patterns', label: 'Patterns', icon: BarChart3 },
          { key: 'heatmap', label: 'Heatmap', icon: Calendar },
          { key: 'breakdown', label: 'Breakdown', icon: Zap }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === key
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
      <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
        {renderChart()}
      </div>

      {/* Time Insights */}
      {performanceMetrics && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
          <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            ⏰ Time Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>
              <p>• Most productive time: {performanceMetrics.peakHour.period} ({performanceMetrics.peakHour.productivity}% efficiency)</p>
              <p>• Busiest period: {performanceMetrics.mostActiveHour.period} ({performanceMetrics.mostActiveHour.tasks} tasks)</p>
            </div>
            <div className={theme === 'dark' ? 'text-white/70' : 'text-gray-600'}>
              <p>• Average productivity: {performanceMetrics.avgProductivity}%</p>
              <p>• Task completion rate: {performanceMetrics.tasksPerHour} tasks per hour</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 