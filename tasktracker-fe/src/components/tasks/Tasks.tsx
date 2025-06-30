'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  AlertTriangle,
  Rocket,
  CheckSquare
} from 'lucide-react';
import { TasksPageContentProps, Task, TaskStats, TaskItemStatus } from '@/lib/types/task';
import { BoardColumnDTO } from '@/lib/types/board';
import { FamilyMemberDTO, FamilyDTO } from '@/lib/types/family-invitation';
import { taskService } from '@/lib/services/taskService';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { gamificationService } from '@/lib/services/gamificationService';
import { useTaskCompletion } from '@/components/ui/ToastProvider';
import TaskCreationModal from './TaskCreationModal';
import ErrorModal from '@/components/ui/ErrorModal';
import ConfirmationModal from '@/components/ui/confirmation-modal';
import CompletionModal from '@/components/ui/completion-modal';

// Import the new enterprise components
import EnterpriseTaskManager from './EnterpriseTaskManager';

/**
 * ENTERPRISE TASKS PAGE COMPONENT
 * 
 * This is the main tasks page that has been completely refactored to use
 * the new enterprise components for better organization and mobile responsiveness.
 * 
 * Features:
 * - Multi-view interface (Table, Kanban, Analytics)
 * - Mobile-first responsive design (390px-1920px+)
 * - Advanced filtering and search capabilities
 * - Real-time collaboration with family members
 * - Comprehensive batch operations
 * - Export/import functionality
 * - Performance optimized for 1000+ tasks
 */
export default function TasksPageContent({ user, initialData }: TasksPageContentProps) {
  const { celebrateTaskCompletion } = useTaskCompletion();

  // Core state
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks || []);
  const [stats, setStats] = useState<TaskStats>(initialData.stats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Family collaboration state
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [hasFamily, setHasFamily] = useState(false);
  const [family, setFamily] = useState<FamilyDTO | null>(null);

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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

  // Load tasks and family data
  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [recentTasks, taskStats] = await Promise.all([
        taskService.getRecentTasks(50),
        taskService.getUserTaskStats()
      ]);

      console.log('📊 Loaded tasks for enterprise view:', {
        taskCount: recentTasks.length,
        completedTasks: taskStats.completedTasks,
        totalPoints: taskStats.totalPoints
      });

      setTasks(recentTasks);
      setStats(taskStats);

      // Load family data if available
      try {
        const families = await familyInvitationService.getAllFamilies();
        console.log('👨‍👩‍👧‍👦 Loading family data...', { familiesCount: families?.length || 0 });

        if (families && families.length > 0) {
          const userFamily = families[0];
          setHasFamily(true);
          setFamily(userFamily);

          // Load family members
          const members = await familyInvitationService.getFamilyMembers(userFamily.id);
          setFamilyMembers(members || []);

          console.log('✅ Family data loaded:', {
            familyId: userFamily.id,
            familyName: userFamily.name,
            memberCount: members?.length || 0
          });
        } else {
          setHasFamily(false);
          setFamily(null);
          setFamilyMembers([]);
        }
      } catch (familyError) {
        console.warn('⚠️ Could not load family data:', familyError);
        setHasFamily(false);
        setFamily(null);
        setFamilyMembers([]);
      }

    } catch (error) {
      console.error('❌ Failed to load tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load tasks on component mount
  useEffect(() => {
    if (isFallbackUser) {
      console.log('🔍 Fallback user detected, verifying authentication...');
    }
    loadTasks();
  }, [isFallbackUser, loadTasks]);

  // Task completion handler
  const handleCompleteTask = async (taskId: number) => {
    try {
      const taskToComplete = tasks.find(t => t.id === taskId);
      if (!taskToComplete) return;

      console.log(`✅ Completing task ${taskId}: ${taskToComplete.title}`);

      await taskService.completeTask(taskId);

      // 🎮 REAL-TIME GAMIFICATION INTEGRATION - Process achievements and celebrations
      console.log('🎮 Processing gamification for task completion...', {
        taskId,
        taskTitle: taskToComplete.title,
        taskPoints: taskToComplete.pointsValue,
        taskCategoryId: taskToComplete.categoryId,
        taskPriority: taskToComplete.priority
      });

      const gamificationResult = await gamificationService.processTaskCompletion(taskId, {
        title: taskToComplete.title,
        points: taskToComplete.pointsValue,
        category: taskToComplete.categoryName || 'General'
      });

      console.log('🏆 Gamification processing complete:', {
        pointsEarned: gamificationResult.pointsEarned,
        newAchievements: gamificationResult.newAchievements.length,
        achievementNames: gamificationResult.newAchievements.map(a => a.name),
        levelUp: gamificationResult.levelUp
      });

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, isCompleted: true, completedAt: new Date() }
            : task
        )
      );

      // Update stats with real gamification data
      setStats(prevStats => ({
        ...prevStats,
        completedTasks: prevStats.completedTasks + 1,
        totalPoints: prevStats.totalPoints + gamificationResult.pointsEarned
      }));

      // Show completion modal with REAL achievement data
      setCompletionModal({
        isOpen: true,
        taskTitle: taskToComplete.title,
        xpEarned: gamificationResult.pointsEarned,
        newLevel: gamificationResult.levelUp?.newLevel,
        achievements: gamificationResult.newAchievements.map(a => a.name),
        streakDays: 0 // TODO: Add streak data from gamification service
      });

      // 🎉 REAL-TIME CELEBRATION with actual achievement data
      celebrateTaskCompletion({
        taskTitle: taskToComplete.title,
        pointsEarned: gamificationResult.pointsEarned,
        achievementsUnlocked: gamificationResult.newAchievements.map(achievement => ({
          id: achievement.id,
          name: achievement.name,
          title: achievement.name,
          description: achievement.description,
          points: achievement.pointValue,
          rarity: achievement.difficulty === 'VeryEasy' ? 'Common' as const :
                  achievement.difficulty === 'Easy' ? 'Uncommon' as const :
                  achievement.difficulty === 'Medium' ? 'Rare' as const :
                  achievement.difficulty === 'Hard' ? 'Epic' as const :
                  'Legendary' as const,
          unlockedAt: achievement.unlockedAt?.toISOString()
        })),
        levelUp: gamificationResult.levelUp
      });

      // 🔔 TODO: Broadcast to family members via SignalR
      // This will notify family members of achievement unlocks in real-time
      if (gamificationResult.newAchievements.length > 0) {
        console.log('🎯 Broadcasting achievement unlocks to family members...', {
          achievements: gamificationResult.newAchievements.map(a => a.name),
          familyId: family?.id
      });
      }

    } catch (error) {
      console.error('❌ Failed to complete task:', error);
      setErrorModal({
        isOpen: true,
        title: 'Completion Failed',
        message: 'Unable to complete the task. Please try again.',
        type: 'error'
      });
    }
  };

  // Task deletion handler
  const handleDeleteTask = (taskId: number) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setDeleteModal({
      isOpen: true,
      taskId,
      taskTitle: taskToDelete.title,
      isLoading: false
    });
  };

  const confirmDeleteTask = async () => {
    if (!deleteModal.taskId) return;

    try {
      setDeleteModal(prev => ({ ...prev, isLoading: true }));

      await taskService.deleteTask(deleteModal.taskId);

      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== deleteModal.taskId));

      // Update stats
      const deletedTask = tasks.find(t => t.id === deleteModal.taskId);
      if (deletedTask && deletedTask.isCompleted) {
        setStats(prevStats => ({
          ...prevStats,
          completedTasks: Math.max(0, prevStats.completedTasks - 1)
        }));
      }

      setDeleteModal({
        isOpen: false,
        taskId: null,
        taskTitle: '',
        isLoading: false
      });

    } catch (error) {
      console.error('❌ Failed to delete task:', error);
      setErrorModal({
        isOpen: true,
        title: 'Deletion Failed',
        message: 'Unable to delete the task. Please try again.',
        type: 'error'
      });
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Task creation/edit handlers
  const handleOpenTaskModal = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskCreated = (newTask?: Task) => {
    setShowTaskModal(false);
    setEditingTask(null);

    if (newTask) {
      if (editingTask) {
        // Update existing task
        setTasks(prevTasks =>
          prevTasks.map(task => task.id === newTask.id ? newTask : task)
        );
      } else {
        // Add new task
        setTasks(prevTasks => [newTask, ...prevTasks]);
      }

      // Refresh data to get latest stats
      loadTasks();
    }
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  // Default board columns for Kanban view
  const defaultColumns: BoardColumnDTO[] = [
    {
      id: 1,
      name: 'To Do',
      order: 0,
      color: '#EF4444',
      status: TaskItemStatus.NotStarted,
      alias: 'To Do',
      description: 'Tasks that need to be started',
      isCore: true
    },
    {
      id: 2,
      name: 'In Progress',
      order: 1,
      color: '#F59E0B',
      status: TaskItemStatus.InProgress,
      alias: 'In Progress',
      description: 'Tasks currently being worked on',
      isCore: true
    },
    {
      id: 3,
      name: 'Completed',
      order: 2,
      color: '#10B981',
      status: TaskItemStatus.Completed,
      alias: 'Completed',
      description: 'Tasks that have been finished',
      isCore: true
    }
  ];

  // Loading state
  if (isLoading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="h-8 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-9 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 animate-pulse"></div>
                  <div className="h-9 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Enterprise Tasks
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Advanced task management with collaboration
                  </p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                Failed to load task data: {error}
              </AlertDescription>
            </Alert>

            <Button
              onClick={loadTasks}
              variant="outline"
              className="w-full min-h-[44px] bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <Users className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 dark:text-purple-200">
              Please sign in to access your enterprise task management dashboard.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                Enterprise Tasks
              </h1>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <span>Advanced task management with real-time collaboration</span>
                {hasFamily && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Users className="w-3 h-3 mr-1" />
                    Family: {family?.name || 'My Family'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg text-blue-600">{tasks.length}</div>
                <div className="text-gray-500">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-green-600">{stats.completedTasks || 0}</div>
                <div className="text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-purple-600">{stats.totalPoints || 0}</div>
                <div className="text-gray-500">XP Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Enterprise Task Manager */}
      <div className=" mx-auto  py-6">
        <EnterpriseTaskManager
          tasks={tasks}
          stats={stats}
          familyMembers={familyMembers}
          columns={defaultColumns}
          isLoading={isLoading}
          onTaskCreate={handleOpenTaskModal}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
          onTaskStatusChange={(taskId, status) => {
            if (status === TaskItemStatus.Completed) {
              handleCompleteTask(taskId);
            }
          }}
          onRefresh={loadTasks}
        />
      </div>

      {/* Task Creation/Edit Modal */}
      {user && (
        <TaskCreationModal
          user={user}
          family={hasFamily && familyMembers.length > 0 ? {
            id: familyMembers[0]?.familyId || family?.id || 0,
            name: family?.name || 'My Family',
            description: family?.description || '',
            createdAt: family?.createdAt || new Date().toISOString(),
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
        title="Delete Task"
        description={`Are you sure you want to delete "${deleteModal.taskTitle}"? This action cannot be undone and you'll lose any progress on this task.`}
        confirmText="Delete Task"
        cancelText="Keep Task"
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
    </div>
  );
} 