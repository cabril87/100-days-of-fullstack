'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Settings,
  ArrowLeft,
  Home,
  Plus
} from 'lucide-react';
import { FamilyDTO } from '@/lib/types/family';

interface FamilyHeaderProps {
  family: FamilyDTO;
  isLoading: boolean;
  onCreateTask: () => void;
  onRefreshData: () => void;
}

/**
 * Family Header Component
 * 
 * OVERFLOW DEBUG: This component contains:
 * - Flex container with justify-between
 * - Left side: Back button + family info (flex-1 min-w-0)
 * - Right side: Action buttons (flex-shrink-0)
 * - Family name: text-2xl with truncate
 * - Buttons: responsive padding and text
 * 
 * Total estimated width: Full width with proper flex layout
 */
export default function FamilyHeader({
  family,
  isLoading,
  onCreateTask,
  onRefreshData
}: FamilyHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-full overflow-hidden">
      {/* Left side - Navigation and Family Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <Button 
          onClick={() => router.back()} 
          variant="ghost" 
          size="sm"
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
            <Home className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {family.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate">
              {family.description || 'No description provided'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Action Buttons */}
      <div className="flex flex-wrap gap-2 flex-shrink-0">
        {/* Create Family Task Button */}
        <Button 
          onClick={onCreateTask} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-300 text-xs sm:text-sm"
        >
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Create Family Task</span>
          <span className="sm:hidden">Create</span>
        </Button>
        
        <Button 
          onClick={onRefreshData} 
          variant="outline" 
          disabled={isLoading}
          className="text-xs sm:text-sm"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
        
        <Button 
          onClick={() => router.push('/settings/family')} 
          variant="outline"
          className="text-xs sm:text-sm"
        >
          <Settings className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Manage Family</span>
          <span className="sm:hidden">Manage</span>
        </Button>
      </div>
    </div>
  );
} 

