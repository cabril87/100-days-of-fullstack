'use client';

/*
 * Copyright (c) 2025 Carlos Abril Jr
 * All rights reserved.
 *
 * This source code is licensed under the Business Source License 1.1
 * found in the LICENSE file in the root directory of this source tree.
 *
 * This file may not be used, copied, modified, or distributed except in
 * accordance with the terms contained in the LICENSE file.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Target,
  BarChart3,
  History,
  Plus,
  Timer,
  Trophy,
  Zap,
  ChevronLeft,
  Play,
  Smartphone,
  Tablet,
  Monitor,
  TrendingUp,
  Clock,
  Activity
} from 'lucide-react';

import { toast } from 'sonner';

// Enterprise hooks and services following .cursorrules
import { useResponsive } from '@/lib/hooks/useResponsive';
import { useMobileGestures } from '@/lib/hooks/useMobileGestures';
import { useEnterpriseGamification } from '@/lib/hooks/useEnterpriseGamification';
import { useFocusSessionStore } from '@/lib/hooks/useFocusSessionStore';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useUserWithFamily } from '@/lib/hooks/useUserWithFamily';

// Enterprise components
import FocusSessionManager from '@/components/focus/FocusSessionManager';
import TaskSelectionModal from '@/components/focus/TaskSelectionModal';
import FocusAnalyticsView from '@/components/focus/FocusAnalyticsView';
import FocusHistoryManagement from '@/components/focus/FocusHistoryManagement';

// Enterprise types with explicit interfaces
import type {
  FocusSession,
  FocusSessionState,
  TaskItem,
  CreateFocusSessionDTO,
  FocusSessionStats
} from '@/lib/types/focus';
import type {
  ResponsiveFocusConfig,
  FocusGamificationTheme,
  FocusMetricCard,
  FocusTabConfig
} from '@/lib/types/focus-page';

// Enterprise services
import { focusService } from '@/lib/services/focusService';
import { taskService } from '@/lib/services/taskService';

// ============================================================================
// ENTERPRISE FOCUS CONFIGURATION
// ============================================================================

const FOCUS_TABS: FocusTabConfig[] = [
  {
    id: 'active',
    label: 'Active Session',
    description: 'Current focus session',
    icon: Play,
    requiresSession: false, // ✅ FIXED: Always allow access to start sessions
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Focus session insights',
    icon: BarChart3,
    requiresSession: false,
  },
  {
    id: 'history',
    label: 'History',
    description: 'Past focus sessions',
    icon: History,
    requiresSession: false,
  },
];

const RESPONSIVE_CONFIG: ResponsiveFocusConfig = {
  mobile: {
    timerSize: 'large',
    cardPadding: 'p-3',
    fontSize: 'text-sm',
    hideDetails: true,
    showCompactView: true,
  },
  tablet: {
    timerSize: 'extra-large',
    cardPadding: 'p-4',
    fontSize: 'text-base',
    hideDetails: false,
    showCompactView: false,
  },
  desktop: {
    timerSize: 'extra-large',
    cardPadding: 'p-6',
    fontSize: 'text-base',
    hideDetails: false,
    showCompactView: false,
  },
};

const GAMIFICATION_THEME: FocusGamificationTheme = {
  colors: {
    focus: '#8B5CF6',
    productivity: '#10B981',
    streak: '#F59E0B',
    achievement: '#3B82F6',
    celebration: '#EC4899',
  },
  animations: {
    sessionStart: 'animate-pulse',
    sessionComplete: 'animate-bounce',
    achievement: 'animate-ping',
    streak: 'animate-spin',
  },
  effects: {
    confetti: true,
    hapticFeedback: true,
    soundEffects: false,
    visualFeedback: true,
  },
};

// ✅ ENTERPRISE GAMIFICATION LEVELS - Following .cursorrules
const GAMIFICATION_LEVELS = {
  PLATINUM: {
    gradient: 'from-purple-400 via-purple-500 to-purple-600',
    glow: 'shadow-purple-500/25',
    animation: 'animate-pulse',
    threshold: 1000,
  },
  GOLD: {
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    glow: 'shadow-yellow-500/25',
    animation: 'animate-bounce',
    threshold: 500,
  },
  SILVER: {
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    glow: 'shadow-gray-400/25',
    animation: 'animate-ping',
    threshold: 200,
  },
  BRONZE: {
    gradient: 'from-orange-400 via-orange-500 to-orange-600',
    glow: 'shadow-orange-500/25',
    animation: 'animate-spin',
    threshold: 50,
  },
};

// ============================================================================
// ENTERPRISE FOCUS PAGE COMPONENT
// ============================================================================

export default function FocusPageClient() {
  // ============================================================================
  // AUTHENTICATION & RESPONSIVE STATE
  // ============================================================================

  const { user } = useAuth();
  const { selectedFamily } = useUserWithFamily();
  const responsive = useResponsive();

  // ============================================================================
  // PERSISTENT FOCUS SESSION STATE - ENTERPRISE STORE INTEGRATION
  // ============================================================================

  const {
    focusState,
    startSession
  } = useFocusSessionStore();

  // Local UI state (non-persistent)
  const [showTaskSelection, setShowTaskSelection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('active');
  const [celebrationActive, setCelebrationActive] = useState(false);
  const [focusStats, setFocusStats] = useState<FocusSessionStats | null>(null);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  // ============================================================================
  // ENTERPRISE GAMIFICATION INTEGRATION
  // ============================================================================

  const gamification = useEnterpriseGamification({
    userId: user?.id,
    familyId: selectedFamily?.id,
  });

  // ============================================================================
  // MOBILE GESTURE HANDLING
  // ============================================================================

  const handleTabSwipe = useCallback((direction: 'left' | 'right') => {
    const availableTabs = FOCUS_TABS.filter(tab =>
      !tab.requiresSession || focusState !== 'NO_SESSION'
    );
    const currentIndex = availableTabs.findIndex(tab => tab.id === activeTab);

    if (direction === 'left' && currentIndex < availableTabs.length - 1) {
      setActiveTab(availableTabs[currentIndex + 1].id);
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(availableTabs[currentIndex - 1].id);
    }
  }, [activeTab, focusState]);

  const {
    attachGestures,
  } = useMobileGestures({
    onSwipe: (gesture) => {
      if (gesture.direction === 'left') {
        handleTabSwipe('left');
      } else if (gesture.direction === 'right') {
        handleTabSwipe('right');
      }
    },

    onTap: () => {
      if (celebrationActive) {
        setCelebrationActive(false);
      }
    },
  });

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  // Real-time updates handled by gamification hooks

  // ============================================================================
  // RESPONSIVE CONFIGURATION
  // ============================================================================

  const config = useMemo((): ResponsiveFocusConfig[keyof ResponsiveFocusConfig] => {
    if (responsive.isMobile) return RESPONSIVE_CONFIG.mobile;
    if (responsive.isTablet) return RESPONSIVE_CONFIG.tablet;
    return RESPONSIVE_CONFIG.desktop;
  }, [responsive.isMobile, responsive.isTablet]);

  // ============================================================================
  // DATA LOADING EFFECTS
  // ============================================================================

  const loadFocusData = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const statsResult = await focusService.getUserFocusStats(user.id);
      setFocusStats(statsResult);

      // Load focus sessions for history management
      const sessionsResult = await focusService.getFocusHistory();
      setFocusSessions(sessionsResult);
    } catch (error) {
      console.error('Failed to load focus data:', error);
      toast.error('Failed to load focus data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadFocusData();
      // ✅ IMMEDIATE SESSION CHECK: Ensure session loads right away
      console.log('🎯 FocusPage: Initial load - checking for active session...');
    }
  }, [user?.id, loadFocusData]);

  const refreshFocusData = useCallback(async () => {
    await loadFocusData();
    await gamification.refreshAllData();
    toast.success('Focus data refreshed');
  }, [loadFocusData, gamification]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSessionStateChange = useCallback((state: FocusSessionState) => {
    console.log('🎯 Focus session state changed to:', state);

    if (state === 'IN_PROGRESS') {
      setActiveTab('active');
      if ('vibrate' in navigator) navigator.vibrate(10);
    }
  }, [setActiveTab]);

  const handleSessionComplete = useCallback(async (session: FocusSession) => {
    console.log('🎉 Focus session completed:', session);
    setCelebrationActive(true);
    if ('vibrate' in navigator) navigator.vibrate(25);

    toast.success(`🎉 Great focus session! You focused for ${session.durationMinutes} minutes.`, {
      duration: 5000,
    });

    // Refresh data after session completion
    await refreshFocusData();

    setTimeout(() => setCelebrationActive(false), 3000);
  }, [refreshFocusData]);

  const handleStartNewSession = useCallback(async () => {
    // Check if user has any tasks available first
    try {
      const availableTasks = await taskService.getRecentTasks(1);
      console.log('🔍 FocusPage: Checking available tasks:', availableTasks);

      if (availableTasks.length === 0) {
        toast.error('No tasks available for focus sessions', {
          description: 'Create a task first before starting a focus session.',
          action: {
            label: 'Go to Tasks',
            onClick: () => window.location.href = '/tasks'
          }
        });
        return;
      }

      setShowTaskSelection(true);
    } catch (error) {
      console.error('Error checking available tasks:', error);
      toast.error('Failed to check available tasks. Please try again.');
    }
  }, []);

  const handleTaskSelect = useCallback(async (task: TaskItem, createDto: CreateFocusSessionDTO) => {
    setIsLoading(true);
    try {
      console.log('🚀 Starting focus session for task:', task.title);
      console.log('📝 Session details:', createDto);

      // ✅ Start the session via the persistent store
      const createdSession = await focusService.startSession(createDto);
      console.log('✅ Session created successfully:', createdSession);

      // ✅ Update the persistent store with the new session
      if (user?.id) {
        await startSession(createdSession, String(user.id));
      }

      // ✅ Close modal and update UI state
      setShowTaskSelection(false);
      setActiveTab('active');

      // ✅ Refresh focus data to get latest session info
      await refreshFocusData();

      // ✅ Success feedback with session details
      toast.success(`🎯 Focus session started!`, {
        description: `Task: ${task.title}${createDto.notes ? ` | Notes: ${createDto.notes}` : ''} | Duration: ${createDto.durationMinutes}min`,
        duration: 4000,
      });

    } catch (error) {
      console.error('❌ Failed to start focus session:', error);
      toast.error('Failed to start focus session', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  }, [refreshFocusData, startSession, user?.id]);

  // ============================================================================
  // GAMIFICATION METRICS
  // ============================================================================

  const focusMetrics = useMemo((): FocusMetricCard[] => [
    {
      id: 'total-time',
      title: 'Total Focus Time',
      value: focusStats ? `${Math.round(focusStats.totalMinutes / 60)}h` : '0h',
      description: 'Hours focused this month',
      trend: 'up',
      icon: Clock,
      color: GAMIFICATION_THEME.colors.focus,
    },
    {
      id: 'sessions',
      title: 'Sessions',
      value: focusStats?.totalSessions || 0,
      description: 'Focus sessions completed',
      trend: 'up',
      icon: Target,
      color: GAMIFICATION_THEME.colors.productivity,
    },
    {
      id: 'streak',
      title: 'Focus Streak',
      value: `${focusStats?.currentStreak || 0} days`,
      description: 'Consecutive focus days',
      trend: focusStats?.currentStreak && focusStats.currentStreak > 0 ? 'up' : 'stable',
      icon: Zap,
      color: GAMIFICATION_THEME.colors.streak,
    },
    {
      id: 'achievements',
      title: 'Focus Achievements',
      value: gamification.familyProfile?.familyAchievements?.length || 0,
      description: 'Focus-related achievements',
      trend: 'up',
      icon: Trophy,
      color: GAMIFICATION_THEME.colors.achievement,
    },
  ], [focusStats, gamification.familyProfile?.familyAchievements]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getWelcomeMessage = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ready to focus?";
    if (hour < 17) return "Good afternoon! Time to get in the zone?";
    return "Good evening! Let's finish strong!";
  }, []);

  const getStateDescription = useCallback(() => {
    switch (focusState) {
      case 'NO_SESSION':
        return "Start a new focus session by selecting a task to work on.";
      case 'STARTING':
        return "Preparing your focus environment...";
      case 'IN_PROGRESS':
        return "You're in the zone! Stay focused on your current task.";
      case 'PAUSED':
        return "Session is paused. Take a break and resume when ready.";
      case 'COMPLETING':
        return "Wrapping up your session...";
      case 'ERROR':
        return "Something went wrong. Please try starting a new session.";
      default:
        return "Focus mode helps you stay productive and track your progress.";
    }
  }, [focusState]);

  const renderMobileHeader = () => (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center gap-3 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Focus Sessions</h1>
          <p className="text-xs text-muted-foreground">
            {getStateDescription()}
          </p>
        </div>
        <Badge variant={focusState === 'IN_PROGRESS' ? 'default' : 'secondary'} className="text-xs">
          {focusState === 'IN_PROGRESS' ? (
            <><Activity className="h-3 w-3 mr-1" />Active</>
          ) : (
            <><Timer className="h-3 w-3 mr-1" />Ready</>
          )}
        </Badge>
      </div>
    </div>
  );

  const renderDesktopHeader = () => (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Focus Sessions</h1>
          <p className="text-muted-foreground">
            {getWelcomeMessage()}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          {responsive.isMobile && <Smartphone className="h-3 w-3" />}
          {responsive.isTablet && <Tablet className="h-3 w-3" />}
          {responsive.isDesktop && <Monitor className="h-3 w-3" />}
          {responsive.breakpoint.toUpperCase()}
        </Badge>
        <Button variant="outline" size="sm" onClick={refreshFocusData}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );

  const renderMetricsOverview = () => {
    // ✅ ENTERPRISE GAMIFICATION: Calculate user level based on activity
    const getTotalMinutes = (): number => {
      const timeMetric = focusMetrics.find(m => m.id === 'total_time' || m.id === 'time');
      if (!timeMetric || typeof timeMetric.value !== 'number') return 0;
      return timeMetric.value;
    };

    const getUserLevel = (minutes: number) => {
      if (minutes >= GAMIFICATION_LEVELS.PLATINUM.threshold) return GAMIFICATION_LEVELS.PLATINUM;
      if (minutes >= GAMIFICATION_LEVELS.GOLD.threshold) return GAMIFICATION_LEVELS.GOLD;
      if (minutes >= GAMIFICATION_LEVELS.SILVER.threshold) return GAMIFICATION_LEVELS.SILVER;
      return GAMIFICATION_LEVELS.BRONZE;
    };

    const userLevel = getUserLevel(getTotalMinutes());
    const hasAchievements = focusMetrics.some(m => m.id === 'achievements' && typeof m.value === 'number' && m.value > 0);

    return (
      <div className="space-y-6 mb-6">
        {/* ✅ ENTERPRISE GAMIFICATION HEADER: Achievement Banner */}
        {hasAchievements && (
          <Card className={`bg-gradient-to-r ${userLevel.gradient} border-0 overflow-hidden relative shadow-2xl ${userLevel.glow}`}>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-white/20 rounded-full backdrop-blur-sm ${userLevel.animation}`}>
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold">🎉 Focus Champion!</h3>
                    <p className="text-white/90 text-sm">You&apos;re building amazing focus habits!</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white text-3xl font-bold">{getTotalMinutes()}m</div>
                  <div className="text-white/80 text-xs">Total Focus Time</div>
                </div>
              </div>

              {/* Achievement Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-white/90 text-xs mb-2">
                  <span>Progress to Next Level</span>
                  <span>{Math.min(Math.round((getTotalMinutes() / 500) * 100), 100)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((getTotalMinutes() / 500) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>

            {/* Celebration Particle Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-pulse" />

            {/* ✅ CELEBRATION SPARKLES */}
            <div className="absolute inset-0">
              <div className="absolute top-2 left-4 w-2 h-2 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
              <div className="absolute top-4 right-6 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '300ms' }} />
              <div className="absolute bottom-4 left-8 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '600ms' }} />
              <div className="absolute bottom-2 right-4 w-2 h-2 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '900ms' }} />
            </div>
          </Card>
        )}

        {/* ✅ ENTERPRISE GAMIFICATION METRICS: Enhanced with celebrations */}
        <div className={`${responsive.isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
          {responsive.isMobile ? (
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {focusMetrics.map((metric) => {
                const isHighPerformer = (typeof metric.value === 'number' && metric.value > 0) ||
                  (typeof metric.value === 'string' && metric.value !== '0' && metric.value !== '0m');
                const celebrationClass = isHighPerformer ? 'hover:scale-110 hover:rotate-1' : 'hover:scale-105';

                return (
                  <Card
                    key={metric.id}
                    className={`flex-shrink-0 w-44 snap-center transition-all duration-500 ${celebrationClass} cursor-pointer shadow-lg group active:scale-95 ${celebrationActive && metric.id === 'achievements'
                      ? `${GAMIFICATION_THEME.animations.achievement} border-2 shadow-xl border-yellow-400`
                      : 'border-0'
                      } ${isHighPerformer ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20' : ''}`}
                    onClick={() => {
                      if (metric.id === 'achievements' && typeof metric.value === 'number' && metric.value > 0) {
                        setCelebrationActive(true);
                        if ('vibrate' in navigator) navigator.vibrate(25);
                        setTimeout(() => setCelebrationActive(false), 2000);
                        toast.success(`🎉 ${metric.value} achievements unlocked! Amazing work!`, { duration: 4000 });
                      } else if (isHighPerformer) {
                        if ('vibrate' in navigator) navigator.vibrate(10);
                        toast.success(`🔥 Great ${metric.title.toLowerCase()}! Keep it up!`, { duration: 3000 });
                      } else {
                        toast.info(`${metric.title}: Start your focus journey!`);
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg transition-transform duration-300 ${isHighPerformer ? 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-800/30 dark:to-blue-800/30 group-hover:scale-110' : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                          <metric.icon className={`h-5 w-5 ${isHighPerformer ? 'text-purple-600 dark:text-purple-400' : ''}`} style={!isHighPerformer ? { color: metric.color } : {}} />
                        </div>
                        <div className="flex items-center gap-1">
                          {metric.trend === 'up' && (
                            <TrendingUp className={`h-3 w-3 text-green-500 ${isHighPerformer ? 'animate-bounce' : ''}`} />
                          )}
                          {/* ✅ ACHIEVEMENT INDICATOR */}
                          {isHighPerformer && (
                            <div className="relative">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                              <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {metric.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 relative">
                      <div className={`text-lg font-bold transition-colors duration-300 ${isHighPerformer ? 'text-purple-700 dark:text-purple-300' : ''
                        }`} style={!isHighPerformer ? { color: metric.color } : {}}>
                        {metric.value}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {metric.description}
                      </p>

                      {/* ✅ CELEBRATION SPARKLES FOR MOBILE */}
                      {isHighPerformer && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                          <div className="absolute top-1 left-1 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
                          <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
                          <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '400ms' }} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            focusMetrics.map((metric) => {
              const isHighPerformer = (typeof metric.value === 'number' && metric.value > 0) ||
                (typeof metric.value === 'string' && metric.value !== '0' && metric.value !== '0m');
              const celebrationClass = isHighPerformer ? 'hover:scale-105 hover:shadow-xl' : 'hover:scale-102 hover:shadow-lg';

              return (
                <Card
                  key={metric.id}
                  className={`transition-all duration-500 ${celebrationClass} cursor-pointer group active:scale-95 ${celebrationActive && metric.id === 'achievements'
                    ? `${GAMIFICATION_THEME.animations.sessionComplete} border-2 shadow-xl border-yellow-400`
                    : 'border-0'
                    } ${isHighPerformer ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 shadow-lg' : 'shadow-md'}`}
                  onClick={() => {
                    if (metric.id === 'achievements' && typeof metric.value === 'number' && metric.value > 0) {
                      setCelebrationActive(true);
                      if ('vibrate' in navigator) navigator.vibrate(25);
                      setTimeout(() => setCelebrationActive(false), 2000);
                      toast.success(`🎉 ${metric.value} achievements unlocked! You're a focus champion!`, { duration: 4000 });
                    } else if (isHighPerformer) {
                      if ('vibrate' in navigator) navigator.vibrate(10);
                      toast.success(`🔥 Excellent ${metric.title.toLowerCase()}! Keep the momentum going!`, { duration: 3000 });
                    } else {
                      toast.info(`${metric.title}: Ready to start your focus journey!`);
                    }
                  }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg transition-transform duration-300 ${isHighPerformer ? 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-800/30 dark:to-blue-800/30 group-hover:scale-110' : 'bg-gray-100/50 dark:bg-gray-800/50'
                        }`}>
                        <metric.icon className={`h-4 w-4 ${isHighPerformer ? 'text-purple-600 dark:text-purple-400' : ''}`} style={!isHighPerformer ? { color: metric.color } : {}} />
                      </div>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' && (
                          <TrendingUp className={`h-3 w-3 text-green-500 ${isHighPerformer ? 'animate-bounce' : ''}`} />
                        )}
                        {/* ✅ ACHIEVEMENT INDICATOR */}
                        {isHighPerformer && (
                          <div className="relative">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                            <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className={`text-2xl font-bold transition-colors duration-300 ${isHighPerformer ? 'text-purple-700 dark:text-purple-300' : ''
                      }`} style={!isHighPerformer ? { color: metric.color } : {}}>
                      {metric.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </p>

                    {/* ✅ CELEBRATION SPARKLES FOR DESKTOP */}
                    {isHighPerformer && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute top-2 left-2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
                        <div className="absolute top-4 right-3 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
                        <div className="absolute bottom-4 left-4 w-0.5 h-0.5 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '400ms' }} />
                        <div className="absolute bottom-2 right-2 w-1 h-1 bg-blue-500 rounded-full animate-ping" style={{ animationDelay: '600ms' }} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Please log in to access focus sessions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={(element) => { if (element) attachGestures(element); }}
      className={`min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 ${responsive.isMobile ? 'select-none' : ''
        }`}
    >
      {/* Pull-to-Refresh Indicator */}
      {responsive.isMobile && false && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-primary/10 backdrop-blur-sm"
          style={{
            height: `${Math.min(0 * 100, 100)}px`,
            opacity: Math.min(0, 1),
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className={`text-primary ${false ? 'animate-spin' : 'animate-pulse'
              }`}>
              🔄
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {responsive.isMobile ? renderMobileHeader() : null}

      <div className={`container mx-auto ${config.cardPadding} max-w-6xl space-y-6`}>
        {/* Desktop Header */}
        {!responsive.isMobile ? renderDesktopHeader() : null}

        {/* Metrics Overview */}
        {renderMetricsOverview()}

        {/* ✅ ENTERPRISE GAMIFICATION TABS: Enhanced with celebrations */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${responsive.isMobile ? 'grid-cols-3' : 'grid-cols-3'
            } ${config.cardPadding} bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border-0 shadow-lg p-1`}>
            {FOCUS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const hasProgress = (tab.id === 'active' && focusState !== 'NO_SESSION') ||
                (tab.id === 'analytics' && focusMetrics.some(m => typeof m.value === 'number' && m.value > 0)) ||
                (tab.id === 'history' && focusMetrics.some(m => m.id === 'sessions' && typeof m.value === 'number' && m.value > 0));

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`flex items-center gap-2 transition-all duration-500 relative overflow-hidden group
                    ${isActive
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-xl scale-105 border-0'
                      : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 hover:scale-102 border-0'
                    }
                    ${hasProgress ? 'ring-2 ring-yellow-400/50 ring-offset-1' : ''}
                    active:scale-95 min-h-[44px] rounded-lg shadow-md hover:shadow-lg
                  `}
                  disabled={tab.requiresSession && focusState === 'NO_SESSION'}
                  onClick={() => {
                    if (GAMIFICATION_THEME.effects.hapticFeedback && responsive.isMobile) {
                      if ('vibrate' in navigator) navigator.vibrate(10);
                    }

                    // ✅ GAMIFICATION CELEBRATION: Tab interactions
                    if (hasProgress) {
                      toast.success(`🎉 Great progress in ${tab.label}!`, { duration: 2000 });
                    }
                  }}
                >
                  {/* ✅ TAB ICON: Enhanced with progress indicators */}
                  <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    <tab.icon className={`h-4 w-4 ${isActive
                      ? 'text-white drop-shadow-sm'
                      : hasProgress
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400'
                      }`} />

                    {/* ✅ PROGRESS INDICATOR */}
                    {hasProgress && !isActive && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* ✅ TAB LABEL: Responsive with achievements */}
                  {(!responsive.isMobile || responsive.width > responsive.height) && (
                    <span className={`font-medium transition-colors duration-300 ${isActive
                      ? 'text-white drop-shadow-sm'
                      : hasProgress
                        ? 'text-purple-700 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {tab.label}
                    </span>
                  )}

                  {/* ✅ ACTIVE TAB SHINE EFFECT */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-lg" />
                  )}

                  {/* ✅ CELEBRATION SPARKLES */}
                  {hasProgress && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
                      <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '300ms' }} />
                      <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '600ms' }} />
                    </div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Active Session Tab */}
          <TabsContent value="active" className="space-y-6">
            <FocusSessionManager
              userId={user?.id}
              showTaskDetails={true}
              showStreakCounter={true}
              showKeyboardHelp={!responsive.isMobile}
              onSessionStateChange={handleSessionStateChange}
              onSessionComplete={handleSessionComplete}
              className="h-fit"
            />

            {/* ✅ ENTERPRISE GAMIFICATION QUICK ACTIONS: Enhanced with celebrations */}
            {focusState === 'NO_SESSION' && (
              <Card className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-900/10 dark:via-blue-900/10 dark:to-purple-900/10 border-0 shadow-xl overflow-hidden relative">
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg animate-pulse">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">
                      🚀 Ready to Focus?
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Start your focused work session and unlock achievements!
                  </p>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className={`${responsive.isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4'}`}>
                    <Button
                      onClick={handleStartNewSession}
                      className="bg-gradient-to-r from-green-500 via-green-600 to-blue-600 hover:from-green-600 hover:via-green-700 hover:to-blue-700 justify-start shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 active:scale-95 group border-0"
                      disabled={isLoading}
                      size={responsive.isMobile ? 'lg' : 'default'}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-white/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-white font-medium">Select Task & Start</div>
                          <div className="text-white/80 text-xs">+10 XP per session</div>
                        </div>
                      </div>

                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-lg" />
                    </Button>

                    <Button
                      variant="outline"
                      className="justify-start bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 group"
                      onClick={() => {
                        if ('vibrate' in navigator) navigator.vibrate(10);
                        toast.info('🍅 Pomodoro Timer: Available during active sessions!', { duration: 3000 });
                      }}
                      size={responsive.isMobile ? 'lg' : 'default'}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-purple-100 dark:bg-purple-800 rounded-full group-hover:scale-110 transition-transform duration-300">
                          <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-left">
                          <div className="text-purple-700 dark:text-purple-300 font-medium">Quick Pomodoro</div>
                          <div className="text-purple-600/70 dark:text-purple-400/70 text-xs">25min focused work</div>
                        </div>
                      </div>
                    </Button>
                  </div>

                  {/* ✅ MOTIVATION SECTION */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-yellow-600 animate-bounce" />
                      <span className="text-yellow-800 dark:text-yellow-200 font-medium text-sm">Today&apos;s Goals</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                        <div className="text-yellow-700 dark:text-yellow-300 font-bold">1 Session</div>
                        <div className="text-yellow-600/70 dark:text-yellow-400/70">Starter 🌱</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                        <div className="text-orange-700 dark:text-orange-300 font-bold">3 Sessions</div>
                        <div className="text-orange-600/70 dark:text-orange-400/70">Focused 🔥</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                        <div className="text-purple-700 dark:text-purple-300 font-bold">5 Sessions</div>
                        <div className="text-purple-600/70 dark:text-purple-400/70">Master 👑</div>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Background celebration effects */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
                  <div className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '500ms' }} />
                  <div className="absolute bottom-8 left-8 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1000ms' }} />
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1500ms' }} />
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <FocusAnalyticsView
              userId={user?.id || 0}
              className="w-full"
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <FocusHistoryManagement
              userId={user?.id || 0}
              className="w-full"
              sessions={focusSessions}
              onSessionsChange={(updatedSessions) => {
                console.log('📚 FocusPage: Sessions updated:', updatedSessions);
                setFocusSessions(updatedSessions);
                toast.success(`Session history updated: ${updatedSessions.length} sessions`);
              }}
              showExportOptions={true}
              showBulkOperations={true}
            />
          </TabsContent>
        </Tabs>

        {/* ✅ ENTERPRISE GAMIFICATION MOBILE NAVIGATION: Enhanced with celebrations */}
        {responsive.isMobile && (
          <div className="flex justify-center py-4">
            <div className={`flex items-center gap-3 text-xs transition-all duration-500 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg border border-purple-200/50 dark:border-purple-700/50 ${false ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800/30 dark:to-blue-800/30 scale-110 shadow-xl' : 'hover:scale-105'
              }`}>
              <div className="flex gap-2">
                {FOCUS_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const hasProgress = (tab.id === 'active' && focusState !== 'NO_SESSION') ||
                    (tab.id === 'analytics' && focusMetrics.some(m => typeof m.value === 'number' && m.value > 0)) ||
                    (tab.id === 'history' && focusMetrics.some(m => m.id === 'sessions' && typeof m.value === 'number' && m.value > 0));

                  return (
                    <div
                      key={tab.id}
                      className={`h-2 w-8 rounded-full transition-all duration-500 relative overflow-hidden ${isActive
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg scale-110'
                        : hasProgress
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-md'
                          : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    >
                      {/* ✅ PROGRESS GLOW EFFECT */}
                      {(isActive || hasProgress) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-pulse" />
                      )}

                      {/* ✅ ACHIEVEMENT INDICATOR */}
                      {hasProgress && !isActive && (
                        <div className="absolute -top-0.5 -right-0.5">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <div className={`transition-all duration-300 ${false ? 'scale-125' : 'scale-100'}`}>
                  <span className={`${false
                    ? 'animate-bounce text-purple-600 dark:text-purple-400'
                    : 'animate-pulse text-blue-600 dark:text-blue-400'
                    }`}>
                    {false ? '✨' : '👆'}
                  </span>
                </div>
                <span className={`font-medium transition-colors duration-300 ${false
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-blue-700 dark:text-blue-300'
                  }`}>
                  {false ? 'Swiping...' : 'Swipe to navigate'}
                </span>
              </div>

              {/* ✅ CELEBRATION SPARKLES */}
              {false && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }} />
                  <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }} />
                  <div className="absolute bottom-1 left-4 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '400ms' }} />
                  <div className="absolute bottom-2 right-4 w-0.5 h-0.5 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '600ms' }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task Selection Modal */}
      {showTaskSelection && (
        <TaskSelectionModal
          open={showTaskSelection}
          onOpenChange={setShowTaskSelection}
          onTaskSelect={handleTaskSelect}
          userId={user?.id}
        />
      )}
    </div>
  );
} 
