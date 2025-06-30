// Mobile Calendar Enhancements Component for Enterprise TaskTracker System
// Following FAMILY-AUTH-IMPLEMENTATION-CHECKLIST.md - Enterprise Component Standards
// Copyright (c) 2025 TaskTracker Enterprise

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  RotateCcw, 
  Zap, 
  Hand, 
  Volume2, 
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Clock,
  Settings
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Alert, AlertDescription } from '../ui/alert';
import { useCalendarGestures, isGestureSupported, isHapticFeedbackSupported } from '../../lib/hooks/useCalendarGestures';
import { 
  MobileCalendarEnhancementsProps, 
  PullToRefreshState,
  DurationPresetDTO 
} from '../../lib/types/calendar-enhancements';

// ============================================================================
// DURATION PRESETS DATA
// ============================================================================

const DEFAULT_DURATION_PRESETS: DurationPresetDTO[] = [
  { label: '15m', minutes: 15, icon: '⚡', isCustom: false, usageFrequency: 0 },
  { label: '30m', minutes: 30, icon: '📞', isCustom: false, usageFrequency: 0 },
  { label: '1h', minutes: 60, icon: '💼', isCustom: false, usageFrequency: 0 },
  { label: '2h', minutes: 120, icon: '📊', isCustom: false, usageFrequency: 0 },
];

// ============================================================================
// PULL TO REFRESH COMPONENT
// ============================================================================

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  isEnabled: boolean;
  children: React.ReactNode;
}

function PullToRefresh({ onRefresh, isEnabled, children }: PullToRefreshProps) {
  const [pullState, setPullState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    refreshThreshold: 60,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isEnabled) return;
    startY.current = e.touches[0].clientY;
  }, [isEnabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isEnabled || !containerRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY - startY.current);
    
    // Only enable pull-to-refresh if scrolled to top
    if (containerRef.current.scrollTop === 0 && pullDistance > 0) {
      e.preventDefault();
      setPullState(prev => ({
        ...prev,
        isPulling: true,
        pullDistance: Math.min(pullDistance, 120),
      }));
    }
  }, [isEnabled]);

  const handleTouchEnd = useCallback(async () => {
    if (!isEnabled) return;
    
    if (pullState.pullDistance >= pullState.refreshThreshold) {
      setPullState(prev => ({ ...prev, isRefreshing: true, isPulling: false }));
      
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setPullState(prev => ({ ...prev, isRefreshing: false, pullDistance: 0 }));
        }, 500);
      }
    } else {
      setPullState(prev => ({ ...prev, isPulling: false, pullDistance: 0 }));
    }
  }, [isEnabled, pullState.pullDistance, pullState.refreshThreshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      {/* Pull to refresh indicator */}
      {(pullState.isPulling || pullState.isRefreshing) && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 transition-all duration-200 z-50"
          style={{ 
            height: `${Math.max(pullState.pullDistance, pullState.isRefreshing ? 60 : 0)}px`,
            transform: `translateY(-${pullState.isRefreshing ? 0 : Math.max(0, 60 - pullState.pullDistance)}px)`
          }}
        >
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <RotateCcw 
              className={`h-5 w-5 ${pullState.isRefreshing ? 'animate-spin' : ''}`} 
            />
            <span className="text-sm font-medium">
              {pullState.isRefreshing 
                ? 'Refreshing...' 
                : pullState.pullDistance >= pullState.refreshThreshold 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </span>
          </div>
        </div>
      )}
      
      <div 
        style={{
          paddingTop: pullState.isPulling || pullState.isRefreshing ? `${Math.max(pullState.pullDistance, pullState.isRefreshing ? 60 : 0)}px` : '0px',
          transition: pullState.isPulling ? 'none' : 'padding-top 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// DURATION PRESETS COMPONENT
// ============================================================================

interface DurationPresetsProps {
  onDurationSelect: (minutes: number) => void;
  selectedDuration?: number;
  customPresets?: DurationPresetDTO[];
}

function DurationPresets({ onDurationSelect, selectedDuration, customPresets = [] }: DurationPresetsProps) {
  const presets = [...DEFAULT_DURATION_PRESETS, ...customPresets];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Quick Duration
        </span>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <Button
            key={`${preset.label}-${preset.minutes}`}
            variant={selectedDuration === preset.minutes ? "default" : "outline"}
            size="sm"
            className="h-12 flex flex-col items-center justify-center gap-1 text-xs active:scale-95 transition-transform"
            onClick={() => {
              onDurationSelect(preset.minutes);
              // Haptic feedback
              if (navigator.vibrate) {
                navigator.vibrate(20);
              }
            }}
          >
            <span className="text-lg">{preset.icon}</span>
            <span>{preset.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// GESTURE TUTORIAL COMPONENT
// ============================================================================

function GestureTutorial({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <Card className="mb-4 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Hand className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Gesture Navigation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-3 w-3 text-gray-500" />
            <span>Swipe left: Next period</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="h-3 w-3 text-gray-500" />
            <span>Swipe right: Previous period</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp className="h-3 w-3 text-gray-500" />
            <span>Swipe up: Change view</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="h-3 w-3 text-gray-500" />
            <span>Pull down: Refresh</span>
          </div>
        </div>
        
        <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Zap className="h-3 w-3" />
            <span>Long press events for quick actions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN MOBILE ENHANCEMENTS COMPONENT
// ============================================================================

export default function CalendarMobileEnhancements({
  isEnabled,
  features,
  breakpoint,
  touchTargetSize,
  hapticSettings,
  onRefresh,
  onGestureAction,
  onDurationSelect,
  children,
}: MobileCalendarEnhancementsProps & {
  onRefresh?: () => Promise<void>;
  onGestureAction?: (action: string) => void;
  onDurationSelect?: (minutes: number) => void;
  children?: React.ReactNode;
}) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [mobileSettings, setMobileSettings] = useState({
    gesturesEnabled: features.gestureNavigation,
    hapticEnabled: features.hapticFeedback && hapticSettings.isEnabled,
    pullToRefreshEnabled: features.pullToRefresh,
    voiceEnabled: features.voiceControl,
  });

  // Gesture configuration
  const gestureConfig = useCalendarGestures({
    onSwipeLeft: () => onGestureAction?.('next-period'),
    onSwipeRight: () => onGestureAction?.('prev-period'),
    onSwipeUp: () => onGestureAction?.('change-view'),
    onSwipeDown: () => onGestureAction?.('show-agenda'),
    onPinchZoom: (scale) => onGestureAction?.(`zoom-${scale > 1 ? 'in' : 'out'}`),
    onLongPress: () => onGestureAction?.('context-menu'),
    isEnabled: mobileSettings.gesturesEnabled,
    minimumSwipeDistance: 50,
    longPressDuration: 500,
  });

  // Device capability detection
  const deviceCapabilities = {
    hasTouch: isGestureSupported(),
    hasHaptic: isHapticFeedbackSupported(),
    hasVoice: 'speechSynthesis' in window,
    isMobile: breakpoint === 'mobile',
  };

  // Only render on mobile devices
  if (!deviceCapabilities.isMobile || !isEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      {/* Mobile Features Status Bar */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Mobile Optimized
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {touchTargetSize}px targets
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Hand className={`h-3 w-3 ${mobileSettings.gesturesEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Gestures</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className={`h-3 w-3 ${mobileSettings.hapticEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Haptic</span>
            </div>
            <div className="flex items-center gap-1">
              <RotateCcw className={`h-3 w-3 ${mobileSettings.pullToRefreshEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Pull Refresh</span>
            </div>
            <div className="flex items-center gap-1">
              <Volume2 className={`h-3 w-3 ${mobileSettings.voiceEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <span>Voice</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Capability Alerts */}
      {!deviceCapabilities.hasTouch && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <Eye className="h-4 w-4" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Touch gestures not supported on this device. Using keyboard navigation instead.
          </AlertDescription>
        </Alert>
      )}

      {/* Duration Presets */}
      {onDurationSelect && (
        <Card>
          <CardContent className="p-4">
            <DurationPresets onDurationSelect={onDurationSelect} />
          </CardContent>
        </Card>
      )}

      {/* Gesture Tutorial */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTutorial(!showTutorial)}
          className="text-xs"
        >
          <Hand className="h-3 w-3 mr-1" />
          {showTutorial ? 'Hide' : 'Show'} Gestures
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMobileSettings(prev => ({ 
              ...prev, 
              hapticEnabled: !prev.hapticEnabled 
            }));
            // Test haptic feedback
            if (navigator.vibrate) {
              navigator.vibrate(30);
            }
          }}
          disabled={!deviceCapabilities.hasHaptic}
          className="text-xs"
        >
          <Zap className="h-3 w-3 mr-1" />
          Haptic {mobileSettings.hapticEnabled ? 'On' : 'Off'}
        </Button>
      </div>

      <GestureTutorial isVisible={showTutorial} />

      {/* Mobile Settings Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Mobile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hand className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Gesture Navigation</span>
            </div>
            <Switch
              checked={mobileSettings.gesturesEnabled}
              onCheckedChange={(checked) => 
                setMobileSettings(prev => ({ ...prev, gesturesEnabled: checked }))
              }
              disabled={!deviceCapabilities.hasTouch}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Haptic Feedback</span>
            </div>
            <Switch
              checked={mobileSettings.hapticEnabled}
              onCheckedChange={(checked) => 
                setMobileSettings(prev => ({ ...prev, hapticEnabled: checked }))
              }
              disabled={!deviceCapabilities.hasHaptic}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Pull to Refresh</span>
            </div>
            <Switch
              checked={mobileSettings.pullToRefreshEnabled}
              onCheckedChange={(checked) => 
                setMobileSettings(prev => ({ ...prev, pullToRefreshEnabled: checked }))
              }
            />
          </div>

          {mobileSettings.hapticEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Haptic Intensity</span>
              </div>
              <Slider
                value={[hapticSettings.intensity === 'light' ? 1 : hapticSettings.intensity === 'medium' ? 2 : 3]}
                onValueChange={([value]) => {
                  const intensity = value === 1 ? 'light' : value === 2 ? 'medium' : 'heavy';
                  // Trigger test vibration
                  if (navigator.vibrate) {
                    const vibrationMs = intensity === 'light' ? 10 : intensity === 'medium' ? 20 : 30;
                    navigator.vibrate(vibrationMs);
                  }
                }}
                max={3}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Light</span>
                <span>Medium</span>
                <span>Heavy</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Calendar Content with Gesture Support */}
      {onRefresh ? (
        <PullToRefresh
          onRefresh={onRefresh}
          isEnabled={mobileSettings.pullToRefreshEnabled}
        >
          <div
            {...gestureConfig.gestureHandlers}
            className="touch-manipulation"
            style={{
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'manipulation',
            }}
          >
            {children}
          </div>
        </PullToRefresh>
      ) : (
        <div
          {...gestureConfig.gestureHandlers}
          className="touch-manipulation"
          style={{
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
} 