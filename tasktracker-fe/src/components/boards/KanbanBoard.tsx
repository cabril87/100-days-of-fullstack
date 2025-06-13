'use client';

/*
 * Enterprise Kanban Board Component
 * Copyright (c) 2025 Carlos Abril Jr
 * 
 * Features:
 * - Robust drag-and-drop across all board templates
 * - Gamification styling with bold gradients
 * - Enterprise-quality validation and error handling
 * - Sound effects and haptic feedback
 * - Mobile-responsive design
 * - Real-time optimistic updates
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent as DndDragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Plus,
  Trophy,
  Target,
  MoreHorizontal,
  Settings,
  AlertCircle,
  Sparkles,
  Zap,
  Star,
  Flame,
  Rocket,
  Zap as Lightning,
  ChevronDown,
  Clock,
  Pause,
  X
} from 'lucide-react';

// Types and Services
import {
  KanbanBoardProps, 
  BoardDetailDTO, 
  BoardColumnDTO, 
  DragState,
  TaskCardProps,
  BoardColumnProps,
  TASK_STYLE_PRESETS
} from '@/lib/types/board';
import { TaskItemResponseDTO, TaskItemStatus } from '@/lib/types/task';
import { BoardService } from '@/lib/services/boardService';
import { dragDropService } from '@/lib/services/dragDropService';

// Modals
import { CreateTaskModal } from './CreateTaskModal';
import { EditBoardModal } from './EditBoardModal';
import { QuestSelectionModal } from './QuestSelectionModal';

// Template-specific gradient configurations
const TEMPLATE_GRADIENTS = {
  'Basic Kanban': {
    primary: 'from-blue-500 to-blue-600',
    secondary: 'from-blue-100 to-blue-200',
    accent: 'from-blue-50 to-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  'Simple To-Do': {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'from-green-100 to-emerald-200',
    accent: 'from-green-50 to-emerald-100',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  'Family Chores': {
    primary: 'from-purple-500 to-purple-600',
    secondary: 'from-purple-100 to-purple-200',
    accent: 'from-purple-50 to-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  'Weekly Cleaning': {
    primary: 'from-teal-500 to-cyan-600',
    secondary: 'from-teal-100 to-cyan-200',
    accent: 'from-teal-50 to-cyan-100',
    text: 'text-teal-700',
    border: 'border-teal-200'
  },
  'Meal Planning': {
    primary: 'from-orange-500 to-amber-600',
    secondary: 'from-orange-100 to-amber-200',
    accent: 'from-orange-50 to-amber-100',
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  'Home Maintenance': {
    primary: 'from-slate-500 to-gray-600',
    secondary: 'from-slate-100 to-gray-200',
    accent: 'from-slate-50 to-gray-100',
    text: 'text-slate-700',
    border: 'border-slate-200'
  },
  'School Projects': {
    primary: 'from-indigo-500 to-blue-600',
    secondary: 'from-indigo-100 to-blue-200',
    accent: 'from-indigo-50 to-blue-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200'
  },
  'Kids Activities': {
    primary: 'from-pink-500 to-rose-600',
    secondary: 'from-pink-100 to-rose-200',
    accent: 'from-pink-50 to-rose-100',
    text: 'text-pink-700',
    border: 'border-pink-200'
  },
  'Reading Goals': {
    primary: 'from-violet-500 to-purple-600',
    secondary: 'from-violet-100 to-purple-200',
    accent: 'from-violet-50 to-purple-100',
    text: 'text-violet-700',
    border: 'border-violet-200'
  },
  'Family Health': {
    primary: 'from-red-500 to-red-600',
    secondary: 'from-red-100 to-red-200',
    accent: 'from-red-50 to-red-100',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  'Fitness Goals': {
    primary: 'from-emerald-500 to-green-600',
    secondary: 'from-emerald-100 to-green-200',
    accent: 'from-emerald-50 to-green-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  'Birthday Planning': {
    primary: 'from-yellow-500 to-orange-600',
    secondary: 'from-yellow-100 to-orange-200',
    accent: 'from-yellow-50 to-orange-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  'Holiday Planning': {
    primary: 'from-red-500 to-green-600',
    secondary: 'from-red-100 to-green-200',
    accent: 'from-red-50 to-green-100',
    text: 'text-red-700',
    border: 'border-red-200'
  },
  'Vacation Planning': {
    primary: 'from-sky-500 to-blue-600',
    secondary: 'from-sky-100 to-blue-200',
    accent: 'from-sky-50 to-blue-100',
    text: 'text-sky-700',
    border: 'border-sky-200'
  },
  'Family Budget': {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'from-green-100 to-emerald-200',
    accent: 'from-green-50 to-emerald-100',
    text: 'text-green-700',
    border: 'border-green-200'
  },
  'Garden Planning': {
    primary: 'from-lime-500 to-green-600',
    secondary: 'from-lime-100 to-green-200',
    accent: 'from-lime-50 to-green-100',
    text: 'text-lime-700',
    border: 'border-lime-200'
  }
};

// Get template gradient or default
const getTemplateGradient = (templateName: string) => {
  return TEMPLATE_GRADIENTS[templateName as keyof typeof TEMPLATE_GRADIENTS] || TEMPLATE_GRADIENTS['Basic Kanban'];
};

/**
 * Enhanced Task Card with Gamification
 */
interface EnhancedTaskCardProps extends TaskCardProps {
  templateGradient?: typeof TEMPLATE_GRADIENTS[keyof typeof TEMPLATE_GRADIENTS];
}

const TaskCard: React.FC<EnhancedTaskCardProps> = ({
  task,
  isDragging = false,
  className,
  onEdit,
  onDelete,
  onView,
  gamificationStyle,
  enableAnimations = true,
  showPriorityGlow = true,
  showStatusIndicator = true
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const isActive = isDragging || isSortableDragging;
  const stylePreset = gamificationStyle || TASK_STYLE_PRESETS.gradient;

  // Priority configuration
  const priorityConfig = {
    Low: { icon: Star, color: 'text-emerald-500', glow: 'shadow-emerald-400/30' },
    Medium: { icon: Flame, color: 'text-yellow-500', glow: 'shadow-yellow-400/30' },
    High: { icon: Zap, color: 'text-orange-500', glow: 'shadow-orange-400/30' },
    Urgent: { icon: Lightning, color: 'text-red-500', glow: 'shadow-red-400/30' }
  };

  const priority = task.priority || 'Low';
  const PriorityIcon = priorityConfig[priority as keyof typeof priorityConfig]?.icon || Star;



  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative',
        className
      )}
    >
      <Card
        ref={cardRef}
        className={cn(
          // Base styling
          'cursor-grab active:cursor-grabbing transition-all duration-300 ease-out',
          'hover:scale-[1.02] hover:-translate-y-1',
          
          // Gamification gradients
          `bg-gradient-to-br ${stylePreset.baseGradient}`,
          `hover:bg-gradient-to-br hover:${stylePreset.hoverGradient}`,
          stylePreset.borderColor,
          stylePreset.shadowColor,
          
          // Priority glow effect
          showPriorityGlow && priorityConfig[priority as keyof typeof priorityConfig]?.glow,
          
          // Drag state styling
          isActive && [
            `bg-gradient-to-br ${stylePreset.dragGradient}`,
            'scale-105 rotate-2 shadow-2xl z-50',
            'ring-2 ring-blue-400/50 ring-offset-2'
          ],
          
          // Animation states
          enableAnimations && [
            'transform-gpu'
          ]
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight line-clamp-2 text-slate-900">
                {task.title}
              </h4>
              {task.description && (
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            {/* Priority indicator */}
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              'bg-white/80 backdrop-blur-sm border border-white/20',
              priorityConfig[priority as keyof typeof priorityConfig]?.color
            )}>
              <PriorityIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{priority}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {/* Status indicator */}
            {showStatusIndicator && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  stylePreset.statusIndicator
                )} />
                <span className="text-xs text-slate-500 capitalize">
                  {task.status.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            )}

            {/* Action menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(task)}>
                    View Details
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    Edit Task
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(task)}
                    className="text-destructive"
                  >
                    Delete Task
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Task metadata */}
          <div className="flex items-center gap-2 mt-2">
            {task.dueDate && (
              <Badge variant="outline" className="text-xs">
                Due {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}
            {task.assignedToUserId && (
              <Badge variant="secondary" className="text-xs">
                Assigned
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Drag overlay indicator */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg pointer-events-none" />
        )}
      </Card>
    </div>
  );
};

/**
 * Enhanced Board Column with Gamification Styling
 */
interface EnhancedBoardColumnProps extends BoardColumnProps {
  templateName?: string;
}

const BoardColumn: React.FC<EnhancedBoardColumnProps> = ({
  column,
  tasks,
  onCreateTask,
  enableDropPreview = true,
  templateName = 'Basic Kanban'
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  const templateGradient = getTemplateGradient(templateName);
  const taskIds = tasks.map(task => task.id);

  // Get column icon based on status and template
  const getColumnIcon = () => {
    const iconMap = {
      [TaskItemStatus.NotStarted]: Rocket,
      [TaskItemStatus.Pending]: Clock,
      [TaskItemStatus.InProgress]: Zap,
      [TaskItemStatus.OnHold]: Pause,
      [TaskItemStatus.Completed]: Trophy,
      [TaskItemStatus.Cancelled]: X,
    };
    return iconMap[column.status] || Target;
  };

  const ColumnIcon = getColumnIcon();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative h-full transition-all duration-300",
        isOver && "scale-[1.02]"
      )}
    >
      {/* Enhanced Card with Gamification Styling */}
      <Card className={cn(
        "h-full overflow-hidden border-0 shadow-xl transition-all duration-300",
        `bg-gradient-to-br ${templateGradient.accent} backdrop-blur-sm`,
        "hover:shadow-2xl hover:scale-[1.01]",
        isOver && "ring-2 ring-emerald-400 shadow-2xl scale-[1.02]"
      )}>
        {/* Gradient accent bar */}
        <div className={cn(
          "absolute top-0 left-0 w-full h-1.5 rounded-t-xl",
          `bg-gradient-to-r ${templateGradient.primary}`
        )} />
        
        {/* Column Header */}
        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Column Icon with Glow Effect */}
              <div className={cn(
                "p-3 rounded-xl shadow-lg transition-all duration-300",
                `bg-gradient-to-br ${templateGradient.primary} text-white`,
                "group-hover:shadow-xl group-hover:scale-110"
              )}>
                <ColumnIcon className="h-6 w-6" />
              </div>
              
              <div>
                <h3 className={cn(
                  "text-lg font-bold",
                  `bg-gradient-to-r ${templateGradient.primary} bg-clip-text text-transparent`
                )}>
                  {column.name}
                </h3>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium",
                    `bg-gradient-to-r ${templateGradient.secondary} ${templateGradient.text} ${templateGradient.border}`
                  )}
                >
                  {tasks.length} quest{tasks.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Add Quest Button */}
            <Button
              onClick={onCreateTask}
              size="sm"
              className={cn(
                "opacity-0 group-hover:opacity-100 transition-all duration-300",
                `bg-gradient-to-r ${templateGradient.primary} hover:shadow-lg hover:scale-105`,
                "text-white border-0"
              )}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Tasks Container */}
        <CardContent className="flex-1 pt-0">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3 min-h-[200px]">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  gamificationStyle={TASK_STYLE_PRESETS.gradient}
                  enableAnimations={true}
                  showPriorityGlow={true}
                  showStatusIndicator={false}
                />
              ))}
              
              {/* Enhanced Empty State */}
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className={cn(
                    "p-4 rounded-full mb-4 shadow-lg",
                    `bg-gradient-to-br ${templateGradient.secondary} backdrop-blur-sm`
                  )}>
                    <ColumnIcon className={cn("w-8 h-8", templateGradient.text)} />
                  </div>
                  <h4 className={cn(
                    "text-lg font-bold mb-2",
                    `bg-gradient-to-r ${templateGradient.primary} bg-clip-text text-transparent`
                  )}>
                    No quests yet
                  </h4>
                  <p className="text-sm text-slate-600 mb-4 max-w-[200px]">
                    Add your first quest to get started on this epic journey!
                  </p>
                  <Button
                    onClick={onCreateTask}
                    size="sm"
                    className={cn(
                      `bg-gradient-to-r ${templateGradient.primary} hover:shadow-lg hover:scale-105`,
                      "text-white border-0 transition-all duration-300"
                    )}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Quest
                  </Button>
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>

        {/* Enhanced Drop Preview */}
        {enableDropPreview && isOver && (
          <div className={cn(
            "absolute inset-0 rounded-lg pointer-events-none border-2 border-dashed",
            "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
            "border-emerald-400/50 animate-pulse"
          )} />
        )}
      </Card>
    </div>
  );
};

/**
 * Main Kanban Board Component
 */
export const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  boardId, 
  className,
  enableAnimations = true,
  enableGamification = true,
  enableSoundEffects = false,
  theme = 'gradient'
}) => {
  const router = useRouter();
  
  // State management
  const [boardData, setBoardData] = useState<BoardDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTask: null,
    draggedFrom: null,
    draggedOver: null,
    canDrop: false,
    dropPreview: true,
    animationState: 'idle'
  });

  // Modal states
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showQuestSelection, setShowQuestSelection] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<BoardColumnDTO | null>(null);
  const [activeTask, setActiveTask] = useState<TaskItemResponseDTO | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Configure drag-drop service
  useEffect(() => {
    dragDropService.configure({
      enableSounds: enableSoundEffects,
      enableAnimations: enableAnimations,
      enableHaptics: enableGamification,
    });
  }, [enableSoundEffects, enableAnimations, enableGamification]);

  // Load board data
  const loadBoardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await BoardService.getBoardById(boardId);
      setBoardData(data);
    } catch (err) {
      console.error('Error loading board:', err);
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    const task = boardData?.tasks.find(t => t.id === taskId);
    const fromColumn = boardData?.board.columns.find(col => 
      col.status.toString() === task?.status
    );

    if (task && fromColumn) {
      setActiveTask(task);
      setDragState(prev => ({
        ...prev,
        isDragging: true,
        draggedTask: task,
        draggedFrom: fromColumn,
        animationState: 'dragging'
      }));

      // Trigger drag start effects
      dragDropService.onDragStart(task);
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over || !boardData) return;

    const overId = String(over.id);
    const targetColumn = boardData.board.columns.find(col => 
      overId === `column-${col.id}` || overId === String(col.id)
    );

    if (targetColumn && dragState.draggedTask) {
      const validation = dragDropService.validateDrop(dragState.draggedTask, targetColumn);
      
      setDragState(prev => ({
        ...prev,
        draggedOver: targetColumn,
        canDrop: validation.isValid
      }));

      // Trigger drag over effects
      dragDropService.onDragOver(targetColumn);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DndDragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over || !boardData || !dragState.draggedTask || !dragState.draggedFrom) {
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedTask: null,
        draggedFrom: null,
        draggedOver: null,
        animationState: 'idle'
      }));
      return;
    }

    const taskId = Number(active.id);
    const overId = String(over.id);
    
    // Find target column
    const targetColumn = boardData.board.columns.find(col => 
      overId === `column-${col.id}` || overId === String(col.id)
    );

    if (!targetColumn) {
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedTask: null,
        draggedFrom: null,
        draggedOver: null,
        animationState: 'error'
      }));
      return;
    }

    // Validate the drop
    const validation = dragDropService.validateDrop(dragState.draggedTask, targetColumn);
    
    if (!validation.isValid) {
      toast.error('Cannot move quest', {
        description: validation.reason,
      });
      
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedTask: null,
        draggedFrom: null,
        draggedOver: null,
        animationState: 'error'
      }));
      
      dragDropService.onDragEnd(false);
      return;
    }

    // Don't do anything if the task is already in the correct column
    if (dragState.draggedTask.status === targetColumn.status.toString()) {
      setDragState(prev => ({
        ...prev,
        isDragging: false,
        draggedTask: null,
        draggedFrom: null,
        draggedOver: null,
        animationState: 'idle'
      }));
      return;
    }

    try {
      setDragState(prev => ({ ...prev, animationState: 'dropping' }));

      // Optimistic update
      setBoardData(prev => {
        if (!prev) return prev;
        
        const updatedTasks = dragDropService.createOptimisticUpdate(
          prev.tasks,
          taskId,
          targetColumn.status
        );

        return {
          ...prev,
          tasks: updatedTasks,
          tasksByColumn: groupTasksByColumn(updatedTasks, prev.board.columns)
        };
      });

      // Execute the move
      const success = await dragDropService.executeMove(
        taskId,
        dragState.draggedFrom,
        targetColumn
      );

      if (success) {
        // Show success notification
        dragDropService.showMoveNotification(
          dragState.draggedTask,
          dragState.draggedFrom,
          targetColumn
        );
        
        setDragState(prev => ({ ...prev, animationState: 'success' }));

      // Reload to ensure consistency
      await loadBoardData();
      } else {
        throw new Error('Move operation failed');
      }

    } catch (error) {
      console.error('Error moving task:', error);
      
      // Revert optimistic update
      setBoardData(prev => {
        if (!prev) return prev;
        
        const revertedTasks = dragDropService.revertOptimisticUpdate(
          prev.tasks,
          taskId,
          dragState.draggedTask!.status
        );

        return {
          ...prev,
          tasks: revertedTasks,
          tasksByColumn: groupTasksByColumn(revertedTasks, prev.board.columns)
        };
      });

      toast.error('Failed to move quest');
      setDragState(prev => ({ ...prev, animationState: 'error' }));
      
      // Reload to ensure consistency
      await loadBoardData();
    } finally {
      // Reset drag state
      setTimeout(() => {
        setDragState({
          isDragging: false,
          draggedTask: null,
          draggedFrom: null,
          draggedOver: null,
          canDrop: false,
          dropPreview: true,
          animationState: 'idle'
        });
      }, 500);
    }
  };

  // Group tasks by column for display
  const groupTasksByColumn = (tasks: TaskItemResponseDTO[], columns: BoardColumnDTO[]): Record<string, TaskItemResponseDTO[]> => {
    const grouped: Record<string, TaskItemResponseDTO[]> = {};
    
    columns.forEach(column => {
      grouped[column.status.toString()] = tasks.filter(task => task.status === column.status.toString());
    });
    
    return grouped;
  };

  // Handle creating a new task
  const handleCreateTask = async (columnStatus?: TaskItemStatus) => {
    if (columnStatus && boardData?.board?.columns) {
      setSelectedColumn(boardData.board.columns.find(col => col.status === columnStatus) || null);
    }
    setShowCreateTask(true);
  };

  // Handle quest selection (create new or add existing)
  const handleQuestSelection = async (columnStatus?: TaskItemStatus) => {
    if (columnStatus && boardData?.board?.columns) {
      setSelectedColumn(boardData.board.columns.find(col => col.status === columnStatus) || null);
    }
    setShowQuestSelection(true);
  };

  // Handle task created
  const handleTaskCreated = async () => {
    setShowCreateTask(false);
    setShowQuestSelection(false);
    setSelectedColumn(null);
    await loadBoardData();
    toast.success('🎯 Quest added to board!');
  };

  // Handle board updated
  const handleBoardUpdated = async () => {
    setShowEditBoard(false);
    await loadBoardData();
    toast.success('📋 Board updated successfully!');
  };

  // Handle board deleted
  const handleBoardDeleted = () => {
    setShowEditBoard(false);
    router.push('/boards');
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-96">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !boardData || !boardData.board || !boardData.board.columns || boardData.board.columns.length === 0) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Failed to Load Board</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error || 'Unable to load board data'}
              </p>
            </div>
            <div className="flex space-x-2">
            <Button onClick={loadBoardData} variant="outline">
              Try Again
            </Button>
              <Button onClick={() => router.push('/boards')} variant="default">
                Back to Boards
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tasksByColumn = groupTasksByColumn(boardData.tasks, boardData.board.columns);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                <Trophy className="h-6 w-6" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {boardData.board.name}
              </span>
            </h1>
            {boardData.board.description && (
              <p className="text-muted-foreground mt-1">{boardData.board.description}</p>
            )}
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
            <Target className="h-3 w-3" />
            <span>{boardData.taskCount} Quests</span>
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Quest Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
          <Button
            size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Quest</span>
                <span className="sm:hidden">Add</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleCreateTask()}>
            <Plus className="h-4 w-4 mr-2" />
                Create New Quest
                <span className="ml-auto text-xs text-muted-foreground">Fresh start</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuestSelection()}>
                <Target className="h-4 w-4 mr-2" />
                Add Existing Quest
                <span className="ml-auto text-xs text-muted-foreground">From tasks</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Board Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditBoard(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Board Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/boards')}>
                <Target className="h-4 w-4 mr-2" />
                All Boards
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boardData.board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => {
              const columnTasks = tasksByColumn[column.status.toString()] || [];
              
              return (
              <BoardColumn
                key={column.id}
                column={column}
                  tasks={columnTasks}
                onCreateTask={() => handleCreateTask(column.status)}
                  enableDropPreview={true}
                  templateName={boardData.board.name}
              />
              );
            })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDragging={true}
              gamificationStyle={TASK_STYLE_PRESETS[theme]}
              enableAnimations={enableAnimations}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
        <CreateTaskModal
          open={showCreateTask}
          onClose={() => {
            setShowCreateTask(false);
            setSelectedColumn(null);
          }}
          onTaskCreated={handleTaskCreated}
          defaultStatus={selectedColumn?.status}
          boardId={boardId}
        suggestedColumn={selectedColumn || undefined}
      />

      <QuestSelectionModal
        open={showQuestSelection}
        onClose={() => {
          setShowQuestSelection(false);
            setSelectedColumn(null);
          }}
          onTaskCreated={handleTaskCreated}
          defaultStatus={selectedColumn?.status}
          boardId={boardId}
        />

        <EditBoardModal
          open={showEditBoard}
          onClose={() => setShowEditBoard(false)}
          onBoardUpdated={handleBoardUpdated}
        onBoardDeleted={handleBoardDeleted}
          board={boardData.board}
        />
    </div>
  );
}; 