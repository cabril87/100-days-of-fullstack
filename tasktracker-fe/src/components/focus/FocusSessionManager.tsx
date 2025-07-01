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

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useFocusSessionStore } from '@/lib/hooks/useFocusSessionStore';
import type { 
  FocusSessionManagerProps
} from '@/lib/types/focus-components';
import { 
  Play, 
  Pause, 
  Square, 
  Target, 
  Brain,
  AlertCircle,
  Keyboard,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';

/**
 * Focus Session Manager Component
 * Enterprise-grade focus session control with real-time timer
 * Integrates with persistent store for cross-refresh session continuity
 */
export default function FocusSessionManager({
  className,
  showTaskDetails = true,
  showStreakCounter = true,
  showKeyboardHelp = false,
  onSessionStateChange,
  onSessionComplete
}: FocusSessionManagerProps) {
  
  // ============================================================================
  // PERSISTENT STATE MANAGEMENT - ENTERPRISE STORE INTEGRATION
  // ============================================================================
  
  const {
    session: currentSession,
    focusState,
    timerState,
    isLoading: storeLoading,
    error: storeError,
    isInitialized,
    pauseSession,
    resumeSession,
    completeSession,
    canPause,
    canResume,
    getElapsedMinutes,
    getFormattedTime
  } = useFocusSessionStore();

  // Local UI state (non-persistent)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // SESSION MANAGEMENT - PERSISTENT STORE INTEGRATION
  // ============================================================================

  // Session state notifications to parent components
  useEffect(() => {
    if (onSessionStateChange && isInitialized) {
      onSessionStateChange(focusState);
    }
  }, [focusState, onSessionStateChange, isInitialized]);

  // Clear local errors when store initializes successfully
  useEffect(() => {
    if (isInitialized && !storeError) {
      setError(null);
    }
  }, [isInitialized, storeError]);

  // ============================================================================
  // SESSION ACTION HANDLERS - STORE INTEGRATION
  // ============================================================================

  const handlePauseSession = useCallback(async () => {
    if (!canPause()) {
      toast.error('Session cannot be paused in current state');
      return;
    }
    
    setIsLoading(true);
    try {
      await pauseSession();
      toast.success('⏸️ Session paused successfully');
    } catch (error) {
      console.error('❌ Failed to pause session:', error);
      toast.error('Failed to pause session');
      setError('Failed to pause session');
    } finally {
      setIsLoading(false);
    }
  }, [canPause, pauseSession]);

  const handleResumeSession = useCallback(async () => {
    if (!canResume()) {
      toast.error('Session cannot be resumed in current state');
      return;
    }
    
    setIsLoading(true);
    try {
      await resumeSession();
      toast.success('▶️ Session resumed successfully');
    } catch (error) {
      console.error('❌ Failed to resume session:', error);
      toast.error('Failed to resume session');
      setError('Failed to resume session');
    } finally {
      setIsLoading(false);
    }
  }, [canResume, resumeSession]);

  const handleEndSession = useCallback(async () => {
    if (!currentSession) {
      toast.error('No active session to end');
      return;
    }
    
    setIsLoading(true);
    try {
      const completedSession = { ...currentSession };
      await completeSession();
      
      toast.success(`🎉 Focus session completed! Time: ${getFormattedTime()}`);
      onSessionComplete?.(completedSession);
    } catch (error) {
      console.error('❌ Failed to complete session:', error);
      toast.error('Failed to complete session');
      setError('Failed to complete session');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, completeSession, getFormattedTime, onSessionComplete]);

  const handleClearError = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      // The store will automatically reinitialize and restore session if valid
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('❌ Failed to retry connection:', error);
      setError('Connection retry failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getProgressPercentage = useCallback((): number => {
    if (!currentSession || currentSession.durationMinutes === 0) return 0;
    const targetSeconds = currentSession.durationMinutes * 60;
    return Math.min((timerState.elapsedSeconds / targetSeconds) * 100, 100);
  }, [currentSession, timerState.elapsedSeconds]);

  const getStateDisplay = useCallback(() => {
    switch (focusState) {
      case 'NO_SESSION':
        return { text: 'Ready to Focus', color: 'text-gray-600', bgColor: 'bg-gray-100' };
      case 'STARTING':
        return { text: 'Starting...', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'IN_PROGRESS':
        return { text: 'In Progress', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'PAUSED':
        return { text: 'Paused', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'COMPLETING':
        return { text: 'Completing...', color: 'text-purple-600', bgColor: 'bg-purple-100' };
      case 'ERROR':
        return { text: 'Error', color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { text: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  }, [focusState]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (!isInitialized || (storeLoading && focusState === 'NO_SESSION')) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const stateDisplay = getStateDisplay();
  const progressPercentage = getProgressPercentage();
  const displayError = error || storeError;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Focus Session</CardTitle>
              <Badge variant="outline" className={cn("text-xs", stateDisplay.color, stateDisplay.bgColor)}>
                {stateDisplay.text}
              </Badge>
            </div>
          </div>
          
          {showStreakCounter && (
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">🔥</div>
              <div className="text-xs text-gray-500">3 day streak</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white">
            {timerState.displayTime}
          </div>
          
          {currentSession && (
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="text-xs text-gray-500">
                Target: {currentSession.durationMinutes} minutes • Elapsed: {getElapsedMinutes()} min
              </div>
            </div>
          )}
        </div>

        {/* Task Details */}
        {showTaskDetails && currentSession && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">Current Task</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {currentSession.taskItem?.title || `Task #${currentSession.taskId}`}
            </div>
            {currentSession.notes && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                &ldquo;{currentSession.notes}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* IN PROGRESS STATE */}
          {focusState === 'IN_PROGRESS' && (
            <>
              <Button 
                onClick={handlePauseSession}
                variant="outline"
                className="flex-1 min-h-[44px] active:scale-95 transition-transform duration-150 
                           bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100
                           border-yellow-300 hover:border-yellow-400 text-yellow-800 hover:text-yellow-900
                           touch-manipulation focus:ring-2 focus:ring-yellow-300"
                disabled={isLoading || !canPause()}
              >
                <Pause className="h-4 w-4 mr-2" />
                <span className="font-medium">Pause</span>
              </Button>
              <Button 
                onClick={handleEndSession}
                variant="outline"
                className="flex-1 min-h-[44px] active:scale-95 transition-transform duration-150
                           bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100
                           border-red-300 hover:border-red-400 text-red-800 hover:text-red-900
                           touch-manipulation focus:ring-2 focus:ring-red-300"
                disabled={isLoading}
              >
                <Square className="h-4 w-4 mr-2" />
                <span className="font-medium">End Session</span>
              </Button>
            </>
          )}
          
          {/* PAUSED STATE */}
          {focusState === 'PAUSED' && (
            <>
              <Button 
                onClick={handleResumeSession}
                variant="default"
                className="flex-1 min-h-[44px] active:scale-95 transition-transform duration-150
                           bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600
                           text-white shadow-lg hover:shadow-xl
                           touch-manipulation focus:ring-2 focus:ring-green-300"
                disabled={isLoading || !canResume()}
              >
                <Play className="h-4 w-4 mr-2" />
                <span className="font-medium">Resume</span>
              </Button>
              <Button 
                onClick={handleEndSession}
                variant="outline"
                className="flex-1 min-h-[44px] active:scale-95 transition-transform duration-150
                           bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100
                           border-red-300 hover:border-red-400 text-red-800 hover:text-red-900
                           touch-manipulation focus:ring-2 focus:ring-red-300"
                disabled={isLoading}
              >
                <Square className="h-4 w-4 mr-2" />
                <span className="font-medium">End Session</span>
              </Button>
            </>
          )}

          {/* NO SESSION STATE */}
          {focusState === 'NO_SESSION' && (
            <div className="flex flex-col items-center space-y-3 py-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Ready to start focusing?
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Use the task selection to begin a new focus session
                </p>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {focusState === 'ERROR' && displayError && (
            <div className="flex flex-col space-y-2">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">Session Error</span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300">{displayError}</p>
              </div>
              <Button 
                onClick={handleClearError}
                variant="outline"
                size="sm"
                className="w-full min-h-[44px] active:scale-95 transition-transform duration-150
                           bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100
                           border-blue-300 hover:border-blue-400 text-blue-800 hover:text-blue-900
                           touch-manipulation focus:ring-2 focus:ring-blue-300"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="font-medium">Retry Connection</span>
              </Button>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        {showKeyboardHelp && (
          <div className="hidden sm:block">
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Keyboard className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Keyboard Shortcuts</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Pause/Resume:</span>
                  <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Space</kbd>
                </div>
                <div className="flex justify-between">
                  <span>End Session:</span>
                  <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session Persistence Indicator */}
        {currentSession && (
          <div className="text-center">
            <div className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Session auto-saves • Persists across page refreshes
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 