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
  Focus
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
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Calendar Analytics Dashboard
              </CardTitle>
              <CardDescription>
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
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={exportAnalytics}
                disabled={!analytics}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {error && (
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {analytics && (
        <>
          {/* Real-time Metrics Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="flex items-center gap-2">
                  <Focus className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-lg font-semibold">{analytics.realTimeMetrics.activeFocusSessions}</div>
                    <div className="text-xs text-gray-500">Active Focus</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-lg font-semibold">{analytics.realTimeMetrics.ongoingEvents}</div>
                    <div className="text-xs text-gray-500">Ongoing</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-lg font-semibold">{analytics.realTimeMetrics.upcomingEvents}</div>
                    <div className="text-xs text-gray-500">Upcoming</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <div className="text-lg font-semibold">{analytics.realTimeMetrics.pendingConflicts}</div>
                    <div className="text-xs text-gray-500">Conflicts</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="text-lg font-semibold">
                      {analytics.realTimeMetrics.familyQuietTimeActive ? 'Active' : 'Off'}
                    </div>
                    <div className="text-xs text-gray-500">Quiet Time</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-500">Last Updated</div>
                  <div className="text-sm font-medium">{format(lastUpdated, 'HH:mm:ss')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Events</p>
                    <p className="text-2xl font-bold">{analytics.overview.totalEvents}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Conflict Rate</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.overview.conflictRate)}%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Family Efficiency</p>
                    <p className={`text-2xl font-bold ${getEfficiencyColor(analytics.overview.familyEfficiencyScore)}`}>
                      {Math.round(analytics.overview.familyEfficiencyScore)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
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
  );
} 