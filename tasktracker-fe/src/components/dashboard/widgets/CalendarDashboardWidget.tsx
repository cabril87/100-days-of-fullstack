'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Trophy,
  Target,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

// Types following enterprise standards
import type {
  CalendarDashboardWidgetProps,
  CalendarEventDTO,
  CalendarStatsDTO
} from '@/lib/types/calendar';
import { FamilyTaskItemDTO } from '@/lib/types/task';

// Services
import { calendarService } from '@/lib/services/calendarService';

/**
 * Calendar Dashboard Widget Component
 * Shows calendar overview in dashboard with Apple-like mini calendar
 * Integrates with existing gamification system
 */
export default function CalendarDashboardWidget({
  userId,
  viewMode,
  events: initialEvents = [],
  upcomingTasks: initialTasks = [],
  stats: initialStats,
  onNavigateToCalendar,
  className
}: CalendarDashboardWidgetProps) {
  const router = useRouter();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [events, setEvents] = useState<CalendarEventDTO[]>(initialEvents);
  const [upcomingTasks] = useState<FamilyTaskItemDTO[]>(initialTasks);
  const [stats, setStats] = useState<CalendarStatsDTO>(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate] = useState(new Date());

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadCalendarData = useCallback(async () => {
    if (!userId || isLoading) return;

    setIsLoading(true);
    try {
      console.log('📅 CalendarWidget: Loading upcoming calendar data...');
      
      const [upcomingEvents, weekStats] = await Promise.all([
        calendarService.getUpcomingEvents(7), // Get next 7 days
        calendarService.getCalendarStats() // No date range for now
      ]);

      // Map service DTOs to component types
      const mappedEvents = upcomingEvents.map(event => ({
        ...event,
        startDate: event.startDate,
        endDate: event.endDate,
        createdByUserId: event.createdByUserId || 0,
        achievementId: undefined,
        taskId: undefined,
        eventType: event.eventType as 'task' | 'achievement' | 'family_activity' | 'celebration' | 'reminder' | 'meeting' | 'deadline',
        recurrence: undefined,
        color: event.color || '#3B82F6',
        updatedAt: event.updatedAt || new Date()
      })) as CalendarEventDTO[];
      setEvents(mappedEvents);
      // For now, keep existing tasks since we only get events from this endpoint
      // setUpcomingTasks([]);
      setStats(weekStats);

      console.log('✅ CalendarWidget: Data loaded successfully');
    } catch (error) {
      console.error('❌ CalendarWidget: Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading]);

  // Load data on mount
  useEffect(() => {
    if (userId) {
      loadCalendarData();
    }
  }, [userId, loadCalendarData]);

  // ============================================================================
  // MINI CALENDAR HELPERS
  // ============================================================================

  const generateMiniCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks = [];
    for (let weekStart = new Date(startDate); weekStart <= lastDay; weekStart.setDate(weekStart.getDate() + 7)) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        
        const hasEvents = events.some(event => {
          const eventDate = new Date(event.startDate);
          return eventDate.toDateString() === date.toDateString();
        });
        
        const hasTasks = upcomingTasks.some(task => {
          if (!task.dueDate) return false;
          const taskDate = new Date(task.dueDate);
          return taskDate.toDateString() === date.toDateString();
        });

        week.push({
          date,
          isCurrentMonth: date.getMonth() === month,
          isToday: date.toDateString() === new Date().toDateString(),
          hasEvents,
          hasTasks,
          hasActivity: hasEvents || hasTasks
        });
      }
      weeks.push(week);
    }

    return weeks;
  };

  const miniCalendarWeeks = generateMiniCalendar();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleNavigateToCalendar = () => {
    router.push('/calendar');
    onNavigateToCalendar();
  };

  const handleDateClick = (date: Date) => {
    router.push(`/calendar?date=${date.toISOString()}`);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSimpleView = () => (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Calendar</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleNavigateToCalendar}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              {events.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Events</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-semibold text-green-600 dark:text-green-400">
              {upcomingTasks.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Tasks</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.totalPoints}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">XP</div>
          </div>
        </div>

        {/* Upcoming Items */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            This Week
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {events.slice(0, 2).map((event) => (
              <div key={event.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.startDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {upcomingTasks.slice(0, 2).map((task) => (
              <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <Target className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'No due date'}
                  </div>
                </div>
                {task.pointsValue && (
                  <Badge variant="secondary" className="text-xs">
                    {task.pointsValue}
                  </Badge>
                )}
              </div>
            ))}
            
            {events.length === 0 && upcomingTasks.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No upcoming events or tasks
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAdvancedView = () => (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Calendar Overview</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={handleNavigateToCalendar}>
            View Full Calendar
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
            <Trophy className="h-3 w-3 mr-1" />
            {stats.totalPoints} XP
          </Badge>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
            <Target className="h-3 w-3 mr-1" />
            {stats.completedThisWeek}/{stats.tasksThisWeek}
          </Badge>
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20">
            <Flame className="h-3 w-3 mr-1" />
            {stats.streakDays}
          </Badge>
        </div>

        {/* Mini Calendar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h4>
          </div>
          
          <div className="space-y-1">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            {miniCalendarWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <button
                    key={dayIndex}
                    onClick={() => handleDateClick(day.date)}
                    className={cn(
                      "aspect-square text-xs rounded transition-colors relative",
                      {
                        "text-gray-400 dark:text-gray-600": !day.isCurrentMonth,
                        "bg-blue-600 text-white": day.isToday,
                        "hover:bg-gray-100 dark:hover:bg-gray-800": !day.isToday && day.isCurrentMonth,
                        "text-gray-900 dark:text-white": day.isCurrentMonth && !day.isToday
                      }
                    )}
                  >
                    {day.date.getDate()}
                    {day.hasActivity && (
                      <div className="absolute bottom-0 right-0 w-1 h-1 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Upcoming This Week
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.startDate).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {upcomingTasks.slice(0, 2).map((task) => (
              <div key={`task-${task.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'No due date'}
                  </div>
                </div>
                {task.pointsValue && (
                  <Badge variant="secondary" className="text-xs">
                    {task.pointsValue} XP
                  </Badge>
                )}
              </div>
            ))}
              
            {events.length === 0 && upcomingTasks.length === 0 && (
              <div className="text-center py-6">
                <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No upcoming events or tasks
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn("relative", { "opacity-50": isLoading })}>
      {viewMode === 'simple' ? renderSimpleView() : renderAdvancedView()}
    </div>
  );
} 