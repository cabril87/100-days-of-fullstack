'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  CalendarDays,
  Clock,
  List,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Trophy,
  Target,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useResponsive, useTouchOptimized } from '@/lib/hooks/useResponsive';
import { triggerHapticFeedback } from '@/lib/hooks/useMobileGestures';
import type { CalendarStatsDTO } from '@/lib/types/calendar';

export type CalendarViewType = 'month' | 'week' | 'day' | 'list';

interface CalendarControlsProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarViewType) => void;
  stats: CalendarStatsDTO;
  onCreateEvent?: () => void;
  onFilterToggle?: () => void;
  onSearch?: () => void;
  className?: string;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentDate,
  viewType,
  onDateChange,
  onViewChange,
  stats,
  onCreateEvent,
  onFilterToggle,
  onSearch,
  className
}) => {

  // ============================================================================
  // ENTERPRISE RESPONSIVE SYSTEM
  // ============================================================================
  
  const responsive = useResponsive();
  const { touchClasses, buttonSize } = useTouchOptimized();

  // Navigation helpers
  const navigatePrevious = () => {
    if (responsive.hasTouch) {
      triggerHapticFeedback('light');
    }
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'list':
        newDate.setDate(newDate.getDate() - 7);
        break;
    }
    onDateChange(newDate);
  };

  const navigateNext = () => {
    if (responsive.hasTouch) {
      triggerHapticFeedback('light');
    }
    const newDate = new Date(currentDate);
    switch (viewType) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'list':
        newDate.setDate(newDate.getDate() + 7);
        break;
    }
    onDateChange(newDate);
  };

  const goToToday = () => {
    if (responsive.hasTouch) {
      triggerHapticFeedback('medium');
    }
    onDateChange(new Date());
  };

  // View configurations
  const viewConfigs = {
    month: {
      icon: Calendar,
      label: 'Month',
      color: 'from-blue-500 to-cyan-500',
      description: 'Monthly overview'
    },
    week: {
      icon: CalendarDays,
      label: 'Week',
      color: 'from-indigo-500 to-purple-500',
      description: 'Weekly schedule'
    },
    day: {
      icon: Clock,
      label: 'Day',
      color: 'from-emerald-500 to-teal-500',
      description: 'Daily timeline'
    },
    list: {
      icon: List,
      label: 'List',
      color: 'from-rose-500 to-pink-500',
      description: 'All items'
    }
  };

  // Format current date display
  const formatCurrentDate = () => {
    switch (viewType) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'list':
        return 'All Calendar Items';
      default:
        return currentDate.toLocaleDateString();
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-700/50", className)}>
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Main Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            {/* Left: Title, Date & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 lg:gap-6 min-w-0 flex-1">
              {/* Calendar Icon & Title */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br transition-all duration-300",
                  viewConfigs[viewType].color
                )}>
                  {React.createElement(viewConfigs[viewType].icon, { className: "h-5 w-5 sm:h-6 sm:w-6" })}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrentDate()}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {viewConfigs[viewType].description}
                  </p>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigatePrevious}
                  className={cn(
                    "h-10 w-10 p-0 rounded-xl border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:shadow-md transition-all duration-200 hover:scale-105",
                    touchClasses,
                    buttonSize
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateNext}
                  className="h-10 w-10 p-0 rounded-xl border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className="hidden sm:flex px-4 py-2 rounded-xl border-gray-200/60 dark:border-gray-700/60 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 hover:border-blue-200/60 dark:hover:border-blue-700/60 transition-all duration-200 font-medium hover:shadow-md"
                >
                  Today
                </Button>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{stats.totalPoints || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 font-medium">XP Points</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{stats.completedThisWeek || 0}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 font-medium">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: View Selector and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            {/* View Selector - Mobile Optimized */}
            <div className="flex bg-gray-100/80 dark:bg-gray-800/80 rounded-xl p-1 sm:p-1.5 gap-0.5 sm:gap-1 shadow-sm border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-sm overflow-x-auto">
              {Object.entries(viewConfigs).map(([view, config]) => {
                const Icon = config.icon;
                const isActive = viewType === view;
                
                return (
                  <Button
                    key={view}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewChange(view as CalendarViewType)}
                    className={cn(
                      "h-8 sm:h-9 px-2 sm:px-3 lg:px-4 transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm flex-shrink-0 min-w-0",
                      {
                        [`bg-gradient-to-r ${config.color} text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]`]: isActive,
                        "hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white": !isActive
                      }
                    )}
                    title={config.description}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline ml-1.5 lg:ml-2">{config.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
              {/* Search */}
              {onSearch && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSearch}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg sm:rounded-xl border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:shadow-md transition-all duration-200 hover:scale-105 flex-shrink-0"
                  title="Search"
                >
                  <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}

              {/* Filter */}
              {onFilterToggle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFilterToggle}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 rounded-lg sm:rounded-xl border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:shadow-md transition-all duration-200 hover:scale-105 flex-shrink-0"
                  title="Filter"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}

              {/* Create Event */}
              {onCreateEvent && (
                <Button
                  size="sm"
                  onClick={() => onCreateEvent()}
                  className="h-8 sm:h-10 px-2 sm:px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg sm:rounded-xl font-medium transform hover:scale-[1.02] flex-shrink-0"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline ml-1.5 sm:ml-2">New Event</span>
                  <span className="sm:hidden ml-1">New</span>
                </Button>
              )}

              {/* More Options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-xl border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
                  <DropdownMenuItem onClick={goToToday} className="sm:hidden rounded-lg">
                    <Calendar className="h-4 w-4 mr-3" />
                    Go to Today
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                  <DropdownMenuItem className="rounded-lg">
                    <Download className="h-4 w-4 mr-3" />
                    Export Calendar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">
                    <Upload className="h-4 w-4 mr-3" />
                    Import Events
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg">
                    <Trophy className="h-4 w-4 mr-3" />
                    View Achievements
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">
                    <Target className="h-4 w-4 mr-3" />
                    Calendar Stats
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg">
                    <Settings className="h-4 w-4 mr-3" />
                    Calendar Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile-only Today Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="sm:hidden w-full justify-center py-3 rounded-xl border-gray-200/60 dark:border-gray-700/60 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 hover:border-blue-200/60 dark:hover:border-blue-700/60 transition-all duration-200 font-medium"
          >
            Go to Today
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarControls; 