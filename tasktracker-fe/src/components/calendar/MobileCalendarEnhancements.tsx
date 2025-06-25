'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Calendar,
  Clock,
  List,
  Grid3X3,
  Plus,
  Settings,
  Zap,
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CalendarDays,
  Columns3,
  Square,
  AlignJustify
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useResponsive, useTouchOptimized, useResponsiveValue } from '@/lib/hooks/useResponsive';
import { useSwipeNavigation, triggerHapticFeedback } from '@/lib/hooks/useMobileGestures';

// ================================
// MOBILE CALENDAR ENHANCEMENT TYPES
// Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md Enterprise Standards
// ================================

// Import types from lib/types following enterprise file organization
import type {
  MobileCalendarEnhancementsProps,
  PullToRefreshProps,
  MobileGestureIndicatorProps,
  TouchFeedbackProps,
  MobileViewSwitcherProps,
  MobileNavigationBarProps,
  CalendarViewType,
  HapticPattern
} from '@/lib/types/mobile-responsive';

// ================================
// PULL-TO-REFRESH COMPONENT
// ================================

export function PullToRefresh({ 
  onRefresh, 
  isRefreshing = false, 
  threshold = 100, 
  children 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const responsive = useResponsive();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!responsive.isMobile) return;
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!responsive.isMobile || !isDragging) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startY;
    
    // Only allow pull down when at top of scroll
    const scrollTop = containerRef.current?.scrollTop || 0;
    if (scrollTop === 0 && deltaY > 0) {
      e.preventDefault();
      const distance = Math.min(deltaY * 0.5, threshold * 1.5);
      setPullDistance(distance);
      
      if (distance >= threshold && !isRefreshing) {
        triggerHapticFeedback('success');
      }
    }
  };

  const handleTouchEnd = () => {
    if (!responsive.isMobile) return;
    
    setIsDragging(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      onRefresh();
      triggerHapticFeedback('medium');
    }
    
    setPullDistance(0);
    setStartY(0);
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && responsive.isMobile && (
        <div 
          className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 flex flex-col items-center justify-center transition-all duration-200"
          style={{ 
            height: Math.max(pullDistance, isRefreshing ? 80 : 0),
            transform: `translateY(${isRefreshing ? 0 : -20}px)`
          }}
        >
          <div className="flex flex-col items-center gap-2 p-4">
            <div className={cn(
              "w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white transition-transform duration-200",
              isRefreshing ? "animate-spin" : pullDistance >= threshold ? "scale-110" : "scale-100"
            )}>
              <RefreshCw className="w-4 h-4" />
            </div>
            
            <div className="text-center">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
              </p>
              <Progress value={progress} className="w-20 h-1 mt-1" />
            </div>
          </div>
        </div>
      )}
      
      <div style={{ paddingTop: isRefreshing ? 80 : 0 }}>
        {children}
      </div>
    </div>
  );
}

// ================================
// MOBILE GESTURE INDICATOR
// ================================

export function MobileGestureIndicator({ direction, isActive, progress }: MobileGestureIndicatorProps) {
  const icons = {
    left: ArrowLeft,
    right: ArrowRight,
    up: ArrowUp,
    down: ArrowDown,
  };

  const Icon = icons[direction];
  const opacity = Math.min(progress / 50, 1);

  if (!isActive || progress < 10) return null;

  return (
    <div 
      className={cn(
        "fixed z-50 pointer-events-none transition-opacity duration-200",
        direction === 'left' && "left-4 top-1/2 -translate-y-1/2",
        direction === 'right' && "right-4 top-1/2 -translate-y-1/2",
        direction === 'up' && "top-4 left-1/2 -translate-x-1/2",
        direction === 'down' && "bottom-4 left-1/2 -translate-x-1/2"
      )}
      style={{ opacity }}
    >
      <div className="w-12 h-12 bg-blue-500/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-lg">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

// ================================
// TOUCH FEEDBACK WRAPPER
// ================================

export function TouchFeedback({ 
  children, 
  onPress, 
  onLongPress, 
  hapticPattern = 'light',
  className 
}: TouchFeedbackProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const responsive = useResponsive();
  const { touchClasses } = useTouchOptimized();

  const handleTouchStart = () => {
    if (!responsive.hasTouch) return;
    
    setIsPressed(true);
    
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        triggerHapticFeedback('medium');
        onLongPress();
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (!responsive.hasTouch) return;
    
    setIsPressed(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    if (onPress) {
      triggerHapticFeedback(hapticPattern);
      onPress();
    }
  };

  const handleTouchCancel = () => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div
      className={cn(
        "transition-transform duration-150",
        touchClasses,
        isPressed && responsive.hasTouch && "scale-95",
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={!responsive.hasTouch ? onPress : undefined}
    >
      {children}
    </div>
  );
}

// ================================
// MOBILE VIEW SWITCHER
// ================================

export function MobileViewSwitcher({ 
  currentView, 
  onViewChange,
  className
}: MobileViewSwitcherProps) {
  const responsive = useResponsive();
  
  if (!responsive.isMobile) return null;

  const views = [
    { 
      key: 'month' as const, 
      icon: CalendarDays,
      label: 'Month',
      description: 'Monthly overview with all days',
      gradient: 'from-blue-500 to-indigo-600'
    },
    { 
      key: 'week' as const, 
      icon: Columns3,
      label: 'Week',
      description: 'Weekly schedule view',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      key: 'day' as const, 
      icon: Square,
      label: 'Day',
      description: 'Detailed daily timeline',
      gradient: 'from-amber-500 to-orange-600'
    },
    { 
      key: 'list' as const, 
      icon: AlignJustify,
      label: 'List',
      description: 'Agenda list view',
      gradient: 'from-purple-500 to-violet-600'
    },
  ];

  return (
    <div className="relative bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-900/5">
      {/* Background indicator */}
      <div 
        className="absolute top-1.5 h-10 bg-white dark:bg-slate-700 rounded-xl shadow-md transition-all duration-300 ease-out border border-slate-200/50 dark:border-slate-600/50"
        style={{
          width: `calc(${100 / views.length}% - 6px)`,
          left: `calc(${views.findIndex(v => v.key === currentView) * (100 / views.length)}% + 6px)`,
        }}
      />
      
      <div className="relative flex gap-1">
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.key;
          
          return (
            <TouchFeedback
              key={view.key}
              onPress={() => onViewChange(view.key)}
              hapticPattern="light"
            >
              <button
                className={cn(
                  "relative flex-1 h-10 px-3 rounded-xl font-semibold text-xs transition-all duration-300 ease-out flex items-center justify-center gap-2 min-w-0 group",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  isActive 
                    ? "text-slate-900 dark:text-white z-10" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
                title={view.description}
              >
                {/* Icon with enhanced styling */}
                <div className={cn(
                  "relative flex items-center justify-center transition-all duration-300",
                  isActive && "transform"
                )}>
                  <Icon className={cn(
                    "w-4 h-4 transition-all duration-300",
                    isActive 
                      ? "text-slate-900 dark:text-white drop-shadow-sm" 
                      : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                  )} />
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className={cn(
                      "absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gradient-to-r shadow-sm animate-pulse",
                      view.gradient
                    )} />
                  )}
                </div>
                
                {/* Label with responsive visibility */}
                <span className={cn(
                  "hidden xs:block truncate transition-all duration-300 leading-none",
                  isActive 
                    ? "text-slate-900 dark:text-white font-bold" 
                    : "text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200"
                )}>
                  {view.label}
                </span>
                
                {/* Mobile-only icon indicator */}
                <span className="xs:hidden block">
                  {isActive && (
                    <div className={cn(
                      "w-1 h-1 rounded-full bg-gradient-to-r ml-1",
                      view.gradient
                    )} />
                  )}
                </span>
              </button>
            </TouchFeedback>
          );
        })}
      </div>
      
      {/* Subtle border accent */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 pointer-events-none" />
    </div>
  );
}

// ================================
// MOBILE NAVIGATION BAR
// ================================

export function MobileNavigationBar({
  currentDate,
  viewType,
  onDateChange,
  onCreateEvent,
  className
}: MobileNavigationBarProps) {
  const responsive = useResponsive();
  
  if (!responsive.isMobile) return null;

  const navigatePrevious = () => {
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
    }
    onDateChange(newDate);
  };

  const navigateNext = () => {
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
    }
    onDateChange(newDate);
  };

  const formatDateForView = () => {
    switch (viewType) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
      case 'week':
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          month: 'long', 
          day: 'numeric' 
        });
      default:
        return currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
    }
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-slate-900/10",
      "pb-safe-area-inset-bottom",
      className
    )}>
      {/* Enterprise Navigation Container */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Previous Button */}
          <TouchFeedback onPress={navigatePrevious} hapticPattern="light">
            <button className="group relative w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/5">
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </TouchFeedback>

          {/* Date Display */}
          <div className="flex-1 text-center px-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                {formatDateForView()}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
                {viewType} view
              </p>
            </div>
          </div>

          {/* Next Button */}
          <TouchFeedback onPress={navigateNext} hapticPattern="light">
            <button className="group relative w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/5">
              <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </TouchFeedback>
        </div>

        {/* Floating Action Button */}
        {onCreateEvent && (
          <div className="absolute -top-8 right-6">
            <TouchFeedback onPress={onCreateEvent} hapticPattern="medium">
              <button className="group relative w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl shadow-indigo-500/25">
                <Plus className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Pulse animation */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse opacity-75" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600" />
              </button>
            </TouchFeedback>
          </div>
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-safe-area-inset-bottom bg-white/50 dark:bg-slate-900/50" />
    </div>
  );
}

// ================================
// MAIN MOBILE CALENDAR ENHANCEMENTS
// ================================

export default function MobileCalendarEnhancements({
  currentDate,
  viewType,
  onDateChange,
  onViewChange,
  onRefresh,
  onCreateEvent,
  isLoading = false,
  className,
  children
}: MobileCalendarEnhancementsProps) {
  const responsive = useResponsive();
  const [gestureDirection, setGestureDirection] = useState<'left' | 'right' | null>(null);
  const [gestureProgress, setGestureProgress] = useState(0);

  // Swipe navigation setup
  const { gestureRef } = useSwipeNavigation(
    () => {
      // Swipe left - next period
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
      onDateChange(nextDate);
    },
    () => {
      // Swipe right - previous period
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
      onDateChange(prevDate);
    }
  );

  // Responsive padding
  const containerPadding = useResponsiveValue({
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }, 'p-2');

  if (!responsive.isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      {/* Mobile gesture indicators */}
      <MobileGestureIndicator 
        direction="left" 
        isActive={gestureDirection === 'left'} 
        progress={gestureProgress} 
      />
      <MobileGestureIndicator 
        direction="right" 
        isActive={gestureDirection === 'right'} 
        progress={gestureProgress} 
      />

      {/* Pull-to-refresh wrapper */}
      {onRefresh ? (
        <PullToRefresh onRefresh={onRefresh} isRefreshing={isLoading}>
          <div 
            ref={(el) => { gestureRef.current = el; }}
            className={cn("min-h-screen", containerPadding)}
          >
            {children}
          </div>
        </PullToRefresh>
      ) : (
        <div 
          ref={(el) => { gestureRef.current = el; }}
          className={cn("min-h-screen", containerPadding)}
        >
          {children}
        </div>
      )}

      {/* Mobile navigation bar */}
      <MobileNavigationBar
        currentDate={currentDate}
        viewType={viewType}
        onDateChange={onDateChange}
        onCreateEvent={onCreateEvent}
      />

      {/* Safe area spacing for mobile navigation */}
      <div className="h-20" />
    </div>
  );
} 