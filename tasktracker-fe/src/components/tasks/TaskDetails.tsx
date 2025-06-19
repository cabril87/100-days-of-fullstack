'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TimeProgressBar } from '@/components/ui/TimeProgressBar';
import { AssigneeList } from '@/components/ui/AssigneeList';
import {
  Calendar, Clock, Edit, Trash2, CheckCircle, Circle, Plus, X, Save, 
  Target, Tag, Timer, TrendingUp, ArrowLeft, Trophy, 
  Sparkles, Brain
} from 'lucide-react';
import TaskCreationModal from './TaskCreationModal';
import { TaskDetailProps, TaskDetailData, Task } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import { priorityIntToString } from '@/lib/utils/priorityMapping';

export default function TaskDetails({ taskId, user, onTaskUpdated, onTaskDeleted }: TaskDetailProps) {
  const router = useRouter();
  const [taskDetail, setTaskDetail] = useState<TaskDetailData>({
    task: {} as Task,
    checklist: [],
    timeTracking: null,
    tags: [],
    isLoading: true,
    error: undefined
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [progressNotes, setProgressNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load task details
  const loadTaskDetails = useCallback(async () => {
    try {
      setTaskDetail(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      console.log('🔍 TaskDetails: Loading task details for ID:', taskId);
      
      // Fetch all required data in parallel
      const [task, checklist, timeTracking] = await Promise.all([
        taskService.getTaskById(taskId),
        taskService.getTaskChecklist(taskId),
        taskService.getTaskTimeTracking(taskId)
      ]);

      if (!task) {
        setTaskDetail(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Task not found' 
        }));
        return;
      }

      // Use tags from task object if available, otherwise fetch separately
      let tags = task.tags || [];
      console.log('🏷️ TaskDetails: Using tags from task object:', tags);
      
      if (tags.length === 0) {
        try {
          const tagNames = await taskService.getTaskTags(taskId);
          console.log('🏷️ TaskDetails: Fetched tag names separately:', tagNames);
          // Convert string tags to TagDto objects
          tags = tagNames.map((name, index) => ({
            id: index + 1, // Temporary ID for display
            name,
            color: '#6366f1' // Default color
          }));
        } catch (error) {
          console.warn('Failed to fetch separate tags, using empty array:', error);
          tags = [];
        }
      }

      setTaskDetail({
        task,
        checklist,
        timeTracking,
        tags,
        isLoading: false,
        error: undefined
      });
    } catch (error) {
      console.error('Failed to load task details:', error);
      setTaskDetail(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load task details' 
      }));
    }
  }, [taskId]);

  useEffect(() => {
    loadTaskDetails();
  }, [loadTaskDetails]);

  // Task actions
  const handleEditTask = () => {
    setEditingTask(taskDetail.task);
    setIsEditing(true);
  };

  const handleTaskUpdated = (updatedTask?: Task) => {
    if (updatedTask) {
      setTaskDetail(prev => ({ ...prev, task: updatedTask }));
      setIsEditing(false);
      setEditingTask(null);
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
    }
  };

  const handleDeleteTask = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this quest? This cannot be undone.');
    if (!confirmed) return;

    try {
      await taskService.deleteTask(taskId);
      if (onTaskDeleted) {
        onTaskDeleted(taskId);
      }
      router.push('/tasks');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCompleteTask = async () => {
    try {
      const updatedTask = await taskService.completeTask(taskId);
      setTaskDetail(prev => ({ ...prev, task: updatedTask }));
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
      
      // 🎵 Play task completion sound
      const { soundService } = await import('@/lib/services/soundService');
      soundService.playTaskComplete();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  // Checklist actions
  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return;

    try {
      const item = await taskService.addChecklistItem(taskId, {
        title: newChecklistItem.trim(),
        isCompleted: false,
        order: taskDetail.checklist.length
      });

      if (item) {
        setTaskDetail(prev => ({
          ...prev,
          checklist: [...prev.checklist, item]
        }));
        setNewChecklistItem('');
      }
    } catch (error) {
      console.error('Failed to add checklist item:', error);
    }
  };

  const handleToggleChecklistItem = async (itemId: number, isCompleted: boolean) => {
    try {
      await taskService.updateChecklistItem(taskId, itemId, { isCompleted });
      setTaskDetail(prev => ({
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === itemId ? { ...item, isCompleted } : item
        )
      }));
    } catch (error) {
      console.error('Failed to update checklist item:', error);
    }
  };

  const handleDeleteChecklistItem = async (itemId: number) => {
    try {
      await taskService.deleteChecklistItem(taskId, itemId);
      setTaskDetail(prev => ({
        ...prev,
        checklist: prev.checklist.filter(item => item.id !== itemId)
      }));
    } catch (error) {
      console.error('Failed to delete checklist item:', error);
    }
  };

  // Progress tracking
  const handleUpdateProgress = async () => {
    if (!progressNotes.trim()) return;

    const completedItems = taskDetail.checklist.filter(item => item.isCompleted).length;
    const totalItems = taskDetail.checklist.length;
    const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // TODO: Implement progress tracking API
    console.log('Progress update:', { progressPercentage, notes: progressNotes });
      setProgressNotes('');
  };

  // ✅ NEW: Helper function to format task titles (Title Case)
  const formatTaskTitle = (title: string): string => {
    if (!title) return '';
    
    return title
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // ✅ NEW: Helper function to format descriptions (Sentence case)
  const formatDescription = (description: string): string => {
    if (!description) return '';
    
    // Capitalize first letter, keep rest as-is (preserve intentional capitalization)
    return description.charAt(0).toUpperCase() + description.slice(1);
  };

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'High': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      case 'Medium': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'Low': return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent': return '🔥';
      case 'High': return '⚡';
      case 'Medium': return '🎯';
      case 'Low': return '🌱';
      default: return '📋';
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeEstimate = (minutes?: number) => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Utility function to safely get priority display
  const getPriorityDisplay = (priority: string | number | undefined | null): string => {
    // Handle null, undefined, empty string - but allow 0 since it's valid (Low priority)
    if (priority === null || priority === undefined || priority === '') return '';
    
    // Convert to string first, then try to parse as number
    const priorityStr = String(priority).trim();
    
    // Try to parse as number first (handles "0", "1", "2", "3", 0, 1, 2, 3)
    const numPriority = parseInt(priorityStr, 10);
    if (!isNaN(numPriority) && numPriority >= 0 && numPriority <= 3) {
      return priorityIntToString(numPriority);
    }
    
    // If it's already a valid priority string, return it
    const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
    if (validPriorities.includes(priorityStr)) {
      return priorityStr;
    }
    
    // If we still don't have a valid priority, return fallback
    return 'Medium';
  };

  // Calculate checklist progress
  const completedChecklistItems = taskDetail.checklist.filter(item => item.isCompleted).length;
  const checklistProgress = taskDetail.checklist.length > 0 
    ? (completedChecklistItems / taskDetail.checklist.length) * 100 
    : 0;

  // Gamification calculations
  const getXPForTask = (task: Task) => {
    let baseXP = task.pointsValue || 10;
    if (task.priority === 'Urgent') baseXP *= 2;
    else if (task.priority === 'High') baseXP *= 1.5;
    return Math.floor(baseXP);
  };

  const getDifficultyBadge = (task: Task) => {
    const xp = getXPForTask(task);
    if (xp >= 100) return { icon: '👑', label: 'Legendary', color: 'from-yellow-500 to-orange-500' };
    if (xp >= 50) return { icon: '💎', label: 'Epic', color: 'from-purple-500 to-pink-500' };
    if (xp >= 25) return { icon: '🌟', label: 'Rare', color: 'from-blue-500 to-cyan-500' };
    if (xp >= 10) return { icon: '⭐', label: 'Common', color: 'from-green-500 to-blue-500' };
    return { icon: '🔸', label: 'Basic', color: 'from-gray-400 to-gray-500' };
  };

  if (taskDetail.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (taskDetail.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <div className="max-w-6xl mx-auto p-6">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-600">
                <div className="text-2xl">💥</div>
                <div>
                  <h3 className="font-bold text-lg">Quest Load Failed</h3>
                  <p className="text-red-500">{taskDetail.error}</p>
                  <Button 
                    onClick={() => router.push('/tasks')} 
                    className="mt-4 bg-red-600 hover:bg-red-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Quest Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { task } = taskDetail;
  const difficultyBadge = getDifficultyBadge(task);
  const taskXP = getXPForTask(task);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Enhanced Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl"></div>
          <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl">
            <CardContent className="p-6 sm:p-8">
              
              {/* Navigation & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <Button
                  variant="outline"
                  onClick={() => router.push('/tasks')}
                  className="w-fit bg-white/50 hover:bg-white/80 border-purple-200 hover:border-purple-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quest Dashboard
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleEditTask}
                    className="bg-white/50 hover:bg-white/80 border-blue-200 hover:border-blue-300"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Quest
                  </Button>
                  
                  {!task.isCompleted && (
                    <Button
                      onClick={handleCompleteTask}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Complete Quest
                      <Sparkles className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleDeleteTask}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Quest Title & Status */}
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  
                  {/* Title Section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                          task.isCompleted 
                            ? 'bg-gradient-to-br from-green-500 to-green-600' 
                            : 'bg-gradient-to-br from-purple-500 to-blue-600'
                        }`}>
                          {task.isCompleted ? (
                            <Trophy className="w-8 h-8 text-white" />
                          ) : (
                            <Target className="w-8 h-8 text-white" />
                          )}
                        </div>
                        {task.isCompleted && (
                          <div className="absolute -top-1 -right-1 text-2xl animate-bounce">✨</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
                          task.isCompleted 
                            ? 'text-green-600 dark:text-green-400 line-through'
                            : 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent'
                        }`}>
                          {formatTaskTitle(task.title)}
                        </h1>
                        
                        {task.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            {formatDescription(task.description)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Badges */}
                    <div className="flex flex-wrap gap-3">
                      <Badge className={`${getPriorityColor(task.priority)} text-base font-medium px-4 py-2 shadow-lg`}>
                        {getPriorityIcon(task.priority)} {getPriorityDisplay(task.priority)} Priority
                      </Badge>
                      
                      <Badge className={`bg-gradient-to-r ${difficultyBadge.color} text-white text-base font-medium px-4 py-2 shadow-lg`}>
                        {difficultyBadge.icon} {difficultyBadge.label} Quest
                      </Badge>
                      
                      <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-base font-medium px-4 py-2 shadow-lg">
                        ⭐ {taskXP} XP Reward
                      </Badge>
                      
                      {task.isCompleted && (
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-base font-medium px-4 py-2 shadow-lg animate-pulse">
                          🏆 COMPLETED
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Quest Statistics Panel */}
                  <div className="lg:w-80">
                    <Card className="bg-gradient-to-br from-white/80 to-purple-50/80 dark:from-gray-800/80 dark:to-purple-900/20 border-purple-200 dark:border-purple-700">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Quest Intel
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        
                        {/* Progress Ring */}
                        {taskDetail.checklist.length > 0 && (
                          <div className="text-center space-y-2">
                            <div className="relative w-20 h-20 mx-auto">
                              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  className="text-gray-200 dark:text-gray-700"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  stroke="currentColor"
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray={`${2 * Math.PI * 40}`}
                                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - checklistProgress / 100)}`}
                                  className="text-purple-500 transition-all duration-500"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                  {Math.round(checklistProgress)}%
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Quest Progress</p>
                          </div>
                        )}

                        {/* Meta Info Grid */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {task.dueDate && (
                            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                              <Calendar className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                              <div className="font-medium text-orange-800 dark:text-orange-300">Due Date</div>
                              <div className="text-orange-600 dark:text-orange-400 text-xs">
                                {formatDate(task.dueDate)}
                              </div>
                            </div>
                          )}
                          
                          {task.estimatedTimeMinutes && (
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                              <Timer className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                              <div className="font-medium text-blue-800 dark:text-blue-300">Duration</div>
                              <div className="text-blue-600 dark:text-blue-400 text-xs">
                                {formatTimeEstimate(task.estimatedTimeMinutes)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ✨ ENHANCED: Time Progress Bar */}
                        {task.dueDate && (
                          <TimeProgressBar 
                            dueDate={task.dueDate} 
                            isCompleted={task.isCompleted}
                            className="mt-4"
                          />
                        )}

                        {/* ✨ ENHANCED: Assignment Display */}
                        {task.assignedToUserName && (
                          <div className="mt-4">
                            <AssigneeList 
                              assignees={[
                                {
                                  id: task.assignedToUserId || 1,
                                  name: task.assignedToUserName,
                                  isCreator: false
                                }
                              ]} 
                              size="md"
                              className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
                            />
                          </div>
                        )}

                        {/* Checklist Summary */}
                        {taskDetail.checklist.length > 0 && (
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-purple-800 dark:text-purple-300">Quest Steps</span>
                              <span className="text-sm text-purple-600 dark:text-purple-400">
                                {completedChecklistItems} of {taskDetail.checklist.length}
                              </span>
                            </div>
                            <Progress value={checklistProgress} className="h-2">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500" 
                                style={{ width: `${checklistProgress}%` }} 
                              />
                            </Progress>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags Section */}
        {taskDetail.tags.length > 0 && (
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Tag className="h-6 w-6 text-cyan-600" />
                Quest Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {taskDetail.tags.map((tag, index) => (
                  <Badge key={tag.id || index} className="text-base px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 text-cyan-700 dark:text-cyan-400 border-2 border-cyan-200 dark:border-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Checklist */}
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Quest Steps
              {taskDetail.checklist.length > 0 && (
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  {completedChecklistItems}/{taskDetail.checklist.length} Complete
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Add New Step */}
            <div className="flex gap-3">
              <Input
                placeholder="Add a new quest step..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                className="flex-1 h-12 text-base border-2 border-green-200 dark:border-green-700 focus:border-green-500 bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-green-900/20"
              />
              <Button
                onClick={handleAddChecklistItem}
                disabled={!newChecklistItem.trim()}
                className="h-12 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Step
              </Button>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {taskDetail.checklist.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="text-6xl">📝</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      No quest steps yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Break down your quest into manageable steps to track progress!
                    </p>
                  </div>
                </div>
              ) : (
                taskDetail.checklist.map((item, index) => (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-lg ${
                      item.isCompleted
                        ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    {/* Step Number */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                    }`}>
                      {item.isCompleted ? '✓' : index + 1}
                    </div>
                    
                    {/* Completion Toggle */}
                    <button
                      onClick={() => handleToggleChecklistItem(item.id, !item.isCompleted)}
                      className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                    >
                      {item.isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-green-600 transition-colors" />
                      )}
                    </button>
                    
                    {/* Step Content */}
                    <span className={`flex-1 text-base ${
                      item.isCompleted 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {formatDescription(item.title)} {/* ✅ FIXED: Apply sentence case formatting */}
                    </span>
                    
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Time Tracking */}
        {taskDetail.timeTracking && (
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Timer className="h-6 w-6 text-blue-600" />
                Quest Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { 
                    label: 'Estimated', 
                    value: formatTimeEstimate(taskDetail.timeTracking.estimatedTimeMinutes),
                    icon: Target,
                    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                  },
                  { 
                    label: 'Actual', 
                    value: formatTimeEstimate(taskDetail.timeTracking.actualTimeMinutes),
                    icon: Clock,
                    color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  },
                  { 
                    label: 'Time Spent', 
                    value: formatTimeEstimate(taskDetail.timeTracking.timeSpent),
                    icon: Timer,
                    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
                  },
                  { 
                    label: 'Remaining', 
                    value: formatTimeEstimate(taskDetail.timeTracking.timeRemaining),
                    icon: TrendingUp,
                    color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700'
                  }
                ].map((metric, index) => (
                  <div key={index} className={`text-center p-4 rounded-xl border-2 ${metric.color}`}>
                    <metric.icon className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-bold text-lg">{metric.value}</div>
                    <div className="text-sm opacity-80">{metric.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Progress Notes */}
        <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Quest Journal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Record your quest progress, discoveries, and challenges..."
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                rows={4}
                className="text-base border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20"
              />
              <Button
                onClick={handleUpdateProgress}
                disabled={!progressNotes.trim()}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Progress Entry
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Edit Task Modal */}
        <TaskCreationModal
          user={user}
          family={null}
          onTaskCreated={handleTaskUpdated}
          isOpen={isEditing}
          onOpenChange={setIsEditing}
          editingTask={editingTask}
        />
      </div>
    </div>
  );
} 