'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  Users,
  Plus,
  Settings,
  Home,
  Clock,
  Trophy
} from 'lucide-react';

type TabType = 'collaboration' | 'tasks' | 'overview';

interface FamilyActionsProps {
  isLoading: boolean;
  onCreateTask: () => void;
  onRefreshData: () => void;
  onTabChange: (tab: TabType) => void;
}

/**
 * Family Actions Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Card with CardHeader and CardContent
 * - Grid: grid-cols-1 md:grid-cols-2 with gap-4
 * - Button groups with flex-wrap and gap-2
 * - Buttons with responsive text and icons
 * - Icons: h-4 w-4 (16px)
 * 
 * Total estimated width: Full width with responsive grid
 */
export default function FamilyActions({
  isLoading,
  onCreateTask,
  onRefreshData,
  onTabChange
}: FamilyActionsProps) {
  const router = useRouter();

  return (
    <Card className="max-w-full overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Family Actions</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Quick actions for family and task management
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 max-w-full overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Task Management Actions */}
          <div className="space-y-3 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
              <Target className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="truncate">Task Management</span>
            </h4>
            <div className="flex flex-wrap gap-2 min-w-0">
              <Button 
                onClick={onCreateTask}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs sm:text-sm"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create Task</span>
                <span className="sm:hidden">Create</span>
              </Button>
              <Button 
                onClick={() => onTabChange('tasks')} 
                variant="outline"
                className="text-xs sm:text-sm"
              >
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Manage Tasks</span>
                <span className="sm:hidden">Manage</span>
              </Button>
              <Button 
                onClick={() => onTabChange('collaboration')} 
                variant="outline"
                className="text-xs sm:text-sm"
              >
                <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
            </div>
          </div>

          {/* Family Management Actions */}
          <div className="space-y-3 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm sm:text-base">
              <Users className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span className="truncate">Family Management</span>
            </h4>
            <div className="flex flex-wrap gap-2 min-w-0">
              <Button 
                onClick={() => router.push('/settings/family')} 
                variant="outline"
                className="text-xs sm:text-sm"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Family Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')} 
                variant="outline"
                className="text-xs sm:text-sm"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
              <Button 
                onClick={onRefreshData} 
                variant="outline" 
                disabled={isLoading}
                className="text-xs sm:text-sm"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh Data'}</span>
                <span className="sm:hidden">{isLoading ? 'Loading...' : 'Refresh'}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
