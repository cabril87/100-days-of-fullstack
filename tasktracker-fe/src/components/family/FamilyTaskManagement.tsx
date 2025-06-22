'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Target, 
  Clock, 
  CheckCircle,
  Flame,
  Zap,
  Activity,
} from 'lucide-react';
import { FamilyTaskItemDTO, Task } from '@/lib/types/task';
import { taskService } from '@/lib/services/taskService';
import TaskCreationModal from '@/components/tasks/TaskCreationModal';
import { FamilyTaskManagementProps } from '@/lib/types/component-props';
import TaskStatsCards from './task-management/TaskStatsCards';
import TaskManagementHeader from './task-management/TaskManagementHeader';
import TaskFilters from './task-management/TaskFilters';
import BatchActions from './task-management/BatchActions';
import TaskList from './task-management/TaskList';

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
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Task Management Header */}
      <TaskManagementHeader
        family={family}
        isLoading={isLoading}
        isBatchMode={isBatchMode}
        onCreateTask={() => setIsTaskModalOpen(true)}
        onRefreshTasks={loadFamilyTasks}
        onToggleBatchMode={() => setIsBatchMode(!isBatchMode)}
      />

      {/* Task Summary Stats */}
      <TaskStatsCards
        filteredTasks={filteredTasks}
        isBatchMode={isBatchMode}
      />

            {/* Task Filters */}
      <TaskFilters
        isBatchMode={isBatchMode}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        memberFilter={memberFilter}
        priorityFilter={priorityFilter}
        familyMembers={familyMembers}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={(value: 'all' | 'assigned' | 'completed' | 'overdue' | 'pending') => setStatusFilter(value)}
        onMemberFilterChange={setMemberFilter}
        onPriorityFilterChange={setPriorityFilter}
      />

      {/* Batch Actions */}
      <BatchActions
        isBatchMode={isBatchMode}
        selectedTasks={selectedTasks}
        filteredTasks={filteredTasks}
        isSelectAllChecked={isSelectAllChecked}
        onSelectAll={handleSelectAll}
        onBatchComplete={handleBatchComplete}
        onBatchDelete={handleBatchDelete}
      />

      {/* Task List - OVERFLOW SAFE */}
      <Card className="bg-white/70 backdrop-blur-sm dark:bg-gray-800/70 border-0 shadow-lg max-w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold min-w-0">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Family Tasks ({filteredTasks.length})</span>
            </CardTitle>
            {/* Show select all only in batch mode */}
            {isBatchMode && (
              <div className="flex items-center gap-2 flex-shrink-0">
              <Checkbox
                checked={isSelectAllChecked}
                onCheckedChange={handleSelectAll}
              />
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">Select All</span>
                <span className="text-xs text-gray-600 sm:hidden">All</span>
            </div>
            )}
          </div>
        </CardHeader>
        
        {/* Task List Content - OVERFLOW SAFE */}
        <TaskList
          filteredTasks={filteredTasks}
          isBatchMode={isBatchMode}
          selectedTasks={selectedTasks}
          familyMembers={familyMembers}
          onSelectTask={handleSelectTask}
          getPriorityColor={getPriorityColor}
          getPriorityIcon={getPriorityIcon}
          getMemberAvatar={getMemberAvatar}
          formatTaskTitle={formatTaskTitle}
        />
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