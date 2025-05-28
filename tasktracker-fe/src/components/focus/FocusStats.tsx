'use client';

import { useState, useEffect } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Clock, Target, TrendingUp, BarChart3, Timer, Brain, Zap } from 'lucide-react';
import { FocusStatistics } from '@/lib/types/focus';

export function FocusStats() {
  const { fetchStatistics, isLoading, statistics: contextStatistics } = useFocus();
  const [statistics, setStatistics] = useState<FocusStatistics | null>(contextStatistics);

  // Load statistics from API - NO FALLBACKS
  useEffect(() => {
    let mounted = true;
    
    const loadStatistics = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        
        console.log('[FocusStats] Fetching API statistics...');
        const stats = await fetchStatistics(startDate, endDate);
        
        if (mounted) {
          if (stats) {
            console.log('[FocusStats] API returned:', stats);
            setStatistics(stats);
          } else {
            console.log('[FocusStats] API returned no data');
            setStatistics(null);
          }
        }
      } catch (error) {
        console.error('Error loading statistics:', error);
        if (mounted) {
          setStatistics(null);
        }
      }
    };

    // Only fetch if we don't have context statistics
    if (contextStatistics) {
      setStatistics(contextStatistics);
    } else {
      loadStatistics();
    }
    
    return () => {
      mounted = false;
    };
  }, [fetchStatistics]);

  // Update when context statistics change
  useEffect(() => {
    if (contextStatistics) {
      setStatistics(contextStatistics);
    }
  }, [contextStatistics]);

  // Process ONLY real API data for charts - NO MOCK DATA
  const processChartData = () => {
    if (!statistics) {
      return { daily: [], distractions: [] };
    }

    // Daily focus data - ONLY from API
    const daily = statistics.dailyFocusMinutes && Object.keys(statistics.dailyFocusMinutes).length > 0
      ? Object.entries(statistics.dailyFocusMinutes).map(([date, minutes]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          minutes: minutes
        }))
      : [];

    // Distraction data - ONLY from API
    const distractions = statistics.distractionsByCategory && Object.keys(statistics.distractionsByCategory).length > 0
      ? Object.entries(statistics.distractionsByCategory).map(([category, count]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          count: count,
          percentage: statistics.distractionCount > 0 
            ? Math.round((count / statistics.distractionCount) * 100) 
            : 0
        }))
      : [];

    return { daily, distractions };
  };

  const chartData = processChartData();

  if (isLoading) {
    return (
      <div className="min-h-[400px] bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
        
        <div className="flex justify-center items-center p-8 relative z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading API data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Minutes Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
              <Timer className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{statistics?.totalMinutesFocused || 0}</div>
              <div className="text-white/80 text-sm font-medium">Total Minutes</div>
            </div>
          </div>
        </div>

        {/* Sessions Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
              <Target className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{statistics?.sessionCount || 0}</div>
              <div className="text-white/80 text-sm font-medium">Sessions</div>
            </div>
          </div>
        </div>

        {/* Average Length Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{statistics ? Math.round(statistics.averageSessionLength) : 0}m</div>
              <div className="text-white/80 text-sm font-medium">Avg Length</div>
            </div>
          </div>
        </div>

        {/* Distractions Card */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="p-3 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
              <Zap className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">{statistics?.distractionCount || 0}</div>
              <div className="text-white/80 text-sm font-medium">Distractions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <TabsList className="p-2 bg-transparent w-full">
            <TabsTrigger 
              value="overview" 
              className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Daily Trends
            </TabsTrigger>
            <TabsTrigger 
              value="distractions" 
              className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
            >
              <Zap className="h-4 w-4 mr-2" />
              Distractions
            </TabsTrigger>
            <TabsTrigger 
              value="raw" 
              className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 hover:scale-105"
            >
              <Brain className="h-4 w-4 mr-2" />
              Raw API Data
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Daily Focus Time (API Data)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.daily.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.daily}>
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
                        stroke="url(#blueGradient)" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No focus data available</p>
                      <p className="text-sm">Start some focus sessions to see your progress!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="distractions">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-xl"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600 opacity-[0.05] rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-600 opacity-[0.05] rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Distraction Analysis (API Data)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.distractions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.distractions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="category" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="url(#redGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No distraction data available</p>
                      <p className="text-sm">Great job staying focused!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="raw">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-t-xl"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-600 opacity-[0.05] rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                    Raw API Response
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statistics ? (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                    <pre className="text-sm text-gray-800 overflow-auto max-h-96 font-mono">
                      {JSON.stringify(statistics, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No API data available</p>
                      <p className="text-sm">Start using focus mode to generate statistics!</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}