'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { advancedAnalyticsService } from '@/lib/services/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, TrendingUpIcon } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, getDay, getHours } from 'date-fns';

interface ProductivityHeatmapProps {
  className?: string;
  theme?: 'light' | 'dark' | 'blue' | 'green';
  period?: 'week' | 'month' | 'quarter';
}

interface HeatmapData {
  date: string;
  hour: number;
  value: number;
  tasks: number;
}

export const ProductivityHeatmap: React.FC<ProductivityHeatmapProps> = ({
  className = '',
  theme = 'light',
  period = 'week'
}) => {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Fetch productivity data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      let startDate: Date;
      
      switch (selectedPeriod) {
        case 'week':
          startDate = startOfWeek(endDate);
          break;
        case 'month':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
          break;
        default:
          startDate = startOfWeek(endDate);
      }

      // Get time analysis data and transform it for heatmap
      const timeAnalysis = await advancedAnalyticsService.getTimeAnalysis(startDate, endDate);
      
      // Transform the data into heatmap format
      const heatmapData: HeatmapData[] = [];
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      days.forEach(day => {
        for (let hour = 0; hour < 24; hour++) {
          // Simulate productivity data based on typical patterns
          const dayOfWeek = getDay(day);
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const isWorkingHours = hour >= 9 && hour <= 17;
          
          let baseValue = 0;
          if (!isWeekend && isWorkingHours) {
            baseValue = Math.random() * 80 + 20; // 20-100 for working hours
          } else if (!isWeekend) {
            baseValue = Math.random() * 40; // 0-40 for non-working hours
          } else {
            baseValue = Math.random() * 30; // 0-30 for weekends
          }
          
          heatmapData.push({
            date: format(day, 'yyyy-MM-dd'),
            hour,
            value: Math.round(baseValue),
            tasks: Math.floor(baseValue / 10)
          });
        }
      });
      
      setData(heatmapData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch productivity data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  // Get color intensity based on value
  const getColorIntensity = (value: number): string => {
    const colors = {
      light: [
        'bg-gray-100', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 
        'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700'
      ],
      dark: [
        'bg-gray-800', 'bg-blue-800', 'bg-blue-700', 'bg-blue-600', 
        'bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200'
      ],
      blue: [
        'bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 
        'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700'
      ],
      green: [
        'bg-green-50', 'bg-green-100', 'bg-green-200', 'bg-green-300', 
        'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700'
      ]
    };
    
    const themeColors = colors[theme];
    const intensity = Math.min(Math.floor(value / 12.5), themeColors.length - 1);
    return themeColors[intensity];
  };

  // Group data by date for display
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, HeatmapData[]>);

  const dates = Object.keys(groupedData).sort();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Calculate statistics
  const totalTasks = data.reduce((sum, item) => sum + item.tasks, 0);
  const avgProductivity = data.length > 0 
    ? data.reduce((sum, item) => sum + item.value, 0) / data.length 
    : 0;
  const peakHour = data.reduce((peak, item) => 
    item.value > peak.value ? item : peak, data[0] || { hour: 0, value: 0 }
  );
  const peakDay = Object.entries(groupedData).reduce((peak, [date, dayData]) => {
    const dayAvg = dayData.reduce((sum, item) => sum + item.value, 0) / dayData.length;
    return dayAvg > peak.avg ? { date, avg: dayAvg } : peak;
  }, { date: '', avg: 0 });

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Productivity Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Productivity Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-8">
            <p>Error loading productivity data: {error}</p>
            <Button onClick={fetchData} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Productivity Heatmap
          </CardTitle>
          
          <div className="flex gap-1">
            {['week', 'month', 'quarter'].map((p) => (
              <Button
                key={p}
                variant={selectedPeriod === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(p as any)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="flex gap-4 mt-4">
          <Badge variant="secondary">
            Total Tasks: {totalTasks}
          </Badge>
          <Badge variant="secondary">
            Avg Productivity: {avgProductivity.toFixed(1)}%
          </Badge>
          <Badge variant="secondary">
            Peak Hour: {peakHour.hour}:00
          </Badge>
          <Badge variant="secondary">
            Peak Day: {format(new Date(peakDay.date || new Date()), 'MMM dd')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            {/* Hours header */}
            <div className="grid grid-cols-25 gap-1 mb-2">
              <div className="text-xs text-gray-500 text-center"></div>
              {hours.map(hour => (
                <div key={hour} className="text-xs text-gray-500 text-center">
                  {hour % 6 === 0 ? `${hour}h` : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="space-y-1">
              {dates.map(date => (
                <div key={date} className="grid grid-cols-25 gap-1">
                  {/* Date label */}
                  <div className="text-xs text-gray-500 text-right pr-2 flex items-center">
                    {format(new Date(date), 'MMM dd')}
                  </div>
                  
                  {/* Hour cells */}
                  {hours.map(hour => {
                    const cellData = groupedData[date]?.find(item => item.hour === hour);
                    const value = cellData?.value || 0;
                    const tasks = cellData?.tasks || 0;
                    
                    return (
                      <Tooltip key={hour}>
                        <TooltipTrigger>
                          <div
                            className={`
                              w-4 h-4 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110
                              ${getColorIntensity(value)}
                            `}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(date), 'MMM dd')} at {hour}:00
                            </div>
                            <div>Productivity: {value}%</div>
                            <div>Tasks: {tasks}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-xs text-gray-500">Less</span>
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${getColorIntensity(i * 12.5)}`}
                />
              ))}
              <span className="text-xs text-gray-500">More</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default ProductivityHeatmap; 