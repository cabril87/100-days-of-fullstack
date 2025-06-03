'use client';

/**
 * Clean Board Provider
 * Simplified state management for board operations with proper typing
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { Board, BoardColumn, BoardSettings, UpdateBoardSettings } from '@/lib/types/board';
import { boardService } from '@/lib/services/boardService';
import { useToast } from '@/lib/hooks/useToast';

// ==================== STATE INTERFACES ====================

interface BoardState {
  // Current data
  currentBoard: Board | null;
  boardColumns: BoardColumn[];
  boardSettings: BoardSettings | null;
  
  // Loading states
  isLoading: boolean;
  
  // Error states  
  error: string | null;
}

// ==================== ACTION TYPES ====================

type BoardAction =
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_CURRENT_BOARD'; board: Board | null }
  | { type: 'SET_BOARD_COLUMNS'; columns: BoardColumn[] }
  | { type: 'SET_BOARD_SETTINGS'; settings: BoardSettings | null }
  | { type: 'UPDATE_BOARD_SETTINGS'; settings: BoardSettings }
  | { type: 'CLEAR_ERRORS' };

// ==================== INITIAL STATE ====================

const initialState: BoardState = {
  currentBoard: null,
  boardColumns: [],
  boardSettings: null,
  isLoading: false,
  error: null
};

// ==================== REDUCER ====================

function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    
    case 'SET_ERROR':
      return { ...state, error: action.error };
    
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.board };
    
    case 'SET_BOARD_COLUMNS':
      return { ...state, boardColumns: action.columns };
    
    case 'SET_BOARD_SETTINGS':
      return { ...state, boardSettings: action.settings };
    
    case 'UPDATE_BOARD_SETTINGS':
      return { ...state, boardSettings: action.settings };
    
    case 'CLEAR_ERRORS':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// ==================== CONTEXT INTERFACE ====================

interface BoardContextValue {
  // State
  state: BoardState;
  
  // Board operations
  fetchBoardById: (boardId: number) => Promise<void>;
  updateBoard: (boardId: number, boardData: Partial<Board>) => Promise<void>;
  
  // Column operations
  fetchBoardColumns: (boardId: number) => Promise<void>;
  createColumn: (boardId: number, columnData: any) => Promise<void>;
  updateColumn: (boardId: number, columnId: number, columnData: any) => Promise<void>;
  deleteColumn: (boardId: number, columnId: number) => Promise<void>;
  reorderColumns: (boardId: number, columnOrders: { columnId: number; order: number }[]) => Promise<void>;
  
  // Settings operations
  fetchBoardSettings: (boardId: number) => Promise<void>;
  updateBoardSettings: (boardId: number, settings: UpdateBoardSettings) => Promise<void>;
  
  // Utility operations
  clearErrors: () => void;
}

// ==================== CONTEXT ====================

const BoardContext = createContext<BoardContextValue | undefined>(undefined);

// ==================== PROVIDER COMPONENT ====================

interface BoardProviderProps {
  children: ReactNode;
}

export function BoardProvider({ children }: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, initialState);
  const { showToast } = useToast();

  // ==================== BOARD OPERATIONS ====================

  const fetchBoardById = useCallback(async (boardId: number) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await boardService.getBoardById(boardId);
      if (response.data) {
        dispatch({ type: 'SET_CURRENT_BOARD', board: response.data });
      } else {
        throw new Error(response.error || 'Failed to fetch board');
      }
    } catch (error) {
      console.error('Error fetching board:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch board';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [showToast]);

  const updateBoard = useCallback(async (boardId: number, boardData: Partial<Board>) => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });

      // In a real implementation, you would call the API to update the board
      // For now, we'll just update the local state
      if (state.currentBoard && state.currentBoard.id === boardId) {
        const updatedBoard = { ...state.currentBoard, ...boardData };
        dispatch({ type: 'SET_CURRENT_BOARD', board: updatedBoard });
        showToast('Board updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating board:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update board';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    }
  }, [state.currentBoard, showToast]);

  // ==================== COLUMN OPERATIONS ====================

  const fetchBoardColumns = useCallback(async (boardId: number) => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await boardService.getBoardColumns(boardId);
      if (response.data) {
        dispatch({ type: 'SET_BOARD_COLUMNS', columns: response.data });
      } else {
        throw new Error(response.error || 'Failed to fetch columns');
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch columns';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  const createColumn = useCallback(async (boardId: number, columnData: any) => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await boardService.createColumn(boardId, columnData);
      if (response.data) {
        // Refresh columns after creation
        await fetchBoardColumns(boardId);
        showToast('Column created successfully', 'success');
      } else {
        throw new Error(response.error || 'Failed to create column');
      }
    } catch (error) {
      console.error('Error creating column:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create column';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    }
  }, [fetchBoardColumns, showToast]);

  const updateColumn = useCallback(async (boardId: number, columnId: number, columnData: any) => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await boardService.updateColumn(boardId, columnId, columnData);
      if (response.data) {
        // Refresh columns after update
        await fetchBoardColumns(boardId);
        showToast('Column updated successfully', 'success');
      } else {
        throw new Error(response.error || 'Failed to update column');
      }
    } catch (error) {
      console.error('Error updating column:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update column';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    }
  }, [fetchBoardColumns, showToast]);

  const deleteColumn = useCallback(async (boardId: number, columnId: number) => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await boardService.deleteColumn(boardId, columnId);
      if (!response.error) {
        // Refresh columns after deletion
        await fetchBoardColumns(boardId);
        showToast('Column deleted successfully', 'success');
      } else {
        throw new Error(response.error || 'Failed to delete column');
      }
    } catch (error) {
      console.error('Error deleting column:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete column';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    }
  }, [fetchBoardColumns, showToast]);

  const reorderColumns = useCallback(async (boardId: number, columnOrders: { columnId: number; order: number }[]) => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });

      // In a real implementation, you would call the API to reorder columns
      // For now, we'll just update the local state
      const updatedColumns = [...state.boardColumns];
      columnOrders.forEach(({ columnId, order }) => {
        const columnIndex = updatedColumns.findIndex(col => col.id === columnId);
        if (columnIndex !== -1) {
          updatedColumns[columnIndex] = { ...updatedColumns[columnIndex], order };
        }
      });
      
      // Sort by order
      updatedColumns.sort((a, b) => a.order - b.order);
      dispatch({ type: 'SET_BOARD_COLUMNS', columns: updatedColumns });
      showToast('Columns reordered successfully', 'success');
    } catch (error) {
      console.error('Error reordering columns:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reorder columns';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    }
  }, [state.boardColumns, showToast]);

  // ==================== SETTINGS OPERATIONS ====================

  const fetchBoardSettings = useCallback(async (boardId: number) => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await boardService.getBoardSettings(boardId);
      if (response.data) {
        dispatch({ type: 'SET_BOARD_SETTINGS', settings: response.data });
      } else {
        throw new Error(response.error || 'Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  const updateBoardSettings = useCallback(async (boardId: number, settings: UpdateBoardSettings) => {
    try {
      dispatch({ type: 'SET_ERROR', error: null });

      const response = await boardService.updateBoardSettings(boardId, settings);
      if (response.data) {
        dispatch({ type: 'UPDATE_BOARD_SETTINGS', settings: response.data });
        showToast('Settings updated successfully', 'success');
      } else {
        throw new Error(response.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      dispatch({ type: 'SET_ERROR', error: errorMessage });
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  // ==================== UTILITY OPERATIONS ====================

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  // ==================== CONTEXT VALUE ====================

  const contextValue: BoardContextValue = {
    state,
    fetchBoardById,
    updateBoard,
    fetchBoardColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    fetchBoardSettings,
    updateBoardSettings,
    clearErrors
  };

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