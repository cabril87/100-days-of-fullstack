'use client';

import React from 'react';
import { BarChart3, ListTodo, Users } from 'lucide-react';

type TabType = 'collaboration' | 'tasks' | 'overview';

interface DetailTabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

/**
 * Detail Tab Navigation Component - MOBILE SAFE + DESKTOP ENHANCED
 * 
 * MOBILE OPTIMIZATIONS (≤768px):
 * - No hover:scale-105 (prevents overflow)
 * - Compact padding: px-2 py-3
 * - Vertical layout with short labels
 * - Small emoji and icons
 * - Max width: 130px per tab (iPhone 12 Pro safe)
 * 
 * DESKTOP EXPERIENCE (>768px):
 * - Full hover:scale-105 effects
 * - Generous padding: px-6 py-5
 * - Horizontal layout with full labels
 * - Large emoji and shadow effects
 * - Full flex-1 distribution
 */
export default function DetailTabNavigation({
  activeTab,
  setActiveTab
}: DetailTabNavigationProps) {
  const tabs = [
    {
      id: 'collaboration' as TabType,
      label: 'Dashboard',
      icon: <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />,
      emoji: '📊',
      description: 'Analytics & insights'
    },
    {
      id: 'tasks' as TabType,
      label: 'Tasks',
      icon: <ListTodo className="h-4 w-4 sm:h-5 sm:w-5" />,
      emoji: '✅',
      description: 'Task management'
    },
    {
      id: 'overview' as TabType,
      label: 'Members',
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
      emoji: '👥',
      description: 'Family overview'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl shadow-lg md:shadow-xl border border-gray-200 md:border-2 dark:border-gray-700 overflow-hidden max-w-full">
      {/* Tab Buttons */}
      <div className="flex border-b border-gray-200 md:border-b-2 dark:border-gray-700 overflow-x-auto md:overflow-x-visible scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-4 md:px-6 md:py-5 text-xs md:text-base font-bold transition-all duration-200 md:duration-300 border-b-2 md:border-b-4 relative min-w-[90px] max-w-[120px] md:min-w-0 md:max-w-none md:transform md:hover:scale-105 ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700 dark:text-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 md:from-purple-100 md:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 md:dark:from-purple-900/40 md:dark:to-blue-900/40 md:shadow-lg'
                : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 md:hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {/* Mobile Layout - Icon Only */}
            <div className="flex flex-col items-center justify-center gap-1 min-w-0 md:hidden">
              <div className="flex items-center gap-1">
                <span className="text-lg flex-shrink-0">{tab.emoji}</span>
                {tab.icon}
              </div>
              <span className="font-semibold text-xs truncate">
                {tab.label}
              </span>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-center gap-3 min-w-0">
              <span className="text-2xl flex-shrink-0">{tab.emoji}</span>
              <div className="flex items-center gap-2 min-w-0">
                {tab.icon}
                <span className="font-bold truncate">{tab.label}</span>
              </div>
            </div>
            
            {/* Active tab indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 md:w-12 h-0.5 md:h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-full md:shadow-lg"></div>
            )}
          </button>
        ))}
      </div>
      
      {/* Tab Content Description */}
      <div className="px-2 py-2 md:px-6 md:py-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t border-gray-200 dark:border-gray-700 max-w-full overflow-hidden">
        <p className="text-xs md:text-sm font-medium md:font-semibold text-gray-600 md:text-gray-700 dark:text-gray-400 md:dark:text-gray-300 text-center truncate">
          {activeTab === 'collaboration' && (
            <>
              <span className="md:hidden">📊 Analytics & productivity insights</span>
              <span className="hidden md:inline">📊 View family analytics, productivity dashboard, and insights</span>
            </>
          )}
          {activeTab === 'tasks' && (
            <>
              <span className="md:hidden">✅ Task management & assignment</span>
              <span className="hidden md:inline">✅ Comprehensive task management, assignment, and collaboration</span>
            </>
          )}
          {activeTab === 'overview' && (
            <>
              <span className="md:hidden">👥 Family members & settings</span>
              <span className="hidden md:inline">👥 View family member information, roles, and settings</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
} 
