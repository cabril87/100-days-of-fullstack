'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  RefreshCw,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Bell,
  Focus,
  Pause,
  Play
} from 'lucide-react';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { apiService } from '@/lib/services/apiService';
import { calendarSignalRService } from '@/lib/services/calendarSignalRService';
import { focusCalendarIntegration } from '@/lib/services/focusCalendarIntegration';

// Analytics interfaces
interface CalendarAnalytics {
  overview: {
    totalEvents: number;
    conflictRate: number;
    averageUtilization: number;
    focusTimeHours: number;
    optimalTimeSlotsUsed: number;
    familyEfficiencyScore: number;
  };
  trends: {
    eventCount: TimeSeriesData[];
    conflictRate: TimeSeriesData[];
    utilization: TimeSeriesData[];
    focusQuality: TimeSeriesData[];
  };
  memberStats: MemberAnalytics[];
  conflicts: ConflictAnalytics;
  optimalTimes: OptimalTimeAnalytics[];
  predictions: PredictiveAnalytics;
  realTimeMetrics: RealTimeMetrics;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

interface MemberAnalytics {
  memberId: number;
  name: string;
  role: string;
  eventCount: number;
  utilizationRate: number;
  conflictCount: number;
  focusHours: number;
  efficiencyScore: number;
  bestTimes: { hour: number; efficiency: number }[];
  patterns: {
    mostActiveDay: string;
    preferredDuration: number;
    conflictProneTimes: string[];
  };
}

interface ConflictAnalytics {
  totalConflicts: number;
  resolvedConflicts: number;
  avgResolutionTime: number;
  commonConflictTypes: { type: string; count: number }[];
  conflictHotspots: { timeSlot: string; frequency: number }[];
  preventionSuggestions: string[];
}

interface OptimalTimeAnalytics {
  timeSlot: string;
  utilizationRate: number;
  averageQuality: number;
  memberAvailability: number;
  conflictProbability: number;
  recommendation: 'Excellent' | 'Good' | 'Fair' | 'Avoid';
}

interface PredictiveAnalytics {
  upcomingConflicts: {
    date: string;
    probability: number;
    affectedMembers: string[];
    suggestion: string;
  }[];
  optimalSchedulingWindows: {
    startTime: string;
    endTime: string;
    confidenceScore: number;
    availableMembers: number;
  }[];
  workloadPredictions: {
    memberId: number;
    memberName: string;
    predictedLoad: 'High' | 'Medium' | 'Low';
    recommendation: string;
  }[];
}

interface RealTimeMetrics {
  activeFocusSessions: number;
  ongoingEvents: number;
  upcomingEvents: number;
  pendingConflicts: number;
  familyQuietTimeActive: boolean;
  lastUpdated: string;
}

interface CalendarAnalyticsDashboardProps {
  familyId: number;
  refreshInterval?: number; // milliseconds
}

export default function CalendarAnalyticsDashboard({
  familyId,
  refreshInterval = 30000 // 30 seconds
}: CalendarAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<CalendarAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMember, setSelectedMember] = useState<number | 'all'>('all');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load analytics data
  const fetchAnalytics = useCallback(async () => {
    if (!familyId) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        timeRange: timeRange,
        includeRealTime: 'true',
        includePredictions: 'true'
      }).toString();
      
      const response = await apiService.get(`/v1/family/${familyId}/calendar/analytics?${params}`);
      
      // Type the response properly
      if (response && typeof response === 'object' && 'data' in response) {
        const typedResponse = response as { data: CalendarAnalytics };
        setAnalytics(typedResponse.data);
        setLastUpdated(new Date());
      }
    } catch (error: unknown) {
      console.error('Failed to fetch calendar analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [familyId, timeRange]);

  // Set up auto-refresh
  useEffect(() => {
    fetchAnalytics();
    
    if (realTimeEnabled && refreshInterval > 0) {
      const interval = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAnalytics, realTimeEnabled, refreshInterval]);

  // Set up SignalR real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const unsubscribeAnalytics = calendarSignalRService.on('onAnalyticsUpdated', (data) => {
      if (data.familyId === familyId) {
        setAnalytics(prev => prev ? { ...prev, ...data.analytics } : null);
        setLastUpdated(new Date());
      }
    });

    const unsubscribeEfficiency = calendarSignalRService.on('onEfficiencyUpdated', (data) => {
      if (analytics && analytics.memberStats) {
        setAnalytics(prev => {
          if (!prev) return null;
          
          const updatedMembers = prev.memberStats.map(member => 
            member.memberId === data.userId 
              ? { ...member, efficiencyScore: data.efficiency.score }
              : member
          );
          
          return { ...prev, memberStats: updatedMembers };
        });
      }
    });

    const unsubscribeConflicts = calendarSignalRService.on('onConflictDetected', (data) => {
      if (data.familyId === familyId) {
        setAnalytics(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            realTimeMetrics: {
              ...prev.realTimeMetrics,
              pendingConflicts: prev.realTimeMetrics.pendingConflicts + 1,
              lastUpdated: new Date().toISOString()
            }
          };
        });
      }
    });

    const unsubscribeFocus = calendarSignalRService.on('onFocusSessionStarted', (session) => {
      setAnalytics(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          realTimeMetrics: {
            ...prev.realTimeMetrics,
            activeFocusSessions: prev.realTimeMetrics.activeFocusSessions + 1,
            lastUpdated: new Date().toISOString()
          }
        };
      });
    });

    return () => {
      unsubscribeAnalytics();
      unsubscribeEfficiency();
      unsubscribeConflicts();
      unsubscribeFocus();
    };
  }, [familyId, realTimeEnabled, analytics]);

  // Export analytics data
  const exportAnalytics = useCallback(async () => {
    if (!analytics) return;

    try {
      const dataToExport = {
        generatedAt: new Date().toISOString(),
        timeRange,
        familyId,
        analytics
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `calendar-analytics-${familyId}-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [analytics, timeRange, familyId]);

  // Get trend indicator
  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <div className="h-4 w-4" />; // No change
  };

  // Get efficiency color
  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get recommendation badge
  const getRecommendationBadge = (recommendation: string) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Fair': 'bg-yellow-100 text-yellow-800',
      'Avoid': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[recommendation as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {recommendation}
      </Badge>
    );
  };

  if (!analytics && isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header and Controls */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute -top-36 -right-36 w-96 h-96 bg-purple-600 opacity-[0.03] rounded-full blur-3xl"></div>
          <div className="absolute -bottom-36 -left-36 w-96 h-96 bg-blue-600 opacity-[0.05] rounded-full blur-3xl"></div>
          
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  Calendar Analytics Dashboard
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Real-time insights into family calendar efficiency and patterns
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-4">
                {realTimeEnabled && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Live Updates
                  </div>
                )}
                
                <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'quarter') => setTimeRange(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={fetchAnalytics}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-all duration-300"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
                
                <Button
                  onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                  variant={realTimeEnabled ? "default" : "outline"}
                  size="sm"
                  className={realTimeEnabled 
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                    : "bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 transition-all duration-300"
                  }
                >
                  {realTimeEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {realTimeEnabled ? 'Pause' : 'Enable'} Live
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        {analytics && (
          <>
            {/* Real-time Metrics Bar */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-600 opacity-[0.05] rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
              
              <CardContent className="pt-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                        <Calendar className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">{analytics.realTimeMetrics.ongoingEvents}</div>
                    <div className="text-blue-100 text-sm">Active Events</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">{analytics.realTimeMetrics.upcomingEvents}</div>
                    <div className="text-orange-100 text-sm">Upcoming</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">{analytics.realTimeMetrics.pendingConflicts}</div>
                    <div className="text-red-100 text-sm">Conflicts</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                        <Bell className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">
                      {analytics.realTimeMetrics.familyQuietTimeActive ? 'Active' : 'Off'}
                    </div>
                    <div className="text-purple-100 text-sm">Quiet Time</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Last Updated</div>
                    <div className="text-sm font-medium">{format(lastUpdated, 'HH:mm:ss')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-white">
                  <div className="text-2xl font-bold mb-1">{analytics.overview.totalEvents}</div>
                  <div className="text-white/80 text-sm">Total Events</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-white">
                  <div className="text-2xl font-bold mb-1">{Math.round(analytics.overview.conflictRate)}%</div>
                  <div className="text-white/80 text-sm">Conflict Rate</div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-white/20 group-hover:bg-white/30 transition-all">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-white">
                  <div className={`text-2xl font-bold mb-1`}>
                    {Math.round(analytics.overview.familyEfficiencyScore)}%
                  </div>
                  <div className="text-white/80 text-sm">Family Efficiency</div>
                </div>
              </div>
            </div>

            {/* Detailed Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {/* Utilization and Focus Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Calendar Utilization</CardTitle>
                      <CardDescription>Average family calendar usage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Utilization Rate</span>
                          <span>{Math.round(analytics.overview.averageUtilization)}%</span>
                        </div>
                        <Progress value={analytics.overview.averageUtilization} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Focus Time</CardTitle>
                      <CardDescription>Total family focus hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.round(analytics.overview.focusTimeHours)}h
                        </div>
                        <p className="text-sm text-gray-500 mt-1">This {timeRange}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Optimal Time Slots */}
                <Card>
                  <CardHeader>
                    <CardTitle>Optimal Time Analysis</CardTitle>
                    <CardDescription>Best time slots for family scheduling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.optimalTimes.slice(0, 5).map((slot, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{slot.timeSlot}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600">
                              {Math.round(slot.utilizationRate)}% utilized
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Quality: {Math.round(slot.averageQuality)}%
                            </div>
                            
                            {getRecommendationBadge(slot.recommendation)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="members" className="space-y-4">
                <div className="grid gap-4">
                  {analytics.memberStats.map((member) => (
                    <Card key={member.memberId}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{member.name}</CardTitle>
                            <CardDescription>{member.role}</CardDescription>
                          </div>
                          <Badge variant="outline">
                            Efficiency: {Math.round(member.efficiencyScore)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Events</p>
                            <p className="text-xl font-semibold">{member.eventCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Utilization</p>
                            <p className="text-xl font-semibold">{Math.round(member.utilizationRate)}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Conflicts</p>
                            <p className="text-xl font-semibold text-red-600">{member.conflictCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Focus Hours</p>
                            <p className="text-xl font-semibold text-blue-600">{Math.round(member.focusHours)}h</p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Patterns</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                            <div>Most active: <span className="font-medium">{member.patterns.mostActiveDay}</span></div>
                            <div>Preferred duration: <span className="font-medium">{member.patterns.preferredDuration}min</span></div>
                            <div>Conflict-prone times: <span className="font-medium">{member.patterns.conflictProneTimes.join(', ')}</span></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="conflicts" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conflict Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Conflicts</span>
                        <span className="font-semibold">{analytics.conflicts.totalConflicts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolved</span>
                        <span className="font-semibold text-green-600">{analytics.conflicts.resolvedConflicts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Resolution Time</span>
                        <span className="font-semibold">{Math.round(analytics.conflicts.avgResolutionTime)}min</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Common Conflict Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.conflicts.commonConflictTypes.map((type, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm">{type.type}</span>
                            <Badge variant="outline">{type.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Prevention Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Prevention Suggestions</CardTitle>
                    <CardDescription>AI-generated recommendations to reduce conflicts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.conflicts.preventionSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="predictions" className="space-y-4">
                {/* Upcoming Conflicts Prediction */}
                <Card>
                  <CardHeader>
                    <CardTitle>Predicted Conflicts</CardTitle>
                    <CardDescription>AI predictions for potential scheduling conflicts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.predictions.upcomingConflicts.map((prediction, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{format(new Date(prediction.date), 'MMM dd, yyyy')}</span>
                            <Badge variant={prediction.probability > 0.7 ? 'destructive' : prediction.probability > 0.4 ? 'default' : 'secondary'}>
                              {Math.round(prediction.probability * 100)}% chance
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Affected: {prediction.affectedMembers.join(', ')}
                          </p>
                          <p className="text-sm font-medium text-blue-600">{prediction.suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Optimal Scheduling Windows */}
                <Card>
                  <CardHeader>
                    <CardTitle>Optimal Scheduling Windows</CardTitle>
                    <CardDescription>Best times for upcoming scheduling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.predictions.optimalSchedulingWindows.map((window, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium">
                              {format(new Date(window.startTime), 'MMM dd, h:mm a')} - 
                              {format(new Date(window.endTime), 'h:mm a')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {window.availableMembers} members available
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-green-600">
                              {Math.round(window.confidenceScore)}%
                            </div>
                            <div className="text-xs text-gray-500">Confidence</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Workload Predictions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Workload Predictions</CardTitle>
                    <CardDescription>Predicted schedule load for family members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.predictions.workloadPredictions.map((prediction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <div className="font-medium">{prediction.memberName}</div>
                            <div className="text-sm text-gray-600">{prediction.recommendation}</div>
                          </div>
                          <Badge variant={
                            prediction.predictedLoad === 'High' ? 'destructive' :
                            prediction.predictedLoad === 'Medium' ? 'default' : 'secondary'
                          }>
                            {prediction.predictedLoad} Load
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
} 