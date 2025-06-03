/**
 * Background Sync Manager Component
 * 
 * Provides background synchronization with:
 * - Automatic sync retry on network reconnection
 * - Visual sync status indicators
 * - Manual sync trigger
 * - Error handling and recovery
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useBackgroundSync } from '@/lib/hooks/useBackgroundSync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Zap,
  Activity
} from 'lucide-react';

interface BackgroundSyncManagerProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function BackgroundSyncManager({ 
  showDetails = false, 
  compact = false,
  className = ""
}: BackgroundSyncManagerProps) {
  const {
    state,
    triggerSync,
    retryOperation,
    clearCompleted,
    clearFailed,
    getSyncStats,
    isOnline,
    isSyncing,
    hasFailedOperations,
    hasPendingOperations,
    hasConflicts
  } = useBackgroundSync({
    enableBatching: true,
    batchSize: 5,
    maxRetries: 3,
    enableOptimisticUpdates: true,
    enableConflictDetection: true,
    onSyncComplete: (operation) => {
      console.log('[BackgroundSync] Operation completed:', operation.type);
    },
    onSyncError: (operation, error) => {
      console.error('[BackgroundSync] Operation failed:', operation.type, error);
    }
  });

  const [showFullStats, setShowFullStats] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'success' | 'error' | 'pending' | null>(null);

  const stats = getSyncStats();

  // Handle sync completion feedback
  useEffect(() => {
    if (!isSyncing && lastSyncStatus === 'pending') {
      if (hasFailedOperations) {
        setLastSyncStatus('error');
      } else {
        setLastSyncStatus('success');
      }
      
      // Clear status after 3 seconds
      const timeout = setTimeout(() => {
        setLastSyncStatus(null);
      }, 3000);
      
      return () => clearTimeout(timeout);
    } else if (isSyncing) {
      setLastSyncStatus('pending');
    }
  }, [isSyncing, hasFailedOperations]);

  const handleManualSync = useCallback(async () => {
    setLastSyncStatus('pending');
    await triggerSync();
  }, [triggerSync]);

  const handleRetryFailed = useCallback(() => {
    state.failed.forEach(operation => {
      retryOperation(operation.id);
    });
  }, [state.failed, retryOperation]);

  const getNetworkStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4 text-red-500" />;
    if (state.networkStatus === 'slow') return <Wifi className="h-4 w-4 text-yellow-500" />;
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getNetworkStatusText = () => {
    if (!isOnline) return 'Offline';
    if (state.networkStatus === 'slow') return 'Slow Connection';
    return 'Online';
  };

  const getSyncStatusIcon = () => {
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    if (lastSyncStatus === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (lastSyncStatus === 'error' || hasFailedOperations) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (hasPendingOperations) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-gray-400" />;
  };

  const getSyncStatusText = () => {
    if (isSyncing) return 'Syncing...';
    if (lastSyncStatus === 'success') return 'Synced';
    if (lastSyncStatus === 'error' || hasFailedOperations) return 'Sync Error';
    if (hasPendingOperations) return 'Pending';
    return 'Up to date';
  };

  // Compact view for headers/toolbars
  if (compact) {
    return (
      <TooltipProvider>
        <div className={`flex items-center gap-2 ${className}`}>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                {getNetworkStatusIcon()}
                {getSyncStatusIcon()}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div>Network: {getNetworkStatusText()}</div>
                <div>Sync: {getSyncStatusText()}</div>
                {hasPendingOperations && <div>Pending: {stats.pendingCount}</div>}
                {hasFailedOperations && <div>Failed: {stats.failedCount}</div>}
              </div>
            </TooltipContent>
          </Tooltip>
          
          {(hasPendingOperations || hasFailedOperations) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="h-6 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </TooltipProvider>
    );
  }

  // Full detailed view
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Background Sync
          </div>
          <div className="flex items-center gap-2">
            {getNetworkStatusIcon()}
            <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
              {getNetworkStatusText()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSyncStatusIcon()}
            <span className="text-sm font-medium">{getSyncStatusText()}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
            
            {hasFailedOperations && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryFailed}
                disabled={isSyncing}
                className="text-xs"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                Retry Failed
              </Button>
            )}
          </div>
        </div>

        {/* Sync Progress */}
        {(isSyncing || hasPendingOperations) && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sync Progress</span>
              <span>{stats.completedCount} / {stats.totalOperations}</span>
            </div>
            <Progress 
              value={stats.totalOperations > 0 ? (stats.completedCount / stats.totalOperations) * 100 : 0} 
              className="h-2"
            />
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground">Pending</div>
            <div className="text-sm font-semibold">{stats.pendingCount}</div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground">Success Rate</div>
            <div className="text-sm font-semibold">{Math.round(stats.successRate)}%</div>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground">Failed</div>
            <div className="text-sm font-semibold text-red-600">{stats.failedCount}</div>
          </div>
        </div>

        {/* Detailed Statistics (expandable) */}
        {showDetails && (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullStats(!showFullStats)}
              className="w-full text-xs"
            >
              {showFullStats ? 'Hide' : 'Show'} Detailed Stats
            </Button>
            
            {showFullStats && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Operations:</span>
                  <span>{stats.totalOperations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">In Progress:</span>
                  <span>{stats.inProgressCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="text-green-600">{stats.completedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span>
                    {stats.lastSyncTime 
                      ? new Date(stats.lastSyncTime).toLocaleTimeString()
                      : 'Never'
                    }
                  </span>
                </div>
                
                {hasConflicts && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-1 text-yellow-700">
                      <AlertCircle className="h-3 w-3" />
                      <span className="font-medium">Conflicts Detected</span>
                    </div>
                    <div className="text-yellow-600 text-xs mt-1">
                      Some operations have conflicts that require manual resolution.
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  {stats.completedCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCompleted}
                      className="text-xs flex-1"
                    >
                      Clear Completed
                    </Button>
                  )}
                  {stats.failedCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFailed}
                      className="text-xs flex-1"
                    >
                      Clear Failed
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>
            Background sync optimizes performance with {state.networkStatus === 'slow' ? 'reduced' : 'full'} features
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 