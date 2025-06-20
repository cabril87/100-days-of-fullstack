'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Users,
  AlertTriangle,
  Rocket
} from 'lucide-react';
import { FamilyTaskDashboardProps } from '@/lib/types/component-props';
import { 
  FamilyTaskStats, 
  FamilyDashboardTab 
} from '@/lib/types/family-task';
import { familyTaskDashboardService } from '@/lib/services/familyTaskDashboardService';
import EnhancedCelebrationSystem from '@/components/gamification/EnhancedCelebrationSystem';
import { useTouchGestures, triggerHapticFeedback } from '@/components/search/MobileSearchEnhancements';

// Import separated components
import MobileControlBar from './dashboard/MobileControlBar';
import DashboardHeader from './dashboard/DashboardHeader';
import StatsGrid from './dashboard/StatsGrid';
import TabNavigation from './dashboard/TabNavigation';
import OverviewTab from './dashboard/OverviewTab';
import { LeaderboardTab, GoalsTab, AchievementsTab } from './dashboard/OtherTabs';

/**
 * MAIN FAMILY TASK DASHBOARD COMPONENT
 * 
 * OVERFLOW DEBUG: This is the main container component.
 * All child components have been separated for easier debugging.
 * Main container uses: p-1 sm:p-2 md:p-4 lg:p-6 max-w-full overflow-hidden
 * 
 * Components breakdown:
 * 1. MobileControlBar - Mobile controls (~200px width)
 * 2. DashboardHeader - Title and badges (full width flex)
 * 3. StatsGrid - 4 stat cards (responsive grid)
 * 4. TabNavigation - Tab buttons (~250px with scroll)
 * 5. Tab Content - Individual tab components
 */
export default function FamilyTaskDashboard({ family, familyMembers = [] }: FamilyTaskDashboardProps) {
  const [familyStats, setFamilyStats] = useState<FamilyTaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FamilyDashboardTab>('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [enableHaptic, setEnableHaptic] = useState(true);
  const [enableAnimations, setEnableAnimations] = useState(true);
  const [celebrationMode] = useState<'minimal' | 'moderate' | 'full' | 'maximum'>('moderate');
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Mobile detection and responsive setup
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch gesture support for mobile navigation
  const { onTouchStart, onTouchMove, onTouchEnd } = useTouchGestures((direction) => {
    if (!isMobile) return;
    
    const tabs: FamilyDashboardTab[] = ['overview', 'leaderboard', 'goals', 'achievements'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      triggerHapticFeedback('light');
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
      triggerHapticFeedback('light');
    }
  });

  // Load family task statistics from real API
  const loadFamilyTaskStats = useCallback(async () => {
    if (!family?.id) {
      console.warn('No family ID available for loading stats');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`📊 Loading real family task stats for family ${family.id}`);
      
      // Use real API service - NO MOCK DATA
      const stats = await familyTaskDashboardService.getFamilyTaskStats(
        family.id, 
        familyMembers
      );
      
      console.log('✅ Real family stats loaded:', stats);
      setFamilyStats(stats);
      
    } catch (error) {
      console.error('❌ Failed to load family task stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load family data');
      if (enableHaptic) {
        triggerHapticFeedback('error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [family?.id, familyMembers, enableHaptic]);

  useEffect(() => {
    if (family?.id) {
      loadFamilyTaskStats();
    }
  }, [family?.id, loadFamilyTaskStats]);

  if (!family) {
    return (
      <div className="space-y-6 p-4">
        <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <Users className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-800 dark:text-purple-200">
            Join or create a family to see the family task collaboration dashboard!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <MobileControlBar
          enableHaptic={enableHaptic}
          setEnableHaptic={setEnableHaptic}
          enableAnimations={enableAnimations}
          setEnableAnimations={setEnableAnimations}
        />
        
        {/* Enhanced Loading Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-blue-200 to-cyan-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-8 bg-gradient-to-r from-amber-200 to-orange-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Mobile-First Tab Navigation Skeleton */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2 md:space-x-8 overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 flex-shrink-0 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Mobile-Responsive Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded animate-pulse border-2 border-dashed border-gray-200"></div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded animate-pulse border-2 border-dashed border-purple-200"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4">
        <MobileControlBar
          enableHaptic={enableHaptic}
          setEnableHaptic={setEnableHaptic}
          enableAnimations={enableAnimations}
          setEnableAnimations={setEnableAnimations}
        />
        
        <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Failed to load family task data: {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => {
            loadFamilyTaskStats();
            if (enableHaptic) {
              triggerHapticFeedback('light');
            }
          }}
          variant="outline"
          className="w-full min-h-[44px] bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!familyStats) {
    return (
      <div className="space-y-6 p-4">
        <MobileControlBar
          enableHaptic={enableHaptic}
          setEnableHaptic={setEnableHaptic}
          enableAnimations={enableAnimations}
          setEnableAnimations={setEnableAnimations}
        />
        
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Unable to load family task data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div 
      ref={dashboardRef}
      className="space-y-2 sm:space-y-3 md:space-y-6 p-1 sm:p-2 md:p-4 lg:p-6 max-w-full overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Enhanced Celebration System */}
      <EnhancedCelebrationSystem
        userId={1} // TODO: Get from auth context
        familyId={family.id}
        enableToasts={true}
        enableConfetti={enableAnimations}
        enableCelebrationCards={true}
        enableSoundEffects={false}
        celebrationIntensity={celebrationMode}
        familyMemberAgeGroup="Adult"
        className="fixed inset-0 pointer-events-none z-50"
      />

      {/* Mobile Control Bar */}
      <MobileControlBar
        enableHaptic={enableHaptic}
        setEnableHaptic={setEnableHaptic}
        enableAnimations={enableAnimations}
        setEnableAnimations={setEnableAnimations}
      />

      {/* Dashboard Header */}
      <DashboardHeader
        family={family}
        familyMembers={familyMembers}
        familyStats={familyStats}
      />

      {/* Stats Grid */}
      <StatsGrid
        familyStats={familyStats}
        enableHaptic={enableHaptic}
        enableAnimations={enableAnimations}
      />

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        enableHaptic={enableHaptic}
        enableAnimations={enableAnimations}
      />

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <OverviewTab
            familyStats={familyStats}
            enableHaptic={enableHaptic}
            enableAnimations={enableAnimations}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardTab
            familyStats={familyStats}
            familyMembers={familyMembers}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsTab
            familyStats={familyStats}
            familyMembers={familyMembers}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsTab
            familyStats={familyStats}
          />
        )}
      </div>
    </div>
  );
} 