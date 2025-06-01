'use client';

/**
 * Enhanced Board Provider
 * Comprehensive state management for all board operations with real-time SignalR integration
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { 
  Board, 
  BoardColumn, 
  BoardSettings, 
  BoardTemplate, 
  BoardViewState, 
  CreateBoardDTO, 
  UpdateBoardDTO,
  CreateBoardColumnDTO,
  UpdateBoardColumnDTO,
  CreateBoardFromTemplateDTO,
  UpdateBoardSettingsDTO,
  DragEndResult,
  TaskFilter,
  TaskSort,
  BoardAnalytics,
  WipLimitStatus
} from '@/lib/types/board';
import { Task, TaskStatus } from '@/lib/types/task';
import { boardService } from '@/lib/services/boardService';
import { useToast } from '@/lib/hooks/useToast';
import { useBoardSignalR } from '@/lib/hooks/useBoardSignalR';
import { BoardEvent, TemplateMarketplaceEvent, SettingsSyncEvent } from '@/lib/types/signalr';

// ==================== STATE INTERFACES ====================

interface BoardState {
  // Current data
  boards: Board[];
  currentBoard: Board | null;
  boardColumns: BoardColumn[];
  boardSettings: BoardSettings | null;
  templates: BoardTemplate[];
  publicTemplates: BoardTemplate[];
  boardAnalytics: BoardAnalytics | null;
  wipLimitStatuses: WipLimitStatus[];
  
  // UI state
  viewState: BoardViewState;
  
  // Loading states
  isLoading: boolean;
  isLoadingBoard: boolean;
  isLoadingColumns: boolean;
  isLoadingSettings: boolean;
  isLoadingTemplates: boolean;
  isLoadingAnalytics: boolean;
  
  // Error states
  error: string | null;
  boardError: string | null;
  templateError: string | null;
}

// ==================== ACTION TYPES ====================

type BoardAction =
  // Loading actions
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_BOARD_LOADING'; loading: boolean }
  | { type: 'SET_COLUMNS_LOADING'; loading: boolean }
  | { type: 'SET_SETTINGS_LOADING'; loading: boolean }
  | { type: 'SET_TEMPLATES_LOADING'; loading: boolean }
  | { type: 'SET_ANALYTICS_LOADING'; loading: boolean }
  
  // Error actions
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_BOARD_ERROR'; error: string | null }
  | { type: 'SET_TEMPLATE_ERROR'; error: string | null }
  
  // Data actions
  | { type: 'SET_BOARDS'; boards: Board[] }
  | { type: 'SET_CURRENT_BOARD'; board: Board | null }
  | { type: 'UPDATE_BOARD'; board: Board }
  | { type: 'ADD_BOARD'; board: Board }
  | { type: 'REMOVE_BOARD'; boardId: number }
  
  // Column actions
  | { type: 'SET_BOARD_COLUMNS'; columns: BoardColumn[] }
  | { type: 'ADD_COLUMN'; column: BoardColumn }
  | { type: 'UPDATE_COLUMN'; column: BoardColumn }
  | { type: 'REMOVE_COLUMN'; columnId: number }
  | { type: 'REORDER_COLUMNS'; columns: BoardColumn[] }
  
  // Settings actions
  | { type: 'SET_BOARD_SETTINGS'; settings: BoardSettings | null }
  | { type: 'UPDATE_SETTINGS'; settings: BoardSettings }
  
  // Template actions
  | { type: 'SET_TEMPLATES'; templates: BoardTemplate[] }
  | { type: 'SET_PUBLIC_TEMPLATES'; templates: BoardTemplate[] }
  | { type: 'ADD_TEMPLATE'; template: BoardTemplate }
  
  // Analytics actions
  | { type: 'SET_BOARD_ANALYTICS'; analytics: BoardAnalytics | null }
  | { type: 'SET_WIP_LIMIT_STATUS'; statuses: WipLimitStatus[] }
  
  // View state actions
  | { type: 'SET_SELECTED_BOARD'; boardId: number }
  | { type: 'SET_ACTIVE_COLUMN'; columnId: number }
  | { type: 'SET_SELECTED_TASKS'; taskIds: number[] }
  | { type: 'SET_FILTER'; filter: TaskFilter }
  | { type: 'SET_SORT'; sort: TaskSort }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_SETTINGS'; show?: boolean }
  | { type: 'TOGGLE_TEMPLATE_SELECTOR'; show?: boolean }
  | { type: 'TOGGLE_ANALYTICS'; show?: boolean };

// ==================== INITIAL STATE ====================

const initialViewState: BoardViewState = {
  selectedTaskIds: [],
  filterBy: {},
  sortBy: { field: 'createdAt', direction: 'desc' },
  searchQuery: '',
  showSettings: false,
  showTemplateSelector: false,
  showAnalytics: false,
  isLoading: false
};

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  boardColumns: [],
  boardSettings: null,
  templates: [],
  publicTemplates: [],
  boardAnalytics: null,
  wipLimitStatuses: [],
  viewState: initialViewState,
  isLoading: false,
  isLoadingBoard: false,
  isLoadingColumns: false,
  isLoadingSettings: false,
  isLoadingTemplates: false,
  isLoadingAnalytics: false,
  error: null,
  boardError: null,
  templateError: null
};

// ==================== REDUCER ====================

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    // Loading actions
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SET_BOARD_LOADING':
      return { ...state, isLoadingBoard: action.loading };
    case 'SET_COLUMNS_LOADING':
      return { ...state, isLoadingColumns: action.loading };
    case 'SET_SETTINGS_LOADING':
      return { ...state, isLoadingSettings: action.loading };
    case 'SET_TEMPLATES_LOADING':
      return { ...state, isLoadingTemplates: action.loading };
    case 'SET_ANALYTICS_LOADING':
      return { ...state, isLoadingAnalytics: action.loading };
    
    // Error actions
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_BOARD_ERROR':
      return { ...state, boardError: action.error };
    case 'SET_TEMPLATE_ERROR':
      return { ...state, templateError: action.error };
    
    // Data actions
    case 'SET_BOARDS':
      return { ...state, boards: action.boards };
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.board };
    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board => 
          board.id === action.board.id ? action.board : board
        ),
        currentBoard: state.currentBoard?.id === action.board.id ? action.board : state.currentBoard
      };
    case 'ADD_BOARD':
      return { ...state, boards: [...state.boards, action.board] };
    case 'REMOVE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.boardId),
        currentBoard: state.currentBoard?.id === action.boardId ? null : state.currentBoard
      };
    
    // Column actions
    case 'SET_BOARD_COLUMNS':
      return { ...state, boardColumns: action.columns };
    case 'ADD_COLUMN':
      return { ...state, boardColumns: [...state.boardColumns, action.column] };
    case 'UPDATE_COLUMN':
      return {
        ...state,
        boardColumns: state.boardColumns.map(col => 
          col.id === action.column.id ? action.column : col
        )
      };
    case 'REMOVE_COLUMN':
      return {
        ...state,
        boardColumns: state.boardColumns.filter(col => col.id !== action.columnId)
      };
    case 'REORDER_COLUMNS':
      return { ...state, boardColumns: action.columns };
    
    // Settings actions
    case 'SET_BOARD_SETTINGS':
      return { ...state, boardSettings: action.settings };
    case 'UPDATE_SETTINGS':
      return { ...state, boardSettings: action.settings };
    
    // Template actions
    case 'SET_TEMPLATES':
      return { ...state, templates: action.templates };
    case 'SET_PUBLIC_TEMPLATES':
      return { ...state, publicTemplates: action.templates };
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.template] };
    
    // Analytics actions
    case 'SET_BOARD_ANALYTICS':
      return { ...state, boardAnalytics: action.analytics };
    case 'SET_WIP_LIMIT_STATUS':
      return { ...state, wipLimitStatuses: action.statuses };
    
    // View state actions
    case 'SET_SELECTED_BOARD':
      return {
        ...state,
        viewState: { ...state.viewState, selectedBoardId: action.boardId }
      };
    case 'SET_ACTIVE_COLUMN':
      return {
        ...state,
        viewState: { ...state.viewState, activeColumnId: action.columnId }
      };
    case 'SET_SELECTED_TASKS':
      return {
        ...state,
        viewState: { ...state.viewState, selectedTaskIds: action.taskIds }
      };
    case 'SET_FILTER':
      return {
        ...state,
        viewState: { ...state.viewState, filterBy: action.filter }
      };
    case 'SET_SORT':
      return {
        ...state,
        viewState: { ...state.viewState, sortBy: action.sort }
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        viewState: { ...state.viewState, searchQuery: action.query }
      };
    case 'TOGGLE_SETTINGS':
      return {
        ...state,
        viewState: { 
          ...state.viewState, 
          showSettings: action.show !== undefined ? action.show : !state.viewState.showSettings 
        }
      };
    case 'TOGGLE_TEMPLATE_SELECTOR':
      return {
        ...state,
        viewState: { 
          ...state.viewState, 
          showTemplateSelector: action.show !== undefined ? action.show : !state.viewState.showTemplateSelector 
        }
      };
    case 'TOGGLE_ANALYTICS':
      return {
        ...state,
        viewState: { 
          ...state.viewState, 
          showAnalytics: action.show !== undefined ? action.show : !state.viewState.showAnalytics 
        }
      };
    
    default:
      return state;
  }
}

// ==================== CONTEXT INTERFACE ====================

interface BoardContextValue {
  // State
  state: BoardState;
  
  // Board operations
  fetchUserBoards: () => Promise<void>;
  fetchBoardById: (boardId: number) => Promise<void>;
  createBoard: (boardData: CreateBoardDTO) => Promise<Board>;
  updateBoard: (boardId: number, boardData: UpdateBoardDTO) => Promise<void>;
  deleteBoard: (boardId: number) => Promise<void>;
  setCurrentBoard: (board: Board | null) => void;
  
  // Column operations
  fetchBoardColumns: (boardId: number) => Promise<void>;
  createColumn: (boardId: number, columnData: CreateBoardColumnDTO) => Promise<void>;
  updateColumn: (boardId: number, columnId: number, columnData: UpdateBoardColumnDTO) => Promise<void>;
  deleteColumn: (boardId: number, columnId: number) => Promise<void>;
  reorderColumns: (boardId: number, columnOrders: { columnId: number; order: number }[]) => Promise<void>;
  duplicateColumn: (boardId: number, columnId: number, newName: string) => Promise<void>;
  toggleColumnVisibility: (boardId: number, columnId: number) => Promise<void>;
  
  // Settings operations
  fetchBoardSettings: (boardId: number) => Promise<void>;
  updateBoardSettings: (boardId: number, settings: UpdateBoardSettingsDTO) => Promise<void>;
  resetBoardSettings: (boardId: number) => Promise<void>;
  exportBoardSettings: (boardId: number) => Promise<void>;
  importBoardSettings: (boardId: number, file: File) => Promise<void>;
  
  // Template operations
  fetchUserTemplates: () => Promise<void>;
  fetchPublicTemplates: () => Promise<void>;
  fetchTemplateById: (templateId: number) => Promise<BoardTemplate>;
  createBoardFromTemplate: (templateId: number, boardData: CreateBoardFromTemplateDTO) => Promise<Board>;
  saveBoardAsTemplate: (boardId: number, templateName: string, templateDescription?: string, isPublic?: boolean) => Promise<void>;
  searchTemplates: (searchTerm: string) => Promise<BoardTemplate[]>;
  
  // Analytics operations
  fetchBoardAnalytics: (boardId: number, dateRange?: { from: string; to: string }) => Promise<void>;
  fetchWipLimitStatus: (boardId: number) => Promise<void>;
  
  // Task operations
  moveTask: (boardId: number, taskId: number, sourceColumnId: number, destinationColumnId: number) => Promise<void>;
  handleDragEnd: (result: DragEndResult) => Promise<void>;
  
  // View state operations
  setSelectedBoard: (boardId: number) => void;
  setActiveColumn: (columnId: number) => void;
  setSelectedTasks: (taskIds: number[]) => void;
  setFilter: (filter: TaskFilter) => void;
  setSort: (sort: TaskSort) => void;
  setSearchQuery: (query: string) => void;
  toggleSettings: (show?: boolean) => void;
  toggleTemplateSelector: (show?: boolean) => void;
  toggleAnalytics: (show?: boolean) => void;
  
  // Utility operations
  clearErrors: () => void;
  refreshCurrentBoard: () => Promise<void>;
}

// ==================== CONTEXT CREATION ====================

const BoardContext = createContext<BoardContextValue | undefined>(undefined);

// ==================== PROVIDER COMPONENT ====================

interface BoardProviderProps {
  children: React.ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  const { showToast } = useToast();

  // ==================== SIGNALR INTEGRATION ====================

  // SignalR callbacks for real-time updates
  const handleBoardUpdate = useCallback((update: BoardEvent) => {
    console.log('Received board update:', update);
    
    switch (update.type) {
      case 'board_updated':
        if (update.data.board) {
          dispatch({ type: 'UPDATE_BOARD', board: update.data.board });
          if (state.currentBoard?.id === update.boardId) {
            dispatch({ type: 'SET_CURRENT_BOARD', board: update.data.board });
          }
        }
        break;
        
      case 'column_updated':
        if (update.data.column) {
          dispatch({ type: 'UPDATE_COLUMN', column: update.data.column });
        }
        break;
        
      case 'task_moved':
        // Refresh board columns to get updated task positions
        if (state.currentBoard?.id === update.boardId) {
          fetchBoardColumns(update.boardId);
        }
        break;
        
      case 'wip_violation':
        // Show WIP violation notification
        showToast(
          `WIP limit exceeded in column: ${update.data.columnName || 'Unknown'}`,
          'warning'
        );
        // Refresh WIP status
        if (state.currentBoard?.id === update.boardId) {
          fetchWipLimitStatus(update.boardId);
        }
        break;
        
      case 'analytics_updated':
        // Refresh analytics if currently viewing
        if (state.currentBoard?.id === update.boardId && state.viewState.showAnalytics) {
          fetchBoardAnalytics(update.boardId);
        }
        
        // Show performance alerts if present
        if (update.data.alertType === 'performance' && update.data.alerts?.length > 0) {
          showToast(
            `Performance alert: ${update.data.alerts[0].message}`,
            'info'
          );
        }
        break;
    }
  }, [state.currentBoard, state.viewState.showAnalytics, showToast]);

  const handleTemplateMarketplaceUpdate = useCallback((update: TemplateMarketplaceEvent) => {
    console.log('Received template marketplace update:', update);
    
    switch (update.type) {
      case 'template_published':
        // Refresh public templates if viewing marketplace
        fetchPublicTemplates();
        showToast(`New template published: ${update.data.templateName}`, 'info');
        break;
        
      case 'template_rated':
        // Refresh templates to show updated ratings
        fetchPublicTemplates();
        break;
        
      case 'template_trending':
        // Refresh public templates to show trending updates
        fetchPublicTemplates();
        break;
        
      case 'marketplace_analytics':
        // Could update marketplace analytics if we have a dedicated view
        break;
    }
  }, []);

  const handleSettingsSyncUpdate = useCallback((update: SettingsSyncEvent) => {
    console.log('Received settings sync update:', update);
    
    switch (update.type) {
      case 'settings_changed':
        if (state.currentBoard?.id === update.boardId) {
          dispatch({ type: 'UPDATE_SETTINGS', settings: update.data.settings });
          showToast('Board settings updated by another user', 'info');
        }
        break;
        
      case 'theme_updated':
        if (state.currentBoard?.id === update.boardId) {
          dispatch({ type: 'UPDATE_SETTINGS', settings: update.data.settings });
          showToast('Board theme updated', 'info');
        }
        break;
        
      case 'settings_imported':
        if (state.currentBoard?.id === update.boardId) {
          dispatch({ type: 'UPDATE_SETTINGS', settings: update.data.settings });
          showToast('Board settings imported by another user', 'info');
        }
        break;
    }
  }, [state.currentBoard, showToast]);

  const handleSignalRConnected = useCallback(() => {
    console.log('Board SignalR connected');
    showToast('Real-time updates connected', 'success');
  }, [showToast]);

  const handleSignalRDisconnected = useCallback(() => {
    console.log('Board SignalR disconnected');
    showToast('Real-time updates disconnected', 'warning');
  }, [showToast]);

  const handleSignalRError = useCallback((error: Error) => {
    console.error('Board SignalR error:', error);
    showToast('Real-time connection error', 'error');
  }, [showToast]);

  // Initialize SignalR with current board
  const { isConnected, joinBoard, leaveBoard, joinTemplateMarketplace, leaveTemplateMarketplace } = useBoardSignalR(
    {
      boardId: state.currentBoard?.id,
      enableTemplateMarketplace: state.viewState.showTemplateSelector,
      enableSettingsSync: true,
      autoConnect: true
    },
    {
      onBoardUpdate: handleBoardUpdate,
      onTemplateMarketplaceUpdate: handleTemplateMarketplaceUpdate,
      onSettingsSyncUpdate: handleSettingsSyncUpdate,
      onConnected: handleSignalRConnected,
      onDisconnected: handleSignalRDisconnected,
      onError: handleSignalRError
    }
  );

  // Join/leave board groups when current board changes
  useEffect(() => {
    if (isConnected && state.currentBoard) {
      joinBoard(state.currentBoard.id);
      return () => {
        if (state.currentBoard) {
          leaveBoard(state.currentBoard.id);
        }
      };
    }
  }, [isConnected, state.currentBoard, joinBoard, leaveBoard]);

  // Join/leave template marketplace when template selector is toggled
  useEffect(() => {
    if (isConnected) {
      if (state.viewState.showTemplateSelector) {
        joinTemplateMarketplace();
      } else {
        leaveTemplateMarketplace();
      }
    }
  }, [isConnected, state.viewState.showTemplateSelector, joinTemplateMarketplace, leaveTemplateMarketplace]);

  // ==================== BOARD OPERATIONS ====================

  const fetchUserBoards = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const boards = await boardService.getUserBoards();
      dispatch({ type: 'SET_BOARDS', boards });
      dispatch({ type: 'SET_ERROR', error: null });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
      showToast('Failed to fetch boards', 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [showToast]);

  const fetchBoardById = useCallback(async (boardId: number) => {
    dispatch({ type: 'SET_BOARD_LOADING', loading: true });
    try {
      const board = await boardService.getBoardById(boardId);
      dispatch({ type: 'SET_CURRENT_BOARD', board });
      dispatch({ type: 'SET_BOARD_COLUMNS', columns: board.columns || [] });
      dispatch({ type: 'SET_BOARD_SETTINGS', settings: board.settings || null });
      dispatch({ type: 'SET_BOARD_ERROR', error: null });
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to fetch board', 'error');
    } finally {
      dispatch({ type: 'SET_BOARD_LOADING', loading: false });
    }
  }, [showToast]);

  const createBoard = useCallback(async (boardData: CreateBoardDTO): Promise<Board> => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const board = await boardService.createBoard(boardData);
      dispatch({ type: 'ADD_BOARD', board });
      dispatch({ type: 'SET_ERROR', error: null });
      showToast('Board created successfully', 'success');
      return board;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
      showToast('Failed to create board', 'error');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [showToast]);

  const updateBoard = useCallback(async (boardId: number, boardData: UpdateBoardDTO) => {
    try {
      const board = await boardService.updateBoard(boardId, boardData);
      dispatch({ type: 'UPDATE_BOARD', board });
      showToast('Board updated successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to update board', 'error');
    }
  }, [showToast]);

  const deleteBoard = useCallback(async (boardId: number) => {
    try {
      await boardService.deleteBoard(boardId);
      dispatch({ type: 'REMOVE_BOARD', boardId });
      showToast('Board deleted successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
      showToast('Failed to delete board', 'error');
    }
  }, [showToast]);

  const setCurrentBoard = useCallback((board: Board | null) => {
    dispatch({ type: 'SET_CURRENT_BOARD', board });
    if (board) {
      dispatch({ type: 'SET_SELECTED_BOARD', boardId: board.id });
    }
  }, []);

  // ==================== COLUMN OPERATIONS ====================

  const fetchBoardColumns = useCallback(async (boardId: number) => {
    dispatch({ type: 'SET_COLUMNS_LOADING', loading: true });
    try {
      const columns = await boardService.getBoardColumns(boardId);
      dispatch({ type: 'SET_BOARD_COLUMNS', columns });
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to fetch columns', 'error');
    } finally {
      dispatch({ type: 'SET_COLUMNS_LOADING', loading: false });
    }
  }, [showToast]);

  const createColumn = useCallback(async (boardId: number, columnData: CreateBoardColumnDTO) => {
    try {
      const column = await boardService.createColumn(boardId, columnData);
      dispatch({ type: 'ADD_COLUMN', column });
      showToast('Column created successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to create column', 'error');
    }
  }, [showToast]);

  const updateColumn = useCallback(async (boardId: number, columnId: number, columnData: UpdateBoardColumnDTO) => {
    try {
      const column = await boardService.updateColumn(boardId, columnId, columnData);
      dispatch({ type: 'UPDATE_COLUMN', column });
      showToast('Column updated successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to update column', 'error');
    }
  }, [showToast]);

  const deleteColumn = useCallback(async (boardId: number, columnId: number) => {
    try {
      await boardService.deleteColumn(boardId, columnId);
      dispatch({ type: 'REMOVE_COLUMN', columnId });
      showToast('Column deleted successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to delete column', 'error');
    }
  }, [showToast]);

  const reorderColumns = useCallback(async (boardId: number, columnOrders: { columnId: number; order: number }[]) => {
    try {
      await boardService.reorderColumns(boardId, columnOrders);
      // Reorder locally
      const reorderedColumns = [...state.boardColumns].sort((a, b) => {
        const aOrder = columnOrders.find(o => o.columnId === a.id)?.order || a.order;
        const bOrder = columnOrders.find(o => o.columnId === b.id)?.order || b.order;
        return aOrder - bOrder;
      });
      dispatch({ type: 'REORDER_COLUMNS', columns: reorderedColumns });
      showToast('Columns reordered successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to reorder columns', 'error');
    }
  }, [state.boardColumns, showToast]);

  const duplicateColumn = useCallback(async (boardId: number, columnId: number, newName: string) => {
    try {
      const column = await boardService.duplicateColumn(boardId, columnId, newName);
      dispatch({ type: 'ADD_COLUMN', column });
      showToast('Column duplicated successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to duplicate column', 'error');
    }
  }, [showToast]);

  const toggleColumnVisibility = useCallback(async (boardId: number, columnId: number) => {
    try {
      const column = await boardService.toggleColumnVisibility(boardId, columnId);
      dispatch({ type: 'UPDATE_COLUMN', column });
      showToast(`Column ${column.isVisible ? 'shown' : 'hidden'}`, 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to toggle column visibility', 'error');
    }
  }, [showToast]);

  // ==================== SETTINGS OPERATIONS ====================

  const fetchBoardSettings = useCallback(async (boardId: number) => {
    dispatch({ type: 'SET_SETTINGS_LOADING', loading: true });
    try {
      const settings = await boardService.getBoardSettings(boardId);
      dispatch({ type: 'SET_BOARD_SETTINGS', settings });
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to fetch board settings', 'error');
    } finally {
      dispatch({ type: 'SET_SETTINGS_LOADING', loading: false });
    }
  }, [showToast]);

  const updateBoardSettings = useCallback(async (boardId: number, settings: UpdateBoardSettingsDTO) => {
    try {
      const updatedSettings = await boardService.updateBoardSettings(boardId, settings);
      dispatch({ type: 'UPDATE_SETTINGS', settings: updatedSettings });
      showToast('Settings updated successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to update settings', 'error');
    }
  }, [showToast]);

  const resetBoardSettings = useCallback(async (boardId: number) => {
    try {
      const settings = await boardService.resetBoardSettings(boardId);
      dispatch({ type: 'UPDATE_SETTINGS', settings });
      showToast('Settings reset to defaults', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to reset settings', 'error');
    }
  }, [showToast]);

  const exportBoardSettings = useCallback(async (boardId: number) => {
    try {
      const jsonString = await boardService.exportBoardSettings(boardId);
      showToast('Settings exported successfully', 'success');
    } catch (error: any) {
      showToast('Failed to export settings', 'error');
    }
  }, [showToast]);

  const importBoardSettings = useCallback(async (boardId: number, file: File) => {
    try {
      const settings = await boardService.importBoardSettings(boardId, file);
      dispatch({ type: 'UPDATE_SETTINGS', settings });
      showToast('Settings imported successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to import settings', 'error');
    }
  }, [showToast]);

  // ==================== TEMPLATE OPERATIONS ====================

  const fetchUserTemplates = useCallback(async () => {
    dispatch({ type: 'SET_TEMPLATES_LOADING', loading: true });
    try {
      const templates = await boardService.getUserTemplates();
      dispatch({ type: 'SET_TEMPLATES', templates });
    } catch (error: any) {
      dispatch({ type: 'SET_TEMPLATE_ERROR', error: error.message });
      showToast('Failed to fetch user templates', 'error');
    } finally {
      dispatch({ type: 'SET_TEMPLATES_LOADING', loading: false });
    }
  }, [showToast]);

  const fetchPublicTemplates = useCallback(async () => {
    dispatch({ type: 'SET_TEMPLATES_LOADING', loading: true });
    try {
      const templates = await boardService.getPublicTemplates();
      dispatch({ type: 'SET_PUBLIC_TEMPLATES', templates });
    } catch (error: any) {
      dispatch({ type: 'SET_TEMPLATE_ERROR', error: error.message });
      showToast('Failed to fetch public templates', 'error');
    } finally {
      dispatch({ type: 'SET_TEMPLATES_LOADING', loading: false });
    }
  }, [showToast]);

  const fetchTemplateById = useCallback(async (templateId: number): Promise<BoardTemplate> => {
    try {
      const template = await boardService.getTemplateById(templateId);
      return template;
    } catch (error: any) {
      dispatch({ type: 'SET_TEMPLATE_ERROR', error: error.message });
      showToast('Failed to fetch template', 'error');
      throw error;
    }
  }, [showToast]);

  const createBoardFromTemplate = useCallback(async (templateId: number, boardData: CreateBoardFromTemplateDTO): Promise<Board> => {
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const board = await boardService.createBoardFromTemplate(templateId, boardData);
      dispatch({ type: 'ADD_BOARD', board });
      showToast('Board created from template successfully', 'success');
      return board;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
      showToast('Failed to create board from template', 'error');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [showToast]);

  const saveBoardAsTemplate = useCallback(async (
    boardId: number, 
    templateName: string, 
    templateDescription?: string,
    isPublic: boolean = false
  ) => {
    try {
      const template = await boardService.saveBoardAsTemplate(boardId, templateName, templateDescription, isPublic);
      dispatch({ type: 'ADD_TEMPLATE', template });
      showToast('Board saved as template successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', error: error.message });
      showToast('Failed to save board as template', 'error');
    }
  }, [showToast]);

  const searchTemplates = useCallback(async (searchTerm: string): Promise<BoardTemplate[]> => {
    try {
      const templates = await boardService.searchTemplates(searchTerm);
      return templates;
    } catch (error: any) {
      dispatch({ type: 'SET_TEMPLATE_ERROR', error: error.message });
      showToast('Failed to search templates', 'error');
      return [];
    }
  }, [showToast]);

  // ==================== ANALYTICS OPERATIONS ====================

  const fetchBoardAnalytics = useCallback(async (boardId: number, dateRange?: { from: string; to: string }) => {
    dispatch({ type: 'SET_ANALYTICS_LOADING', loading: true });
    try {
      const analytics = await boardService.getBoardAnalytics(boardId, dateRange);
      dispatch({ type: 'SET_BOARD_ANALYTICS', analytics });
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to fetch board analytics', 'error');
    } finally {
      dispatch({ type: 'SET_ANALYTICS_LOADING', loading: false });
    }
  }, [showToast]);

  const fetchWipLimitStatus = useCallback(async (boardId: number) => {
    try {
      const statuses = await boardService.getWipLimitStatus(boardId);
      dispatch({ type: 'SET_WIP_LIMIT_STATUS', statuses });
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to fetch WIP limit status', 'error');
    }
  }, [showToast]);

  // ==================== TASK OPERATIONS ====================

  const moveTask = useCallback(async (
    boardId: number, 
    taskId: number, 
    sourceColumnId: number, 
    destinationColumnId: number
  ) => {
    try {
      await boardService.moveTask(boardId, taskId, sourceColumnId, destinationColumnId);
      showToast('Task moved successfully', 'success');
    } catch (error: any) {
      dispatch({ type: 'SET_BOARD_ERROR', error: error.message });
      showToast('Failed to move task', 'error');
    }
  }, [showToast]);

  const handleDragEnd = useCallback(async (result: DragEndResult) => {
    if (!state.currentBoard) return;
    
    try {
      await moveTask(
        state.currentBoard.id,
        result.taskId,
        result.sourceColumnId,
        result.destinationColumnId
      );
    } catch (error) {
      // Error already handled in moveTask
    }
  }, [state.currentBoard, moveTask]);

  // ==================== VIEW STATE OPERATIONS ====================

  const setSelectedBoard = useCallback((boardId: number) => {
    dispatch({ type: 'SET_SELECTED_BOARD', boardId });
  }, []);

  const setActiveColumn = useCallback((columnId: number) => {
    dispatch({ type: 'SET_ACTIVE_COLUMN', columnId });
  }, []);

  const setSelectedTasks = useCallback((taskIds: number[]) => {
    dispatch({ type: 'SET_SELECTED_TASKS', taskIds });
  }, []);

  const setFilter = useCallback((filter: TaskFilter) => {
    dispatch({ type: 'SET_FILTER', filter });
  }, []);

  const setSort = useCallback((sort: TaskSort) => {
    dispatch({ type: 'SET_SORT', sort });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query });
  }, []);

  const toggleSettings = useCallback((show?: boolean) => {
    dispatch({ type: 'TOGGLE_SETTINGS', show });
  }, []);

  const toggleTemplateSelector = useCallback((show?: boolean) => {
    dispatch({ type: 'TOGGLE_TEMPLATE_SELECTOR', show });
  }, []);

  const toggleAnalytics = useCallback((show?: boolean) => {
    dispatch({ type: 'TOGGLE_ANALYTICS', show });
  }, []);

  // ==================== UTILITY OPERATIONS ====================

  const clearErrors = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null });
    dispatch({ type: 'SET_BOARD_ERROR', error: null });
    dispatch({ type: 'SET_TEMPLATE_ERROR', error: null });
  }, []);

  const refreshCurrentBoard = useCallback(async () => {
    if (state.currentBoard) {
      await fetchBoardById(state.currentBoard.id);
    }
  }, [state.currentBoard, fetchBoardById]);

  // ==================== CONTEXT VALUE ====================

  const contextValue: BoardContextValue = {
    state,
    
    // Board operations
    fetchUserBoards,
    fetchBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    
    // Column operations
    fetchBoardColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    duplicateColumn,
    toggleColumnVisibility,
    
    // Settings operations
    fetchBoardSettings,
    updateBoardSettings,
    resetBoardSettings,
    exportBoardSettings,
    importBoardSettings,
    
    // Template operations
    fetchUserTemplates,
    fetchPublicTemplates,
    fetchTemplateById,
    createBoardFromTemplate,
    saveBoardAsTemplate,
    searchTemplates,
    
    // Analytics operations
    fetchBoardAnalytics,
    fetchWipLimitStatus,
    
    // Task operations
    moveTask,
    handleDragEnd,
    
    // View state operations
    setSelectedBoard,
    setActiveColumn,
    setSelectedTasks,
    setFilter,
    setSort,
    setSearchQuery,
    toggleSettings,
    toggleTemplateSelector,
    toggleAnalytics,
    
    // Utility operations
    clearErrors,
    refreshCurrentBoard
  };

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    // Load initial data
    fetchUserBoards();
    fetchPublicTemplates();
  }, [fetchUserBoards, fetchPublicTemplates]);

  return (
    <BoardContext.Provider value={contextValue}>
      {children}
    </BoardContext.Provider>
  );
}

// ==================== HOOK ====================

export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
} 