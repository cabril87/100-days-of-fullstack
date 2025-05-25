import { useEffect, useRef, useState } from 'react';
import { useToast } from './useToast';
import { signalRService } from '@/lib/services/signalRService';

interface GamificationUpdate {
  type: 'points_earned' | 'achievement_unlocked' | 'level_up' | 'streak_updated' | 'challenge_progress' | 'badge_earned' | 'reward_redeemed';
  data: any;
  userId: number;
  timestamp: string;
  message?: string;
}

interface UseWebSocketOptions {
  onUpdate?: (update: GamificationUpdate) => void;
  reconnectInterval?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { onUpdate } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { showToast } = useToast();
  
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

    const handleConnection = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
    };

    const handleDisconnection = () => {
      setIsConnected(false);
    };

    const handleError = (error: Error) => {
      setIsConnected(false);
    };

    const handleGamificationUpdate = (update: GamificationUpdate) => {
      onUpdate?.(update);
      
      // Show real-time notifications based on update type
      if (update.message) {
        if (update.type === 'points_earned') {
          showToast(update.message, 'success');
        } else if (update.type === 'achievement_unlocked') {
          showToast(update.message, 'success');
        } else if (update.type === 'level_up') {
          showToast(update.message, 'success');
        } else if (update.type === 'badge_earned') {
          showToast(update.message, 'success');
        } else if (update.type === 'challenge_progress') {
          if (update.data.isCompleted) {
            showToast(update.message, 'success');
          }
        } else if (update.type === 'streak_updated') {
          if (update.data.isNewRecord) {
            showToast(update.message, 'success');
          }
        }
      }
    };

    // Set up SignalR event listeners
    signalRService.on('onConnected', handleConnection);
    signalRService.on('onDisconnected', handleDisconnection);
    signalRService.on('onError', handleError);
    signalRService.on('onGamificationUpdate', handleGamificationUpdate);

    // Connect if not already connected
    if (!signalRService.isConnected()) {
      signalRService.startConnection().then((connected: boolean) => {
        if (connected) {
          setIsConnected(true);
        }
      });
    } else {
      setIsConnected(true);
    }

    return () => {
      signalRService.off('onConnected');
      signalRService.off('onDisconnected');
      signalRService.off('onError');
      signalRService.off('onGamificationUpdate');
    };
  }, [onUpdate, showToast]);
  
  const disconnect = () => {
    signalRService.disconnect();
  };
  
  return {
    isConnected,
    reconnectAttempts,
    disconnect
  };
}; 