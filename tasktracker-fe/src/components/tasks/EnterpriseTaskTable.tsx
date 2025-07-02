'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Calendar as CalendarIcon,
  Clock,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Circle,
  Users,
  Sparkles,
  X,
  ListChecks,
  Search,
  MoreHorizontal,
  MoreVertical,
  ArrowUpDown,
  Filter,
  Download,
  Settings,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flag,
  User,
  Tag,
  Star,
  Activity,
  GripVertical,
  CalendarDays,
  Home
} from 'lucide-react';
import { Task, TaskItemStatus } from '@/lib/types/tasks';
import { triggerHapticFeedback } from '@/lib/helpers/mobile';

import type { 
  EnterpriseTaskTableProps,
  TableViewMode,
  TableDensity,
  SortDirection,
  ColumnKey,
  TableColumn,
  TableFilter
} from '@/lib/props/components/tasks.props';

// Default column configuration
const DEFAULT_COLUMNS: TableColumn[] = [
  {
    key: 'title',
    label: 'Task',
    icon: <ListChecks className="h-4 w-4" />,
    sortable: true,
    filterable: true,
    width: 'minmax(200px, 1fr)',
    sticky: true,
    align: 'left'
  },
  {
    key: 'status',
    label: 'Status',
    icon: <Activity className="h-4 w-4" />,
    sortable: true,
    filterable: true,
    width: '120px',
    hiddenOn: 'mobile',
    align: 'center'
  },
  {
    key: 'priority',
    label: 'Priority',
    icon: <Flag className="h-4 w-4" />,
    sortable: true,
    filterable: true,
    width: '100px',
    hiddenOn: 'mobile',
    align: 'center'
  },
  {
    key: 'points',
    label: 'XP',
    icon: <Star className="h-4 w-4" />,
    sortable: true,
    filterable: true,
    width: '80px',
    align: 'center'
  },
  {
    key: 'assignee',
    label: 'Assignee',
    icon: <User className="h-4 w-4" />,
    sortable: true,
    filterable: true,
    width: '180px',
    hiddenOn: 'tablet',
    align: 'center'
  },
  {
    key: 'family',
    label: 'Family',
    icon: <Home className="h-4 w-4" />,
    sortable: true,
    filterable: true,
    width: '120px',
    hiddenOn: 'mobile',
    align: 'center'
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    icon: <CalendarIcon className="h-4 w-4" />,
    sortable: true,
    filterable: true,
    width: '120px',
    hiddenOn: 'mobile',
    align: 'center'
  },
  {
    key: 'createdAt',
    label: 'Created',
    icon: <Clock className="h-4 w-4" />,
    sortable: true,
    filterable: true,
    width: '120px',
    hiddenOn: 'tablet',
    align: 'center'
  },
  {
    key: 'tags',
    label: 'Tags',
    icon: <Tag className="h-4 w-4" />,
    sortable: false,
    filterable: true,
    width: '150px',
    hiddenOn: 'mobile',
    align: 'left'
  },
  {
    key: 'actions',
    label: 'Actions',
    icon: <MoreVertical className="h-4 w-4" />,
    sortable: false,
    filterable: false,
    width: '60px',
    align: 'center'
  }
];

/**
 * Enterprise Task Table Component
 * 
 * Features:
 * - Advanced filtering and sorting
 * - Column customization and reordering
 * - Batch operations with selection
 * - Mobile-responsive design
 * - Kanban board sync
 * - Export/Import functionality
 * - Real-time updates
 * - Accessibility compliance
 * - Performance optimization
 */
// Sortable Row Component
const SortableTableRow: React.FC<{
  task: Task;
  isSelected: boolean;
  viewMode: TableViewMode;
  density: TableDensity;
  activeColumns: TableColumn[];
  enableBatchOperations: boolean;
  enableKanbanSync: boolean;
  enableDragAndDrop: boolean;
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  onTaskStatusChange?: (taskId: number, status: TaskItemStatus) => void;
  onSelectTask: (taskId: number, checked: boolean) => void;
  renderCellContent: (task: Task, columnKey: ColumnKey) => React.ReactNode;
}> = ({
  task,
  isSelected,
  viewMode,
  density,
  activeColumns,
  enableBatchOperations,
  enableKanbanSync,
  enableDragAndDrop,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onSelectTask,
  renderCellContent
}) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: task.id,
      data: {
        type: 'task',
        taskId: task.id,
        task: task,
      },
      disabled: !enableDragAndDrop,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    // Enterprise gamification styling based on task properties
    const getTaskStyling = () => {
      const baseClasses = "group transition-all duration-300 cursor-pointer relative overflow-hidden border-b";

      if (isDragging) {
        return `${baseClasses} opacity-50 scale-105 shadow-2xl z-50 bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 dark:from-purple-800/50 dark:via-blue-800/50 dark:to-cyan-800/50 border-purple-400`;
      }

      if (isSelected) {
        return `${baseClasses} bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-900/30 dark:via-blue-900/30 dark:to-cyan-900/30 border-l-4 border-purple-500 shadow-md hover:shadow-lg`;
      }

      if (task.isCompleted) {
        return `${baseClasses} bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 opacity-75 hover:opacity-90 border-green-200 dark:border-green-800`;
      }

      // High priority tasks get special styling
      if (typeof task.priority === 'string' && task.priority.toLowerCase() === 'high') {
        return `${baseClasses} bg-gradient-to-r from-red-50/30 to-orange-50/30 dark:from-red-900/10 dark:to-orange-900/10 border-red-200/50 dark:border-red-800/50 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-orange-50/50`;
      }

      return `${baseClasses} bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gradient-to-r hover:from-purple-50/30 hover:via-blue-50/30 hover:to-transparent dark:hover:from-purple-900/10 dark:hover:via-blue-900/10 dark:hover:to-transparent hover:shadow-sm`;
    };

    const heightClass = viewMode === 'compact' ? 'h-14' : viewMode === 'comfortable' ? 'h-18' : 'h-22';

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        className={`${getTaskStyling()} ${heightClass}`}
        onClick={() => onTaskSelect?.(task)}
        {...(enableDragAndDrop ? attributes : {})}
        {...(enableDragAndDrop ? listeners : {})}
      >
        {/* Enterprise Drag Handle */}
        {enableDragAndDrop && (
          <TableCell className="w-4 p-2 sticky left-0 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/20 dark:to-blue-900/20 z-10 border-r border-purple-200/50">
            <div className="flex items-center justify-center h-full">
              <div className="relative group/handle">
                <GripVertical className="h-4 w-4 text-purple-400 group-hover/handle:text-purple-600 dark:text-purple-500 dark:group-hover/handle:text-purple-300 transition-colors duration-200" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full scale-0 group-hover/handle:scale-150 transition-transform duration-300 opacity-0 group-hover/handle:opacity-100" />
              </div>
            </div>
          </TableCell>
        )}

        {/* Enterprise Batch Selection */}
        {enableBatchOperations && (
          <TableCell className={`w-12 p-3 ${enableDragAndDrop ? 'sticky left-4' : 'sticky left-0'} bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-900/20 dark:to-cyan-900/20 z-10 border-r border-blue-200/50`}>
            <div className="flex items-center justify-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select task ${task.title}`}
                className="border-2 border-blue-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-blue-500 transition-all duration-200 scale-110"
              />
            </div>
          </TableCell>
        )}

        {/* Dynamic Columns with Enterprise Styling */}
        {activeColumns.map(column => {
          const leftOffset = enableDragAndDrop && enableBatchOperations ? 'left-16' :
            enableDragAndDrop ? 'left-4' :
              enableBatchOperations ? 'left-12' : 'left-0';

          return (
            <TableCell
              key={column.key}
              className={`${column.sticky ? `sticky ${leftOffset} bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 border-r border-gray-200/50` : ''}
                       ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                       ${density === 'tight' ? 'py-2 px-3' : density === 'normal' ? 'py-3 px-4' : 'py-4 px-5'}
                       transition-all duration-200`}
              onClick={column.key === 'dueDate' ? (e) => e.stopPropagation() : undefined}
            >
              <div className="flex items-center gap-2">
                {renderCellContent(task, column.key)}
              </div>
            </TableCell>
          );
        })}

        {/* Enterprise Actions */}
        <TableCell className="text-center p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 dark:hover:from-purple-800/30 dark:hover:to-blue-800/30"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskEdit?.(task);
                }}
                className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30"
              >
                <Edit className="h-4 w-4 mr-2 text-purple-600" />
                <span className="font-medium">Edit Task</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onTaskSelect?.(task)}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/30 dark:hover:to-cyan-900/30"
              >
                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">View Details</span>
              </DropdownMenuItem>
              {enableKanbanSync && (
                <>
                  <DropdownMenuSeparator className="bg-purple-200/50 dark:bg-purple-700/50" />
                  <DropdownMenuLabel className="text-purple-700 dark:text-purple-300 font-semibold">Change Status</DropdownMenuLabel>
                  {Object.values(TaskItemStatus).filter(status => typeof status === 'number').map(status => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onTaskStatusChange?.(task.id, status as TaskItemStatus)}
                      className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30"
                    >
                      <Circle className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">{TaskItemStatus[status as TaskItemStatus]}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuSeparator className="bg-red-200/50 dark:bg-red-700/50" />
              <DropdownMenuItem
                onClick={() => onTaskDelete?.(task.id)}
                className="text-red-600 focus:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/30 dark:hover:to-pink-900/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                <span className="font-medium">Delete Task</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

// Add proper type for inline editing values
type InlineEditValue = string | number | boolean | Date | TaskItemStatus | null | undefined;

export default function EnterpriseTaskTable({
  tasks,
  familyMembers,
  isLoading = false,
  enableBatchOperations = true,
  enableKanbanSync = true,
  enableAdvancedFilters = true,
  enableExportImport = true,
  enableDragAndDrop = true,
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskStatusChange,
  onTaskUpdate,
  onTaskReorder,
  onBatchOperation,
  onExport,
  onSortChange,
  className = ''
}: EnterpriseTaskTableProps) {
  // State Management
  const [viewMode, setViewMode] = useState<TableViewMode>('comfortable');
  const [density, setDensity] = useState<TableDensity>('normal');
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(
    DEFAULT_COLUMNS.map(col => col.key)
  );
  const [sortColumn, setSortColumn] = useState<ColumnKey>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<TableFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [hasManualOrder, setHasManualOrder] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [orderedTasks, setOrderedTasks] = useState<Task[]>(tasks);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{
    taskId: number;
    column: ColumnKey;
  } | null>(null);
  const [editingValue, setEditingValue] = useState<InlineEditValue>(null);

  // Enhanced Drag and Drop Sensors with better sensitivity
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for easier dragging
        tolerance: 5,
        delay: 100,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Update ordered tasks when tasks prop changes - but preserve user reordering
  useEffect(() => {
    // Only update if the task list has actually changed (not just reordered)
    const currentTaskIds = orderedTasks.map(t => t.id).sort().join(',');
    const newTaskIds = tasks.map(t => t.id).sort().join(',');

    if (currentTaskIds !== newTaskIds) {
      setOrderedTasks(tasks);
      setHasManualOrder(false); // Reset manual order when task list changes
    }
  }, [tasks, orderedTasks]); // Include orderedTasks dependency

  // Inline editing handlers
  const startInlineEdit = useCallback((taskId: number, column: ColumnKey, currentValue: InlineEditValue) => {
    setEditingCell({ taskId, column });
    setEditingValue(currentValue);
  }, []);

  const cancelInlineEdit = useCallback(() => {
    setEditingCell(null);
    setEditingValue(null);
  }, []);

  const saveInlineEdit = useCallback((taskId: number, column: ColumnKey, newValue: InlineEditValue) => {
    // Find the task and create updated version
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task };

    // Update the specific property based on column with proper type safety
    switch (column) {
      case 'status':
        updatedTask.isCompleted = newValue === 'completed';
        onTaskStatusChange?.(taskId, newValue as TaskItemStatus);
        break;
      case 'priority':
        updatedTask.priority = newValue as 'Low' | 'Medium' | 'High' | 'Urgent';
        break;
      case 'assignee':
        updatedTask.assignedToUserId = newValue === 'unassigned' ? undefined : parseInt(String(newValue));
        break;
      case 'points':
        updatedTask.pointsValue = parseInt(String(newValue)) || 0;
        break;
      case 'dueDate':
        updatedTask.dueDate = newValue ? new Date(String(newValue)) : undefined;
        break;
    }

    // Call the edit handler
    onTaskEdit?.(updatedTask);

    // Clear editing state
    setEditingCell(null);
    setEditingValue(null);

    triggerHapticFeedback('success');
  }, [tasks, onTaskEdit, onTaskStatusChange]);

  // Handle clicking outside to cancel inline editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingCell && !(event.target as Element).closest('.inline-edit-container')) {
        cancelInlineEdit();
      }
    };

    if (editingCell) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [editingCell, cancelInlineEdit]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return;

      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-adjust for mobile
      if (mobile) {
        setViewMode('compact');
        setDensity('tight');
        setPageSize(10);
      }
    };

    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Drag and Drop Event Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = orderedTasks.find(t => t.id === active.id);
    setDraggedTask(task || null);
    triggerHapticFeedback('light');
  }, [orderedTasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setDraggedTask(null);
      return;
    }

    const oldIndex = orderedTasks.findIndex(task => task.id === active.id);
    const newIndex = orderedTasks.findIndex(task => task.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrderedTasks = arrayMove(orderedTasks, oldIndex, newIndex);
      setOrderedTasks(newOrderedTasks);
      setHasManualOrder(true);
      onTaskReorder?.(newOrderedTasks);
      triggerHapticFeedback('success');
    }

    setDraggedTask(null);
  }, [orderedTasks, onTaskReorder]);

  // Filtered and sorted tasks
  const processedTasks = useMemo(() => {
    let result = [...orderedTasks];

    // Apply search filter with proper type safety
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = task.description?.toLowerCase().includes(query) || false;
        const tagMatch = task.tags?.some(tag =>
          tag.name.toLowerCase().includes(query)
        ) || false;

        return titleMatch || descMatch || tagMatch;
      });
    }

    // Apply column filters with explicit type safety
    filters.forEach(filter => {
      result = result.filter(task => {
        let value: string | number | boolean | Date | TaskItemStatus | undefined;

        // Explicit property access with type safety
        switch (filter.column) {
          case 'title':
            value = task.title;
            break;
          case 'status':
            value = task.status;
            break;
          case 'priority':
            value = task.priority;
            break;
          case 'assignee':
            value = task.assignedToUserId;
            break;
          case 'family':
            // Handle family filtering separately
            if (filter.operator === 'contains') {
              const familyName = task.familyId ?
                familyMembers.find(m => m.familyId === task.familyId)?.family?.name || 'Family Task' :
                'Personal';
              return familyName.toLowerCase().includes(String(filter.value).toLowerCase());
            } else if (filter.operator === 'equals') {
              const isFamily = task.familyId ? 'family' : 'personal';
              return isFamily === String(filter.value).toLowerCase();
            }
            return true;
          case 'dueDate':
            value = task.dueDate;
            break;
          case 'createdAt':
            value = task.createdAt;
            break;
          case 'points':
            value = task.pointsValue;
            break;
          case 'tags':
            // Handle tags separately
            if (filter.operator === 'contains' && task.tags) {
              return task.tags.some(tag =>
                tag.name.toLowerCase().includes(String(filter.value).toLowerCase())
              );
            }
            return true;
          default:
            return true;
        }

        if (value === undefined || value === null) return false;

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            const valueStr = value instanceof Date ? value.toISOString() : String(value || '');
            const filterStr = filter.value instanceof Date ? filter.value.toISOString() : String(filter.value || '');
            return valueStr.toLowerCase().includes(filterStr.toLowerCase());
          case 'in':
            return Array.isArray(filter.value) && filter.value.includes(String(value));
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          default:
            return true;
        }
      });
    });

    // Apply sorting - but only if user hasn't manually reordered tasks
    if (sortColumn && sortDirection && !hasManualOrder) {
      result.sort((a, b) => {
        const aValue = a[sortColumn as keyof Task];
        const bValue = b[sortColumn as keyof Task];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [orderedTasks, searchQuery, filters, sortColumn, sortDirection, hasManualOrder, familyMembers]);

  // Pagination
  const totalPages = Math.ceil(processedTasks.length / pageSize);
  const paginatedTasks = processedTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Column configuration with responsive visibility
  const activeColumns = useMemo(() => {
    return DEFAULT_COLUMNS.filter(col => {
      if (!visibleColumns.includes(col.key)) return false;

      if (isMobile && col.hiddenOn === 'mobile') return false;
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && col.hiddenOn === 'tablet') return false;

      return true;
    });
  }, [visibleColumns, isMobile]);

  // Handlers
  const handleSort = useCallback((column: ColumnKey) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    setHasManualOrder(false);
    onSortChange?.(column, newDirection);
    triggerHapticFeedback('light');
  }, [sortColumn, sortDirection, onSortChange]);

  const handleSelectTask = useCallback((taskId: number, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
    triggerHapticFeedback('light');
  }, [selectedTasks]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(paginatedTasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
    triggerHapticFeedback('medium');
  }, [paginatedTasks]);

  const handleBatchOperation = useCallback((operation: string) => {
    const taskIds = Array.from(selectedTasks);
    console.log('Executing batch operation:', operation, 'on tasks:', taskIds);

    if (taskIds.length === 0) {
      console.warn('No tasks selected for batch operation');
      return;
    }

    // Call the parent handler if provided
    if (onBatchOperation) {
      onBatchOperation(operation, taskIds);
    } else {
      console.log('No batch operation handler provided, operation would be:', operation);
    }

    // Clear selection after operation
    setSelectedTasks(new Set());
    triggerHapticFeedback('success');
  }, [selectedTasks, onBatchOperation]);

  // Efficient single property update using PATCH with PUT fallback
  const updateTaskProperty = useCallback(async (taskId: number, property: string, value: unknown) => {
    try {
      const updates = { [property]: value };

      // Import taskService dynamically to avoid circular dependencies
      const { taskService } = await import('@/lib/services/taskService');

      try {
        // Try PATCH first for efficiency
        await taskService.patchTask(taskId, updates);
        console.log(`✅ Task ${taskId} property ${property} updated via PATCH to:`, value);
      } catch (patchError: unknown) {
        // If PATCH fails (405 Method Not Allowed), fall back to onTaskUpdate or regular update
        const errorMessage = patchError instanceof Error ? patchError.message : 'Unknown error';
        console.warn(`⚠️ PATCH failed for task ${taskId}, falling back to alternative update:`, errorMessage);

        if (onTaskUpdate) {
          // Use the onTaskUpdate prop if available
          onTaskUpdate(taskId, updates);
          console.log(`✅ Task ${taskId} property ${property} updated via onTaskUpdate to:`, value);
        } else {
          // Last resort: find the task and update with PUT
          const task = tasks.find(t => t.id === taskId);
          if (task) {
            const updatedTask = { ...task, [property]: value };

            // Convert to the format the backend expects
            if (property === 'status') {
              updatedTask.isCompleted = value === TaskItemStatus.Completed;
              if (value === TaskItemStatus.Completed) {
                updatedTask.completedAt = new Date();
              }
            }
            if (property === 'dueDate' && typeof value === 'string') {
              updatedTask.dueDate = new Date(value);
            }

            // Use the existing updateTask method
            await taskService.updateTask(taskId, {
              title: updatedTask.title,
              description: updatedTask.description || '',
              dueDate: updatedTask.dueDate ? updatedTask.dueDate.toISOString() : undefined,
              priority: updatedTask.priority,
              status: updatedTask.status,
              categoryId: updatedTask.categoryId,
              pointsValue: updatedTask.pointsValue,
              assignedToUserId: updatedTask.assignedToUserId
            });
            console.log(`✅ Task ${taskId} property ${property} updated via PUT fallback to:`, value);
          }
        }
      }

      triggerHapticFeedback('success');

      // Force refresh by calling onTaskUpdate which triggers the parent's refresh
      console.log(`🔄 Triggering refresh for task ${taskId} after ${property} update`);
      if (onTaskUpdate) {
        // Call onTaskUpdate to trigger the parent's refresh logic
        onTaskUpdate(taskId, { [property]: value });
      }
    } catch (error) {
      console.error(`❌ Failed to update task ${taskId} property ${property}:`, error);
      triggerHapticFeedback('error');
    }
  }, [onTaskUpdate, tasks]);

  // Status color mapping
  const getStatusColor = (status: TaskItemStatus) => {
    switch (status) {
      case TaskItemStatus.NotStarted:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case TaskItemStatus.InProgress:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case TaskItemStatus.Completed:
        return 'bg-green-100 text-green-800 border-green-300';
      case TaskItemStatus.OnHold:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case TaskItemStatus.Cancelled:
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string | undefined) => {
    if (!priority || typeof priority !== 'string') {
      return 'bg-gray-100 text-gray-800 border-gray-300';
    }

    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Render functions
  const renderTableHeader = () => (
    <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <TableRow className="hover:bg-transparent">
        {/* Enterprise Drag Handle Header */}
        {enableDragAndDrop && (
          <TableHead className="w-4 p-3 sticky left-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-30 text-center border-r border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center">
              <div className="p-1.5 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-sm">
                <GripVertical className="h-3 w-3 text-white" />
              </div>
            </div>
          </TableHead>
        )}

        {/* Enterprise Batch Selection Header */}
        {enableBatchOperations && (
          <TableHead className={`w-12 p-3 ${enableDragAndDrop ? 'sticky left-4' : 'sticky left-0'} bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-30 text-center border-r border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedTasks.size === paginatedTasks.length && paginatedTasks.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Select all tasks"
                className="border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-blue-500 transition-all duration-200"
              />
            </div>
          </TableHead>
        )}

        {/* Enterprise Column Headers */}
        {activeColumns.map(column => {
          const leftOffset = enableDragAndDrop && enableBatchOperations ? 'left-16' :
            enableDragAndDrop ? 'left-4' :
              enableBatchOperations ? 'left-12' : 'left-0';

          return (
            <TableHead
              key={column.key}
              className={`${column.sticky ? `sticky ${leftOffset} bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-30 border-r border-gray-200 dark:border-gray-700` : ''}
                         ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                         font-semibold text-gray-700 dark:text-gray-300 p-4 transition-all duration-200
                         ${column.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}`}
              style={{ width: column.width, minWidth: column.minWidth }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-sm">
                  <div className="text-white">
                    {column.icon}
                  </div>
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-semibold text-sm">{column.label}</span>
                {column.sortable && (
                  <div className="flex items-center ml-auto">
                    {sortColumn === column.key ? (
                      <div className="p-1 bg-gradient-to-br from-amber-500 to-orange-600 rounded shadow-sm">
                        {sortDirection === 'asc' ?
                          <SortAsc className="h-3 w-3 text-white" /> :
                          <SortDesc className="h-3 w-3 text-white" />
                        }
                      </div>
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    )}
                  </div>
                )}
              </div>
            </TableHead>
          );
        })}

        {/* Enterprise Actions Header */}
        <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300 p-4">
          <div className="flex items-center justify-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm">Actions</span>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );



  const renderCellContent = (task: Task, columnKey: ColumnKey) => {
    const isEditing = editingCell?.taskId === task.id && editingCell?.column === columnKey;

    switch (columnKey) {
      case 'title':
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg shadow-sm flex-shrink-0 ${task.isCompleted
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-purple-500 to-blue-600'
              }`}>
              {task.isCompleted ?
                <CheckCircle className="h-4 w-4 text-white" /> :
                <Circle className="h-4 w-4 text-white" />
              }
            </div>
            <div className="min-w-0 flex-1">
              <div className={`font-bold text-base truncate ${task.isCompleted
                ? 'line-through text-gray-600 dark:text-gray-400'
                : 'text-gray-900 dark:text-gray-100'
                }`}>
                {task.title}
              </div>
              {viewMode !== 'compact' && task.description && (
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate mt-1">
                  {task.description}
                </div>
              )}
            </div>
          </div>
        );

      case 'status':
        // Get the actual task status, prioritizing task.status over isCompleted
        const getActualStatus = () => {
          if (task.status !== undefined) {
            return task.status;
          }
          return task.isCompleted ? TaskItemStatus.Completed : TaskItemStatus.NotStarted;
        };

        const taskStatus = getActualStatus();

        // Map TaskItemStatus enum to string values for Select component
        const getStatusValue = (status: TaskItemStatus) => {
          switch (status) {
            case TaskItemStatus.NotStarted: return 'not-started';
            case TaskItemStatus.InProgress: return 'in-progress';
            case TaskItemStatus.Pending: return 'pending';
            case TaskItemStatus.OnHold: return 'on-hold';
            case TaskItemStatus.Completed: return 'completed';
            default: return 'not-started';
          }
        };

        const statusValue = getStatusValue(taskStatus);

        return (
          <div className="inline-edit-container relative z-[70]" onClick={(e) => e.stopPropagation()}>
            <Select
              value={statusValue}
              onValueChange={(value) => {
                // Handle status change with efficient PATCH update
                updateTaskProperty(task.id, 'status', value);

                // Also call the legacy handlers for compatibility
                const newStatus = value === 'completed' ? TaskItemStatus.Completed :
                  value === 'in-progress' ? TaskItemStatus.InProgress :
                    value === 'pending' ? TaskItemStatus.Pending :
                      value === 'on-hold' ? TaskItemStatus.OnHold :
                        TaskItemStatus.NotStarted;
                onTaskStatusChange?.(task.id, newStatus);
              }}
            >
              <SelectTrigger className={`w-32 h-8 text-xs ${getStatusColor(taskStatus)} border-2 font-bold relative z-[70]`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="relative z-[100]">
                <SelectItem value="not-started">🔄 Not Started</SelectItem>
                <SelectItem value="in-progress">⚡ In Progress</SelectItem>
                <SelectItem value="pending">⏳ Pending</SelectItem>
                <SelectItem value="on-hold">⏸️ On Hold</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'priority':
        // Normalize priority values to consistent string format
        const normalizePriority = (priority: string | number | undefined): string => {
          if (typeof priority === 'number') {
            switch (priority) {
              case 0: return 'Low';
              case 1: return 'Medium';
              case 2: return 'High';
              case 3: return 'Urgent';
              default: return 'Medium';
            }
          }
          return priority || 'Medium';
        };

        const priorityValue = normalizePriority(task.priority);

        return (
          <div className="inline-edit-container" onClick={(e) => e.stopPropagation()}>
            <Select
              value={priorityValue}
              onValueChange={(value) => {
                // Handle priority change with efficient PATCH update
                updateTaskProperty(task.id, 'priority', value);
              }}
            >
              <SelectTrigger className={`w-28 h-8 text-xs ${getPriorityColor(priorityValue)} border-2 font-bold`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">🟢 Low</SelectItem>
                <SelectItem value="Medium">🟡 Medium</SelectItem>
                <SelectItem value="High">🟠 High</SelectItem>
                <SelectItem value="Urgent">🔴 Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'points':
        if (isEditing) {
          return (
            <div className="inline-edit-container" onClick={(e) => e.stopPropagation()}>
              <Input
                type="number"
                value={String(editingValue || '')}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => saveInlineEdit(task.id, 'points', editingValue)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveInlineEdit(task.id, 'points', editingValue);
                  } else if (e.key === 'Escape') {
                    cancelInlineEdit();
                  }
                }}
                className="w-20 h-8 text-xs text-center"
                autoFocus
              />
            </div>
          );
        }

        return (
          <div
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 px-3 py-2 rounded-lg border-2 border-amber-300 dark:border-amber-600 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              startInlineEdit(task.id, 'points', task.pointsValue || 10);
            }}
          >
            <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
              {task.pointsValue || 10} XP
            </span>
          </div>
        );

      case 'assignee':
        const assignee = familyMembers.find(member => member.id === task.assignedToUserId);
        const assigneeValue = task.assignedToUserId?.toString() || 'unassigned';

        // Determine family context
        const familyContext = task.familyId ? {
          isFamily: true,
          familyName: familyMembers.find(m => m.familyId === task.familyId)?.family?.name || 'Family Task'
        } : {
          isFamily: false,
          familyName: 'Personal Task'
        };

        return (
          <div className="inline-edit-container" onClick={(e) => e.stopPropagation()}>
            <Select
              value={assigneeValue}
              onValueChange={(value) => {
                // Handle assignee change with efficient PATCH update
                const newAssigneeId = value === 'unassigned' ? null : parseInt(value);
                updateTaskProperty(task.id, 'assignedToUserId', newAssigneeId);
              }}
            >
              <SelectTrigger className="w-44 h-10 text-xs bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 font-bold">
                <SelectValue>
                  <div className="flex flex-col items-start gap-1">
                    {/* Task Context Badge */}
                    <div className="flex items-center gap-1">
                      {familyContext.isFamily ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-purple-600" />
                          <span className="text-[10px] text-purple-700 font-bold">
                            {familyContext.familyName}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-blue-600" />
                          <span className="text-[10px] text-blue-700 font-bold">Personal</span>
                        </div>
                      )}
                    </div>

                    {/* Assignee Display */}
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-4 w-4 border border-purple-300">
                          <AvatarFallback className="text-[8px] font-bold bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                            {assignee.user.firstName?.[0] || ''}{assignee.user.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate text-xs">
                          {assignee.user.firstName || assignee.user.username}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">🎯 Unassigned</span>
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🎯 Unassigned</span>
                  </div>
                </SelectItem>
                {familyMembers.filter(member => member.userId).map(member => (
                  <SelectItem key={member.userId} value={member.userId!.toString()}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5 border border-purple-300">
                          <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                            {member.user.firstName?.[0] || ''}{member.user.lastName?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">
                          {member.user.firstName || member.user.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-7">
                        <Users className="h-3 w-3 text-purple-500" />
                        <span className="text-xs text-gray-500">
                          {member.family?.name || 'Family Member'}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'dueDate':
        return (
                    <div 
            className="inline-edit-container relative z-[90]" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onDragStart={(e) => e.preventDefault()}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ pointerEvents: 'auto', isolation: 'isolate' }}
          >
                        <Popover>
                <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-40 h-8 text-xs bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-2 border-blue-200 dark:border-blue-800 font-bold justify-start relative z-[80] hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900/50 dark:hover:to-cyan-900/50 transition-all duration-200"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('📅 Calendar button clicked for task:', task.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                  {task.dueDate ? (
                    <span className={
                      new Date(task.dueDate) < new Date() && !task.isCompleted
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Set date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 relative z-[1000] shadow-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900"
                align="start"
                side="bottom"
                sideOffset={8}
              >
                {/* Enterprise Calendar Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="font-semibold text-sm">Schedule Task</span>
                  </div>
                </div>

                {/* Calendar Component with Enterprise Styling */}
                <div className="p-4 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
                  <CalendarComponent
                    mode="single"
                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        // Preserve time if it exists, otherwise set to 9 AM
                        const existingTime = task.dueDate ? new Date(task.dueDate) : new Date();
                        const newDateTime = new Date(date);
                        newDateTime.setHours(
                          task.dueDate ? existingTime.getHours() : 9,
                          task.dueDate ? existingTime.getMinutes() : 0,
                          0,
                          0
                        );
                        updateTaskProperty(task.id, 'dueDate', newDateTime.toISOString());
                      } else {
                        updateTaskProperty(task.id, 'dueDate', null);
                      }
                    }}
                    initialFocus
                    className="rounded-lg border-2 border-blue-100 dark:border-blue-900/50 shadow-sm"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-semibold text-gray-900 dark:text-gray-100",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors",
                      nav_button_previous: "absolute left-1",
                      nav_button_next: "absolute right-1",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-gray-500 dark:text-gray-400 rounded-md w-8 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-100 dark:[&:has([aria-selected])]:bg-blue-900/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-md",
                      day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors",
                      day_selected: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-700 focus:bg-gradient-to-r focus:from-blue-500 focus:to-purple-600",
                      day_today: "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-semibold",
                      day_outside: "text-gray-400 dark:text-gray-600 opacity-50",
                      day_disabled: "text-gray-400 dark:text-gray-600 opacity-50",
                      day_range_middle: "aria-selected:bg-blue-100 dark:aria-selected:bg-blue-900/50 aria-selected:text-blue-900 dark:aria-selected:text-blue-100",
                      day_hidden: "invisible",
                    }}
                  />
                </div>

                {/* Time Selection and Actions */}
                <div className="p-4 border-t border-blue-100 dark:border-blue-900/50 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-800 dark:to-blue-950/20 rounded-b-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time:</span>
                    <input
                      type="time"
                      value={task.dueDate ?
                        new Date(task.dueDate).toTimeString().slice(0, 5) :
                        "09:00"
                      }
                      onChange={(e) => {
                        if (task.dueDate) {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(task.dueDate);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          updateTaskProperty(task.id, 'dueDate', newDate.toISOString());
                        }
                      }}
                      className="text-sm border-2 border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTaskProperty(task.id, 'dueDate', null)}
                      className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:border-red-800 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(9, 0, 0, 0);
                        updateTaskProperty(task.id, 'dueDate', tomorrow.toISOString());
                      }}
                      className="flex-1 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Tomorrow 9AM
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'createdAt':
        return (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        );

      case 'family':
        const taskFamily = task.familyId ?
          familyMembers.find(m => m.familyId === task.familyId)?.family : null;

        return task.familyId ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-200">
                {taskFamily?.name || 'Family Task'}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400">
                {familyMembers.filter(m => m.familyId === task.familyId).length} members
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-blue-800 dark:text-blue-200">
              Personal
            </span>
          </div>
        );

      case 'tags':
        return task.tags && task.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={typeof tag === 'string' ? tag : tag.id || index}
                variant="outline"
                className="text-xs font-bold px-2 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-300 text-cyan-800"
              >
                {typeof tag === 'string' ? tag : tag.name}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs font-bold px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-gray-300 text-gray-800"
              >
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">No tags</span>
        );

      case 'actions':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 relative z-[60] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 relative z-[200]">
              <DropdownMenuItem onClick={() => onTaskEdit?.(task)}>
                <Edit className="h-4 w-4 mr-2 text-blue-500" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const newStatus = task.isCompleted ? TaskItemStatus.NotStarted : TaskItemStatus.Completed;
                  updateTaskProperty(task.id, 'status', newStatus);
                }}
              >
                {task.isCompleted ? (
                  <>
                    <Circle className="h-4 w-4 mr-2 text-yellow-500" />
                    Mark Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Mark Complete
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onTaskDelete?.(task.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );

      default:
        return null;
    }
  };

  const renderToolbar = () => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b bg-gray-50/50 dark:bg-gray-900/50">
      {/* Left Section - Search and Filters */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {enableAdvancedFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`h-9 ${showFilters ? 'bg-purple-50 border-purple-300' : ''}`}
          >
            <Filter className="h-4 w-4 mr-1" />
            {!isMobile && 'Filters'}
            {filters.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                {filters.length}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Batch Operations */}
        {enableBatchOperations && selectedTasks.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-800">
              {selectedTasks.size} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-800">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBatchOperation('complete')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchOperation('delete')}>
                  <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* View Controls */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Settings className="h-4 w-4 mr-1" />
              {!isMobile && 'View'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>View Options</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Density
            </DropdownMenuLabel>
            {(['tight', 'normal', 'loose'] as TableDensity[]).map(d => (
              <DropdownMenuCheckboxItem
                key={d}
                checked={density === d}
                onCheckedChange={() => setDensity(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-gray-500">
              Columns
            </DropdownMenuLabel>
            {DEFAULT_COLUMNS.map(column => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={visibleColumns.includes(column.key)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setVisibleColumns([...visibleColumns, column.key]);
                  } else {
                    setVisibleColumns(visibleColumns.filter(k => k !== column.key));
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  {column.icon}
                  {column.label}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export/Import */}
        {enableExportImport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="h-4 w-4 mr-1" />
                {!isMobile && 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onExport?.('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('json')}>
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Show</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(parseInt(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map(size => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>of {processedTasks.length} tasks</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium px-3">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`w-full overflow-hidden ${className}`}>
        {/* Toolbar */}
        {renderToolbar()}

        {/* Advanced Filters Panel */}
        {showFilters && enableAdvancedFilters && (
          <div className="p-4 bg-purple-50/50 border-b">
            <div className="text-sm font-medium text-gray-700 mb-2">Active Filters</div>
            {filters.length === 0 ? (
              <div className="text-sm text-gray-500">No filters applied</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilters(filters.filter((_, i) => i !== index));
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

        {/* Table with Drag and Drop */}
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <Table>
              {renderTableHeader()}
              <TableBody>
                {paginatedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={activeColumns.length + (enableBatchOperations ? 1 : 0) + (enableDragAndDrop ? 1 : 0) + 1}
                      className="text-center py-12"
                    >
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <ListChecks className="h-12 w-12 text-gray-300" />
                        <div className="text-lg font-medium">No tasks found</div>
                        <div className="text-sm">
                          {searchQuery || filters.length > 0
                            ? 'Try adjusting your search or filters'
                            : 'Create your first task to get started'
                          }
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext
                    items={paginatedTasks.map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {paginatedTasks.map(task => (
                      <SortableTableRow
                        key={task.id}
                        task={task}
                        isSelected={selectedTasks.has(task.id)}
                        viewMode={viewMode}
                        density={density}
                        activeColumns={activeColumns}
                        enableBatchOperations={enableBatchOperations}
                        enableKanbanSync={enableKanbanSync}
                        enableDragAndDrop={enableDragAndDrop}
                        onTaskSelect={onTaskSelect}
                        onTaskEdit={onTaskEdit}
                        onTaskDelete={onTaskDelete}
                        onTaskStatusChange={onTaskStatusChange}
                        onSelectTask={handleSelectTask}
                        renderCellContent={renderCellContent}
                      />
                    ))}
                  </SortableContext>
                )}
              </TableBody>
            </Table>

            {/* Enhanced Enterprise Drag Overlay */}
            <DragOverlay>
              {draggedTask ? (
                <div className="bg-gradient-to-r from-white via-purple-50 to-blue-50 dark:from-gray-800 dark:via-purple-900/50 dark:to-blue-900/50 shadow-2xl rounded-xl border-2 border-purple-400 dark:border-purple-500 p-4 opacity-95 transform rotate-2 scale-105">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                      <GripVertical className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {draggedTask.title}
                        <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 text-amber-600" />
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            {draggedTask.pointsValue || 10} XP
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Reordering task...
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </Card>
    </TooltipProvider>
  );
}
