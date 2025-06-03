/**
 * React Hook for Board SignalR Integration
 * 
 * Provides real-time board updates, analytics, and template marketplace features
 */

import { useEffect, useCallback, useRef, useState } from 'react';
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

  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef(callbacks);
  const currentBoardIdRef = useRef<number | undefined>(undefined);
  const isInitializedRef = useRef(false);

  // Update callbacks ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Set up event handlers - only once
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
      setIsConnected(true);
      callbacksRef.current?.onConnected?.();
    };

    const handleDisconnected = () => {
      setIsConnected(false);
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

    // Initial connection status
    setIsConnected(boardSignalRService.isConnected());

    return () => {
      // Clean up event handlers
      boardSignalRService.off('onBoardUpdate');
      boardSignalRService.off('onTemplateMarketplaceUpdate');
      boardSignalRService.off('onSettingsSyncUpdate');
      boardSignalRService.off('onConnected');
      boardSignalRService.off('onDisconnected');
      boardSignalRService.off('onError');
    };
  }, []); // Empty dependency array - only run once

  // SINGLE effect for connection and board management
  useEffect(() => {
    if (!autoConnect) return;

    const initializeConnection = async () => {
      if (!isInitializedRef.current) {
        // Start connection if not already connected
        if (!boardSignalRService.isConnected()) {
          const success = await boardSignalRService.startConnections();
          setIsConnected(success);
        } else {
          setIsConnected(true);
        }
        isInitializedRef.current = true;
      }

      // Handle board ID changes
      if (boardId && boardId !== currentBoardIdRef.current) {
        // Leave previous board if any
        if (currentBoardIdRef.current) {
          await boardSignalRService.leaveBoardGroup(currentBoardIdRef.current);
        }
        
        // Join new board
        if (boardSignalRService.isConnected()) {
          await boardSignalRService.joinBoardGroup(boardId);
          currentBoardIdRef.current = boardId;
        }
      } else if (!boardId && currentBoardIdRef.current) {
        // Leave board if boardId becomes undefined
        await boardSignalRService.leaveBoardGroup(currentBoardIdRef.current);
        currentBoardIdRef.current = undefined;
      }

      // Handle template marketplace
      if (enableTemplateMarketplace && boardSignalRService.isConnected()) {
        await boardSignalRService.joinTemplateMarketplace();
      }
    };

    initializeConnection();

    return () => {
      // Cleanup on unmount or dependencies change
      if (currentBoardIdRef.current) {
        boardSignalRService.leaveBoardGroup(currentBoardIdRef.current);
        currentBoardIdRef.current = undefined;
      }
      
      if (enableTemplateMarketplace) {
        boardSignalRService.leaveTemplateMarketplace();
      }
    };
  }, [autoConnect, boardId, enableTemplateMarketplace]); // Controlled dependencies

  // Memoized functions
  const joinBoard = useCallback(async (boardId: number) => {
    if (boardSignalRService.isConnected()) {
      await boardSignalRService.joinBoardGroup(boardId);
      currentBoardIdRef.current = boardId;
    }
  }, []);

  const leaveBoard = useCallback(async (boardId: number) => {
    if (boardSignalRService.isConnected()) {
      await boardSignalRService.leaveBoardGroup(boardId);
      if (currentBoardIdRef.current === boardId) {
        currentBoardIdRef.current = undefined;
      }
    }
  }, []);

  const joinTemplateMarketplace = useCallback(async () => {
    if (boardSignalRService.isConnected()) {
      await boardSignalRService.joinTemplateMarketplace();
    }
  }, []);

  const leaveTemplateMarketplace = useCallback(async () => {
    if (boardSignalRService.isConnected()) {
      await boardSignalRService.leaveTemplateMarketplace();
    }
  }, []);

  const startConnections = useCallback(async () => {
    const success = await boardSignalRService.startConnections();
    setIsConnected(success);
    return success;
  }, []);

  const disconnect = useCallback(async () => {
    await boardSignalRService.disconnect();
    setIsConnected(false);
    currentBoardIdRef.current = undefined;
    isInitializedRef.current = false;
  }, []);

  return {
    isConnected,
    joinBoard,
    leaveBoard,
    joinTemplateMarketplace,
    leaveTemplateMarketplace,
    startConnections,
    disconnect
  };
} 