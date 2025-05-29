'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Spinner } from '@/components/ui/spinner';
import { Clock, Target, AlertTriangle, Calendar, BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';
import { FocusStatistics } from '@/lib/types/focus';

interface AnalyticsRange {
  label: string;
  days: number;
}

const analyticsRanges: AnalyticsRange[] = [
  { label: '7 Days', days: 7 },
  { label: '30 Days', days: 30 },
  { label: '90 Days', days: 90 },
  { label: '365 Days', days: 365 }
];

const CHART_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'];

export function FocusAnalytics() {
  const { fetchStatistics, isLoading: contextLoading } = useFocus();
  const [statistics, setStatistics] = useState<FocusStatistics | null>(null);
  const [selectedRange, setSelectedRange] = useState<AnalyticsRange>(analyticsRanges[1]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const loadStatistics = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - selectedRange.days);

      const stats = await fetchStatistics(startDate, endDate);

      if (isMountedRef.current) {
        setStatistics(stats);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      if (isMountedRef.current) {
        setError('Failed to load analytics data');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [selectedRange.days, fetchStatistics]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const processTimeDistributionData = () => {
    if (!statistics?.dailyFocusMinutes) return [];
    
    return Object.entries(statistics.dailyFocusMinutes)
          .map(([date, minutes]) => ({
        date: new Date(date).toLocaleDateString(),
        minutes,
            hours: Math.round((minutes / 60) * 10) / 10
          }))
      .slice(-30); // Last 30 days
  };

  const processSessionLengthData = () => {
    if (!statistics?.dailyFocusMinutes) return [];
    
    // Process session lengths from existing data
    return Object.entries(statistics.dailyFocusMinutes)
      .map(([date, minutes]) => ({
        date: new Date(date).toLocaleDateString(),
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10
      }))
      .slice(-30); // Last 30 days
  };

  const processDistractionData = () => {
    if (!statistics?.distractionsByCategory) return [];

    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return Object.entries(statistics.distractionsByCategory)
      .map(([category, count], index) => ({
        name: category,
        value: count as number,
        color: colors[index % colors.length]
      }));
  };

  if (isLoading && !statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-4 space-y-6">
          {/* Loading Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl animate-pulse"></div>
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Loading Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-xl animate-pulse"></div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600 opacity-[0.03] rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-600 opacity-[0.05] rounded-full blur-2xl"></div>
          
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl"></div>
          
          <div className="relative z-10 p-6">
      <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <BarChart3 className="h-6 w-6" />
                </div>
        <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Focus Analytics
                  </h2>
                  <p className="text-gray-600">Detailed charts and performance metrics</p>
                </div>
        </div>
        
        <Select 
          value={selectedRange.days.toString()} 
                onValueChange={(value) => setSelectedRange(analyticsRanges.find(r => r.days === parseInt(value)) || analyticsRanges[1])}
        >
                <SelectTrigger className="w-40 border-blue-200 text-blue-600 hover:bg-blue-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
                  {analyticsRanges.map((range) => (
              <SelectItem key={range.days} value={range.days.toString()}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
                      </div>
              </div>

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={loadStatistics}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Main Analytics Content */}
        {statistics && !error && (
          <Tabs defaultValue="overview" className="space-y-6">
            {/* Enhanced Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-600 opacity-[0.02] rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-indigo-600 opacity-[0.03] rounded-full blur-xl"></div>

              <div className="relative z-10 p-2">
                <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent">
                  <TabsTrigger 
                    value="overview"
                    className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                  >
                    <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Overview</div>
                      <div className="text-xs opacity-80">Key metrics</div>
                    </div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="trends"
                    className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                  >
                    <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Trends</div>
                      <div className="text-xs opacity-80">Time series</div>
                    </div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="sessions"
                    className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                  >
                    <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Sessions</div>
                      <div className="text-xs opacity-80">Length analysis</div>
                    </div>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="distractions"
                    className="group relative rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:scale-[1.02] data-[state=active]:border-0 flex items-center gap-2 p-3"
                  >
                    <div className="p-1.5 rounded-lg bg-white/20 group-data-[state=active]:bg-white/30 transition-all">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Focus</div>
                      <div className="text-xs opacity-80">Distractions</div>
              </div>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* Tab Content with real charts and analytics */}
            <TabsContent value="overview" className="space-y-6">
              {/* Overview Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Focus Time */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-gray-700">Total Focus Time</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {statistics.totalMinutesFocused ? `${Math.floor(statistics.totalMinutesFocused / 60)}h ${statistics.totalMinutesFocused % 60}m` : '0h 0m'}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Last {selectedRange.days} days</p>
                  </div>
                </div>

                {/* Sessions Completed */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <Target className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-gray-700">Sessions Completed</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {statistics.sessionCount || 0}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Focus sessions</p>
                  </div>
                </div>

                {/* Average Session */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <Activity className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-gray-700">Average Session</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {statistics.averageSessionLength ? `${Math.round(statistics.averageSessionLength)}m` : '0m'}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Session duration</p>
                  </div>
                </div>
              </div>

              {/* Daily Focus Distribution Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Daily Focus Distribution
                  </h3>
                  {processTimeDistributionData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={processTimeDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No data available</p>
                        <p className="text-sm">Complete focus sessions to see your daily distribution</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {/* Focus Trends Over Time */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-xl"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Focus Time Trends
                  </h3>
                  {processTimeDistributionData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={processTimeDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="minutes" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No trend data available</p>
                        <p className="text-sm">Complete more focus sessions to see trends over time</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Session Count</h4>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {statistics.sessionCount || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total sessions completed</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Distraction Rate</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {statistics.sessionCount > 0 ? (statistics.distractionCount / statistics.sessionCount).toFixed(1) : '0'}
                  </div>
                  <p className="text-sm text-gray-600">Distractions per session</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              {/* Session Length Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-t-xl"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Session Length Analysis
                  </h3>
                  {processSessionLengthData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={processSessionLengthData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Bar dataKey="minutes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No session data available</p>
                        <p className="text-sm">Complete focus sessions to analyze session lengths</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Total Sessions</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {statistics.sessionCount || 0}
                  </div>
                  <p className="text-sm text-gray-600">Sessions completed</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Total Distractions</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {statistics.distractionCount || 0}
                  </div>
                  <p className="text-sm text-gray-600">Recorded distractions</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="distractions" className="space-y-6">
              {/* Distraction Analysis */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-t-xl"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                    Distraction Breakdown
                  </h3>
                  {processDistractionData().length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Pie Chart */}
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={processDistractionData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {processDistractionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Legend */}
                      <div className="space-y-3">
                        {processDistractionData().map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span className="font-medium text-gray-800">{item.name}</span>
                            </div>
                            <span className="text-lg font-bold text-gray-600">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No distraction data available</p>
                        <p className="text-sm">Great job! No distractions recorded during your focus sessions</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Distraction Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Total Distractions</h4>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {statistics.distractionCount || 0}
                  </div>
                  <p className="text-sm text-gray-600">All time distractions</p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Average Length</h4>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {statistics.averageSessionLength ? `${Math.round(statistics.averageSessionLength)}m` : '0m'}
                  </div>
                  <p className="text-sm text-gray-600">Session duration</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
} 