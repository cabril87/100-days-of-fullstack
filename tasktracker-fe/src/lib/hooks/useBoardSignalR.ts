/**
 * React Hook for Board SignalR Integration
 * 
 * Provides real-time board updates, analytics, and template marketplace features
 */

import { useEffect, useCallback, useRef } from 'react';
import { boardSignalRService } from '@/lib/services/boardSignalRService';
import { BoardEvent, TemplateMarketplaceEvent, SettingsSyncEvent } from '@/lib/types/signalr';

interface UseBoardSignalROptions {
  boardId?: number;
  enableTemplateMarketplace?: boolean;
  enableSettingsSync?: boolean;
  autoConnect?: boolean;
}

interface UseBoardSignalRReturn {
  isConnected: boolean;
  joinBoard: (boardId: number) => Promise<void>;
  leaveBoard: (boardId: number) => Promise<void>;
  joinTemplateMarketplace: () => Promise<void>;
  leaveTemplateMarketplace: () => Promise<void>;
  startConnections: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}

export function useBoardSignalR(
  options: UseBoardSignalROptions = {},
  callbacks?: {
    onBoardUpdate?: (update: BoardEvent) => void;
    onTemplateMarketplaceUpdate?: (update: TemplateMarketplaceEvent) => void;
    onSettingsSyncUpdate?: (update: SettingsSyncEvent) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: Error) => void;
  }
): UseBoardSignalRReturn {
  const {
    boardId,
    enableTemplateMarketplace = false,
    enableSettingsSync = false,
    autoConnect = true
  } = options;

  const isConnectedRef = useRef(false);
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Set up event handlers
  useEffect(() => {
    const handleBoardUpdate = (update: BoardEvent) => {
      callbacksRef.current?.onBoardUpdate?.(update);
    };

    const handleTemplateMarketplaceUpdate = (update: TemplateMarketplaceEvent) => {
      callbacksRef.current?.onTemplateMarketplaceUpdate?.(update);
    };

    const handleSettingsSyncUpdate = (update: SettingsSyncEvent) => {
      callbacksRef.current?.onSettingsSyncUpdate?.(update);
    };

    const handleConnected = () => {
      isConnectedRef.current = true;
      callbacksRef.current?.onConnected?.();
    };

    const handleDisconnected = () => {
      isConnectedRef.current = false;
      callbacksRef.current?.onDisconnected?.();
    };

    const handleError = (error: Error) => {
      callbacksRef.current?.onError?.(error);
    };

    // Register event handlers
    boardSignalRService.on('onBoardUpdate', handleBoardUpdate);
    boardSignalRService.on('onTemplateMarketplaceUpdate', handleTemplateMarketplaceUpdate);
    boardSignalRService.on('onSettingsSyncUpdate', handleSettingsSyncUpdate);
    boardSignalRService.on('onConnected', handleConnected);
    boardSignalRService.on('onDisconnected', handleDisconnected);
    boardSignalRService.on('onError', handleError);

    return () => {
      // Clean up event handlers
      boardSignalRService.off('onBoardUpdate');
      boardSignalRService.off('onTemplateMarketplaceUpdate');
      boardSignalRService.off('onSettingsSyncUpdate');
      boardSignalRService.off('onConnected');
      boardSignalRService.off('onDisconnected');
      boardSignalRService.off('onError');
    };
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      boardSignalRService.startConnections().then((success) => {
        if (success) {
          isConnectedRef.current = true;
          
          // Auto-join board group if boardId provided
          if (boardId) {
            boardSignalRService.joinBoardGroup(boardId);
          }
          
          // Auto-join template marketplace if enabled
          if (enableTemplateMarketplace) {
            boardSignalRService.joinTemplateMarketplace();
          }
        }
      });
    }

    return () => {
      if (autoConnect) {
        // Leave board group on unmount
        if (boardId) {
          boardSignalRService.leaveBoardGroup(boardId);
        }
        
        // Leave template marketplace on unmount
        if (enableTemplateMarketplace) {
          boardSignalRService.leaveTemplateMarketplace();
        }
      }
    };
  }, [autoConnect, boardId, enableTemplateMarketplace]);

  // Handle board ID changes
  useEffect(() => {
    if (isConnectedRef.current && boardId) {
      boardSignalRService.joinBoardGroup(boardId);
      
      return () => {
        boardSignalRService.leaveBoardGroup(boardId);
      };
    }
  }, [boardId]);

  // Memoized functions
  const joinBoard = useCallback(async (boardId: number) => {
    await boardSignalRService.joinBoardGroup(boardId);
  }, []);

  const leaveBoard = useCallback(async (boardId: number) => {
    await boardSignalRService.leaveBoardGroup(boardId);
  }, []);

  const joinTemplateMarketplace = useCallback(async () => {
    await boardSignalRService.joinTemplateMarketplace();
  }, []);

  const leaveTemplateMarketplace = useCallback(async () => {
    await boardSignalRService.leaveTemplateMarketplace();
  }, []);

  const startConnections = useCallback(async () => {
    const success = await boardSignalRService.startConnections();
    if (success) {
      isConnectedRef.current = true;
    }
    return success;
  }, []);

  const disconnect = useCallback(async () => {
    await boardSignalRService.disconnect();
    isConnectedRef.current = false;
  }, []);

  return {
    isConnected: boardSignalRService.isConnected(),
    joinBoard,
    leaveBoard,
    joinTemplateMarketplace,
    leaveTemplateMarketplace,
    startConnections,
    disconnect
  };
} 