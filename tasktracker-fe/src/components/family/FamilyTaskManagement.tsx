'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TimeProgressBar } from '@/components/ui/TimeProgressBar';
import { AssigneeList } from '@/components/ui/AssigneeList';
import { 
  Target, 
  Clock, 
  Calendar,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  CheckCircle,
  Flame,
  Zap,
  Activity,
  UserPlus,
  Trash2,
  RefreshCw,
  Trophy,
  Circle
} from 'lucide-react';
import { FamilyTaskItemDTO, Task } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import TaskCreationModal from '@/components/tasks/TaskCreationModal';
import { FamilyTaskManagementProps } from '@/lib/types/component-props';

export default function FamilyTaskManagement({ user, family, familyMembers }: FamilyTaskManagementProps) {
  const [familyTasks, setFamilyTasks] = useState<FamilyTaskItemDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Filtering and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'completed' | 'overdue' | 'pending'>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // ✨ ENHANCED: Batch Operations State
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);

  useEffect(() => {
    loadFamilyTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [family.id]);

  const loadFamilyTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 FamilyTaskManagement: Loading family tasks for family ID:', family.id);
      const tasks = await taskService.getFamilyTasks(family.id);
      console.log('📋 FamilyTaskManagement: Family tasks loaded:', {
        familyId: family.id,
        taskCount: tasks.length,
        tasks: tasks.map(t => ({
          id: t.id,
          title: t.title,
          assignedToFamilyMemberId: t.assignedToFamilyMemberId,
          isCompleted: t.isCompleted,
          familyId: t.familyId
        }))
      });
      setFamilyTasks(tasks);
    } catch (error) {
      console.error('❌ FamilyTaskManagement: Failed to load family tasks:', error);
      setError('Failed to load family tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task creation success
  const handleTaskCreated = async (createdTask?: Task) => {
    console.log('🎯 FamilyTaskManagement: Task created, refreshing family tasks...', createdTask);
    await loadFamilyTasks(); // Refresh the task list
    setIsTaskModalOpen(false);
  };

  // Filter tasks based on current filters
  const filteredTasks = familyTasks.filter(task => {
    // Search query filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed' && !task.isCompleted) return false;
      if (statusFilter === 'assigned' && !task.assignedToFamilyMemberId) return false;
      if (statusFilter === 'pending' && task.isCompleted) return false;
      if (statusFilter === 'overdue' && (!task.dueDate || new Date(task.dueDate) > new Date() || task.isCompleted)) return false;
    }
    
    // Member filter
    if (memberFilter !== 'all' && task.assignedToFamilyMemberId?.toString() !== memberFilter) {
      return false;
    }
    
    // Priority filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    
    return true;
  });

  // ✨ ENHANCED: Selection handlers
  const handleSelectTask = (taskId: number, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
    setIsSelectAllChecked(newSelected.size === filteredTasks.length && filteredTasks.length > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
    setIsSelectAllChecked(checked);
  };

  // ✨ NEW: Batch operation handlers
  const handleBatchComplete = async () => {
    try {
      const selectedTaskIds = Array.from(selectedTasks);
      const batchResult = await taskService.batchCompleteTasks(selectedTaskIds);

      if (batchResult.success) {
        // Refresh the family tasks to get updated data
        await loadFamilyTasks();
        setSelectedTasks(new Set());
        setIsSelectAllChecked(false);
        console.log(`✅ Successfully completed ${selectedTaskIds.length} family tasks`);
      }
    } catch (error) {
      console.error('❌ Failed to complete family tasks:', error);
    }
  };

  const handleBatchDelete = async () => {
    const selectedTaskIds = Array.from(selectedTasks);
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedTaskIds.length} selected task${selectedTaskIds.length === 1 ? '' : 's'}?\n\nThis action cannot be undone and all task data will be permanently lost.`
    );
    
    if (!confirmed) return;

    try {
      const batchResult = await taskService.batchDeleteTasks(selectedTaskIds);

      if (batchResult.success) {
        // Refresh the family tasks to get updated data
        await loadFamilyTasks();
        setSelectedTasks(new Set());
        setIsSelectAllChecked(false);
        console.log(`✅ Successfully deleted ${selectedTaskIds.length} family tasks`);
      }
    } catch (error) {
      console.error('❌ Failed to delete family tasks:', error);
    }
  };

  // Utility functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-blue-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent': return <Flame className="h-3 w-3" />;
      case 'High': return <Zap className="h-3 w-3" />;
      case 'Medium': return <Target className="h-3 w-3" />;
      case 'Low': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getMemberAvatar = (memberId: number) => {
    return familyMembers.find(member => member.id === memberId);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading family tasks...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Error</div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button onClick={loadFamilyTasks} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Family Task Management
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Comprehensive task assignment and collaboration hub for {family.name}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>

              {/* ✨ ENHANCED: Refresh Button with Comprehensive Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
              <Button 
                onClick={loadFamilyTasks}
                variant="outline"
                size="sm"
                    className={`transition-all duration-200 ${isLoading ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">🔄 Refresh Family Tasks</p>
                    <p className="text-sm text-gray-300">
                      Click to reload all family tasks and get the latest updates
                    </p>
                    {isLoading && (
                      <p className="text-xs text-blue-300">Refreshing...</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* ✨ ENHANCED: Batch Mode Button with Comprehensive Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBatchMode(!isBatchMode)}
                    className={`transition-all duration-200 ${isBatchMode 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {isBatchMode ? (
                        <Circle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      {/* Visual indicator for mobile users */}
                      <span className="hidden sm:inline text-xs font-medium">
                        {isBatchMode ? 'Exit' : 'Select'}
                      </span>
                    </div>
              </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                  <div className="space-y-1">
                    {isBatchMode ? (
                      <>
                        <p className="font-semibold">✓ Exit Selection Mode</p>
                        <p className="text-sm text-gray-300">
                          Click to exit batch selection mode and return to normal view
                        </p>
                        <p className="text-xs text-blue-300">
                          Currently in selection mode - you can select multiple family tasks
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">☐ Enter Selection Mode</p>
                        <p className="text-sm text-gray-300">
                          Click to select multiple family tasks for batch operations like:
                        </p>
                        <ul className="text-xs text-gray-300 ml-2 space-y-0.5">
                          <li>• Complete multiple tasks at once</li>
                          <li>• Delete multiple tasks together</li>
                          <li>• Bulk manage family task list</li>
                        </ul>
                      </>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ✨ ENHANCED: Task Summary Stats - Hidden in Batch Mode for Cleaner UX */}
      {!isBatchMode && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{filteredTasks.length}</div>
                <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
              </div>
              <Target className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{filteredTasks.filter(t => t.isCompleted).length}</div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {filteredTasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date()).length}
                </div>
                <p className="text-orange-100 text-sm font-medium">Overdue</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{filteredTasks.filter(t => t.assignedToFamilyMemberId).length}</div>
                <p className="text-purple-100 text-sm font-medium">Assigned</p>
              </div>
              <UserPlus className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* ✨ CONTEXTUAL: Filters & Search - Simplified in Batch Mode */}
      <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-blue-600" />
            {isBatchMode ? 'Quick Search' : 'Filters & Search'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isBatchMode ? (
            /* Batch Mode: Simplified Search Only */
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks for selection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          ) : (
            /* Normal Mode: Full Filter Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: 'all' | 'assigned' | 'completed' | 'overdue' | 'pending') => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Member Filter */}
            <Select value={memberFilter} onValueChange={setMemberFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                {familyMembers.map(member => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.user?.firstName || member.user?.username || 'Unknown'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Urgent">🔥 Urgent</SelectItem>
                <SelectItem value="High">⚡ High</SelectItem>
                <SelectItem value="Medium">🎯 Medium</SelectItem>
                <SelectItem value="Low">✅ Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          )}
        </CardContent>
      </Card>

      {/* ✨ ENHANCED: Batch Actions Bar with Comprehensive Tooltips */}
      {isBatchMode && selectedTasks.size > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                  {/* ✨ ENHANCED: Select All Button with Comprehensive Tooltip */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAll(!isSelectAllChecked)}
                        className="flex items-center gap-2 bg-white/80 hover:bg-white transition-all duration-200"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {isSelectAllChecked ? 'Deselect All' : 'Select All'}
                        </span>
                        <span className="sm:hidden">
                          {isSelectAllChecked ? '☐' : '☑️'}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                      <div className="space-y-1">
                        {isSelectAllChecked ? (
                          <>
                            <p className="font-semibold">☐ Deselect All Family Tasks</p>
                            <p className="text-sm text-gray-300">
                              Click to deselect all {filteredTasks.length} currently visible family tasks
                            </p>
                            <p className="text-xs text-blue-300">
                              This will clear your current selection
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-semibold">☑️ Select All Family Tasks</p>
                            <p className="text-sm text-gray-300">
                              Click to select all {filteredTasks.length} currently visible family tasks at once
                            </p>
                            <div className="text-xs text-blue-300 space-y-0.5">
                              <p>• After selecting, you can:</p>
                              <p>• Complete all tasks together</p>
                              <p>• Delete multiple tasks at once</p>
                            </div>
                          </>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {selectedTasks.size} of {filteredTasks.length} selected
                  </span>
              </div>
                {selectedTasks.size > 0 && (
                  <div className="flex gap-2">
                    {/* ✨ ENHANCED: Batch Complete Button with Comprehensive Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBatchComplete}
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 border-green-200 transition-all duration-200"
                        >
                          <Trophy className="h-4 w-4" />
                          <span className="hidden sm:inline">Complete ({selectedTasks.size})</span>
                          <span className="sm:hidden">✓ {selectedTasks.size}</span>
                </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">🏆 Complete Selected Family Tasks</p>
                          <p className="text-sm text-gray-300">
                            Mark all {selectedTasks.size} selected family task{selectedTasks.size === 1 ? '' : 's'} as completed and earn XP rewards
                          </p>
                          <div className="text-xs text-green-300 space-y-0.5">
                            <p>• Tasks will be moved to completed section</p>
                            <p>• Family members will earn XP and points</p>
                            <p>• Family achievement progress will be updated</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* ✨ ENHANCED: Batch Delete Button with Comprehensive Tooltip */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBatchDelete}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border-red-200 transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Delete ({selectedTasks.size})</span>
                          <span className="sm:hidden">🗑️ {selectedTasks.size}</span>
                </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white p-3 max-w-xs">
                        <div className="space-y-1">
                          <p className="font-semibold">🗑️ Delete Selected Family Tasks</p>
                          <p className="text-sm text-gray-300">
                            Permanently delete all {selectedTasks.size} selected family task{selectedTasks.size === 1 ? '' : 's'}
                          </p>
                          <div className="text-xs text-red-300 space-y-0.5">
                            <p>⚠️ This action cannot be undone</p>
                            <p>• All family task data will be permanently lost</p>
                            <p>• Progress and assignments will be deleted</p>
                            <p>• You&apos;ll see a confirmation dialog first</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Activity className="h-5 w-5 text-blue-600" />
              Family Tasks ({filteredTasks.length})
            </CardTitle>
            {/* ✨ ENHANCED: Show select all only in batch mode */}
            {isBatchMode && (
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isSelectAllChecked}
                onCheckedChange={handleSelectAll}
              />
                <span className="text-sm text-gray-600 hidden sm:inline">Select All</span>
                <span className="text-xs text-gray-600 sm:hidden">All</span>
            </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const assignedMember = task.assignedToFamilyMemberId ? getMemberAvatar(task.assignedToFamilyMemberId) : null;
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;
              
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors ${
                    !isBatchMode ? 'cursor-pointer' : ''
                  } ${
                    selectedTasks.has(task.id) ? 'ring-2 ring-purple-500 bg-purple-50/50' : ''
                  } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
                  onClick={() => !isBatchMode && (window.location.href = `/tasks/${task.id}`)}
                >
                  {/* ✨ ENHANCED: Show checkbox only in batch mode */}
                  {isBatchMode && (
                  <Checkbox
                    checked={selectedTasks.has(task.id)}
                    onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  )}
                  
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Task Header */}
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <h3 className={`font-medium text-sm truncate ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {formatTaskTitle(task.title)}
                      </h3>
                      {isOverdue && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                    </div>
                    
                    {/* ✨ CONTEXTUAL: Time Progress Bar - Hidden in Batch Mode for Cleaner UX */}
                    {!isBatchMode && task.dueDate && !task.isCompleted && (
                      <div className="w-full">
                        <TimeProgressBar
                          dueDate={task.dueDate}
                          isCompleted={task.isCompleted}
                        />
                      </div>
                    )}
                    
                    {/* ✨ CONTEXTUAL: Simplified metadata in batch mode */}
                    {isBatchMode ? (
                      /* Batch Mode: Minimal Info */
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                        {task.pointsValue && (
                          <span className="text-purple-600 font-medium">⭐ {task.pointsValue}</span>
                        )}
                      </div>
                    ) : (
                      /* Normal Mode: Full metadata */
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                      </div>
                      
                      {task.pointsValue && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                          ⭐ {task.pointsValue}
                        </Badge>
                      )}
                      
                        <Badge className={`${getPriorityColor(task.priority)} text-white text-xs flex items-center gap-1`}>
                        {getPriorityIcon(task.priority)} {task.priority}
                      </Badge>
                    </div>
                    )}
                  </div>
                  
                  {/* ✨ ENHANCED: Assignee Display with AssigneeList Component */}
                  <div className="flex items-center gap-3">
                    {assignedMember ? (
                      <AssigneeList
                        assignees={[{
                          id: assignedMember.id,
                          name: assignedMember.user?.firstName || assignedMember.user?.username || 'Member'
                        }]}
                      />
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Unassigned
                      </Badge>
                    )}
                    
                    {!isBatchMode && (
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-8 space-y-4">
                <div className="text-6xl">🎯</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {searchQuery || statusFilter !== 'all' || memberFilter !== 'all' || priorityFilter !== 'all' 
                      ? 'No tasks match your filters' 
                      : 'Ready to start collaborating?'
                    }
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {searchQuery || statusFilter !== 'all' || memberFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your filters or search criteria.'
                      : 'Create family tasks and assign them to family members to get started!'
                    }
                  </p>
                  <Button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Task
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Creation Modal */}
      <TaskCreationModal
        user={user}
        family={family}
        isOpen={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        onTaskCreated={handleTaskCreated}
        defaultContext="family"
        defaultFamilyId={family.id}
      />
    </div>
  );
} 