/**
 * Offline Status Indicator Component
 * 
 * Shows:
 * - Network connection status
 * - Sync progress and pending operations
 * - Offline capabilities status
 * - Cache status and controls
 */

import React, { useState, useEffect } from 'react';
import { useOfflineSupport } from '@/lib/hooks/useOfflineSupport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  RefreshCcw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Database,
  Trash2,
  RefreshCw,
  Zap,
  Signal,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function OfflineStatusIndicator({ 
  className, 
  showDetails = false, 
  compact = false 
}: OfflineStatusIndicatorProps) {
  const {
    isOnline,
    isOfflineCapable,
    serviceWorkerReady,
    pendingOperations,
    syncInProgress,
    lastSyncTime,
    cacheStatus,
    networkQuality,
    dataFreshness,
    syncPendingOperations,
    clearCache,
    testNetworkQuality
  } = useOfflineSupport();

  const [showDetailPanel, setShowDetailPanel] = useState(showDetails);
  const [lastSyncText, setLastSyncText] = useState<string>('Never');

  // Update last sync time text
  useEffect(() => {
    if (!lastSyncTime) {
      setLastSyncText('Never');
      return;
    }

    const updateSyncText = () => {
      const now = Date.now();
      const diff = now - lastSyncTime;
      
      if (diff < 60000) { // Less than 1 minute
        setLastSyncText('Just now');
      } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        setLastSyncText(`${minutes}m ago`);
      } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        setLastSyncText(`${hours}h ago`);
      } else {
        const days = Math.floor(diff / 86400000);
        setLastSyncText(`${days}d ago`);
      }
    };

    updateSyncText();
    const interval = setInterval(updateSyncText, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSyncTime]);

  // Get network status icon and color
  const getNetworkStatus = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        label: 'Offline',
        description: 'No internet connection'
      };
    }

    switch (networkQuality) {
      case 'fast':
        return {
          icon: <Wifi className="h-4 w-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          label: 'Online',
          description: 'Fast connection'
        };
      case 'slow':
        return {
          icon: <Signal className="h-4 w-4" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          label: 'Online',
          description: 'Slow connection'
        };
      default:
        return {
          icon: <Globe className="h-4 w-4" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          label: 'Online',
          description: 'Connected'
        };
    }
  };

  // Get sync status
  const getSyncStatus = () => {
    if (syncInProgress) {
      return {
        icon: <RefreshCcw className="h-4 w-4 animate-spin" />,
        color: 'text-blue-500',
        label: 'Syncing...',
        description: `Syncing ${pendingOperations.length} operations`
      };
    }

    if (pendingOperations.length > 0) {
      return {
        icon: <Clock className="h-4 w-4" />,
        color: 'text-orange-500',
        label: `${pendingOperations.length} pending`,
        description: `${pendingOperations.length} operations waiting to sync`
      };
    }

    return {
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-500',
      label: 'Synced',
      description: 'All data is synchronized'
    };
  };

  const networkStatus = getNetworkStatus();
  const syncStatus = getSyncStatus();

  // Compact view for header/navbar
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer",
                networkStatus.bgColor,
                className
              )}
              onClick={() => setShowDetailPanel(!showDetailPanel)}
            >
              <div className={networkStatus.color}>
                {networkStatus.icon}
              </div>
              
              {pendingOperations.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1 text-xs">
                  {pendingOperations.length}
                </Badge>
              )}
              
              {syncInProgress && (
                <div className="text-blue-500">
                  <RefreshCcw className="h-3 w-3 animate-spin" />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{networkStatus.label}</p>
              <p className="text-sm text-muted-foreground">{networkStatus.description}</p>
              {pendingOperations.length > 0 && (
                <p className="text-sm text-orange-600">
                  {pendingOperations.length} operations pending
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">Offline Status</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailPanel(!showDetailPanel)}
            >
              {showDetailPanel ? 'Hide Details' : 'Show Details'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", networkStatus.bgColor)}>
                <div className={networkStatus.color}>
                  {networkStatus.icon}
                </div>
              </div>
              <div>
                <p className="font-medium">{networkStatus.label}</p>
                <p className="text-sm text-muted-foreground">
                  {networkStatus.description}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testNetworkQuality}
              disabled={!isOnline}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>

          {/* Offline Capabilities */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-full",
                isOfflineCapable ? "bg-green-50" : "bg-gray-50"
              )}>
                <div className={isOfflineCapable ? "text-green-500" : "text-gray-400"}>
                  {isOfflineCapable ? (
                    <CloudOff className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium">
                  {isOfflineCapable ? 'Offline Ready' : 'Offline Not Available'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {serviceWorkerReady 
                    ? 'Service worker active' 
                    : 'Service worker not ready'}
                </p>
              </div>
            </div>
            {isOfflineCapable && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Zap className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>

          {/* Sync Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-50">
                <div className={syncStatus.color}>
                  {syncStatus.icon}
                </div>
              </div>
              <div>
                <p className="font-medium">{syncStatus.label}</p>
                <p className="text-sm text-muted-foreground">
                  Last sync: {lastSyncText}
                </p>
              </div>
            </div>
            {pendingOperations.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={syncPendingOperations}
                disabled={!isOnline || syncInProgress}
              >
                <RefreshCcw className={cn("h-4 w-4 mr-2", syncInProgress && "animate-spin")} />
                Sync Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {showDetailPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detailed Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pending Operations */}
            {pendingOperations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Pending Operations</h4>
                <div className="space-y-2">
                  {pendingOperations.slice(0, 5).map((operation) => (
                    <div 
                      key={operation.id}
                      className="flex items-center justify-between p-2 bg-orange-50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">
                          {operation.type.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {operation.priority}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {operation.retryCount}/{operation.maxRetries} retries
                      </span>
                    </div>
                  ))}
                  {pendingOperations.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ...and {pendingOperations.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cache Status */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Cache Status</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearCache()}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cache Size</p>
                    <p className="text-xs text-muted-foreground">
                      {cacheStatus.size} entries
                    </p>
                  </div>
                  <Badge variant="outline">
                    v{cacheStatus.version}
                  </Badge>
                </div>

                {/* Data Freshness */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Data Freshness</p>
                  {Object.entries(dataFreshness).map(([key, timestamp]) => {
                    const age = timestamp ? Date.now() - timestamp : null;
                    const ageText = age ? 
                      age < 60000 ? 'Just updated' :
                      age < 3600000 ? `${Math.floor(age / 60000)}m ago` :
                      age < 86400000 ? `${Math.floor(age / 3600000)}h ago` :
                      `${Math.floor(age / 86400000)}d ago`
                      : 'Never cached';
                    
                    return (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="capitalize">{key}:</span>
                        <span className={cn(
                          "text-muted-foreground",
                          age && age < 300000 && "text-green-600", // Fresh if < 5 minutes
                          age && age > 3600000 && "text-orange-600" // Stale if > 1 hour
                        )}>
                          {ageText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="font-medium mb-3">Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Network Quality:</span>
                  <Badge 
                    variant={
                      networkQuality === 'fast' ? 'default' :
                      networkQuality === 'slow' ? 'secondary' : 'outline'
                    }
                  >
                    {networkQuality}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Worker:</span>
                  <Badge variant={serviceWorkerReady ? 'default' : 'secondary'}>
                    {serviceWorkerReady ? 'Ready' : 'Not Ready'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Offline Support:</span>
                  <Badge variant={isOfflineCapable ? 'default' : 'secondary'}>
                    {isOfflineCapable ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 