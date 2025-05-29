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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Decorative background elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
      
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
      
      <div className="relative z-10 p-8">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <Play className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Start Focus Session
            </h2>
          </div>
          
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Select a task and start focusing to boost your productivity and track your progress
          </p>
          
          <div className="space-y-4 max-w-sm mx-auto">
            <Button 
              onClick={() => setShowTaskSelection(true)}
              size="lg"
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-lg font-medium"
            >
              <Play className="h-5 w-5 mr-3" />
              Choose Task & Start Focus
            </Button>
            
            {showKeyboardHelp && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all duration-300"
              >
                <Keyboard className="h-4 w-4 mr-2" />
                Keyboard Shortcuts
              </Button>
            )}
          </div>
          
          {showKeyboardShortcuts && (
            <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 max-w-lg mx-auto">
              <KeyboardShortcutsHelp />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderActiveSessionState = () => {
    if (!currentSession || !selectedTask) return null;
    
    const isInProgress = focusState === 'IN_PROGRESS';
    const isPaused = focusState === 'PAUSED';
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Decorative background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-600 opacity-[0.05] rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
        
        {/* Dynamic gradient accent based on session state */}
        <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-xl ${
          isInProgress 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-amber-500 to-orange-600'
        }`}></div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl text-white shadow-lg ${
                isInProgress 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-amber-500 to-orange-600'
              }`}>
                <Clock className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Focus Session
              </h2>
            </div>
            <div className={`px-4 py-2 rounded-xl text-white font-medium shadow-md ${
              isInProgress 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600'
            }`}>
              {isInProgress ? '🔥 In Progress' : '⏸️ Paused'}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timer Display */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="text-center">
                <div className={`text-5xl font-mono font-bold mb-2 ${
                  isInProgress ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {formatTime(sessionTimer)}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Total session time
                </p>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progress</span>
                    <span>{getProgressPercentage().toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isInProgress 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-600'
                      }`}
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Task Details */}
            {showTaskDetails && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <Target className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-gray-800">Current Task</span>
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{selectedTask.title}</h4>
                {selectedTask.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {selectedTask.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs">
                  <span className="px-2 py-1 bg-white rounded-lg shadow-sm border">
                    Priority: {selectedTask.priority}
                  </span>
                  {selectedTask.dueDate && (
                    <span className="px-2 py-1 bg-white rounded-lg shadow-sm border">
                      Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Session Controls */}
          <div className="flex gap-3 mt-6">
            {isInProgress ? (
              <>
                <Button 
                  onClick={handlePauseSession}
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-medium"
                  disabled={isLoading}
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause Session
                </Button>
                <Button 
                  onClick={() => handleEndSession(true)}
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-medium"
                  disabled={isLoading}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete Task
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleResumeSession}
                  className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-medium"
                  disabled={isLoading}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Resume Session
                </Button>
                <Button 
                  onClick={() => handleEndSession(true)}
                  className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] font-medium"
                  disabled={isLoading}
                >
                  <Square className="h-5 w-5 mr-2" />
                  End Session
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderErrorState = () => (
    <div className="bg-white rounded-xl shadow-sm border border-red-200 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-600 opacity-[0.05] rounded-full blur-2xl"></div>
      
      {/* Red gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
      
      <div className="relative z-10 p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'An error occurred with your focus session.'}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={handleRetry}
          className="w-full mt-4 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
      
      {/* Blue gradient accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl"></div>
      
      <div className="relative z-10 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {focusState === 'STARTING' ? 'Starting Focus Session...' : 'Loading...'}
          </h3>
          <p className="text-gray-600">
            {focusState === 'STARTING' ? 'Setting up your productive workspace' : 'Please wait while we load your data'}
          </p>
        </div>
      </div>
    </div>
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