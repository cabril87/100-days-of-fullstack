'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useAuth } from '@/lib/providers/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Users, 
  Server,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Eye,
  RefreshCw,
  Download,
} from 'lucide-react';
import { securityService } from '@/lib/services/securityService';
import { SecurityDashboard as SecurityDashboardType } from '@/lib/types/security';
import { useToast } from '@/lib/hooks/useToast';

// Import all admin components
import { SecurityOverview } from '@/components/admin/SecurityOverview';
import { SecurityMetrics } from '@/components/admin/SecurityMetrics';
import { RateLimitStatus } from '@/components/admin/RateLimitStatus';
import { PerformanceMetrics } from '@/components/admin/PerformanceMetrics';
import { SecurityAuditLogs } from '@/components/admin/SecurityAuditLogs';
import { SecurityAlerts } from '@/components/admin/SecurityAlerts';
import { EnhancedSecurity } from '@/components/admin/EnhancedSecurity';
import { EnhancedSystemHealth } from '@/components/admin/EnhancedSystemHealth';
import SecurityDashboard from '@/components/admin/SecurityDashboard';
import SessionManagement from '@/components/admin/SessionManagement';

function AdminDashboardContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dashboardData, setDashboardData] = useState<SecurityDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false); // Disabled by default to avoid annoying refreshes
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds when enabled

  // Debug logging
  useEffect(() => {
    console.log('[AdminDashboard] autoRefresh state changed:', autoRefresh);
  }, [autoRefresh]);

  // Check if user is admin
  const isAdmin = user?.email === 'admin@tasktracker.com' || user?.role === 'Admin';

  // Get current tab from URL or default to 'overview'
  const currentTab = searchParams.get('tab') || 'overview';

  // Handle tab change with URL update
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    router.push(`/admin?${params.toString()}`);
  };

  // Fetch dashboard data - using useRef to avoid dependency issues
  const fetchDashboardDataRef = useRef<((showLoadingState?: boolean) => Promise<void>) | null>(null);
  
  const fetchDashboardData = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);

             const data = await securityService.getDashboardData();
       
      // Debug logging
      console.log('[AdminDashboard] Received data:', {
        hasOverview: !!data?.overview,
        securityScore: data?.overview?.securityScore,
        hasSystemHealth: !!data?.systemHealth,
        timestamp: new Date().toISOString()
      });
       
      if (data && data.overview && data.systemHealth) {
         setDashboardData(data);
         setLastUpdated(new Date());
         
         if (!showLoadingState) {
           showToast('Dashboard data refreshed successfully', 'success');
         }
       } else {
        throw new Error('Incomplete data received from server');
       }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      console.error('Dashboard fetch error:', err);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, [showToast]);

  // Update ref when function changes
  useEffect(() => {
    fetchDashboardDataRef.current = fetchDashboardData;
  }, [fetchDashboardData]);

  // Manual refresh
  const handleRefresh = () => {
    fetchDashboardDataRef.current?.(false);
  };

  // Export dashboard data
  const handleExport = async () => {
    try {
      const dataToExport = {
        timestamp: new Date().toISOString(),
        dashboardData,
        exportedBy: user?.email,
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast('Dashboard data exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export dashboard data', 'error');
    }
  };

  // Initial data fetch - wait for auth to complete
  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchDashboardData();
    }
  }, [authLoading, isAdmin, fetchDashboardData]);

  // Auto-refresh setup - removed fetchDashboardData from dependencies
  useEffect(() => {
    if (!autoRefresh || !isAdmin || authLoading) {
      return;
    }

    console.log('[AdminDashboard] Setting up auto-refresh interval:', refreshInterval);
    const interval = setInterval(() => {
      console.log('[AdminDashboard] Auto-refresh triggered');
      fetchDashboardDataRef.current?.(false);
    }, refreshInterval);

    return () => {
      console.log('[AdminDashboard] Clearing auto-refresh interval');
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, isAdmin, authLoading]);

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-gray-800">Checking Authentication</span>
                <p className="text-sm text-gray-600 mt-1">Verifying admin access...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect if not admin (only after auth is loaded)
  if (!authLoading && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Only administrators can access this page. Please contact your system administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state - show spinner while loading OR while data is incomplete
  if (loading || !dashboardData || !dashboardData.overview || !dashboardData.systemHealth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-gray-800">Loading Admin Dashboard</span>
                <p className="text-sm text-gray-600 mt-1">Fetching security and performance data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Error Loading Dashboard
            </CardTitle>
            <CardDescription>
              Failed to load admin dashboard data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchDashboardData()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Final safety check - ensure all required data exists
  if (!dashboardData?.overview || !dashboardData?.systemHealth) {
    console.error('[AdminDashboard] Missing required data structure:', {
      hasOverview: !!dashboardData?.overview,
      hasSystemHealth: !!dashboardData?.systemHealth,
      hasAlerts: !!dashboardData?.alerts
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-red-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-gray-800">Initializing Dashboard</span>
                <p className="text-sm text-gray-600 mt-1">Preparing dashboard components...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header - Gamification Enhanced */}
        <div className="mb-8 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-purple-50 to-blue-50 dark:from-red-900/10 dark:via-purple-900/10 dark:to-blue-900/10 rounded-2xl -z-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="flex items-center justify-between p-6 relative">
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white flex items-center gap-4 mb-2">
                <div className="p-3 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-2xl shadow-xl">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <span className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium ml-16">
                🛡️ Security & Performance Monitoring System
              </p>
              <div className="flex items-center gap-4 mt-3 ml-16">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  LIVE MONITORING
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold">
                  <CheckCircle className="w-3 h-3" />
                  ADMIN ACCESS
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <div className="font-medium">Last updated:</div>
                <div className="font-bold">{lastUpdated?.toLocaleTimeString()}</div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4" />
                Hard Refresh
              </Button>
              
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  autoRefresh 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg' 
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                }`}
              >
                <Activity className="h-4 w-4" />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats - Gamification Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-300/10 to-indigo-300/10 rounded-full translate-y-8 -translate-x-8"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-800 uppercase tracking-wide">Security Score</p>
                  <p className="text-3xl font-black text-blue-900 tracking-tight">
                    {dashboardData?.overview?.securityScore || 0}/100
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-blue-700">PROTECTED</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-green-300/10 to-emerald-300/10 rounded-full translate-y-8 -translate-x-8"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800 uppercase tracking-wide">Active Users</p>
                  <p className="text-3xl font-black text-green-900 tracking-tight">
                    {dashboardData?.overview?.activeUsers || 0}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-green-700">ONLINE</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 via-red-100 to-rose-100 border-red-200 hover:border-red-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400/20 to-rose-400/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-red-300/10 to-rose-300/10 rounded-full translate-y-8 -translate-x-8"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-800 uppercase tracking-wide">Active Alerts</p>
                  <p className="text-3xl font-black text-red-900 tracking-tight">
                    {(dashboardData?.alerts || []).filter(alert => !alert.isResolved).length}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-red-700">MONITORING</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100 border-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-300/10 to-violet-300/10 rounded-full translate-y-8 -translate-x-8"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-800 uppercase tracking-wide">System Health</p>
                  <p className="text-3xl font-black text-purple-900 tracking-tight capitalize">
                    {dashboardData?.systemHealth?.status || 'unknown'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      dashboardData?.systemHealth?.status === 'healthy' ? 'bg-green-500' :
                      dashboardData?.systemHealth?.status === 'degraded' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs font-bold text-purple-700">SYSTEM</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs - Gamification Enhanced */}
        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-lg">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="enhanced-security" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Shield className="h-4 w-4" />
              Enhanced
            </TabsTrigger>
            <TabsTrigger 
              value="performance" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="rate-limits" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Clock className="h-4 w-4" />
              Rate Limits
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Server className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger 
              value="audit-logs" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Activity className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
            <TabsTrigger 
              value="alerts" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger 
              value="security-dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Shield className="h-4 w-4" />
              Security Hub
            </TabsTrigger>
            <TabsTrigger 
              value="sessions" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl font-bold"
            >
              <Users className="h-4 w-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SecurityOverview data={dashboardData} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityMetrics data={dashboardData} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics data={dashboardData} />
          </TabsContent>

          <TabsContent value="rate-limits" className="space-y-6">
            <RateLimitStatus data={dashboardData} />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <EnhancedSystemHealth data={dashboardData} />
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-6">
            <SecurityAuditLogs />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <SecurityAlerts data={dashboardData} />
          </TabsContent>

          <TabsContent value="enhanced-security" className="space-y-6">
            <EnhancedSecurity data={dashboardData} />
          </TabsContent>

          <TabsContent value="security-dashboard" className="space-y-6">
            <SecurityDashboard />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionManagement />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <p>Admin Dashboard v1.0 • Last updated: {lastUpdated?.toLocaleString()}</p>
              <p>Logged in as: {user?.email} ({user?.role || 'Admin'})</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  dashboardData?.systemHealth?.status === 'healthy' ? 'bg-green-500' :
                  dashboardData?.systemHealth?.status === 'degraded' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}></div>
                <span>System {dashboardData?.systemHealth?.status || 'unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>Auto-refresh {autoRefresh ? 'enabled' : 'disabled'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-gray-800">Loading Admin Dashboard</span>
                <p className="text-sm text-gray-600 mt-1">Please wait...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
} 