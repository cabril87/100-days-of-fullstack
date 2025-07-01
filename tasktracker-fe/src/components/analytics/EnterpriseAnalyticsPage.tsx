'use client';

import { Suspense, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Users,
  Shield,
  TrendingUp,
  Calendar,
  Star,
  Zap,
  Crown,
  Trophy,
  Medal,
  ChevronLeft,
  Settings,
  Download,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

// Enterprise imports following checklist rules
import { useResponsive } from '@/lib/hooks/useResponsive';
import { useMobileGestures } from '@/lib/hooks/useMobileGestures';
import { useEnterpriseGamification } from '@/lib/hooks/useEnterpriseGamification';
import { useAnalyticsParams } from '@/lib/hooks/useAnalyticsParams';
import { useUserWithFamily } from '@/lib/hooks/useUserWithFamily';
import type {
  AnalyticsTab,
  AnalyticsTabConfig,
  ResponsiveAnalyticsConfig,
  AnalyticsMetricCard,
  GamificationTheme
} from '@/lib/types/analytics-page';
import type { EnterpriseAnalyticsPageProps } from '@/lib/types/analytics-components';

// Import existing components
import { AnalyticsDashboardWrapper } from './AnalyticsDashboardWrapper';

// ============================================================================
// ENTERPRISE ANALYTICS CONFIGURATION
// ============================================================================

const ANALYTICS_TABS: AnalyticsTabConfig[] = [
  {
    id: 'personal',
    label: 'Personal',
    description: 'Your productivity insights',
    icon: User,
    requiresRole: undefined,
    requiresFamily: false,
  },
  {
    id: 'family',
    label: 'Family',
    description: 'Family collaboration analytics',
    icon: Users,
    requiresRole: undefined,
    requiresFamily: true,
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Platform administration',
    icon: Shield,
    requiresRole: ['Admin'],
    requiresFamily: false,
  },
];

const RESPONSIVE_CONFIG: ResponsiveAnalyticsConfig = {
  mobile: {
    chartHeight: 200,
    cardPadding: 'p-3',
    fontSize: 'text-sm',
    hideDetails: true,
  },
  tablet: {
    chartHeight: 300,
    cardPadding: 'p-4',
    fontSize: 'text-base',
    hideDetails: false,
  },
  desktop: {
    chartHeight: 400,
    cardPadding: 'p-6',
    fontSize: 'text-base',
    hideDetails: false,
  },
};

// Enterprise Gamification Theme
const GAMIFICATION_THEME: GamificationTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    achievement: '#8B5CF6',
    badge: '#EC4899',
    points: '#F59E0B',
    streak: '#EF4444',
  },
  animations: {
    celebration: 'animate-bounce',
    pointsGain: 'animate-pulse',
    levelUp: 'animate-spin',
    achievement: 'animate-ping',
  },
  effects: {
    confetti: true,
    sparkles: true,
    hapticFeedback: true,
    soundEffects: false, // Disabled by default for analytics
  },
};

// ============================================================================
// ENTERPRISE ANALYTICS PAGE COMPONENT
// ============================================================================

export function EnterpriseAnalyticsPage({
  className = '',
  initialTab = 'personal',
  timeRange: initialTimeRange = 'month',
  familyId: propFamilyId
}: EnterpriseAnalyticsPageProps) {
  const router = useRouter();
  const responsive = useResponsive();
  const { user, selectedFamily } = useUserWithFamily();
  const {
    currentTab: urlTab,
    timeRange: urlTimeRange,
    setTab,
    setTimeRange,
    isTabActive
  } = useAnalyticsParams();

  // Mobile-specific state
  const [celebrationActive, setCelebrationActive] = useState(false);

  // Use props to override URL parameters when provided
  const currentTab = initialTab || urlTab;
  const timeRange = initialTimeRange || urlTimeRange;
  const familyId = propFamilyId || selectedFamily?.id;

  // Filter available tabs based on user permissions (moved up for dependency)
  const availableTabs = useMemo(() => {
    return ANALYTICS_TABS.filter(tab => {
      // Check role requirements
      if (tab.requiresRole && tab.requiresRole.length > 0) {
        return tab.requiresRole.includes(user?.role || '');
      }

      // Check family requirements
      if (tab.requiresFamily && !selectedFamily) {
        return false;
      }

      return true;
    });
  }, [user?.role, selectedFamily]);

  // Mobile gesture handlers
  const handleTabSwipe = useCallback((direction: 'left' | 'right') => {
    const currentIndex = availableTabs.findIndex(tab => tab.id === currentTab);
    if (direction === 'left' && currentIndex < availableTabs.length - 1) {
      setTab(availableTabs[currentIndex + 1].id);
    } else if (direction === 'right' && currentIndex > 0) {
      setTab(availableTabs[currentIndex - 1].id);
    }
  }, [currentTab, setTab, availableTabs]);

  // Enterprise mobile gestures
  const {
    attachGestures,
    isGestureActive,
    isPullRefreshActive,
    pullRefreshProgress,
    triggerHaptic,
  } = useMobileGestures({
    onSwipe: (gesture) => {
      if (gesture.direction === 'left') {
        handleTabSwipe('left');
      } else if (gesture.direction === 'right') {
        handleTabSwipe('right');
      }
    },
    onPullRefresh: () => {
      console.log('🔄 Pull to refresh analytics');
      window.location.reload();
    },
    onTap: () => {
      if (celebrationActive) {
        setCelebrationActive(false);
      }
    },
  }, {
    swipe: {
      threshold: 50,
      enabled: responsive.isMobile,
    },
    pullRefresh: {
      threshold: 100,
      enabled: responsive.isMobile,
    },
  });

  // Enterprise gamification
  const gamification = useEnterpriseGamification({
    userId: user?.id,
    familyId: familyId,
  });

  // Responsive configuration
  const config = useMemo((): ResponsiveAnalyticsConfig[keyof ResponsiveAnalyticsConfig] => {
    if (responsive.isMobile) return RESPONSIVE_CONFIG.mobile;
    if (responsive.isTablet) return RESPONSIVE_CONFIG.tablet;
    return RESPONSIVE_CONFIG.desktop;
  }, [responsive.isMobile, responsive.isTablet]);



  // Gamification metrics for display
  const gamificationMetrics = useMemo((): AnalyticsMetricCard[] => [
    {
      id: 'points',
      title: 'Total Points',
      value: gamification.familyProfile?.totalFamilyPoints || 0,
      description: 'Gamification points earned',
      trend: 'up',
      icon: Star,
      gamificationLevel: 'gold',
      isAchievement: false,
    },
    {
      id: 'level',
      title: 'Family Level',
      value: gamification.familyProfile?.familyLevel || 1,
      description: 'Current family level',
      trend: 'up',
      icon: Crown,
      gamificationLevel: 'platinum',
      isAchievement: false,
    },
    {
      id: 'achievements',
      title: 'Achievements',
      value: gamification.familyProfile?.familyAchievements?.length || 0,
      description: 'Unlocked achievements',
      trend: 'stable',
      icon: Trophy,
      gamificationLevel: 'silver',
      isAchievement: true,
    },
    {
      id: 'streak',
      title: 'Current Streak',
      value: `${gamification.familyProfile?.familyStreak || 0} days`,
      description: 'Consecutive active days',
      trend: 'up',
      icon: Zap,
      gamificationLevel: 'bronze',
      isAchievement: false,
    },
  ], [gamification.familyProfile]);

  return (
    <div
      ref={attachGestures}
      className={`min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 ${className} ${
        isGestureActive && responsive.isMobile ? 'select-none' : ''
      }`}
    >
      {/* Pull-to-Refresh Indicator */}
      {responsive.isMobile && isPullRefreshActive && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-primary/10 backdrop-blur-sm"
          style={{ 
            height: `${Math.min(pullRefreshProgress * 100, 100)}px`,
            opacity: Math.min(pullRefreshProgress, 1),
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className={`text-primary ${
              pullRefreshProgress >= 1 ? 'animate-spin' : 'animate-pulse'
            }`}>
              🔄
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {responsive.isMobile && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Analytics</h1>
              <p className="text-xs text-muted-foreground">
                {availableTabs.find(tab => tab.id === currentTab)?.description}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className={`container mx-auto ${config.cardPadding} space-y-6`}>
        {/* Desktop Header */}
        {!responsive.isMobile && (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into your productivity and achievements
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {responsive.isMobile && <Smartphone className="h-3 w-3" />}
                {responsive.isTablet && <Tablet className="h-3 w-3" />}
                {responsive.isDesktop && <Monitor className="h-3 w-3" />}
                {responsive.breakpoint.toUpperCase()}
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        )}

        {/* Gamification Overview - Desktop */}
        {!responsive.isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gamificationMetrics.map((metric) => (
              <Card
                key={metric.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${metric.isAchievement ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-background' : ''
                  }`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className={`${config.fontSize} font-medium`}>
                    {metric.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <metric.icon className={`h-4 w-4 ${metric.gamificationLevel === 'platinum' ? 'text-purple-500' :
                        metric.gamificationLevel === 'gold' ? 'text-yellow-500' :
                          metric.gamificationLevel === 'silver' ? 'text-gray-400' :
                            'text-orange-600'
                      }`} />
                    {metric.isAchievement && (
                      <Badge variant="secondary" className="text-xs">
                        <Medal className="h-3 w-3 mr-1" />
                        Achievement
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metric.description}
                  </p>
                  <div className={`mt-2 flex items-center gap-1 ${config.fontSize}`}>
                    <TrendingUp className={`h-3 w-3 ${metric.trend === 'up' ? 'text-green-500' :
                        metric.trend === 'down' ? 'text-red-500' :
                          'text-gray-500'
                      }`} />
                    <span className={`${config.fontSize} ${metric.trend === 'up' ? 'text-green-600' :
                        metric.trend === 'down' ? 'text-red-600' :
                          'text-gray-600'
                      }`}>
                      {metric.trend === 'up' ? 'Trending up' :
                        metric.trend === 'down' ? 'Trending down' :
                          'Stable'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mobile Gamification Cards - Horizontal Scroll */}
        {responsive.isMobile && (
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {gamificationMetrics.map((metric) => (
                <Card
                  key={metric.id}
                  className={`flex-shrink-0 w-40 snap-center relative overflow-hidden transition-all duration-300 ${metric.isAchievement ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-background' : ''
                    } ${celebrationActive && metric.isAchievement
                      ? `${GAMIFICATION_THEME.animations.celebration} border-2 border-yellow-400 shadow-lg`
                      : ''
                    }`}
                  onClick={() => {
                    if (metric.isAchievement) {
                      setCelebrationActive(true);
                      triggerHaptic('success');
                      setTimeout(() => setCelebrationActive(false), 2000);
                    }
                  }}
                >
                  {metric.isAchievement && celebrationActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 animate-pulse pointer-events-none" />
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <metric.icon className={`h-5 w-5 ${metric.gamificationLevel === 'platinum' ? 'text-purple-500' :
                          metric.gamificationLevel === 'gold' ? 'text-yellow-500' :
                            metric.gamificationLevel === 'silver' ? 'text-gray-400' :
                              'text-orange-600'
                        } ${metric.isAchievement && celebrationActive
                          ? GAMIFICATION_THEME.animations.achievement
                          : ''
                        }`} />
                      {metric.isAchievement && (
                        <div className="text-xs text-yellow-600">🏆</div>
                      )}
                    </div>
                    <CardTitle className="text-sm font-medium">
                      {metric.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={`text-lg font-bold ${metric.isAchievement && celebrationActive
                        ? `${GAMIFICATION_THEME.animations.pointsGain} text-yellow-600`
                        : ''
                      }`}>
                      {metric.value}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <div className="flex gap-1">
                {gamificationMetrics.map((metric) => (
                  <div key={metric.id} className="h-1 w-1 rounded-full bg-muted" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Analytics Tabs */}
        <Tabs value={currentTab} onValueChange={(value) => setTab(value as AnalyticsTab)}>
          <TabsList className={`grid w-full ${responsive.isMobile ? 'grid-cols-2' : `grid-cols-${availableTabs.length}`
            } ${responsive.isMobile ? 'p-1' : 'p-1'}`}>
            {availableTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex items-center gap-2 transition-all duration-300 ${isTabActive(tab.id) && responsive.isMobile
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                    : ''
                  } ${responsive.isMobile ? 'relative overflow-hidden' : ''
                  }`}
                disabled={tab.requiresFamily && !selectedFamily}
                                 onClick={() => {
                   if (GAMIFICATION_THEME.effects.hapticFeedback && responsive.isMobile) {
                     // Trigger haptic feedback on tab switch
                     triggerHaptic('light');
                   }
                 }}
              >
                {/* Enterprise tab indicator */}
                {responsive.isMobile && isTabActive(tab.id) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
                )}
                <tab.icon className={`h-4 w-4 ${isTabActive(tab.id) && responsive.isMobile
                    ? 'text-primary-foreground'
                    : ''
                  }`} />
                {!responsive.isMobile && tab.label}
                {responsive.isMobile && (responsive.isLandscape ? tab.label : '')}
                {/* Tab position indicator for mobile */}
                {responsive.isMobile && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className={`h-0.5 w-6 rounded-full transition-all duration-300 ${isTabActive(tab.id) ? 'bg-primary-foreground' : 'bg-transparent'
                      }`} />
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          {availableTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-6 w-1/3" />
                          <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className={`h-[${config.chartHeight}px] w-full`} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                }
              >
                <AnalyticsDashboardWrapper
                  className="space-y-6"
                  userId={user?.id}
                  familyId={tab.id === 'family' ? familyId : undefined}
                  timeRange={timeRange}
                  showPersonalData={tab.id === 'personal'}
                  showFamilyData={tab.id === 'family'}
                  showAdminData={tab.id === 'admin'}
                />
              </Suspense>
            </TabsContent>
          ))}
        </Tabs>

        {/* Mobile Swipe Indicator with Gamification */}
        {responsive.isMobile && (
          <div className="flex justify-center py-4">
            <div className={`flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 rounded-full px-3 py-2 transition-all duration-300 ${
              isGestureActive ? 'bg-primary/20 scale-105' : ''
            }`}>
              <div className="flex gap-1">
                {availableTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`h-1.5 w-6 rounded-full transition-all duration-300 ${isTabActive(tab.id)
                        ? 'bg-gradient-to-r from-primary to-primary/80 shadow-sm'
                        : 'bg-muted'
                      } ${isTabActive(tab.id) && celebrationActive
                        ? GAMIFICATION_THEME.animations.celebration
                        : ''
                      } ${isGestureActive && isTabActive(tab.id)
                        ? 'animate-pulse'
                        : ''
                      }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className={isGestureActive ? 'animate-bounce' : 'animate-pulse'}>
                  {isGestureActive ? '✨' : '👆'}
                </span>
                <span>{isGestureActive ? 'Swiping...' : 'Swipe to navigate'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Enterprise Time Range Selector */}
        <Card className={`${responsive.isMobile
            ? 'bg-gradient-to-r from-background to-muted/20 border-primary/20'
            : ''
          }`}>
          <CardHeader className={responsive.isMobile ? 'pb-3' : ''}>
            <CardTitle className={`flex items-center gap-2 ${config.fontSize}`}>
              <Calendar className={`h-5 w-5 ${responsive.isMobile ? 'text-primary' : ''
                }`} />
              Time Range
              {responsive.isMobile && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  <span className="animate-pulse">📊</span>
                  Active
                </Badge>
              )}
            </CardTitle>
            {!config.hideDetails && (
              <CardDescription>
                Adjust the analytics time period for detailed insights
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className={responsive.isMobile ? 'pt-0' : ''}>
            <div className={`flex gap-2 ${responsive.isMobile ? 'grid grid-cols-2' : 'flex-wrap'
              }`}>
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size={responsive.isMobile ? 'sm' : 'default'}
                  onClick={() => {
                    setTimeRange(range);
                    if (GAMIFICATION_THEME.effects.hapticFeedback && responsive.isMobile) {
                      triggerHaptic('light');
                    }
                  }}
                  className={`capitalize transition-all duration-300 ${timeRange === range && responsive.isMobile
                      ? 'bg-gradient-to-r from-primary to-primary/80 shadow-lg transform scale-105'
                      : ''
                    } ${responsive.isMobile ? 'relative overflow-hidden' : ''
                    }`}
                >
                  {timeRange === range && responsive.isMobile && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
                  )}
                  <span className="relative z-10">
                    {range}
                    {timeRange === range && responsive.isMobile && ' ✨'}
                  </span>
                </Button>
              ))}
            </div>
            {responsive.isMobile && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span className="animate-pulse">⏱️</span>
                <span>Current: {timeRange.toUpperCase()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 