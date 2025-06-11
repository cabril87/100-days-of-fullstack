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
  Crown, 
  Home, 
  Settings,
  ArrowLeft,
  Shield,
  Star,
  CheckCircle,
  Target,
  Trophy,
  BarChart3
} from 'lucide-react';
import { 
  FamilyDTO,
  FamilyMemberDTO
} from '@/lib/types/family-invitation';
import { FamilyDetailContentProps } from '@/lib/types/auth';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import FamilyTaskDashboard from './FamilyTaskDashboard';
import FamilyTaskManagement from './FamilyTaskManagement';

export default function FamilyDetail({
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
  const [activeTab, setActiveTab] = useState<'collaboration' | 'tasks' | 'overview'>('collaboration');

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Array.isArray(familyMembers) ? familyMembers.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Family ID</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{family.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Created</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {family.createdAt ? new Date(family.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</p>
                <p className="text-lg font-bold text-green-600">Active</p>
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
                    <Avatar>
                      <AvatarFallback>
                        {member.user?.firstName?.[0] || member.user?.username?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {member.user?.displayName || member.user?.firstName || member.user?.username || 'Unknown User'}
                        </p>
                        {getRoleIcon(member.role.name)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {member.user?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor(member.role.name)}>
                      {member.role.name}
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

          {/* Family Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Family Actions</CardTitle>
              <CardDescription>
                Manage your family settings and members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => router.push('/settings/family')} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Family Settings
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Task Collaboration Dashboard Tab */}
      {activeTab === 'collaboration' && family && (
        <FamilyTaskDashboard 
          user={{ id: 0 }} // TODO: Get actual user data
          family={family}
        />
      )}

      {/* Comprehensive Family Tasks Management Tab */}
      {activeTab === 'tasks' && family && (
        <FamilyTaskManagement 
          user={{ id: 0 }} // TODO: Get actual user data
          family={family}
          familyMembers={familyMembers || []}
        />
      )}
    </div>
  );
} 