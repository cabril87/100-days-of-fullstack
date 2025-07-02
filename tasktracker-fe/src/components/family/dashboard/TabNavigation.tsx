'use client';

import React from 'react';
import { BarChart3, Trophy, Target, Award } from 'lucide-react';
import { FamilyDashboardTab } from '@/lib/types/family-task';
import { triggerHapticFeedback } from '@/lib/helpers/mobile';
import { cn } from '@/lib/helpers/utils/utils';
import confetti from 'canvas-confetti';

interface TabNavigationProps {
  activeTab: FamilyDashboardTab;
  setActiveTab: (tab: FamilyDashboardTab) => void;
  enableHaptic: boolean;
  enableAnimations: boolean;
}

/**
 * Tab Navigation Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Container with p-0.5 sm:p-1 padding (2px mobile)
 * - Nav with overflow-x-auto for horizontal scrolling
 * - 4 buttons with px-1.5 sm:px-3 md:px-4 padding
 * - Each button: min-h-[44px] for touch targets
 * - Icons: h-3 w-3 (12px mobile)
 * - Text: shortened for mobile (4 chars)
 * 
 * Total estimated width: ~250px on mobile with scroll
 */
export default function TabNavigation({
  activeTab,
  setActiveTab,
  enableHaptic,
  enableAnimations
}: TabNavigationProps) {
  const triggerTabChangeAnimation = (direction: 'next' | 'prev') => {
    if (!enableAnimations) return;
    
    confetti({
      particleCount: 30,
      spread: 50,
      startVelocity: 20,
      colors: ['#8B5CF6', '#EC4899', '#06B6D4'],
      origin: { x: direction === 'next' ? 0.8 : 0.2, y: 0.3 }
    });
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3, color: 'purple' },
    { key: 'leaderboard', label: 'Champions', icon: Trophy, color: 'amber' },
    { key: 'goals', label: 'Quests', icon: Target, color: 'blue' },
    { key: 'achievements', label: 'Trophies', icon: Award, color: 'green' }
  ] as const;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-t-lg p-0.5 sm:p-1 max-w-full overflow-hidden">
      <nav className="-mb-px flex space-x-1 sm:space-x-2 md:space-x-4 overflow-x-auto scrollbar-hide pb-1 min-w-0">
        {tabs.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key as FamilyDashboardTab);
              if (enableHaptic) triggerHapticFeedback('light');
              if (enableAnimations) triggerTabChangeAnimation('next');
            }}
            className={cn(
              "flex items-center gap-1 py-2 sm:py-3 px-1.5 sm:px-3 md:px-4 border-b-2 font-medium text-xs transition-all duration-200 flex-shrink-0",
              "min-h-[44px] rounded-t-lg min-w-0", // Enterprise touch targets
              activeTab === key
                ? `border-${color}-500 text-${color}-600 bg-${color}-50 dark:bg-${color}-900/20`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline text-xs sm:text-sm truncate">{label}</span>
            <span className="sm:hidden text-xs truncate max-w-[50px]">{label.substring(0, 4)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
} 
