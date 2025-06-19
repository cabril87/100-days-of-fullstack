'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Calendar, Clock, Edit, Trash2, Plus, Eye,
  CheckCircle, Circle, Trophy, Crown,
  RefreshCw, Users, Sparkles, Rocket, X, ListChecks, CheckSquare,
  Search, MoreHorizontal, ArrowUpDown,
  Zap,
  Pause,
  Target
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
import { useTaskCompletion } from '@/components/ui/ToastProvider';
import { TasksPageContentProps, Task, TaskStats, TaskItemStatus } from '@/lib/types/task';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';
import { taskService } from '@/lib/services/taskService';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { formatDistance } from 'date-fns';
import { priorityIntToString } from '@/lib/utils/priorityMapping';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FamilyDTO } from '@/lib/types/family-invitation'; // ✅ NEW: Import FamilyDTO
import { parseBackendDate, formatDisplayDate } from '@/lib/utils/dateUtils';

export default function TasksPageContent({ user, initialData }: TasksPageContentProps) {
  const router = useRouter();
  const { celebrateTaskCompletion } = useTaskCompletion();
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
  const [, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'notstarted' | 'inprogress' | 'pending' | 'completed' | 'family' | 'drafts'>('overview');
  const [showCommandDialog, setShowCommandDialog] = useState(false);
  const [sortColumn, setSortColumn] = useState<'title' | 'priority' | 'dueDate' | 'assignee' | 'status' | 'createdAt'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // ✨ NEW: Family Task Collaboration State
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);
  const [hasFamily, setHasFamily] = useState(false);
  const [family, setFamily] = useState<FamilyDTO | null>(null); // ✅ NEW: Store family data
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
    if (tabParam && ['overview', 'notstarted', 'inprogress', 'pending', 'completed', 'family', 'drafts'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [isFallbackUser]);

  // Keyboard shortcuts for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommandDialog(true);
      }
      if (e.key === 'Escape') {
        setShowCommandDialog(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      const [recentTasks, taskStats] = await Promise.all([
        taskService.getRecentTasks(50), // Load more tasks for full view
        taskService.getUserTaskStats()
      ]);

      // ✨ DEBUG: Log task data to understand familyId assignment
      console.log('🔍 Loaded tasks debug:', recentTasks.map(task => ({
        id: task.id,
        title: task.title,
        familyId: task.familyId,
        assignedToUserId: task.assignedToUserId,
        pointsValue: task.pointsValue,
        priority: task.priority, // ✅ NEW: Debug priority values
        priorityType: typeof task.priority // ✅ NEW: Debug priority type
      })));

      setTasks(recentTasks);
      setStats(taskStats);

      // ✨ NEW: Load family data if user has family access
      try {
        const families = await familyInvitationService.getAllFamilies();
        console.log('📋 Tasks: Loading family data...', { familiesCount: families?.length || 0 });

        if (families && families.length > 0) {
          const userFamily = families[0]; // User's primary family
          setHasFamily(true);
          setFamily(userFamily); // ✅ NEW: Store family data
          // Load family members for the first family (user's family)
          const members = await familyInvitationService.getFamilyMembers(userFamily.id);
          setFamilyMembers(members);
          console.log('📋 Tasks: Family data loaded successfully', {
            hasFamily: true,
            familyName: userFamily.name, // ✅ NEW: Log family name
            membersCount: members.length,
            familyId: userFamily.id
          });
        } else {
          console.log('📋 Tasks: User has no family');
          setHasFamily(false);
          setFamily(null); // ✅ NEW: Clear family data
        }
      } catch (familyError) {
        console.warn('📋 Tasks: Failed to load family data:', familyError);
        setHasFamily(false);
        setFamily(null); // ✅ NEW: Clear family data on error
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
  const handleTaskCreated = (newTask?: Task) => {
    console.log('🎯 Tasks handleTaskCreated/Updated called with:', newTask);

    // If no task is provided, reload the entire task list (e.g., from board assignment)
    if (!newTask) {
      console.log('🔄 No task provided, reloading entire task list...');
      loadTasks();
      setShowTaskModal(false);
      return;
    }

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

      console.log('🎉 Starting enhanced task completion for:', taskToComplete.title);

      // Complete the task using taskService
      const updatedTask = await taskService.completeTask(taskId);

      // Update local task state
      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));

      // Calculate estimated points earned (from task points value)
      const pointsEarned = taskToComplete.pointsValue || 10; // Default 10 points
      const newTotalPoints = (stats.totalPoints || 0) + pointsEarned;

      setStats(prev => ({
        ...prev,
        completedTasks: (prev.completedTasks || 0) + 1,
        activeTasks: Math.max(0, (prev.activeTasks || 0) - 1),
        totalPoints: newTotalPoints,
        streakDays: (prev.streakDays || 0) + 1
      }));

      // 🎉 Trigger task completion celebration
      celebrateTaskCompletion({
        taskTitle: taskToComplete.title,
        pointsEarned,
        achievementsUnlocked: [],
        levelUp: undefined
      });

      // Show completion modal for significant points
      if (pointsEarned >= 25) {
        setCompletionModal({
          isOpen: true,
          taskTitle: taskToComplete.title,
          xpEarned: pointsEarned,
          newLevel: undefined,
          achievements: [],
          streakDays: (stats.streakDays || 0) + 1
        });
      }

      console.log('🎉 Task completion successful:', {
        taskId,
        pointsEarned,
        title: taskToComplete.title
      });

    } catch (error) {
      console.error('❌ Enhanced task completion failed:', error);

      // Handle authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        console.log('🔐 Authentication expired. Redirecting to login...');
        window.location.href = '/auth/login?message=Session expired. Please log in again.';
        return;
      }

      // Show error to user
      setErrorModal({
        isOpen: true,
        title: 'Task Completion Failed',
        message: 'Failed to complete the task with real-time celebration. Please try again.',
        details: error instanceof Error ? { error: error.message } : { error: 'Unknown error' },
        type: 'error',
        showDetails: false
      });

      // Fallback: try basic completion without celebrations
      try {
        console.log('🔄 Attempting fallback task completion...');
        const updatedTask = await taskService.completeTask(taskId);
        setTasks(prev => prev.map(task =>
          task.id === taskId ? updatedTask : task
        ));
        console.log('✅ Fallback completion successful');
      } catch (fallbackError) {
        console.error('❌ Fallback completion also failed:', fallbackError);
      }
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

  // ✅ NEW: Get actual status name (not aliases)
  const getActualStatusName = (status: TaskItemStatus): string => {
    switch (status) {
      case TaskItemStatus.NotStarted: return 'NotStarted';
      case TaskItemStatus.InProgress: return 'InProgress';
      case TaskItemStatus.OnHold: return 'OnHold';
      case TaskItemStatus.Pending: return 'Pending';
      case TaskItemStatus.Completed: return 'Completed';
      case TaskItemStatus.Cancelled: return 'Cancelled';
      default: return 'NotStarted';
    }
  };

  // ✅ NEW: Get task status as enum
  const getTaskStatus = (task: Task): TaskItemStatus => {
    // Check if task has status field (TaskItemResponseDTO) or just isCompleted (Task)
    if ('status' in task && task.status) {
      // Handle different status formats from API
      if (typeof task.status === 'string') {
        // Convert string status to enum
        const statusMap: { [key: string]: TaskItemStatus } = {
          'NotStarted': TaskItemStatus.NotStarted,
          'InProgress': TaskItemStatus.InProgress,
          'OnHold': TaskItemStatus.OnHold,
          'Pending': TaskItemStatus.Pending,
          'Completed': TaskItemStatus.Completed,
          'Cancelled': TaskItemStatus.Cancelled
        };
        return statusMap[task.status] ?? TaskItemStatus.NotStarted;
      } else if (typeof task.status === 'number') {
        return task.status as TaskItemStatus;
      }
    }
    // For regular Task interface, use isCompleted
    return task.isCompleted ? TaskItemStatus.Completed : TaskItemStatus.NotStarted;
  };

  // ✅ NEW: Calculate tab counts based on actual status
  const getTabCounts = () => {
    const counts = {
      overview: tasks.length,
      notStarted: 0,
      inProgress: 0,
      pending: 0,
      completed: 0,
      family: 0
    };

    tasks.forEach(task => {
      const status = getTaskStatus(task);
      
      switch (status) {
        case TaskItemStatus.NotStarted:
          counts.notStarted++;
          break;
        case TaskItemStatus.InProgress:
          counts.inProgress++;
          break;
        case TaskItemStatus.Pending:
          counts.pending++;
          break;
        case TaskItemStatus.Completed:
          counts.completed++;
          break;
      }

      // Count family tasks
      if (task.familyId) {
        counts.family++;
      }
    });

    return counts;
  };



  const getStatusColor = (status: string | number): string => {
    const statusStr = typeof status === 'number' ? status.toString() : status.toLowerCase();
    switch (statusStr) {
      case '0':
      case 'notstarted': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case '1':
      case 'inprogress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case '2':
      case 'onhold': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case '3':
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case '4':
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case '5':
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string | number) => {
    const statusStr = typeof status === 'number' ? status.toString() : status.toLowerCase();
    switch (statusStr) {
      case '0':
      case 'notstarted': return Rocket;
      case '1':
      case 'inprogress': return Zap;
      case '2':
      case 'onhold': return Pause;
      case '3':
      case 'pending': return Clock;
      case '4':
      case 'completed': return Trophy;
      case '5':
      case 'cancelled': return X;
      default: return Target;
    }
  };

  // Gamification calculations
  const calculateLevel = (points: number) => Math.floor((points || 0) / 100) + 1;

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
    return familyMembers.find(member => member.userId === userId);
  };

  // ✅ NEW: Helper function to format family name for display
  const formatFamilyName = (familyName: string): string => {
    if (!familyName) return 'Family';

    // Check if the name already ends with 'Family' (case-insensitive)
    const lowerName = familyName.toLowerCase();
    if (lowerName.endsWith(' family') || lowerName === 'family') {
      return familyName; // Return as-is if already contains 'Family'
    }

    // Add 'Family' suffix for names that don't have it
    return `${familyName} Family`;
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

  // Sort tasks function
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortColumn) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          // ✨ FIXED: Priority sorting with proper number handling
          const getPriorityOrder = (priority: string | number) => {
            if (typeof priority === 'number') {
              return priority; // Backend sends 0=Low, 1=Medium, 2=High, 3=Urgent
            }
            const priorityOrder = { 'Low': 0, 'Medium': 1, 'High': 2, 'Urgent': 3 };
            return priorityOrder[priority as keyof typeof priorityOrder] ?? 0;
          };
          aValue = getPriorityOrder(a.priority);
          bValue = getPriorityOrder(b.priority);
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'assignee':
          aValue = a.assignedToUserName || '';
          bValue = b.assignedToUserName || '';
          break;
        case 'status':
          // Sort by actual status enum value
          aValue = getTaskStatus(a);
          bValue = getTaskStatus(b);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Handle column sorting
  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // ✨ NEW: Handle tab changes with URL updates
  const handleTabChange = (newTab: typeof activeTab) => {
    setActiveTab(newTab);

    // Update URL with tab parameter
    const url = new URL(window.location.href);
    if (newTab === 'overview') {
      url.searchParams.delete('tab'); // Remove tab param for default
    } else {
      url.searchParams.set('tab', newTab);
    }

    // Update URL without causing a page reload
    window.history.pushState({}, '', url.toString());
  };

  // Filter tasks based on active tab and other filters
  const filteredTasks = sortTasks(tasks.filter(task => {
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
      case 'notstarted':
        // Show tasks with NotStarted status
        if (getTaskStatus(task) !== TaskItemStatus.NotStarted) return false;
        break;
      case 'inprogress':
        // Show tasks with InProgress status
        if (getTaskStatus(task) !== TaskItemStatus.InProgress) return false;
        break;
      case 'pending':
        // Show tasks with Pending status
        if (getTaskStatus(task) !== TaskItemStatus.Pending) return false;
        break;
      case 'completed':
        // Show tasks with Completed status
        if (getTaskStatus(task) !== TaskItemStatus.Completed) return false;
        break;
      case 'family':
        // Show tasks assigned to/from family members (family collaboration)
        if (!task.assignedToUserId && !task.familyId) return false;
        break;
      case 'drafts':
        // Show draft tasks (TODO: implement draft functionality)
        return false; // For now, no drafts
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

    // ✨ FIXED: Family tab filtering - show all family-related tasks
    if (activeTab === 'family') {
      const isAssignedToFamilyMember = task.assignedToUserId && task.assignedToUserId !== user?.id;
      const isAssignedToMe = task.assignedToUserId === user?.id;
      const isUnassignedFamilyTask = task.familyId && !task.assignedToUserId; // ✅ NEW: Include unassigned family tasks
      const isFamilyTask = task.familyId && hasFamily && (isAssignedToFamilyMember || isAssignedToMe || isUnassignedFamilyTask);

      console.log(`🔍 Family filter check for task ${task.id}:`, {
        taskId: task.id,
        title: task.title,
        familyId: task.familyId,
        assignedToUserId: task.assignedToUserId,
        userId: user?.id,
        hasFamily,
        isAssignedToFamilyMember,
        isAssignedToMe,
        isUnassignedFamilyTask, // ✅ NEW: Log unassigned family tasks
        shouldShow: isFamilyTask
      });

      // Show tasks that belong to the family (assigned or unassigned)
      return isFamilyTask;
    }

    return true;
  }));

  // Gamification data
  const currentLevel = calculateLevel(stats.totalPoints);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                All Tasks
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                Track and manage all your tasks in one place
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isBatchMode ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-9 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">
                          {selectedTasks.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
                        </span>
                        <span className="md:hidden">
                          {selectedTasks.size === filteredTasks.length ? 'None' : 'All'}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        {selectedTasks.size === filteredTasks.length
                          ? '📋 Deselect all tasks'
                          : '✅ Select all visible tasks'
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedTasks.size === filteredTasks.length
                          ? 'Clear your current selection to start fresh'
                          : 'Quickly select all tasks for bulk operations'
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsBatchMode(false);
                      setSelectedTasks(new Set()); // Clear selections when exiting batch mode
                    }}
                    className="h-9 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Exit Selection</span>
                    <span className="md:hidden">Exit</span>
                  </Button>
                </>
              ) : (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={loadTasks}
                        size="sm"
                        variant="outline"
                        disabled={isLoading}
                        className="h-9 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">Refresh</span>
                        <span className="md:hidden">↻</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">🔄 Refresh task data</p>
                      <p className="text-xs text-gray-500">
                        {isLoading ? 'Loading latest tasks...' : 'Get the most up-to-date task information'}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBatchMode(true)}
                        className="h-9 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <ListChecks className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Select</span>
                        <span className="md:hidden">☑</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">☑️ Enter selection mode</p>
                      <p className="text-xs text-gray-500">
                        Select multiple tasks for bulk operations like:
                        <br />• Mark as complete • Delete selected • Bulk edit
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowCommandDialog(true)}
                        className="h-9 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Quick Actions</span>
                        <span className="md:hidden">⌘K</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">⌘K Quick command palette</p>
                      <p className="text-xs text-gray-500">
                        Search, create, and manage tasks quickly.
                        <br />Use Ctrl+K (Cmd+K on Mac) to open
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                      >
                        <Rocket className="h-4 w-4 mr-2" />
                        <span className="hidden md:inline">Templates</span>
                        <span className="md:hidden">📋</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">📋 Task templates</p>
                      <p className="text-xs text-gray-500">
                        Access saved task templates for quick creation.
                        <br />Perfect for recurring tasks! 🔄
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  <Button
                    onClick={handleOpenTaskModal}
                    size="sm"
                    className="h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Create Task</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ✨ COMPREHENSIVE: Task Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
          {/* Total Tasks */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckSquare className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">{stats.totalTasks || 0}</div>
              <div className="text-xs text-blue-100 font-medium">Total Tasks</div>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">{stats.completedTasks || 0}</div>
              <div className="text-xs text-green-100 font-medium">Completed</div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">{stats.activeTasks || 0}</div>
              <div className="text-xs text-orange-100 font-medium">Pending</div>
            </CardContent>
          </Card>

          {/* Family Tasks */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">
                {tasks.filter(task => task.assignedToUserId || task.familyId).length}
              </div>
              <div className="text-xs text-purple-100 font-medium">Family</div>
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">{stats.overdueTasks || 0}</div>
              <div className="text-xs text-red-100 font-medium">Overdue</div>
            </CardContent>
          </Card>

          {/* Total Points */}
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="text-lg md:text-2xl font-bold">{stats.totalPoints || 0}</div>
              <div className="text-xs text-amber-100 font-medium">XP Points</div>
            </CardContent>
          </Card>
        </div>

        {/* ✨ COMPREHENSIVE: Task Management Tabs */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {(() => {
                const tabCounts = getTabCounts();
                return [
                  { id: 'overview', label: 'All Tasks', icon: CheckSquare, count: tabCounts.overview },
                  { id: 'notstarted', label: 'Not Started', icon: Rocket, count: tabCounts.notStarted },
                  { id: 'inprogress', label: 'In Progress', icon: Zap, count: tabCounts.inProgress },
                  { id: 'pending', label: 'Pending', icon: Clock, count: tabCounts.pending },
                  { id: 'completed', label: 'Completed', icon: Trophy, count: tabCounts.completed },
                  { id: 'family', label: 'Family', icon: Users, count: tabCounts.family }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:border-blue-300'
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    <Badge variant="secondary" className={`ml-1 ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {tab.count}
                    </Badge>
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* Tab Description */}
          <div className="px-4 md:px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeTab === 'overview' && '📋 Complete overview of all your tasks in one place'}
              {activeTab === 'notstarted' && '🚀 Tasks that haven\'t been started yet'}
              {activeTab === 'inprogress' && '⚡ Tasks currently being worked on'}
              {activeTab === 'pending' && '⏳ Tasks that are pending or on hold'}
              {activeTab === 'completed' && '✅ Your accomplishments and completed task history'}
              {activeTab === 'family' && '👨‍👩‍👧‍👦 Tasks shared with family members and collaborative work'}
              {activeTab === 'drafts' && '📝 Draft tasks and templates you can reuse'}
            </p>
          </div>
        </Card>

        {/* Batch Actions Bar */}
        {isBatchMode && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg shadow-sm border-2 border-blue-300 dark:border-blue-600">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                    ☑️ Selection Mode: {selectedTasks.size} selected
                  </Badge>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Click tasks to select them, then use bulk actions below
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleBatchComplete}
                      disabled={selectedTasks.size === 0}
                      size="sm"
                      className="h-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">Complete ({selectedTasks.size})</span>
                      <span className="md:hidden">✓ ({selectedTasks.size})</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">✅ Mark selected tasks complete</p>
                    <p className="text-xs text-gray-500">
                      This will mark {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} as completed.
                      <br />Completed tasks help track your productivity! 🎉
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={selectedTasks.size === 0}
                      className="h-8 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Rocket className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">Save as Template</span>
                      <span className="md:hidden">💾</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">💾 Save as reusable template</p>
                    <p className="text-xs text-gray-500">
                      Save {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} as templates for future use.
                      <br />Great for recurring workflows! 🔄
                    </p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleBatchDelete}
                      disabled={selectedTasks.size === 0}
                      variant="destructive"
                      size="sm"
                      className="h-8 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">Delete ({selectedTasks.size})</span>
                      <span className="md:hidden">🗑 ({selectedTasks.size})</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">🗑️ Delete selected tasks</p>
                    <p className="text-xs text-gray-500">
                      ⚠️ This will permanently delete {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''}.
                      <br />This action cannot be undone!
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters Section */}
        <div className="mb-6">
          {!isBatchMode ? (
            /* Full filters section for normal mode */
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[140px] h-10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full md:w-[140px] h-10">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            /* Simple search for batch mode */
            <div className="flex items-center gap-4">
              <Input
                placeholder="Quick search to filter selected tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 max-w-md"
              />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                💡 Use search to quickly find tasks to select
              </div>
            </div>
          )}
        </div>

        {/* ✨ COMPREHENSIVE: Responsive Task Table */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                    </div>
                  ))}
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
                  <div className="space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto">
                      {searchTerm ? (
                        <div className="text-4xl">🔍</div>
                      ) : activeTab === 'overview' ? (
                        <CheckSquare className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      ) : activeTab === 'family' ? (
                        <Users className="w-12 h-12 text-purple-400 dark:text-purple-500" />
                      ) : activeTab === 'pending' ? (
                        <Clock className="w-12 h-12 text-orange-400 dark:text-orange-500" />
                      ) : activeTab === 'completed' ? (
                        <Trophy className="w-12 h-12 text-green-400 dark:text-green-500" />
                      ) : activeTab === 'drafts' ? (
                        <Edit className="w-12 h-12 text-blue-400 dark:text-blue-500" />
                      ) : (
                        <CheckSquare className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {searchTerm ? 'No tasks match your search' :
                          activeTab === 'overview' ? 'No tasks found' :
                            activeTab === 'family' ? 'No family tasks yet' :
                              activeTab === 'pending' ? 'All caught up!' :
                                activeTab === 'completed' ? 'No completed tasks yet' :
                                  activeTab === 'drafts' ? 'No templates saved' :
                                    'No tasks found'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        {searchTerm ?
                          'Try adjusting your search criteria or clear filters to see all tasks.' :
                          activeTab === 'overview' ?
                            'Your task dashboard is ready. Create your first task to get started!' :
                            activeTab === 'family' ?
                              'Start collaborating! Create tasks and assign them to family members.' :
                              activeTab === 'pending' ?
                                'Great job! You have no pending tasks. Time to create new ones or enjoy your free time! 🎉' :
                                activeTab === 'completed' ?
                                  'Complete some tasks to see your accomplishments here. Your success story starts now!' :
                                  activeTab === 'drafts' ?
                                    'Save tasks as reusable templates here. Perfect for recurring workflows and productivity!' :
                                    'Create your first task to get started on your productivity journey!'
                        }
                      </p>
                    </div>
                    {!searchTerm && (
                      <div className="flex gap-3 justify-center flex-wrap">
                        <Button
                          onClick={handleOpenTaskModal}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {activeTab === 'family' ? 'Create Family Task' :
                            activeTab === 'drafts' ? 'Create Template' :
                              'Create New Task'}
                        </Button>
                        {(activeTab === 'completed' || activeTab === 'pending') && (
                          <Button
                            variant="outline"
                            onClick={() => handleTabChange('overview')}
                            className="border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            View All Tasks
                          </Button>
                        )}
                        {activeTab === 'drafts' && (
                          <Button
                            variant="outline"
                            className="border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <Rocket className="h-4 w-4 mr-2" />
                            Browse Templates
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 dark:from-gray-800 dark:via-purple-900/10 dark:to-blue-900/10 shadow-xl border-2 border-purple-100/50 dark:border-purple-700/30 overflow-hidden relative">
              {/* Gamification sparkle overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/10 to-transparent animate-pulse pointer-events-none"></div>
              <div className="overflow-x-auto relative z-10">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 dark:from-purple-800/30 dark:via-blue-800/30 dark:to-cyan-800/30 border-b-2 border-purple-200/50 dark:border-purple-600/30">
                      {/* Selection Header */}
                      {isBatchMode && (
                        <TableHead className="w-12">
                          <button
                            onClick={handleSelectAll}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            {selectedTasks.size === filteredTasks.length ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </TableHead>
                      )}

                      {/* Task Title */}
                      <TableHead
                        className="cursor-pointer hover:bg-purple-200/30 dark:hover:bg-purple-700/30 transition-all duration-200"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-800 dark:text-purple-200">📋 Task</span>
                          <ArrowUpDown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                      </TableHead>

                      {/* Status Column - NEW for Board Sync */}
                      <TableHead
                        className="cursor-pointer hover:bg-blue-200/30 dark:hover:bg-blue-700/30 transition-all duration-200 hidden sm:table-cell"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-800 dark:text-blue-200">📋 Status</span>
                          <ArrowUpDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </TableHead>

                      {/* Priority */}
                      <TableHead
                        className="cursor-pointer hover:bg-orange-200/30 dark:hover:bg-orange-700/30 transition-all duration-200 hidden md:table-cell"
                        onClick={() => handleSort('priority')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-800 dark:text-orange-200">🔥 Priority</span>
                          <ArrowUpDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                      </TableHead>

                      {/* Points Column */}
                      <TableHead className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-yellow-800 dark:text-yellow-200">⭐ XP</span>
                        </div>
                      </TableHead>

                      {/* Assignee */}
                      <TableHead
                        className="cursor-pointer hover:bg-cyan-200/30 dark:hover:bg-cyan-700/30 transition-all duration-200 hidden md:table-cell"
                        onClick={() => handleSort('assignee')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-800 dark:text-cyan-200">👤 Assignee</span>
                          <ArrowUpDown className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                      </TableHead>

                      {/* Due Date */}
                      <TableHead
                        className="cursor-pointer hover:bg-green-200/30 dark:hover:bg-green-700/30 transition-all duration-200 hidden lg:table-cell"
                        onClick={() => handleSort('dueDate')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-800 dark:text-green-200">📅 Due</span>
                          <ArrowUpDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                      </TableHead>

                      {/* Created Date */}
                      <TableHead
                        className="cursor-pointer hover:bg-indigo-200/30 dark:hover:bg-indigo-700/30 transition-all duration-200 hidden xl:table-cell"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-800 dark:text-indigo-200">📅 Created</span>
                          <ArrowUpDown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </TableHead>

                      {/* Tags */}
                      <TableHead className="hidden xl:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-800 dark:text-blue-200">🏷️ Tags</span>
                        </div>
                      </TableHead>

                      {/* Actions */}
                      <TableHead className="w-12">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <ContextMenu key={task.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow
                            className={`group transition-all duration-300 cursor-pointer relative overflow-hidden shadow-sm hover:shadow-md ${task.isCompleted
                                ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border-l-4 border-emerald-500 hover:shadow-emerald-500/20'
                                : selectedTasks.has(task.id)
                                  ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/40 border-l-4 border-blue-500 hover:shadow-blue-500/20'
                                  : (task.pointsValue && task.pointsValue >= 50)
                                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 hover:from-yellow-100 hover:to-amber-100 border-l-4 border-yellow-500 shadow-lg hover:shadow-yellow-500/20'
                                    : (task.id % 2 === 0)
                                      ? 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 hover:from-slate-100 hover:to-gray-100 border-l-2 border-slate-300'
                                      : 'bg-gradient-to-r from-white to-slate-50 dark:from-gray-800/30 dark:to-slate-800/30 hover:from-slate-50 hover:to-slate-100 border-l-2 border-gray-300'
                              } border-b border-gray-200 dark:border-gray-600/50 ${task.pointsValue && task.pointsValue >= 100 ? 'animate-pulse shadow-lg' : ''
                              }`}
                          >
                            {/* High-value task sparkle effect */}
                            {task.pointsValue && task.pointsValue >= 50 && (
                              <div className="absolute top-1 right-1 pointer-events-none">
                                <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                              </div>
                            )}
                            {/* Batch Selection Cell */}
                            {isBatchMode && (
                              <TableCell>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectTask(task.id);
                                  }}
                                  className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                  {selectedTasks.has(task.id) ? (
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                                  )}
                                </button>
                              </TableCell>
                            )}

                            {/* Task Title Cell with gamification */}
                            <TableCell
                              className="max-w-0 w-full"
                              onClick={() => router.push(`/tasks/${task.id}`)}
                            >
                              <div className="space-y-1 ml-2">
                            

                                <h4 className={`font-medium truncate ${task.isCompleted
                                    ? 'line-through text-gray-500 dark:text-gray-400'
                                    : 'text-gray-900 dark:text-white'
                                  }`}>
                                  {formatTaskTitle(task.title)} {/* ✅ FIXED: Apply title case formatting */}
                                </h4>

                                {task.description && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate hidden md:block">
                                    {formatDescription(truncateToWords(task.description, 8))} {/* ✅ FIXED: Apply sentence case formatting */}
                                  </p>
                                )}

                                {/* Mobile info row */}
                                <div className="flex items-center justify-between text-xs text-gray-500 sm:hidden">
                                  <div className="flex items-center gap-2">
                                    {task.dueDate && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDistance(new Date(task.dueDate), new Date(), { addSuffix: true })}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* XP info for mobile */}
                                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                                    ⭐ {task.pointsValue || 10} XP
                                  </span>
                                </div>
                              </div>
                            </TableCell>

                            {/* Status Cell - NEW for Board Sync */}
                            <TableCell className="hidden sm:table-cell">
                              {(() => {
                                // Use helper function to get task status
                                const taskStatus = getTaskStatus(task);

                                // Use actual status names (not board column aliases)
                                const statusDisplay = getActualStatusName(taskStatus);
                                const statusColor = getStatusColor(taskStatus);
                                const StatusIcon = getStatusIcon(taskStatus);

                                // Debug logging for status display
                                // Status debug logging removed - functionality confirmed working

                                return (
                                  <Badge className={`${statusColor} text-xs font-bold px-3 py-1.5 flex items-center gap-1 shadow-md border-0 hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                                    <StatusIcon className="h-3 w-3" />
                                    <span className="hidden lg:inline">{statusDisplay}</span>
                                  </Badge>
                                );
                              })()}
                            </TableCell>

                            {/* Priority Cell - Hidden on mobile */}
                            <TableCell className="hidden md:table-cell">
                              {(() => {
                                // ✅ FIXED: Pass raw priority to getPriorityDisplay - it handles conversion internally
                                const priorityDisplay = getPriorityDisplay(task.priority);

                                // Priority debug logging removed - functionality confirmed working

                                return priorityDisplay && (
                                  <Badge className={`${getPriorityColor(priorityDisplay)} text-xs font-bold px-3 py-1.5 flex items-center gap-1 shadow-md border-0 hover:shadow-lg transition-all duration-200 hover:scale-105`}>
                                    {getPriorityIcon(priorityDisplay)}
                                    <span className="hidden lg:inline">{priorityDisplay}</span>
                                  </Badge>
                                );
                              })()}
                            </TableCell>

                            {/* Points Cell - Hidden on mobile */}
                            <TableCell className="hidden sm:table-cell">
                              {(() => {
                                const xpValue = task.pointsValue || 10; // Default to 10 XP if not set
                                return (
                                  <Badge className={`text-white text-sm font-bold px-3 py-1 shadow-lg ${xpValue >= 100
                                      ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 animate-pulse'
                                      : xpValue >= 50
                                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600'
                                        : 'bg-gradient-to-r from-purple-500 to-blue-500'
                                    }`}>
                                    ⭐{xpValue}
                                    {xpValue >= 100 && <Sparkles className="ml-1 h-3 w-3 inline animate-spin" />}
                                  </Badge>
                                );
                              })()}
                            </TableCell>

                            {/* Assignee Cell - Hidden on mobile */}
                            <TableCell className="hidden md:table-cell">
                              {task.assignedToUserId && task.assignedToUserName ? (
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const assignedMember = getFamilyMemberByUserId(task.assignedToUserId);
                                    return (
                                      <>
                                        {assignedMember && hasFamily && (
                                          <Avatar className="h-6 w-6">
                                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-xs">
                                              {(assignedMember.user?.firstName?.[0] || task.assignedToUserName[0] || '?').toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                        )}
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-20">
                                          {task.assignedToUserId === user?.id ? 'You' : task.assignedToUserName.split(' ')[0]}
                                        </span>
                                      </>
                                    );
                                  })()}
                                </div>
                              ) : task.familyId && !task.assignedToUserId && hasFamily && family ? (
                                (() => {
                                  // Family assignee debug logging removed - functionality confirmed working
                                  return (
                                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1">
                                      <Users className="h-3 w-3 mr-1" />
                                      {formatFamilyName(family.name)} {/* ✅ FIXED: Use helper function for proper formatting */}
                                    </Badge>
                                  );
                                })()
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </TableCell>

                            {/* Due Date Cell - Hidden on mobile */}
                            <TableCell className="hidden lg:table-cell">
                              {(() => {
                                const dueDate = parseBackendDate(task.dueDate);
                                
                                if (!dueDate) {
                                  return <span className="text-sm text-gray-400">-</span>;
                                }
                                
                                const displayText = formatDisplayDate(dueDate);
                                
                                return (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {displayText}
                                    </span>
                                  </div>
                                );
                              })()}
                            </TableCell>

                            {/* Created Date Cell - Hidden on smaller screens */}
                            <TableCell className="hidden xl:table-cell">
                              {(() => {
                                // Use the new date utilities for proper timezone handling
                                const createdDate = parseBackendDate(task.createdAt);
                                
                                if (!createdDate) {
                                  return <span className="text-sm text-gray-400">-</span>;
                                }
                                
                                // Timezone conversion working correctly - debug logs removed
                                
                                const displayText = formatDisplayDate(createdDate);
                                
                                return (
                                  <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="h-3 w-3" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {displayText}
                                    </span>
                                  </div>
                                );
                              })()}
                            </TableCell>

                            {/* Tags Cell - Hidden on smaller screens */}
                            <TableCell className="hidden xl:table-cell">
                              {task.tags && task.tags.length > 0 ? (
                                <div className="flex gap-1 flex-wrap max-w-32">
                                  {task.tags.slice(0, 2).map((tag, index) => (
                                    <Badge
                                      key={tag.id || index}
                                      variant="secondary"
                                      className="text-xs bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-700 px-1 py-0"
                                    >
                                      #{tag.name}
                                    </Badge>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0">
                                      +{task.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </TableCell>

                            {/* Actions Cell */}
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Task actions</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  {!task.isCompleted && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleCompleteTask(task.id)}
                                        className="text-green-600 focus:text-green-600"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Complete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>

                        {/* Context Menu */}
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                            <ContextMenuShortcut>Enter</ContextMenuShortcut>
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                            <ContextMenuShortcut>E</ContextMenuShortcut>
                          </ContextMenuItem>
                          {!task.isCompleted && (
                            <>
                              <ContextMenuSeparator />
                              <ContextMenuItem onClick={() => handleCompleteTask(task.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                                <ContextMenuShortcut>Space</ContextMenuShortcut>
                              </ContextMenuItem>
                            </>
                          )}
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                            <ContextMenuShortcut>Del</ContextMenuShortcut>
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
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

        {/* ✨ NEW: Command Dialog for Quick Actions */}
        <CommandDialog open={showCommandDialog} onOpenChange={setShowCommandDialog}>
          <CommandInput placeholder="Type a command or search tasks..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>

            <CommandGroup heading="Quick Actions">
              <CommandItem onSelect={() => {
                setShowCommandDialog(false);
                handleOpenTaskModal();
              }}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Task</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                setShowCommandDialog(false);
                const newBatchMode = !isBatchMode;
                setIsBatchMode(newBatchMode);
                if (!newBatchMode) {
                  setSelectedTasks(new Set()); // Clear selections when exiting batch mode
                }
              }}>
                <CheckSquare className="mr-2 h-4 w-4" />
                <span>{isBatchMode ? 'Exit' : 'Enter'} Batch Mode</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                setShowCommandDialog(false);
                setSearchTerm('');
              }}>
                <X className="mr-2 h-4 w-4" />
                <span>Clear Search</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => {
                setShowCommandDialog(false);
                handleTabChange('overview');
              }}>
                <ListChecks className="mr-2 h-4 w-4" />
                <span>All Tasks</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                setShowCommandDialog(false);
                handleTabChange('family');
              }}>
                <Users className="mr-2 h-4 w-4" />
                <span>Family Tasks</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                setShowCommandDialog(false);
                handleTabChange('pending');
              }}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Pending Tasks</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                setShowCommandDialog(false);
                handleTabChange('completed');
              }}>
                <Trophy className="mr-2 h-4 w-4" />
                <span>Completed Tasks</span>
              </CommandItem>
              <CommandItem onSelect={() => {
                setShowCommandDialog(false);
                handleTabChange('drafts');
              }}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Templates</span>
              </CommandItem>
            </CommandGroup>

            {filteredTasks.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Recent Tasks">
                  {filteredTasks.slice(0, 5).map((task) => (
                    <CommandItem
                      key={task.id}
                      onSelect={() => {
                        setShowCommandDialog(false);
                        router.push(`/tasks/${task.id}`);
                      }}
                    >
                      {task.isCompleted ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="mr-2 h-4 w-4 text-gray-400" />
                      )}
                      <span className={task.isCompleted ? 'line-through text-gray-500' : ''}>
                        {formatTaskTitle(truncateToWords(task.title, 6))}
                      </span>
                      {task.pointsValue && (
                        <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                          ⭐{task.pointsValue}
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </CommandDialog>

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
  );
} 