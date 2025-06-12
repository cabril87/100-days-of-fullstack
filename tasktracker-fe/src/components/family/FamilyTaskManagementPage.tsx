'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Home, Target, AlertTriangle } from 'lucide-react';
import { FamilyDTO, FamilyMemberDTO } from '@/lib/types/family-invitation';
import { familyInvitationService } from '@/lib/services/familyInvitationService';
import FamilyTaskManagement from './FamilyTaskManagement';
import { FamilyTaskManagementPageProps } from '@/lib/types/component-props';

export default function FamilyTaskManagementPage({ user, familyId }: FamilyTaskManagementPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [family, setFamily] = useState<FamilyDTO | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberDTO[]>([]);

  // Load family data
  const loadFamilyData = useCallback(async () => {
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
      console.error('Failed to load family data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load family details');
    } finally {
      setIsLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  // Error state
  if (error && !family) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="mt-6 space-x-4">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={loadFamilyData} disabled={isLoading}>
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
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg text-gray-600">Loading family task management...</span>
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
            <div className="p-2 bg-purple-100 rounded-full">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {family.name} - Task Management
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive family task assignment and collaboration
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => router.push(`/family/${familyId}`)} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Family Overview
          </Button>
        </div>
      </div>

      {/* Error alert for refresh errors */}
      {error && family && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ✨ Main Family Task Management Component */}
      <FamilyTaskManagement 
        user={user}
        family={family}
        familyMembers={familyMembers}
      />
    </div>
  );
} 