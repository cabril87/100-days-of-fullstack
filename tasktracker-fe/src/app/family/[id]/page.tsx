'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
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
  Target
} from 'lucide-react';
import { 
  FamilyDTO,
  FamilyMemberDTO
} from '@/lib/types/family-invitation';
import { familyInvitationService } from '@/lib/services/familyInvitationService';

export default function FamilyDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const familyId = parseInt(params?.id as string);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [family, setFamily] = useState<FamilyDTO | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);

  // Load family data
  const loadFamilyData = useCallback(async () => {
    if (!familyId || isNaN(familyId)) {
      setError('Invalid family ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Load family details
      const [familyData, members] = await Promise.all([
        familyInvitationService.getFamilyById(familyId),
        familyInvitationService.getFamilyMembers(familyId)
      ]);

      setFamily(familyData);
      setFamilyMembers(members);

    } catch (err) {
      console.error('Failed to load family data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load family details');
    } finally {
      setIsLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadFamilyData();
    }
  }, [isAuthenticated, user, loadFamilyData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
          <div>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg border">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-2" />
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
        
        <div className="mt-6">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
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
        
        <Button onClick={() => router.push('/settings/family')} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Manage Family
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{familyMembers.length}</p>
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
              <Star className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Created</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(family.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Settings className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Actions</p>
                <Button size="sm" variant="outline" onClick={() => router.push('/dashboard')}>
                  Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Members ({familyMembers.length})
          </CardTitle>
          <CardDescription>
            All members of the {family.name} family
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMembers.map((member) => (
              <div key={member.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.user?.displayName || `${member.user?.firstName} ${member.user?.lastName}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{member.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getRoleIcon(member.role?.name || '')}
                  <Badge className={getRoleBadgeColor(member.role?.name || '')}>
                    {member.role?.name || 'Member'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="font-medium">Joined</p>
                    <p>{new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-green-600">{member.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full justify-start"
            >
              <Home className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
            
            <Button 
              onClick={() => router.push('/tasks')}
              variant="outline"
              className="w-full justify-start"
            >
              <Target className="h-4 w-4 mr-2" />
              Manage Tasks
            </Button>
            
            <Button 
              onClick={() => router.push('/settings/family')}
              variant="outline"
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Family Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 