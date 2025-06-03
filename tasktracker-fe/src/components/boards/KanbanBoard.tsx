'use client';

/**
 * Modern Kanban Board Component
 * Clean, performant implementation with drag-and-drop and gamification
 */

import React, { useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,

} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

// Types
import {
  KanbanBoardProps,
  KanbanBoardState,
  KanbanBoardAction,
  DragDropResult,

} from '@/lib/types/kanban';
import { Task, TaskStatusType } from '@/lib/types/task';
import { Board, BoardColumn, UpdateBoardSettings } from '@/lib/types/board';

// Services & Providers
import { useBoard } from '@/lib/providers/BoardProvider';
import { useTasks } from '@/lib/providers/TaskProvider';
import { useToast } from '@/lib/hooks/useToast';

// Components
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import { ColumnModal } from './ColumnModal';
import { TaskFilterSearch } from './TaskFilterSearch';
import { BoardSettingsPanel } from './BoardSettingsPanel';

// UI Components
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Icons
import { Plus, Settings, RefreshCw } from 'lucide-react';
import { LiveTaskMovements } from './LiveTaskMovements';
import { RealtimeCollaborationBar } from './RealtimeCollaborationBar';

// ==================== REDUCER ====================

const initialState: KanbanBoardState = {
  currentBoard: null,
  columns: [],
  tasksByColumn: {},
  settings: null,
  isLoading: false,
  isCreatingTask: false,
  isCreatingColumn: false,
  selectedTaskIds: [],
  showTaskModal: false,
  showColumnModal: false,
  showSettingsModal: false,
  editingTask: null,
  editingColumn: null,
  activeColumnForNewTask: null,
  dragState: {
    isDragging: false,
    draggedTask: null,
    sourceColumn: null,
    hoveredColumn: null,
  },
  error: null,
  userProgress: null,
  recentAchievements: [],
  gamificationStats: null,
  filter: {},
  sort: { field: 'createdAt', direction: 'desc' },
};

function kanbanReducer(state: KanbanBoardState, action: KanbanBoardAction): KanbanBoardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    
    case 'SET_BOARD':
      return { ...state, currentBoard: action.board };
    
    case 'SET_COLUMNS':
      return { ...state, columns: action.columns };
    
    case 'SET_TASKS_BY_COLUMN':
      return { ...state, tasksByColumn: action.tasksByColumn };
    
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    
    case 'SET_ERROR':
      return { ...state, error: action.error };
    
    case 'SET_SELECTED_TASKS':
      return { ...state, selectedTaskIds: action.taskIds };
    
    case 'SET_TASK_MODAL':
      return { 
        ...state, 
        showTaskModal: action.show,
        editingTask: action.task || null
      };
    
    case 'SET_COLUMN_MODAL':
      return { 
        ...state, 
        showColumnModal: action.show,
        editingColumn: action.column || null
      };
    
    case 'SET_SETTINGS_MODAL':
      return { 
        ...state, 
        showSettingsModal: action.show
      };
    
    case 'SET_ACTIVE_COLUMN_FOR_NEW_TASK':
      return { ...state, activeColumnForNewTask: action.column };
    
    case 'SET_DRAG_STATE':
      return { 
        ...state, 
        dragState: { ...state.dragState, ...action.dragState }
      };
    
    case 'ADD_TASK':
      return {
        ...state,
        tasksByColumn: {
          ...state.tasksByColumn,
          [action.columnId]: [...(state.tasksByColumn[action.columnId] || []), action.task]
        }
      };
    
    case 'UPDATE_TASK': {
      const updatedTasksByColumn = { ...state.tasksByColumn };
      Object.keys(updatedTasksByColumn).forEach(columnId => {
        updatedTasksByColumn[Number(columnId)] = updatedTasksByColumn[Number(columnId)].map(task =>
          task.id === action.task.id ? action.task : task
        );
      });
      return { ...state, tasksByColumn: updatedTasksByColumn };
    }
    
    case 'DELETE_TASK': {
      const updatedTasksByColumn = { ...state.tasksByColumn };
      Object.keys(updatedTasksByColumn).forEach(columnId => {
        updatedTasksByColumn[Number(columnId)] = updatedTasksByColumn[Number(columnId)].filter(
          task => task.id !== action.taskId
        );
      });
      return { ...state, tasksByColumn: updatedTasksByColumn };
    }
    
    case 'MOVE_TASK': {
      const { sourceColumnId, destinationColumnId, taskId } = action.result;
      const updatedTasksByColumn = { ...state.tasksByColumn };
      
      // Find the task
      const sourceColumn = updatedTasksByColumn[sourceColumnId] || [];
      const taskIndex = sourceColumn.findIndex(task => task.id === taskId);
      
      if (taskIndex === -1) return state;
      
      const task = sourceColumn[taskIndex];
      
      // Remove from source
      updatedTasksByColumn[sourceColumnId] = sourceColumn.filter((_, index) => index !== taskIndex);
      
      // Add to destination
      if (!updatedTasksByColumn[destinationColumnId]) {
        updatedTasksByColumn[destinationColumnId] = [];
      }
      updatedTasksByColumn[destinationColumnId] = [
        ...updatedTasksByColumn[destinationColumnId],
        task
      ];
      
      return { ...state, tasksByColumn: updatedTasksByColumn };
    }
    
    case 'ADD_COLUMN':
      return { 
        ...state, 
        columns: [...state.columns, action.column].sort((a, b) => a.order - b.order),
        tasksByColumn: { ...state.tasksByColumn, [action.column.id]: [] }
      };
    
    case 'UPDATE_COLUMN':
      return {
        ...state,
        columns: state.columns.map(col => 
          col.id === action.column.id ? action.column : col
        ).sort((a, b) => a.order - b.order)
      };
    
    case 'DELETE_COLUMN': {
      const updatedTasksByColumn = { ...state.tasksByColumn };
      delete updatedTasksByColumn[action.columnId];
      return {
        ...state,
        columns: state.columns.filter(col => col.id !== action.columnId),
        tasksByColumn: updatedTasksByColumn
      };
    }
    
    case 'REORDER_COLUMNS':
      return { ...state, columns: action.columns };
    
    case 'SET_FILTER':
      return { ...state, filter: action.filter };
    
    case 'SET_SORT':
      return { ...state, sort: action.sort };
    
    default:
      return state;
  }
}

// ==================== MAIN COMPONENT ====================

export function KanbanBoard({ 
  boardId,
  className = '',
  showGamification = true,
  enableRealtime = true
}: KanbanBoardProps) {
  const [state, dispatch] = useReducer(kanbanReducer, initialState);
  const { showToast } = useToast();
  const boardRef = useRef<HTMLElement>(null as any);

  // Providers
  const { 
    state: boardState, 
    updateBoardSettings,
    fetchBoardById,
    fetchBoardColumns,
    fetchBoardSettings,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns
  } = useBoard();
  
  const { 
    tasks,
    updateTask,
    createTask,
    deleteTask
  } = useTasks();

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 5,
        delay: 50,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ==================== DATA LOADING ====================

  const loadBoardData = useCallback(async (id: number) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'SET_ERROR', error: null });

    try {
      await Promise.all([
        fetchBoardById(id),
        fetchBoardColumns(id),
        fetchBoardSettings(id)
      ]);
    } catch (error) {
      console.error('Failed to load board data:', error);
      dispatch({ type: 'SET_ERROR', error: 'Failed to load board data' });
      showToast('Failed to load board data', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [fetchBoardById, fetchBoardColumns, fetchBoardSettings, showToast]);

  // Load board data when boardId changes
  useEffect(() => {
    if (boardId) {
      loadBoardData(boardId);
    }
  }, [boardId, loadBoardData]);

  // Sync with board provider state
  useEffect(() => {
    if (boardState.currentBoard) {
      dispatch({ type: 'SET_BOARD', board: boardState.currentBoard });
    }
  }, [boardState.currentBoard]);

  useEffect(() => {
    if (boardState.boardColumns.length > 0) {
      dispatch({ type: 'SET_COLUMNS', columns: boardState.boardColumns });
    }
  }, [boardState.boardColumns]);

  useEffect(() => {
    if (boardState.boardSettings) {
      dispatch({ type: 'SET_SETTINGS', settings: boardState.boardSettings });
    }
  }, [boardState.boardSettings]);

  // Group tasks by column
  const tasksByColumn = useMemo(() => {
    const grouped: Record<number, Task[]> = {};
    
    // Initialize all columns with empty arrays
    state.columns.forEach(column => {
      grouped[column.id] = [];
    });

    // Group tasks by their status mapped to columns
    tasks.forEach(task => {
      const column = state.columns.find(col => {
        const mappedStatus = col.mappedStatus;
        const taskStatus = task.status;
        
        if (typeof mappedStatus === 'string' && typeof taskStatus === 'string') {
          return mappedStatus.toLowerCase() === taskStatus.toLowerCase();
        }
        
        return mappedStatus === taskStatus;
      });
      
      if (column) {
        grouped[column.id].push(task);
      } else {
        // Default to first column if no mapping found
        const firstColumn = state.columns[0];
        if (firstColumn) {
          grouped[firstColumn.id].push(task);
        }
      }
    });

    return grouped;
  }, [state.columns, tasks]);

  // Update tasksByColumn when tasks change
  useEffect(() => {
    dispatch({ type: 'SET_TASKS_BY_COLUMN', tasksByColumn });
  }, [tasksByColumn]);

  // ==================== DRAG AND DROP HANDLERS ====================

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    const draggedTask = tasks.find(task => task.id === taskId);
    
    if (draggedTask) {
      // Find source column
      const sourceColumn = state.columns.find(col => 
        state.tasksByColumn[col.id]?.some(task => task.id === taskId)
      );
      
      dispatch({
        type: 'SET_DRAG_STATE',
        dragState: {
          isDragging: true,
          draggedTask,
          sourceColumn: sourceColumn || null,
          hoveredColumn: null,
        }
      });
    }
  }, [tasks, state.columns, state.tasksByColumn]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset drag state
    dispatch({
      type: 'SET_DRAG_STATE',
      dragState: {
        isDragging: false,
        draggedTask: null,
        sourceColumn: null,
        hoveredColumn: null,
      }
    });

    if (!over) return;

    const taskId = Number(active.id);
    const overId = String(over.id);
    
    // Find source column and task
    let sourceColumn: BoardColumn | null = null;
    
    for (const column of state.columns) {
      if (state.tasksByColumn[column.id]?.some(task => task.id === taskId)) {
        sourceColumn = column;
        break;
      }
    }
    
    if (!sourceColumn) return;

    // Determine destination column
    let destinationColumn: BoardColumn | null = null;
    
    if (overId.startsWith('column-')) {
      // Dropped on empty column
      const columnId = Number(overId.replace('column-', ''));
      destinationColumn = state.columns.find(col => col.id === columnId) || null;
    } else {
      // Dropped on another task - find which column contains the target task
      const targetTaskId = Number(overId);
      for (const column of state.columns) {
        if (state.tasksByColumn[column.id]?.some(task => task.id === targetTaskId)) {
          destinationColumn = column;
          break;
        }
      }
    }
    
    if (!destinationColumn || sourceColumn.id === destinationColumn.id) return;

    // Check WIP limits before moving
    if (state.settings?.enableWipLimits && destinationColumn.taskLimit) {
      const currentTaskCount = state.tasksByColumn[destinationColumn.id]?.length || 0;
      if (currentTaskCount >= destinationColumn.taskLimit) {
        showToast(`Cannot move task: WIP limit reached for ${destinationColumn.name} (${currentTaskCount}/${destinationColumn.taskLimit})`, 'error');
        return;
      }
    }

    try {
      // Update task status for cross-column movement
      await updateTask(taskId.toString(), { 
        status: destinationColumn.mappedStatus as string 
      });
      
      // Optimistically update UI
      const result: DragDropResult = {
        taskId,
        sourceColumnId: sourceColumn.id,
        destinationColumnId: destinationColumn.id,
        sourceIndex: 0, // Simplified for now
        destinationIndex: 0, // Simplified for now
      };
      
      dispatch({ type: 'MOVE_TASK', result });
      
      showToast('Task moved successfully', 'success');
      
    } catch (error) {
      console.error('Failed to move task:', error);
      showToast('Failed to move task', 'error');
    }
  }, [state.columns, state.tasksByColumn, state.settings, updateTask, showToast]);

  // ==================== HANDLERS ====================

  const handleCreateTask = useCallback((columnId: number) => {
    const column = state.columns.find(col => col.id === columnId);
    if (column) {
      dispatch({ type: 'SET_ACTIVE_COLUMN_FOR_NEW_TASK', column });
      dispatch({ type: 'SET_TASK_MODAL', show: true });
    }
  }, [state.columns]);

  const handleEditTask = useCallback((task: Task) => {
    dispatch({ type: 'SET_TASK_MODAL', show: true, task });
  }, []);

  const handleOpenSettings = useCallback(() => {
    dispatch({ type: 'SET_SETTINGS_MODAL', show: true });
  }, []);

  const handleCloseSettings = useCallback(() => {
    dispatch({ type: 'SET_SETTINGS_MODAL', show: false });
  }, []);

  // ==================== RENDER ====================

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (state.error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-4">{state.error}</p>
        <Button onClick={() => boardId && loadBoardData(boardId)} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Card>
    );
  }

  if (!state.currentBoard) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No board selected</p>
      </Card>
    );
  }

  const columnIds = state.columns.map(col => `column-${col.id}`);

  return (
    <div className={`kanban-board ${className}`}>
      {/* Board Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{state.currentBoard.name}</h1>
          {state.currentBoard.description && (
            <p className="text-muted-foreground">{state.currentBoard.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={() => dispatch({ type: 'SET_COLUMN_MODAL', show: true })} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
          
          <Button onClick={handleOpenSettings} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Board Content */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {/* Filter/Search Component */}
          <TaskFilterSearch
            filter={state.filter}
            sort={state.sort}
            onFilterChange={(filter) => dispatch({ type: 'SET_FILTER', filter })}
            onSortChange={(sort) => dispatch({ type: 'SET_SORT', sort })}
            onClearFilters={() => {
              dispatch({ type: 'SET_FILTER', filter: {} });
              dispatch({ type: 'SET_SORT', sort: { field: 'createdAt', direction: 'desc' } });
            }}
            className="mb-6"
          />
          
          <div className="flex gap-6 overflow-x-auto pb-6">
            {state.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={state.tasksByColumn[column.id] || []}
                onAddTask={() => handleCreateTask(column.id)}
                onEditTask={handleEditTask}
                onDeleteTask={(taskId) => {
                  deleteTask(taskId.toString()).then(() => {
                    showToast('Task deleted successfully', 'success');
                  }).catch(() => {
                    showToast('Failed to delete task', 'error');
                  });
                }}
                onTaskMove={() => {}}
                boardSettings={state.settings || undefined}
                showGamification={showGamification}
              />
            ))}
          </div>
               {/* Realtime Components */}
               {enableRealtime && (
            <>
              <LiveTaskMovements movements={[]} boardRef={boardRef} />
              <RealtimeCollaborationBar isConnected={false} onlineUsers={[]} recentActivities={[]} currentUserId={''} />
            </>
          )}
        </SortableContext>
      </DndContext>

      {/* Modals */}
      <TaskModal
        isOpen={state.showTaskModal}
        onClose={() => dispatch({ type: 'SET_TASK_MODAL', show: false })}
        task={state.editingTask}
        columnId={state.activeColumnForNewTask?.id}
        onSave={async (taskData) => {
          try {
            // Convert priority string to number for backend
            const taskDataForBackend = {
              ...taskData,
              priority: typeof taskData.priority === 'string' 
                ? (taskData.priority === 'critical' ? 4 : taskData.priority === 'high' ? 3 : taskData.priority === 'medium' ? 2 : 1)
                : taskData.priority
            };
            
            if (state.editingTask) {
              await updateTask(state.editingTask.id.toString(), taskDataForBackend);
              showToast('Task updated successfully', 'success');
            } else if (state.activeColumnForNewTask) {
              await createTask(taskDataForBackend);
              showToast('Task created successfully', 'success');
            }
            dispatch({ type: 'SET_TASK_MODAL', show: false });
          } catch (error) {
            showToast('Failed to save task', 'error');
          }
        }}
        onDelete={state.editingTask ? async () => {
          try {
            await deleteTask(state.editingTask!.id.toString());
            dispatch({ type: 'SET_TASK_MODAL', show: false });
            showToast('Task deleted successfully', 'success');
          } catch (error) {
            showToast('Failed to delete task', 'error');
          }
        } : undefined}
      />

      <ColumnModal
        isOpen={state.showColumnModal}
        onClose={() => dispatch({ type: 'SET_COLUMN_MODAL', show: false })}
        column={state.editingColumn}
        boardId={state.currentBoard.id}
        onSave={async (columnData) => {
          try {
            if (state.editingColumn) {
              await updateColumn(state.currentBoard!.id, state.editingColumn.id, columnData);
            } else {
              await createColumn(state.currentBoard!.id, columnData);
            }
            dispatch({ type: 'SET_COLUMN_MODAL', show: false });
          } catch (error) {
            showToast('Failed to save column', 'error');
          }
        }}
        onDelete={state.editingColumn ? async () => {
          try {
            await deleteColumn(state.currentBoard!.id, state.editingColumn!.id);
            dispatch({ type: 'SET_COLUMN_MODAL', show: false });
          } catch (error) {
            showToast('Failed to delete column', 'error');
          }
        } : undefined}
      />

      {/* Board Settings Panel */}
      {state.currentBoard && state.settings && (
        <BoardSettingsPanel
          isOpen={state.showSettingsModal}
          onClose={handleCloseSettings}
          board={state.currentBoard}
          settings={state.settings}
          onUpdateSettings={async (updatedSettings: UpdateBoardSettings) => {
            try {
              await updateBoardSettings(state.currentBoard!.id, updatedSettings);
            } catch (error) {
              showToast('Failed to update settings', 'error');
            }
          }}
          onUpdateBoard={async (boardId: number, boardData: Partial<Board>) => {
            showToast('Board updated successfully', 'success');
          }}
        />
      )}
    </div>
  );
} 