'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search, CheckCircle, Circle, Clock, Calendar, Trash2, Edit, Plus,
  Sparkles, RefreshCw, Eye, Trophy, Target, Zap, Star,
  Flame, Timer, Crown, Rocket, Users, MoreVertical
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import TaskCreationModal from './TaskCreationModal';
import ErrorModal from '@/components/ui/ErrorModal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import CompletionModal from '@/components/ui/completion-modal';
import { TasksPageContentProps, Task, TaskStats } from '@/lib/types/task';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';
import { taskService } from '@/lib/services/taskService';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { formatDistance } from 'date-fns';
import { priorityIntToString } from '@/lib/utils/priorityMapping';

export default function TasksPageContent({ user, initialData }: TasksPageContentProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks || []);
  const [stats, setStats] = useState<TaskStats>(initialData.stats);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'family' | 'queue' | 'progress' | 'completed'>('overview');
  // ✨ NEW: Family Task Collaboration State
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [hasFamily, setHasFamily] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: Record<string, unknown>;
    type?: 'error' | 'warning' | 'info';
    showDetails?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error',
    showDetails: false
  });

  // Modal states for deletion and completion
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    taskId: number | null;
    taskTitle: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
    isLoading: false
  });

  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean;
    taskTitle: string;
    xpEarned: number;
    newLevel?: number;
    achievements: string[];
    streakDays: number;
  }>({
    isOpen: false,
    taskTitle: '',
    xpEarned: 0,
    achievements: [],
    streakDays: 0
  });

  // Check if this is a fallback user (not actually authenticated)
  const isFallbackUser = user && user.id === 0 && user.email === 'loading@example.com';



  // Load tasks on component mount
  useEffect(() => {
    // If it's a fallback user, try to load tasks to verify authentication
    if (isFallbackUser) {
      console.log('🔍 Fallback user detected, verifying authentication...');
    }
    loadTasks();

    // Check for tab parameter in URL for deep linking
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['overview', 'family', 'queue', 'progress', 'completed'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [isFallbackUser]);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const [recentTasks, taskStats] = await Promise.all([
        taskService.getRecentTasks(50), // Load more tasks for full view
        taskService.getUserTaskStats()
      ]);
      setTasks(recentTasks);
      setStats(taskStats);

      // ✨ NEW: Load family data if user has family access
      try {
        const families = await familyInvitationService.getAllFamilies();
        console.log('📋 Tasks: Loading family data...', { familiesCount: families?.length || 0 });
        
        if (families && families.length > 0) {
          setHasFamily(true);
          // Load family members for the first family (user's family)
          const members = await familyInvitationService.getFamilyMembers(families[0].id);
          setFamilyMembers(members);
          console.log('📋 Tasks: Family data loaded successfully', { 
            hasFamily: true, 
            membersCount: members.length,
            familyId: families[0].id 
          });
        } else {
          console.log('📋 Tasks: User has no family');
          setHasFamily(false);
        }
      } catch (familyError) {
        console.warn('📋 Tasks: Failed to load family data:', familyError);
        setHasFamily(false);
      }

      console.log('✅ Tasks loaded successfully:', recentTasks.length, 'tasks');
    } catch (error: unknown) {
      console.error('Failed to load tasks:', error);

      // Check if it's an authentication error
      const errorObj = error as { statusCode?: number; message?: string };
      if (errorObj?.statusCode === 401 || errorObj?.message?.includes('unauthorized')) {
        console.log('🔐 Authentication error detected, redirecting to login...');
        setAuthError('Please log in to view your tasks');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth/login?redirect=/tasks';
        }, 1000);
      } else {
        setAuthError('Failed to load tasks. Please try refreshing the page.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Edit task handler
  const handleEditTask = (task: Task) => {
    console.log('✏️ Editing task:', task);
    setEditingTask(task);
    setShowTaskModal(true);
  };

  // Enhanced task creation/update handler
  const handleTaskCreated = (newTask: Task) => {
    console.log('🎯 Tasks handleTaskCreated/Updated called with:', newTask);

    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(task =>
        task.id === editingTask.id ? newTask : task
      ));
      console.log(`✅ Task ${newTask.id} updated in local state`);
      setEditingTask(null);
    } else {
      // Add new task
      if (newTask && newTask.id) {
        setTasks(prev => [newTask, ...prev]);
        console.log('✅ Task added to local state with ID:', newTask.id);
      }
    }

    setShowTaskModal(false);

    // Update stats locally for new tasks
    if (!editingTask && newTask) {
      setStats(prev => ({
        ...prev,
        totalTasks: (prev.totalTasks || 0) + 1,
        activeTasks: (prev.activeTasks || 0) + 1
      }));
      console.log('📊 Local stats updated after task creation');
    }
  };

  // Batch operations
  const handleSelectTask = (taskId: number) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleBatchComplete = async () => {
    try {
      const selectedTaskIds = Array.from(selectedTasks);
      const batchResult = await taskService.batchCompleteTasks(selectedTaskIds);

      if (batchResult.success) {
        setTasks(prev => prev.map(task =>
          selectedTaskIds.includes(task.id)
            ? { ...task, isCompleted: true, completedAt: new Date() }
            : task
        ));
        setSelectedTasks(new Set());

        // Update stats locally
        setStats(prev => ({
          ...prev,
          completedTasks: (prev.completedTasks || 0) + selectedTaskIds.length,
          activeTasks: Math.max(0, (prev.activeTasks || 0) - selectedTaskIds.length)
        }));

        console.log(`📊 Local stats updated after batch completion of ${selectedTaskIds.length} tasks`);
      }
    } catch (error) {
      console.error('Failed to complete tasks:', error);

      // Handle authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🔐 Authentication expired. Redirecting to login...');
        window.location.href = '/auth/login?message=Session expired. Please log in again.';
        return;
      }

      // Show error to user for other types of errors
      setErrorModal({
        isOpen: true,
        title: 'Batch Completion Failed',
        message: 'Failed to complete the selected tasks. Please try again.',
        details: error instanceof Error ? { error: error.message } : { error: 'Unknown error' },
        type: 'error',
        showDetails: false
      });
    }
  };

  const handleBatchDelete = () => {
    if (selectedTasks.size === 0) return;

    setDeleteModal({
      isOpen: true,
      taskId: -1, // Special value for batch delete
      taskTitle: `${selectedTasks.size} selected tasks`,
      isLoading: false
    });
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleOpenTaskModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      const taskToComplete = tasks.find(t => t.id === taskId);
      if (!taskToComplete) return;

      const updatedTask = await taskService.completeTask(taskId);
      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Calculate XP based on priority
      const priorityXP = {
        'Urgent': 50,
        'High': 30,
        'Medium': 20,
        'Low': 10
      };
      const xpEarned = priorityXP[taskToComplete.priority as keyof typeof priorityXP] || 10;

      // Update stats locally without refetching
      const previousLevel = calculateLevel(stats.totalPoints);
      const newTotalPoints = (stats.totalPoints || 0) + xpEarned;
      const newLevel = calculateLevel(newTotalPoints);

      setStats(prev => ({
        ...prev,
        completedTasks: (prev.completedTasks || 0) + 1,
        activeTasks: Math.max(0, (prev.activeTasks || 0) - 1),
        totalPoints: newTotalPoints,
        streakDays: (prev.streakDays || 0) + 1 // Simplified streak calculation
      }));

      // Check for new achievements
      const newCompletedCount = (stats.completedTasks || 0) + 1;
      const achievements = [];
      if (newCompletedCount === 1) achievements.push('First Quest');
      if (newCompletedCount === 10) achievements.push('Getting Started');
      if (newCompletedCount === 25) achievements.push('Quarter Century');
      if (newCompletedCount === 50) achievements.push('Half Century');
      if (newCompletedCount === 100) achievements.push('Centurion');
      if (newLevel > previousLevel) achievements.push('Level Up');

      // Show completion celebration modal
      setCompletionModal({
        isOpen: true,
        taskTitle: taskToComplete.title,
        xpEarned,
        newLevel: newLevel > previousLevel ? newLevel : undefined,
        achievements,
        streakDays: (stats.streakDays || 0) + 1
      });

      console.log('📊 Local stats updated after task completion');
    } catch (error) {
      console.error('Failed to complete task:', error);

      // Handle authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🔐 Authentication expired. Redirecting to login...');
        window.location.href = '/auth/login?message=Session expired. Please log in again.';
        return;
      }

      // Show error to user for other types of errors
      setErrorModal({
        isOpen: true,
        title: 'Task Completion Failed',
        message: 'Failed to complete the task. Please try again.',
        details: error instanceof Error ? { error: error.message } : { error: 'Unknown error' },
        type: 'error',
        showDetails: false
      });
    }
  };

  const handleDeleteTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setDeleteModal({
      isOpen: true,
      taskId,
      taskTitle: task.title,
      isLoading: false
    });
  };

  const confirmDeleteTask = async () => {
    if (!deleteModal.taskId) return;

    setDeleteModal(prev => ({ ...prev, isLoading: true }));

    try {
      if (deleteModal.taskId === -1) {
        // Batch delete
        const selectedTaskIds = Array.from(selectedTasks);
        const batchResult = await taskService.batchDeleteTasks(selectedTaskIds);

        if (batchResult.success) {
          setTasks(prev => prev.filter(task => !selectedTaskIds.includes(task.id)));
          setSelectedTasks(new Set());

          // Update stats locally
          setStats(prev => ({
            ...prev,
            totalTasks: Math.max(0, (prev.totalTasks || 0) - selectedTaskIds.length),
            activeTasks: Math.max(0, (prev.activeTasks || 0) - selectedTaskIds.length)
          }));

          console.log('📊 Local stats updated after batch deletion');
        }
      } else {
        // Single task delete
        console.log('🗑️ Deleting task with ID:', deleteModal.taskId);
        await taskService.deleteTask(deleteModal.taskId);
        console.log('✅ Task deleted successfully from backend');

        // Update local state immediately
        setTasks(prev => {
          const newTasks = prev.filter(task => task.id !== deleteModal.taskId);
          console.log('📝 Updated local tasks state, removed task:', deleteModal.taskId);
          console.log('📊 New tasks count:', newTasks.length);
          return newTasks;
        });

        // Also remove from selected tasks if it was selected
        setSelectedTasks(prev => {
          const newSelected = new Set(prev);
          newSelected.delete(deleteModal.taskId!);
          return newSelected;
        });

        // Update stats locally without refetching from API
        setStats(prev => ({
          ...prev,
          totalTasks: Math.max(0, (prev.totalTasks || 0) - 1),
          activeTasks: Math.max(0, (prev.activeTasks || 0) - 1) // Assume deleted task was active
        }));

        console.log('📊 Local stats updated after deletion');
      }

      // Close modal
      setDeleteModal({
        isOpen: false,
        taskId: null,
        taskTitle: '',
        isLoading: false
      });
    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      setDeleteModal(prev => ({ ...prev, isLoading: false }));

      // Handle authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🔐 Authentication expired. Redirecting to login...');
        window.location.href = '/auth/login?message=Session expired. Please log in again.';
        return;
      }

      setErrorModal({
        isOpen: true,
        title: 'Delete Failed',
        message: 'Failed to delete the task. Please try again.',
        details: error instanceof Error ? { error: error.message } : { error: 'Unknown error' },
        type: 'error',
        showDetails: false
      });
    }
  };

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
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

  // Gamification calculations
  const calculateLevel = (points: number) => Math.floor((points || 0) / 100) + 1;
  const calculateProgress = (points: number) => ((points || 0) % 100);
  const getAchievementBadges = () => {
    const badges = [];
    if ((stats.streakDays || 0) >= 7) badges.push({ icon: '🔥', title: 'Week Warrior' });
    if ((stats.completedTasks || 0) >= 50) badges.push({ icon: '💎', title: 'Task Master' });
    if ((stats.totalPoints || 0) >= 500) badges.push({ icon: '👑', title: 'Points King' });
    if ((stats.completedTasks || 0) >= 100) badges.push({ icon: '🏆', title: 'Centurion' });
    return badges;
  };

  // Utility function to truncate text to specified word count
  const truncateToWords = (text: string, wordLimit: number): string => {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
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

    // If we still don't have a valid priority, don't show it
    return '';
  };

  // ✨ NEW: Helper function to get family member by user ID
  const getFamilyMemberByUserId = (userId: number | undefined) => {
    if (!userId) return null;
    return familyMembers.find(member => member.userId === userId);
  };

  // Filter tasks based on active tab and other filters
  const filteredTasks = tasks.filter(task => {
    // Enhanced search filter - search in title, description, and tags
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
      const tagMatch = task.tags?.some(tag => tag.name.toLowerCase().includes(searchLower));

      if (!titleMatch && !descriptionMatch && !tagMatch) {
        return false;
      }
    }

    // Tab-based filtering
    switch (activeTab) {
      case 'overview':
        // Show all tasks for overview
        break;
      case 'family':
        // Show tasks assigned to/from family members (family collaboration)
        if (!task.assignedToUserId && !task.familyId) return false;
        break;
      case 'queue':
        // Show lower priority tasks (in queue waiting for attention)
        if (task.isCompleted) return false;
        if (task.priority !== 'Low' && task.priority !== 'Medium') return false;
        break;
      case 'progress':
        // Show high priority tasks (actively being worked on)
        if (task.isCompleted) return false;
        if (task.priority !== 'High' && task.priority !== 'Urgent') return false;
        break;
      case 'completed':
        // Show only completed tasks
        if (!task.isCompleted) return false;
        break;
    }

    // Legacy status filter (keep for compatibility)
    if (filterStatus !== 'all') {
      if (filterStatus === 'completed' && !task.isCompleted) return false;
      if (filterStatus === 'pending' && task.isCompleted) return false;
    }

    // Priority filter
    if (filterPriority !== 'all' && task.priority !== filterPriority) {
      return false;
    }

    return true;
  });

  // Gamification data
  const currentLevel = calculateLevel(stats.totalPoints);
  const levelProgress = calculateProgress(stats.totalPoints);
  const achievementBadges = getAchievementBadges();

  // Tab-specific task counts with better logic
  const tabCounts = {
    overview: tasks.length,
    family: tasks.filter(task => 
      // Tasks assigned to family members or tasks within family context
      task.assignedToUserId || task.familyId || 
      // Tasks assigned to me by family members
      (task.assignedToUserId === user?.id && familyMembers.some(m => m.userId === task.assignedToUserId))
    ).length,
    queue: tasks.filter(task => !task.isCompleted && (task.priority === 'Low' || task.priority === 'Medium')).length, // Lower priority tasks waiting
    progress: tasks.filter(task => !task.isCompleted && (task.priority === 'High' || task.priority === 'Urgent')).length, // High priority active tasks
    completed: tasks.filter(task => task.isCompleted).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6 w-full">

          {/* Authentication Error Alert */}
          {authError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-red-600 text-xl">🔐</div>
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">Authentication Required</h3>
                  <p className="text-red-600 dark:text-red-400 text-sm">{authError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Gamified Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-3xl"></div>
            <Card className="border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-2xl">
              <CardContent className="p-2 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* Title & Level Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <Crown className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {currentLevel || 1}
                        </div>
                      </div>
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          Quest Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                          Level {currentLevel || 1} Task Master • {stats.streakDays || 0} day streak 🔥
                        </p>
                      </div>
                    </div>

                    {/* Level Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Level Progress</span>
                        <span className="font-medium">{levelProgress || 0}/100 XP</span>
                      </div>
                      <Progress value={levelProgress} className="h-2 bg-gray-200 dark:bg-gray-700">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${levelProgress || 0}%` }} />
                      </Progress>
                      <p className="text-xs text-gray-500">
                        {100 - (levelProgress || 0)} XP to Level {(currentLevel || 1) + 1}
                      </p>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Achievements</h3>
                    <div className="flex flex-wrap gap-3">
                      {achievementBadges.length > 0 ? achievementBadges.map((badge, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium">
                          <span className="text-lg">{badge.icon}</span>
                          {badge.title}
                        </div>
                      )) : (
                        <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                          Complete more tasks to unlock achievements! 🏆
                        </div>
                      )}
                    </div>
                  </div>


                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
            {/* Total Tasks */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{stats.totalTasks || 0}</div>
                    <p className="text-blue-100 text-sm font-medium">Total Quests</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            {/* Completed Tasks */}
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{stats.completedTasks || 0}</div>
                    <p className="text-green-100 text-sm font-medium">Completed</p>
                  </div>
                  <Trophy className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{stats.activeTasks || 0}</div>
                    <p className="text-orange-100 text-sm font-medium">Active</p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            {/* Overdue Tasks */}
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{stats.overdueTasks || 0}</div>
                    <p className="text-red-100 text-sm font-medium">Overdue</p>
                  </div>
                  <Timer className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            {/* Total Points */}
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{stats.totalPoints || 0}</div>
                    <p className="text-purple-100 text-sm font-medium">XP Points</p>
                  </div>
                  <Star className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            {/* Streak Days */}
            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold">{stats.streakDays || 0}</div>
                    <p className="text-yellow-100 text-sm font-medium">Day Streak</p>
                  </div>
                  <Flame className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
                        </Card>
          </div>



          {/* Batch Operations Controls */}
          {isBatchMode && (
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="flex items-center gap-2 bg-white/80 hover:bg-white"
                        title={selectedTasks.size === filteredTasks.length ? 'Deselect all tasks' : 'Select all tasks'}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {selectedTasks.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
                        </span>
                      </Button>
                      <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        {selectedTasks.size} of {filteredTasks.length} selected
                      </span>
                    </div>
                    {selectedTasks.size > 0 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBatchComplete}
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-green-200"
                          title={`Complete ${selectedTasks.size} selected tasks`}
                        >
                          <Trophy className="h-4 w-4" />
                          <span className="hidden sm:inline">Complete ({selectedTasks.size})</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBatchDelete}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                          title={`Delete ${selectedTasks.size} selected tasks`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete ({selectedTasks.size})</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mobile-Optimized Quest Header, Search and Filters */}
          <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-0 shadow-xl">
            <CardContent className="p-2 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Quest Header */}
                <div className="flex flex-col space-y-2">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {activeTab === 'overview' && (
                      <>
                        <span className="text-xl sm:text-2xl">📊</span>
                        <span>All Tasks</span>
                      </>
                    )}
                    {activeTab === 'family' && (
                      <>
                        <span className="text-xl sm:text-2xl">👨‍👩‍👧‍👦</span>
                        <span>Family Tasks</span>
                      </>
                    )}
                    {activeTab === 'queue' && (
                      <>
                        <span className="text-xl sm:text-2xl">⏳</span>
                        <span>In Queue</span>
                      </>
                    )}
                    {activeTab === 'progress' && (
                      <>
                        <span className="text-xl sm:text-2xl">⚡</span>
                        <span>In Progress</span>
                      </>
                    )}
                    {activeTab === 'completed' && (
                      <>
                        <span className="text-xl sm:text-2xl">✅</span>
                        <span>Completed</span>
                      </>
                    )}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredTasks.length} {filteredTasks.length === 1 ? 'quest' : 'quests'}
                    {searchTerm && ` matching "${searchTerm}"`}
                    {activeTab === 'queue' && ' waiting to be started'}
                    {activeTab === 'progress' && ' currently in progress'}
                    {activeTab === 'completed' && ' successfully completed'}
                    {activeTab === 'overview' && ' in total'}
                    {activeTab === 'family' && ' shared with your family'}
                  </p>
                </div>

                              {/* Search and Filters Container */}
              <div className="flex flex-col space-y-3">
                {/* Search Bar with Actions */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="🔍 Search quests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 h-10 text-sm border-2 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 transition-all duration-200"
                    />
                  </div>
                  {user && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadTasks}
                        disabled={isLoading}
                        className="h-10 px-3 border-gray-200 hover:border-gray-300"
                        title="Refresh tasks"
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBatchMode(!isBatchMode)}
                        className={`h-10 px-3 ${isBatchMode 
                          ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' 
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={isBatchMode ? "Exit batch mode" : "Enter batch mode"}
                      >
                        {isBatchMode ? <Circle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </Button>
                    </>
                  )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 sm:gap-3">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-10 border-2 border-blue-200 dark:border-blue-700 focus:border-blue-500 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                      <SelectValue placeholder="🎯 Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🎯 All Quests</SelectItem>
                      <SelectItem value="pending">⏳ In Progress</SelectItem>
                      <SelectItem value="completed">✅ Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="h-10 border-2 border-green-200 dark:border-green-700 focus:border-green-500 bg-gradient-to-r from-white to-green-50 dark:from-gray-800 dark:to-green-900/20">
                      <SelectValue placeholder="🌟 Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌟 All Priorities</SelectItem>
                      <SelectItem value="Urgent">🔥 Urgent</SelectItem>
                      <SelectItem value="High">⚡ High</SelectItem>
                      <SelectItem value="Medium">🎯 Medium</SelectItem>
                      <SelectItem value="Low">🌱 Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Quest Navigation - Mobile Dropdown + Desktop Tabs */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Mobile Dropdown Navigation */}
            <div className="block sm:hidden">
              <Select value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                <SelectTrigger className="w-full h-14 px-4 border-0 bg-transparent text-left font-medium">
                  <div className="flex items-center gap-3">
                    {activeTab === 'overview' && (
                      <>
                        <span className="text-2xl">📋</span>
                        <div>
                          <span className="font-semibold text-lg">All Tasks</span>
                          <div className="text-xs text-gray-500">{tabCounts.overview} quests</div>
                        </div>
                      </>
                    )}
                    {activeTab === 'family' && (
                      <>
                        <span className="text-2xl">👨‍👩‍👧‍👦</span>
                        <div>
                          <span className="font-semibold text-lg">Family</span>
                          <div className="text-xs text-gray-500">{tabCounts.family} quests</div>
                        </div>
                      </>
                    )}
                    {activeTab === 'queue' && (
                      <>
                        <span className="text-2xl">⏳</span>
                        <div>
                          <span className="font-semibold text-lg">In Queue</span>
                          <div className="text-xs text-gray-500">{tabCounts.queue} quests</div>
                        </div>
                      </>
                    )}
                    {activeTab === 'progress' && (
                      <>
                        <span className="text-2xl">⚡</span>
                        <div>
                          <span className="font-semibold text-lg">In Progress</span>
                          <div className="text-xs text-gray-500">{tabCounts.progress} quests</div>
                        </div>
                      </>
                    )}
                    {activeTab === 'completed' && (
                      <>
                        <span className="text-2xl">✅</span>
                        <div>
                          <span className="font-semibold text-lg">Completed</span>
                          <div className="text-xs text-gray-500">{tabCounts.completed} quests</div>
                        </div>
                      </>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent className="max-w-xs">
                  <SelectItem value="overview">
                    <div className="flex items-center gap-3 p-2">
                      <span className="text-xl">📋</span>
                      <div>
                        <div className="font-semibold">All Tasks</div>
                        <div className="text-xs text-gray-500">{tabCounts.overview} quests total</div>
                      </div>
                    </div>
                  </SelectItem>
                  {hasFamily && (
                    <SelectItem value="family">
                      <div className="flex items-center gap-3 p-2">
                        <span className="text-xl">👨‍👩‍👧‍👦</span>
                        <div>
                          <div className="font-semibold">Family</div>
                          <div className="text-xs text-gray-500">{tabCounts.family} family quests</div>
                        </div>
                      </div>
                    </SelectItem>
                  )}
                  <SelectItem value="queue">
                    <div className="flex items-center gap-3 p-2">
                      <span className="text-xl">⏳</span>
                      <div>
                        <div className="font-semibold">In Queue</div>
                        <div className="text-xs text-gray-500">{tabCounts.queue} waiting to start</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="progress">
                    <div className="flex items-center gap-3 p-2">
                      <span className="text-xl">⚡</span>
                      <div>
                        <div className="font-semibold">In Progress</div>
                        <div className="text-xs text-gray-500">{tabCounts.progress} active quests</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-3 p-2">
                      <span className="text-xl">✅</span>
                      <div>
                        <div className="font-semibold">Completed</div>
                        <div className="text-xs text-gray-500">{tabCounts.completed} finished</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden sm:block">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                  { id: 'overview', label: 'All Tasks', icon: '📋', count: tabCounts.overview },
                  ...(hasFamily ? [{ id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', count: tabCounts.family }] : []),
                  { id: 'queue', label: 'In Queue', icon: '⏳', count: tabCounts.queue },
                  { id: 'progress', label: 'In Progress', icon: '⚡', count: tabCounts.progress },
                  { id: 'completed', label: 'Completed', icon: '✅', count: tabCounts.completed }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 px-4 lg:px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 relative group ${activeTab === tab.id
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 hover:border-purple-300'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg">{tab.icon}</span>
                      <span className="hidden lg:inline font-semibold">{tab.label}</span>
                      <span className="lg:hidden font-semibold">{tab.label.split(' ')[0]}</span>
                      <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${activeTab === tab.id
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40'
                        }`}>
                        {tab.count}
                      </span>
                    </div>

                    {/* Active tab indicator */}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-purple-500 rounded-t-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content Description */}
              <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {activeTab === 'overview' && '📋 All your tasks in one comprehensive view'}
                  {activeTab === 'family' && hasFamily && `👨‍👩‍👧‍👦 Tasks shared with your family members • ${familyMembers.length} members • Collaboration hub`}
                  {activeTab === 'queue' && '⏳ Lower priority quests waiting to be started'}
                  {activeTab === 'progress' && '⚡ High priority quests currently in progress'}
                  {activeTab === 'completed' && '✅ Your victory history of completed quests'}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Task List */}
          <div className="space-y-4">
            {isLoading ? (
              <Card className="border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <div className="text-lg text-gray-600 dark:text-gray-400">Loading your quests...</div>
                  </div>
                </CardContent>
              </Card>
            ) : filteredTasks.length === 0 ? (
              tasks.length === 0 ? (
                <Card
                  className="border-dashed border-4 border-purple-300 dark:border-purple-600 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 hover:from-purple-100 hover:via-blue-100 hover:to-cyan-100 dark:hover:from-purple-800/30 dark:hover:via-blue-800/30 dark:hover:to-cyan-800/30 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 group"
                  onClick={handleOpenTaskModal}
                >
                  <CardContent className="p-12 text-center">
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110 mx-auto">
                          <Rocket className="w-12 h-12 text-white animate-bounce" />
                        </div>
                        <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                          🚀 Ready for Your First Quest?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Start your productivity journey! Create your first task and begin earning XP points.
                        </p>
                        <div className="flex justify-center">
                          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                            <Plus className="w-5 h-5 mr-2" />
                            Create First Quest
                            <Sparkles className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <div className="text-6xl">🔍</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          No quests match your filters
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Try adjusting your search criteria or clear filters to see all tasks
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className={`group transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${task.isCompleted
                  ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                  : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-gray-200 dark:border-gray-700'
                  } ${selectedTasks.has(task.id) ? 'ring-4 ring-blue-500/50 border-blue-400' : ''} border-2`}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">

                        {/* Batch Selection */}
                        {isBatchMode && (
                          <button
                            onClick={() => handleSelectTask(task.id)}
                            className="mt-1 flex-shrink-0 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            {selectedTasks.has(task.id) ? (
                              <CheckCircle className="h-6 w-6 text-blue-600" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-400 hover:text-blue-600" />
                            )}
                          </button>
                        )}

                        {/* Task Content */}
                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Task Header */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
                                {/* Priority Badge - only show if we get a valid priority string */}
                                {(() => {
                                  const priorityDisplay = getPriorityDisplay(task.priority);
                                  const getMobilePriority = (priority: string) => {
                                    switch(priority.toLowerCase()) {
                                      case 'urgent': return 'URG';
                                      case 'high': return 'HI';
                                      case 'medium': return 'MED';
                                      case 'low': return 'LOW';
                                      default: return priority.substring(0, 3).toUpperCase();
                                    }
                                  };
                                  
                                  return priorityDisplay && (
                                    <Badge className={`${getPriorityColor(task.priority)} text-xs font-bold px-2 py-1 flex items-center gap-1 flex-shrink-0 whitespace-nowrap`}>
                                      {getPriorityIcon(task.priority)}
                                      <span className="hidden sm:inline">{priorityDisplay}</span>
                                      <span className="sm:hidden">{getMobilePriority(priorityDisplay)}</span>
                                    </Badge>
                                  );
                                })()}
                                
                                {task.pointsValue && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-2 py-1 flex-shrink-0 whitespace-nowrap">
                                    ⭐ {task.pointsValue} XP
                                  </Badge>
                                )}
                                
                                {/* ✨ ENHANCED: Family task assignment badge with avatar */}
                                {task.assignedToUserId && task.assignedToUserName && (
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const assignedMember = getFamilyMemberByUserId(task.assignedToUserId);
                                      return (
                                        <>
                                          {/* Family member avatar */}
                                          {assignedMember && hasFamily && (
                                            <Avatar className="h-6 w-6">
                                              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-xs">
                                                {(assignedMember.user?.firstName?.[0] || task.assignedToUserName[0] || '?').toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                          )}
                                          {/* Assignment badge */}
                                          <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-xs font-bold px-2 py-1 flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                                            {!assignedMember && <Users className="h-3 w-3" />}
                                            {task.assignedToUserId === user?.id ? (
                                              <span className="text-yellow-200">👤 You</span>
                                            ) : (
                                              <>
                                                <span className="hidden sm:inline">{task.assignedToUserName}</span>
                                                <span className="sm:hidden">{task.assignedToUserName.split(' ')[0]}</span>
                                              </>
                                            )}
                                          </Badge>
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}

                                {/* ✨ NEW: Family task indicator for unassigned family tasks */}
                                {task.familyId && !task.assignedToUserId && hasFamily && (
                                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-2 py-1 flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                                    <Users className="h-3 w-3" />
                                    <span className="hidden sm:inline">Family Task</span>
                                    <span className="sm:hidden">Family</span>
                                  </Badge>
                                )}
                                
                                {task.isCompleted && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs font-bold px-2 py-1 flex-shrink-0 whitespace-nowrap">
                                    ✅ Done
                                  </Badge>
                                )}
                              </div>

                              <h3 className={`font-bold text-lg leading-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer capitalize ${task.isCompleted
                                  ? 'line-through text-gray-500 dark:text-gray-400'
                                  : 'text-gray-900 dark:text-white'
                                }`}
                                onClick={() => router.push(`/tasks/${task.id}`)}>
                                {task.title}
                              </h3>
                            </div>

                            {/* Task Actions Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Task actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Task
                                </DropdownMenuItem>
                                {!task.isCompleted && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleCompleteTask(task.id)}
                                      className="text-green-600 focus:text-green-600"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed capitalize">
                              {truncateToWords(task.description, 50)}
                            </p>
                          )}

                          {/* Meta Information */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {task.dueDate && (
                              <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                                <Calendar className="h-4 w-4" />
                                <span>Due {formatDistance(new Date(task.dueDate), new Date(), { addSuffix: true })}</span>
                              </div>
                            )}
                            {task.estimatedTimeMinutes && (
                              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                                <Clock className="h-4 w-4" />
                                <span>{task.estimatedTimeMinutes}m estimated</span>
                              </div>
                            )}
                            {task.completedAt && (
                              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-green-600 dark:text-green-400">
                                <Trophy className="h-4 w-4" />
                                <span>Completed {formatDistance(new Date(task.completedAt), new Date(), { addSuffix: true })}</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {task.tags.slice(0, 4).map((tag, index) => (
                                <Badge key={tag.id || index} variant="secondary" className="text-sm bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700">
                                  #{tag.name}
                                </Badge>
                              ))}
                              {task.tags.length > 4 && (
                                <Badge variant="secondary" className="text-sm">
                                  +{task.tags.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Enhanced Points Summary */}
          {(stats.totalPoints || 0) > 0 && (
            <Card className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 text-white border-0 shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-lg">
                      <Crown className="w-10 h-10 text-yellow-300" />
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl sm:text-5xl font-bold text-yellow-300 mb-2">
                      {stats.totalPoints || 0} XP
                    </div>
                    <p className="text-white/90 text-lg">
                      Outstanding work! Keep conquering quests to level up! 🚀
                    </p>
                  </div>
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-lg">{stats.completedTasks || 0}</div>
                      <div className="text-white/80">Quests Done</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{currentLevel || 1}</div>
                      <div className="text-white/80">Current Level</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{stats.streakDays || 0}</div>
                      <div className="text-white/80">Day Streak</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task Creation/Edit Modal */}
          {user && (
            <TaskCreationModal
              user={user}
              family={hasFamily && familyMembers.length > 0 ? { 
                id: familyMembers[0]?.familyId || 0,
                name: 'My Family',
                description: '',
                createdAt: new Date().toISOString(),
                createdById: user?.id || 0,
                memberCount: familyMembers.length
              } : null}
              onTaskCreated={handleTaskCreated}
              isOpen={showTaskModal}
              onOpenChange={handleCloseTaskModal}
              editingTask={editingTask}
            />
          )}

          {/* Error Modal */}
          <ErrorModal
            isOpen={errorModal.isOpen}
            onOpenChange={(open) => setErrorModal(prev => ({ ...prev, isOpen: open }))}
            title={errorModal.title}
            message={errorModal.message}
            details={errorModal.details}
            type={errorModal.type}
            showDetails={errorModal.showDetails}
          />

          {/* Deletion Confirmation Modal */}
          <ConfirmationModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
            onConfirm={confirmDeleteTask}
            title="Delete Quest"
            description={`Are you sure you want to delete "${deleteModal.taskTitle}"? This action cannot be undone and you'll lose any progress on this quest.`}
            confirmText="Delete Quest"
            cancelText="Keep Quest"
            variant="danger"
            isLoading={deleteModal.isLoading}
          />

          {/* Completion Celebration Modal */}
          <CompletionModal
            isOpen={completionModal.isOpen}
            onClose={() => setCompletionModal(prev => ({ ...prev, isOpen: false }))}
            taskTitle={completionModal.taskTitle}
            xpEarned={completionModal.xpEarned}
            newLevel={completionModal.newLevel}
            achievements={completionModal.achievements}
            streakDays={completionModal.streakDays}
          />

          {/* Floating Action Button for New Quest */}
          {user && (
            <Button
              onClick={handleOpenTaskModal}
              className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:scale-95"
              title="Create new quest"
            >
              <Plus className="h-6 w-6" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 animate-pulse" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 