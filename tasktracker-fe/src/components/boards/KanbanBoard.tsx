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
  closestCorners,
  pointerWithin,
  rectIntersection,
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
  horizontalListSortingStrategy,
  arrayMove,
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
  X,
  ArrowLeft,
  Users,
  User,
  GripVertical,
  CheckSquare,
  Square,
  Move,
  Trash2,
  RotateCcw
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
import { taskService } from '@/lib/services/taskService';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { authService } from '@/lib/services/authService';

// Modals
import { CreateTaskModal } from './CreateTaskModal';
import { EditBoardModal } from './EditBoardModal';
import { QuestSelectionModal } from './QuestSelectionModal';
import { BoardColumn as EnhancedBoardColumn } from './BoardColumn';

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
          // Base styling - robust and bold like dashboard cards
          'cursor-grab active:cursor-grabbing transition-all duration-300 ease-out',
          'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl',
          'border-0 shadow-lg',
          
          // Bold gradient backgrounds like dashboard statistics cards
          'bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900',
          'hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800',
          
          // Priority-based gradient accents
          priority === 'Low' && 'border-l-4 border-l-emerald-500 hover:shadow-emerald-500/20',
          priority === 'Medium' && 'border-l-4 border-l-yellow-500 hover:shadow-yellow-500/20',
          priority === 'High' && 'border-l-4 border-l-orange-500 hover:shadow-orange-500/20',
          priority === 'Urgent' && 'border-l-4 border-l-red-500 hover:shadow-red-500/20',
          
          // Priority glow effect
          showPriorityGlow && priorityConfig[priority as keyof typeof priorityConfig]?.glow,
          
          // Drag state styling
          isActive && [
            'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
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
            
            {/* Priority indicator - bold gradient like dashboard badges */}
            <div className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-md',
              'border-0 text-white transition-all duration-200 hover:scale-105',
              priority === 'Low' && 'bg-gradient-to-r from-emerald-500 to-emerald-600',
              priority === 'Medium' && 'bg-gradient-to-r from-yellow-500 to-yellow-600',
              priority === 'High' && 'bg-gradient-to-r from-orange-500 to-orange-600',
              priority === 'Urgent' && 'bg-gradient-to-r from-red-500 to-red-600'
            )}>
              <PriorityIcon className="w-3 h-3" />
              <span className="hidden sm:inline">{priority}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            {/* Status indicator - enhanced with gradient */}
            {showStatusIndicator && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-3 h-3 rounded-full shadow-sm',
                  'bg-gradient-to-r from-slate-400 to-slate-500'
                )} />
                <span className="text-xs text-slate-600 dark:text-slate-400 capitalize font-medium">
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

          {/* Task metadata - enhanced with gradients */}
          <div className="flex items-center gap-2 mt-3">
            {task.dueDate && (
              <Badge className="text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm">
                Due {new Date(task.dueDate).toLocaleDateString()}
              </Badge>
            )}
            {task.assignedToUserId && (
              <Badge className="text-xs font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm">
                Assigned
              </Badge>
            )}
            {task.pointsValue && (
              <Badge className="text-xs font-medium bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-sm">
                {task.pointsValue} pts
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
  onTaskDelete?: (task: TaskItemResponseDTO) => void;
}

// Sortable Column Component for drag and drop
interface SortableColumnProps extends EnhancedBoardColumnProps {
  id: string;
  boardId: number;
  onColumnUpdate?: (columnId: number, updates: { name?: string; color?: string }) => Promise<boolean>;
  onColumnDelete?: (columnId: number) => Promise<boolean>;
  selectedTasks?: Set<number>;
  isSelectionMode?: boolean;
  onTaskSelect?: (taskId: number, selected: boolean) => void;
}

const SortableColumn: React.FC<SortableColumnProps> = ({ id, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "relative transition-all duration-200",
        isDragging && "scale-105 shadow-2xl ring-2 ring-emerald-400 ring-opacity-50"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          "absolute -top-2 left-1/2 transform -translate-x-1/2 z-20 cursor-grab active:cursor-grabbing p-1.5 rounded-full shadow-lg transition-all duration-200",
          isDragging 
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 scale-110 shadow-xl" 
            : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-xl hover:scale-110"
        )}
        title="Drag to reorder column"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </div>
      
      {/* Column Content */}
      <div className={cn(isDragging && "pointer-events-none")}>
        <EnhancedBoardColumn {...props} />
      </div>
      
      {/* Dragging Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};

const BoardColumn: React.FC<EnhancedBoardColumnProps> = ({
  column,
  tasks,
  onCreateTask,
  enableDropPreview = true,
  templateName = 'Basic Kanban',
  onTaskDelete
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
                  onDelete={onTaskDelete}
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
    dropPreview: false,
    animationState: 'idle'
  });

  // Family member tracking
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [activeColumn, setActiveColumn] = useState<BoardColumnDTO | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Modal states
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showQuestSelection, setShowQuestSelection] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<BoardColumnDTO | null>(null);
  const [activeTask, setActiveTask] = useState<TaskItemResponseDTO | null>(null);

  // Batch selection state
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for better responsiveness
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection for better drop zone coverage
  const customCollisionDetection = useCallback((args: Parameters<typeof closestCenter>[0]) => {
    // First try pointer within (for better column coverage)
    const pointerIntersections = pointerWithin(args);
    if (pointerIntersections.length > 0) {
      return pointerIntersections;
    }

    // Then try rect intersection (for overlapping elements)
    const rectIntersections = rectIntersection(args);
    if (rectIntersections.length > 0) {
      return rectIntersections;
    }

    // Finally fall back to closest center
    return closestCenter(args);
  }, []);

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
      
      // Check if it's a 404 error (board not found)
      if (err instanceof Error && err.message.includes('not found')) {
        toast.error('Board not found', {
          description: 'This board may have been deleted or you may not have access to it.',
        });
        // Redirect to boards list after a short delay
        setTimeout(() => {
          router.push('/boards');
        }, 2000);
        setError('Board not found - redirecting to boards list...');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load board');
      }
    } finally {
      setLoading(false);
    }
  }, [boardId, router]);

  useEffect(() => {
    loadBoardData();
    loadFamilyData();
  }, [loadBoardData]);

  // Load family data for member tracking
  const loadFamilyData = useCallback(async () => {
    try {
      // Load current user
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      // Load family data
      const family = await familyInvitationService.getUserFamily();
      if (family) {
        const members = await familyInvitationService.getFamilyMembers(family.id);
        // Filter out any null/undefined members and ensure they have required properties
        const validMembers = (members || []).filter(member => 
          member && (member.user?.displayName || member.user?.email)
        );
        setFamilyMembers(validMembers);
      }
    } catch (error) {
      console.log('No family data available:', error);
      // Reset to safe defaults
      setCurrentUser(null);
      setFamilyMembers([]);
    }
  }, []);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id;
    setIsDragActive(true);
    
    // Check if dragging a column
    if (String(activeId).startsWith('column-')) {
      const columnId = Number(String(activeId).replace('column-', ''));
      const column = boardData?.board.columns.find(col => col.id === columnId);
      
      if (column) {
        setActiveColumn(column);
        toast.info(`🔄 Moving "${column.name}" column...`, {
          description: familyMembers.length > 0 ? `${currentUser?.displayName || 'You'} is reordering columns` : undefined,
        });
      }
      return;
    }

    // Handle task dragging
    const taskId = Number(activeId);
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

      // Show family member tracking
      if (familyMembers.length > 0) {
        toast.info(`🎯 Moving "${task.title}"...`, {
          description: `${currentUser?.displayName || 'You'} is moving this quest`,
        });
      }

      // Trigger drag start effects
      dragDropService.onDragStart(task);
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over || !boardData) return;

    const overId = String(over.id);
    
    // Check if dragging over a task (for intra-column sorting)
    const overTask = boardData.tasks.find(t => t.id.toString() === overId);
    if (overTask) {
      const targetColumn = boardData.board.columns.find(col => 
        col.status.toString() === overTask.status
      );
      
      if (targetColumn && dragState.draggedTask) {
        const validation = dragDropService.validateDrop(dragState.draggedTask, targetColumn);
        
        setDragState(prev => ({
          ...prev,
          draggedOver: targetColumn,
          canDrop: validation.isValid
        }));
      }
      return;
    }
    
    // Check if dragging over a column
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
    
    console.log('🎯 Drag End Event:', { 
      activeId: active.id, 
      overId: over?.id,
      activeData: active.data,
      overData: over?.data 
    });
    
    // Reset drag state
    setActiveTask(null);
    setActiveColumn(null);
    setIsDragActive(false);
    
    if (!over || !boardData) {
      console.log('❌ No over target or board data');
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

    const activeId = String(active.id);
    const overId = String(over.id);
    
    console.log('🎯 Drag IDs:', { activeId, overId });

    // Handle column reordering
    if (activeId.startsWith('column-') && overId.startsWith('column-')) {
      const activeColumnId = Number(activeId.replace('column-', ''));
      const overColumnId = Number(overId.replace('column-', ''));
      
      if (activeColumnId === overColumnId) return;

      const activeColumn = boardData.board.columns.find(col => col.id === activeColumnId);
      const overColumn = boardData.board.columns.find(col => col.id === overColumnId);
      
      if (!activeColumn || !overColumn) return;

      try {
        // Optimistically update column order
        const newColumns = [...boardData.board.columns];
        const activeIndex = newColumns.findIndex(col => col.id === activeColumnId);
        const overIndex = newColumns.findIndex(col => col.id === overColumnId);
        
        // Remove active column and insert at new position
        const [movedColumn] = newColumns.splice(activeIndex, 1);
        newColumns.splice(overIndex, 0, movedColumn);
        
        // Update order values
        const updatedColumns = newColumns.map((col, index) => ({
          ...col,
          order: index + 1
        }));

        setBoardData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            board: {
              ...prev.board,
              columns: updatedColumns
            }
          };
        });

        // Call backend to update column order
        await BoardService.reorderColumns(boardId, updatedColumns.map(col => ({
          columnId: col.id,
          newOrder: col.order
        })));

        toast.success('📋 Column reordered successfully!', {
          description: `"${activeColumn.name}" moved to new position`,
        });

        // Show family member tracking
        if (familyMembers.length > 0) {
          toast.info(`👥 ${currentUser?.displayName || 'Someone'} reordered columns`);
        }

      } catch (error) {
        console.error('Error reordering columns:', error);
        // Revert on error
        await loadBoardData();
        toast.error('Failed to reorder columns');
      }
      return;
    }

    // Handle task dragging (existing logic with family tracking)
    if (!dragState.draggedTask || !dragState.draggedFrom) {
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

    const taskId = Number(activeId);
    
    // Find target column - check if dropping over column or task
    let targetColumn: BoardColumnDTO | undefined;
    
    // First check if dropping over a column directly
    targetColumn = boardData.board.columns.find(col => 
      overId === `column-${col.id}` || overId === String(col.id)
    );
    
    // If not dropping over column, check if dropping over a task
    if (!targetColumn) {
      const overTask = boardData.tasks.find(task => task.id.toString() === overId);
      if (overTask) {
        targetColumn = boardData.board.columns.find(col => 
          col.status.toString() === overTask.status
        );
        console.log('🎯 Found target column via task:', { 
          overTaskId: overId, 
          overTaskStatus: overTask.status,
          targetColumnId: targetColumn?.id 
        });
      }
    } else {
      console.log('🏢 Found target column directly:', { targetColumnId: targetColumn.id });
    }

    if (!targetColumn) {
      console.log('❌ No target column found for overId:', overId);
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

    // Handle intra-column sorting (reordering within same column)
    if (dragState.draggedTask.status === targetColumn.status.toString()) {
      console.log('🔄 Intra-column sorting detected');
      const columnTasks = tasksByColumn[targetColumn.status.toString()] || [];
      const activeIndex = columnTasks.findIndex(task => task.id === taskId);
      
      let overIndex = columnTasks.length; // Default to end
      
      console.log('📍 Initial indices:', { activeIndex, defaultOverIndex: overIndex });
      
      // Check if we're dropping over another task
      if (!overId.toString().startsWith('column-')) {
        const overTaskId = Number(overId);
        const foundIndex = columnTasks.findIndex(task => task.id === overTaskId);
        
        console.log('🎯 Dropping over task:', { overTaskId, foundIndex });
        
        if (foundIndex !== -1) {
          // Determine if we should insert before or after the target task
          // For now, we'll insert at the target position (replace)
          overIndex = foundIndex;
        }
      } else {
        console.log('🏢 Dropping over column');
      }
      
      console.log('📊 Final indices:', { activeIndex, overIndex, willReorder: activeIndex !== -1 && activeIndex !== overIndex && overIndex >= 0 });
      
      // Only reorder if position actually changed and indices are valid
      if (activeIndex !== -1 && activeIndex !== overIndex && overIndex >= 0) {
        try {
          console.log(`🔄 Reordering task: ${activeIndex} → ${overIndex}`);
          
          // Use DnD-Kit's built-in arrayMove for proper reordering
          const reorderedTasks = arrayMove(columnTasks, activeIndex, overIndex);
          
          console.log('🔄 Reordered tasks:', reorderedTasks.map(t => `${t.id}:${t.title}`));
          console.log('✅ Task positions after reorder:', reorderedTasks.map((t, idx) => `Position ${idx + 1}: ${t.title}`));
          
          // Update the board state optimistically  
          setBoardData(prev => {
            if (!prev) return prev;
            
            console.log('🔄 Updating board state...');
            console.log('📋 Previous tasks in column:', prev.tasks.filter(t => t.status === targetColumn.status.toString()).map(t => `${t.id}:${t.title} (pos: ${t.boardPosition})`));
            
            // Create a mapping of all tasks with updated board positions for this column
            const updatedTasks = prev.tasks.map(task => {
              if (task.status !== targetColumn.status.toString()) return task;
              
              const newIndex = reorderedTasks.findIndex(t => t.id === task.id);
              const updatedTask = { ...task, boardPosition: newIndex + 1 }; // 1-based ordering
              
              console.log(`📝 Task ${task.id} (${task.title}): boardPosition ${task.boardPosition} → ${updatedTask.boardPosition}`);
              return updatedTask;
            });
            
            console.log('📋 Updated tasks in column:', updatedTasks.filter(t => t.status === targetColumn.status.toString()).map(t => `${t.id}:${t.title} (pos: ${t.boardPosition})`));
            
            const newTasksByColumn = groupTasksByColumn(updatedTasks, prev.board.columns);
            console.log('📋 New tasksByColumn for this column:', newTasksByColumn[targetColumn.status.toString()]?.map(t => `${t.id}:${t.title}`));
            
            return {
              ...prev,
              tasks: updatedTasks,
              tasksByColumn: newTasksByColumn
            };
          });
          
          toast.success('✨ Quest reordered!', {
            description: `"${dragState.draggedTask.title}" moved to position ${overIndex + 1}`,
          });
          
        } catch (error) {
          console.error('Error reordering tasks:', error);
          toast.error('Failed to reorder quest');
          // Reload to ensure consistency
          await loadBoardData();
        }
      } else {
        console.log('🚫 No reorder needed:', { activeIndex, overIndex, samePosition: activeIndex === overIndex });
      }
      
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
        // Show success notification with family tracking
        dragDropService.showMoveNotification(
          dragState.draggedTask,
          dragState.draggedFrom,
          targetColumn
        );
        
        // Show family member tracking
        if (familyMembers.length > 0) {
          toast.info(`👥 ${currentUser?.displayName || 'Someone'} moved "${dragState.draggedTask.title}"`);
        }
        
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
          dropPreview: false,
          animationState: 'idle'
        });
      }, 500);
    }
  };

  // Group tasks by column for display
  const groupTasksByColumn = (tasks: TaskItemResponseDTO[], columns: BoardColumnDTO[]): Record<string, TaskItemResponseDTO[]> => {
    const grouped: Record<string, TaskItemResponseDTO[]> = {};
    
    columns.forEach(column => {
      const columnTasks = tasks.filter(task => task.status === column.status.toString());
      
      console.log(`📊 Before sorting column ${column.status}:`, columnTasks.map(t => `${t.id}:${t.title} (pos: ${t.boardPosition})`));
      
      // Sort tasks by boardPosition (or fallback to id for stability)
      columnTasks.sort((a, b) => {
        const posA = a.boardPosition || 999999;
        const posB = b.boardPosition || 999999;
        return posA - posB || a.id - b.id; // Fallback to ID for stability
      });
      
      console.log(`📊 After sorting column ${column.status}:`, columnTasks.map(t => `${t.id}:${t.title} (pos: ${t.boardPosition})`));
      
      grouped[column.status.toString()] = columnTasks;
    });
    
    return grouped;
  };

  // Handle creating a new task
  const handleCreateTask = async (columnStatus?: TaskItemStatus) => {
    if (columnStatus && boardData?.board?.columns) {
      setSelectedColumn(boardData.board.columns.find(col => col.status === columnStatus) || null);
    } else if (boardData?.board?.columns) {
      // Default to the first column (NotStarted) if no specific column is provided
      const firstColumn = boardData.board.columns.sort((a, b) => a.order - b.order)[0];
      setSelectedColumn(firstColumn || null);
    }
    setShowCreateTask(true);
  };

  // Handle quest selection (create new or add existing)
  const handleQuestSelection = async (columnStatus?: TaskItemStatus) => {
    if (columnStatus && boardData?.board?.columns) {
      setSelectedColumn(boardData.board.columns.find(col => col.status === columnStatus) || null);
    } else if (boardData?.board?.columns) {
      // Default to the first column (NotStarted) if no specific column is provided
      const firstColumn = boardData.board.columns.sort((a, b) => a.order - b.order)[0];
      setSelectedColumn(firstColumn || null);
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

  // Handle task deletion
  const handleTaskDelete = async (task: TaskItemResponseDTO) => {
    try {
      // Show confirmation toast
      const confirmed = window.confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`);
      if (!confirmed) return;

      // Delete the task
      await taskService.deleteTask(task.id);
      
      // Update local state by removing the task
      setBoardData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== task.id),
          taskCount: prev.taskCount - 1
        };
      });

      toast.success('🗑️ Quest deleted successfully!', {
        description: `"${task.title}" has been removed from your board`,
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete quest', {
        description: 'Please try again or contact support if the problem persists.',
      });
    }
  };

  // Handle column update (placeholder - will use existing board update mechanisms)
  const handleColumnUpdate = async (columnId: number, updates: { name?: string; color?: string }) => {
    try {
      // For now, just reload the board data
      // In a full implementation, this would call a specific column update API
      await loadBoardData();
      return true;
    } catch (error) {
      console.error('Failed to update column:', error);
      throw error;
    }
  };

  // Handle column delete (placeholder - will use existing board update mechanisms)
  const handleColumnDelete = async (columnId: number) => {
    try {
      // For now, just reload the board data
      // In a full implementation, this would call a specific column delete API
      await loadBoardData();
      return true;
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  };

  // Batch selection handlers
  const handleTaskSelect = useCallback((taskId: number, selected: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(taskId);
      } else {
        newSet.delete(taskId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!boardData) return;
    setSelectedTasks(new Set(boardData.tasks.map(task => task.id)));
  }, [boardData]);

  const handleDeselectAll = useCallback(() => {
    setSelectedTasks(new Set());
  }, []);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    if (isSelectionMode) {
      setSelectedTasks(new Set());
    }
  }, [isSelectionMode]);

  const handleBatchDelete = useCallback(async () => {
    if (selectedTasks.size === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedTasks.size} task(s)? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      for (const taskId of selectedTasks) {
        await taskService.deleteTask(taskId);
      }
      
      toast.success(`🗑️ ${selectedTasks.size} task(s) deleted successfully!`);
      setSelectedTasks(new Set());
      setIsSelectionMode(false);
      await loadBoardData();
    } catch (error) {
      console.error('Batch delete failed:', error);
      toast.error('Failed to delete some tasks');
    }
  }, [selectedTasks]);

  const handleBatchMove = useCallback(async (targetStatus: TaskItemStatus) => {
    if (selectedTasks.size === 0) return;

    try {
      for (const taskId of selectedTasks) {
        await taskService.updateTask(taskId, { status: targetStatus });
      }
      
      toast.success(`📋 ${selectedTasks.size} task(s) moved successfully!`);
      setSelectedTasks(new Set());
      setIsSelectionMode(false);
      await loadBoardData();
    } catch (error) {
      console.error('Batch move failed:', error);
      toast.error('Failed to move some tasks');
    }
  }, [selectedTasks]);

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
    <div className={cn("h-screen flex flex-col", className)}>
      {/* Board Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/boards')}
            className="border-emerald-200 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Boards</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
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
          <Badge className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
            <Target className="h-3 w-3" />
            <span>{boardData.taskCount} Quests</span>
          </Badge>
          
          {/* Drag Instructions */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg shadow-sm">
            <GripVertical className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Drag columns to reorder • Drag tasks to move
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Family Members Indicator */}
          {familyMembers.length > 0 && (
            <div className={cn(
              "flex items-center space-x-2 px-3 py-1.5 border rounded-lg shadow-sm transition-all duration-300",
              isDragActive 
                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 shadow-md" 
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
            )}>
              <div className="relative">
                <Users className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isDragActive ? "text-emerald-600" : "text-blue-600"
                )} />
                {isDragActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium transition-colors duration-300",
                isDragActive ? "text-emerald-700" : "text-blue-700"
              )}>
                {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}
                {isDragActive && " • Active"}
              </span>
              <div className="flex -space-x-1">
                {familyMembers.slice(0, 3).map((member, index) => member && (
                  <div
                    key={member.id || index}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm transition-all duration-300",
                      isDragActive 
                        ? "bg-gradient-to-r from-emerald-400 to-teal-400 ring-1 ring-emerald-300" 
                        : "bg-gradient-to-r from-emerald-400 to-teal-400"
                    )}
                    title={member.user?.displayName || member.user?.email || 'Unknown User'}
                  >
                                          {(member?.user?.displayName || member?.user?.email || '?').charAt(0).toUpperCase()}
                  </div>
                ))}
                {familyMembers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    +{familyMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Batch Selection Controls */}
          {isSelectionMode ? (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                All ({boardData.tasks.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="text-xs"
              >
                <Square className="h-4 w-4 mr-1" />
                None
              </Button>
              {selectedTasks.size > 0 && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <Move className="h-4 w-4 mr-1" />
                        Move ({selectedTasks.size})
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {boardData.board.columns.map((column) => (
                        <DropdownMenuItem
                          key={column.id}
                          onClick={() => handleBatchMove(column.status)}
                        >
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: column.color || '#6B7280' }}
                          />
                          {column.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchDelete}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedTasks.size})
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSelectionMode}
                className="text-xs"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Selection Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSelectionMode}
                className="border-emerald-200 hover:bg-emerald-50"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Select</span>
                <span className="sm:hidden">Select</span>
              </Button>

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
            </div>
          )}
          
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
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-hidden">
        <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Sortable Columns Container */}
        <SortableContext
          items={boardData.board.columns
            .sort((a, b) => a.order - b.order)
            .map(col => `column-${col.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="h-full p-8 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 min-h-full">
            {boardData.board.columns
              .sort((a, b) => a.order - b.order)
              .map((column) => {
                const columnTasks = tasksByColumn[column.status.toString()] || [];
                
                return (
                  <SortableColumn
                    key={column.id}
                    id={`column-${column.id}`}
                    column={column}
                    tasks={columnTasks}
                    onCreateTask={() => handleQuestSelection(column.status)}
                    enableDropPreview={true}
                    templateName={boardData.board.name}
                    onTaskDelete={handleTaskDelete}
                    boardId={boardId}
                    onColumnUpdate={handleColumnUpdate}
                    onColumnDelete={handleColumnDelete}
                    selectedTasks={selectedTasks}
                    isSelectionMode={isSelectionMode}
                    onTaskSelect={handleTaskSelect}
                  />
                );
              })}
            </div>
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDragging={true}
              gamificationStyle={TASK_STYLE_PRESETS[theme]}
              enableAnimations={enableAnimations}
            />
          ) : activeColumn ? (
            <div className="opacity-80 rotate-3 scale-105 shadow-2xl">
              <EnhancedBoardColumn
                column={activeColumn}
                tasks={[]}
                onCreateTask={() => {}}
                boardId={boardId}
                className="pointer-events-none"
              />
            </div>
          ) : null}
        </DragOverlay>
        </DndContext>
      </div>

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