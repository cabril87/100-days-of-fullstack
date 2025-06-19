'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Eye, Zap, Smartphone, Monitor } from 'lucide-react';
import { DashboardProps } from '@/lib/types/widget-props';
import { DashboardMode } from '@/lib/types/ui-components';
import Dashboard from './Dashboard';
import SimpleDashboard from './SimpleDashboard';

export default function DashboardModeWrapper({ user, initialData }: DashboardProps) {
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('simple');

  // Load dashboard mode preference from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('tasktracker-dashboard-mode') as DashboardMode;
    if (savedMode && (savedMode === 'simple' || savedMode === 'advanced')) {
      setDashboardMode(savedMode);
    }
  }, []);

  // Save dashboard mode preference to localStorage
  const handleModeChange = useCallback((mode: DashboardMode) => {
    setDashboardMode(mode);
    localStorage.setItem('tasktracker-dashboard-mode', mode);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Mobile-First Responsive Dashboard Mode Toggle */}
        <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-cyan-900/20 shadow-lg">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            {/* Mobile Layout (Stacked) */}
            <div className="block lg:hidden space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl">
                  <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                    Dashboard Mode
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                    Choose your view
                  </p>
                </div>
              </div>
              
              {/* Mobile Toggle Buttons - Full Width */}
              <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <Button
                  variant={dashboardMode === 'simple' ? 'default' : 'ghost'}
                  size="default"
                  onClick={() => handleModeChange('simple')}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-md transition-all duration-200 min-h-[60px] ${
                    dashboardMode === 'simple' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium">Simple</span>
                </Button>
                
                <Button
                  variant={dashboardMode === 'advanced' ? 'default' : 'ghost'}
                  size="default"
                  onClick={() => handleModeChange('advanced')}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-md transition-all duration-200 min-h-[60px] ${
                    dashboardMode === 'advanced' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium">Advanced</span>
                </Button>
              </div>
            </div>

            {/* Desktop Layout (Horizontal) */}
            <div className="hidden lg:flex lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <LayoutGrid className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dashboard Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose your preferred view for family productivity
                  </p>
                </div>
              </div>
              
              {/* Desktop Toggle Buttons */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <Button
                  variant={dashboardMode === 'simple' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeChange('simple')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    dashboardMode === 'simple' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                  Simple
                </Button>
                
                <Button
                  variant={dashboardMode === 'advanced' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeChange('advanced')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    dashboardMode === 'advanced' 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  Advanced
                </Button>
              </div>
            </div>
            
            {/* Mobile-Responsive Mode Description */}
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                {dashboardMode === 'simple' ? (
                  <>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Simple Mode:</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      🎯 Clean, focused view perfect for busy families - essential tasks, XP, and quick actions
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Monitor className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Advanced Mode:</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      📊 Complete analytics dashboard with real-time widgets, detailed insights, and family collaboration
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditional Dashboard Rendering */}
        {dashboardMode === 'simple' ? (
          <SimpleDashboard 
            user={user} 
            initialData={initialData}
            onTaskCreated={() => {
              // Refresh dashboard data when task is created
              window.location.reload();
            }}
          />
        ) : (
          <Dashboard user={user} initialData={initialData} />
        )}
      </div>
    </div>
  );
} 