import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { NetworkStatusProps } from '@/lib/types/ui';

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  className = '',
  showText = true 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(false);
    };

    // Handle visibility change to check connection when tab becomes active
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isOnline) {
        setIsReconnecting(true);
        try {
          // Ping a fast endpoint to check connectivity
          await fetch('/api/health', { 
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache'
          });
          setIsOnline(true);
        } catch {
          setIsOnline(false);
        } finally {
          setIsReconnecting(false);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOnline]);

  const getStatusColor = () => {
    if (isReconnecting) return 'text-yellow-500';
    return isOnline ? 'text-green-500' : 'text-red-500';
  };

  const getStatusText = () => {
    if (isReconnecting) return 'Reconnecting...';
    return isOnline ? 'Online' : 'Offline';
  };

  const getIcon = () => {
    if (isReconnecting) return <Loader2 className="h-4 w-4 animate-spin" />;
    return isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${getStatusColor()} transition-colors duration-200`}>
        {getIcon()}
      </div>
      {showText && (
        <span className={`text-sm font-medium ${getStatusColor()} transition-colors duration-200`}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default NetworkStatus; 

