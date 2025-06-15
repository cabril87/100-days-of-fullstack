'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Settings,
  Crown,
  Shield,
  CheckCircle2,
  Home,
  ArrowLeft,
  Target,
  Trophy,
  Plus,
  Zap,
  Award,
  Calendar,
  TrendingUp,
  Clock
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

  // Helper functions
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'parent':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'child':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'parent':
        return 'bg-amber-100 text-amber-800';
      case 'child':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{family.name}</h1>
              <p className="text-gray-600 dark:text-gray-300">
                {family.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* ✨ NEW: Create Family Task Button */}
          <Button 
            onClick={() => setIsTaskModalOpen(true)} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Family Task
          </Button>
          
          <Button onClick={refreshFamilyData} variant="outline" disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={() => router.push('/settings/family')} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Manage Family
          </Button>
        </div>
      </div>

      {/* Error alert for refresh errors */}
      {error && family && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* ✨ ENHANCED: Bold Gradient Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tasks Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{familyStats.totalTasks}</p>
                  <p className="text-blue-100 font-semibold text-sm">Total Tasks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100 text-sm font-medium">
                  {familyStats.activeTasks} active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{familyStats.completedTasks}</p>
                  <p className="text-emerald-100 font-semibold text-sm">Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-200" />
                <span className="text-emerald-100 text-sm font-medium">
                  {familyStats.weeklyProgress}% this week
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Points Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{familyStats.totalPoints.toLocaleString()}</p>
                  <p className="text-amber-100 font-semibold text-sm">Family Points</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-200" />
                <span className="text-amber-100 text-sm font-medium">
                  Team achievement
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Members Card */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white transform hover:scale-105 transition-all duration-300">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{Array.isArray(familyMembers) ? familyMembers.length : 0}</p>
                  <p className="text-purple-100 font-semibold text-sm">Active Members</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-purple-200" />
                <span className="text-purple-100 text-sm font-medium">
                  {family.name} family
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b-2 border-gray-200 dark:border-gray-700">
          {[
            { id: 'collaboration', label: 'Task Collaboration', icon: <Trophy className="h-5 w-5" />, emoji: '📊', description: 'Dashboard & insights' },
            { id: 'tasks', label: 'Family Tasks', icon: <Target className="h-5 w-5" />, emoji: '🎯', description: 'Manage & assign tasks' },
            { id: 'overview', label: 'Family Overview', icon: <Users className="h-5 w-5" />, emoji: '👥', description: 'Members & settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-6 py-5 text-base font-bold transition-all duration-300 border-b-4 relative group transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-700 dark:text-purple-300 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 shadow-lg'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{tab.emoji}</span>
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span className="font-bold">{tab.label}</span>
                </div>
              </div>
              
              {/* Active tab indicator */}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-full shadow-lg"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Tab Content Description */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
            {activeTab === 'collaboration' && '📊 View family productivity dashboard, leaderboards, and insights'}
            {activeTab === 'tasks' && '🎯 Comprehensive task management, assignment, and collaboration tools'}
            {activeTab === 'overview' && '👨‍👩‍👧‍👦 View family member information, roles, and manage settings'}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* ✨ NEW: Family Member Progress Leaderboard */}
          {familyStats.memberProgress.length > 0 && (
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Family Leaderboard
                </CardTitle>
                <CardDescription>
                  See how each family member is contributing to our shared goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {familyStats.memberProgress
                    .sort((a, b) => b.points - a.points)
                    .map((member, index) => (
                    <div key={`${member.name}-${index}`} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                          'bg-gradient-to-r from-blue-400 to-blue-500'
                        }`}>
                          {index === 0 ? '👑' : `#${index + 1}`}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-lg">
                            {member.name || 'Unknown Member'}
                          </p>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {member.tasksCompleted} tasks completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-purple-600 dark:text-purple-400">
                          {member.points.toLocaleString()}
                        </p>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Members ({Array.isArray(familyMembers) ? familyMembers.length : 0})
          </CardTitle>
          <CardDescription>
            All members of the {family.name} family
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!Array.isArray(familyMembers) || familyMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No family members found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                                        <Avatar className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-lg">
                        {String(member.user?.firstName || member.user?.username || member.role?.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {String(member.user?.displayName || member.user?.firstName || member.user?.username || `${member.role?.name || 'Member'} User`)}
                        </p>
                        {getRoleIcon(member.role?.name || 'user')}
                      </div>
                                              <p className="text-sm text-gray-600 dark:text-gray-300">
                          {String(member.user?.email || `Role: ${member.role?.name || 'Member'}`)}
                        </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRoleBadgeColor(member.role?.name || 'member')} font-semibold`}>
                      {member.role?.name || 'Member'}
                    </Badge>
                    {member.joinedAt && (
                      <span className="text-xs text-gray-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

          {/* ✨ ENHANCED: Family Actions with Task Management */}
          <Card>
            <CardHeader>
              <CardTitle>Family Actions</CardTitle>
              <CardDescription>
                Quick actions for family and task management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Management Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    Task Management
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                    <Button onClick={() => setActiveTab('tasks')} variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Manage Tasks
                    </Button>
                    <Button onClick={() => setActiveTab('collaboration')} variant="outline">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Dashboard
                    </Button>
                  </div>
                </div>

                {/* Family Management Actions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Family Management  
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => router.push('/settings/family')} variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Family Settings
                    </Button>
                    <Button onClick={() => router.push('/dashboard')} variant="outline">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                    <Button onClick={refreshFamilyData} variant="outline" disabled={isLoading}>
                      <Clock className="h-4 w-4 mr-2" />
                      {isLoading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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