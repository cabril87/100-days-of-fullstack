'use client';

import { useMemo, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useResponsive, useTouchOptimized } from '@/lib/hooks/useResponsive';
import { useCommonGestures, triggerHapticFeedback } from '@/lib/hooks/useMobileGestures';

// Types following enterprise standards
import type {
  AppleCalendarViewProps,
  CalendarEventDTO,
  CalendarDayData,
  CalendarWeekData,
  CalendarMonthData,
  CalendarGamificationData
} from '@/lib/types/calendar';
import { FamilyTaskItemDTO } from '@/lib/types/task';

/**
 * Apple-like Calendar View Component
 * Provides month, week, day, and agenda views with gamification integration
 * Follows Apple Calendar design principles with enterprise functionality
 */
export default function AppleCalendarView({
  viewType,
  currentDate,
  events,
  tasks,
  onDateSelect,
  onEventSelect,
  onTaskSelect,
  gamificationData,
  className,
  onCreateEvent
}: AppleCalendarViewProps) {

  // ============================================================================
  // ENTERPRISE RESPONSIVE SYSTEM
  // ============================================================================
  
  const responsive = useResponsive();
  const { touchClasses, buttonSize } = useTouchOptimized();
  
  // Swipe navigation for mobile view switching
  const gestureRef = useRef<HTMLElement | null>(null);
  
  useCommonGestures({
    onSwipeLeft: () => {
      // Swipe left - next view/period
      if (responsive.isMobile) {
        triggerHapticFeedback('light');
        // Navigate to next period based on current view
        const nextDate = new Date(currentDate);
        switch (viewType) {
          case 'month':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'week':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'day':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        }
        onDateSelect(nextDate);
      }
    },
    onSwipeRight: () => {
      // Swipe right - previous view/period
      if (responsive.isMobile) {
        triggerHapticFeedback('light');
        // Navigate to previous period based on current view
        const prevDate = new Date(currentDate);
        switch (viewType) {
          case 'month':
            prevDate.setMonth(prevDate.getMonth() - 1);
            break;
          case 'week':
            prevDate.setDate(prevDate.getDate() - 7);
            break;
          case 'day':
            prevDate.setDate(prevDate.getDate() - 1);
            break;
        }
        onDateSelect(prevDate);
      }
    }
  });

  console.log('🔍 AppleCalendarView: Received props:', {
    viewType,
    currentDate: currentDate.toISOString(),
    eventsCount: events.length,
    tasksCount: tasks.length,
    events: events.map(e => ({ id: e.id, title: e.title, startDate: e.startDate })),
    responsive: {
      isMobile: responsive.isMobile,
      breakpoint: responsive.breakpoint
    }
  });

  // ============================================================================
  // COMPUTED VALUES - Calendar Data Processing
  // ============================================================================

  const calendarData = useMemo(() => {
    console.log('🔄 AppleCalendarView: Generating calendar data for:', { viewType, currentDate: currentDate.toISOString() });
    
    let data;
    switch (viewType) {
      case 'month':
        data = generateMonthData(currentDate, events, tasks, gamificationData);
        break;
      case 'week':
        data = generateWeekData(currentDate, events, tasks, gamificationData);
        break;
      case 'day':
        data = generateDayData(currentDate, events, tasks, gamificationData);
        break;
      case 'list':
        data = generateListData(currentDate, events, tasks, gamificationData);
        break;
      default:
        data = generateMonthData(currentDate, events, tasks, gamificationData);
    }
    
    console.log('✅ AppleCalendarView: Generated calendar data:', data);
    return data;
  }, [viewType, currentDate, events, tasks, gamificationData]);

  // ============================================================================
  // EVENT HANDLERS - User interactions
  // ============================================================================

  const handleEventClick = (event: CalendarEventDTO) => {
    console.log('🎯 AppleCalendarView: Event clicked:', event.title);
    onEventSelect(event);
  };

  const handleTaskClick = (task: FamilyTaskItemDTO) => {
    console.log('🎯 AppleCalendarView: Task clicked:', task.title);
    onTaskSelect(task);
  };

  const handleDateClick = (date: Date) => {
    console.log('🎯 AppleCalendarView: Date clicked:', date.toDateString());
    onDateSelect(date);
  };



  // ============================================================================
  // RENDER METHODS - View-specific rendering
  // ============================================================================

  const renderMonthView = () => {
    const monthData = calendarData as CalendarMonthData;
    
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden backdrop-blur-sm">

        {/* Weekday Headers - Clean Design */}
        <div className="grid grid-cols-7 bg-gray-50/50 dark:bg-gray-800/50">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
            <div
              key={day}
              className="p-4 text-center border-r border-gray-200/30 dark:border-gray-700/30 last:border-r-0"
            >
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                <span className="hidden sm:inline">{day.slice(0, 3)}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Grid - Enhanced Enterprise Design */}
        <div className="grid grid-cols-7">
          {monthData.weeks.flatMap(week => 
            week.days.map((day, dayIndex) => (
              <div
                key={`${week.weekNumber}-${dayIndex}`}
                className={cn(
                  "min-h-[80px] sm:min-h-[100px] md:min-h-[140px] p-2 sm:p-3 md:p-4 border-r border-b border-gray-200/30 dark:border-gray-700/30 cursor-pointer transition-all duration-300 group hover:shadow-lg hover:z-10 relative",
                  touchClasses,
                  buttonSize,
                  {
                    "bg-gray-50/30 dark:bg-gray-800/30": !day.isCurrentMonth,
                    "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 ring-1 ring-blue-200/50 dark:ring-blue-700/50": day.isToday,
                    "bg-gradient-to-br from-indigo-50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-800/20": day.isSelected,
                    "bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-900/10 dark:to-orange-900/10": day.totalPoints > 0,
                    "hover:bg-gray-50/50 dark:hover:bg-gray-800/50": day.isCurrentMonth && !day.isToday && !day.isSelected
                  }
                )}
                onClick={(e) => {
                  // Single click to open side sheet with day content
                  e.preventDefault();
                  if (responsive.isMobile) {
                    triggerHapticFeedback('light');
                  }
                  handleDateClick(day.date);
                  if (onCreateEvent) {
                    onCreateEvent(day.date);
                  }
                }}
                onDoubleClick={(e) => {
                  // Double click to create event (same as single click for now)
                  e.preventDefault();
                  if (onCreateEvent) {
                    onCreateEvent(day.date);
                  }
                }}
              >
                {/* Day Number with Sophisticated Styling */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm md:text-base transition-all duration-200",
                      {
                        "text-gray-400 dark:text-gray-600": !day.isCurrentMonth,
                        "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg": day.isToday,
                        "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md": day.isSelected && !day.isToday,
                        "text-gray-900 dark:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 hover:shadow-sm": day.isCurrentMonth && !day.isToday && !day.isSelected
                      }
                    )}
                  >
                    {day.date.getDate()}
                  </div>
                  
                  {/* Clean Gamification Indicator */}
                  {day.totalPoints > 0 && (
                    <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-md sm:rounded-lg border border-amber-200/30 dark:border-amber-700/30 backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-sm"></div>
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">{day.totalPoints}</span>
                    </div>
                  )}
                </div>

                {/* Events and Tasks - Clean Cards */}
                <div className="space-y-1 sm:space-y-1.5">
                                    {day.events.slice(0, 2).map((event, eventIndex) => (
                    <div
                      key={event.id}
                      className={cn(
                        "group/event px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm transform hover:scale-[1.02] touch-manipulation",
                        eventIndex > 0 && "hidden sm:block"
                      )}
                      style={{ 
                        backgroundColor: event.color + '15', 
                        borderLeft: `3px solid ${event.color}`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (responsive.isMobile) {
                          triggerHapticFeedback('light');
                        }
                        handleEventClick(event);
                      }}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div 
                          className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {event.title}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {day.tasks.slice(0, 2).map((task, taskIndex) => (
                    <div
                      key={task.id}
                      className={cn(
                        "group/task px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md sm:rounded-lg bg-gradient-to-r from-slate-100/80 to-gray-100/80 dark:from-slate-700/80 dark:to-gray-700/80 cursor-pointer transition-all duration-200 hover:from-slate-200/80 hover:to-gray-200/80 dark:hover:from-slate-600/80 dark:hover:to-gray-600/80 hover:shadow-sm transform hover:scale-[1.02] border-l-2 sm:border-l-3 border-slate-400/50 touch-manipulation",
                        taskIndex > 0 && "hidden sm:block"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm bg-slate-400 dark:bg-slate-500 flex-shrink-0"></div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                          {task.title}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* More items indicator with clean styling */}
                  {(day.events.length + day.tasks.length) > 4 && (
                    <div className="text-center py-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100/80 dark:bg-gray-700/80 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-600/50">
                        +{(day.events.length + day.tasks.length) - 4} more
                      </span>
                    </div>
                  )}
                </div>

                {/* Achievement Badge with Subtle Animation */}
                {day.hasAchievements && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg flex items-center justify-center animate-pulse">
                      <Trophy className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekData = calendarData as CalendarWeekData;
    
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Time Grid with 7-day layout - Mobile Responsive */}
        <div className={cn(
          "grid divide-x divide-gray-200 dark:divide-gray-700 overflow-x-auto",
          responsive.isMobile ? "grid-cols-4" : "grid-cols-8"
        )}>
          {/* Time column */}
          <div className="bg-gray-50 dark:bg-gray-800">
            <div className="h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
              Time
            </div>
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="h-16 border-b border-gray-100 dark:border-gray-700 flex items-start justify-center pt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Days columns - Show fewer on mobile */}
          {weekData.days.map((day, index) => {
            // Show only 3 days on mobile, all 7 on desktop
            const shouldShow = responsive.isMobile ? index < 3 : true;
            if (!shouldShow) return null;
            
            return (
              <div key={index} className={cn(
                "relative",
                responsive.isMobile ? "min-w-[120px]" : "min-w-0"
              )}>
                {/* Day header */}
                <div className={cn(
                  "h-12 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer transition-colors",
                  touchClasses,
                  {
                    "bg-blue-100 dark:bg-blue-900/30": day.isToday,
                    "hover:bg-gray-50 dark:hover:bg-gray-800": !day.isToday
                  }
                )}
                onClick={() => {
                  if (responsive.isMobile) {
                    triggerHapticFeedback('light');
                  }
                  handleDateClick(day.date);
                }}
                >
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span className={cn(
                  "text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center",
                  {
                    "bg-blue-600 text-white": day.isToday,
                    "text-gray-900 dark:text-white": !day.isToday
                  }
                )}>
                  {day.date.getDate()}
                </span>
              </div>

              {/* Hour slots */}
              {Array.from({ length: 24 }, (_, hour) => (
                <div 
                  key={hour} 
                  className="h-16 border-b border-gray-100 dark:border-gray-700 relative p-1 cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                  onClick={(e) => {
                    if (e.target === e.currentTarget && onCreateEvent) {
                      const timeString = `${hour.toString().padStart(2, '0')}:00`;
                      onCreateEvent(day.date, timeString);
                    }
                  }}
                  title={`Click to create event at ${hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}`}
                >
                  {/* Events and tasks for this hour */}
                  {[...day.events, ...day.tasks].filter(item => {
                    const itemHour = new Date('startDate' in item ? item.startDate : item.dueDate || new Date()).getHours();
                    return itemHour === hour;
                  }).map((item, itemIndex) => (
                    <div
                      key={`${item.id}-${itemIndex}`}
                      className="text-xs p-1 mb-1 rounded cursor-pointer truncate transition-all hover:shadow-md"
                      style={{
                        backgroundColor: 'color' in item ? item.color + '20' : '#f3f4f6',
                        color: 'color' in item ? item.color : '#374151',
                        borderLeft: `3px solid ${'color' in item ? item.color : '#9ca3af'}`
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if ('eventType' in item) {
                          handleEventClick(item as CalendarEventDTO);
                        } else {
                          handleTaskClick(item as FamilyTaskItemDTO);
                        }
                      }}
                    >
                      {'eventType' in item ? item.title : `📋 ${item.title}`}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayData = calendarData as CalendarDayData;
    
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

        {/* Day Timeline */}
        <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
          {/* Time column */}
          <div className="w-20 bg-gray-50 dark:bg-gray-800">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="h-20 border-b border-gray-100 dark:border-gray-700 flex items-start justify-center pt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </span>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="flex-1">
            {Array.from({ length: 24 }, (_, hour) => (
              <div 
                key={hour} 
                className="h-20 border-b border-gray-100 dark:border-gray-700 relative p-2 cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                onClick={(e) => {
                  if (e.target === e.currentTarget && onCreateEvent) {
                    const timeString = `${hour.toString().padStart(2, '0')}:00`;
                    onCreateEvent(currentDate, timeString);
                  }
                }}
                title={`Click to create event at ${hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}`}
              >
                {/* Events and tasks for this hour */}
                {[...dayData.events, ...dayData.tasks].filter(item => {
                  const itemHour = new Date('startDate' in item ? item.startDate : item.dueDate || new Date()).getHours();
                  return itemHour === hour;
                }).map((item, itemIndex) => (
                  <div
                    key={`${item.id}-${itemIndex}`}
                    className="p-3 mb-2 rounded-lg cursor-pointer transition-all hover:shadow-lg transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: 'color' in item ? item.color + '15' : '#f9fafb',
                      borderLeft: `4px solid ${'color' in item ? item.color : '#6b7280'}`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if ('eventType' in item) {
                        handleEventClick(item as CalendarEventDTO);
                      } else {
                        handleTaskClick(item as FamilyTaskItemDTO);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {'eventType' in item ? item.title : `📋 ${item.title}`}
                      </h4>
                      {'color' in item && (
                        <Badge style={{ backgroundColor: item.color + '30', color: item.color }}>
                          Event
                        </Badge>
                      )}
                    </div>
                    {'description' in item && item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => {
    const listData = calendarData as { days: CalendarDayData[] };
    
    // Safety check for data structure
    if (!listData || !listData.days || !Array.isArray(listData.days)) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming items</h3>
            <p className="text-gray-500 dark:text-gray-400">There are no events or tasks scheduled for the next 30 days.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* List Content - Grouped by Date */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
          {listData.days.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming items</h3>
              <p className="text-gray-500 dark:text-gray-400">There are no events or tasks scheduled for the next 30 days.</p>
            </div>
          ) : (
            listData.days.map((day, dayIndex) => {
              const dayItems = [...(day.events || []), ...(day.tasks || [])].sort((a, b) => {
                const timeA = new Date('startDate' in a ? a.startDate : a.dueDate || new Date()).getTime();
                const timeB = new Date('startDate' in b ? b.startDate : b.dueDate || new Date()).getTime();
                return timeA - timeB;
              });

              return (
                <div key={dayIndex} className="p-3 sm:p-4 md:p-6">
                  {/* Date Header */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-lg",
                      {
                        "bg-gradient-to-br from-blue-500 to-blue-600": day.isToday,
                        "bg-gradient-to-br from-gray-400 to-gray-500": !day.isToday
                      }
                    )}>
                      <span className="text-xs">{day.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-sm sm:text-lg">{day.date.getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        <span className="hidden sm:inline">{day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        <span className="sm:hidden">{day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {dayItems.length} item{dayItems.length !== 1 ? 's' : ''} • {day.events.length} events • {day.tasks.length} tasks
                      </p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 sm:space-y-3 ml-12 sm:ml-15">
                    {dayItems.map((item, itemIndex) => (
                      <div
                        key={`${item.id}-${itemIndex}`}
                        className="p-3 sm:p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 touch-manipulation"
                        style={{
                          backgroundColor: 'color' in item ? item.color + '08' : '#f9fafb',
                          borderLeftColor: 'color' in item ? item.color : '#6b7280',
                          borderLeftWidth: '4px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if ('eventType' in item) {
                            handleEventClick(item as CalendarEventDTO);
                          } else {
                            handleTaskClick(item as FamilyTaskItemDTO);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white flex-1 min-w-0">
                            <span className="truncate">{'eventType' in item ? item.title : `📋 ${item.title}`}</span>
                          </h4>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            {'color' in item ? (
                              <Badge style={{ backgroundColor: item.color + '20', color: item.color }} className="text-xs">
                                Event
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Task • {item.pointsValue || 0} XP
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {new Date('startDate' in item ? item.startDate : item.dueDate || new Date()).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                        </div>
                        {'description' in item && item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER - View Router
  // ============================================================================

  return (
    <div 
      ref={(el) => { gestureRef.current = el; }}
      className={cn(
        "w-full",
        touchClasses,
        responsive.isMobile && "select-none",
        className
      )}
    >
      {/* Mobile swipe indicator */}
      {responsive.isMobile && (
        <div className="flex justify-center mb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-50"></div>
        </div>
      )}
      
      {viewType === 'month' && renderMonthView()}
      {viewType === 'week' && renderWeekView()}
      {viewType === 'day' && renderDayView()}
      {viewType === 'list' && renderListView()}
      
      {/* Mobile navigation hint */}
      {responsive.isMobile && (
        <div className="text-center mt-3 px-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Swipe left/right to navigate • Tap to select
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS - Calendar Data Generation
// ============================================================================

function generateMonthData(
  currentDate: Date, 
  events: CalendarEventDTO[], 
  tasks: FamilyTaskItemDTO[], 
  gamificationData: CalendarGamificationData
): CalendarMonthData {
  console.log('📅 generateMonthData: Input data:', {
    currentDate: currentDate.toISOString(),
    eventsCount: events.length,
    tasksCount: tasks.length,
    events: events.map(e => ({ id: e.id, title: e.title, startDate: e.startDate.toISOString() }))
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const weeks: CalendarWeekData[] = [];
  let weekNumber = 1;
  
  for (let weekStart = new Date(startDate); weekStart <= lastDay; weekStart.setDate(weekStart.getDate() + 7)) {
    const days: CalendarDayData[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDate);
        const match = eventDate.toDateString() === date.toDateString();
        if (match) {
          console.log('📅 generateMonthData: Event matched for date:', {
            eventTitle: event.title,
            eventDate: eventDate.toISOString(),
            dayDate: date.toISOString(),
            match
          });
        }
        return match;
      });
      
      const dayTasks = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const dateStr = date.toISOString().split('T')[0];
      const totalPoints = gamificationData.dailyPoints[dateStr] || 0;
      
      days.push({
        date,
        isToday: date.toDateString() === new Date().toDateString(),
        isCurrentMonth: date.getMonth() === month,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        events: dayEvents,
        tasks: dayTasks,
        totalPoints,
        hasAchievements: totalPoints > 0,
        isSelected: false
      });
    }
    
    weeks.push({
      weekNumber: weekNumber++,
      startDate: new Date(weekStart),
      endDate: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
      days,
      totalEvents: days.reduce((sum, day) => sum + day.events.length, 0),
      totalPoints: days.reduce((sum, day) => sum + day.totalPoints, 0),
      completedTasks: days.reduce((sum, day) => sum + day.tasks.filter(t => t.isCompleted).length, 0)
    });
  }

  const result = {
    month,
    year,
    monthName: firstDay.toLocaleDateString('en-US', { month: 'long' }),
    weeks,
    totalEvents: events.length,
    totalPoints: Object.values(gamificationData.dailyPoints).reduce((sum: number, points: number) => sum + points, 0),
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.isCompleted).length
  };

  console.log('✅ generateMonthData: Generated month data:', {
    month: result.monthName,
    totalEvents: result.totalEvents,
    weeksWithEvents: result.weeks.filter(w => w.totalEvents > 0).length
  });

  return result;
}

function generateWeekData(
  currentDate: Date, 
  events: CalendarEventDTO[], 
  tasks: FamilyTaskItemDTO[], 
  gamificationData: CalendarGamificationData
): CalendarWeekData {
  // Get the start of the week (Sunday)
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  
  const days: CalendarDayData[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
    
    const dayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
    
    const dateStr = date.toISOString().split('T')[0];
    const totalPoints = gamificationData.dailyPoints?.[dateStr] || 0;
    
    days.push({
      date,
      isToday: date.toDateString() === new Date().toDateString(),
      isCurrentMonth: date.getMonth() === currentDate.getMonth(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      events: dayEvents,
      tasks: dayTasks,
      totalPoints,
      hasAchievements: totalPoints > 0,
      isSelected: false
    });
  }
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    weekNumber: Math.ceil(currentDate.getDate() / 7),
    startDate: weekStart,
    endDate: weekEnd,
    days,
    totalEvents: days.reduce((sum, day) => sum + day.events.length, 0),
    totalPoints: days.reduce((sum, day) => sum + day.totalPoints, 0),
    completedTasks: days.reduce((sum, day) => sum + day.tasks.filter(t => t.isCompleted).length, 0)
  };
}

function generateDayData(
  currentDate: Date, 
  events: CalendarEventDTO[], 
  tasks: FamilyTaskItemDTO[], 
  gamificationData: CalendarGamificationData
): CalendarDayData {
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === currentDate.toDateString();
  });
  
  const dayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === currentDate.toDateString();
  });
  
  const dateStr = currentDate.toISOString().split('T')[0];
  const totalPoints = gamificationData.dailyPoints?.[dateStr] || 0;
  
  return {
    date: currentDate,
    isToday: currentDate.toDateString() === new Date().toDateString(),
    isCurrentMonth: true,
    isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
    events: dayEvents,
    tasks: dayTasks,
    totalPoints,
    hasAchievements: totalPoints > 0,
    isSelected: true
  };
}

function generateListData(
  currentDate: Date, 
  events: CalendarEventDTO[], 
  tasks: FamilyTaskItemDTO[], 
  gamificationData: CalendarGamificationData
) {
  // Generate next 30 days for comprehensive list view
  const days = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    
    // Filter events and tasks for this day
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
    
    const dayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
    
    // Only include days that have items
    if (dayEvents.length > 0 || dayTasks.length > 0) {
      const dateStr = date.toISOString().split('T')[0];
      const totalPoints = gamificationData.dailyPoints?.[dateStr] || 0;
      
      days.push({
        date,
        isToday: date.toDateString() === new Date().toDateString(),
        isCurrentMonth: true,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        events: dayEvents,
        tasks: dayTasks,
        totalPoints,
        hasAchievements: totalPoints > 0,
        isSelected: false
      });
    }
  }
  
  return { days };
} 