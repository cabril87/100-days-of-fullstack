'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Star,
  User,
  Flag,
  ChevronLeft,
  ChevronRight,
  Settings,
  Grid3X3,
  List,
  Maximize2,
  Minimize2,
  RotateCcw,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Columns,
  Move,
  Copy,
  Archive,
  BookmarkPlus,
  Tag,
  MessageSquare,
  Paperclip,
  CheckCircle,
  Circle,
  AlertTriangle,
  Zap,
  Target,
  Flame
} from 'lucide-react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, useSensor, useSensors, PointerSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskItemResponseDTO, BoardColumnDTO, TaskItemStatus } from '@/lib/types/task';
import { FamilyMemberDTO } from '@/lib/types/family-invitation';
import { triggerHapticFeedback } from '@/components/search/MobileSearchEnhancements';

// Mobile Kanban Configuration
export type KanbanViewMode = 'columns' | 'swimlanes' | 'cards' | 'compact';
export type ColumnLayout = 'fixed' | 'fluid' | 'scrollable';
export type TouchGesture = 'swipe' | 'pinch' | 'longPress' | 'doubleTap';

export interface MobileKanbanColumn extends BoardColumnDTO {
  isCollapsed?: boolean;
  customColor?: string;
  taskCount?: number;
  completionRate?: number;
}

export interface MobileKanbanTask extends TaskItemResponseDTO {
  isExpanded?: boolean;
  isDragging?: boolean;
  attachmentCount?: number;
  commentCount?: number;
  subtaskCount?: number;
  completedSubtasks?: number;
}

export interface MobileKanbanProps {
  columns: MobileKanbanColumn[];
  tasks: MobileKanbanTask[];
  familyMembers: FamilyMemberDTO[];
  isLoading?: boolean;
  enableTouchGestures?: boolean;
  enableColumnCollapse?: boolean;
  enableQuickActions?: boolean;
  enableBatchOperations?: boolean;
  enableOfflineSync?: boolean;
  maxColumnsVisible?: number;
  onTaskMove?: (taskId: number, fromColumn: string, toColumn: string, position: number) => void;
  onColumnReorder?: (columnIds: string[]) => void;
  onTaskCreate?: (columnId: string) => void;
  onTaskEdit?: (task: MobileKanbanTask) => void;
  onTaskDelete?: (taskId: number) => void;
  onColumnEdit?: (column: MobileKanbanColumn) => void;
  onBatchOperation?: (operation: string, taskIds: number[]) => void;
  onViewModeChange?: (mode: KanbanViewMode) => void;
  className?: string;
}

// Sortable Task Card Component
const SortableTaskCard: React.FC<{
  task: MobileKanbanTask;
  familyMembers: FamilyMemberDTO[];
  isCompact?: boolean;
  onEdit?: (task: MobileKanbanTask) => void;
  onDelete?: (taskId: number) => void;
  onQuickAction?: (action: string, taskId: number) => void;
}> = ({ task, familyMembers, isCompact = false, onEdit, onDelete, onQuickAction }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignee = familyMembers.find(member => member.id === task.assignedToFamilyMemberId);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;
  const priority = task.priority?.toLowerCase();

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50/50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50/50';
      case 'low': return 'border-l-green-500 bg-green-50/50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high': return <Flame className="h-3 w-3 text-red-500" />;
      case 'medium': return <Zap className="h-3 w-3 text-yellow-500" />;
      case 'low': return <Target className="h-3 w-3 text-green-500" />;
      default: return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${getPriorityColor()} border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md group touch-manipulation
                 ${isDragging ? 'shadow-lg rotate-2 scale-105' : ''}
                 ${task.isCompleted ? 'opacity-75' : ''}
                 ${isCompact ? 'mb-2' : 'mb-3'}
                 ${isOverdue ? 'ring-2 ring-red-200' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className={`${isCompact ? 'p-3' : 'p-4'} space-y-2`}>
        {/* Task Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${isCompact ? 'text-sm' : 'text-base'} truncate
                           ${task.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            {!isCompact && task.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {getPriorityIcon()}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit?.(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onQuickAction?.('duplicate', task.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onQuickAction?.('archive', task.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(task.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Task Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {/* Points */}
            {task.pointsValue && (
              <div className="flex items-center gap-1 text-purple-600 font-medium">
                <Star className="h-3 w-3" />
                {task.pointsValue}
              </div>
            )}
            
            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                <Calendar className="h-3 w-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Assignee */}
          {assignee && (
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs">
                  {assignee.firstName?.[0]}{assignee.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              {!isCompact && (
                <span className="truncate max-w-16">
                  {assignee.firstName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Task Indicators */}
        {!isCompact && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {task.attachmentCount && task.attachmentCount > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {task.attachmentCount}
                </div>
              )}
              {task.commentCount && task.commentCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {task.commentCount}
                </div>
              )}
              {task.subtaskCount && task.subtaskCount > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {task.completedSubtasks || 0}/{task.subtaskCount}
                </div>
              )}
            </div>
            
            {/* Status Indicator */}
            <div className={`w-2 h-2 rounded-full ${task.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Sortable Column Component
const SortableColumn: React.FC<{
  column: MobileKanbanColumn;
  tasks: MobileKanbanTask[];
  familyMembers: FamilyMemberDTO[];
  isCompact?: boolean;
  isCollapsed?: boolean;
  onTaskCreate?: () => void;
  onTaskEdit?: (task: MobileKanbanTask) => void;
  onTaskDelete?: (taskId: number) => void;
  onColumnEdit?: () => void;
  onToggleCollapse?: () => void;
}> = ({
  column,
  tasks,
  familyMembers,
  isCompact = false,
  isCollapsed = false,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onColumnEdit,
  onToggleCollapse
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `column-${column.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const getStatusColor = () => {
    switch (column.status) {
      case TaskItemStatus.NotStarted:
        return 'bg-gray-100 border-gray-300 text-gray-700';
      case TaskItemStatus.InProgress:
        return 'bg-blue-100 border-blue-300 text-blue-700';
      case TaskItemStatus.Completed:
        return 'bg-green-100 border-green-300 text-green-700';
      case TaskItemStatus.OnHold:
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case TaskItemStatus.Cancelled:
        return 'bg-red-100 border-red-300 text-red-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isCompact ? 'min-w-64 w-64' : 'min-w-80 w-80'} h-full flex flex-col bg-gray-50 rounded-lg border border-gray-200
                 ${isDragging ? 'opacity-50' : ''}
                 ${isCollapsed ? 'min-w-16 w-16' : ''}`}
    >
      {/* Column Header */}
      <div
        className={`${getStatusColor()} p-3 rounded-t-lg border-b flex items-center justify-between cursor-grab active:cursor-grabbing`}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {!isCollapsed && (
            <>
              <GripVertical className="h-4 w-4 text-gray-400" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate">
                  {column.name}
                </h3>
                <div className="flex items-center gap-2 text-xs opacity-75">
                  <span>{tasks.length} tasks</span>
                  <span>•</span>
                  <span>{completionRate}% complete</span>
                </div>
              </div>
            </>
          )}
          
          {isCollapsed && (
            <div className="transform -rotate-90 text-xs font-medium whitespace-nowrap">
              {column.name}
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleCollapse}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onColumnEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTaskCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleCollapse}>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Collapse Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggleCollapse}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Column Content */}
      {!isCollapsed && (
        <div className="flex-1 p-3 overflow-y-auto">
          <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tasks.map(task => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  familyMembers={familyMembers}
                  isCompact={isCompact}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                />
              ))}
            </div>
          </SortableContext>

          {/* Add Task Button */}
          <Button
            variant="dashed"
            className="w-full mt-3 h-12 border-2 border-dashed border-gray-300 hover:border-purple-300 hover:bg-purple-50"
            onClick={onTaskCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      )}

      {/* Collapsed Column Content */}
      {isCollapsed && (
        <div className="flex-1 p-2 flex flex-col items-center">
          <div className="text-xs font-medium text-gray-600 mb-2">
            {tasks.length}
          </div>
          <div className="flex-1 w-full space-y-1">
            {tasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className={`w-full h-2 rounded ${task.isCompleted ? 'bg-green-400' : 'bg-gray-300'}`}
              />
            ))}
            {tasks.length > 3 && (
              <div className="text-xs text-gray-400 text-center">
                +{tasks.length - 3}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Mobile-First Kanban Board Component
 * 
 * Features:
 * - Touch-optimized drag and drop
 * - Column collapse/expand
 * - Responsive column sizing
 * - Quick actions and gestures
 * - Batch operations
 * - Mobile-specific layouts
 * - Haptic feedback
 * - Offline sync support
 */
export default function MobileKanbanEnhancements({
  columns,
  tasks,
  familyMembers,
  isLoading = false,
  enableTouchGestures = true,
  enableColumnCollapse = true,
  enableQuickActions = true,
  enableBatchOperations = true,
  enableOfflineSync = false,
  maxColumnsVisible = 3,
  onTaskMove,
  onColumnReorder,
  onTaskCreate,
  onTaskEdit,
  onTaskDelete,
  onColumnEdit,
  onBatchOperation,
  onViewModeChange,
  className = ''
}: MobileKanbanProps) {
  // State Management
  const [viewMode, setViewMode] = useState<KanbanViewMode>('columns');
  const [columnLayout, setColumnLayout] = useState<ColumnLayout>('scrollable');
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [draggedTask, setDraggedTask] = useState<MobileKanbanTask | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [isCompactMode, setIsCompactMode] = useState(false);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsCompactMode(mobile);
      
      if (mobile) {
        setColumnLayout('scrollable');
        setViewMode('columns');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, MobileKanbanTask[]> = {};
    
    columns.forEach(column => {
      const columnTasks = tasks.filter(task => task.status.toString() === column.status.toString());
      columnTasks.sort((a, b) => (a.boardPosition || 0) - (b.boardPosition || 0));
      grouped[column.id.toString()] = columnTasks;
    });
    
    return grouped;
  }, [tasks, columns]);

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    
    if (task) {
      setDraggedTask(task);
      triggerHapticFeedback('light');
    }
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const overId = over.id.toString();
    if (overId.startsWith('column-')) {
      const columnId = overId.replace('column-', '');
      setActiveColumn(columnId);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setDraggedTask(null);
    setActiveColumn(null);
    
    if (!over) return;
    
    const taskId = active.id as number;
    const overId = over.id.toString();
    
    // Handle column reordering
    if (overId.startsWith('column-') && active.id.toString().startsWith('column-')) {
      const activeColumnId = active.id.toString().replace('column-', '');
      const overColumnId = overId.replace('column-', '');
      
      if (activeColumnId !== overColumnId) {
        const columnIds = columns.map(col => col.id.toString());
        const oldIndex = columnIds.indexOf(activeColumnId);
        const newIndex = columnIds.indexOf(overColumnId);
        
        const newColumnIds = [...columnIds];
        newColumnIds.splice(oldIndex, 1);
        newColumnIds.splice(newIndex, 0, activeColumnId);
        
        onColumnReorder?.(newColumnIds);
        triggerHapticFeedback('medium');
      }
      return;
    }
    
    // Handle task movement
    if (overId.startsWith('column-')) {
      const targetColumnId = overId.replace('column-', '');
      const task = tasks.find(t => t.id === taskId);
      const currentColumn = columns.find(col => 
        tasksByColumn[col.id.toString()]?.some(t => t.id === taskId)
      );
      
      if (task && currentColumn && currentColumn.id.toString() !== targetColumnId) {
        const targetTasks = tasksByColumn[targetColumnId] || [];
        onTaskMove?.(taskId, currentColumn.id.toString(), targetColumnId, targetTasks.length);
        triggerHapticFeedback('success');
      }
    }
  }, [tasks, columns, tasksByColumn, onTaskMove, onColumnReorder]);

  // Column management
  const toggleColumnCollapse = useCallback((columnId: string) => {
    const newCollapsed = new Set(collapsedColumns);
    if (newCollapsed.has(columnId)) {
      newCollapsed.delete(columnId);
    } else {
      newCollapsed.add(columnId);
    }
    setCollapsedColumns(newCollapsed);
    triggerHapticFeedback('light');
  }, [collapsedColumns]);

  // Render toolbar
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Kanban Board</h2>
        <Badge variant="secondary" className="text-xs">
          {tasks.length} tasks
        </Badge>
      </div>
      
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Grid3X3 className="h-4 w-4 mr-1" />
              {!isMobile && 'View'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewMode('columns')}>
              <Columns className="h-4 w-4 mr-2" />
              Columns
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewMode('compact')}>
              <List className="h-4 w-4 mr-2" />
              Compact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsCompactMode(!isCompactMode)}>
              <Minimize2 className="h-4 w-4 mr-2" />
              {isCompactMode ? 'Expand Cards' : 'Compact Cards'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setColumnLayout(
              columnLayout === 'fixed' ? 'scrollable' : 'fixed'
            )}>
              <Move className="h-4 w-4 mr-2" />
              {columnLayout === 'fixed' ? 'Scrollable Layout' : 'Fixed Layout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Render columns
  const renderColumns = () => {
    const visibleColumns = columns.slice(0, isMobile ? maxColumnsVisible : columns.length);
    
    return (
      <div
        ref={scrollContainerRef}
        className={`flex-1 flex ${columnLayout === 'scrollable' ? 'overflow-x-auto' : 'overflow-hidden'} p-4 gap-4`}
      >
        <SortableContext
          items={columns.map(col => `column-${col.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {visibleColumns.map(column => {
            const columnTasks = tasksByColumn[column.id.toString()] || [];
            const isCollapsed = collapsedColumns.has(column.id.toString());
            
            return (
              <SortableColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                familyMembers={familyMembers}
                isCompact={isCompactMode}
                isCollapsed={isCollapsed}
                onTaskCreate={() => onTaskCreate?.(column.id.toString())}
                onTaskEdit={onTaskEdit}
                onTaskDelete={onTaskDelete}
                onColumnEdit={() => onColumnEdit?.(column)}
                onToggleCollapse={() => toggleColumnCollapse(column.id.toString())}
              />
            );
          })}
        </SortableContext>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
            <div className="text-gray-500">Loading board...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`w-full h-full flex flex-col overflow-hidden ${className}`}>
        {/* Toolbar */}
        {renderToolbar()}

        {/* Batch Operations Bar */}
        {enableBatchOperations && selectedTasks.size > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-200">
            <span className="text-sm font-medium text-blue-800">
              {selectedTasks.size} tasks selected
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedTasks(new Set())}>
                Cancel
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onBatchOperation?.('complete', Array.from(selectedTasks))}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBatchOperation?.('archive', Array.from(selectedTasks))}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBatchOperation?.('delete', Array.from(selectedTasks))}>
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {renderColumns()}
        </DndContext>

        {/* Mobile Column Navigation */}
        {isMobile && columns.length > maxColumnsVisible && (
          <div className="flex items-center justify-center p-3 bg-gray-50 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft -= 320;
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Swipe to see more columns
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollLeft += 320;
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  );
}