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

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  Pause, 
  Square, 
  Target, 
  Brain,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { toast } from 'sonner';

// Enterprise types
import type {
  FocusSession,
  FocusSessionState,
  TimerState,
  CreateFocusSessionDTO,
  CompleteFocusSessionDTO
} from '@/lib/types/focus';
import type {
  FocusSessionManagerProps
} from '@/lib/types/focus-components';

// Enterprise services
import { focusService } from '@/lib/services/focusService';

/**
 * Focus Session Manager Component
 * Enterprise-grade focus session control with real-time timer
 * Integrates with backend API for session persistence
 */
export default function FocusSessionManager({
  className,
  userId,
  showTaskDetails = true,
  showStreakCounter = true,
  showKeyboardHelp = false,
  onSessionStateChange,
  onSessionComplete
}: FocusSessionManagerProps) {
  
  // ============================================================================
  // STATE MANAGEMENT - ENTERPRISE PATTERNS
  // ============================================================================
  
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [focusState, setFocusState] = useState<FocusSessionState>('NO_SESSION');
  const [timerState, setTimerState] = useState<TimerState>({
    elapsedSeconds: 0,
    isRunning: false,
    isPaused: false,
    displayTime: '00:00'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // ============================================================================
  // TIMER UTILITIES - ACCURATE TIME TRACKING
  // ============================================================================

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const startTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    startTimeRef.current = new Date();
    
    timerInterval.current = setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current.getTime()) / 1000) + pausedTimeRef.current;
        
        setTimerState(prev => ({
          ...prev,
          elapsedSeconds: elapsed,
          displayTime: formatTime(elapsed),
          isRunning: true,
          isPaused: false
        }));
      }
    }, 1000);
  }, [formatTime]);

  const pauseTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    pausedTimeRef.current = timerState.elapsedSeconds;
    
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true
    }));
  }, [timerState.elapsedSeconds]);

  const stopTimer = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    
    setTimerState({
      elapsedSeconds: 0,
      isRunning: false,
      isPaused: false,
      displayTime: '00:00'
    });
  }, []);

  // ============================================================================
  // SESSION MANAGEMENT - REAL API INTEGRATION
  // ============================================================================

  const loadCurrentSession = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🎯 FocusManager: Loading current session...');
      const session = await focusService.getCurrentSession();
      
      if (session) {
        setCurrentSession(session);
        setFocusState('IN_PROGRESS');
        
        // Calculate elapsed time from session start
        const startTime = new Date(session.startTime);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        
        setTimerState({
          elapsedSeconds: elapsed,
          isRunning: session.status === 'InProgress',
          isPaused: session.status === 'Paused',
          displayTime: formatTime(elapsed)
        });
        
        if (session.status === 'InProgress') {
          startTimer();
        }
        
        console.log('✅ FocusManager: Session loaded successfully');
        onSessionStateChange?.('IN_PROGRESS');
      } else {
        setFocusState('NO_SESSION');
        console.log('📭 FocusManager: No active session found');
        onSessionStateChange?.('NO_SESSION');
      }
    } catch (error) {
      console.error('❌ FocusManager: Failed to load session:', error);
      setError('Failed to load current session');
      setFocusState('ERROR');
      onSessionStateChange?.('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [userId, formatTime, startTimer, onSessionStateChange]);

  const handleStartSession = useCallback(async (taskId: number, durationMinutes: number = 25) => {
    setIsLoading(true);
    setError(null);
    setFocusState('STARTING');
    
    try {
      console.log('🚀 FocusManager: Starting new session...');
      
      const createDto: CreateFocusSessionDTO = {
        taskId,
        durationMinutes,
        forceStart: true // Auto-end any existing session
      };
      
      const session = await focusService.startSession(createDto);
      setCurrentSession(session);
      setFocusState('IN_PROGRESS');
      
      // Reset and start timer
      pausedTimeRef.current = 0;
      startTimer();
      
      toast.success(`🎯 Focus session started! Duration: ${durationMinutes} minutes`);
      console.log('✅ FocusManager: Session started successfully');
      onSessionStateChange?.('IN_PROGRESS');
      
    } catch (error) {
      console.error('❌ FocusManager: Failed to start session:', error);
      setError('Failed to start focus session');
      setFocusState('ERROR');
      toast.error('Failed to start focus session');
      onSessionStateChange?.('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [startTimer, onSessionStateChange]);

  const handlePauseSession = useCallback(async () => {
    if (!currentSession) return;
    
    setIsLoading(true);
    try {
      console.log('⏸️ FocusManager: Pausing session...');
      await focusService.pauseCurrentSession();
      
      pauseTimer();
      setFocusState('PAUSED');
      
      toast.success('⏸️ Session paused');
      console.log('✅ FocusManager: Session paused');
      onSessionStateChange?.('PAUSED');
      
    } catch (error) {
      console.error('❌ FocusManager: Failed to pause:', error);
      toast.error('Failed to pause session');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, pauseTimer, onSessionStateChange]);

  const handleResumeSession = useCallback(async () => {
    if (!currentSession) return;
    
    setIsLoading(true);
    try {
      console.log('▶️ FocusManager: Resuming session...');
      await focusService.resumeSession(currentSession.id);
      
      startTimer();
      setFocusState('IN_PROGRESS');
      
      toast.success('▶️ Session resumed');
      console.log('✅ FocusManager: Session resumed');
      onSessionStateChange?.('IN_PROGRESS');
      
    } catch (error) {
      console.error('❌ FocusManager: Failed to resume:', error);
      toast.error('Failed to resume session');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, startTimer, onSessionStateChange]);

  const handleEndSession = useCallback(async () => {
    if (!currentSession) return;
    
    setFocusState('COMPLETING');
    setIsLoading(true);
    
    try {
      console.log('🏁 FocusManager: Ending session...');
      
      const completionDto: CompleteFocusSessionDTO = {
        sessionQualityRating: 4, // Default good rating
        completionNotes: `Focused for ${timerState.displayTime}`,
        taskProgressAfter: Math.min(currentSession.taskProgressBefore + 25, 100),
        taskCompletedDuringSession: false // Default - task not completed during session
      };
      
      await focusService.completeSession(currentSession.id, completionDto);
      
      stopTimer();
      setCurrentSession(null);
      setFocusState('NO_SESSION');
      
      toast.success(`🎉 Focus session completed! Time: ${timerState.displayTime}`);
      console.log('✅ FocusManager: Session completed successfully');
      onSessionStateChange?.('NO_SESSION');
      onSessionComplete?.(currentSession);
      
    } catch (error) {
      console.error('❌ FocusManager: Failed to end session:', error);
      setError('Failed to complete session');
      setFocusState('ERROR');
      toast.error('Failed to complete session');
      onSessionStateChange?.('ERROR');
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, timerState.displayTime, stopTimer, onSessionStateChange, onSessionComplete]);

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================

  useEffect(() => {
    if (userId) {
      loadCurrentSession();
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [userId, loadCurrentSession]);

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

  if (isLoading && focusState === 'NO_SESSION') {
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
                Target: {currentSession.durationMinutes} minutes
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
              Task #{currentSession.taskId}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {focusState === 'NO_SESSION' && (
            <Button 
              onClick={() => handleStartSession(1, 25)} // Demo with task ID 1
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Focus
            </Button>
          )}
          
          {focusState === 'IN_PROGRESS' && (
            <>
              <Button 
                onClick={handlePauseSession}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button 
                onClick={handleEndSession}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <Square className="h-4 w-4 mr-2" />
                End
              </Button>
            </>
          )}
          
          {focusState === 'PAUSED' && (
            <>
              <Button 
                onClick={handleResumeSession}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={isLoading}
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button 
                onClick={handleEndSession}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Keyboard Help */}
        {showKeyboardHelp && (
          <div className="text-xs text-gray-500 text-center space-y-1">
            <div>Space: Play/Pause • Esc: End Session</div>
            <div>D: Record Distraction • S: Switch Task</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 