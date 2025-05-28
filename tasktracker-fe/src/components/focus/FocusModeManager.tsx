'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Target, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Keyboard,
  Trophy
} from 'lucide-react';
import { useFocus } from '@/lib/providers/FocusContext';
import { useToast } from '@/lib/hooks/useToast';
import { Task } from '@/lib/types/task';
import { FocusSession } from '@/lib/types/focus';
import { focusService } from '@/lib/services/focusService';
import { TaskSelectionModal } from './TaskSelectionModal';
import { SessionCompletionDialog } from './SessionCompletionDialog';
import { FocusKeyboardShortcuts, KeyboardShortcutsHelp } from './FocusKeyboardShortcuts';
import { FocusStreakCounter } from './FocusStreakCounter';

type FocusState = 'NO_SESSION' | 'STARTING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETING' | 'ERROR';

interface FocusModeManagerProps {
  className?: string;
  showTaskDetails?: boolean;
  showStreakCounter?: boolean;
  showKeyboardHelp?: boolean;
}

export function FocusModeManager({ 
  className,
  showTaskDetails = true,
  showStreakCounter = true,
  showKeyboardHelp = true
}: FocusModeManagerProps) {
  const { 
    currentSession, 
    isLoading, 
    startFocusSession, 
    endFocusSession, 
    pauseFocusSession, 
    resumeFocusSession,
    fetchCurrentSession
  } = useFocus();
  
  const { showToast } = useToast();
  
  // Local state management
  const [focusState, setFocusState] = useState<FocusState>('NO_SESSION');
  const [showTaskSelection, setShowTaskSelection] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // ===== STATE SYNCHRONIZATION =====
  useEffect(() => {
    if (currentSession) {
      switch (currentSession.status) {
        case 'InProgress':
          setFocusState('IN_PROGRESS');
          startTimer();
          break;
        case 'Paused':
          setFocusState('PAUSED');
          stopTimer();
          break;
        case 'Completed':
          setFocusState('NO_SESSION');
          stopTimer();
          break;
        default:
          setFocusState('NO_SESSION');
          stopTimer();
      }
    } else {
      setFocusState('NO_SESSION');
      stopTimer();
    }
    
    setError(null);
  }, [currentSession]);

  // ===== TIMER MANAGEMENT =====
  const startTimer = useCallback(() => {
    if (timerInterval) clearInterval(timerInterval);
    
    const interval = setInterval(() => {
      if (currentSession) {
        const now = Date.now();
        const startTime = new Date(currentSession.startTime).getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const totalSeconds = currentSession.durationMinutes * 60 + elapsed;
        setSessionTimer(totalSeconds);
      }
    }, 1000);
    
    setTimerInterval(interval);
  }, [currentSession]);

  const stopTimer = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [timerInterval]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // ===== SESSION FLOW HANDLERS =====
  
  const handleStartSession = async (task: Task, notes?: string) => {
    try {
      setFocusState('STARTING');
      setError(null);
      
      await startFocusSession(task.id, notes || '');
      
      setSelectedTask(task);
      setShowTaskSelection(false);
      showToast('Focus session started successfully!', 'success');
      
    } catch (err) {
      console.error('Error starting focus session:', err);
      setError('Failed to start focus session. Please try again.');
      setFocusState('ERROR');
      showToast('Failed to start focus session', 'error');
    }
  };

  const handlePauseSession = async () => {
    if (!currentSession) return;
    
    try {
      setError(null);
      await pauseFocusSession(currentSession.id);
      showToast('Focus session paused', 'info');
    } catch (err) {
      console.error('Error pausing session:', err);
      setError('Failed to pause session. Please try again.');
      showToast('Failed to pause session', 'error');
    }
  };

  const handleResumeSession = async () => {
    if (!currentSession) return;
    
    try {
      setError(null);
      await resumeFocusSession(currentSession.id);
      showToast('Focus session resumed', 'success');
    } catch (err) {
      console.error('Error resuming session:', err);
      setError('Failed to resume session. Please try again.');
      showToast('Failed to resume session', 'error');
    }
  };

  const handleEndSession = async (showCompletionDialog = false) => {
    if (!currentSession) return;
    
    try {
      if (showCompletionDialog) {
        setFocusState('COMPLETING');
        setShowCompletion(true);
      } else {
        setError(null);
        await endFocusSession();
        setSelectedTask(null);
        setSessionTimer(0);
        showToast('Focus session ended', 'info');
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setError('Failed to end session. Please try again.');
      showToast('Failed to end session', 'error');
    }
  };

  const handleSessionCompletion = async (completion: {
    sessionQualityRating?: number;
    completionNotes?: string;
    taskProgressAfter?: number;
    taskCompletedDuringSession?: boolean;
  }) => {
    if (!currentSession) return;
    
    try {
      setError(null);
      await focusService.completeSessionWithDetails(currentSession.id, completion);
      
      setShowCompletion(false);
      setSelectedTask(null);
      setSessionTimer(0);
      setFocusState('NO_SESSION');
      
      // Refresh current session to clear state
      await fetchCurrentSession();
      
      showToast('Focus session completed successfully!', 'success');
      
      if (completion.taskCompletedDuringSession) {
        showToast('🎉 Task completed! Great job!', 'success');
      }
      
    } catch (err) {
      console.error('Error completing session:', err);
      setError('Failed to complete session. Please try again.');
      showToast('Failed to complete session', 'error');
    }
  };

  const handleRetry = async () => {
    setError(null);
    setFocusState('NO_SESSION');
    await fetchCurrentSession();
  };

  // ===== UTILITY FUNCTIONS =====
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!currentSession || !selectedTask) return 0;
    const estimatedSeconds = (selectedTask.estimatedTimeMinutes || 60) * 60;
    return Math.min((sessionTimer / estimatedSeconds) * 100, 100);
  };

  // ===== RENDER HELPERS =====
  
  const renderNoSessionState = () => (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Play className="h-5 w-5" />
          Start Focus Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Select a task and start focusing to boost your productivity
        </p>
        <Button 
          onClick={() => setShowTaskSelection(true)}
          size="lg"
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          Choose Task & Start
        </Button>
        {showKeyboardHelp && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Keyboard Shortcuts
          </Button>
        )}
        {showKeyboardShortcuts && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <KeyboardShortcutsHelp />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderActiveSessionState = () => {
    if (!currentSession || !selectedTask) return null;
    
    const isInProgress = focusState === 'IN_PROGRESS';
    const isPaused = focusState === 'PAUSED';
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Focus Session
            </CardTitle>
            <Badge variant={isInProgress ? "default" : "secondary"}>
              {isInProgress ? 'In Progress' : 'Paused'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-blue-600">
              {formatTime(sessionTimer)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Total session time
            </p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{getProgressPercentage().toFixed(0)}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Task Details */}
          {showTaskDetails && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <span className="font-medium">Current Task</span>
              </div>
              <h4 className="font-medium">{selectedTask.title}</h4>
              {selectedTask.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTask.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>Priority: {selectedTask.priority}</span>
                {selectedTask.dueDate && (
                  <span>Due: {new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}

          {/* Session Controls */}
          <div className="flex gap-2">
            {isInProgress ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handlePauseSession}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleEndSession(true)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Complete
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleResumeSession}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleEndSession(true)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <Square className="h-4 w-4 mr-2" />
                  End
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderErrorState = () => (
    <Card className="border-red-200">
      <CardContent className="pt-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'An error occurred with your focus session.'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={handleRetry}
          variant="outline"
          className="w-full mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );

  const renderLoadingState = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">
            {focusState === 'STARTING' ? 'Starting focus session...' : 'Loading...'}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Streak Counter */}
      {showStreakCounter && (
        <FocusStreakCounter compact={true} />
      )}

      {/* Main Focus Interface */}
      {focusState === 'ERROR' && renderErrorState()}
      {focusState === 'STARTING' && renderLoadingState()}
      {(focusState === 'NO_SESSION' && !isLoading) && renderNoSessionState()}
      {(focusState === 'IN_PROGRESS' || focusState === 'PAUSED') && renderActiveSessionState()}
      {(focusState === 'COMPLETING' && isLoading) && renderLoadingState()}

      {/* Task Selection Modal */}
      <TaskSelectionModal
        open={showTaskSelection}
        onOpenChange={setShowTaskSelection}
        onTaskSelect={handleStartSession}
      />

      {/* Session Completion Dialog */}
      <SessionCompletionDialog
        isOpen={showCompletion}
        onClose={() => setShowCompletion(false)}
        session={currentSession}
        task={selectedTask}
        onComplete={handleSessionCompletion}
      />

      {/* Keyboard Shortcuts Handler */}
      <FocusKeyboardShortcuts enabled={true} />
    </div>
  );
} 