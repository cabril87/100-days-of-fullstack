'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  // HardDrive, // Available for future storage display 
  RefreshCw, 
  Trash2, 
  Settings, 
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/helpers/utils/utils';
import { useCacheMonitor } from '@/lib/hooks/useCacheManager';

// ================================
// CACHE STATUS WIDGET COMPONENT
// ================================

export default function CacheStatusWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOperating, setIsOperating] = useState(false);
  
  const {
    isInitialized,
    cacheStatus,
    cacheSizeWarning,
    shouldShowClearCacheNotification,
    totalCacheSizeMB
  } = useCacheMonitor();

  // Don't show widget if cache is not supported or not initialized
  if (!isInitialized || !cacheStatus) {
    return null;
  }

  // ================================
  // CACHE OPERATIONS
  // ================================

  const handleClearCache = async () => {
    if (!confirm('Clear all cache data? This will reload the page.')) {
      return;
    }

    setIsOperating(true);
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reload page
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache. Please try again.');
    } finally {
      setIsOperating(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const openCacheDebug = () => {
    window.open('/cache-debug.html', '_blank');
  };

  // ================================
  // RENDER HELPERS
  // ================================

  const getCacheHealthIcon = () => {
    if (!cacheStatus.isServiceWorkerControlling) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    switch (cacheSizeWarning) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getCacheHealthText = () => {
    if (!cacheStatus.isServiceWorkerControlling) {
      return 'Offline';
    }
    
    switch (cacheSizeWarning) {
      case 'critical':
        return 'Storage Full';
      case 'warning':
        return 'Storage High';
      default:
        return 'Healthy';
    }
  };

  const getCacheHealthColor = () => {
    if (!cacheStatus.isServiceWorkerControlling) return 'text-red-600';
    
    switch (cacheSizeWarning) {
      case 'critical':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // ================================
  // MAIN RENDER
  // ================================

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-64 shadow-lg border-2 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-3">
          {/* Header with status */}
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              {getCacheHealthIcon()}
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Cache Status
                </div>
                <div className={cn("text-xs", getCacheHealthColor())}>
                  {getCacheHealthText()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {formatCacheSize(cacheStatus.totalCacheSize)}
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-3 space-y-3 border-t pt-3">
              {/* Cache stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">Environment</div>
                  <div className="font-medium capitalize">
                    {cacheStatus.environmentMode}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Version</div>
                  <div className="font-medium font-mono text-xs">
                    {cacheStatus.cacheVersion.slice(0, 8)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Caches</div>
                  <div className="font-medium">
                    {cacheStatus.cacheNames.length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Service Worker</div>
                  <div className="flex items-center gap-1">
                    {cacheStatus.isServiceWorkerControlling ? (
                      <Wifi className="h-3 w-3 text-green-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-xs">
                      {cacheStatus.isServiceWorkerControlling ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {(shouldShowClearCacheNotification || cacheSizeWarning !== 'none') && (
                <div className="space-y-2">
                  {shouldShowClearCacheNotification && (
                    <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                      Cache hasn&apos;t been cleaned in a while. Consider clearing it.
                    </div>
                  )}
                  
                  {cacheSizeWarning === 'critical' && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      Cache size is very large ({totalCacheSizeMB}MB). Clear to free space.
                    </div>
                  )}
                  
                  {cacheSizeWarning === 'warning' && (
                    <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                      Cache size is large ({totalCacheSizeMB}MB). Monitor usage.
                    </div>
                  )}
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={handleRefresh}
                  disabled={isOperating}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={handleClearCache}
                  disabled={isOperating}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {isOperating ? 'Clearing...' : 'Clear'}
                </Button>
                
                {cacheStatus.environmentMode === 'development' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-2"
                    onClick={openCacheDebug}
                    title="Open cache debug tools"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Last update info */}
              {cacheStatus.lastCleanup && (
                <div className="text-xs text-gray-500 text-center">
                  Last cleanup: {new Date(cacheStatus.lastCleanup).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ================================
// CACHE STATUS INDICATOR (Minimal)
// ================================

export function CacheStatusIndicator() {
  const { cacheStatus, cacheSizeWarning } = useCacheMonitor();

  if (!cacheStatus) return null;

  const getIndicatorColor = () => {
    if (!cacheStatus.isServiceWorkerControlling) return 'bg-red-500';
    
    switch (cacheSizeWarning) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn(
        "w-3 h-3 rounded-full animate-pulse",
        getIndicatorColor()
      )} 
      title={`Cache: ${cacheStatus.isServiceWorkerControlling ? 'Active' : 'Inactive'}`}
      />
    </div>
  );
} 
