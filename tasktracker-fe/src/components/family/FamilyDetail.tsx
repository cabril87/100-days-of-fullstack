'use client';

/**
 * FAMILY DETAIL COMPONENT - SEPARATED FOR BETTER DEBUGGING
 * 
 * COMPONENT BREAKDOWN:
 * 1. FamilyHeader - Header with navigation and action buttons (~200px height)
 * 2. StatisticsCards - 4 gradient cards in responsive grid (~150px height)
 * 3. DetailTabNavigation - Tab navigation with descriptions (~120px height)
 * 4. FamilyLeaderboard - Member progress leaderboard (variable height)
 * 5. FamilyMembersList - List of family members (variable height)
 * 6. FamilyActions - Action buttons grid (~200px height)
 * 
 * OVERFLOW PROTECTION:
 * - Main container: p-3 sm:p-6 max-w-full overflow-hidden
 * - All child components have overflow protection
 * - Responsive padding and spacing throughout
 * - Text truncation where needed
 * - Flex layouts with min-w-0 and flex-shrink-0
 * 
 * MOBILE OPTIMIZATION:
 * - Touch targets: 44px minimum
 * - Responsive text and icons
 * - Proper spacing and gaps
 * - Horizontal scroll protection
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Home
} from 'lucide-react';
import { 
  FamilyDTO,
  FamilyMemberDTO
} from '@/lib/types/family-invitation';
import { FamilyDetailContentProps } from '@/lib/types/auth';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { taskService } from '@/lib/services/taskService';
import FamilyTaskDashboard from './FamilyTaskDashboard';
import FamilyTaskManagement from './FamilyTaskManagement';
import TaskCreationModal from '../tasks/TaskCreationModal';
import { Task } from '@/lib/types/task';

// Import separated components
import StatisticsCards from './detail/StatisticsCards';
import DetailTabNavigation from './detail/DetailTabNavigation';
import FamilyHeader from './detail/FamilyHeader';
import FamilyLeaderboard from './detail/FamilyLeaderboard';
import FamilyMembersList from './detail/FamilyMembersList';
import FamilyActions from './detail/FamilyActions';


export default function FamilyDetail({
  user,
  familyId,
  initialFamily,
  initialMembers,
  initialError
}: FamilyDetailContentProps) {
  const router = useRouter();
  
  // Check if we need to load data client-side (server-side failed)
  const needsClientLoad = initialFamily?.name === 'Loading...' && !initialError;
  
  // State management with server-provided initial data
  const [isLoading, setIsLoading] = useState(needsClientLoad);
  const [error, setError] = useState<string>(initialError || '');
  const [family, setFamily] = useState<FamilyDTO | null>(needsClientLoad ? null : initialFamily);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>(
    needsClientLoad ? [] : (Array.isArray(initialMembers) ? initialMembers : [])
  );
  
  // ✨ Debug logging for member data structure
  useEffect(() => {
    if (familyMembers.length > 0) {
      console.log('👥 Family Members Debug:', {
        count: familyMembers.length,
        members: familyMembers.map(m => ({
          id: m.id,
          userType: typeof m.user,
          user: m.user,
          roleType: typeof m.role,
          role: m.role
        }))
      });
    }
  }, [familyMembers]);
  const [activeTab, setActiveTab] = useState<'collaboration' | 'tasks' | 'overview'>('collaboration');
  
  // ✨ NEW: Family task statistics and task creation
  const [familyStats, setFamilyStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    totalPoints: 0,
    weeklyProgress: 0,
    memberProgress: [] as Array<{ name: string; tasksCompleted: number; points: number }>
  });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // ✨ NEW: Load family task statistics
  const loadFamilyStats = useCallback(async () => {
    console.log('🚀 loadFamilyStats called with:', {
      familyId: family?.id,
      hasFamilyMembers: familyMembers.length > 0,
      familyMembersCount: familyMembers.length
    });
    
    if (!family?.id) {
      console.log('⚠️ No family ID available for stats loading');
      return;
    }
    
    console.log('📊 Loading family stats for family:', family.id);
    
    try {
      const tasks = await taskService.getFamilyTasks(family.id);
      console.log('📋 Loaded tasks:', tasks?.length || 0, tasks);
      
      // Calculate enhanced stats
      const completedTasks = tasks.filter(task => task.isCompleted).length;
      const totalPoints = tasks.reduce((sum, task) => sum + (task.pointsEarned || 0), 0);
      const weeklyTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return taskDate >= weekAgo;
      });

              // Calculate member progress with proper object handling
        const memberProgress = familyMembers.map(member => {
          const memberTasks = tasks.filter(task => task.assignedToFamilyMemberId === member.id);
          const user = member.user;
          let displayName = 'Unknown Member';
          
          if (typeof user === 'string') {
            displayName = user;
          } else if (user && typeof user === 'object') {
            displayName = user.displayName || user.firstName || user.username || 'Member';
          }
          
          // Handle role object properly - extract name from role object
          let roleName = 'Member';
          if (member.role) {
            if (typeof member.role === 'string') {
              roleName = member.role;
            } else if (typeof member.role === 'object' && member.role.name) {
              roleName = member.role.name;
            }
          }
          
          // Use role name as fallback if no user display name
          if (displayName === 'Unknown Member') {
            displayName = `${roleName} User`;
          }
          
          console.log('👤 Member progress debug:', {
            memberId: member.id,
            displayName,
            roleName,
            rawRole: member.role,
            tasksCount: memberTasks.length
          });
          
          return {
            name: displayName,
            tasksCompleted: memberTasks.filter(task => task.isCompleted).length,
            points: memberTasks.reduce((sum, task) => sum + (task.pointsEarned || 0), 0)
          };
        });

      const finalStats = {
        totalTasks: tasks?.length || 0,
        completedTasks,
        activeTasks: Math.max(0, (tasks?.length || 0) - completedTasks),
        totalPoints,
        weeklyProgress: Math.round((weeklyTasks.filter(t => t.isCompleted).length / Math.max(weeklyTasks.length, 1)) * 100),
        memberProgress
      };
      
      console.log('📊 Calculated stats:', finalStats);
      setFamilyStats(finalStats);
    } catch (error) {
      console.error('❌ Failed to load family stats:', error);
      // Set fallback stats to prevent 0/0 display
      setFamilyStats({
        totalTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        totalPoints: 0,
        weeklyProgress: 0,
        memberProgress: []
      });
    }
  }, [family?.id, familyMembers]);

  // Refresh family data
  const refreshFamilyData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const [familyData, members] = await Promise.all([
        familyInvitationService.getFamilyById(familyId),
        familyInvitationService.getFamilyMembers(familyId)
      ]);

      setFamily(familyData);
      setFamilyMembers(Array.isArray(members) ? members : []);
    } catch (err) {
      console.error('Failed to refresh family data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh family details');
    } finally {
      setIsLoading(false);
    }
  }, [familyId]);

  // Auto-load data if server-side loading failed
  useEffect(() => {
    if (needsClientLoad) {
      console.debug('Server-side loading failed, loading family data client-side');
      refreshFamilyData();
    }
  }, [needsClientLoad, refreshFamilyData]);

  // ✨ NEW: Load family stats when family and members are available
  useEffect(() => {
    console.log('🔍 FamilyDetail useEffect check:', {
      hasFamily: !!family,
      familyId: family?.id,
      familyMembersLength: familyMembers.length,
      familyMembers: familyMembers
    });
    
    if (family) {
      console.log('📊 FamilyDetail: Calling loadFamilyStats for family:', family.id);
      loadFamilyStats();
    } else {
      console.log('⚠️ FamilyDetail: No family data available, skipping loadFamilyStats');
    }
  }, [family, familyMembers, loadFamilyStats]);

  // ✨ NEW: Handle task creation
  const handleTaskCreated = useCallback((newTask?: Task) => {
    console.log('✅ Task created successfully:', newTask);
    // Refresh family stats to include the new task
    loadFamilyStats();
    setIsTaskModalOpen(false);
  }, [loadFamilyStats]);



  // Error state
  if (error && !family) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 space-x-4">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={refreshFamilyData} disabled={isLoading}>
            {isLoading ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && !family) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600">Loading family details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            Family not found or you don&apos;t have access to view this family.
          </AlertDescription>
        </Alert>
        
        <div className="mt-6">
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Family Header */}
      <FamilyHeader
        family={family}
        isLoading={isLoading}
        onCreateTask={() => setIsTaskModalOpen(true)}
        onRefreshData={refreshFamilyData}
      />

      {/* Error alert for refresh errors */}
      {error && family && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <StatisticsCards
        familyStats={familyStats}
        familyName={family.name}
        memberCount={Array.isArray(familyMembers) ? familyMembers.length : 0}
      />

      {/* Tab Navigation */}
      <DetailTabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Family Member Progress Leaderboard */}
          <FamilyLeaderboard memberProgress={familyStats.memberProgress} />

          {/* Family Members List */}
          <FamilyMembersList 
            familyMembers={familyMembers} 
            familyName={family.name} 
          />

          {/* Family Actions */}
          <FamilyActions
            isLoading={isLoading}
            onCreateTask={() => setIsTaskModalOpen(true)}
            onRefreshData={refreshFamilyData}
            onTabChange={setActiveTab}
          />
        </>
      )}

      {/* ✨ Task Collaboration Dashboard Tab - INTEGRATED EXISTING COMPONENT */}
      {activeTab === 'collaboration' && family && user && (
        <FamilyTaskDashboard 
          user={user}
          family={family}
          familyMembers={familyMembers}
        />
      )}

      {/* ✨ Comprehensive Family Tasks Management Tab - INTEGRATED EXISTING COMPONENT */}
      {activeTab === 'tasks' && family && user && (
        <FamilyTaskManagement 
          user={user}
          family={family}
          familyMembers={familyMembers}
        />
      )}

      {/* ✨ NEW: Family Task Creation Modal */}
      {family && user && (
        <TaskCreationModal
          user={user}
          family={family}
          isOpen={isTaskModalOpen}
          onOpenChange={setIsTaskModalOpen}
          onTaskCreated={handleTaskCreated}
          defaultContext="family"
          defaultFamilyId={family.id}
        />
      )}
    </div>
  );
} 