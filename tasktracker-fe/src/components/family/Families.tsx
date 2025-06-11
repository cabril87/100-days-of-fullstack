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
  Eye
} from 'lucide-react';
import { 
  FamilyWithMembers
} from '@/lib/types/family-invitation';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import { FamiliesContentProps } from '@/lib/types/component-props';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Home className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span>My Families</span>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 w-fit">
              {families.length} {families.length === 1 ? 'Family' : 'Families'}
            </Badge>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">
            View and manage all families you&apos;re a member of
          </p>
        </div>
        
        <Button onClick={() => router.push('/settings/family')} variant="outline" className="w-full sm:w-auto">
          <Settings className="h-4 w-4 mr-2" />
          <span className="sm:hidden">Manage Families</span>
          <span className="hidden sm:inline">Family Settings</span>
        </Button>
      </div>

      {/* Family Stats Overview - Mobile Optimized */}
      {families.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{families.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {families.length === 1 ? 'Family' : 'Families'} Joined
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">
                  {families.reduce((total, family) => total + family.memberCount, 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Total Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {families.filter(f => f.myRole.toLowerCase().includes('admin') || f.myRole.toLowerCase().includes('parent')).length}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Admin/Parent Roles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                  {Math.round(families.reduce((total, family) => total + family.memberCount, 0) / families.length) || 0}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Avg Family Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Families Grid - Mobile Optimized */}
      {families.length === 0 ? (
        <Card className="text-center py-8 sm:py-12">
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 sm:p-4 bg-gray-100 rounded-full">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Families Found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-2 text-sm sm:text-base">
                  You&apos;re not currently a member of any families. Create a new family or ask to be invited to an existing one.
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  👨‍👩‍👧‍👦 0 Families • 0 Members
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
                <Button onClick={() => router.push('/settings/family?action=create')} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Family
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full sm:w-auto">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {families.map((family) => (
            <Card key={family.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                      <Home className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 transition-colors truncate">
                        {family.name}
                      </CardTitle>
                      <CardDescription className="text-sm truncate">
                        {family.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${getRoleBadgeColor(family.myRole)} flex-shrink-0`}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(family.myRole)}
                      <span className="hidden sm:inline">{family.myRole}</span>
                      <span className="sm:hidden">{family.myRole.slice(0, 3)}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 px-4 sm:px-6">
                {/* Family Stats - Mobile Optimized */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-gray-900">{family.memberCount}</div>
                    <div className="text-xs text-gray-600">Members</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      {new Date(family.createdAt).getFullYear()}
                    </div>
                    <div className="text-xs text-gray-600">Created</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-purple-600">
                      {family.members.filter(m => 
                        m.role?.name.toLowerCase().includes('admin') || 
                        m.role?.name.toLowerCase().includes('parent')
                      ).length}
                    </div>
                    <div className="text-xs text-gray-600">Admins</div>
                  </div>
                </div>

                {/* Recent Members - Mobile Optimized */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Users className="h-4 w-4" />
                    Family Members
                  </h4>
                                     <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2">
                     {family.members.slice(0, 4).map((member) => (
                       <div key={member.id} className="flex items-center gap-2 min-w-0">
                         <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                           <AvatarFallback className="text-xs">
                             {member.user?.firstName?.[0] || member.user?.username?.[0] || '?'}
                           </AvatarFallback>
                         </Avatar>
                         <span className="text-xs text-gray-600 truncate">
                           {member.user?.firstName || member.user?.username || 'Unknown'}
                         </span>
                       </div>
                     ))}
                    {family.members.length > 4 && (
                      <span className="text-xs text-gray-500 sm:ml-2">
                        +{family.members.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button 
                    onClick={() => router.push(`/family/${family.id}`)}
                    size="sm" 
                    className="flex-1 h-9 sm:h-8"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    <span className="sm:hidden">View</span>
                    <span className="hidden sm:inline">View Details</span>
                  </Button>
                  {(family.myRole.toLowerCase() === 'admin' || family.myRole.toLowerCase() === 'parent') && (
                    <Button 
                      onClick={() => router.push('/settings/family')}
                      size="sm" 
                      variant="outline"
                      className="sm:w-auto h-9 sm:h-8"
                    >
                      <Settings className="h-4 w-4 sm:mr-0" />
                      <span className="sm:hidden ml-2">Settings</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
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
              className="h-auto p-3 sm:p-4"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                <div>
                  <div className="font-medium text-sm sm:text-base">Create Family</div>
                  <div className="text-xs text-gray-500">Start a new family</div>
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={() => router.push('/settings/family')}
              variant="outline" 
              className="h-auto p-3 sm:p-4"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
                <div>
                  <div className="font-medium text-sm sm:text-base">Invite Members</div>
                  <div className="text-xs text-gray-500">Add family members</div>
                </div>
              </div>
            </Button>
            
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline" 
              className="h-auto p-3 sm:p-4"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                <div>
                  <div className="font-medium text-sm sm:text-base">View Dashboard</div>
                  <div className="text-xs text-gray-500">See family activity</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 