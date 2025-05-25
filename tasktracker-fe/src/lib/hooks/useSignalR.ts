import { useState, useEffect, useCallback } from 'react';
import { signalRService } from '@/lib/services/signalRService';
import { SignalREvents } from '@/lib/types/signalr';

interface UseSignalRReturn {
  isConnected: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  on: <K extends keyof SignalREvents>(event: K, callback: SignalREvents[K]) => void;
  off: <K extends keyof SignalREvents>(event: K) => void;
}

export const useSignalR = (): UseSignalRReturn => {
  const [isConnected, setIsConnected] = useState(signalRService.isConnected());

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return;
    }

    // Check if SignalR is enabled (default is enabled when authenticated)
    const signalREnabled = process.env.NEXT_PUBLIC_SIGNALR_ENABLED !== 'false';
    if (!signalREnabled) {
      return;
    }

    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);
    const handleError = (error: Error) => {
      setIsConnected(false);
    };

    // Set up event listeners
    signalRService.on('onConnected', handleConnection);
    signalRService.on('onDisconnected', handleDisconnection);
    signalRService.on('onError', handleError);
    
    // Connect if not already connected
    if (!signalRService.isConnected()) {
      signalRService.startConnection();
    } else {
      setIsConnected(true);
    }

    return () => {
      signalRService.off('onConnected');
      signalRService.off('onDisconnected');
      signalRService.off('onError');
    };
  }, []);

  const connect = useCallback(async () => {
    return await signalRService.startConnection();
  }, []);

  const disconnect = useCallback(async () => {
    await signalRService.disconnect();
  }, []);

  const on = useCallback(<K extends keyof SignalREvents>(event: K, callback: SignalREvents[K]) => {
    signalRService.on(event, callback);
  }, []);

  const off = useCallback(<K extends keyof SignalREvents>(event: K) => {
    signalRService.off(event);
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    on,
    off
  };
}; 