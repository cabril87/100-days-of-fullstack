'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Play, Pause, Square, Clock, Target, AlertTriangle, Plus, Brain, Timer } from 'lucide-react';
import { Task } from '@/lib/types/task';

export function FocusMode() {
  const {
    currentSession,
    isLoading,
    error,
    suggestions,
    startFocusSession,
    endFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    recordDistraction,
    fetchSuggestions,
    clearError
  } = useFocus();

  // Local state
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [distractionDescription, setDistractionDescription] = useState('');
  const [distractionCategory, setDistractionCategory] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load task suggestions from API
  useEffect(() => {
    fetchSuggestions(10); // Get 10 suggested tasks from API
  }, [fetchSuggestions]);

  // Timer for active sessions
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentSession && currentSession.status === 'InProgress') {
      interval = setInterval(() => {
        const startTime = new Date(currentSession.startTime).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession]);

  // Format elapsed time
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle starting a focus session
  const handleStartSession = async () => {
    if (!selectedTaskId) return;
    
    clearError();
    const success = await startFocusSession(selectedTaskId, sessionNotes);
    
    if (success) {
      setSessionNotes('');
    }
  };

  // Handle ending a session
  const handleEndSession = async () => {
    if (!currentSession) return;
    
    clearError();
    await endFocusSession(currentSession.id);
  };

  // Handle pausing a session
  const handlePauseSession = async () => {
    if (!currentSession) return;
    
    clearError();
    await pauseFocusSession(currentSession.id);
  };

  // Handle resuming a session
  const handleResumeSession = async () => {
    if (!currentSession) return;
    
    clearError();
    await resumeFocusSession(currentSession.id);
  };

  // Handle recording a distraction
  const handleRecordDistraction = async () => {
    if (!distractionDescription.trim() || !distractionCategory) return;
    
    clearError();
    const success = await recordDistraction(distractionDescription, distractionCategory);
    
    if (success) {
      setDistractionDescription('');
      setDistractionCategory('');
    }
  };

  // Common distraction categories
  const distractionCategories = [
    'Social Media',
    'Email',
    'Phone Call',
    'Colleague Interruption',
    'Noise',
    'Website Browsing',
    'Personal Task',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Error Display with Gamification Styling */}
      {error && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-t-xl"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600 opacity-[0.05] rounded-full blur-2xl"></div>
          
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-red-800">Error</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearError}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Current Session Display with Enhanced Styling */}
      {currentSession ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
          
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl"></div>
          
          <div className="relative z-10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <Timer className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Active Focus Session
                  </span>
                  <div className="text-sm text-gray-500 font-normal">
                    {currentSession.status === 'InProgress' ? 'In Progress' : 'Paused'}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer Display */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {formatElapsedTime(elapsedTime)}
                  </div>
                  <p className="text-gray-600 font-medium">Elapsed time</p>
                </div>
              </div>

              {/* Session Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Session ID</div>
                  <div className="font-semibold text-gray-900">{currentSession.id}</div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Task ID</div>
                  <div className="font-semibold text-gray-900">{currentSession.taskId}</div>
                </div>
              </div>

              {currentSession.notes && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-sm text-amber-700 mb-1">Session Notes</div>
                  <div className="text-amber-900 font-medium">{currentSession.notes}</div>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex space-x-3">
                {currentSession.status === 'InProgress' ? (
                  <Button 
                    onClick={handlePauseSession} 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button 
                    onClick={handleResumeSession} 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                      disabled={isLoading}
                    >
                      <Square className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>End Focus Session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will end your current focus session and save it to your history.
                        You've been focused for {formatElapsedTime(elapsedTime)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleEndSession}>
                        End Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* Distraction Recording */}
              {currentSession.status === 'InProgress' && (
                <div className="border-t pt-6">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-red-800">
                      <div className="p-2 rounded-lg bg-red-100 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      Record Distraction
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-red-700">Description</Label>
                        <Input
                          placeholder="What distracted you?"
                          value={distractionDescription}
                          onChange={(e) => setDistractionDescription(e.target.value)}
                          className="border-red-200 focus:border-red-400"
                        />
                      </div>
                      <div>
                        <Label className="text-red-700">Category</Label>
                        <Select value={distractionCategory} onValueChange={setDistractionCategory}>
                          <SelectTrigger className="border-red-200 focus:border-red-400">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {distractionCategories.map((category) => (
                              <SelectItem key={category} value={category.toLowerCase()}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={handleRecordDistraction}
                          disabled={!distractionDescription.trim() || !distractionCategory || isLoading}
                          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                          size="sm"
                        >
                          Record
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
        </div>
      ) : (
        /* Start New Session with Enhanced Styling */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-lg transition-all duration-300">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 opacity-[0.05] rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600 opacity-[0.05] rounded-full blur-2xl"></div>
          
          {/* Gradient accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-xl"></div>
          
          <div className="relative z-10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <Target className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Start Focus Session
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Task Selection */}
              <div>
                <Label className="text-gray-700 font-medium">Select Task</Label>
                <Select 
                  value={selectedTaskId?.toString() || ''} 
                  onValueChange={(value) => setSelectedTaskId(parseInt(value))}
                >
                  <SelectTrigger className="mt-2 border-gray-200 focus:border-purple-400">
                    <SelectValue placeholder="Choose a task to focus on" />
                  </SelectTrigger>
                  <SelectContent>
                    {suggestions.length > 0 ? (
                      suggestions.map((task: Task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-tasks" disabled>
                        No tasks available from API
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {suggestions.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Create some tasks first to see them here
                  </p>
                )}
              </div>

              {/* Session Notes */}
              <div>
                <Label className="text-gray-700 font-medium">Session Notes (Optional)</Label>
                <Textarea
                  placeholder="What do you want to accomplish in this session?"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  rows={3}
                  className="mt-2 border-gray-200 focus:border-purple-400"
                />
              </div>

              <Button 
                onClick={handleStartSession}
                disabled={!selectedTaskId || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {isLoading ? 'Starting...' : 'Start Focus Session'}
              </Button>
            </CardContent>
          </div>
        </div>
      )}

      {/* API Data Info with Enhanced Styling */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gray-400 to-gray-600 rounded-t-xl"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gray-600 opacity-[0.05] rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-gray-600" />
                API Data Status (Dev)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Current Session</div>
                  <div className={currentSession ? 'text-green-600' : 'text-red-600'}>
                    {currentSession ? '✅ Loaded' : '❌ None'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Suggested Tasks</div>
                  <div className={suggestions.length > 0 ? 'text-green-600' : 'text-red-600'}>
                    {suggestions.length > 0 ? `✅ ${suggestions.length} tasks` : '❌ None'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Loading State</div>
                  <div className={isLoading ? 'text-amber-600' : 'text-green-600'}>
                    {isLoading ? '⏳ Loading' : '✅ Ready'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                  <div className="font-medium text-gray-700">Error State</div>
                  <div className={error ? 'text-red-600' : 'text-green-600'}>
                    {error ? `❌ ${error}` : '✅ None'}
                  </div>
                </div>
              </div>
              {currentSession && (
                <details className="mt-4">
                  <summary className="text-sm cursor-pointer font-medium text-gray-700 hover:text-gray-900">Raw Session Data</summary>
                  <pre className="text-xs bg-gray-100 p-3 rounded-lg mt-2 overflow-auto border border-gray-200">
                    {JSON.stringify(currentSession, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </div>
        </div>
      )}
    </div>
  );
}