import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { signalRService } from '@/lib/services/signalRService';

/**
 * Hook that automatically manages SignalR connection based on authentication status
 */
export const useAuthenticatedSignalR = () => {
  const { isAuthenticated, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // User is not authenticated, disconnect if connected
      if (signalRService.isConnected()) {
        signalRService.disconnect();
        setIsConnected(false);
      }
      return;
    }

    // User is authenticated, establish connection
    const connectSignalR = async () => {
      if (signalRService.isConnected()) {
        setIsConnected(true);
        return;
      }

      setIsConnecting(true);
      try {
        const connected = await signalRService.startConnection();
        setIsConnected(connected);
        
        if (connected && user.id) {
          // Join user-specific group for gamification updates
          await signalRService.joinUserGroup(parseInt(user.id));
        }
      } catch (error) {
        console.error('Failed to connect to SignalR:', error);
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    // Set up event handlers
    const handleConnection = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnection = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleError = (error: Error) => {
      console.error('SignalR error:', error);
      setIsConnected(false);
      setIsConnecting(false);
    };

    signalRService.on('onConnected', handleConnection);
    signalRService.on('onDisconnected', handleDisconnection);
    signalRService.on('onError', handleError);

    connectSignalR();

    return () => {
      signalRService.off('onConnected');
      signalRService.off('onDisconnected');
      signalRService.off('onError');
    };
  }, [isAuthenticated, user]);

  return {
    isConnected,
    isConnecting,
    signalRService
  };
}; 