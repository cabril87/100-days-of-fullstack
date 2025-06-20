'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  Search,
  Filter,
  List,
  Table as TableIcon,
  Columns,
  Settings,
  RefreshCw,
  Eye,
  Edit,
  User,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Flame,
  CheckCircle,
  Circle,
  AlertTriangle,
  X,
  Sparkles,
  Download,
  Upload,
  Save,
  Star,
  Trophy,
  Calendar,
  Flag

} from 'lucide-react';
import { 
  Task, 
  TaskStats, 
  TaskItemStatus, 
  TaskFilter,
  ViewMode,
  LayoutMode,
  FilterPreset,
  TaskManagerState,
  EnterpriseTaskManagerProps
} from '@/lib/types/task';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';
import { BoardColumnDTO } from '@/lib/types/board';
import EnterpriseTaskTable, { ColumnKey, SortDirection } from './EnterpriseTaskTable';
import { triggerHapticFeedback } from '../search/MobileSearchEnhancements';
import TaskDetailsSheetContent from './TaskDetailsSheetContent';

// Filter presets configuration
const FILTER_PRESETS: Record<FilterPreset, { label: string; icon: React.ReactNode; filters: Partial<TaskManagerState> }> = {
  all: {
    label: 'All Tasks',
    icon: <List className="h-4 w-4" />,
    filters: { showCompletedTasks: true }
  },
  active: {
    label: 'Active',
    icon: <Activity className="h-4 w-4" />,
    filters: { showCompletedTasks: false }
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle className="h-4 w-4" />,
    filters: { showCompletedTasks: true }
  },
  overdue: {
    label: 'Overdue',
    icon: <AlertTriangle className="h-4 w-4" />,
    filters: { showCompletedTasks: false }
  },
  'high-priority': {
    label: 'High Priority',
    icon: <Flame className="h-4 w-4" />,
    filters: { showCompletedTasks: false }
  },
  assigned: {
    label: 'Assigned',
    icon: <User className="h-4 w-4" />,
    filters: { showCompletedTasks: false }
  },
  unassigned: {
    label: 'Unassigned',
    icon: <Circle className="h-4 w-4" />,
    filters: { showCompletedTasks: false }
  }
};

/**
 * Enterprise Task Manager Component
 * 
 * A comprehensive task management interface that combines:
 * - Advanced table view with sorting, filtering, and pagination
 * - Mobile-optimized Kanban board with drag-and-drop
 * - Dashboard analytics and insights
 * - Batch operations and bulk actions
 * - Real-time collaboration features
 * - Export/import capabilities
 * - Mobile-first responsive design
 * - Advanced search and filtering
 * - Customizable layouts and views
 */
export default function EnterpriseTaskManager({
  tasks,
  columns,
  familyMembers,
  stats,
  isLoading = false,
  enableAdvancedFeatures = true,
  enableBatchOperations = true,
  enableRealTimeSync = true,
  enableOfflineMode = false,
  enableAnalytics = true,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskMove,
  onBatchOperation,
  onExport,
  onImport,
  onViewModeChange,
  onRefresh,
  className = ''
}: EnterpriseTaskManagerProps) {
  // State Management
  const [state, setState] = useState<TaskManagerState>({
    viewMode: 'table',
    layoutMode: 'comfortable',
    selectedTasks: new Set(),
    filters: [],
    sortColumn: 'createdAt',
    sortDirection: 'desc',
    searchQuery: '',
    filterPreset: 'all',
    showCompletedTasks: true,
    groupBy: 'none'
  });

  const [isMobile, setIsMobile] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingInSheet, setIsEditingInSheet] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-adjust for mobile
      if (mobile && state.viewMode === 'table') {
        setState(prev => ({ ...prev, layoutMode: 'compact' }));
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [state.viewMode]);

  // Offline detection
  useEffect(() => {
    if (enableOfflineMode) {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [enableOfflineMode]);

  // Filtered and processed tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some((tag: string | { name: string }) => {
          if (typeof tag === 'string') {
            return tag.toLowerCase().includes(query);
          } else {
            return tag.name.toLowerCase().includes(query);
          }
        })
      );
    }

    // Apply preset filters
    switch (state.filterPreset) {
      case 'active':
        result = result.filter(task => !task.isCompleted);
        break;
      case 'completed':
        result = result.filter(task => task.isCompleted);
        break;
      case 'overdue':
        result = result.filter(task => 
          !task.isCompleted && 
          task.dueDate && 
          new Date(task.dueDate) < new Date()
        );
        break;
              case 'high-priority':
        result = result.filter(task => 
          typeof task.priority === 'string' && task.priority.toLowerCase() === 'high'
        );
        break;
      case 'assigned':
        result = result.filter(task => task.assignedToUserId);
        break;
      case 'unassigned':
        result = result.filter(task => !task.assignedToUserId);
        break;
    }

    // Apply completion filter
    if (!state.showCompletedTasks) {
      result = result.filter(task => !task.isCompleted);
    }

    // Apply custom filters
    state.filters.forEach(filter => {
      if (!filter.isActive) return;
      
      result = result.filter(task => {
        let value: unknown;
        
        // Map filter type to task property
        switch (filter.type) {
          case 'status':
            value = task.status;
            break;
          case 'priority':
            value = task.priority;
            break;
          case 'assignee':
            value = task.assignedToUserId;
            break;
          case 'dueDate':
            value = task.dueDate;
            break;
          case 'tags':
            value = task.tags?.map(tag => typeof tag === 'string' ? tag : tag.name).join(',');
            break;
          case 'category':
            value = task.categoryId;
            break;
          default:
            return true;
        }
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return String(value || '').toLowerCase().includes(String(filter.value).toLowerCase());
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(String(value));
          default:
            return true;
        }
      });
    });

    return result;
  }, [tasks, state.searchQuery, state.filterPreset, state.showCompletedTasks, state.filters]);

  // Task statistics
  const taskStats = useMemo(() => {
    const total = processedTasks.length;
    const completed = processedTasks.filter(task => task.isCompleted).length;
    const overdue = processedTasks.filter(task => 
      !task.isCompleted && 
      task.dueDate && 
      new Date(task.dueDate) < new Date()
    ).length;
    const highPriority = processedTasks.filter(task => 
      typeof task.priority === 'string' && task.priority.toLowerCase() === 'high'
    ).length;

    return {
      total,
      completed,
      active: total - completed,
      overdue,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [processedTasks]);

  // Handlers
  const updateState = useCallback((updates: Partial<TaskManagerState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    updateState({ viewMode: mode });
    onViewModeChange?.(mode);
    triggerHapticFeedback('light');
  }, [updateState, onViewModeChange]);

  const handleFilterPresetChange = useCallback((preset: FilterPreset) => {
    const presetConfig = FILTER_PRESETS[preset];
    updateState({ 
      filterPreset: preset,
      ...presetConfig.filters
    });
    triggerHapticFeedback('light');
  }, [updateState]);

  const handleTaskSelect = useCallback((task: Task) => {
    // Navigate to task detail page when clicking on task row
    window.location.href = `/tasks/${task.id}`;
    triggerHapticFeedback('light');
  }, []);

  const handleTaskEditInSheet = useCallback((task: Task) => {
    // Show edit sheet when clicking edit action button
    setSelectedTask(task);
    setShowTaskDetails(true);
    setIsEditingInSheet(true); // Start in edit mode
    triggerHapticFeedback('light');
  }, []);

  const handleBatchOperationWrapper = useCallback((operation: string, taskIds: number[]) => {
    onBatchOperation?.(operation, taskIds);
    updateState({ selectedTasks: new Set() });
    triggerHapticFeedback('success');
  }, [onBatchOperation, updateState]);



  // Render header with navigation and actions
  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-cyan-900/20 border-b">
      {/* Left Section - Title and Stats */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Task Manager
            {isOffline && (
              <Badge variant="destructive" className="text-xs">
                Offline
              </Badge>
            )}
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {taskStats.total} total
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              {taskStats.completed} completed
            </span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-red-600" />
              {taskStats.overdue} overdue
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-600" />
              {taskStats.highPriority} high priority
            </span>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* Create Task */}
        <Button
          onClick={() => onTaskCreate?.()}
          className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isMobile ? 'Add' : 'Create Task'}
        </Button>

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>

        {/* Export/Import */}
        {enableAdvancedFeatures && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Download className="h-4 w-4 mr-1" />
                {!isMobile && 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExport?.('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('json')}>
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Layout Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(['compact', 'comfortable', 'spacious'] as LayoutMode[]).map(mode => (
              <DropdownMenuCheckboxItem
                key={mode}
                checked={state.layoutMode === mode}
                onCheckedChange={() => updateState({ layoutMode: mode })}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={state.showCompletedTasks}
              onCheckedChange={(checked) => updateState({ showCompletedTasks: checked })}
            >
              Show Completed Tasks
            </DropdownMenuCheckboxItem>
            {enableRealTimeSync && (
              <DropdownMenuCheckboxItem checked>
                Real-time Sync
              </DropdownMenuCheckboxItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Render filter bar
  const renderFilterBar = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white dark:bg-gray-800 border-b">
      {/* Search */}
      <div className="relative flex-1 min-w-0 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tasks..."
          value={state.searchQuery}
          onChange={(e) => updateState({ searchQuery: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filter Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
        {Object.entries(FILTER_PRESETS).map(([key, preset]) => (
          <Button
            key={key}
            variant={state.filterPreset === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterPresetChange(key as FilterPreset)}
            className={`flex-shrink-0 transition-all duration-200 shadow-sm hover:shadow-md ${
              state.filterPreset === key 
                ? key === 'all' ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-600 hover:from-purple-600 hover:to-indigo-700' :
                  key === 'active' ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-blue-600 hover:from-blue-600 hover:to-cyan-700' :
                  key === 'completed' ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-600 hover:from-green-600 hover:to-emerald-700' :
                  key === 'overdue' ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white border-red-600 hover:from-red-600 hover:to-pink-700' :
                  key === 'high-priority' ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white border-orange-600 hover:from-orange-600 hover:to-red-700' :
                  key === 'assigned' ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white border-teal-600 hover:from-teal-600 hover:to-blue-700' :
                  key === 'unassigned' ? 'bg-gradient-to-br from-gray-500 to-slate-600 text-white border-gray-600 hover:from-gray-600 hover:to-slate-700' :
                  'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-600 hover:from-purple-600 hover:to-indigo-700'
                : key === 'all' ? 'bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-indigo-100' :
                  key === 'active' ? 'bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-cyan-100' :
                  key === 'completed' ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 border-green-200 hover:from-green-100 hover:to-emerald-100' :
                  key === 'overdue' ? 'bg-gradient-to-br from-red-50 to-pink-50 text-red-700 border-red-200 hover:from-red-100 hover:to-pink-100' :
                  key === 'high-priority' ? 'bg-gradient-to-br from-orange-50 to-red-50 text-orange-700 border-orange-200 hover:from-orange-100 hover:to-red-100' :
                  key === 'assigned' ? 'bg-gradient-to-br from-teal-50 to-blue-50 text-teal-700 border-teal-200 hover:from-teal-100 hover:to-blue-100' :
                  key === 'unassigned' ? 'bg-gradient-to-br from-gray-50 to-slate-50 text-gray-700 border-gray-200 hover:from-gray-100 hover:to-slate-100' :
                  'bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-indigo-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {preset.icon}
              <span className="ml-1 hidden sm:inline font-semibold">{preset.label}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* Advanced Filters */}
      {enableAdvancedFeatures && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex-shrink-0 transition-all duration-200 shadow-sm hover:shadow-md ${
            showAdvancedFilters 
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-600 hover:from-purple-600 hover:to-indigo-700' 
              : 'bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-700 border-purple-200 hover:from-purple-100 hover:to-indigo-100'
          }`}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {!isMobile && <span className="font-semibold">Filters</span>}
            {state.filters.length > 0 && (
              <Badge 
                variant="secondary" 
                className={`ml-1 h-4 w-4 p-0 text-xs ${
                  showAdvancedFilters 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-purple-100 text-purple-700 border-purple-200'
                }`}
              >
                {state.filters.length}
              </Badge>
            )}
          </div>
        </Button>
      )}
    </div>
  );

  // Render view mode tabs
  const renderViewTabs = () => (
    <Tabs 
      value={state.viewMode} 
      onValueChange={(value) => handleViewModeChange(value as ViewMode)}
      className="w-full"
    >
      <div className="border-b bg-gray-50 dark:bg-gray-900">
        <TabsList className="w-full sm:w-auto h-12 bg-transparent p-1">
          <TabsTrigger value="table" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
            <TableIcon className="h-4 w-4" />
            {!isMobile && 'Table View'}
          </TabsTrigger>
          {enableAnalytics && (
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <BarChart3 className="h-4 w-4" />
              {!isMobile && 'Analytics'}
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      {/* Enhanced Table View with Kanban Features */}
      <TabsContent value="table" className="mt-0">
        <EnterpriseTaskTable
          tasks={processedTasks}
          familyMembers={familyMembers}
          isLoading={isLoading}
          enableBatchOperations={enableBatchOperations}
          enableKanbanSync={true}
          enableAdvancedFilters={enableAdvancedFeatures}
          enableColumnCustomization={enableAdvancedFeatures}
          enableExportImport={enableAdvancedFeatures}
          enableRealTimeUpdates={enableRealTimeSync}
          enableDragAndDrop={true}
          onTaskSelect={handleTaskSelect}
          onTaskEdit={handleTaskEditInSheet}
          onTaskDelete={onTaskDelete}
          onTaskStatusChange={onTaskStatusChange}
          onTaskReorder={(reorderedTasks) => {
            console.log('🔄 Tasks reordered:', reorderedTasks.map(t => t.title));
            triggerHapticFeedback('success');
          }}
          onBatchOperation={handleBatchOperationWrapper}
          onExport={onExport}
          onFilterChange={(filters) => updateState({ 
            filters: filters.map((f, index) => ({
              id: `table-${index}`,
              type: 'custom' as const,
              label: f.label || `Filter ${index}`,
              value: typeof f.value === 'boolean' ? String(f.value) : f.value,
              operator: f.operator || 'equals',
              isActive: true
            }))
          })}
          onSortChange={(column, direction) => updateState({ sortColumn: column, sortDirection: direction || 'desc' })}
          className="border-0 shadow-none"
        />
      </TabsContent>

      {/* Analytics Dashboard */}
      {enableAnalytics && (
        <TabsContent value="dashboard" className="mt-0">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                      <p className="text-2xl font-bold text-blue-900">{taskStats.total}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Completed</p>
                      <p className="text-2xl font-bold text-green-900">{taskStats.completed}</p>
                      <p className="text-xs text-green-600">{taskStats.completionRate}% completion</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Overdue</p>
                      <p className="text-2xl font-bold text-red-900">{taskStats.overdue}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">High Priority</p>
                      <p className="text-2xl font-bold text-orange-900">{taskStats.highPriority}</p>
                    </div>
                    <Flame className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Task Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-12">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Analytics charts would be implemented here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Productivity Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-gray-500 py-12">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Productivity analytics would be shown here</p>
                    <p className="text-sm">Time-series data visualization needed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );

  if (isLoading && tasks.length === 0) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
            <div className="text-gray-500">Loading tasks...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className={`w-full h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}>
        {/* Header */}
        {renderHeader()}

        {/* Filter Bar */}
        {renderFilterBar()}

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && enableAdvancedFeatures && (
          <div className="p-4 bg-purple-50/50 border-b">
            <div className="text-sm font-medium text-gray-700 mb-2">Advanced Filters</div>
            {state.filters.length === 0 ? (
              <div className="text-sm text-gray-500">No advanced filters applied</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {state.filters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => {
                        const newFilters = state.filters.filter((_, i) => i !== index);
                        updateState({ filters: newFilters });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content - View Tabs */}
        <div className="flex-1 overflow-hidden">
          {renderViewTabs()}
        </div>

        {/* Enhanced Task Details Sheet with Inline Editing */}
        <Sheet open={showTaskDetails} onOpenChange={setShowTaskDetails}>
          <SheetContent className="w-full sm:max-w-2xl bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl overflow-y-auto">
            <SheetHeader className="pb-6 border-b border-gray-200 dark:border-gray-700 mb-8">
              <SheetTitle className="flex items-center gap-4 text-xl font-bold text-gray-900 dark:text-gray-100">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  {isEditingInSheet ? <Edit className="h-5 w-5 text-white" /> : <Eye className="h-5 w-5 text-white" />}
                </div>
                {isEditingInSheet ? 'Edit Task' : 'Task Details'}
              </SheetTitle>
              <SheetDescription className="text-gray-600 dark:text-gray-400">
                {isEditingInSheet ? 'Update task information and settings' : 'Complete task information and gamification metrics'}
              </SheetDescription>
            </SheetHeader>
            
            {selectedTask && <TaskDetailsSheetContent 
              task={selectedTask}
              isEditing={isEditingInSheet}
              onStartEdit={() => setIsEditingInSheet(true)}
              onCancelEdit={() => setIsEditingInSheet(false)}
                             onSaveEdit={(updatedTask: Task) => {
                 // Handle task update  
                 onTaskEdit?.(updatedTask);
                 setIsEditingInSheet(false);
                 setShowTaskDetails(false);
                 triggerHapticFeedback('success');
               }}
              onClose={() => {
                setShowTaskDetails(false);
                setIsEditingInSheet(false);
              }}
              familyMembers={familyMembers}
            />}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}
