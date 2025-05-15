'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFocus } from '@/lib/providers/FocusContext';
import { useTasks } from '@/lib/providers/TaskProvider';
import { Task } from '@/lib/types/task';
import { FocusSession } from '@/lib/services/focusService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/lib/hooks/useToast';
import Link from 'next/link';

export function FocusMode() {
  const { currentSession, startFocusSession, endFocusSession, pauseFocusSession, resumeFocusSession, recordDistraction, fetchSuggestions } = useFocus();
  const { tasks } = useTasks();
  const { showToast } = useToast();
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [suggestions, setSuggestions] = useState<Task[]>([]);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isDistractionDialogOpen, setIsDistractionDialogOpen] = useState(false);
  const [distractionDescription, setDistractionDescription] = useState('');
  const [distractionCategory, setDistractionCategory] = useState('Other');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  // Load suggestions when component mounts
  useEffect(() => {
    const loadSuggestions = async () => {
      const fetchedSuggestions = await fetchSuggestions(5);
      if (fetchedSuggestions && fetchedSuggestions.length > 0) {
        setSuggestions(fetchedSuggestions);
      }
    };
    
    loadSuggestions();
  }, [fetchSuggestions]);
  
  // Handle timer for active focus session
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (currentSession && currentSession.status === 'InProgress' && timerActive) {
      const startTime = new Date(currentSession.startTime).getTime();
      
      // Update elapsed time immediately
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      
      // Then set interval to update every second
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession, timerActive]);
  
  // Set timer active when current session changes
  useEffect(() => {
    if (currentSession && currentSession.status === 'InProgress') {
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  }, [currentSession]);
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage for the timer
  const calculateProgress = (): number => {
    if (!currentSession) return 0;
    
    const totalDuration = currentSession.durationMinutes * 60; // Convert to seconds
    return Math.min((elapsedTime / totalDuration) * 100, 100);
  };
  
  // Handle starting a focus session
  const handleStartFocus = async () => {
    if (!selectedTask) {
      showToast('Please select a task to focus on', 'error');
      return;
    }
    
    const success = await startFocusSession(selectedTask.id);
    if (success) {
      setIsStartDialogOpen(false);
      setTimerActive(true);
    }
  };
  
  // Handle ending a focus session
  const handleEndFocus = async () => {
    if (!currentSession) return;
    
    const success = await endFocusSession(currentSession.id);
    if (success) {
      setIsEndDialogOpen(false);
      setTimerActive(false);
    }
  };
  
  // Handle recording a distraction
  const handleRecordDistraction = async () => {
    if (!distractionDescription) {
      showToast('Please enter a description', 'error');
      return;
    }
    
    const success = await recordDistraction(distractionDescription, distractionCategory);
    if (success) {
      setIsDistractionDialogOpen(false);
      setDistractionDescription('');
      setDistractionCategory('Other');
    }
  };
  
  // Handle pausing a focus session
  const handlePauseFocus = async () => {
    if (!currentSession) return;
    
    const success = await pauseFocusSession(currentSession.id);
    if (success) {
      setTimerActive(false);
    }
  };
  
  // Handle resuming a focus session
  const handleResumeFocus = async () => {
    if (!currentSession) return;
    
    const success = await resumeFocusSession(currentSession.id);
    if (success) {
      setTimerActive(true);
    }
  };
  
  // Get task by ID
  const getTaskById = useCallback((taskId: number): Task | undefined => {
    return tasks.find(task => task.id === taskId);
  }, [tasks]);
  
  // Get current task
  const currentTask = currentSession ? getTaskById(currentSession.taskId) : undefined;
  
  return (
    <div className="space-y-6">
      {/* Current Focus Session */}
      {currentSession ? (
        <Card className="shadow-md border-brand-navy/20">
          <CardHeader className="bg-brand-navy/5 pb-2">
            <CardTitle>Current Focus Session</CardTitle>
            <CardDescription>
              {currentSession.status === 'InProgress' ? 'In progress' : currentSession.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold mb-2">{formatTime(elapsedTime)}</div>
                <div className="text-sm text-gray-500">
                  {currentSession.durationMinutes} minute{currentSession.durationMinutes !== 1 ? 's' : ''} planned
                </div>
                <div className="w-full mt-4">
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-lg font-medium mb-2">Current Task</h3>
                {currentTask ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{currentTask.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{currentTask.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        currentTask.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        currentTask.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {typeof currentTask.priority === 'string' 
                          ? currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1) 
                          : 'Medium'}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <Link href={`/tasks/${currentTask.id}`} className="text-blue-600 hover:underline">
                        View Task Details
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Task information not available</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-gray-100 pt-4">
            {currentSession.status === 'InProgress' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDistractionDialogOpen(true)}
                  className="border-gray-300"
                >
                  Record Distraction
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={handlePauseFocus}>Pause</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsEndDialogOpen(true)}
                  >
                    End Session
                  </Button>
                </div>
              </>
            ) : currentSession.status === 'Paused' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDistractionDialogOpen(true)}
                  className="border-gray-300"
                >
                  Record Distraction
                </Button>
                <div className="space-x-2">
                  <Button variant="default" onClick={handleResumeFocus}>Resume</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsEndDialogOpen(true)}
                  >
                    End Session
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <Button 
                  variant="default" 
                  onClick={() => setIsStartDialogOpen(true)}
                  className="px-8"
                >
                  Start New Focus Session
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Focus Mode</CardTitle>
            <CardDescription>Boost your productivity with focused work sessions</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-8">
              <div className="mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mx-auto text-brand-navy opacity-80"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">No Active Focus Session</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start a focus session to concentrate on a specific task without distractions. 
                Track your productivity and build better work habits.
              </p>
              <Button 
                variant="default" 
                onClick={() => setIsStartDialogOpen(true)}
                className="px-8"
              >
                Start Focus Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Start Focus Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start Focus Session</DialogTitle>
            <DialogDescription>
              Select a task to focus on for the next 25 minutes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Tabs defaultValue="suggestions">
              <TabsList className="mb-4">
                <TabsTrigger value="suggestions">Suggested Tasks</TabsTrigger>
                <TabsTrigger value="all">All Tasks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggestions">
                {suggestions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {suggestions.map(task => (
                      <div 
                        key={task.id}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedTask?.id === task.id 
                            ? 'border-brand-navy bg-brand-navy/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium">{task.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {typeof task.priority === 'string' 
                              ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) 
                              : 'Medium'}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No suggested tasks available</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="all">
                {tasks.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tasks
                      .filter(task => task.status !== 'done')
                      .map(task => (
                        <div 
                          key={task.id}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            selectedTask?.id === task.id 
                              ? 'border-brand-navy bg-brand-navy/5' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex justify-between">
                            <h4 className="font-medium">{task.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                              task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {typeof task.priority === 'string' 
                                ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) 
                                : 'Medium'}
                            </span>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No tasks available</p>
                    <Link href="/tasks/new" className="text-brand-navy hover:underline mt-2 inline-block">
                      Create a new task
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleStartFocus}
              disabled={!selectedTask}
            >
              Start Focus Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* End Focus Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Focus Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to end your current focus session?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-600">
              You've been focusing for {formatTime(elapsedTime)}. Ending the session will save your progress.
            </p>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsEndDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleEndFocus}
            >
              End Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Record Distraction Dialog */}
      <Dialog open={isDistractionDialogOpen} onOpenChange={setIsDistractionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Distraction</DialogTitle>
            <DialogDescription>
              What distracted you from your focus?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={distractionDescription}
                onChange={(e) => setDistractionDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="What distracted you?"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={distractionCategory}
                onChange={(e) => setDistractionCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Social Media">Social Media</option>
                <option value="Notification">Notification</option>
                <option value="Phone">Phone</option>
                <option value="Person">Person</option>
                <option value="Hunger">Hunger</option>
                <option value="Tiredness">Tiredness</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsDistractionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleRecordDistraction}
              disabled={!distractionDescription}
            >
              Record Distraction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 