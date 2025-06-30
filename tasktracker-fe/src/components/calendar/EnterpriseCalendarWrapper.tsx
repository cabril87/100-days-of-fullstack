'use client';

import React, { useState, useCallback } from 'react';
import { useResponsive } from '@/lib/hooks/useResponsive';
import MobileCalendarEnhancements, { 
  MobileViewSwitcher, 
  TouchFeedback
} from './MobileCalendarEnhancements';
import AppleCalendarView from './AppleCalendarView';
import CalendarControls from './CalendarControls';
import CreateEventSheet from './CreateEventSheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Plus,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

// Types
import type { CalendarViewType } from './CalendarControls';
import type { CalendarEventDTO, CalendarStatsDTO } from '@/lib/types/calendar';
import type { FamilyTaskItemDTO } from '@/lib/types/task';
import type { FamilyMemberDTO } from '@/lib/types/family-invitation';

interface EnterpriseCalendarWrapperProps {
  // Core calendar props
  currentDate: Date;
  viewType: CalendarViewType;
  events: CalendarEventDTO[];
  tasks: FamilyTaskItemDTO[];
  
  // Handlers
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  onEventSelect: (event: CalendarEventDTO) => void;
  onTaskSelect: (task: FamilyTaskItemDTO) => void;
  onCreateEvent: (date?: Date, time?: string) => void;
  onRefresh?: () => void;
  
  // State
  isLoading?: boolean;
  
  // Additional props
  familyId?: string;
  familyMembers?: FamilyMemberDTO[];
  stats?: CalendarStatsDTO;
  className?: string;
}

/**
 * Enterprise Calendar Wrapper
 * 
 * Provides a unified interface that automatically switches between:
 * - Desktop: Full CalendarPageWrapper with sidebar
 * - Mobile: MobileCalendarEnhancements with touch optimizations
 * 
 * Features:
 * - Responsive design that adapts to device capabilities
 * - Touch-optimized interactions on mobile
 * - Pull-to-refresh functionality
 * - Swipe navigation
 * - Haptic feedback
 * - Enterprise-grade performance
 */
export default function EnterpriseCalendarWrapper({
  currentDate,
  viewType,
  events,
  tasks,
  onDateChange,
  onViewChange,
  onEventSelect,
  onTaskSelect,
  onCreateEvent,
  onRefresh,
  isLoading = false,
  familyId,
  familyMembers = [],
  stats,
  className
}: EnterpriseCalendarWrapperProps) {
  
  // ============================================================================
  // RESPONSIVE SYSTEM
  // ============================================================================
  
  const responsive = useResponsive();
  const [createEventSheetOpen, setCreateEventSheetOpen] = useState(false);
  const [selectedEventDate, setSelectedEventDate] = useState<Date | null>(null);
  const [selectedEventTime, setSelectedEventTime] = useState<string | null>(null);
  // Mobile day selection state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleDateSelect = useCallback((date: Date) => {
    // For mobile, set selected date to show day details
    if (responsive.isMobile) {
      setSelectedDate(date);
    }
    onDateChange(date);
  }, [onDateChange, responsive.isMobile]);

  const handleCreateEvent = useCallback((date?: Date, time?: string) => {
    setSelectedEventDate(date || currentDate);
    setSelectedEventTime(time || null);
    setCreateEventSheetOpen(true);
    onCreateEvent(date, time);
  }, [currentDate, onCreateEvent]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // ============================================================================
  // MOBILE DAY DETAILS HELPERS
  // ============================================================================

  const getEventsForDate = useCallback((date: Date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === dateStr;
    });
  }, [events]);

  const getTasksForDate = useCallback((date: Date) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === dateStr;
    });
  }, [tasks]);

  // Mobile Day Details Component
  const MobileDayDetails = ({ date }: { date: Date }) => {
    const dayEvents = getEventsForDate(date);
    const dayTasks = getTasksForDate(date);
    const totalItems = dayEvents.length + dayTasks.length;

    if (totalItems === 0) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-slate-900/20 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="px-8 py-12 text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center mx-auto">
                <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">0</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              No scheduled items
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">
              {date.toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
              {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <TouchFeedback onPress={() => handleCreateEvent(date)} hapticPattern="light">
              <Button 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0 rounded-2xl px-8 py-3 font-semibold"
                size="sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </TouchFeedback>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-slate-900/20 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        {/* Enterprise Day Header */}
        <div className="relative px-8 py-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-b border-slate-200/50 dark:border-slate-600/50">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-400/5 dark:to-purple-400/5"></div>
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {date.toLocaleDateString('en-US', { weekday: 'long' })}
                </h3>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {totalItems} total items
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {dayEvents.length} events
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {dayTasks.length} tasks
                  </span>
                </div>
              </div>
            </div>
            <TouchFeedback onPress={() => setSelectedDate(null)} hapticPattern="light">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 rounded-full bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-700/80 dark:hover:bg-slate-600/80 border border-slate-200 dark:border-slate-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </TouchFeedback>
          </div>
        </div>

        {/* Enterprise Events and Tasks List */}
        <div className="max-h-96 overflow-y-auto">
          {/* Events Section */}
          {dayEvents.length > 0 && (
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Events ({dayEvents.length})
                </h4>
              </div>
              <div className="space-y-3">
                {dayEvents.map((event) => (
                  <TouchFeedback 
                    key={event.id} 
                    onPress={() => onEventSelect(event)} 
                    hapticPattern="light"
                  >
                    <div className="group p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-700/30 dark:hover:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/30 transition-all duration-200 hover:shadow-md hover:shadow-slate-900/5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div 
                            className="w-4 h-4 rounded-full shadow-sm border-2 border-white dark:border-slate-800"
                            style={{ backgroundColor: event.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h5 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {event.title}
                              </h5>
                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                                <span className="font-medium">
                                  {new Date(event.startDate).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                </span>
                                {event.endDate && (
                                  <>
                                    <span>→</span>
                                    <span className="font-medium">
                                      {new Date(event.endDate).toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit',
                                        hour12: true 
                                      })}
                                    </span>
                                  </>
                                )}
                              </div>
                              {event.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700 rounded-full"
                            >
                              Event
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TouchFeedback>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {dayTasks.length > 0 && (
            <div className="px-8 py-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Tasks ({dayTasks.length})
                </h4>
              </div>
              <div className="space-y-3">
                {dayTasks.map((task) => (
                  <TouchFeedback 
                    key={task.id} 
                    onPress={() => onTaskSelect(task)} 
                    hapticPattern="light"
                  >
                    <div className="group p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-700/30 dark:hover:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/30 transition-all duration-200 hover:shadow-md hover:shadow-slate-900/5">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-4 h-4 rounded-lg bg-amber-500 dark:bg-amber-400 shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h5 className="text-base font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {task.title}
                              </h5>
                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                                <span className="font-medium">
                                  Due: {task.dueDate ? new Date(task.dueDate).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                  }) : 'No time set'}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-medium px-3 py-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700 rounded-full"
                            >
                              Task
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TouchFeedback>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Add Button */}
        <div className="px-8 py-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-t border-slate-200/50 dark:border-slate-600/50">
          <TouchFeedback onPress={() => handleCreateEvent(date)} hapticPattern="light">
            <Button 
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0 rounded-2xl py-4 font-semibold text-base transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-3" />
              Create Event or Task
            </Button>
          </TouchFeedback>
        </div>
      </div>
    );
  };

  // ============================================================================
  // DEVICE-SPECIFIC RENDERING
  // ============================================================================

  // Mobile rendering with enhanced touch interactions
  if (responsive.isMobile) {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900", className)}>
        <MobileCalendarEnhancements
          currentDate={currentDate}
          viewType={viewType}
          onDateChange={onDateChange}
          onViewChange={onViewChange}
          onRefresh={handleRefresh}
          onCreateEvent={handleCreateEvent}
          isLoading={isLoading}
        >
          {/* Enterprise Mobile Header */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
            {/* Main Header Content */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                {/* Left: Branding & Status */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-2">
                      Calendar
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700 rounded-full">
                        <Smartphone className="w-3 h-3 mr-1.5" />
                        Mobile Optimized
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-medium px-3 py-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700 rounded-full">
                        <Zap className="w-3 h-3 mr-1.5" />
                        Touch Enhanced
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Switcher Section */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between gap-4">
                {/* Current Date Display */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
                  </p>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </h2>
                </div>
                
                {/* Enhanced View Switcher */}
                <div className="flex-shrink-0">
                  <MobileViewSwitcher 
                    currentView={viewType}
                    onViewChange={onViewChange}
                  />
                </div>
              </div>
            </div>

            {/* Subtle bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700"></div>
          </div>

          {/* Mobile Calendar Sidebar - High Position */}
          <div className="px-4 pt-6 pb-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-slate-900/20 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden mb-6">
              <div className="p-6">
                {/* Mobile Sidebar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Quick Overview
                    </h3>
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700 rounded-full">
                    Mobile Optimized
                  </Badge>
                </div>

                {/* Stats Grid - Mobile Optimized */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <TouchFeedback hapticPattern="light">
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200/50 dark:border-emerald-700/30">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {events.length}
                      </div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Events
                      </div>
                    </div>
                  </TouchFeedback>

                  <TouchFeedback hapticPattern="light">
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200/50 dark:border-amber-700/30">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {tasks.length}
                      </div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Tasks
                      </div>
                    </div>
                  </TouchFeedback>

                  <TouchFeedback hapticPattern="light">
                    <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200/50 dark:border-purple-700/30">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {stats?.totalPoints || 0}
                      </div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Points
                      </div>
                    </div>
                  </TouchFeedback>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <TouchFeedback onPress={() => handleCreateEvent()} hapticPattern="medium">
                    <Button 
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0 rounded-2xl py-4 font-semibold text-sm transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Event
                    </Button>
                  </TouchFeedback>
                  
                  <TouchFeedback onPress={() => handleCreateEvent()} hapticPattern="medium">
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-2xl py-4 font-semibold text-sm transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      New Task
                    </Button>
                  </TouchFeedback>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Container with Enterprise Spacing */}
          <div className="px-4 pb-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-900/5 dark:shadow-slate-900/20 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <AppleCalendarView
                viewType={viewType}
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                onDateSelect={handleDateSelect}
                onEventSelect={onEventSelect}
                onTaskSelect={onTaskSelect}
                onCreateEvent={handleCreateEvent}
                gamificationData={{
                  dailyPoints: {},
                  weeklyStreaks: {},
                  monthlyAchievements: [],
                  taskCompletionRates: {},
                  familyActivityLevels: {}
                }}
              />
            </div>

            {/* Mobile Day Details - Enterprise Design */}
            {selectedDate && (
              <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300">
                <MobileDayDetails date={selectedDate} />
              </div>
            )}
          </div>
        </MobileCalendarEnhancements>

        {/* Create Event Sheet */}
        <CreateEventSheet
          isOpen={createEventSheetOpen}
          onClose={() => setCreateEventSheetOpen(false)}
          selectedDate={selectedEventDate || currentDate}
          selectedTime={selectedEventTime ?? undefined}
          familyId={familyId}
          allFamilies={[]}
          familyMembers={familyMembers}
          existingEvents={events}
          existingTasks={tasks}
          onEventCreated={() => {
            // Handle event creation
            setCreateEventSheetOpen(false);
          }}
          onTaskCreated={() => {
            // Handle task creation
            setCreateEventSheetOpen(false);
          }}
          onEventUpdated={() => {
            // Handle event update
          }}
          onTaskUpdated={() => {
            // Handle task update
          }}
          onEventDeleted={() => {
            // Handle event deletion
          }}
          onTaskDeleted={() => {
            // Handle task deletion
          }}
        />
      </div>
    );
  }

  // Tablet rendering with hybrid approach
  if (responsive.isTablet) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
        {/* Tablet header */}
        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Calendar
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Tablet className="w-3 h-3 mr-1" />
                    Tablet
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Hybrid Mode
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <CalendarControls
                currentDate={currentDate}
                viewType={viewType}
                onDateChange={onDateChange}
                onViewChange={onViewChange}
                stats={stats || { tasksThisWeek: 0, completedThisWeek: 0, totalPoints: 0, streakDays: 0, upcomingDeadlines: 0, familyEvents: 0, personalEvents: 0, achievementsThisMonth: 0 }}
                onCreateEvent={handleCreateEvent}
              />
            </div>
          </div>
        </div>

        {/* Calendar content */}
        <div className="p-6">
          <AppleCalendarView
            viewType={viewType}
            currentDate={currentDate}
            events={events}
            tasks={tasks}
            onDateSelect={handleDateSelect}
            onEventSelect={onEventSelect}
            onTaskSelect={onTaskSelect}
            onCreateEvent={handleCreateEvent}
            gamificationData={{
              dailyPoints: {},
              weeklyStreaks: {},
              monthlyAchievements: [],
              taskCompletionRates: {},
              familyActivityLevels: {}
            }}
          />
        </div>

        {/* Create Event Sheet */}
        <CreateEventSheet
          isOpen={createEventSheetOpen}
          onClose={() => setCreateEventSheetOpen(false)}
          selectedDate={selectedEventDate || currentDate}
          selectedTime={selectedEventTime ?? undefined}
          familyId={familyId}
          allFamilies={[]}
          familyMembers={familyMembers}
          existingEvents={events}
          existingTasks={tasks}
          onEventCreated={() => {
            setCreateEventSheetOpen(false);
          }}
          onTaskCreated={() => {
            setCreateEventSheetOpen(false);
          }}
          onEventUpdated={() => {
            // Handle event update
          }}
          onTaskUpdated={() => {
            // Handle task update
          }}
          onEventDeleted={() => {
            // Handle event deletion
          }}
          onTaskDeleted={() => {
            // Handle task deletion
          }}
        />
      </div>
    );
  }

  // Desktop rendering with full CalendarPageWrapper
  return (
    <div className={cn("min-h-screen", className)}>
      {/* Desktop indicator */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              <Monitor className="w-4 h-4 mr-2" />
              Desktop Experience
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Full Features
            </Badge>
          </div>
          
          {onRefresh && (
            <TouchFeedback onPress={handleRefresh} hapticPattern="light">
              <Button variant="outline" size="sm" disabled={isLoading}>
                <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            </TouchFeedback>
          )}
        </div>
      </div>

      {/* Full desktop calendar */}
      <div className="p-6">
        <div className="mb-6">
          <CalendarControls
            currentDate={currentDate}
            viewType={viewType}
            onDateChange={onDateChange}
            onViewChange={onViewChange}
            stats={stats || { tasksThisWeek: 0, completedThisWeek: 0, totalPoints: 0, streakDays: 0, upcomingDeadlines: 0, familyEvents: 0, personalEvents: 0, achievementsThisMonth: 0 }}
            onCreateEvent={handleCreateEvent}
          />
        </div>
        
        <AppleCalendarView
          viewType={viewType}
          currentDate={currentDate}
          events={events}
          tasks={tasks}
          onDateSelect={handleDateSelect}
          onEventSelect={onEventSelect}
          onTaskSelect={onTaskSelect}
          onCreateEvent={handleCreateEvent}
          gamificationData={{
            dailyPoints: {},
            weeklyStreaks: {},
            monthlyAchievements: [],
            taskCompletionRates: {},
            familyActivityLevels: {}
          }}
        />
      </div>
    </div>
  );
} 