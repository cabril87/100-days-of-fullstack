'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Trash2, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Database,
  Clock,
  Zap,
  Settings,
  Activity,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cacheManager, CacheStatus, CacheEntry, CacheMetrics } from '@/lib/services/CacheManagerService';
import { cn } from '@/lib/utils/utils';

// ================================
// CACHE MANAGEMENT PANEL COMPONENT
// ================================

export default function CacheManagementPanel() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // ================================
  // DATA FETCHING
  // ================================

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [status, entries] = await Promise.all([
        cacheManager.getCacheStatus(),
        cacheManager.getCacheEntries()
      ]);
      
      setCacheStatus(status);
      setCacheEntries(entries);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh cache data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  // ================================
  // CACHE OPERATIONS
  // ================================

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all caches? This will reload the application.')) {
      return;
    }
    
    setActiveOperation('clearing');
    try {
      await cacheManager.clearUserCache();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache. Check console for details.');
    } finally {
      setActiveOperation(null);
    }
  };

  const handleForceRefresh = async () => {
    if (!confirm('This will unregister the service worker and perform a hard refresh. Continue?')) {
      return;
    }
    
    setActiveOperation('refreshing');
    try {
      await cacheManager.refreshApplication();
    } catch (error) {
      console.error('Failed to refresh application:', error);
      alert('Failed to refresh application. Check console for details.');
    } finally {
      setActiveOperation(null);
    }
  };

  const handleWarmCache = async () => {
    setActiveOperation('warming');
    try {
      await cacheManager.warmCriticalResources();
      await refreshData();
    } catch (error) {
      console.error('Failed to warm cache:', error);
      alert('Failed to warm cache. Check console for details.');
    } finally {
      setActiveOperation(null);
    }
  };

  const handleExportMetrics = () => {
    const data = cacheManager.exportCacheMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cache-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  const handleToggleDebugMode = () => {
    const isCurrentlyEnabled = localStorage.getItem('cache-debug') === 'true';
    
    if (isCurrentlyEnabled) {
      cacheManager.disableDebugMode();
    } else {
      cacheManager.enableDebugMode();
    }
    
    refreshData();
  };

  // ================================
  // UTILITY FUNCTIONS
  // ================================

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getCacheHealthStatus = (): 'healthy' | 'warning' | 'error' => {
    if (!cacheStatus) return 'error';
    
    if (!cacheStatus.isServiceWorkerRegistered || !cacheStatus.isServiceWorkerControlling) {
      return 'error';
    }
    
    if (cacheStatus.totalCacheSize > 100 * 1024 * 1024) { // 100MB
      return 'warning';
    }
    
    return 'healthy';
  };

  const getExpiredEntriesCount = (): number => {
    const now = new Date();
    return cacheEntries.filter(entry => entry.expiresAt < now).length;
  };

  // ================================
  // RENDER HELPERS
  // ================================

  const renderCacheOverview = () => {
    if (!cacheStatus) return null;

    const healthStatus = getCacheHealthStatus();
    const expiredCount = getExpiredEntriesCount();
    
    const healthConfig = {
      healthy: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
      warning: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle },
      error: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle }
    };
    
    const HealthIcon = healthConfig[healthStatus].icon;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Service Worker Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Worker</p>
                <p className={cn("text-lg font-bold", 
                  cacheStatus.isServiceWorkerControlling ? "text-green-600" : "text-red-600"
                )}>
                  {cacheStatus.isServiceWorkerControlling ? 'Active' : 'Inactive'}
                </p>
              </div>
              {cacheStatus.isServiceWorkerControlling ? 
                <Wifi className="h-8 w-8 text-green-600" /> : 
                <WifiOff className="h-8 w-8 text-red-600" />
              }
            </div>
          </CardContent>
        </Card>

        {/* Cache Health */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cache Health</p>
                <p className={cn("text-lg font-bold capitalize", healthConfig[healthStatus].color)}>
                  {healthStatus}
                </p>
              </div>
              <div className={cn("p-2 rounded-full", healthConfig[healthStatus].bg)}>
                <HealthIcon className={cn("h-6 w-6", healthConfig[healthStatus].color)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cache Size */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatBytes(cacheStatus.totalCacheSize)}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Environment */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Environment</p>
                <p className={cn("text-lg font-bold capitalize",
                  cacheStatus.environmentMode === 'development' ? "text-orange-600" : "text-green-600"
                )}>
                  {cacheStatus.environmentMode}
                </p>
              </div>
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCacheActions = () => {
    const debugModeEnabled = localStorage.getItem('cache-debug') === 'true';
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cache Operations
          </CardTitle>
          <CardDescription>
            Manage and monitor your application cache
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={refreshData}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh Data
            </Button>

            <Button
              onClick={handleWarmCache}
              disabled={activeOperation !== null}
              variant="outline"
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              {activeOperation === 'warming' ? 'Warming...' : 'Warm Cache'}
            </Button>

            <Button
              onClick={handleClearCache}
              disabled={activeOperation !== null}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {activeOperation === 'clearing' ? 'Clearing...' : 'Clear Cache'}
            </Button>

            <Button
              onClick={handleForceRefresh}
              disabled={activeOperation !== null}
              variant="destructive"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {activeOperation === 'refreshing' ? 'Refreshing...' : 'Force Refresh'}
            </Button>

            <Button
              onClick={handleExportMetrics}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Metrics
            </Button>

            <Button
              onClick={handleToggleDebugMode}
              variant={debugModeEnabled ? "default" : "outline"}
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              {debugModeEnabled ? 'Disable Debug' : 'Enable Debug'}
            </Button>
          </div>

          {cacheStatus && (
            <div className="mt-4 text-sm text-gray-500">
              Last updated: {formatRelativeTime(lastUpdated)} • 
              Version: {cacheStatus.cacheVersion} • 
              Caches: {cacheStatus.cacheNames.length}
              {cacheStatus.lastCleanup && (
                <> • Last cleanup: {formatRelativeTime(cacheStatus.lastCleanup)}</>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderCacheEntries = () => {
    const expiredEntries = cacheEntries.filter(entry => entry.expiresAt < new Date());
    const activeEntries = cacheEntries.filter(entry => entry.expiresAt >= new Date());

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Cache Entries ({cacheEntries.length})
          </CardTitle>
          <CardDescription>
            Detailed view of all cached resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expiredEntries.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">
                  {expiredEntries.length} expired {expiredEntries.length === 1 ? 'entry' : 'entries'} found
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {cacheEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No cache entries found
              </div>
            ) : (
              cacheEntries.map((entry, index) => {
                const isExpired = entry.expiresAt < new Date();
                const url = new URL(entry.url);
                const pathOnly = url.pathname + url.search;

                return (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      isExpired 
                        ? "bg-red-50 border-red-200" 
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm font-mono text-gray-900 truncate">
                            {pathOnly}
                          </code>
                          <Badge variant={isExpired ? "destructive" : "secondary"} className="text-xs">
                            {entry.strategy}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {formatBytes(entry.size)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Cached: {formatRelativeTime(entry.cachedAt)}
                          </span>
                          <span className={cn(
                            "flex items-center gap-1",
                            isExpired ? "text-red-600" : "text-gray-500"
                          )}>
                            <Clock className="h-3 w-3" />
                            {isExpired ? 'Expired' : `Expires: ${formatRelativeTime(entry.expiresAt)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // ================================
  // MAIN RENDER
  // ================================

  if (isLoading && !cacheStatus) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg">Loading cache status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cache Management</h1>
        <p className="text-gray-600">
          Monitor and manage the application cache system for optimal performance
        </p>
      </div>

      {/* Overview Cards */}
      {renderCacheOverview()}

      {/* Cache Actions */}
      {renderCacheActions()}

      {/* Detailed Tabs */}
      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Cache Entries</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          {renderCacheEntries()}
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Cache performance and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Metrics collection is in development</p>
                <p className="text-sm">Enable debug mode to see detailed metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>
                Technical details for developers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Cache Status</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(cacheStatus, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Browser Support</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Service Worker:</span>{' '}
                      <Badge variant={('serviceWorker' in navigator) ? "default" : "destructive"}>
                        {('serviceWorker' in navigator) ? 'Supported' : 'Not Supported'}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Cache API:</span>{' '}
                      <Badge variant={('caches' in window) ? "default" : "destructive"}>
                        {('caches' in window) ? 'Supported' : 'Not Supported'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 