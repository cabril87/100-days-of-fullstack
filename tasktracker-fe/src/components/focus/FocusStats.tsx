'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFocus } from '@/lib/providers/FocusContext';
import { FocusStatistics } from '@/lib/services/focusService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function FocusStats() {
  const { fetchStatistics, isLoading } = useFocus();
  const [statistics, setStatistics] = useState<FocusStatistics | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)), // Last 7 days
    endDate: new Date()
  });

  useEffect(() => {
    const loadStatistics = async () => {
      const stats = await fetchStatistics(dateRange.startDate, dateRange.endDate);
      if (stats) {
        setStatistics(stats);
      }
    };

    loadStatistics();
  }, [fetchStatistics, dateRange]);

  // Function to format minutes into hours and minutes
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Prepare data for daily focus chart
  const prepareDailyFocusData = () => {
    if (!statistics || !statistics.dailyFocusMinutes) return [];
    
    return Object.entries(statistics.dailyFocusMinutes).map(([date, minutes]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes: minutes,
      hours: +(minutes / 60).toFixed(1)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Prepare data for distractions pie chart
  const prepareDistractionsData = () => {
    if (!statistics || !statistics.distractionsByCategory) return [];
    
    return Object.entries(statistics.distractionsByCategory).map(([category, count]) => ({
      name: category,
      value: count,
      color: getColorForCategory(category)
    }));
  };

  // Get a color for a distraction category
  const getColorForCategory = (category: string): string => {
    const colors: Record<string, string> = {
      'Social Media': '#3E5879',
      'Notification': '#D8C4B6',
      'Phone': '#213555',
      'Person': '#4F709C',
      'Hunger': '#E5D283',
      'Tiredness': '#8294C4',
      'Other': '#ACB1D6'
    };
    
    return colors[category] || '#ACB1D6';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Focus Time</CardTitle>
            <CardDescription>Time spent in focus sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-navy-dark">
              {statistics ? formatMinutes(statistics.totalMinutesFocused) : '0m'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {statistics?.sessionCount || 0} sessions completed
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Session</CardTitle>
            <CardDescription>Average focus session duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-navy-dark">
              {statistics ? formatMinutes(statistics.averageSessionLength) : '0m'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              per focus session
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distractions</CardTitle>
            <CardDescription>Total recorded distractions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-navy-dark">
              {statistics?.distractionCount || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              across all sessions
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Daily Focus Time</CardTitle>
            <CardDescription>Minutes spent focusing each day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareDailyFocusData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} min`, 'Focus Time']} />
                  <Bar dataKey="minutes" name="Focus Minutes" fill="#3E5879" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Distraction Sources</CardTitle>
            <CardDescription>What interrupts your focus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {statistics && statistics.distractionCount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareDistractionsData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareDistractionsData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-center">
                    No distractions recorded yet.<br />
                    Great focus!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Focus Streaks</CardTitle>
          <CardDescription>Your consistency metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Daily Goal Progress</span>
                <span className="text-sm font-medium">
                  {statistics && statistics.dailyFocusMinutes && Object.keys(statistics.dailyFocusMinutes).length > 0 
                    ? `${Object.keys(statistics.dailyFocusMinutes).length} / 7 days`
                    : '0 / 7 days'}
                </span>
              </div>
              <Progress 
                value={statistics && statistics.dailyFocusMinutes 
                  ? (Object.keys(statistics.dailyFocusMinutes).length / 7) * 100 
                  : 0
                } 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Weekly Focus Goal (120 min)</span>
                <span className="text-sm font-medium">
                  {statistics ? `${statistics.totalMinutesFocused} / 120 min` : '0 / 120 min'}
                </span>
              </div>
              <Progress 
                value={statistics ? Math.min((statistics.totalMinutesFocused / 120) * 100, 100) : 0} 
                className="h-2"
              />
            </div>
            
            <div className="pt-4 grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - 6 + i);
                const dateStr = date.toISOString().split('T')[0];
                const hasActivity = statistics?.dailyFocusMinutes && 
                  Object.keys(statistics.dailyFocusMinutes).some(d => 
                    new Date(d).toISOString().split('T')[0] === dateStr
                  );
                
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs ${
                        hasActivity 
                          ? 'bg-brand-navy text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <span className="text-xs mt-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 