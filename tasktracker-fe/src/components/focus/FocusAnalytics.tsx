'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Spinner } from '@/components/ui/spinner';
import { Clock, Target, AlertTriangle, Calendar } from 'lucide-react';
import { FocusStatistics } from '@/lib/types/focus';

interface AnalyticsRange {
  label: string;
  days: number;
}

const ranges: AnalyticsRange[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last year', days: 365 }
];

const CHART_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316'];

export function FocusAnalytics() {
  const { fetchStatistics, isLoading: contextLoading } = useFocus();
  
  const [selectedRange, setSelectedRange] = useState<AnalyticsRange>(ranges[1]);
  const [statistics, setStatistics] = useState<FocusStatistics | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  const loadingRef = useRef(false);
  const currentRangeRef = useRef<number>(selectedRange.days);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load analytics data - API ONLY
  const loadAnalyticsData = useCallback(async () => {
    if (loadingRef.current || isDataLoading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    loadingRef.current = true;
    setIsDataLoading(true);
    
    try {
      abortControllerRef.current = new AbortController();

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - selectedRange.days * 24 * 60 * 60 * 1000);
      
      console.log(`[FocusAnalytics] Fetching API data for ${selectedRange.label}...`);

      const stats = await fetchStatistics(startDate, endDate);
      currentRangeRef.current = selectedRange.days;

      // ONLY set data if API returned something, no fallbacks
      if (stats) {
        setStatistics(stats);
        console.log(`[FocusAnalytics] API returned:`, stats);
      } else {
        setStatistics(null);
        console.log(`[FocusAnalytics] API returned no data`);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error loading analytics data:', error);
        setStatistics(null);
      }
    } finally {
      loadingRef.current = false;
      setIsDataLoading(false);
      abortControllerRef.current = null;
    }
  }, [selectedRange, fetchStatistics, isDataLoading]);

  // Load data when range changes
  useEffect(() => {
    if (currentRangeRef.current !== selectedRange.days) {
      const timeoutId = setTimeout(() => {
      loadAnalyticsData();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedRange.days, loadAnalyticsData]);

  // Initial load
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Process ONLY real API data for charts
  const processChartData = () => {
    if (!statistics) {
      return { daily: [], categories: [] };
    }

    // Daily focus data - ONLY from API
    const daily = statistics.dailyFocusMinutes 
      ? Object.entries(statistics.dailyFocusMinutes)
          .map(([date, minutes]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            minutes: minutes,
            hours: Math.round((minutes / 60) * 10) / 10
          }))
          .slice(-14)
      : [];

    // Distraction categories - ONLY from API
    const categories = statistics.distractionsByCategory
      ? Object.entries(statistics.distractionsByCategory).map(([category, count]) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: count,
          percentage: Math.round((count / statistics.distractionCount) * 100)
        }))
      : [];

    return { daily, categories };
  };

  const chartData = processChartData();
  const isLoading = contextLoading || isDataLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading analytics from API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy-dark">Focus Analytics</h2>
          <p className="text-gray-600">Data directly from your API - no mock data</p>
        </div>
        
        <Select 
          value={selectedRange.days.toString()} 
          onValueChange={(value) => setSelectedRange(ranges.find(r => r.days === parseInt(value)) || ranges[1])}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ranges.map((range) => (
              <SelectItem key={range.days} value={range.days.toString()}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* API Data Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
            <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
                      </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Focus Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics ? (
                    `${Math.floor(statistics.totalMinutesFocused / 60)}h ${statistics.totalMinutesFocused % 60}m`
                  ) : (
                    '0h 0m'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.sessionCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics ? Math.round(statistics.averageSessionLength) : 0}m
                </p>
                  </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Distractions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics?.distractionCount || 0}
                </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Charts - API Data Only */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trends">Focus Trends</TabsTrigger>
          <TabsTrigger value="distractions">Distractions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
              <CardHeader>
              <CardTitle>Daily Focus Minutes (API Data)</CardTitle>
              </CardHeader>
              <CardContent>
              {chartData.daily.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                      dataKey="minutes" 
                      stroke="#3b82f6" 
                        strokeWidth={2}
                      dot={{ r: 4 }}
                      />
                  </LineChart>
                  </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No API data available</p>
                    <p className="text-sm">Complete some focus sessions to see trends</p>
                    {statistics && (
                      <p className="text-xs text-gray-400 mt-2">
                        API returned: {statistics.sessionCount} sessions, {statistics.totalMinutesFocused} minutes
                      </p>
                    )}
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="distractions" className="space-y-6">
          <Card>
              <CardHeader>
              <CardTitle>Distraction Analysis (API Data)</CardTitle>
              </CardHeader>
              <CardContent>
              {chartData.categories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData.categories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.categories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">API Data Summary</h4>
                    {chartData.categories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium">{category.value} times</span>
                      </div>
                    ))}
                        </div>
                      </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No distraction data from API</p>
                    <p className="text-sm">Record some distractions during focus sessions</p>
                    {statistics && (
                      <p className="text-xs text-gray-400 mt-2">
                        API returned: {statistics.distractionCount} distractions
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Raw API Data Display (Development) */}
      {process.env.NODE_ENV === 'development' && statistics && (
        <Card>
          <CardHeader>
            <CardTitle>Raw API Response (Dev Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(statistics, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 