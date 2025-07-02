'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Avatar components removed - not used in current implementation
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Crown,
  Home, 
  Settings,
  Shield,
  Star,
  UserPlus,  TrendingUp,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react';
import { 
  FamilyWithMembers
} from '@/lib/types/family';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import type { FamiliesContentProps } from '@/lib/props/components/family.props';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function FamiliesContent({ user }: FamiliesContentProps) {
  const router = useRouter();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [families, setFamilies] = useState<FamilyWithMembers[]>([]);

  // Load user's families data
  const loadFamiliesData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');

      // Get all families the user belongs to
      const allFamilies = await familyInvitationService.getAllFamilies();
      
      if (allFamilies && allFamilies.length > 0) {
        // Get detailed information for each family
        const familiesWithDetails = await Promise.all(
          allFamilies.map(async (family) => {
            try {
              // Get family members for this specific family
              const members = await familyInvitationService.getFamilyMembers(family.id);
              
              // Find user's role in this family
              const userMember = members.find(member => member.user?.email === user.email);
              const myRole = userMember?.role?.name || 'Member';

              const familyWithDetails: FamilyWithMembers = {
                ...family,
                members,
                myRole,
                memberCount: members.length
              };

              return familyWithDetails;
            } catch (memberError) {
              console.warn(`Failed to load members for family ${family.id}:`, memberError);
              // Return family with minimal data if member loading fails
              return {
                ...family,
                members: [],
                myRole: 'Member',
                memberCount: 0
              };
            }
          })
        );

        setFamilies(familiesWithDetails);
      } else {
        setFamilies([]);
      }

    } catch (err) {
      console.error('Failed to load families data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load your families');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFamiliesData();
    }
  }, [user, loadFamiliesData]);

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
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'child':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-full bg-gray-200 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 rounded" />
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="mt-6 flex gap-4">
          <Button onClick={loadFamiliesData} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Home className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                My Families
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                Manage your family groups and collaborate with your loved ones
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={loadFamiliesData} 
                    size="sm" 
                    variant="outline"
                    disabled={isLoading}
                    className="h-9 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">🔄 Refresh family data</p>
                  <p className="text-xs text-gray-500">Get the latest information about your families</p>
                </TooltipContent>
              </Tooltip>

              <Button 
                onClick={() => router.push('/family/create')}
                size="sm"
                className="h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Create Family</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ✨ ENHANCED: Family Statistics Overview - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Home className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="text-xl md:text-3xl font-bold">{families.length}</div>
              <div className="text-xs md:text-sm text-blue-100 font-medium">Families</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="text-xl md:text-3xl font-bold">
                {families.reduce((acc, family) => acc + family.memberCount, 0)}
              </div>
              <div className="text-xs md:text-sm text-green-100 font-medium">Total Members</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="text-xl md:text-3xl font-bold">
                {families.filter(family => 
                  family.myRole.toLowerCase() === 'admin' || 
                  family.myRole.toLowerCase() === 'parent'
                ).length}
              </div>
              <div className="text-xs md:text-sm text-purple-100 font-medium">Leadership Roles</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="text-xl md:text-3xl font-bold">
                {families.length > 0 ? Math.round(families.reduce((acc, family) => acc + family.memberCount, 0) / families.length) : 0}
              </div>
              <div className="text-xs md:text-sm text-amber-100 font-medium">Avg. Size</div>
            </CardContent>
          </Card>
        </div>

        {/* Families Grid - Mobile Optimized */}
        {families.length === 0 ? (
          <Card className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 border-0 shadow-lg">
            <CardContent className="px-4 sm:px-6">
              <div className="flex flex-col items-center gap-4">
                <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-400 to-blue-500 rounded-full shadow-lg">
                  <Users className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Families Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-2 text-sm sm:text-base">
                    You&apos;re not currently a member of any families. Create a new family or ask to be invited to an existing one.
                  </p>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-gray-100 to-blue-100 text-gray-700 shadow-sm">
                    👨‍👩‍👧‍👦 0 Families • 0 Members
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
                  <Button 
                    onClick={() => router.push('/settings/family?action=create')} 
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Family
                  </Button>
                  <Button 
                    onClick={() => router.push('/dashboard')} 
                    variant="outline" 
                    className="w-full sm:w-auto border-2 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-200"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {families.map((family) => (
              <Card key={family.id} className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border shadow-md bg-white dark:bg-gray-800 group">
                <CardHeader className="pb-3 px-4 md:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex-shrink-0 shadow-md">
                        <Home className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base md:text-lg group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 truncate font-bold">
                          {family.name}
                        </CardTitle>
                        <CardDescription className="text-sm truncate">
                          {family.description || 'No description'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getRoleBadgeColor(family.myRole)} flex-shrink-0 shadow-sm font-semibold text-xs`}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(family.myRole)}
                        <span className="hidden md:inline">{family.myRole}</span>
                        <span className="md:hidden">{family.myRole.slice(0, 3)}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 px-4 md:px-6">
                  {/* ✨ ENHANCED: Family Stats with Gradient Cards - Mobile Optimized */}
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <div className="text-center p-2 md:p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      <div className="text-lg md:text-xl font-bold">{family.memberCount}</div>
                      <div className="text-xs text-blue-100 font-medium">Members</div>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      <div className="text-lg md:text-xl font-bold">
                        {new Date(family.createdAt).getFullYear()}
                      </div>
                      <div className="text-xs text-green-100 font-medium">Created</div>
                    </div>
                    <div className="text-center p-2 md:p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      <div className="text-lg md:text-xl font-bold">
                        {family.members.filter(m => 
                          m.role?.name.toLowerCase().includes('admin') || 
                          m.role?.name.toLowerCase().includes('parent')
                        ).length}
                      </div>
                      <div className="text-xs text-purple-100 font-medium">Admins</div>
                    </div>
                  </div>

                  {/* Recent Members - Enhanced Mobile Layout */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm md:text-base">
                      <Users className="h-4 w-4 text-blue-600" />
                      Family Members
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {family.members.slice(0, 4).map((member) => (
                        <div key={member.id} className="flex items-center gap-2 min-w-0 bg-white dark:bg-gray-600 rounded-full px-2 py-1 text-xs md:text-sm">
                          <Avatar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600">
                            <AvatarFallback className="text-xs text-white font-bold bg-gradient-to-r from-blue-500 to-purple-600">
                              {member.user?.firstName?.[0] || member.user?.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-gray-700 dark:text-gray-200 truncate font-medium max-w-20 md:max-w-none">
                            {member.user?.firstName || member.user?.username || 'Unknown'}
                          </span>
                        </div>
                      ))}
                      {family.members.length > 4 && (
                        <span className="text-xs text-gray-500 bg-white dark:bg-gray-600 rounded-full px-2 py-1 font-medium">
                          +{family.members.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ✨ ENHANCED: Action Buttons - Mobile Optimized */}
                  <div className="flex flex-col md:flex-row gap-2 pt-2">
                    <Button 
                      onClick={() => router.push(`/family/${family.id}`)}
                      size="sm" 
                      className="flex-1 h-9 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {(family.myRole.toLowerCase() === 'admin' || family.myRole.toLowerCase() === 'parent') && (
                      <Button 
                        onClick={() => router.push('/settings/family')}
                        size="sm" 
                        variant="outline"
                        className="md:w-auto h-9 border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-sm"
                      >
                        <Settings className="h-4 w-4 md:mr-2" />
                        <span className="md:hidden">Settings</span>
                        <span className="hidden md:inline">Settings</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ✨ ENHANCED: Quick Actions with Gradient Styling */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-0 shadow-lg">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-sm">
              Common family management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <Button 
                onClick={() => router.push('/settings/family?action=create')}
                variant="outline" 
                className="h-auto p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  <div>
                    <div className="font-medium text-sm sm:text-base text-green-700">Create Family</div>
                    <div className="text-xs text-green-600">Start a new family</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={() => router.push('/settings/family')}
                variant="outline" 
                className="h-auto p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm sm:text-base text-blue-700">Invite Members</div>
                    <div className="text-xs text-blue-600">Add family members</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={() => router.push('/dashboard')}
                variant="outline" 
                className="h-auto p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm sm:text-base text-purple-700">View Dashboard</div>
                    <div className="text-xs text-purple-600">See family activity</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 

